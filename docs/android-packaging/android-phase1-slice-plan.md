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

## 5. 切片设计原则

Android 第一阶段切片开发必须遵守：

1. 先平台可行性，再平台能力，再主链路，再设备验证
2. 一片只解决一个闭环问题
3. 每片都必须有验证和退出条件
4. 每片都必须能单独回滚
5. 每片结束都要留下 DocsReview 记录

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

### 7.3 回滚原则

每个切片都要保持：

- 可以单独回滚
- 可以单独说明验证结果
- 不与无关切片捆绑

## 8. 每个切片的固定结构

每个切片至少要明确：

- Objective
- In-scope work
- Out-of-scope guardrails
- Likely touched areas / files
- Prerequisites / dependencies
- Validation checkpoints
- Exit criteria
- DocsReview evidence
- Suggested commit granularity

## 9. Slice 0：Android Shell Feasibility Baseline

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

### DocsReview evidence

- `implementation-review-android-phase1-slice0-feasibility-YYYY-MM-DD.md`
- 模板：`android-technical-validation-template.md`

### Suggested commit granularity

- `chore: harden android artifact ignore rules`
- `android: initialize android shell baseline`
- `docs: record android slice0 feasibility validation`

## 10. Slice 1：Runtime Platform and Router Boundary

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

### Prerequisites / dependencies

- Slice 0 完成

### Validation checkpoints

- 共享验证通过
- Android 可打开：
  - 工作台
  - 项目页
  - 设置页
  - 编辑器入口
- 不存在页面层 Android 路由散落判断

### Exit criteria

- Android 平台识别已纳入共享抽象
- Router 入口仍然集中
- 页面结构未分叉

### DocsReview evidence

- `implementation-review-android-phase1-slice1-router-platform-YYYY-MM-DD.md`
- 模板：`android-technical-validation-template.md`

### Suggested commit granularity

- `android: add android runtime platform detection`
- `android: centralize android router entry`

## 11. Slice 2：Touch-First Main-Flow Baseline

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

### DocsReview evidence

- `implementation-review-android-phase1-slice2-mainflow-touch-YYYY-MM-DD.md`
- 模板：`android-technical-validation-template.md`

### Suggested commit granularity

- `android: unblock touch-first editor entry`
- `android: close android mainflow save-return baseline`

## 12. Slice 3：PNG Export and System Share Boundary

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
- 用户取消分享不报错
- 分享失败有提示
- 浏览器 PNG 导出仍可用
- Windows 导出语义不被污染

### Exit criteria

- Android 可完成 PNG + 系统分享闭环
- 导出结果语义稳定
- 当前实现没有把 Android GIF 变成默认承诺

### DocsReview evidence

- `implementation-review-android-phase1-slice3-export-share-YYYY-MM-DD.md`
- 模板：`android-technical-validation-template.md`

### Suggested commit granularity

- `android: add export result semantics for share flow`
- `android: wire android png export to system share`

## 13. Slice 4：System Picker and Local-Copy Asset Import Boundary

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
- 浏览器导入路径仍可用
- Windows 导入语义未被污染

### Exit criteria

- Android 两类素材导入都可走通
- 组件仍消费 `File`
- 没有把原生路径 / URI 泄漏到 UI

### DocsReview evidence

- `implementation-review-android-phase1-slice4-asset-import-YYYY-MM-DD.md`
- 模板：`android-technical-validation-template.md`

### Suggested commit granularity

- `android: add android system picker import path`
- `android: add local-copy file bridge for imported assets`
- `android: preserve file-based component import contract`

## 14. Slice 5：Save / Recovery / Lifecycle / Orientation Hardening

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

### Exit criteria

- Android 本地优先主链路稳定
- 生命周期变化不再明显破坏主链路
- 方向切换不再明显打断当前编辑上下文

### DocsReview evidence

- `implementation-review-android-phase1-slice5-lifecycle-recovery-YYYY-MM-DD.md`
- 模板：`android-technical-validation-template.md`
- 如涉及明确设备覆盖，再补：
  - `implementation-review-android-phase1-slice5-device-coverage-YYYY-MM-DD.md`
  - 模板：`android-device-compatibility-validation-template.md`

### Suggested commit granularity

- `android: stabilize local save and reopen behavior`
- `android: harden lifecycle and orientation continuity`

## 15. Slice 6：Device-Tier Validation, Regression, and Phase-1 Closure

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

### DocsReview evidence

- `implementation-review-android-phase1-final-YYYY-MM-DD.md`
- 模板：`android-technical-validation-template.md`
- `implementation-review-android-phase1-device-final-YYYY-MM-DD.md`
- 模板：`android-device-compatibility-validation-template.md`

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

## 18. Slice 0 立即执行清单

当前可以直接从 Slice 0 开始：

1. 确认当前分支就是 Android 实施分支
2. 检查 `.gitignore`
3. 初始化 Android 壳层 / 平台工程
4. 跑共享验证
5. 跑 Android 初始化 / 启动 / 构建命令
6. 记录真实命令
7. 写 Slice 0 DocsReview 记录

## 19. 当前结论

这份文档的作用不是替代方案、架构、接口或验收标准，而是：

- 把 Android 第一阶段变成一组能逐片执行、逐片验证、逐片回滚的工程计划

从现在开始，Android 第一阶段的推进应优先以这份切片计划来组织实施。 
