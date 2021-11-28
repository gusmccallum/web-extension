/**
 * All the host permission url matchers that run the injected parent scripts
 */
export enum ParentHosts {
  ANIME_SKIP = 'https://anime-skip.com/*',
  ANIME_SKIP_WWW = 'https://www.anime-skip.com/*',
  TEST_SERVICE = 'http://localhost/*',
  CRUNCHYROLL = 'https://www.crunchyroll.com/*',
  CRUNCHYROLL_BETA = 'https://beta.crunchyroll.com/*',
  FUNIMATION = 'https://www.funimation.com/*/shows/*',
  FUNIMATION_20210926 = 'https://www.funimation.com/v/*',
  VRV = 'https://vrv.co/*',
}

/**
 * Some hosts are not static. Their exact domains are configured at remote-config.anime-skip.com,
 * but we need generic matchers for the manifest that covers all the possibilities so we can inject
 * the player
 */
export enum DynamicParentHosts {
  NINE_ANIME = 'https://9anime.*/*',
}

/**
 * All the host permission url matchers that run the injected player scripts
 */
export enum PlayerHosts {
  TEST_SERVICE = 'http://localhost/*',
  CRUNCHYROLL = 'https://static.crunchyroll.com/vilos-v2/web/vilos/player.html*',
  FUNIMATION = 'https://www.funimation.com/player/*',
  FUNIMATION_20210926 = 'https://www.funimation.com/v/*',
  VRV = 'https://static.vrv.co/*',
}

/**
 * All the URL matches to show the action for. This is a superset fo the `ParentHosts` since some of
 * those have a path specified and the action should be shown for the entire website
 */
export const PAGE_ACTION_MATCHES = ['https://www.funimation.com/*', ...Object.values(ParentHosts)];
