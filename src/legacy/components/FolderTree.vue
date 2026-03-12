<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { Modal, message } from 'ant-design-vue'
import {
  FolderOutlined,
  FolderOpenOutlined,
  FileTextOutlined,
  FolderAddOutlined,
  FileAddOutlined,
  EditOutlined,
  DeleteOutlined,
  CopyOutlined,
  StarFilled,
} from '@ant-design/icons-vue'
import { useFolderStore } from '@/stores/folderStore'
import { useSnippetStore } from '@/stores/snippetStore'
import type { TreeNode } from '@/types'

const props = defineProps<{
  treeData: TreeNode[]
  expandedKeys: string[]
  selectedKeys: string[]
}>()

const emit = defineEmits<{
  'update:expandedKeys': [keys: string[]]
  'update:selectedKeys': [keys: string[]]
  select: [key: string, type: 'folder' | 'snippet']
}>()

const folderStore = useFolderStore()
const snippetStore = useSnippetStore()

const contextMenu = ref({
  visible: false,
  x: 0,
  y: 0,
  node: null as TreeNode | null,
})

const renamingKey = ref<string | null>(null)
const renameValue = ref('')
const renameInputRef = ref<HTMLInputElement | null>(null)

let lastClickedKey: string | null = null
let lastClickedTime = 0

const expandedKeySet = computed(() => new Set(props.expandedKeys))

function onSelect(keys: string[], info: any) {
  emit('update:selectedKeys', keys)
  if (keys.length > 0 && info.node) {
    const node = info.node as TreeNode
    emit('select', keys[0], node.type)
  }
}

function onTitleClick(_event: MouseEvent, nodeData: TreeNode) {
  if (renamingKey.value) return

  const now = Date.now()
  const elapsed = now - lastClickedTime
  const isAlreadySelected = props.selectedKeys.includes(nodeData.key)

  if (
    isAlreadySelected &&
    lastClickedKey === nodeData.key &&
    elapsed > 300 &&
    elapsed < 1500
  ) {
    startRenameFor(nodeData)
    lastClickedKey = null
    lastClickedTime = 0
  } else {
    lastClickedKey = nodeData.key
    lastClickedTime = now
  }
}

function startRenameFor(node: TreeNode) {
  renamingKey.value = node.key
  renameValue.value = node.title
  nextTick(() => {
    renameInputRef.value?.focus()
    renameInputRef.value?.select()
  })
}

function onExpand(keys: string[]) {
  emit('update:expandedKeys', keys)
}

function onRightClick({ event, node }: { event: MouseEvent; node: unknown }) {
  event.preventDefault()
  event.stopPropagation()
  contextMenu.value = {
    visible: true,
    x: event.clientX,
    y: event.clientY,
    node: node as TreeNode,
  }
}

function closeContextMenu() {
  contextMenu.value.visible = false
}

function handleCreateSubFolder() {
  const node = contextMenu.value.node
  if (!node || node.type !== 'folder') return
  closeContextMenu()
  const folder = folderStore.createFolder('新建文件夹', node.key)
  if (folder) {
    folderStore.selectNode(folder.id, 'folder')
  }
  if (!expandedKeySet.value.has(node.key)) {
    emit('update:expandedKeys', [...props.expandedKeys, node.key])
  }
}

function handleCreateSnippet() {
  const node = contextMenu.value.node
  if (!node || node.type !== 'folder') return
  closeContextMenu()
  const snippet = snippetStore.createSnippet({ folderId: node.key })
  if (snippet) {
    folderStore.selectNode(snippet.id, 'snippet')
  }
  if (!expandedKeySet.value.has(node.key)) {
    emit('update:expandedKeys', [...props.expandedKeys, node.key])
  }
}

function startRename() {
  const node = contextMenu.value.node
  if (!node) return
  closeContextMenu()
  startRenameFor(node)
}

function confirmRename() {
  if (!renamingKey.value || !renameValue.value.trim()) {
    cancelRename()
    return
  }

  const key = renamingKey.value
  const newName = renameValue.value.trim()
  const node = findNode(props.treeData, key)
  if (node?.type === 'folder') {
    folderStore.renameFolder(key, newName)
  } else if (node?.type === 'snippet') {
    snippetStore.updateSnippet(key, { title: newName })
  }

  renamingKey.value = null
  renameValue.value = ''
}

function cancelRename() {
  renamingKey.value = null
  renameValue.value = ''
}

