<template>
  <BasicDialog
    id="TimestampsPanel"
    name="TimestampsPanel"
    gravity-x="flex-end"
    gravity-y="center"
    @show="onShow"
  >
    <div>
      <ResizingPager :page="activePage">
        <template #1>
          <div class="page">
            <TimestampList />
          </div>
        </template>
        <template #2>
          <div class="page">
            <EditTimestamp :initial-tab="initialTab" />
          </div>
        </template>
      </ResizingPager>
    </div>
  </BasicDialog>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import VideoControllerMixin from '@/common/mixins/VideoController';
import KeyboardShortcutsMixin, { KeyboardShortcutMap } from '@/common/mixins/KeyboardShortcuts';
import TimestampList from '../components/TimestampList.vue';
import EditTimestamp from '../components/EditTimestamp.vue';
import BasicDialog from './BasicDialog.vue';
import { MutationTypes } from '@/common/store/mutationTypes';
import { GetterTypes } from '@/common/store/getterTypes';
import { ResizingPager } from 'vue-resizing-pager';

export default defineComponent({
  name: 'TimestampsPanel',
  components: { BasicDialog, TimestampList, EditTimestamp, ResizingPager },
  mixins: [VideoControllerMixin, KeyboardShortcutsMixin],
  data() {
    return {
      initialTab: 'details' as 'edit' | 'details',
    };
  },
  computed: {
    activeTimestamp(): Api.AmbiguousTimestamp | undefined {
      return this.$store.state.activeTimestamp;
    },
    activePage(): number {
      return this.activeTimestamp != null ? 2 : 1;
    },
  },
  methods: {
    onShow(): void {
      this.initialTab = this.activeTimestamp == null ? 'details' : 'edit';
    },
    updateTimestamp(): void {
      (this.$refs.timeSelect as HTMLDivElement | undefined)?.focus();
      if (this.activeTimestamp != null) {
        const newTimestamp = this.$store.getters[GetterTypes.APPLY_TIMESTAMP_DIFF]({
          ...this.activeTimestamp,
          at: this.getCurrentTime(),
        });
        this.$store.commit(MutationTypes.SET_ACTIVE_TIMESTAMP, newTimestamp);
      }
    },
    setupKeyboardShortcuts(): KeyboardShortcutMap {
      return {
        advanceFrame: this.updateTimestamp,
        advanceSmall: this.updateTimestamp,
        advanceMedium: this.updateTimestamp,
        advanceLarge: this.updateTimestamp,

        rewindFrame: this.updateTimestamp,
        rewindSmall: this.updateTimestamp,
        rewindMedium: this.updateTimestamp,
        rewindLarge: this.updateTimestamp,
      };
    },
  },
});
</script>

<style lang="scss">
#TimestampsPanel {
  pointer-events: none;

  .dialog-root-container {
    margin-bottom: 36px;
    pointer-events: auto;
    display: flex;
    flex-direction: column;
    border-top-right-radius: 0px;
    border-bottom-right-radius: 0px;

    @media screen and(max-height: 600px) {
      min-height: unset;
      height: 100%;
      max-height: unset;
      margin-bottom: 60px;
      border-top-left-radius: 0px;
    }
  }
}

.page {
  width: 300px;
  min-height: 500px;
  height: 70%;
  max-height: 800px;
  display: flex;
  flex-direction: column;
  & > * {
    flex: 1;
  }
}
</style>
