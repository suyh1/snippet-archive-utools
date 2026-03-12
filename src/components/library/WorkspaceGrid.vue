<script setup lang="ts">
import LibraryToolbar from '@/components/library/LibraryToolbar.vue'
import WorkspaceCard from '@/components/library/WorkspaceCard.vue'
import { useLibraryStore } from '@/stores/libraryStore'
import { useWorkspaceDataStore } from '@/stores/workspaceDataStore'

const emit = defineEmits<{
  open: [workspaceId: string]
}>()

const libraryStore = useLibraryStore()
const workspaceDataStore = useWorkspaceDataStore()

function handleCreateWorkspace() {
  const workspace = workspaceDataStore.createWorkspace()
  if (workspace) {
    libraryStore.selectWorkspace(workspace.id)
    emit('open', workspace.id)
  }
}
</script>

<template>
  <section data-section="library-content" class="library-content">
    <LibraryToolbar />

    <div v-if="libraryStore.filteredWorkspaces.length" class="workspace-grid">
      <WorkspaceCard
        v-for="workspace in libraryStore.filteredWorkspaces"
        :key="workspace.id"
        :workspace="workspace"
        :selected="libraryStore.selectedWorkspace?.id === workspace.id"
        @select="libraryStore.selectWorkspace"
        @open="emit('open', $event)"
      />
    </div>

    <div v-else class="library-empty glass-panel-strong">
      <span class="empty-kicker">Workspace Library</span>
      <h3>还没有工作区</h3>
      <p>从一个空工作区开始，或者导入你已有的工作区备份。</p>
      <button type="button" class="empty-action" data-empty-action="create-workspace" @click="handleCreateWorkspace">
        新建第一个工作区
      </button>
    </div>
  </section>
</template>

<style scoped>
.library-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
}

.workspace-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.library-empty {
  min-height: 320px;
  border-radius: 30px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 12px;
  padding: 28px;
}

.empty-kicker {
  font-size: 12px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.library-empty h3 {
  color: var(--text-primary);
  font-size: 28px;
  letter-spacing: -0.02em;
}

.library-empty p {
  color: var(--text-secondary);
  max-width: 360px;
}

.empty-action {
  width: fit-content;
  border: 1px solid var(--glass-border);
  border-radius: 999px;
  background: color-mix(in srgb, var(--primary) 78%, white 12%);
  color: var(--primary-foreground);
  padding: 12px 16px;
  cursor: pointer;
}
</style>
