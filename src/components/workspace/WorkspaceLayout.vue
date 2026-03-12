<script setup lang="ts">
import WorkspaceHeader from '@/components/workspace/WorkspaceHeader.vue'
import WorkspaceTree from '@/components/workspace/WorkspaceTree.vue'
import WorkspaceTabs from '@/components/workspace/WorkspaceTabs.vue'
import CodeEditorPane from '@/components/workspace/CodeEditorPane.vue'
import InspectorPanel from '@/components/workspace/InspectorPanel.vue'
</script>

<template>
  <section data-view="workspace" class="workspace-layout">
    <WorkspaceHeader />

    <div class="workspace-layout__body">
      <WorkspaceTree />

      <div class="workspace-layout__center">
        <WorkspaceTabs />
        <CodeEditorPane />
      </div>

      <InspectorPanel />
    </div>
  </section>
</template>

<style scoped>
.workspace-layout {
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-height: 620px;
}

.workspace-layout__body {
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr) 320px;
  gap: 20px;
  align-items: start;
}

.workspace-layout__center {
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-width: 0;
}
</style>
