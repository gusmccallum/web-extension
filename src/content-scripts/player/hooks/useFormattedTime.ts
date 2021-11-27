import { Ref } from 'vue';
import GeneralUtils from '~/common/utils/GeneralUtils';

export default function useFormattedTime(
  currentTimeInS: Ref<number>,
  showDecimals: Ref<boolean>
): Ref<string> {
  return computed(() => GeneralUtils.formatSeconds(currentTimeInS.value, showDecimals.value));
}
