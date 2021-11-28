import { loadedLog } from '~/common/utils/log';
import setupParent from '~/common/utils/setupParent';

export function init9AnimeServiceParent() {
  loadedLog('content-scripts/services/9anime/parent.ts');

  setupParent('9anime', {
    getEpisodeInfo() {
      return {
        name: (document.getElementById('episode') as HTMLSpanElement | undefined)?.innerText,
        number: (document.getElementById('number') as HTMLSpanElement | undefined)?.innerText,
        absoluteNumber: (document.getElementById('absolute-number') as HTMLSpanElement | undefined)
          ?.innerText,
        season: (document.getElementById('season') as HTMLSpanElement | undefined)?.innerText,
        show: (document.getElementById('show') as HTMLSpanElement | undefined)?.innerText,
      };
    },
  });
}
