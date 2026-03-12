<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'
import AppTopbar from '@/components/app/AppTopbar.vue'
import AnimatedTransition from '@/components/app/AnimatedTransition.vue'
import CommandPalette from '@/components/app/CommandPalette.vue'
import SettingsSheet from '@/components/app/SettingsSheet.vue'
import { useAppStore } from '@/stores/appStore'

const LibraryLayout = defineAsyncComponent(() => import('@/components/library/LibraryLayout.vue'))
const WorkspaceLayout = defineAsyncComponent(() => import('@/components/workspace/WorkspaceLayout.vue'))

const appStore = useAppStore()

const currentView = computed(() => appStore.currentView)

function openPlaceholderWorkspace(workspaceId: string) {
  appStore.openWorkspace(workspaceId)
}
</script>

<template>
  <div class="app-shell">
    <AppTopbar />
    <CommandPalette :open="appStore.showCommandPalette" @update:open="appStore.toggleCommandPalette" />
    <SettingsSheet :open="appStore.showSettings" @update:open="appStore.toggleSettings" />

    <AnimatedTransition>
      <section
        v-if="currentView === 'library'"
        key="library"
        data-view="library"
        class="view-shell"
      >
        <LibraryLayout @open="openPlaceholderWorkspace" />
      </section>

      <section
        v-else
        key="workspace"
        data-view="workspace"
        class="view-shell"
      >
        <WorkspaceLayout />
      </section>
    </AnimatedTransition>
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.view-shell {
  flex: 1;
  min-height: 420px;
  border-radius: 32px;
  padding: 28px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 18px;
}

</style>
