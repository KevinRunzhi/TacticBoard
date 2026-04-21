# Android Phase 1 切片开发计划

## 1. 文档目标

这份文档用于把 Android 第一阶段从“已有方案、架构、接口、验收文档”进一步收敛成可执行的切片开发计划。

目标：

- 冻结 Android 第一阶段的切片顺序
- 为每个切片定义边界、允许改动范围、验证项和退出条件
- 让开发、验证、回滚、DocsReview 留痕都能按同一套切片模型推进

一句话目标：

- `把 Android Phase 1 从文档基线转成可以逐片执行的工程计划。`

## 2. 适用范围

本文件覆盖：

- Android 第一阶段的切片顺序
- 每个切片的目标、边界、依赖、验证和退出条件
- 每个切片的 DocsReview 留痕要求
- 每个切片建议的提交粒度

本文件不覆盖：

- 应用商店发布
- 签名和发布运营
- 自动更新
- 云同步
- 跨设备迁移
- 项目文件导入导出
- Android GIF 作为第一阶段默认承诺
- 第二阶段及之后的功能扩展

## 3. 关联文档

- `docs/05-engineering/android-packaging-plan.md`
- `docs/android-packaging/android-technical-architecture.md`
- `docs/android-packaging/android-internal-interface-spec.md`
- `docs/android-packaging/android-acceptance-standard.md`
- `docs/android-packaging/android-device-compatibility-matrix.md`
- `docs/android-packaging/android-device-validation-plan.md`
- `docs/android-packaging/android-development-guide.md`
- `docs/DocsReview/android-technical-validation-template.md`
- `docs/DocsReview/android-device-compatibility-validation-template.md`

## 4. 当前执行前提

当前默认前提：

- Android 开发工作在 `develop-android-packaging` 分支推进
- Web / Windows / Android 继续共用同一套前端业务代码
- Android 第一阶段只新增壳层与平台桥，不复制业务代码树
- Android 第一阶段继续以 PNG + 系统分享、系统文件选择器 + 本地复制、保存恢复、生命周期稳定性为重点
- 当前 `tactics-canvas-24/` 已提交代码基线默认仍按 Windows 已交付版本理解，不把旧 Android 本地实验直接视为当前源码现实
- `DocsReview` 里既有的 Slice 0 / 1 / 2 / 3 记录，当前默认只作为历史方向证据和风险提示，不等于这些切片在当前代码树里已经关闭

## 5. 切片设计原则

Android 第一阶段切片开发必须遵守：

1. 先平台可行性，再平台能力，再主链路，再设备验证
2. 一片只解决一个闭环问题
3. 每片都必须有验证和退出条件
4. 每片都必须能单独回滚
5. 每片结束都要留下 DocsReview 记录
6. 未提交本地实验不能直接推进切片状态

## 6. 冻结切片顺序

Android 第一阶段默认冻结以下顺序，不应随意重排：

1. Slice 0：Android Shell Feasibility Baseline
2. Slice 1：Runtime Platform and Router Boundary
3. Slice 2：Touch-First Main-Flow Baseline
4. Slice 3：PNG Export and System Share Boundary
5. Slice 4：System Picker and Local-Copy Asset Import Boundary
6. Slice 5：Save / Recovery / Lifecycle / Orientation Hardening
7. Slice 6：Device-Tier Validation, Regression, and Phase-1 Closure

不建议的重排：

- 把导出 / 导入切片提前到壳层可行性前面
- 在 Router 平台边界没稳之前同时推进导出、导入、生命周期
- 把最终设备验证和主链路验证混成一片

### 6.1 当前重启基线（2026-04-19）

为了避免把历史 review 误当成当前代码现状，当前分支默认按以下状态理解：

