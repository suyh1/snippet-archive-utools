<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAppStore } from '@/stores/appStore'
import { useWorkspaceDataStore } from '@/stores/workspaceDataStore'

defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const appStore = useAppStore()
const workspaceDataStore = useWorkspaceDataStore()
const query = ref('')

const filteredWorkspaces = computed(() => {
  const normalized = query.value.trim().toLowerCase()
  if (!normalized) return workspaceDataStore.workspaces

  return workspaceDataStore.workspaces.filter((workspace) => (
    workspace.title.toLowerCase().includes(normalized) ||
    workspace.description.toLowerCase().includes(normalized) ||
    workspace.tags.some((tag) => tag.toLowerCase().includes(normalized))
  ))
})

function openWorkspace(workspaceId: string) {
  appStore.openWorkspace(workspaceId)
  emit('update:open', false)
}
</script>

<template>
  <teleport to="body">
    <div v-if="open" class="overlay" @click="emit('update:open', false)">
      <div class="panel glass-panel-strong" @click.stop data-overlay="command-palette">
        <span class="eyebrow">Command Palette</span>
        <input
          v-model="query"
          data-command-input
          type="text"
          placeholder="输入命令、工作区或文件..."
          autofocus
        >

        <div class="results">
          <button
            v-for="workspace in filteredWorkspaces"
            :key="workspace.id"
            type="button"
            class="result-item"
            :data-command-workspace="workspace.id"
            @click="openWorkspace(workspace.id)"
          >
            <strong>{{ workspace.title }}</strong>
            <span>{{ workspace.description }}</span>
          </button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(6, 10, 18, 0.42);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 10vh;
  z-index: 50;
}

.panel {
  width: min(640px, calc(100vw - 32px));
  border-radius: 30px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.eyebrow {
  font-size: 12px;
  color: var(--text-muted);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.panel input {
  width: 100%;
  border: 1px solid var(--glass-border);
  border-radius: 18px;
  background: var(--bg-glass);
  color: var(--text-primary);
  padding: 14px 16px;
  outline: none;
}

.panel input:focus {
  box-shadow: var(--glow-accent);
  border-color: color-mix(in srgb, var(--primary) 45%, transparent);
}

.results {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: min(48vh, 420px);
  overflow: auto;
}

.result-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  border: 1px solid var(--glass-border);
  border-radius: 18px;
  background: color-mix(in srgb, var(--bg-glass) 88%, transparent);
  color: var(--text-primary);
  padding: 14px 16px;
  text-align: left;
  cursor: pointer;
  box-shadow: var(--shadow-soft);
}

.result-item span {
  color: var(--text-secondary);
}

.result-item:hover {
  transform: translateY(-1px);
  border-color: color-mix(in srgb, var(--primary) 40%, transparent);
  background: color-mix(in srgb, var(--bg-glass-strong) 84%, var(--primary) 12%);
}
</style>
