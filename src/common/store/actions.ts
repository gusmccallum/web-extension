import Browser from '@/common/utils/Browser';
import { ActionContext, Action } from 'vuex';
import { persistedKeys, UNAUTHORIZED_ERROR_MESSAGE } from '@/common/utils/Constants';
import mutations from './mutationTypes';
import { as, sleep } from '../utils/GlobalUtils';
import types from './actionTypes';
import RequestState from '../utils/RequestState';
import { AssertionError } from 'assert';
import mutationTypes from './mutationTypes';
import Utils from '../utils/Utils';
import actionTypes from './actionTypes';

// TODO make everything async

type VuexStateWithAccount = VuexState & { account: Api.Account };

// Helpers /////////////////////////////////////////////////////////////////////

function assertLoggedIn(
  context: ActionContext<VuexState, VuexState>
): asserts context is ActionContext<VuexStateWithAccount, VuexStateWithAccount> {
  if (context.state.account == null) {
    context.commit(mutations.loginRequestState, RequestState.NOT_REQUESTED);
    throw new AssertionError({ message: 'state.account does not exist, log in again' });
  }
}

async function callApi<A extends any[], R>(
  commit: ActionContext<VuexState, VuexState>['commit'],
  apiMethod: (...args: A) => Promise<R>,
  ...args: A
): Promise<R> {
  try {
    return await apiMethod(...args);
  } catch (err) {
    if (err.message == UNAUTHORIZED_ERROR_MESSAGE) {
      commit(mutationTypes.logOut);
    }
    throw err;
  }
}

// Actions /////////////////////////////////////////////////////////////////////

