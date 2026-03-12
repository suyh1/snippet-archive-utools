<script setup lang="ts">
import LibraryNav from '@/components/library/LibraryNav.vue'
import WorkspaceGrid from '@/components/library/WorkspaceGrid.vue'
import WorkspacePreviewPanel from '@/components/library/WorkspacePreviewPanel.vue'

const emit = defineEmits<{
  open: [workspaceId: string]
}>()
</script>

<template>
  <section data-view="library" class="library-layout">
    <LibraryNav />
    <WorkspaceGrid @open="emit('open', $event)" />
    <WorkspacePreviewPanel @open="emit('open', $event)" />
  </section>
</template>

<style scoped>
.library-layout {
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr) 320px;
  gap: 20px;
  min-height: 620px;
  align-items: stretch;
}
</style>