- Slice 0：当前分支已经重新恢复 `tauri:android:*` 脚本入口，并完成一轮 `build / test / lint`、`tauri:build`、Android `init / dev / build` 与模拟器冷启动验证；当前可视为已重新建立 baseline
- Slice 1：当前分支已经重新建立 `android-tauri` 运行时识别与集中 Router 入口，并完成 `build / test / lint`、`tauri:build`、桌面 `tauri:dev` smoke、Android `tauri:android:dev` smoke、应用级无效路由自动化回归与 Android 壳内无效 hash 路径现场观察；当前可按片内最严格证据门槛视为已关闭，但仍保留一个片外风险：外部 `VIEW intent + URL data` 入口尚未纳入合同
- Slice 2：历史上做过 touch-first baseline 验证，但当前代码树不应因旧 review 被视为已关闭；默认按未关闭处理
- Slice 3：当前分支已重新建立 Android PNG -> 系统分享闭环，完成 `build / test / lint`、`tauri:build`、桌面 `tauri:dev` smoke、`export-save` 自动化回归，以及 `Pixel_7` 模拟器设备侧系统分享硬证据；当前可按片内门槛视为已关闭，真机 / 打包 APK 观察保留到 Slice 6
- Slice 4：当前分支已重新建立 Android 系统选择器 + 本地复制素材导入边界，完成 `build / test / lint`、`tauri:build`、桌面 `tauri:dev` smoke、Android `tauri:android:dev`、`asset-import` / 头像 / 参考图自动化回归，以及 `Pixel_7` 模拟器设备侧系统选择器、本地复制、参考底图导入、球员头像导入与取消路径硬证据；当前可按片内门槛视为已关闭，真机 / release APK 留到 Slice 6
- Slice 5：当前分支已重建保存 / 恢复 / 生命周期 / 方向切换 baseline，并拿到 `Pixel_7` 模拟器 Android dev 壳里的未保存新建会话与已保存正式项目恢复记录；当前只能写成“模拟器验证通过”，不能写成“真机完成”，且仍未达到进入 Slice 6 的设备覆盖门槛
- Slice 6：当前没有正式设备验证收口记录，默认未开始

这里的含义不是否定旧 review 的价值，而是要求：

- 旧 review 用来缩小风险、提示坑点
- 当前切片状态以当前代码树和当前提交范围为准
- 如果当前源码里没有对应实现，就不能因为历史上做过实验而直接跳过该切片

### 6.2 切片独立执行文档

从本轮开始，Android Phase 1 的逐片实施清单改为拆分到独立文档中执行：

- Slice 0：`docs/android-packaging/slices/slice-0-android-shell-feasibility-baseline.md`
- Slice 1：`docs/android-packaging/slices/slice-1-runtime-platform-and-router-boundary.md`
- Slice 2：`docs/android-packaging/slices/slice-2-touch-first-main-flow-baseline.md`
- Slice 3：`docs/android-packaging/slices/slice-3-png-export-and-system-share-boundary.md`
- Slice 4：`docs/android-packaging/slices/slice-4-system-picker-and-local-copy-asset-import-boundary.md`
- Slice 5：`docs/android-packaging/slices/slice-5-save-recovery-lifecycle-orientation-hardening.md`
- Slice 6：`docs/android-packaging/slices/slice-6-device-tier-validation-regression-phase1-closure.md`

使用原则：

- 本文件继续负责冻结切片顺序、共享规则、回滚原则和重启基线
- `slices/*.md` 负责单片执行清单、接口检查、开发闭环和更细的验收门槛
- 若同一事项同时涉及“顺序 / 共享规则”和“单片实施细节”，前者以本文件为准，后者以对应切片文档为准

## 7. 所有切片共享规则

### 7.1 共享验证前置

每个切片开始前与结束前，至少都要跑：

```bash
npm run build
npm run test
npm run lint
```

### 7.2 文档治理前置

如果某个切片发现：

- 范围需要缩小
- 退出条件需要放宽
- 当前阶段承诺需要改动

必须先改：

- `android-packaging-plan.md`
- `android-acceptance-standard.md`

必要时再改：

- `android-internal-interface-spec.md`
- `android-device-compatibility-matrix.md`
- `android-development-guide.md`

### 7.3 提交状态与证据等级规则

每个切片默认都要明确区分：

- 已提交、可追踪的实现范围
- 仅本地实验、不构成切片推进依据的范围
- 自动化证据
- 设备侧硬证据

默认规则：

- 未提交本地实验不能直接写成切片退出
- 只有自动化证据，不能直接关闭系统分享、系统文件选择器、生命周期切片
- DocsReview 必须写清楚哪些结论建立在已提交改动上

### 7.4 生成目录 / vendor 例外规则

如果某个切片为了验证可行性，临时修改了以下内容：

- `src-tauri/gen/**`
- `src-tauri/target/**`
- `src-tauri/vendor/**`

则该轮记录必须额外写清：

- 临时修改点
- 对应的再生成路径或上游来源
- 当前结论是否仍然只是“方向可行”，而不是“切片已关闭”

默认不允许：

- 只靠生成目录补丁关闭切片
- 只靠 vendor 临时副本关闭切片

