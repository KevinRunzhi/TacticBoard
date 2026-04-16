# Android 技术架构

## 1. 文档目标

这份文档定义 TacticBoard 在 Android 打包阶段的专项技术架构。

目标：

- 把 Android 打包相关模块边界讲清楚
- 明确 Android 运行时与当前 Web / Windows 运行时的关系
- 固定 Android 第一阶段应复用什么、隔离什么、暂缓什么
- 让后续实现尽量少靠临时判断和平台特判堆砌

这份文档服务于：

- `docs/05-engineering/android-packaging-plan.md`

## 2. 适用范围

当前文档覆盖：

- `tactics-canvas-24/` 前端工程的 Android 运行架构
- Android 壳层与平台桥之间的职责边界
- 导出、导入、存储、分享、生命周期相关的技术边界
- Android 第一阶段正式开发前必须确认的架构约束

当前不覆盖：

- Android 应用商店上架流程
- Android 签名与发布运营流程
- Android 专项验收标准
- Android 平台内部接口的函数级冻结规范
- 长期云同步或账号体系

## 3. 当前基线与架构结论

### 3.1 当前基线

当前顶层基线文档已经明确：

- 产品是 `Windows + Android` 首发的跨端本地应用
- Windows 与 Android 共用同一套页面概念
- Android 首版优先保证触控场景下的新建、编辑、保存、导出闭环

当前工程现实是：

- Windows 第一阶段已经完成桌面壳接入
- `tactics-canvas-24/src/` 仍然是唯一业务源码
- 已经存在围绕平台差异抽出来的桥接层：
  - `src/lib/platform.ts`
  - `src/lib/file-access.ts`
  - `src/lib/export-save.ts`
  - `src/lib/asset-import.ts`

### 3.2 架构结论

Android 第一阶段技术架构应采用：

- `React + Vite` 继续承担 UI 与业务逻辑层
- Android 只新增移动端壳层与平台适配层
- 当前平台桥继续作为 Android 扩展入口

Android 第一阶段不采用：

- 复制一份 Android 专用前端项目
- 为 Android 单独重写页面树和业务状态层
- 在没有验证的情况下把现有业务逻辑迁移到原生侧

一句话结论：

- `Android 是现有战术板应用的新增运行平台，不是独立重做的一套产品前端。`

## 4. 运行环境与平台定位

当前需要明确区分三种主要运行环境：

### 4.1 Web 开发环境

- 运行方式：`npm run dev`
- 入口：浏览器
- 路由策略：浏览器环境策略
- 文件能力：浏览器文件输入与浏览器下载

### 4.2 Windows 桌面环境

- 运行方式：当前已通过桌面壳接入
- 入口：桌面容器 + 前端页面
- 文件能力：原生保存、原生文件选择

### 4.3 Android 移动环境

- 运行方式：移动端容器承载同一套前端业务代码
- 入口：移动端壳层 + 前端页面
- 文件能力：系统文件选择器、应用本地存储、系统分享
- 交互能力：触控优先、抽屉优先、画布优先

Android 技术架构的重点不是把第三种环境做成第二套系统，而是让它成为现有业务层的新增运行上下文。

## 5. 分层结构

```text
Android Shell Layer
    ↓
Platform Bridge Layer
    ↓
Application Layer
    ↓
Feature / State Layer
    ↓
UI Layer
```

## 6. 模块划分

### 6.1 Android Shell Layer

职责：

- 承载 Android 运行容器
- 提供生命周期入口
- 提供文件选择、分享、存储等原生能力入口

要求：

- 壳层不进入 `tactics-canvas-24/src/` 业务目录
- 壳层不直接重写编辑器业务逻辑
- 壳层不复制页面实现

### 6.2 Platform Bridge Layer

职责：

- 统一 Web / Windows / Android 的平台能力差异
- 屏蔽原生文件路径、分享入口、授权语义和平台识别细节

Android 第一阶段优先围绕这些文件扩展：

- `src/lib/platform.ts`
- `src/lib/file-access.ts`
- `src/lib/export-save.ts`
- `src/lib/asset-import.ts`

### 6.3 Application Layer

职责：

- 组织页面、路由入口和整体运行容器
- 统一挂接平台运行策略

主要文件：

- `src/main.tsx`
- `src/App.tsx`

### 6.4 Feature / State Layer

职责：

- 承载编辑器业务状态
- 承载项目保存与恢复逻辑
- 承载导出生成逻辑

主要文件：

- `src/hooks/useEditorState.ts`
- `src/data/mockProjects.ts`
- `src/lib/tactics-export.ts`

Android 第一阶段不应以打包为理由重写这一层。

### 6.5 UI Layer

职责：

- 展示页面
- 接收触控与页面级操作
- 调用应用层与平台桥提供的能力

主要目录：

- `src/pages/`
- `src/components/tactics/`
- `src/components/ui/`

## 7. 依赖方向

依赖必须保持单向：

```text
pages / components
    ↓
editor / export / project actions
    ↓
platform bridge
    ↓
browser capabilities / windows capabilities / android capabilities
```

明确禁止：

- UI 组件直接处理 Android 原生返回值
- 页面直接消费路径字符串、权限结果或分享意图对象
- 平台层反向依赖编辑器组件
- 为 Android 在组件层新增第二套并行平台判断逻辑

## 8. 路由与壳层架构

### 8.1 当前共识

- Windows 与 Android 共用同一套页面概念
- Android 不应额外创造一棵独立的信息架构树

### 8.2 Android 第一阶段要求

