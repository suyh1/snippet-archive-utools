# 工作区收藏馆重构设计

## 背景

现有插件以“侧边栏树 + 编辑器”作为核心结构，更偏传统工具页面。虽然已经修复了主题和一批操作性问题，但如果目标是基于 `shadcn-vue + Reka UI + Tailwind CSS v4 + Motion for Vue` 做一次真正的产品级升级，那么继续在当前页面结构上迭代的收益已经不高。

本次重构明确采用“从新来过”的策略：
- 不考虑旧测试数据迁移。
- 旧代码作为交互和逻辑参考，不作为 UI 结构复用基础。
- 优先建立新的产品信息架构、视觉系统和组件边界，再逐步接回真实存储与编辑能力。

## 目标

- 将产品从“代码片段列表”升级为“代码工作区收藏馆”。
- 首页以资料库形态组织工作区，强调发现、浏览、筛选和预览。
- 打开工作区后切换为轻量 IDE 工作台，强调多文件编辑、结构导航和属性管理。
- 用统一的玻璃质感设计系统覆盖首页与工作台，形成完整、一致的高级视觉语言。
- 以 `Vue 3 + TypeScript + Pinia + Vite` 为基础，接入 `shadcn-vue`、`Reka UI`、`Tailwind CSS v4` 和 `Motion for Vue`。

## 非目标

- 不兼容旧 `snippet / fragment` 数据结构。
- 不在第一阶段保留 Ant Design Vue 的视觉层。
- 不在第一阶段引入复杂路由系统。
- 不在第一阶段实现在线同步、云端备份、团队协作等扩展能力。

## 产品形态

### 双态产品

产品只有两个主态：
- **Library View**：资料库态
- **Workspace View**：工作台态

资料库态负责“发现与管理”，工作台态负责“打开与编辑”。两者不是两个松散页面，而是一套共享视觉系统下的两种使用状态。

### 使用路径

1. 用户进入插件，默认看到资料库态。
2. 用户通过导航、筛选、搜索或卡片流找到目标工作区。
3. 用户选中某个工作区后，在右侧预览其摘要信息。
4. 用户点击打开后，界面平滑切换到工作台态。
5. 用户在工作台中编辑多文件内容、调整属性、导出或复制。
6. 用户返回资料库后，继续浏览或打开其他工作区。

## 信息架构

### 资料库态（三栏）

#### 左栏：导航与分组
- 全部工作区
- 收藏
- 最近使用
- 最近更新
- 按语言分组
- 按标签分组
- 自定义视图（后续可扩展）
- 设置入口

#### 中栏：主内容流
- 顶部全局搜索栏
- 搜索下方筛选条（语言、标签、收藏、更新时间）
- 工作区卡片 / 列表视图切换
- 主体为工作区流，展示：
  - 标题
  - 简介
  - 标签
  - 文件数
  - 语言分布
  - 最后更新时间
  - 收藏状态

#### 右栏：预览面板
- 当前选中工作区的简要信息
- 文件列表预览
- 标签与语言分布
- 最近更新时间
- 快捷操作（打开、收藏、复制主文件、导出、删除）

### 工作台态

#### 左栏：文件树
- 当前工作区文件层级
- 支持文件夹 / 文件节点
- 支持展开收起、右键、拖拽、重命名、删除
- 可高亮主文件或当前文件

#### 中区：编辑主舞台
- 顶部工作区标题与面包屑
- 多标签文件编辑区域
- CodeMirror 编辑器
- 底部状态栏（语言、Tab、保存状态等）

#### 右栏：属性与操作面板
- 工作区信息
- 当前文件信息
- 标签、描述、语言、导出、快捷操作
- 以后可以扩展为“片段说明 / 运行提示 / 相关文件”等区域

## 视觉系统

### 总体风格
- 首页偏高端内容产品风
- 工作台偏专业工具风
- 统一保留 Apple / Raycast 风格的细腻玻璃质感

### 视觉关键词
- 半透明面板
- 背景模糊
- 低对比边框
- 柔和发光高亮
- 轻阴影
- 深色优先但支持浅色主题

### 设计 token
建议建立统一 token：
- 背景：`bg-root`、`bg-panel`、`bg-elevated`、`bg-glass`
- 文字：`text-primary`、`text-secondary`、`text-muted`
- 强调色：`accent`、`accent-soft`
- 边框：`border-subtle`
- 模糊：`glass-blur-sm`、`glass-blur-md`
- 阴影：`shadow-panel`、`shadow-floating`
- 发光：`glow-selection`

### 首页与工作台的密度差异
- 首页留白更多，强调内容展示和浏览感
- 工作台密度更高，强调效率和专注
- 两者通过相同 token 保证一致性，但不追求完全相同的排布节奏