### 7.5 历史 slice review 使用规则

已经存在的 Slice review 可以用于：

- 标注哪些方向已经历史验证过可行
- 标注哪些坑点已经出现过
- 标注哪些退出条件曾经失败

但默认不能用于：

- 直接跳过当前切片实现
- 直接把当前切片写成“已关闭”
- 直接把旧分支 / 旧工作区里的本地实验当成当前源码事实

如果当前是一轮“重新开发 Android”：

- 新一轮 DocsReview 必须明确写清这是“重启实现”还是“延续旧实现”
- 可以引用旧 review，但不能继承旧 review 的退出结论
- 当前切片是否关闭，仍只看当前源码、当前验证和当前证据等级

### 7.6 回滚原则

每个切片都要保持：

- 可以单独回滚
- 可以单独说明验证结果
- 不与无关切片捆绑

## 8. 每个切片的固定结构

说明：

- 下方 `Slice 0` 到 `Slice 6` 保留为总表摘要
- 真正逐片开发时，默认应直接使用 `docs/android-packaging/slices/*.md` 作为执行清单

每个切片至少要明确：

- Current restart status
- Objective
- In-scope work
- Out-of-scope guardrails
- Likely touched areas / files
- Prerequisites / dependencies
- Validation checkpoints
- Exit criteria
- Does not count as done
- DocsReview evidence
- Handoff to next slice
- Evidence grade / committed scope
- Suggested commit granularity

## 9. Slice 0：Android Shell Feasibility Baseline

### Current restart status

- 历史上已验证过工具链、`tauri android init / dev / build` 的方向可行
- 当前分支已重新把 `tauri`、`tauri:android:init`、`tauri:android:dev`、`tauri:android:build` 固化回 `package.json`
- 当前分支已完成一轮 `build / test / lint`、`tauri:build`、`tauri:dev` smoke、Android `init / dev / build` 与 `Pixel_7` 模拟器冷启动验证

### Objective

- 建立 Android 壳层 / 平台工程
- 让当前前端可被 Android 壳承载并启动
- 冻结真实 Android init / run / build 命令
- 固定 Android 构建产物卫生规则

### In-scope work

- Android 壳层 / 平台工程初始化
- 最小前端启动接通
- Android 构建命令确认
- `.gitignore` 覆盖 Android 产物

### Out-of-scope guardrails

- 不接 Router Android 分支
- 不接导出 / 导入
- 不做触控优化
- 不做生命周期修复

### Likely touched areas / files

- Android 壳层 / 平台工程目录
- `tactics-canvas-24/.gitignore`
- `tactics-canvas-24/package.json`
- `tactics-canvas-24/vite.config.ts`
- 如果初始化工具自动改动，则可能触及：
  - `tactics-canvas-24/src-tauri/tauri.conf.json`
  - `tactics-canvas-24/src-tauri/Cargo.toml`

### Prerequisites / dependencies

- 无

### Validation checkpoints

- 共享验证通过：`build / test / lint`
- Android 工程可初始化
- Android 应用可启动
- 当前前端已被壳层承载
- `git status` 不出现 Android 构建垃圾文件

### Exit criteria

- Android 壳层已初始化
- 真实命令已记录
- 前端已在 Android 壳中成功启动
- DocsReview 记录已落地

### Does not count as done

- 只有本机 Android Studio 工程目录生成过，但当前分支没有重新固化命令入口
- 只有模拟器里装过旧 dev 壳，但当前轮没有重新记录真实命令与环境
- 只改 `src-tauri/gen/**` 或本地环境，不写 `.gitignore`、脚本入口和 DocsReview
- 只有“应用能装上”或“壳能起”，没有共享验证与 Android 命令记录

### DocsReview evidence

- `implementation-review-android-phase1-slice0-feasibility-YYYY-MM-DD.md`
- 模板：`android-technical-validation-template.md`

### Handoff to next slice

- 进入 Slice 1 前，当前分支必须已经具备可复用的 Android 命令入口、壳层 baseline 和产物卫生规则
- 如果当前分支还要靠口头说明或本机环境记忆才能跑 Android，不得进入 Slice 1

### Suggested commit granularity

- `chore: harden android artifact ignore rules`
- `android: initialize android shell baseline`
- `docs: record android slice0 feasibility validation`

## 10. Slice 1：Runtime Platform and Router Boundary

### Current restart status

