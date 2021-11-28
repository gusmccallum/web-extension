import { initRemoteConfig } from '@anime-skip/remote-config';
import { warn } from './log';

export interface RemoteConfig {
  '9animeHostnames': string[];
}

export const remoteConfig = initRemoteConfig<RemoteConfig>({
  baseUrl: 'https://remote-config.anime-skip.com',
  app: 'Anime Skip Player',
  warn,
  default: {
    '9animeHostnames': [],
  },
});
