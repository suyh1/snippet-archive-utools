# Snippet Archive - 项目工作约定

## 项目定位
- 这是一个基于 `uTools` 的**工作区收藏插件**
- 当前主产品形态是：
  - `Library View`：资料库态
  - `Workspace View`：工作台态

## 当前主技术栈
- 前端：`Vue 3` + `TypeScript` + `Pinia` + `Vite`
- UI：`Reka UI` + `Tailwind CSS v4` + `Motion for Vue`
- 编辑器：`CodeMirror 6`
- 存储：`uTools db API`
- 预加载：`public/preload` 下保持 `JavaScript / CommonJS`

## 目录约定
- `src/components/app/`：应用壳层、命令面板、设置面板、全局转场
- `src/components/library/`：资料库态组件
- `src/components/workspace/`：工作台态组件
- `src/stores/workspaceDataStore.ts`：工作区数据读写主入口
- `src/types/workspace.ts`：主数据模型
- `src/legacy/`：旧实现，仅供参考，不继续叠加新功能

## 数据模型约定
- 主模型使用：
  - `Workspace`
  - `WorkspaceFile`
- 旧的 `Snippet / Fragment / Folder` 体系视为 legacy，不再作为新功能基础

## 开发规则
- 新功能优先落在新的主路径中，不往 `src/legacy/` 继续加功能
- Vue 组件统一使用 `<script setup lang="ts">`
- Pinia store 使用 setup 风格
- 保持改动聚焦，优先修复根因，避免表层补丁
- 没有明确要求时，不改 `public/preload/` 下的实现方式

## 提交前检查
- 在声明完成、修复或可交付之前，优先运行：
  - `npm run test`
  - `npm run typecheck`
  - `npm run build`

## 文档规则
- 每次在 `main` 分支提交时，如果本次提交包含**功能更新**，需要同步更新 `README.md`
- 纯 bug 修复、重构、样式调整、测试调整，不强制写入 `README.md`
