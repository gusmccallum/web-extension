declare type Service = 'example' | 'vrv' | 'funimation' | 'crunchyroll';
declare type ServiceDisplayName =
  | 'Anime Skip Example'
  | 'VRV'
  | 'Funimation'
  | 'Crunchyroll'
  | undefined;

declare interface LoginManualPayload {
  username: string;
  password: string;
  callback?: () => Promise<void> | void;
}

declare interface LoginRefreshPayload {
  refreshToken: string;
}

declare interface PlayerState {
  isActive: boolean;
  isBuffering: boolean;
  isPaused: boolean;
}

declare interface SkippablePreference {
  key: keyof Api.Preferences;
  title: string;
  help: string;
}

declare interface PlaybackRate {
  value: number;
  display: string;
  hideWhenSmall?: boolean;
}

type ValueOf<T> = T[keyof T];
type Implements<T, U extends T> = {};

interface CreateEpisodeDataPayload {
  show:
    | {
        create: false;
        showId: string;
      }
    | {
        create: true;
        name: string;
      };
  episode:
    | {
        create: false;
        episodeId: string;
      }
    | {
        create: true;
        data: Api.InputEpisode;
      };
  episodeUrl:
    | {
        create: false;
        url: string;
      }
    | {
        create: true;
        data: Api.InputEpisodeUrl;
      };
}

type BrowserType =
  | 'chrome'
  | 'firefox'
  | 'safari'
  | 'opera'
  | 'ie'
  | 'edge'
  | 'edgechromium'
  | 'unsupported';

interface AutocompleteItem<T = any> {
  key?: string;
  title: string;
  subtitle?: string;
  data?: T;
}

/**
 * Episode data pulled from the parent webpage
 */
interface InferredEpisodeInfo {
  name?: string;
  number?: string;
  absoluteNumber?: string;
  season?: string;
  show?: string;
}

/**
 * Episode info that is displayed in the top left of the player
 */
interface DisplayEpisodeInfo {
  name: string;
  number?: string;
  absoluteNumber?: string;
  season?: string;
  show: string;
}

interface PlayerOptionGroup {
  title: string;
  icon?: string;
  options: PlayerOption[];
}

interface PlayerOption {
  title: string;
  isSelected: boolean;
  node: HTMLElement;
}

interface CreateEpisodePrefill {
  show: AutocompleteItem<Api.ShowSearchResult>;
  episode: AutocompleteItem<Api.EpisodeSearchResult>;
  season?: string;
  number?: string;
  absoluteNumber?: string;
}

type KeyboardShortcutAction =
  | 'playPause'
  | 'toggleFullscreen'
  | 'volumeUp'
  | 'volumeDown'
  | 'hideDialog'
  | 'nextTimestamp'
  | 'previousTimestamp'
  | 'advanceFrame'
  | 'advanceSmall'
  | 'advanceMedium'
  | 'advanceLarge'
  | 'rewindFrame'
  | 'rewindSmall'
  | 'rewindMedium'
  | 'rewindLarge'
  | 'createTimestamp'
  | 'saveTimestamps'
  | 'discardChanges'
  | 'takeScreenshot';

type KeyboardShortcutsMap = { [keyCombo in KeyboardShortcutAction]?: string };

declare interface TextInputRef {
  focus(selectAll?: boolean): void;
}
