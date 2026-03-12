<script setup lang="ts">
import { useLibraryStore, type LibraryCollection } from '@/stores/libraryStore'

const libraryStore = useLibraryStore()

const collections: Array<{ label: string; value: LibraryCollection }> = [
  { label: '全部工作区', value: 'all' },
  { label: '收藏', value: 'starred' },
  { label: '最近使用', value: 'recent' },
]
</script>

<template>
  <aside data-section="library-nav" class="library-nav glass-panel">
    <div class="nav-header">
      <span class="nav-kicker">Browse</span>
      <h2>资料库</h2>
    </div>

    <div class="nav-groups">
      <button
        v-for="item in collections"
        :key="item.value"
        type="button"
        class="nav-item"
        :data-active="libraryStore.collection === item.value"
        @click="libraryStore.setCollection(item.value)"
      >
        {{ item.label }}
      </button>
    </div>
  </aside>
</template>

<style scoped>
.library-nav {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  border-radius: 28px;
}

.nav-header {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-header h2 {
  font-size: 24px;
  color: var(--text-primary);
}

.nav-kicker {
  color: var(--text-muted);
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.nav-groups {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.nav-item {
  text-align: left;
  border: 1px solid transparent;
  background: transparent;
  color: var(--text-secondary);
  padding: 12px 14px;
  border-radius: 18px;
  cursor: pointer;
  transition: background 0.18s ease, border-color 0.18s ease, color 0.18s ease;
}

.nav-item[data-active='true'] {
  background: color-mix(in srgb, var(--bg-glass-strong) 86%, var(--primary) 12%);
  border-color: color-mix(in srgb, var(--primary) 35%, transparent);
  color: var(--text-primary);
  box-shadow: var(--glow-accent);
}
</style>
