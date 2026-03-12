# Workspace Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 将现有 uTools 代码片段插件重构为“资料库态 + 工作台态”的双态工作区产品，并接入 `shadcn-vue + Reka UI + Tailwind CSS v4 + Motion for Vue`。

**Architecture:** 先建立新的 UI 基座和设计 token，再分别实现资料库态与工作台态的静态骨架，随后接入新的 `Workspace / WorkspaceFile` 数据模型和 Pinia 状态，最后再回接 CodeMirror、uTools DB、快捷键和导入导出。旧页面结构不复用，只保留业务逻辑与交互经验作为参考。

**Tech Stack:** Vue 3、TypeScript、Pinia、Vite、shadcn-vue、Reka UI、Tailwind CSS v4、Motion for Vue、CodeMirror 6、Vitest。

---

### Task 1: 建立新 UI 基座

**Files:**
- Modify: `package.json`
- Modify: `vite.config.ts`
- Modify: `src/main.ts`
- Modify: `src/styles/global.css`
- Create: `src/styles/tokens.css`
- Create: `src/lib/utils.ts`
- Create: `components.json`
- Create: `tailwind.css` or project-appropriate Tailwind entry if needed
- Test: `tests/utils/themes.test.ts`

**Step 1: 写失败测试或验证入口**
- 增加一个最小视觉 token 工具测试，验证主题 token 可应用到文档。
- 运行：`npm run test -- tests/utils/themes.test.ts`
- 预期：失败，因为新 token 或入口尚未建立。

**Step 2: 安装并配置新依赖**
- 接入 `shadcn-vue` 所需基础配置。
- 接入 `Reka UI`。
- 接入 `Tailwind CSS v4`。
- 接入 `Motion for Vue`。

**Step 3: 建立全局设计 token**
- 在 `src/styles/tokens.css` 定义深浅主题、玻璃材质、阴影、边框、文字和强调色变量。
- 让 `src/styles/global.css` 只保留 reset、滚动条和少量全局基线样式。

**Step 4: 建立基础工具与 shadcn-vue 运行环境**
- 增加 `src/lib/utils.ts` 等基础工具。
- 确保 `src/main.ts` 中新样式和插件入口正确挂载。

**Step 5: 运行验证**
- 运行：`npm run test -- tests/utils/themes.test.ts`
- 运行：`npm run typecheck`
- 预期：通过。

### Task 2: 搭建双态 App 壳层

**Files:**
- Modify: `src/App.vue`
- Create: `src/components/app/AppShell.vue`
- Create: `src/components/app/AppTopbar.vue`
- Create: `src/components/app/AnimatedTransition.vue`
- Create: `src/stores/appStore.ts`
- Test: `tests/components/app/AppShell.test.ts`

**Step 1: 写失败测试**
- 为 `AppShell` 写测试：默认显示资料库态，切换状态后显示工作台态。
- 运行：`npm run test -- tests/components/app/AppShell.test.ts`
- 预期：失败，因为新壳层和 `appStore` 尚不存在。

**Step 2: 定义顶层视图状态**
- 在 `src/stores/appStore.ts` 定义 `library` / `workspace` 双态与全局 overlay 状态。

**Step 3: 实现新壳层**
- 用 `AppShell` 替代当前“侧栏 + 编辑器”的单结构布局。
- 在 `src/App.vue` 中只保留应用启动与顶层装配逻辑。

**Step 4: 实现基础转场容器**
- 新增 `AnimatedTransition`，为后续资料库态 → 工作台态过渡提供统一包装。

**Step 5: 运行验证**
- 运行：`npm run test -- tests/components/app/AppShell.test.ts`
- 运行：`npm run typecheck`
- 预期：通过。

### Task 3: 实现资料库态三栏布局

**Files:**
- Create: `src/components/library/LibraryLayout.vue`
- Create: `src/components/library/LibraryNav.vue`
- Create: `src/components/library/LibraryToolbar.vue`
- Create: `src/components/library/WorkspaceGrid.vue`
- Create: `src/components/library/WorkspaceCard.vue`
- Create: `src/components/library/WorkspacePreviewPanel.vue`
- Create: `src/stores/libraryStore.ts`
- Create: `src/types/workspace.ts`
- Create: `tests/components/library/LibraryLayout.test.ts`

**Step 1: 写失败测试**
- 写测试验证：资料库态具备三栏结构，选中工作区后右栏预览更新。
- 运行：`npm run test -- tests/components/library/LibraryLayout.test.ts`
- 预期：失败，因为资料库态组件不存在。

**Step 2: 定义新数据模型类型**
- 在 `src/types/workspace.ts` 中定义 `Workspace` 和 `WorkspaceFile`。