- 历史上已做过方向验证
- 当前分支已重新把 Android 运行时纳入 `src/lib/platform.ts`，并显式建模为 `android-tauri`
- 当前分支已重新固定 Router 入口：Web 使用 `BrowserRouter`，Tauri 运行时统一走 `HashRouter`
- 当前分支已补齐 Android 运行时检测、Android `HashRouter` 行为、应用级无效路由 fallback，以及 `file-access` / `asset-import` 在 Slice 1 不提前开启 Android 原生分支的自动化覆盖
- 当前分支已在 Android dev 壳内观察到工作台、项目页、设置页、编辑器入口，以及无效 hash 路径进入 `NotFound` 并返回工作台
- 当前分支另外暴露了一个片外风险：外部 `VIEW intent + URL data` 入口仍会白屏并报 `Entry not found`；由于当前源码没有 deep-link 插件、能力或配置，这不计入 Slice 1 应用内 Router 合同

### Objective

- 把 Android 运行时纳入共享平台识别层
- 保持 Router 入口集中，不在页面层散落 Android 特判

### In-scope work

- 扩展 `RuntimePlatform`
- 增加 Android 平台识别
- 保持 Router 入口集中
- 验证关键页面入口

### Out-of-scope guardrails

- 不做导出 / 导入 / 生命周期逻辑
- 不复制第二套页面树
- 不做大规模路由重写

### Likely touched areas / files

- `tactics-canvas-24/src/lib/platform.ts`
- `tactics-canvas-24/src/App.tsx`
- `tactics-canvas-24/src/main.tsx`
- `tactics-canvas-24/src/test/platform-router.test.tsx`
- `tactics-canvas-24/src/test/app-router-android.test.tsx`
- `tactics-canvas-24/src/test/file-access.test.ts`
- `tactics-canvas-24/src/test/asset-import.test.ts`

### Prerequisites / dependencies

- Slice 0 完成

### Validation checkpoints

- 共享验证通过
- Android 可打开：
  - 工作台
  - 项目页
  - 设置页
  - 编辑器入口
- Android 壳内无效 hash 路径可进入受控 `NotFound` 并返回工作台
- 不存在页面层 Android 路由散落判断
- `file-access` / `asset-import` 在当前片内仍保持“Android 不提前开启原生分支”的边界

### Exit criteria

- Android 平台识别已纳入共享抽象
- Router 入口仍然集中
- 页面结构未分叉
- 应用内无效 hash 路径已经具备设备侧硬证据

### Does not count as done

- 只有 Android dev 壳能启动，但平台抽象仍只有 `web` / `windows-tauri`
- 只有页面或组件里临时写了 Android 路由特判
- 只有旧 review 说做过，但当前源码里没有对应已提交实现
- 只有浏览器或桌面侧测试，没有 Android 运行时识别与 Router 边界验证
- 把外部 `VIEW intent + URL data` 的未支持行为误判成应用内 `HashRouter` 合同失败

### DocsReview evidence

- `implementation-review-android-phase1-slice1-router-platform-YYYY-MM-DD.md`
- 模板：`android-technical-validation-template.md`

### Handoff to next slice

- 进入 Slice 2 前，Android 运行时识别和 Router 入口集中必须已经在当前源码里成立
- 如果工作台 / 项目页 / 设置页 / 编辑器入口仍依赖页面层散落特判，不得进入 Slice 2
- 如果后续要支持外部 URL / deep-link 入口，应单独建片或单独扩展接口，不在 Slice 2 里顺手混入

### Suggested commit granularity

- `android: add android runtime platform detection`
- `android: centralize android router entry`

## 11. Slice 2：Touch-First Main-Flow Baseline

### Current restart status

- 历史上已做过 baseline 级验证
- 当前分支已经重新建立 Android 触控主链路 baseline，不再只依赖旧 review
- 当前分支已补齐 Android / mobile 专用自动化回归：`mobile-mainflow-baseline.test.tsx`、`mobile-topbar-touch.test.tsx`、`responsive-properties-drawer.test.tsx`
- 当前分支已把 `MobilePropertiesDrawer` / `TabletRightDrawer` 收口到 `RightPanelProps` 单一契约，并补了 `MobileTopBar` 的 touch / pointer 去重触发链路
- 当前分支已在 `Pixel_7` 模拟器 Android dev 壳内拿到“进入编辑器 -> 编辑 -> 保存 -> 返回 -> 再打开”的设备侧证据
- 当前分支可以把 Slice 2 视为已重新建立并达到关闭条件；当前保留的 Android dev HMR / `198.18.0.1` 模块拉取抖动属于开发态验证噪音，不单独阻塞关片

