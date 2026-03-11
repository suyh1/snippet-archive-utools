# Snippet Archive - uTools Plugin

## 项目概述
代码片段收藏管理插件，支持无限层级文件夹组织代码片段。

## 技术栈
- **前端**: Vue 3 (Composition API) + TypeScript + Pinia + Ant Design Vue 4
- **编辑器**: CodeMirror 6
- **后端/预加载**: JavaScript (CommonJS)，不改动
- **存储**: utools db API
- **构建**: Vite

## 项目结构
```
src/
├── main.ts                  # 入口
├── App.vue                  # 根组件（布局）
├── types/index.ts           # 类型定义
├── styles/global.css        # 全局样式
├── utils/
│   ├── db.ts               # utools db 封装
│   └── codemirror.ts       # CodeMirror 语言扩展
├── stores/
│   ├── folderStore.ts      # 文件夹状态管理
│   └── snippetStore.ts     # 代码片段状态管理
└── components/
    ├── Sidebar.vue          # 左侧边栏（搜索+树）
    ├── FolderTree.vue       # 文件夹树（无限层级）
    ├── SnippetEditor.vue    # 代码编辑器
    └── EmptyState.vue       # 空状态提示
public/
├── plugin.json              # utools 插件配置
└── preload/
    ├── package.json
    └── services.js          # 预加载服务（保持 JS）
```

## 数据模型
- **Folder**: id, name, parentId, order, createdAt, updatedAt
- **Snippet**: id, title, code, language, description, tags, folderId, order, createdAt, updatedAt
- **存储键**: `folder/{id}`, `snippet/{id}`

## 开发约定
- 使用 Vue 3 `<script setup lang="ts">` 组合式写法
- Pinia store 使用 setup 风格（composition API）
- 组件使用 Ant Design Vue 4 组件库
- 所有前端代码使用 TypeScript
- public/preload 保持 JavaScript 不改动