**Step 3: 定义资料库态 store**
- 在 `src/stores/libraryStore.ts` 中定义搜索词、筛选器、排序与当前选中的工作区。

**Step 4: 实现三栏资料库骨架**
- 左栏实现导航与分组入口。
- 中栏实现搜索栏、筛选条、卡片流。
- 右栏实现预览面板与快捷操作占位。

**Step 5: 运行验证**
- 运行：`npm run test -- tests/components/library/LibraryLayout.test.ts`
- 运行：`npm run typecheck`
- 预期：通过。

### Task 4: 实现工作台态骨架

**Files:**
- Create: `src/components/workspace/WorkspaceLayout.vue`
- Create: `src/components/workspace/WorkspaceHeader.vue`
- Create: `src/components/workspace/WorkspaceTree.vue`
- Create: `src/components/workspace/WorkspaceTabs.vue`
- Create: `src/components/workspace/CodeEditorPane.vue`
- Create: `src/components/workspace/InspectorPanel.vue`
- Create: `src/stores/workspaceStore.ts`
- Create: `tests/components/workspace/WorkspaceLayout.test.ts`

**Step 1: 写失败测试**
- 写测试验证：工作台态渲染文件树、标签区和属性面板，并能响应当前文件切换。
- 运行：`npm run test -- tests/components/workspace/WorkspaceLayout.test.ts`
- 预期：失败。

**Step 2: 定义工作台 store**
- 在 `src/stores/workspaceStore.ts` 中定义当前打开工作区、当前文件、标签页和树展开状态。

**Step 3: 实现工作台骨架**
- 左栏是文件树容器。
- 中区是标签页 + 编辑器容器。
- 右栏是属性面板容器。

**Step 4: 接入顶层视图切换**
- 从资料库态点击“打开”切到工作台态。
- 保证右栏从预览面板切换为属性面板。

**Step 5: 运行验证**
- 运行：`npm run test -- tests/components/workspace/WorkspaceLayout.test.ts`
- 运行：`npm run typecheck`
- 预期：通过。

### Task 5: 接入 Reka UI Tree 与多文件标签体系

**Files:**
- Modify: `src/components/workspace/WorkspaceTree.vue`
- Modify: `src/components/workspace/WorkspaceTabs.vue`
- Modify: `src/stores/workspaceStore.ts`
- Create: `tests/components/workspace/WorkspaceTree.test.ts`
- Create: `tests/components/workspace/WorkspaceTabs.test.ts`

**Step 1: 写失败测试**
- 为文件树写测试：点击节点切换当前文件。
- 为标签写测试：打开多个文件时标签同步更新。
- 运行：`npm run test -- tests/components/workspace/WorkspaceTree.test.ts tests/components/workspace/WorkspaceTabs.test.ts`
- 预期：失败。

**Step 2: 用 Reka UI Tree 实现文件树**
- 使用新的 `Workspace / WorkspaceFile` 模型渲染文件层级。
- 先实现选择、展开和当前节点高亮。

**Step 3: 实现标签页同步逻辑**
- `workspaceStore` 维护已打开标签和当前标签。
- 文件树点击与标签切换保持一致。

**Step 4: 预留增强交互接口**
- 为拖拽、右键菜单、重命名保留接口，但这一任务先不做完整增强。

**Step 5: 运行验证**
- 运行：`npm run test -- tests/components/workspace/WorkspaceTree.test.ts tests/components/workspace/WorkspaceTabs.test.ts`
- 运行：`npm run typecheck`
- 预期：通过。

### Task 6: 接回 CodeMirror 与编辑器状态

**Files:**
- Modify: `src/components/workspace/CodeEditorPane.vue`
- Modify: `src/utils/codemirror.ts`
- Create: `src/stores/editorStore.ts`
- Modify: `src/utils/themes.ts`
- Create: `tests/components/workspace/CodeEditorPane.test.ts`

**Step 1: 写失败测试**
- 写测试验证：当前文件变化时编辑器内容同步变化，编辑后保存状态更新。
- 运行：`npm run test -- tests/components/workspace/CodeEditorPane.test.ts`
- 预期：失败。

**Step 2: 定义编辑器 store**
- 在 `src/stores/editorStore.ts` 中定义编辑器偏好、dirty 状态、保存状态。

**Step 3: 将 CodeMirror 接入新工作台**
- `CodeEditorPane` 只服务于当前活动文件。
- 新主题系统与 CodeMirror 主题联动。

**Step 4: 重建保存状态逻辑**
- 统一 dirty 检测、切换文件前保存、手动保存和状态栏展示。

**Step 5: 运行验证**
- 运行：`npm run test -- tests/components/workspace/CodeEditorPane.test.ts`
- 运行：`npm run typecheck`
- 预期：通过。