- Router 选择逻辑必须继续集中在统一入口
- Android 端不允许在页面组件里散落路由容器特判
- Android 端编辑器入口仍然围绕当前工作台 / 项目页 / 编辑器页 / 设置页体系展开

### 8.3 结果

- 交互层可以按触控特征分化
- 但页面概念、主路径和核心页面职责保持一致

## 9. 导出 / 保存 / 分享架构

### 9.1 当前现实

- `src/lib/tactics-export.ts` 负责 PNG / GIF 生成
- Windows 已经把“生成二进制”和“最终保存方式”拆开
- Android 顶层文档已明确：首版优先保证 PNG 导出与系统分享

### 9.2 Android 第一阶段目标

- 保留现有导出生成逻辑
- 平台差异集中在最终落地与分享阶段
- 不在第一阶段把导出逻辑迁移到原生侧

### 9.3 模块责任分离

```text
tactics-export.ts
    负责生成 PNG / GIF 二进制

export-save.ts
    负责决定交给平台保存还是分享

file-access.ts
    负责真正处理平台文件能力
```

### 9.4 Android 第一阶段结论

- Android 优先保证 PNG 导出闭环
- Android 导出结果应优先兼容系统分享语义
- Android 第一阶段不把 GIF 导出写成默认承诺

## 10. 素材导入架构

### 10.1 当前共识

- 导入球员头像和参考底图时，素材必须复制到应用本地存储
- 不长期依赖外部文件路径或临时授权引用
- Android 必须优先使用系统文件选择器完成最小化授权

### 10.2 目标结构

```text
UI / RightPanel / Drawer
    ↓
asset-import.ts
    ↓
file-access.ts
    ↓
Android system picker / local copy
    ↓
front-end consumable asset structure
```

### 10.3 结果

- 组件层不直接处理 Android 路径或授权细节
- 导入成功后，编辑器继续消费统一结构，而不是平台原始返回值
- 导入失败时保持当前编辑状态，不留下空引用

## 11. 持久化、生命周期与本地资产架构

### 11.1 当前第一阶段默认原则

- 不因为 Android 打包而立即重构项目存储模型
- 平台层只处理文件能力与运行环境差异
- 业务层继续使用当前项目模型与本地保存逻辑作为基线

### 11.2 Android 必须重点评估的差异

- 应用切后台再返回的状态稳定性
- 横竖屏切换下的编辑上下文保留
- 导入素材复制到本地后的引用稳定性
- 本地项目在升级、卸载、清理数据后的风险提示策略

### 11.3 第一阶段结论

- Android 第一阶段不承诺与 Windows / Web 自动数据互通
- Android 第一阶段不引入第二套项目模型
- Android 平台层不直接接管项目存储语义

## 12. 触控与响应式架构约束

### 12.1 当前共识

- Windows 与 Android 共用同一套页面概念
- 不同设备通过布局变化承接，不通过完全不同的信息架构承接
- 编辑器优先保证画布可用面积

### 12.2 Android 第一阶段要求

- 手机端：画布优先，工具 / 属性 / 步骤通过底栏和抽屉承接
- 平板端：保留完整编辑能力，但重型面板改为抽屉或浮层
- 首先保证对象选择、移动、步骤切换、保存、导出可用

### 12.3 结果

- Android 技术架构必须接受“布局层分化”
- 但不接受“业务层分叉”

## 13. 正式开发前的验证门槛

Android 正式实现开始前，至少要先拿到以下结论：

### 13.1 技术验证门槛

- 当前技术路线是否能稳定初始化 Android 工程
- 当前前端是否能在 Android 运行时稳定启动
- 路由与页面切换是否存在移动端阻塞问题

### 13.2 平台桥验证门槛

- 文件选择器是否能接通
- PNG 导出是否能完成系统分享闭环
- 参考底图导入是否能完成“选择 -> 本地复制 -> 编辑器使用”闭环

### 13.3 交互验证门槛

- 编辑器关键触控路径是否可用
- 常见窄屏 / 横竖屏下是否仍能走通主链路

### 13.4 生命周期验证门槛

- 切后台 / 回前台是否破坏编辑状态
- 横竖屏切换是否导致关键上下文丢失

没有通过这些门槛前，不应把 Android 打包视为已进入稳定实现阶段。

## 14. 当前明确不做的技术动作

- 不复制 Android 专用业务代码目录
- 不在第一阶段重写编辑器对象模型
- 不在第一阶段把导出逻辑整体迁移到原生侧
- 不把 GIF 导出写成 Android 首版默认承诺
- 不把应用商店分发、签名和发布运营流程混进当前技术架构文档

## 15. 配套文档与当前结论

当前 Android 技术架构应与以下文档一起阅读：

- `docs/05-engineering/android-packaging-plan.md`
- `docs/android-packaging/android-internal-interface-spec.md`
- `docs/android-packaging/android-acceptance-standard.md`
- `docs/football-tactics-board-prd.md`
- `docs/football-tactics-board-requirements.md`
- `docs/football-tactics-board-information-architecture.md`
- `docs/02-ux/responsive-rules.md`
- `docs/02-ux/user-flows.md`
- `docs/03-functional/frd/editor.md`

当前结论：

- Android 技术架构的重点不是尽快做出一个移动壳，而是把：
  - 运行容器
  - 文件能力
  - 系统分享
  - 平台识别
  - 生命周期差异

  这几类平台差异隔离到壳层与平台桥里。

只要这个分层守住，Android 后续实现才不会把当前 Windows / Web 基线一起拖进分叉。 