function handleDelete() {
  const node = contextMenu.value.node
  if (!node) return
  closeContextMenu()
  const isFolder = node.type === 'folder'
  Modal.confirm({
    title: isFolder ? '删除文件夹' : '删除片段',
    content: isFolder
      ? `确定删除文件夹「${node.title}」及其所有内容吗？`
      : `确定删除片段「${node.title}」吗？`,
    okText: '删除',
    okType: 'danger',
    cancelText: '取消',
    onOk() {
      if (isFolder) {
        folderStore.deleteFolder(node.key)
      } else {
        snippetStore.deleteSnippet(node.key)
      }
    },
  })
}

function handleCopyCode() {
  const node = contextMenu.value.node
  if (!node || node.type !== 'snippet') return
  closeContextMenu()
  const snippet = snippetStore.getSnippet(node.key)
  if (!snippet) return
  const activeFragment = snippet.fragments.find((fragment) => fragment.id === snippet.activeFragmentId) ?? snippet.fragments[0]
  if (window.utools) {
    window.utools.copyText(activeFragment.code)
  } else {
    navigator.clipboard.writeText(activeFragment.code)
  }
  message.success('代码已复制')
}

function handleToggleStar() {
  const node = contextMenu.value.node
  if (!node || node.type !== 'snippet') return
  closeContextMenu()
  snippetStore.toggleStar(node.key)
}

function handleDuplicate() {
  const node = contextMenu.value.node
  if (!node || node.type !== 'snippet') return
  closeContextMenu()
  const duplicated = snippetStore.duplicateSnippet(node.key)
  if (duplicated) {
    folderStore.selectNode(duplicated.id, 'snippet')
    message.success('已复制片段')
  }
}

function getChildren(parentKey: string | null): TreeNode[] {
  if (!parentKey) return props.treeData
  return findNode(props.treeData, parentKey)?.children ?? []
}

function getRelativeDropPosition(info: any): number {
  const pos = String(info.node?.pos ?? '').split('-')
  const rawPosition = Number(pos[pos.length - 1])
  if (Number.isNaN(rawPosition) || typeof info.dropPosition !== 'number') {
    return 0
  }
  return info.dropPosition - rawPosition
}

function resolveDropTarget(info: any) {
  const dragNode = info.dragNode as TreeNode
  const dropNode = info.node as TreeNode

  if (!info.dropToGap && dropNode.type === 'folder') {
    const childNodes = dropNode.children ?? []
    return {
      parentId: dropNode.key,
      insertIndex: childNodes.filter((child) => child.type === dragNode.type).length,
    }
  }

  const parent = findParent(props.treeData, dropNode.key)
  const parentId = parent ? parent.key : null
  const siblingNodes = getChildren(parentId)
  const dropIndex = siblingNodes.findIndex((node) => node.key === dropNode.key)
  const insertionPoint = dropIndex + (getRelativeDropPosition(info) > 0 ? 1 : 0)
  const insertIndex = siblingNodes
    .slice(0, Math.max(0, insertionPoint))
    .filter((node) => node.type === dragNode.type)
    .length

  return { parentId, insertIndex }
}

function onDrop(info: any) {
  const dragNode = info.dragNode as TreeNode
  if (!dragNode || dragNode.key === info.node?.key) return

  const { parentId, insertIndex } = resolveDropTarget(info)
  if (dragNode.type === 'folder') {
    if (parentId && isDescendant(props.treeData, dragNode.key, parentId)) return
    folderStore.moveFolder(dragNode.key, parentId, insertIndex)
  } else {
    snippetStore.moveSnippet(dragNode.key, parentId, insertIndex)
  }
}

defineExpose({ startRenameForSelected })

function startRenameForSelected() {
  if (props.selectedKeys.length === 0) return
  const node = findNode(props.treeData, props.selectedKeys[0])
  if (node) startRenameFor(node)
}

function findNode(nodes: TreeNode[], key: string): TreeNode | null {
  for (const node of nodes) {
    if (node.key === key) return node
    if (node.children) {
      const found = findNode(node.children, key)
      if (found) return found
    }
  }
  return null
}

function findParent(nodes: TreeNode[], key: string, parent: TreeNode | null = null): TreeNode | null {
  for (const node of nodes) {
    if (node.key === key) return parent
    if (node.children) {
      const found = findParent(node.children, key, node)
      if (found !== null) return found
    }
  }
  return null
}

function isDescendant(nodes: TreeNode[], ancestorKey: string, targetKey: string): boolean {
  const ancestor = findNode(nodes, ancestorKey)
  if (!ancestor?.children) return false
  return !!findNode(ancestor.children, targetKey)
}
</script>

