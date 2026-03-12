<script setup lang="ts">
import { TabsList, TabsRoot, TabsTrigger } from 'reka-ui'
import { useWorkspaceStore } from '@/stores/workspaceStore'

const workspaceStore = useWorkspaceStore()
</script>

<template>
  <TabsRoot
    data-section="workspace-tabs"
    class="workspace-tabs"
    :model-value="workspaceStore.currentFile?.id"
    @update:model-value="(fileId) => typeof fileId === 'string' && workspaceStore.selectFile(fileId)"
  >
    <TabsList class="workspace-tabs__list glass-panel">
      <TabsTrigger
        v-for="file in workspaceStore.openFiles"
        :key="file.id"
        :value="file.id"
        class="tab-item"
        :data-tab-id="file.id"
        @click="workspaceStore.selectFile(file.id)"
      >
        <span>{{ file.name }}</span>
        <button
          type="button"
          class="tab-close"
          :data-close-tab="file.id"
          @click.stop="workspaceStore.closeFile(file.id)"
        >
          ×
        </button>
      </TabsTrigger>
    </TabsList>
  </TabsRoot>
</template>

<style scoped>
.workspace-tabs {
  min-width: 0;
}

.workspace-tabs__list {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px;
  border-radius: 22px;
  overflow-x: auto;
}

.tab-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1px solid transparent;
  border-radius: 999px;
  background: transparent;
  color: var(--text-secondary);
  padding: 10px 14px;
  cursor: pointer;
  white-space: nowrap;
}

.tab-item[data-state='active'] {
  color: var(--text-primary);
  background: color-mix(in srgb, var(--bg-glass-strong) 84%, var(--primary) 12%);
  border-color: color-mix(in srgb, var(--primary) 35%, transparent);
}

.tab-close {
  border: none;
  background: transparent;
  color: inherit;
  cursor: pointer;
  font-size: 14px;
  line-height: 1;
}
</style>
