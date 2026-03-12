<script setup lang="ts">
import { CodeOutlined } from '@ant-design/icons-vue'
import { useSnippetStore } from '@/stores/snippetStore'
import { useFolderStore } from '@/stores/folderStore'

const snippetStore = useSnippetStore()
const folderStore = useFolderStore()

function handleCreate() {
  const folderId = folderStore.selectedType === 'folder' ? folderStore.selectedKey : null
  const snippet = snippetStore.createSnippet({ folderId })
  if (snippet) {
    folderStore.selectNode(snippet.id, 'snippet')
  }
}
</script>

<template>
  <div class="empty-state">
    <div class="empty-state-content">
      <CodeOutlined class="empty-state-icon" />
      <p class="empty-state-text">选择或创建一个代码片段开始</p>
      <a-button type="primary" @click="handleCreate">新建片段</a-button>
    </div>
  </div>
</template>

<style scoped>
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
}

.empty-state-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.empty-state-icon {
  font-size: 64px;
  color: var(--icon-muted);
}

.empty-state-text {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0;
}
</style>