### Objective

- 让 Android 能在触控下完成第一阶段最小主链路

### In-scope work

- 打开 / 新建项目
- 进入编辑器
- 至少一种核心对象编辑
- 步骤切换 / 播放
- 保存 -> 返回 -> 再打开

### Out-of-scope guardrails

- 不做大规模 UI 重构
- 不重写 `useEditorState.ts`
- 不重构对象模型

### Likely touched areas / files

- 触控主路径相关组件，例如：
  - `TacticsEditor.tsx`
  - `MobilePropertiesDrawer.tsx`
  - `MobileStepsDrawer.tsx`
  - `TabletRightDrawer.tsx`
  - 其它真正阻塞触控路径的组件

### Prerequisites / dependencies

- Slice 1 完成

### Validation checkpoints

- 共享验证通过
- Android 手动验证通过：
  - 打开项目
  - 进入编辑器
  - 触控编辑至少一种对象
  - 切换步骤
  - 保存
  - 返回并重新打开

### Exit criteria

- P0 设备上最小主链路成立
- 不存在鼠标才能完成的硬阻塞
- 没有借机引入大规模无关重构

### Does not count as done

- 只有共享 state / hook 测试通过，没有移动端主链路专用回归锚点
- 只有编辑器能打开，但保存 -> 返回 -> 再打开没有明确验证
- 只有鼠标路径可用，触控下仍存在硬阻塞
- 只有旧 review 证明方向成立，当前代码树没有重新建立可回归 baseline

### DocsReview evidence

- `implementation-review-android-phase1-slice2-mainflow-touch-YYYY-MM-DD.md`
- 模板：`android-technical-validation-template.md`

### Handoff to next slice

- 进入 Slice 3 前，导出入口必须在 Android 主链路里真实可达
- 如果当前仍无法稳定完成“进入编辑器 -> 保存 / 返回 -> 再打开”的 baseline，不得进入 Slice 3

### Suggested commit granularity

- `android: unblock touch-first editor entry`
- `android: close android mainflow save-return baseline`

## 12. Slice 3：PNG Export and System Share Boundary

### Current restart status

- 历史上做过较深入实验，但旧方案曾卡在插件命令名漂移和原生回调等待上
- 当前代码树已改为：
  - `saveExportBinary()` 在 Android 下走 share-first 语义
  - Rust 侧先准备缓存文件，再通过 `android_share_bridge` 拉起系统分享面板
  - UI 在分享面板拉起后立即回写 `shared`
- 当前可按片内门槛视为已关闭

### Objective

- 实现 Android 第一阶段导出主目标：PNG + 系统分享

### In-scope work

- 明确导出结果语义
- 接系统分享链路
- 处理成功 / 取消 / 失败

### Out-of-scope guardrails

- 不把 Android 本地落盘写成默认硬门槛
- 不把 Android GIF 纳入本片退出条件
- 不把导出生成逻辑迁到原生侧

### Likely touched areas / files

- `tactics-canvas-24/src/lib/export-save.ts`
- `tactics-canvas-24/src/lib/file-access.ts`
- `tactics-canvas-24/src/components/tactics/TacticsEditor.tsx`
- `tactics-canvas-24/src/test/export-save.test.ts`
- `tactics-canvas-24/src/test/file-access.test.ts`

### Prerequisites / dependencies

- Slice 1 完成
- Slice 2 至少让导出入口可达

### Validation checkpoints

- 共享验证通过
- PNG 可导出
- 系统分享可进入
- 系统分享面板拉起后 UI 不得卡住，且要回写 `shared`
- 分享失败有提示
- 浏览器 PNG 导出仍可用
- Windows 导出语义不被污染

### Exit criteria

- Android 可完成 PNG + 系统分享闭环
- 导出结果语义稳定，且 `shared` 明确定义为“系统分享面板已拉起”
- Android 当前不以 chooser 下游 `cancelled` 回调作为关闭前提
- 当前实现没有把 Android GIF 变成默认承诺
- 至少已有一项设备侧硬证据，证明“导出 PNG -> 系统分享”主路径真实命中

### Does not count as done

- 只有浏览器 / Windows 导出仍可用，但 Android 还没有 share-first 结果语义
- 只有 build / dev smoke 通过，没有设备侧导出确认命中证据
- 只有导出按钮可点或弹窗可开，没有系统分享链路硬证据
- 系统分享面板已经弹出，但前端仍在等待原生回调，导致 UI 没有 `shared` 回写
- 只靠 `src-tauri/gen/**` 或 `vendor/**` 临时补丁证明方向成立
- 旧 review 里做过实验，但当前源码没有重新提交对应实现

