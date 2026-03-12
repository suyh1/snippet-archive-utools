<script setup lang="ts">
import { computed } from 'vue'
import { summarizeWorkspace } from '@/lib/workspace-metadata'
import { useLibraryStore } from '@/stores/libraryStore'

const emit = defineEmits<{
  open: [workspaceId: string]
}>()

const libraryStore = useLibraryStore()

const workspace = computed(() => libraryStore.selectedWorkspace)
const summary = computed(() => (workspace.value ? summarizeWorkspace(workspace.value) : null))
</script>

<template>
  <aside data-section="library-preview" class="preview glass-panel-strong">
    <template v-if="workspace">
      <span class="preview-kicker">Preview</span>
      <h2>{{ workspace.title }}</h2>
      <p>{{ workspace.title }} · {{ workspace.description }}</p>

      <div class="preview-meta">
        <div v-if="summary" class="summary-grid">
          <div class="summary-item">
            <span class="label">文件</span>
            <strong>{{ summary.fileCount }}</strong>
          </div>
          <div class="summary-item">
            <span class="label">文件夹</span>
            <strong>{{ summary.folderCount }}</strong>
          </div>
          <div class="summary-item" v-if="summary.primaryLanguage">
            <span class="label">主语言</span>
            <strong>{{ summary.primaryLanguage }}</strong>
          </div>
        </div>

        <div>
          <span class="label">标签</span>
          <div class="tags">
            <span v-for="tag in workspace.tags" :key="tag">{{ tag }}</span>
          </div>
        </div>

        <div>
          <span class="label">文件</span>
          <ul>
            <li v-for="file in workspace.files" :key="file.id">{{ file.name }}</li>
          </ul>
        </div>
      </div>

      <button type="button" class="preview-action" @click="emit('open', workspace.id)">
        进入工作台
      </button>
    </template>
    <template v-else>
      <span class="preview-kicker">Preview</span>
      <h2>空白资料库</h2>
      <p>创建或导入工作区后，这里会显示当前工作区的预览信息与快捷操作。</p>
    </template>
  </aside>
</template>

<style scoped>
.preview {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 22px;
  border-radius: 30px;
  overflow: hidden;
}

.preview-kicker,
.label {
  font-size: 12px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.preview h2 {
  font-size: 30px;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

.preview p,
.preview li {
  color: var(--text-secondary);
}

.preview-meta {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px;
  border-radius: 18px;
  background: color-mix(in srgb, var(--bg-glass) 86%, transparent);
}

.summary-item strong {
  color: var(--text-primary);
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.tags span {
  border-radius: 999px;
  padding: 6px 10px;
  background: color-mix(in srgb, var(--bg-glass) 86%, transparent);
}

.preview ul {
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  list-style: none;
}

.preview-action {
  width: fit-content;
  border: 1px solid var(--glass-border);
  border-radius: 999px;
  background: color-mix(in srgb, var(--primary) 78%, white 12%);
  color: var(--primary-foreground);
  padding: 12px 16px;
  cursor: pointer;
  box-shadow: var(--shadow-soft);
}

.preview-action:hover {
  transform: translateY(-1px);
}

.preview::after {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at top right, color-mix(in srgb, var(--primary) 18%, transparent), transparent 32%),
    linear-gradient(180deg, transparent, rgba(255, 255, 255, 0.02));
  pointer-events: none;
}
</style>