### Task 7: 接回真实存储与新数据层

**Files:**
- Modify: `src/utils/db.ts`
- Create: `src/stores/workspaceDataStore.ts`
- Modify: `src/components/library/WorkspaceGrid.vue`
- Modify: `src/components/workspace/WorkspaceLayout.vue`
- Modify: `src/types/index.ts` or deprecate in favor of `src/types/workspace.ts`
- Create: `tests/stores/workspaceDataStore.test.ts`

**Step 1: 写失败测试**
- 写 store 测试验证：可加载工作区、保存工作区、保存文件内容。
- 运行：`npm run test -- tests/stores/workspaceDataStore.test.ts`
- 预期：失败。

**Step 2: 设计新存储键方案**
- 为 `Workspace` 和 `WorkspaceFile` 定义新的 uTools DB 键或文档结构。

**Step 3: 接入数据层**
- `workspaceDataStore` 负责加载、保存、删除和更新工作区。
- 资料库态和工作台态都改为消费真实数据。

**Step 4: 去除旧 `snippet / fragment` UI 依赖**
- 保持旧代码仅作为临时参考，不再作为界面主路径的一部分。

**Step 5: 运行验证**
- 运行：`npm run test -- tests/stores/workspaceDataStore.test.ts`
- 运行：`npm run typecheck`
- 预期：通过。

### Task 8: 回接快捷键、设置、导入导出

**Files:**
- Modify: `src/utils/shortcuts.ts`
- Modify: `src/components/app/AppTopbar.vue`
- Modify: `src/components/workspace/InspectorPanel.vue`
- Modify: `src/utils/export.ts`
- Create: `src/components/settings/SettingsSheet.vue`
- Create: `tests/utils/export.test.ts`
- Create: `tests/utils/shortcuts.test.ts`

**Step 1: 写失败测试**
- 写测试验证：快捷键可打开工作区、保存文件、触发导出。
- 如导入导出结构变化，需要更新或重写导入导出测试。
- 运行：`npm run test -- tests/utils/shortcuts.test.ts tests/utils/export.test.ts`
- 预期：失败。

**Step 2: 把快捷键映射到新产品结构**
- 新建工作区
- 新建文件
- 搜索
- 保存
- 导出
- 重命名

**Step 3: 实现新设置面板**
- 用 `shadcn-vue` 的 `Sheet/Drawer` 风格替代旧设置面板。
- 接入编辑器设置和主题切换。

**Step 4: 更新导入导出到新模型**
- 导出为 `Workspace / WorkspaceFile` 结构。
- 导入仅兼容新结构即可，旧测试数据不要求迁移。

**Step 5: 运行验证**
- 运行：`npm run test -- tests/utils/shortcuts.test.ts tests/utils/export.test.ts`
- 运行：`npm run typecheck`
- 预期：通过。

### Task 9: 动画与视觉 polish

**Files:**
- Modify: `src/components/app/AnimatedTransition.vue`
- Modify: `src/components/library/WorkspaceCard.vue`
- Modify: `src/components/library/WorkspacePreviewPanel.vue`
- Modify: `src/components/workspace/WorkspaceTree.vue`
- Modify: `src/components/workspace/InspectorPanel.vue`
- Modify: `src/styles/tokens.css`
- Test: `tests/components/app/AppShell.test.ts`

**Step 1: 定义需要保留的关键动画**
- 只保留对产品体验有帮助的动画：切态、hover、浮层、展开。

**Step 2: 接入 Motion for Vue**
- 为首页卡片、右栏预览和视图切换加轻量动效。

**Step 3: 统一玻璃风细节**
- 检查边框、透明度、阴影、发光和面板层级是否统一。

**Step 4: 回归验证**
- 运行：`npm run test`
- 运行：`npm run typecheck`
- 运行：`npm run build`
- 预期：全部通过。

### Task 10: 清理旧界面与文档收尾

**Files:**
- Delete or archive: old Ant Design Vue-based view components after replacement
- Modify: `README.md`
- Modify: `docs/plans/2026-03-12-workspace-redesign-design.md`
- Modify: `docs/plans/2026-03-12-workspace-redesign.md`

**Step 1: 清理旧界面入口**
- 删除或归档已经完全被替换的旧 UI 组件，避免双路径并存。

**Step 2: 更新 README**
- 在 `main` 分支提交功能更新前，根据新产品形态同步更新 README 的功能说明。

**Step 3: 最终验证**
- 运行：`npm run test`
- 运行：`npm run typecheck`
- 运行：`npm run build`
- 预期：全部通过。

**Step 4: 总结与交付**
- 汇总资料库态、工作台态、数据模型和测试覆盖情况。