### DocsReview evidence

- `implementation-review-android-phase1-slice3-export-share-YYYY-MM-DD.md`
- 模板：`android-technical-validation-template.md`

### Handoff to next slice

- 进入 Slice 4 前，必须已经拿到一次可靠的“导出 PNG -> 系统分享”设备侧硬证据
- 如果当前仍停留在“导出按钮无反应”“弹窗能开但没有分享链路证据”“分享面板已弹出但 UI 仍挂住”或“只有自动化通过”，不得进入 Slice 4

### Suggested commit granularity

- `android: add export result semantics for share flow`
- `android: wire android png export to system share`
- `android: move share launch semantics into rust bridge`

## 13. Slice 4：System Picker and Local-Copy Asset Import Boundary

### Current restart status

- 当前分支已重新建立 Android 系统选择器 + 本地复制素材导入边界，不再只停留在历史 review
- 当前代码树已把 `asset-import.ts` 扩展为：
  - Android / Windows 原生选择器统一入口
  - 原生字节读取
  - Rust `persist_imported_image` 本地复制
  - 归一化 `File` 返回
- 当前分支已同时打通两条共享业务链路：
  - 参考底图导入
  - 球员头像导入
- 当前分支已补齐 `asset-import.test.ts`、`right-panel-reference-import.test.tsx`、`player-avatar-model.test.tsx`、`player-avatar-render.test.tsx` 与触控相关回归
- 当前分支已在 `Pixel_7` 模拟器 Android dev 壳内拿到：
  - 系统选择器打开证据
  - 本地复制命中日志
  - 参考底图导入成功证据
  - 球员头像导入成功证据
  - 取消选择不破坏现有头像状态的证据
- 当前分支额外暴露并修复了一个跨片交互风险：`MobileToolbar` 触控去重最初会吞掉相邻按钮动作，并可能把合成点击漏给球场；当前已改成“按按钮动作去重 + touchstart/pointerdown 拦截”

### Objective

- 实现 Android 系统文件选择器 + 本地复制的素材导入边界

### In-scope work

- 系统选择器
- 本地复制
- 保持当前 `File` 契约
- 同时覆盖：
  - 球员头像导入
  - 参考底图导入

### Out-of-scope guardrails

- 不重写成新的资产模型
- 不把 URI / 路径直接传给组件层
- 不扩展成本地资产库功能

### Likely touched areas / files

- `tactics-canvas-24/src/lib/asset-import.ts`
- `tactics-canvas-24/src/lib/file-access.ts`
- 导入调用点，例如：
  - `RightPanel.tsx`
  - `TabletRightDrawer.tsx`
  - `MobilePropertiesDrawer.tsx`
- `tactics-canvas-24/src/test/asset-import.test.ts`
- `tactics-canvas-24/src/test/right-panel-reference-import.test.tsx`

### Prerequisites / dependencies

- Slice 1 完成
- Slice 2 让导入入口可达

### Validation checkpoints

- 共享验证通过
- 系统选择器可打开
- 头像导入可用
- 参考底图导入可用
- 完成本地复制
- 失败不留下空引用
- 用户取消不应破坏当前已存在的底图或头像状态
- 浏览器导入路径仍可用
- Windows 导入语义未被污染
- 至少留下一项设备侧硬证据，证明选择器和本地复制主路径真实命中

### Exit criteria

- Android 两类素材导入都可走通
- 组件仍消费 `File`
- 没有把原生路径 / URI 泄漏到 UI
- 已具备系统选择器和本地复制的设备侧硬证据
- 参考底图与球员头像都已至少具备一轮设备侧成功证据
- 取消路径已至少具备一轮设备侧观察或自动化回归

### Does not count as done

- 只有系统选择器能打开，但没有完成本地复制
- 只有头像导入或只有底图导入单边可用
- 组件层仍直接消费路径、URI 或权限引用
- 只有浏览器导入路径可用，没有 Android 专项导入证据
- 只有成功路径，没有取消 / 失败语义覆盖
- 因为触控串触发，选择工具时会把导入或落点动作误发给底层球场

### DocsReview evidence

- `implementation-review-45-android-slice4-asset-import-restart-2026-04-21.md`
- 模板：`android-technical-validation-template.md`

