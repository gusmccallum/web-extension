<template>
  <div class="max-w-screen-md mx-auto space-y-8 py-16 px-16 md:px-0">
    <PopupHeader title="All Settings" />
    <div class="space-y-16">
      <GeneralSettings>
        <RaisedCheckbox
          label="Hide timeline when minimized"
          :checked="hideTimelineWhenMinimized"
          @click="toggleBooleanPreference('hideTimelineWhenMinimized')"
          :disabled="!isLoggedIn"
        />
        <RaisedCheckbox
          label="Allow minimized toolbar when editing"
          :checked="minimizeToolbarWhenEditing"
          @click="toggleBooleanPreference('minimizeToolbarWhenEditing')"
          :disabled="!isLoggedIn"
        />
        <RaisedCheckbox
          label="Snap to the previous 0.5s when inserting a timestamp"
          :checked="createTimestampSnapBack"
          @click="toggleBooleanPreference('createTimestampSnapBack', true)"
          :disabled="!isLoggedIn"
        />
      </GeneralSettings>
      <SkippedSections />
      <KeyboardShortcutTable />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useIsLoggedIn } from '~/common/state/useAuth';
import { useGeneralPreferences, useToggleBooleanPref } from '~/common/state/useGeneralPreferences';
import UsageStats from '~/common/utils/UsageStats';

onMounted(() => {
  void UsageStats.saveEvent('opened_all_settings');
});

const isLoggedIn = useIsLoggedIn();
const preferences = useGeneralPreferences();
const toggleBooleanPreference = useToggleBooleanPref();

const hideTimelineWhenMinimized = computed(() => preferences.value.hideTimelineWhenMinimized);
const minimizeToolbarWhenEditing = computed(() => preferences.value.minimizeToolbarWhenEditing);
const createTimestampSnapBack = computed(() => preferences.value.createTimestampSnapBack);
</script>
