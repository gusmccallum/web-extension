import { Store as MyStore } from '@/common/store';

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $store: MyStore;
  }
}

import 'vuex';
declare module 'vuex' {
  export function useStore(): MyStore;
}