### Handoff to next slice

- 进入 Slice 5 前，头像导入和参考底图导入都必须已经在 Android 下走通，并留下本地复制硬证据
- 如果当前仍有空引用、导入后资源丢失或路径泄漏到 UI，不得进入 Slice 5

### Suggested commit granularity

- `android: add android system picker import path`
- `android: add local-copy file bridge for imported assets`
- `android: preserve file-based component import contract`

## 14. Slice 5：Save / Recovery / Lifecycle / Orientation Hardening

### Current restart status

- 当前分支已重新为 `mode=new` 建立显式 `session` 入口语义，避免生命周期 / 方向切换恢复被误判成新的空白编辑器进入
- 当前分支已在 `useEditorState.ts` 中补上生命周期边界草稿落盘、正式项目持久化指纹基线和等价项目草稿清理
- 当前分支已新增 `editor-entry.test.ts`、`editor-lifecycle-recovery.test.tsx`，并补强 `editor-save-return.test.tsx`
- 当前分支已在 `Pixel_7` 模拟器 Android dev 壳里拿到：
  - 未保存新建会话 -> 后台 / 前台 -> 横屏 / 竖屏恢复记录
  - 已保存正式项目 -> 返回工作台 -> 继续编辑 -> 后台 / 前台 -> 横屏 / 竖屏恢复记录
- 当前轮暴露并修复了一个真实存储隐患：已保存项目在“返回工作台 -> 继续编辑”后会被旧草稿误判成脏状态
- 当前结论只能写成“模拟器验证通过”，不能写成“真机完成”；平板和真机覆盖仍留给 Slice 6

### Objective

- 把 Android 第一阶段的本地保存、恢复、生命周期和横竖屏稳定性补到可验收状态

### In-scope work

- 手动保存
- 自动保存
- 最近项目继续编辑
- 切后台 / 回前台
- 横竖屏切换

### Out-of-scope guardrails

- 不承诺跨设备迁移
- 不重写存储模型
- 不做广泛状态层重构

### Likely touched areas / files

- Android 壳层生命周期配置
- 共享入口与保存恢复相关最小改动点
- 仅在真正阻塞时触碰：
  - `App.tsx`
  - `main.tsx`
  - 少量保存触发点

### Prerequisites / dependencies

- Slice 2 完成
- Slice 3 完成
- Slice 4 完成

### Validation checkpoints

- 共享验证通过
- Android 手动验证通过：
  - 手动保存
  - 自动保存
  - 再次打开项目
  - 切后台 / 回前台
  - 横竖屏切换
- P0 手机竖屏 / 横屏 / 平板都有至少一轮验证
- 如果当前轮只有模拟器手机竖屏 / 横屏记录，则该轮只能作为 Slice 5 进行中证据，不能直接推进到 Slice 6

### Exit criteria

- Android 本地优先主链路稳定
- 生命周期变化不再明显破坏主链路
- 方向切换不再明显打断当前编辑上下文
- 切后台 / 回前台 / 横竖屏切换已存在真实设备或模拟器的明确手动记录，不能只靠推断

### Does not count as done

- 只有浏览器或桌面环境下的保存 / 再打开可用
- 只有“应用能重新打开”的烟雾记录，没有切后台 / 回前台 / 横竖屏切换手动记录
- 只有推断“应该没问题”，没有明确设备或模拟器验证
- 只有手机竖屏记录，没有横屏或平板观察
- 把模拟器记录直接写成“真机完成”

### DocsReview evidence

- `implementation-review-android-phase1-slice5-lifecycle-recovery-YYYY-MM-DD.md`
- 当前轮记录：`implementation-review-46-android-slice5-lifecycle-recovery-restart-2026-04-21.md`
- 模板：`android-technical-validation-template.md`
- 如涉及明确设备覆盖，再补：
  - `implementation-review-android-phase1-slice5-device-coverage-YYYY-MM-DD.md`
  - 模板：`android-device-compatibility-validation-template.md`

### Handoff to next slice

- 进入 Slice 6 前，至少要有 P0 手机竖屏 / 横屏 / 平板的一轮明确保存、恢复、生命周期记录
- 如果当前生命周期稳定性仍主要靠推断或单一设备 smoke，不得进入 Slice 6
- 如果当前只有 `Pixel_7` 模拟器手机记录，继续补平板 / 真机覆盖，不要把当前结果误写成 Slice 6 入口成立

### Suggested commit granularity

