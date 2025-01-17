import { loadedLog } from '~/common/utils/log';
import setupGlobals from '~/common/utils/setupGlobals';
import './player-overrides.scss';

export function initFunimation20210926Player() {
  loadedLog('content-scripts/services/funimation-2021-09-26/player.ts');

  setupGlobals('funimation-2021-09-26', {
    serviceDisplayName: 'Funimation',
    getRootQuery: () => 'body',
    getVideoQuery: () => '#vjs_video_3_html5_api',
  });
}
