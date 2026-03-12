<script setup lang="ts">
import { computed } from 'vue'
import { summarizeWorkspace } from '@/lib/workspace-metadata'
import type { Workspace } from '@/types/workspace'

const props = defineProps<{
  workspace: Workspace
  selected?: boolean
}>()

const emit = defineEmits<{
  select: [workspaceId: string]
  open: [workspaceId: string]
}>()

const summary = computed(() => summarizeWorkspace(props.workspace))
</script>

<template>
  <article
    class="workspace-card glass-panel"
    :data-selected="selected"
    @click="emit('select', workspace.id)"
  >
    <div class="workspace-card__glow" />
    <div class="workspace-card__meta">
      <span class="workspace-card__eyebrow">{{ summary.fileCount }} 文件 · {{ summary.folderCount }} 文件夹</span>
      <span v-if="workspace.starred" class="workspace-card__star">★</span>
    </div>

    <div class="workspace-card__body">
      <h3>{{ workspace.title }}</h3>
      <p>{{ workspace.description }}</p>
    </div>

    <div class="workspace-card__stats">
      <span v-if="summary.primaryLanguage" class="workspace-card__language">
        {{ summary.primaryLanguage }}
      </span>
      <span class="workspace-card__updated">最近更新</span>
    </div>

    <div class="workspace-card__tags">
      <span v-for="tag in workspace.tags" :key="tag">{{ tag }}</span>
    </div>

    <button type="button" class="workspace-card__action" @click.stop="emit('open', workspace.id)">
      打开工作区
    </button>
  </article>
</template>

<style scoped>
.workspace-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 220px;
  padding: 20px;
  border-radius: 28px;
  cursor: pointer;
  overflow: hidden;
  box-shadow: var(--shadow-soft);
  transition: transform 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease, background 0.22s ease;
}

.workspace-card__glow {
  position: absolute;
  inset: auto auto -44px -10px;
  width: 180px;
  height: 180px;
  border-radius: 999px;
  background: radial-gradient(circle, color-mix(in srgb, var(--primary) 26%, transparent) 0%, transparent 70%);
  pointer-events: none;
  opacity: 0.7;
  filter: blur(12px);
}

.workspace-card:hover,
.workspace-card[data-selected='true'] {
  transform: translateY(-4px) scale(1.01);
  border-color: color-mix(in srgb, var(--primary) 35%, transparent);
  background: color-mix(in srgb, var(--bg-glass-strong) 82%, var(--primary) 8%);
}

.workspace-card[data-selected='true'] {
  box-shadow: var(--glow-accent);
}

.workspace-card__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--text-muted);
  font-size: 12px;
}

.workspace-card__body {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.workspace-card__body h3 {
  font-size: 23px;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

.workspace-card__body p {
  color: var(--text-secondary);
  line-height: 1.55;
}

.workspace-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.workspace-card__stats {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.workspace-card__language,
.workspace-card__updated {
  border-radius: 999px;
  padding: 6px 10px;
  background: color-mix(in srgb, var(--bg-glass) 86%, transparent);
  color: var(--text-secondary);
  font-size: 12px;
}

.workspace-card__tags span {
  border-radius: 999px;
  padding: 6px 10px;
  background: color-mix(in srgb, var(--bg-glass-strong) 88%, transparent);
  color: var(--text-secondary);
  font-size: 12px;
}

.workspace-card__action {
  width: fit-content;
  border: 1px solid var(--glass-border);
  border-radius: 999px;
  background: color-mix(in srgb, var(--bg-glass-strong) 88%, transparent);
  color: var(--text-primary);
  padding: 10px 14px;
  cursor: pointer;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.workspace-card__action:hover {
  transform: translateY(-1px);
  border-color: color-mix(in srgb, var(--primary) 40%, transparent);
}
</style>