- `android: stabilize local save and reopen behavior`
- `android: harden lifecycle and orientation continuity`

## 15. Slice 6：Device-Tier Validation, Regression, and Phase-1 Closure

### Current restart status

- 当前没有正式的 Slice 6 收口记录
- 默认按未开始处理，而且不得在 Slice 3 / 4 / 5 未关闭时提前执行

### Objective

- 完成最终的 P0/P1 设备验证、Web/Windows 回归和 Android 第一阶段收口

### In-scope work

- P0 设备完整验证
- 至少一轮 P1 风险观察
- Web 回归
- Windows 平台桥语义回归观察
- 最终验收映射与剩余风险记录

### Out-of-scope guardrails

- 不把这一片变成“大杂烩补 bug”
- 不把 P2 观察项上升为第一阶段阻塞条件
- 不在此时再扩 Android 第一阶段范围

### Likely touched areas / files

- 主要是 `DocsReview` 记录
- 如果发现阻塞问题，只回到对应切片所属区域修，不在本片广泛重构

### Prerequisites / dependencies

- Slice 0 到 Slice 5 完成

### Validation checkpoints

- 共享验证通过
- P0 设备通过：
  - 启动与页面进入
  - 主链路
  - PNG + 系统分享
  - 头像导入
  - 参考底图导入
  - 保存 / 恢复 / 生命周期 / 方向切换
- 至少一轮 P1 风险观察完成
- Web 回归通过
- Windows 平台桥观察无异常

### Exit criteria

- Android 第一阶段 P0 设备门槛满足
- P1 风险已记录
- Web / Windows 回归可接受
- 已有最终 DocsReview 证据支撑 Android 第一阶段完成判断
- 不存在只靠本地未提交实验、生成目录补丁或 vendor 临时副本支撑的“阶段完成”结论

### Does not count as done

- 只有模拟器 smoke 或单设备 smoke
- 只有 P0 口头判断，没有设备等级映射记录
- 只有 Android 本身验证，没有 Web / Windows 回归
- 发现问题后在本片临时打补丁，而不是回到对应切片修正

### DocsReview evidence

- `implementation-review-android-phase1-final-YYYY-MM-DD.md`
- 模板：`android-technical-validation-template.md`
- `implementation-review-android-phase1-device-final-YYYY-MM-DD.md`
- 模板：`android-device-compatibility-validation-template.md`

### Handoff to next slice

- 本片关闭后，Android Phase 1 才允许写成“阶段完成”
- 如果 P0 / P1 记录、Web / Windows 回归或系统集成硬证据仍不完整，本片不得关闭，也不得对外扩大 Android 承诺

### Suggested commit granularity

- `android: fix final p0 blockers in shared platform boundaries`（如需要）
- `docs: record android phase1 final validation evidence`

## 16. Slice 级回归规则

每片结束都至少要明确：

- 本轮 Android 修改是否破坏 Web 路径
- 本轮 Android 修改是否污染 Windows 平台桥语义
- 本轮是否需要补设备兼容记录

## 17. 显式延期项

以下内容不属于当前切片计划：

- 应用商店发布
- 签名与发布运营
- 自动更新
- 云同步
- 跨设备迁移
- 项目文件导入导出
- Android GIF 作为默认承诺
- 大规模 UI 重构
- 第二套业务代码树
- 超出当前 `File` 桥约束的资产模型重构

## 18. Android 重启执行清单

当前如果要重新开始 Android 实施，默认按以下顺序推进：

1. 先阅读本文件 `6.1 当前重启基线`，不要把旧 review 误当成当前源码状态
2. 从 Slice 0 重新固化当前分支可复用的 Android 命令入口、壳层 baseline 和产物卫生规则
3. Slice 0 关闭后，按 1 -> 2 -> 3 -> 4 -> 5 -> 6 顺序推进，不跳片
4. 每片都同时产出：代码 / 配置、测试、DocsReview 记录
5. 每片结束时，都明确写清“当前片关闭了吗、下一片为什么可以开始”

## 19. 当前结论

这份文档的作用不是替代方案、架构、接口或验收标准，而是：

- 把 Android 第一阶段变成一组能逐片执行、逐片验证、逐片回滚的工程计划

从现在开始，Android 第一阶段的推进应优先以这份切片计划来组织实施。

并且当前要明确：

- 旧 slice review 仍有价值
- 但当前代码树的切片状态，必须重新按本文件逐片判断，不能把旧实验结果直接继承成当前已完成状态
