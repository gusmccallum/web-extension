import { loadedLog } from '~/common/utils/log';
import setupGlobals from '~/common/utils/setupGlobals';
import './player-overrides.scss';

export function init9AnimePlayer() {
  loadedLog('content-scripts/services/9anime/player.ts');

  setupGlobals('9anime', {
    serviceDisplayName: '9Anime',
    getRootQuery: () => '.video-container',
    getVideoQuery: () => '#video',
  });
}
