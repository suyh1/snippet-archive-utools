# Snippet Archive - uTools 工作区收藏插件

一个面向 `uTools` 的代码工作区收藏插件，当前正在重构为 **“资料库态 + 工作台态”** 的双态产品：  
- 首页像一个高级的代码收藏馆，用于浏览、搜索、筛选和预览工作区  
- 打开工作区后切换为轻量 IDE，用于多文件编辑、属性管理和导出

## 项目简介

这个项目用于在 `uTools` 中沉淀和管理可复用的代码工作区，适合整理：
- 一组相关联的脚本或配置文件
- 常用开发模板
- 带多个文件的代码片段集合
- 命令、脚本、配置与说明文档组合

重构中的新版本不再只围绕“单条代码片段”展开，而是升级为：
- **Library View**：三栏资料库
- **Workspace View**：轻量 IDE 工作台

## 功能特性

- 三栏资料库首页：导航、内容流、预览面板
- 工作区模型：一个工作区包含多个文件
- 工作台模式：文件树、标签栏、代码编辑器、右侧属性栏
- 命令面板：快速搜索并打开工作区
- 设置面板：主题、字号、Tab、换行、行号
- 工作区导入 / 导出
- 工作区新建 / 删除
- 文件新建 / 关闭 / 删除 / 重命名
- 支持深浅主题和玻璃质感 UI
- 支持常见语言高亮与 `CodeMirror 6` 编辑体验

## 技术栈

### 前端
- `Vue 3`（`<script setup lang="ts">`）
- `TypeScript`
- `Pinia`
- `Reka UI`
- `Motion for Vue`
- `Tailwind CSS v4`

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

- `Mod + N`：新建工作区
- `Mod + F`：聚焦搜索框
- `Mod + K`：打开命令面板
- `Mod + ,`：打开设置面板
- `Mod + S`：保存当前编辑内容
- `Mod + E`：导出当前工作区
- `F2`：重命名当前选中项
- `Delete`：删除当前选中项

## 目录结构

```text
src/
├── main.ts
├── App.vue
├── lib/
│   ├── utils.ts
│   └── workspace-seed.ts
├── types/
│   ├── index.ts
│   └── workspace.ts
├── styles/
│   ├── global.css
│   ├── tailwind.css
│   └── tokens.css
├── utils/
│   ├── clike-langs.ts
│   ├── codemirror.ts
│   ├── db.ts
│   ├── export.ts              # 旧片段导入导出 + 新工作区导入导出
│   ├── order.ts
│   ├── shortcuts.ts
│   └── themes.ts
├── stores/
│   ├── appStore.ts
│   ├── editorStore.ts
│   ├── libraryStore.ts
│   ├── settingsStore.ts
│   ├── workspaceDataStore.ts
│   ├── workspaceStore.ts
│   ├── folderStore.ts        # legacy
│   └── snippetStore.ts       # legacy
└── components/
    ├── app/
    ├── library/
    └── workspace/

public/
├── logo.png
├── plugin.json
└── preload/
    ├── package.json
    └── services.js

tests/
├── setup.ts
├── components/
├── stores/
│   ├── workspaceDataStore.test.ts
│   ├── workspace-file-ops.test.ts
│   ├── folderStore.test.ts    # legacy
│   └── snippetStore.test.ts   # legacy
└── utils/
    ├── export.test.ts
    ├── shortcuts.test.ts
    ├── themes.test.ts
    └── workspace-export.test.ts
```

## 数据模型

### Workspace
- `id`
- `title`
- `description`
- `tags`
- `starred`
- `files`
- `createdAt`
- `updatedAt`
- `lastOpenedAt`

### WorkspaceFile
- `id`
- `workspaceId`
- `title`
- `name`
- `path`
- `language`
- `content`
- `kind`
- `order`

### 存储键
- 工作区：`workspace/{id}`
- 旧文件夹与旧片段模型仍保留在仓库中，作为 `legacy` 参考，不再属于新主路径

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
- 重构主路径优先围绕 `Workspace` 模型，不再往旧 `snippet/folder` 模型上叠新功能
- 旧界面代码放在 `src/legacy/`，仅作参考

## 适用命令词

根据 `public/plugin.json`，插件支持以下唤起命令：
- `代码片段`
- `snippet`
- `代码收藏`

## 后续可优化方向

- 进一步拆分 `CodeMirror` 相关大包
- 为工作台补充拖拽排序、更多上下文菜单与文件夹层级
- 为命令面板补充文件级搜索与动作命令
- 逐步移除旧 `legacy` 代码与测试
