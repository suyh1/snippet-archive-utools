# Theme And Bugfix Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 统一插件主题切换行为并修复已确认的操作性问题，覆盖导入导出、拖拽排序、保存时机、删除/选择状态等核心链路。

**Architecture:** 通过 `src/utils/themes.ts` 统一主题明暗判断和文档应用，再让设置 store 与编辑器共享这一套逻辑。数据修复集中在 folder/snippet store 与相关组件之间的边界层，优先修正 order、selection、import/export、editor dirty state 等高频链路，避免扩散改动。

**Tech Stack:** Vue 3、TypeScript、Pinia、Ant Design Vue 4、CodeMirror 6、Vite、uTools DB API。

---

### Task 1: 初始化仓库与确认验证入口

**Files:**
- Modify: `package.json:1`
- Create: `.git/`
- Reference: `docs/plans/2026-03-11-theme-and-bugfix-design.md:1`

**Step 1: 确认可用验证命令**
- 运行 `cat package.json`，确认当前只有 `build`，暂无测试脚本。
- 检查 `node_modules` 中是否已有测试工具可复用；若没有，记录需要以构建验证替代，并在最终说明中明确。

**Step 2: 初始化 Git 仓库**
- 运行 `git init`。
- 确认仓库初始化成功，不创建提交。

**Step 3: 为静态验证补最小脚本**
- 在 `package.json` 增加 `typecheck` 脚本，使用 `vue-tsc --noEmit`。
- 保持现有 `build` 脚本不变。

**Step 4: 运行静态验证命令**
- 运行 `npm run typecheck`。
- 记录当前基线错误，后续修复后再次运行至通过。

### Task 2: 统一主题应用与深浅色变量

**Files:**
- Modify: `src/utils/themes.ts:1`
- Modify: `src/stores/settingsStore.ts:1`
- Modify: `src/App.vue:1`
- Modify: `src/styles/global.css:1`

**Step 1: 先写最小验证目标**
- 以现有代码路径为准，定义主题必须满足的三个条件：
  1. 单一来源判断当前主题是否深色；
  2. 切换编辑器主题时同步切换全局 `data-theme`；
  3. Ant Design 基础控件、浮层、图标、占位文本在深浅色下可读。

**Step 2: 收口主题工具**
- 在 `src/utils/themes.ts` 提供统一的 `isThemeDark` / `applyTheme` 能力。
- 将 `saveTheme` 调整为复用统一应用函数，避免只设置存储或只设置 DOM。

**Step 3: 清理设置 store 的重复逻辑**
- 在 `src/stores/settingsStore.ts` 中复用主题工具，不再维护独立 dark theme 列表。
- 保证 `loadSettings` 与 `updateSettings` 都通过统一入口应用主题。

**Step 4: 补齐全局样式覆盖**
- 在 `src/styles/global.css` 增加 Ant Design 与自定义 UI 的深浅色覆盖，包括：按钮、输入框、选择器、单选按钮、抽屉、弹窗、下拉菜单、菜单项、树节点、placeholder、图标、空状态与选中态。
- 避免写死颜色，优先使用现有 CSS 变量，并补足缺失变量。

**Step 5: 运行类型检查**
- 运行 `npm run typecheck`，确认主题链路改动无类型问题。

### Task 3: 修复导入导出与数据恢复问题

**Files:**
- Modify: `src/utils/export.ts:1`
- Modify: `src/components/SettingsPanel.vue:1`
- Modify: `src/stores/folderStore.ts:1`
- Modify: `src/stores/snippetStore.ts:1`
- Modify: `src/types/index.ts:1`

**Step 1: 定义兼容导入规则**
- 明确导入时必须保留：文件夹层级、片段标题、描述、标签、星标、所有 fragment、语言、activeFragmentId、时间戳、排序字段。
- 若导入 ID 与现有数据冲突，则生成新 ID 并同步修正关联字段。

**Step 2: 修正导出结构**
- 确保导出 JSON 能完整表达当前 folders/snippets 数据，而不是仅导出部分字段。

**Step 3: 修正导入实现**
- 在 `src/components/SettingsPanel.vue` 中改为调用完整导入流程，而不是循环 `createFolder` / `createSnippet` 造成信息丢失。
- 导入完成后刷新 store，并在必要时清理无效选中状态。

**Step 4: 校验数据兼容性**
- 兼容缺失字段的旧数据，提供默认 fragment / 默认时间 / 默认排序。

**Step 5: 运行类型检查**
- 运行 `npm run typecheck`。

### Task 4: 修复树拖拽、排序与删除后的状态一致性

**Files:**
- Modify: `src/components/FolderTree.vue:1`
- Modify: `src/stores/folderStore.ts:1`
- Modify: `src/stores/snippetStore.ts:1`
- Modify: `src/components/Sidebar.vue:1`

**Step 1: 梳理拖拽语义**
- 区分“移动到文件夹中”和“同级插入到前后位置”。
- 明确 folder 与 snippet 分别维护各自父级下的 `order`。

**Step 2: 修正 store 排序工具**
- 为 folder/snippet store 增加或抽取 order 规范化方法，保证创建、复制、移动、删除后同级顺序连续。

**Step 3: 修正组件拖拽行为**
- 在 `src/components/FolderTree.vue` 中基于 drop 信息计算目标父级与插入位置。
- 避免 folder 拖进自身子孙节点。

**Step 4: 修正删除/选中/展开清理**
- 删除当前选中节点或其祖先时，清理 `selectedKey` / `selectedType`。
- 必要时同步移除无效的 `expandedKeys`。

**Step 5: 运行类型检查**
- 运行 `npm run typecheck`。

### Task 5: 修复编辑器保存、切换与复制导出的一致性

**Files:**
- Modify: `src/components/SnippetEditor.vue:1`
- Modify: `src/stores/snippetStore.ts:1`
- Modify: `src/utils/shortcuts.ts:1`

**Step 1: 定义编辑器内容优先级**
- 当前 CodeMirror 文本为最新真值；在切换 fragment、切换 snippet、复制、导出、手动保存、组件卸载时都先落盘或直接读取编辑器内容。

**Step 2: 收口保存逻辑**
- 在 `src/components/SnippetEditor.vue` 中抽取统一的“提交当前编辑内容”函数。
- 清理重复保存路径，避免防抖定时器与 watcher 互相覆盖。

**Step 3: 修正复制/导出行为**
- 复制和导出时优先使用编辑器当前内容，而不是依赖可能滞后的 store 值。

**Step 4: 修正 fragment 切换和重命名细节**
- 切换 fragment 前保存旧 fragment 内容。
- 删除 fragment 后保证 activeFragmentId 始终有效。
- 重命名空值时恢复旧值而不是写入空白。

**Step 5: 运行类型检查**
- 运行 `npm run typecheck`。

### Task 6: 全量构建验证与结果整理

**Files:**
- Modify: `package.json:1`
- Reference: `docs/plans/2026-03-11-theme-and-bugfix-implementation.md:1`

**Step 1: 运行最终类型检查**
- 运行 `npm run typecheck`。
- 预期：无 TypeScript 错误。

**Step 2: 运行最终构建**
- 运行 `npm run build`。
- 预期：Vite 构建成功。

**Step 3: 汇总修复结果**
- 按主题修复、数据修复、树操作修复、编辑器修复、验证结果整理最终说明。
- 若仍发现无法本地自动验证的 UI 细节，明确指出建议手测路径。
