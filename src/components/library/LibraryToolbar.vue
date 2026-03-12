<script setup lang="ts">
import { useLibraryStore } from '@/stores/libraryStore'

const libraryStore = useLibraryStore()
</script>

<template>
  <div class="toolbar glass-panel">
    <label class="search">
      <span>搜索工作区</span>
      <input
        v-model="libraryStore.searchQuery"
        data-library-search
        type="text"
        placeholder="搜索标题、描述或标签..."
      >
    </label>

    <div class="meta">
      <span>{{ libraryStore.filteredWorkspaces.length }} 个结果</span>
    </div>
  </div>
</template>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 18px;
  border-radius: 26px;
  box-shadow: var(--shadow-soft);
}

.search {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: var(--text-secondary);
  font-size: 13px;
}

.search input {
  width: 100%;
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  background: var(--bg-glass);
  color: var(--text-primary);
  padding: 12px 14px;
  outline: none;
}

.search input:focus {
  box-shadow: var(--glow-accent);
  border-color: color-mix(in srgb, var(--primary) 42%, transparent);
}

.meta {
  color: var(--text-muted);
  white-space: nowrap;
  font-size: 13px;
}
</style>
