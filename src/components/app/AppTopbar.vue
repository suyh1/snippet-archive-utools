<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '@/stores/appStore'
import { useWorkspaceDataStore } from '@/stores/workspaceDataStore'

const appStore = useAppStore()
const workspaceDataStore = useWorkspaceDataStore()

const subtitle = computed(() => (
  appStore.currentView === 'library'
    ? 'Library View'
    : 'Workspace View'
))

function handleCreateWorkspace() {
  const workspace = workspaceDataStore.createWorkspace()
  if (workspace) {
    appStore.openWorkspace(workspace.id)
  }
}
</script>

<template>
  <header class="topbar glass-panel">
    <div class="brand">
      <span class="eyebrow">Snippet Archive</span>
      <h1>Workspace Redesign</h1>
      <p>{{ subtitle }}</p>
    </div>

    <div class="actions">
      <button
        data-action="new-workspace"
        type="button"
        class="topbar-button"
        @click="handleCreateWorkspace"
      >
        新建工作区
      </button>
      <button
        type="button"
        class="topbar-button"
        @click="appStore.toggleCommandPalette()"
      >
        命令面板
      </button>
      <button
        type="button"
        class="topbar-button"
        :data-active="appStore.currentView === 'library'"
        @click="appStore.goToLibrary()"
      >
        资料库
      </button>
      <button
        type="button"
        class="topbar-button"
        :data-active="appStore.currentView === 'workspace'"
        :disabled="!appStore.hasActiveWorkspace"
        @click="appStore.hasActiveWorkspace && (appStore.currentView = 'workspace')"
      >
        工作台
      </button>
      <button
        type="button"
        class="topbar-button"
        @click="appStore.toggleSettings()"
      >
        设置
      </button>
    </div>
  </header>
</template>

<style scoped>
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 22px;
  border-radius: 28px;
  box-shadow: var(--shadow-soft);
  overflow: hidden;
}

.brand {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.brand h1 {
  font-size: 22px;
  font-weight: 650;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

.brand p,
.eyebrow {
  color: var(--text-secondary);
}

.eyebrow {
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.topbar-button {
  border: 1px solid var(--glass-border);
  background: var(--bg-glass);
  color: var(--text-primary);
  border-radius: 999px;
  padding: 10px 14px;
  cursor: pointer;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.topbar-button:hover:not(:disabled) {
  transform: translateY(-1px) scale(1.01);
  border-color: color-mix(in srgb, var(--primary) 40%, transparent);
  background: color-mix(in srgb, var(--bg-glass-strong) 84%, var(--primary) 10%);
}

.topbar-button[data-active='true'] {
  box-shadow: var(--glow-accent);
  background: color-mix(in srgb, var(--bg-glass-strong) 82%, var(--primary) 12%);
}

.topbar-button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
</style>
