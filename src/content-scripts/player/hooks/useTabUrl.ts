import { onScopeDispose } from 'vue';
import browser from 'webextension-polyfill';
import { createSharedComposable } from '~/common/hooks/createSharedComposable';
import { log } from '~/common/utils/log';

interface ChangeUrlMessage {
  type: '@anime-skip/changeUrl';
  payload: string;
}
interface UnknownMessage {
  type?: 'other';
}

export const useTabUrl = createSharedComposable(function () {
  const tabUrl = ref<string>();

  onMounted(async () => {
    const initialUrl = await browser.runtime.sendMessage({ type: '@anime-skip/get-url' });

    const correctedNewUrl = window.transformServiceUrl(initialUrl);
    log('Initial URL: ' + correctedNewUrl);
    tabUrl.value = correctedNewUrl;
  });

  const onReceiveMessage = (message: ChangeUrlMessage | UnknownMessage) => {
    if (message.type != '@anime-skip/changeUrl') return;
    const newUrl = message.payload;

    const correctedNewUrl = window.transformServiceUrl(newUrl);
    log('Change URL: ' + correctedNewUrl);
    tabUrl.value = correctedNewUrl;
  };
  browser.runtime.onMessage.addListener(onReceiveMessage);
  onScopeDispose(() => {
    browser.runtime.onMessage.removeListener(onReceiveMessage);
  });

  return tabUrl;
});
