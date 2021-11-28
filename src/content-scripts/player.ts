import { PlayerHosts } from '~/common/utils/compile-time-constants';
import { error, loadedLog } from '~/common/utils/log';
import { remoteConfig } from '~/common/utils/remote-config';
import { urlPatternMatch } from '~/common/utils/strings';
import { initVideoChangeWatcher } from './misc/video-changed-watcher';
import { loadPlayerUi } from './player/index';
import { init9AnimePlayer } from './services/9anime/player';
import { initCrunchyrollPlayer } from './services/crunchyroll/player';
import { initFunimation20210926Player } from './services/funimation-2021-09-26/player';
import { initFunimationPlayer } from './services/funimation/player';
import { initTestServicePlayer } from './services/test-service/player';
import { initVrvPlayer } from './services/vrv/player';

const staticServices: Record<PlayerHosts, () => void> = {
  [PlayerHosts.CRUNCHYROLL]: initCrunchyrollPlayer,
  [PlayerHosts.FUNIMATION_20210926]: initFunimation20210926Player,
  [PlayerHosts.FUNIMATION]: initFunimationPlayer,
  [PlayerHosts.VRV]: initVrvPlayer,
  [PlayerHosts.TEST_SERVICE]: initTestServicePlayer,
};

async function init() {
  await remoteConfig.waitForConfig();
  const dynamicServices: Record<string, () => void> = {
    ...staticServices,
    ...remoteConfig['9animeHostnames'].reduce((map, nineAnimeHost) => {
      map[nineAnimeHost] = init9AnimePlayer;
      return map;
    }, {} as Record<string, () => void>),
  };

  for (const pattern in dynamicServices) {
    if (urlPatternMatch(pattern, window.location)) {
      const initServicePlayer = dynamicServices[pattern];
      initVideoChangeWatcher();
      initServicePlayer();
      loadPlayerUi();
      return;
    }
  }
}

try {
  loadedLog('content-scripts/player.ts');
  init();
} catch (err) {
  error(err);
}
