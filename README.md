# Snippet Archive - uTools 代码片段收藏插件

一个面向 `uTools` 的代码片段收藏插件，支持使用无限层级文件夹管理代码片段，并提供多片段标签页编辑、语言识别、主题切换、导入导出等能力。

## 项目简介

这个项目用于在 `uTools` 中快速收藏、整理和编辑代码片段，适合积累常用脚本、配置模板、命令片段和跨语言示例代码。

当前版本重点解决了两类问题：
- 编辑器深色 / 浅色主题切换时，全局界面颜色同步不完整的问题。
- 导入导出、拖拽排序、删除状态、编辑器保存时机等操作性问题。

## 功能特性

- 无限层级文件夹管理代码片段
- 一个片段支持多个代码标签页（Fragment）
- 支持常见编程语言高亮与自动识别
- 支持代码片段搜索、收藏、排序、按语言过滤
- 支持片段复制、复制片段、导出单个片段
- 支持全量数据导入 / 导出
- 支持编辑器主题切换，并同步插件整体明暗模式
- 支持编辑器字号、Tab 大小、自动换行、Minimap、行号设置
- 支持常用快捷键提高编辑效率

## 技术栈

### 前端
- `Vue 3`（`<script setup lang="ts">`）
- `TypeScript`
- `Pinia`
- `Ant Design Vue 4`

### 编辑器
- `CodeMirror 6`
- `thememirror`

### 存储与运行环境
- `uTools db API`
- `public/preload/services.js` 作为预加载层（保持 `CommonJS`）

### 构建与测试
- `Vite`
- `vue-tsc`
- `Vitest`
- `jsdom`

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发环境

```bash
npm run dev
```

项目中的 `public/plugin.json` 已配置：
- 插件入口：`index.html`
- 预加载脚本：`preload/services.js`
- 本地开发地址：`http://localhost:5173`

开发时可将当前项目目录作为本地开发插件导入 `uTools`，并确保 `Vite` 服务已启动。

### 3. 生成构建产物

```bash
npm run build
```

构建结果输出到 `dist/`。

## 常用命令

```bash
npm run dev
npm run test
npm run test:watch
npm run typecheck
npm run build
```

## 快捷键

> `Mac` 下使用 `Command`，Windows / Linux 下使用 `Ctrl`

- `Mod + N`：新建片段
- `Mod + Shift + N`：新建文件夹
- `Mod + F`：聚焦搜索框
- `Mod + D`：复制当前片段
- `Mod + S`：保存当前编辑内容
- `Mod + E`：导出当前片段
- `F2`：重命名当前选中项
- `Delete`：删除当前选中片段

## 目录结构

```text
src/
├── main.ts
├── App.vue
├── types/
│   └── index.ts
├── styles/
│   └── global.css
├── utils/
│   ├── clike-langs.ts
│   ├── codemirror.ts
│   ├── db.ts
│   ├── export.ts
│   ├── order.ts
│   ├── shortcuts.ts
│   └── themes.ts
├── stores/
│   ├── folderStore.ts
│   ├── settingsStore.ts
│   └── snippetStore.ts
└── components/
    ├── EmptyState.vue
    ├── FolderTree.vue
    ├── SettingsPanel.vue
    ├── Sidebar.vue
    └── SnippetEditor.vue

public/
├── logo.png
├── plugin.json
└── preload/
    ├── package.json
    └── services.js

tests/
├── setup.ts
├── stores/
│   ├── folderStore.test.ts
│   └── snippetStore.test.ts
└── utils/
    ├── export.test.ts
    └── themes.test.ts
```

## 数据模型

### Folder
- `id`
- `name`
- `parentId`
- `order`
- `createdAt`
- `updatedAt`

### Snippet
- `id`
- `title`
- `fragments`
- `activeFragmentId`
- `description`
- `tags`
- `folderId`
- `starred`
- `order`
- `createdAt`
- `updatedAt`

### Fragment
- `id`
- `title`
- `code`
- `language`

### 存储键
- 文件夹：`folder/{id}`
- 片段：`snippet/{id}`

## 已补强的关键行为

本仓库当前已经补齐或修复以下关键操作链路：

- 主题切换时插件整体颜色与编辑器主题同步
- 导入时保留文件夹层级、片段内容、语言与活动标签页
- 拖拽移动时正确维护同级顺序
- 删除文件夹时清理关联片段与无效选中状态
- 切换片段、手动保存、插件退出时保证编辑器内容落盘
- 复制 / 导出时优先使用编辑器当前内容，而不是旧缓存

## 验证方式

当前项目可通过以下命令验证：

```bash
npm run test
npm run typecheck
npm run build
```

## 开发约定

- 前端代码统一使用 `TypeScript`
- Vue 组件使用 `<script setup lang="ts">`
- `Pinia` store 使用 setup 风格
- `public/preload` 目录保持 `JavaScript`，不改成 `TypeScript`
- 优先修复根因，避免仅做表层补丁

## 适用命令词

根据 `public/plugin.json`，插件支持以下唤起命令：
- `代码片段`
- `snippet`
- `代码收藏`

## 后续可优化方向

- 进一步拆分大体积构建 chunk
- 增加组件级交互测试
- 支持更多导出格式
- 支持片段批量操作