<template>
  <div class="folder-tree" @click="closeContextMenu">
    <a-tree
      :tree-data="treeData"
      :expanded-keys="expandedKeys"
      :selected-keys="selectedKeys"
      draggable
      block-node
      @select="onSelect"
      @expand="onExpand"
      @rightClick="onRightClick"
      @drop="onDrop"
    >
      <template #title="nodeData">
        <div v-if="renamingKey === nodeData.key" class="tree-node-rename" @click.stop>
          <a-input
            ref="renameInputRef"
            v-model:value="renameValue"
            size="small"
            @press-enter="confirmRename"
            @blur="confirmRename"
            @keyup.esc="cancelRename"
          />
        </div>
        <div v-else class="tree-node-title" @click="onTitleClick($event, nodeData)">
          <template v-if="nodeData.type === 'folder'">
            <FolderOpenOutlined v-if="expandedKeySet.has(nodeData.key)" class="node-icon folder-icon" />
            <FolderOutlined v-else class="node-icon folder-icon" />
          </template>
          <FileTextOutlined v-else class="node-icon snippet-icon" />
          <span class="node-label">{{ nodeData.title }}</span>
          <StarFilled v-if="nodeData.starred" class="star-icon" />
        </div>
      </template>
    </a-tree>

    <teleport to="body">
      <div
        v-if="contextMenu.visible"
        class="context-menu-overlay"
        @click="closeContextMenu"
        @contextmenu.prevent="closeContextMenu"
      >
        <div
          class="context-menu"
          :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }"
          @click.stop
        >
          <a-menu mode="vertical" class="context-menu-list">
            <template v-if="contextMenu.node?.type === 'folder'">
              <a-menu-item key="new-subfolder" @click="handleCreateSubFolder">
                <FolderAddOutlined /> <span>新建子文件夹</span>
              </a-menu-item>
              <a-menu-item key="new-snippet" @click="handleCreateSnippet">
                <FileAddOutlined /> <span>新建片段</span>
              </a-menu-item>
              <a-menu-divider />
              <a-menu-item key="rename" @click="startRename">
                <EditOutlined /> <span>重命名</span>
              </a-menu-item>
              <a-menu-item key="delete" @click="handleDelete">
                <DeleteOutlined /> <span>删除</span>
              </a-menu-item>
            </template>
            <template v-if="contextMenu.node?.type === 'snippet'">
              <a-menu-item key="copy-code" @click="handleCopyCode">
                <CopyOutlined /> <span>复制代码</span>
              </a-menu-item>
              <a-menu-item key="duplicate" @click="handleDuplicate">
                <CopyOutlined /> <span>复制片段</span>
              </a-menu-item>
              <a-menu-item key="star" @click="handleToggleStar">
                <StarFilled /> <span>收藏/取消收藏</span>
              </a-menu-item>
              <a-menu-divider />
              <a-menu-item key="rename" @click="startRename">
                <EditOutlined /> <span>重命名</span>
              </a-menu-item>
              <a-menu-item key="delete" @click="handleDelete">
                <DeleteOutlined /> <span>删除</span>
              </a-menu-item>
            </template>
          </a-menu>
        </div>
      </div>
    </teleport>
  </div>
</template>

<style scoped>
.folder-tree {
  flex: 1;
  overflow: auto;
  min-height: 0;
}
.folder-tree :deep(.ant-tree) {
  background: transparent;
}
.tree-node-title {
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: default;
}
.tree-node-rename {
  display: flex;
  align-items: center;
}
.tree-node-rename :deep(.ant-input) {
  width: 160px;
}
.node-icon { font-size: 14px; flex-shrink: 0; }
.folder-icon { color: var(--folder-icon-color, var(--star-color)); }
.snippet-icon { color: var(--accent-color); }
.node-label { overflow: hidden; text-overflow: ellipsis; }
.star-icon { color: var(--star-color); font-size: 12px; margin-left: auto; flex-shrink: 0; }
.context-menu-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 1050; }
.context-menu { position: fixed; z-index: 1051; }
.context-menu-list {
  border-radius: 6px;
  box-shadow: 0 3px 12px var(--shadow-color);
  min-width: 160px;
  background: var(--bg-primary);
}
.context-menu-list :deep(.ant-menu-item) {
  display: flex; align-items: center; gap: 8px;
  height: 32px; line-height: 32px;
  margin: 2px 4px; padding: 0 12px; border-radius: 4px;
}
</style>