## 技术组合与职责

### `shadcn-vue`
用于高频基础组件和容器：
- Button
- Input
- Dialog
- Drawer / Sheet
- Dropdown Menu
- Tooltip
- Tabs
- Sidebar
- Badge
- Tags Input
- Scroll Area

### `Reka UI`
用于复杂无样式交互：
- Tree
- Menu / Dropdown 的底层可组合能力
- 复杂层级交互

### `Tailwind CSS v4`
用于：
- 设计 token 承载
- 布局与间距系统
- 深浅主题
- 玻璃材质与状态样式

### `Motion for Vue`
用于：
- Library View → Workspace View 状态转场
- 卡片 hover 与选中动画
- 右栏预览切换
- 弹层与菜单出现动画
- 文件树节点展开动画

### `CodeMirror 6`
继续保留为代码编辑器内核，只重做外层容器、工具条和主题接入方式。

## 数据模型

本次重构不再以 `snippet / fragment` 为核心命名，而升级为“工作区”模型：

### `Workspace`
- `id`
- `title`
- `description`
- `tags`
- `starred`
- `files`
- `cover`（可选）
- `createdAt`
- `updatedAt`

### `WorkspaceFile`
- `id`
- `workspaceId`
- `name`
- `path`
- `language`
- `content`
- `kind`（`file` / `folder` / `virtual`）
- `order`

该模型更适合：
- 多文件工作区
- 文件树组织
- 首页预览展示
- 工作台态属性面板

## 状态管理

建议按产品状态拆 `Pinia`：

### `appStore`
- 当前视图模式（library / workspace）
- 全局设置面板、命令面板、主题

### `libraryStore`
- 搜索词
- 筛选器
- 排序方式
- 当前选中的工作区

### `workspaceStore`
- 当前打开的工作区
- 当前选中的文件
- 打开的标签页
- 文件树展开状态
- 右栏显示模式

### `editorStore`
- 编辑器设置
- dirty 状态
- 保存状态

## 组件边界

### 应用壳层
- `AppShell`
- `AppTopbar`
- `CommandPalette`
- `GlobalOverlays`

### 资料库态
- `LibraryLayout`
- `LibraryNav`
- `LibraryToolbar`
- `WorkspaceGrid`
- `WorkspaceCard`
- `WorkspacePreviewPanel`

### 工作台态
- `WorkspaceLayout`
- `WorkspaceHeader`
- `WorkspaceTree`
- `WorkspaceTabs`
- `CodeEditorPane`
- `InspectorPanel`

### 共享视觉组件
- `GlassPanel`
- `GlassButton`
- `SectionHeader`
- `TagList`
- `SearchInput`
- `EmptyBlock`
- `AnimatedTransition`

## 交互原则

- 首页强调浏览效率，但不过度工具化
- 工作台强调专注，但不失去视觉精致感
- 状态切换是“形态过渡”，不是“页面跳转”
- 右栏始终承担信息补充与快捷操作，不与主内容争夺视觉中心
- 文件树是品牌级核心组件之一，需重点打磨 hover、选中、拖拽和菜单状态

## 测试策略

建议从一开始就按新产品结构建立测试：
- store / utils 单测
- 关键组件交互测试
- Library View 与 Workspace View 的状态切换测试

优先覆盖：
- 搜索 / 筛选 / 选中工作区
- 资料库态进入工作台态
- 文件树选择与标签页同步
- 编辑与保存状态切换
- 工作区与文件属性更新

## 风险与控制

### 风险 1：Tree 组件定制复杂
**控制方式**：先做视觉和基础交互，再逐步补齐拖拽、右键菜单等增强能力。

### 风险 2：首页与工作台像两个产品
**控制方式**：统一 token、材质和动画语言，差异只体现在信息密度和布局节奏上。

### 风险 3：视觉高级但交互变慢
**控制方式**：所有动画以短时、低幅度、可打断为原则，不为了炫技牺牲操作效率。

## 实施顺序建议

1. 接入新依赖并建立设计系统底座
2. 完成资料库态静态骨架
3. 完成工作台态静态骨架
4. 接入新数据模型与 Pinia 状态
5. 接入 CodeMirror 与 Tree
6. 接回 uTools DB、导入导出、快捷键
7. 最后做动画与视觉 polish

## 结论

本次重构不是对旧页面的换皮，而是一次产品级重建。最合适的方案是：
- 用 `shadcn-vue + Reka UI + Tailwind CSS v4 + Motion for Vue` 重做 UI 系统
- 用 `Library View / Workspace View` 双态结构重做交互骨架
- 用 `Workspace / WorkspaceFile` 重做内容模型
- 先搭新产品，再接真实数据

这将使项目从“功能型插件”升级为“有完整产品语言的代码工作区收藏工具”。