export default as<{ [type in ValueOf<typeof types>]: Action<VuexState, VuexState> }>({
  // General
  async [types.initialLoad](context, callback?: () => void) {
    console.log('actions.initialLoad', { callback });
    const newState = await Browser.storage.getAll<Partial<VuexState>>(persistedKeys);
    context.commit(mutations.restoreState, { changes: newState });
  },
  async [types.showDialog]({ state, commit }, dialogName?: string) {
    console.log('actions.showDialog', { dialogName });
    if (state.activeDialog === dialogName) return;

    if (state.activeDialog) {
      commit(mutations.activeDialog, undefined);
      await sleep(250);
    }
    if (dialogName) {
      commit(mutations.activeDialog, dialogName);
    }
  },
  async [types.startEditing]({ state, commit, dispatch, getters }) {
    global.getVideo().pause();

    if (!getters.isLoggedIn) {
      await dispatch(types.showDialog, 'AccountDialog');
      return;
    }

    if (!getters.isEditing) {
      commit(mutations.toggleEditMode, true);
      commit(mutations.setDraftTimestamps, getters.timestamps);
    }
    if (getters.hasEpisode) {
      commit(mutationTypes.setActiveTimestamp, {
        at: global.getVideo().currentTime,
        typeId: '',
        id: Utils.randomId(),
        source: 'ANIME_SKIP',
      });
      commit(mutationTypes.setEditTimestampMode, 'add');
      await dispatch(types.showDialog, 'EditTimestampPanel');
    } else {
      await dispatch(types.showDialog, 'EditEpisodeDialog');
    }
  },
  async [types.stopEditing]({ state, commit, dispatch }, discardChanges?: boolean) {
    console.log('stopEditing', { discardChanges });
    if (!discardChanges) {
      const oldTimestamps = state.episodeUrl!.episode.timestamps;
      const newTimestamps = state.draftTimestamps;
      dispatch(types.updateTimestamps, {
        oldTimestamps,
        newTimestamps,
        episodeUrl: state.episodeUrl!,
      });
    }
    commit(mutations.toggleEditMode, false);
    commit(mutations.setDraftTimestamps, []);
  },

  // Auth
  async [types.loginManual]({ commit }, { username, password }: LoginManualPayload) {
    console.log('actions.loginManual', { username });
    try {
      commit(mutations.loginRequestState, RequestState.LOADING);
      const loginData = await callApi(commit, global.Api.loginManual, username, password);
      commit(mutations.login, loginData);
      commit(mutations.loginRequestState, RequestState.SUCCESS);
    } catch (err) {
      console.warn('actions.loginManual', err);
      commit(mutations.loginRequestState, RequestState.FAILURE);
    }
  },

  // Preferences
  async [types.updatePreferences](context, pref: keyof Api.Preferences) {
    console.log('actions.updatePreferences', { pref });
    const { commit } = context;
    try {
      assertLoggedIn(context);
      const { state } = context;
      const allPreferences = state.account.preferences;
      const newValue = !allPreferences[pref];
      try {
        const newPreferences = {
          ...allPreferences,
          [pref]: newValue,
        };
        commit(mutations.preferencesRequestState, RequestState.LOADING);
        commit(mutations.togglePref, { pref, value: newValue });
        await callApi(commit, global.Api.updatePreferences, newPreferences);
        commit(mutations.preferencesRequestState, RequestState.SUCCESS);
        commit(mutations.persistPreferences, newPreferences);
      } catch (err) {
        commit(mutations.preferencesRequestState, RequestState.FAILURE);
        setTimeout(() => {
          commit(mutations.togglePref, { pref, value: !newValue });
        }, 200);
        throw err;
      }
    } catch (err) {
      console.warn('actions.updatePreferences', err);
    }
  },

  // Shows
  async [types.searchShows]({ commit }, name: string) {
    console.log('actions.searchShows', { name });
    try {
      commit(mutationTypes.searchShowsRequestState, RequestState.LOADING);
      const results = await callApi(commit, global.Api.searchShows, name);
      commit(mutationTypes.searchShowsRequestState, RequestState.SUCCESS);
      commit(mutationTypes.searchShowsResult, results);
    } catch (err) {
      console.warn('actions.searchShows', err);
      commit(mutationTypes.searchShowsRequestState, RequestState.FAILURE);
    }
  },

  // Episodes
  async [types.createEpisodeData](
    { state, commit, dispatch, getters },
    { show: showData, episode: episodeData, episodeUrl: episodeUrlData }: CreateEpisodeDataPayload
  ) {
    console.log('actions.createEpisodeData', { showData, episodeData, episodeUrlData });
    try {
      // Setup
      dispatch(types.showDialog, undefined);
      commit(mutationTypes.episodeRequestState, RequestState.LOADING);

      // Show
      let showId: string;
      if (showData.create) {
        const result = await await callApi(commit, global.Api.createShow, {
          name: showData.name,
        });
        showId = result.id;
      } else {
        showId = showData.showId;
      }

      // Episode
      let episodeId: string;
      if (episodeData.create) {
        const result = await callApi(commit, global.Api.createEpisode, episodeData.data, showId);
        episodeId = result.id;
      } else {
        episodeId = episodeData.episodeId;
      }

      // EpisodeUrl
      let episodeUrl: Api.EpisodeUrl;
      if (episodeUrlData.create) {
        try {
          await callApi(commit, global.Api.deleteEpisodeUrl, episodeUrlData.data.url);
        } catch (err) {}
        episodeUrl = await callApi(
          commit,
          global.Api.createEpisodeUrl,
          episodeUrlData.data,
          episodeId
        );
      } else {
        episodeUrl = state.episodeUrl!;
      }

      if (getters.timestamps.length > 0) {
        try {
          const oldTimestamps = state.episodeUrl?.episode.timestamps || [];
          const newTimestamps: Api.AmbigousTimestamp[] = getters.timestamps;
          await dispatch(types.updateTimestamps, {
            oldTimestamps,
            newTimestamps,
            episodeUrl,
          });
        } catch (err) {}
      }

      // Update the data
      dispatch(types.fetchEpisodeByUrl, episodeUrl.url);
      commit(mutationTypes.episodeRequestState, RequestState.SUCCESS);
    } catch (err) {
      console.warn('actions.createEpisodeData', err);
      commit(mutationTypes.episodeRequestState, RequestState.FAILURE);
    }
  },
  async [types.searchEpisodes]({ commit }, { name, showId }: { name: string; showId: string }) {
    console.log('actions.searchEpisodes', { name, showId });
    try {
      commit(mutationTypes.searchEpisodesRequestState, RequestState.LOADING);
      const results = await callApi(commit, global.Api.searchEpisodes, name, showId);
      commit(mutationTypes.searchEpisodesResult, results);
      commit(mutationTypes.searchEpisodesRequestState, RequestState.SUCCESS);
    } catch (err) {
      console.warn('actions.searchEpisodes', err);
      commit(mutationTypes.searchEpisodesRequestState, RequestState.FAILURE);
    }
  },
  async [types.loadAllEpisodeData]({ commit, dispatch, state }) {
    commit(mutationTypes.setTimestamps, []);
    commit(mutationTypes.setEpisodeUrl, undefined);
    commit(mutationTypes.setInferredEpisodeInfo, undefined);

    await Promise.all([
      dispatch(types.inferEpisodeInfo),
      dispatch(types.fetchEpisodeByUrl, state.tabUrl),
    ]);

    if (state.episodeUrl == null && state.inferredEpisodeInfo?.name != null) {
      await dispatch(types.fetchThirdPartyEpisode, state.inferredEpisodeInfo.name);
    }
  },
  async [types.fetchEpisodeByUrl]({ commit, dispatch }, url) {
    console.log('actions.fetchEpisodeByUrl', { url });
    try {
      commit(mutationTypes.episodeRequestState, RequestState.LOADING);
      const episodeUrl = await callApi(commit, global.Api.fetchEpisodeByUrl, url);
      commit(mutationTypes.setEpisodeUrl, episodeUrl);
      commit(mutationTypes.episodeRequestState, RequestState.SUCCESS);
    } catch (err) {
      console.warn('actions.fetchEpisodeByUrl', err);
      commit(mutationTypes.setEpisodeUrl, undefined);
    }
  },
  async [types.inferEpisodeInfo]({ commit }) {
    console.log('actions.inferEpisodeInfo');
    try {
      commit(mutationTypes.episodeRequestState, RequestState.LOADING);
      const episodeInfo = await global.inferEpisodeInfo();
      if (episodeInfo == null) throw new Error('Could not infer episode info');
      commit(mutationTypes.episodeRequestState, RequestState.SUCCESS);
      commit(mutationTypes.setInferredEpisodeInfo, episodeInfo);
    } catch (err) {
      console.warn('actions.inferEpisodeInfo', err);
      commit(mutationTypes.episodeRequestState, RequestState.FAILURE);
      commit(mutationTypes.setEpisodeUrl, undefined);
    }
  },
  async [types.fetchThirdPartyEpisode]({ commit }, name: string) {
    console.log('actions.fetchThirdPartyEpisode', { name });
    try {
      commit(mutationTypes.episodeRequestState, RequestState.LOADING);
      const episodes: Api.ThirdPartyEpisode[] = await callApi(
        commit,
        global.Api.fetchEpisodeByName,
        name
      );
      const episodesWithTimestamps = episodes.filter(episode => episode.timestamps.length > 0);
      if (episodesWithTimestamps.length > 0) {
        const episode = episodesWithTimestamps[0];
        const timestamps = episode.timestamps.map<Api.AmbigousTimestamp>(timestamp => ({
          ...timestamp,
          id: timestamp.id ?? Utils.randomId(),
          source: episode.source ?? 'ANIME_SKIP',
        }));
        commit(mutationTypes.setTimestamps, timestamps);
      }
      commit(mutationTypes.episodeRequestState, RequestState.SUCCESS);
    } catch (err) {
      console.warn('actions.fetchEpisodeByUrl', err);
      commit(mutationTypes.setEpisodeUrl, undefined);
    }
  },

  // Timestamps
  async [types.updateTimestamps](
    { commit, dispatch },
    {
      oldTimestamps,
      newTimestamps,
      episodeUrl,
    }: {
      oldTimestamps: Api.Timestamp[];
      newTimestamps: Api.AmbigousTimestamp[];
      episodeUrl: Api.EpisodeUrl;
    }
  ) {
    console.log('updateTimestamps', { oldTimestamps, newTimestamps, episodeUrl });
    const { toCreate, toUpdate, toDelete } = Utils.computeTimestampDiffs(
      oldTimestamps,
      newTimestamps
    );
    commit(mutationTypes.setTimestamps, newTimestamps);

    try {
      for (const toCreateItem of toCreate) {
        await callApi(commit, global.Api.createTimestamp, episodeUrl.episode.id, toCreateItem);
      }
      for (const toUpdateItem of toUpdate) {
        await callApi(commit, global.Api.updateTimestamp, toUpdateItem);
      }
      for (const toDeleteItem of toDelete) {
        await callApi(commit, global.Api.deleteTimestamp, toDeleteItem.id);
      }
    } catch (err) {
      commit(mutationTypes.setTimestamps, oldTimestamps);
    }
    dispatch(types.fetchEpisodeByUrl, episodeUrl.url);
  },
});
