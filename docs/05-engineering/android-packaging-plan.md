# Android 打包前开发方案

## 1. 文档目标

这份文档用于定义 TacticBoard 在 **Android 打包正式开发开始前** 的准备路线、技术决策边界、验证顺序和阶段性产物。

当前目标不是立刻进入 Android 实现，而是先把这些问题讲清楚：

- 当前项目是否适合直接进入 Android 打包
- Android 端应该沿用什么总体技术路线
- 哪些能力必须先抽象，哪些能力暂时不能做
- 进入正式开发前，必须完成哪些验证
- Android 打包应如何与当前 Windows 打包成果保持一致，而不是重新分叉一套业务代码

一句话目标：

- `先把 Android 打包的开发前提、平台边界和验证门槛固定，再进入正式实现。`

## 2. 当前背景

### 2.1 当前产品基线

当前顶层产品文档仍然把项目定义为：

- `Windows + Android` 首发
- `离线单机`
- `免注册`
- 优先服务业余足球爱好者的战术表达、讲解和导出

当前已经落地的工程现实是：

- Windows 桌面打包已经完成第一阶段接入
- `React + Vite` 前端主工程仍然是唯一业务源码
- 已经存在面向平台差异的桥接层：
  - `src/lib/platform.ts`
  - `src/lib/file-access.ts`
  - `src/lib/export-save.ts`
  - `src/lib/asset-import.ts`

这意味着 Android 不是从零开始，而是建立在现有跨平台抽象已经开始成型的基础上。

### 2.2 当前 Android 相关已知约束

现有文档已经明确了几条和 Android 直接相关的前提：

- Web / Windows / 后续 Android 应共用同一套前端业务代码
- Android 第一阶段不应通过复制一份移动端前端项目来解决问题
- Android 端首发更看重：
  - 触控操作可用
  - 本地保存稳定
  - PNG 导出可用
  - 系统分享可用
- Android 首版不强制要求 GIF 导出与桌面端完全对齐
- Android 文件能力必须优先走系统文件选择器和最小授权路径

### 2.3 当前还没有的内容

当前仓库里尚未存在：

- Android 壳层目录
- Android 打包脚本
- Android 专项平台桥实现
- Android 专项验收标准
- Android 构建与签名说明

因此 Android 现在处于：

- `产品和工程方向已写入文档`
- `Windows 已先跑通一轮`
- `Android 尚未进入正式实现`

## 3. 方案结论

Android 端建议优先采用：

- `继续沿用 Tauri 2 移动端路线进行前期验证`

当前不建议直接采用：

- 重新单独做一套 Android WebView 壳并维护第二套平台工程体系
- 直接把当前前端改造成纯 Android 专用项目
- 在没有前置验证的情况下同时推进 Android 壳、触控改造、文件权限、分享链路和商店上架

原因：

- 当前 Windows 第一阶段已经围绕 Tauri 2 建立了平台桥边界
- 现有桥接层和单一业务源码原则，本来就是为后续 Android 复用预留的
- 如果 Android 改走另一套完全不同的壳层路线，会迅速破坏当前刚建立起来的平台抽象
- Android 端真正的难点不只是“能不能打包”，而是：
  - 触控交互
  - 文件权限
  - 系统分享
  - 生命周期与存储稳定性

所以 Android 下一步的正确顺序不是“直接开写”，而是：

- `先验证技术路线是否成立，再进入壳层接入与交互适配。`

## 4. Android 打包目标分层

Android 不建议一步到位追求“完整首发”。建议拆成三个阶段目标。

### Phase A：打包路径可行性验证

目标：

- 证明当前前端工程可以被 Android 壳成功承载
- 证明基础运行链路成立：启动、路由、页面渲染、基本状态恢复
- 不在这个阶段承诺完整编辑体验

阶段完成标准：

- Android 开发工程可初始化
- 应用能在模拟器或真机上启动
- 首页 / 项目页 / 设置页 / 编辑器入口能打开
- 路由与页面切换没有立即崩溃

### Phase B：平台关键路径接入验证

目标：

- 验证 Android 端的文件、导出、导入、分享链路是否能通过平台桥接通

阶段完成标准：

- 本地保存链路可用
- PNG 导出链路可用
- 系统分享链路可用
- 参考底图导入能通过系统文件选择器完成

### Phase C：交互与首发边界验证

目标：

- 明确 Android 首版到底交付哪些能力，哪些延后

阶段完成标准：

- 触控编辑核心路径可用
- 横竖屏、平板、常见分辨率下不出现主链路级阻塞
- Android 首发不做的能力被明确写入验收标准

### 4.1 Phase Gating 规则

Android 三个阶段不是建议顺序，而是默认的关闭门槛顺序。

#### Phase A -> Phase B

只有同时满足以下条件，才允许进入 Phase B：

- 已有 Android 技术路线验证记录
- Android 初始化、运行、基础页面进入已完成验证
- 当前技术路线没有被判定为不可继续
- 本轮验证结论已经写入 `docs/DocsReview/`

#### Phase B -> Phase C

只有同时满足以下条件，才允许进入 Phase C：

- 平台桥关键路径已经至少跑通一轮
- PNG 导出 / 系统分享 / 系统文件选择器 / 素材导入主路径已有验证记录
- Android 第一阶段验收边界已冻结到 `android-acceptance-standard.md`
- 设备兼容矩阵与设备验证计划已存在且可执行

#### Phase C -> 宣称 Android 第一阶段完成

只有同时满足以下条件，才允许对外或对内宣称 Android 第一阶段完成：

- `android-acceptance-standard.md` 中的第一阶段完成条件已通过
- `android-device-compatibility-matrix.md` 中的 P0 设备等级要求已通过
- 至少完成一轮 P1 风险观察
- 已知限制已写入验证记录或审查记录

#### 范围收窄规则

如果某项 Android 第一阶段能力需要临时降级或延后：

- 必须先更新 `android-packaging-plan.md`
- 必须同步更新 `android-acceptance-standard.md`
- 必要时同步更新接口规范、设备矩阵与开发指导
- 然后才能在审查记录或验证结论中写“本轮不纳入”

## 5. 核心原则

Android 打包前开发必须遵守以下原则：

1. 单一业务源码不变
2. Android 只新增壳层和平台适配，不复制业务层
3. 先验证平台可行性，再做触控深度优化
4. 不因为 Android 打包而破坏当前 Windows / Web 主链路
5. Android 首版优先闭环，不追求与 Windows 全量能力完全对齐

一句话原则：

- `Android 是现有本地战术板的新增运行平台，不是第二个独立产品。`

## 6. 当前代码基线判断

### 6.1 可直接复用的部分

当前可以优先复用的层：

- `tactics-canvas-24/src/pages/`
- `tactics-canvas-24/src/components/tactics/`
- `tactics-canvas-24/src/data/`
- `tactics-canvas-24/src/hooks/`
- `tactics-canvas-24/src/lib/tactics-export.ts`
- 已存在的平台桥抽象入口

### 6.2 高风险区域

Android 开发前必须重点评估这些部分：

- 触控下的编辑器操作密度是否过高
- 当前画布交互是否严重依赖桌面鼠标行为
- 当前导出链路是否默认假设桌面文件保存
- 当前导入链路是否默认假设浏览器 `File` 或桌面文件系统
- 当前布局是否对窄屏和横竖屏切换不稳定

### 6.3 当前不建议先动的区域

在 Android 正式路线确认前，不建议先做大改：

- 编辑器核心状态重构
- 对象模型重构
- 页面结构大改
- 为 Android 复制第二套 UI 页面

原因：

- 这些改动会把“平台验证问题”和“业务逻辑重构问题”绑死在一起
- 一旦 Android 技术路线后来调整，前面的业务重构很可能白做

## 7. 技术路线前置判断

### 7.1 当前建议路线

当前预开发阶段建议先验证：

- `Tauri 2 + React + Vite + 现有平台桥` 作为 Android 路线是否可成立

预开发阶段需要回答的问题：

- Android 项目初始化是否稳定
- Android 运行时是否能稳定承载当前前端页面
- 当前平台桥是否足以扩展到 Android
- 哪些桥需要拆分成 Android 专项实现
- Android 首版导出产物应优先走本地保存还是系统分享

### 7.2 当前不直接定死的内容

在预开发阶段，不建议现在就把以下内容写成既定事实：

- 一定首发上应用商店
- 一定同步支持 APK 与 AAB 双分发
- 一定支持 Android 端 GIF 导出
- 一定支持项目文件导入导出
- 一定首版完成平板与手机所有交互打磨

这些都应该在技术验证后再定。

### 7.3 当前已冻结的 Android 分发与版本边界

当前已经由顶层产品 / 需求文档冻结的 Android 第一阶段承诺包括：

- 首发以 GitHub Releases 下载 APK 为主
- 首发采用手动安装与手动更新
- 当前目标支持 Android 10 及以上
- PNG 导出与系统分享是 Android 第一阶段重点闭环
- Android 端首版不强制承诺 GIF 导出

这些承诺在 Android 专项文档中应视为当前产品边界，而不是可自由改动的实现建议。

如果后续 Android 技术路线验证发现这些承诺需要调整：

- 必须先更新顶层产品 / 需求文档
- 再更新 Android 专项文档
- 然后才能修改对外结论

### 7.4 当前必须显式记录的构建 / 工具链约束

在 Android 第一阶段真正开始实施前，至少要明确记录这些约束：

- Android 开发工具链前置（Android Studio / SDK / NDK / Rust targets）
- 当前实际采用的 Android 最低版本边界
- 当前实际采用的打包输出物（APK / AAB）
- 当前调试与发布构建路径的差异
- 当前构建环境是否存在平台级限制或额外风险

当前阶段不要求在本文件里写死所有具体版本号，但要求：

- 每一轮技术验证都必须明确写出实际环境
- 如果工具链前置未满足，不得把“无法构建”误判成业务实现失败
- 如果实际输出物与顶层分发承诺不一致，必须先更新文档再宣称阶段完成

## 8. Android 端平台能力拆分

为了与当前 Windows 路线保持一致，Android 端也应沿用“壳层 + 平台桥 + 业务层”的结构。

### 8.1 壳层职责

Android 壳层只负责：

- 承载应用运行容器
- 提供 Android 平台生命周期入口
- 提供原生文件 / 分享 / 权限 / 存储相关能力入口

Android 壳层不负责：

- 重写业务逻辑
- 重写编辑器状态
- 复制前端页面

### 8.2 平台桥职责

Android 平台桥只负责：

- 平台识别
- 文件选择
- 文件保存 / 导出落地策略
- 系统分享
- 原生路径或返回结果到前端统一输入结构的转换

Android 平台桥不负责：

- 注入 Android 专属业务规则
- 在组件外维护第二套移动端状态
- 偷偷绕过现有业务模型直接操作编辑器内部数据

### 8.3 第一批建议复用 / 扩展的桥

- `src/lib/platform.ts`
- `src/lib/file-access.ts`
- `src/lib/export-save.ts`
- `src/lib/asset-import.ts`

Android 预开发阶段要先回答：

- 哪些桥可以保持统一接口，仅增加 Android 分支
- 哪些桥需要拆出 Android 专用语义（例如系统分享）

## 9. Android 首版关键能力判断

### 9.1 应优先保证的能力

Android 第一阶段建议优先保证：

- 启动进入工作台
- 打开项目
- 新建项目
- 核心对象编辑
- 步骤切换与播放
- 本地自动保存
- PNG 导出
- 系统分享图片
- 参考底图导入

### 9.2 可以晚于 Windows 的能力

Android 第一阶段可以晚于 Windows 的能力：

- GIF 导出
- 复杂批量操作
- 重型快捷键体系
- 复杂图层 / 分组管理
- 高级桌面效率操作

### 9.3 不能模糊的能力边界

必须在 Android 验收前明确：

- 导出默认是“保存到文件”还是“优先系统分享”
- 素材导入是否只允许系统文件选择器
- 本地项目保存位置是否允许跨安装升级保留
- 卸载、清理数据、切换设备后本地数据风险如何提示

## 10. 开发前必须完成的验证

在正式 Android 开发开始前，至少要完成以下验证结论。

### 10.1 技术验证

- 当前技术路线能否初始化 Android 壳层
- 当前前端是否能在 Android 运行时稳定启动
- 路由策略是否需要针对 Android 调整
- 当前前端构建产物是否能稳定交给 Android 壳层加载

### 10.2 桥接验证

- 文件选择器能力如何接入
- 图片导出最终是落文件还是走分享
- 参考底图导入链路是否能转成前端可继续消费的统一结构

### 10.3 交互验证

- 编辑器核心触控链路是否可用
- 常见按钮尺寸和布局是否满足移动端点击范围
- 关键浮层 / 抽屉 / 面板在窄屏上是否还能完成主流程

### 10.4 生命周期与数据验证

- 应用切后台再回来是否丢当前编辑上下文
- 横竖屏切换是否破坏编辑状态
- Android 本地数据是否会因为升级或签名变化出现误判风险

## 11. 风险清单

Android 打包前必须正视这些风险：

### 11.1 路线风险

- 移动端运行环境与 Windows 桌面运行环境不完全一致
- Android 打包并不等于 Android 可用，真正难点在交互和生命周期

### 11.2 权限风险

- Android 端文件导入导出很容易在权限和路径语义上与桌面端完全不同
- 如果平台桥语义不统一，组件层会被迫感知平台差异

### 11.3 交互风险

- 当前编辑器很多能力默认更偏桌面操作密度
- 若不先定义 Android 首版能力边界，很容易在第一轮就追求“桌面完全等价”而失控

### 11.4 文档风险

- 顶层产品文档仍然把 Android 作为首发平台之一
- 如果 Android 实现节奏明显落后，但文档口径不收敛，会造成需求与工程现实错位

## 12. 推荐实施顺序

Android 不建议直接开工写实现，建议按下面顺序推进。

1. 完成 Android 打包前开发方案文档
2. 完成技术路线可行性验证记录
3. 明确 Android 第一阶段能力边界
4. 补 Android 专项验收标准
5. 再开始 Android 壳层接入与平台桥扩展

不建议的顺序：

1. 先写 Android 壳层
2. 遇到问题再回头补方案
3. 同时改交互、改导出、改存储、改分发

原因：

- 这样会让每个问题都同时涉及架构、平台、交互和验收，几乎无法稳定推进

## 13. 文档配套建议

当前已经新增：

- `docs/android-packaging/README.md`
- `docs/android-packaging/android-technical-architecture.md`
- `docs/android-packaging/android-internal-interface-spec.md`
- `docs/android-packaging/android-acceptance-standard.md`
- `docs/android-packaging/android-device-compatibility-matrix.md`
- `docs/android-packaging/android-device-validation-plan.md`
- `docs/android-packaging/android-development-guide.md`

后续建议继续补齐：

- Android DocsReview 审查记录

文档关系建议与 Windows 保持同一模式：

- `05-engineering/android-packaging-plan.md` 负责总路线
- `android-packaging/` 负责 Android 专项设计、接口、验收和开发指导

推荐阅读顺序：

1. `docs/05-engineering/android-packaging-plan.md`
2. `docs/android-packaging/android-technical-architecture.md`
3. `docs/android-packaging/android-internal-interface-spec.md`
4. `docs/android-packaging/android-device-compatibility-matrix.md`
5. `docs/android-packaging/android-device-validation-plan.md`
6. `docs/android-packaging/android-acceptance-standard.md`
7. `docs/android-packaging/android-development-guide.md`

## 14. 当前结论

当前最合理的结论不是“马上开写 Android”，而是：

- Android 已经在产品和工程文档中被定义为明确目标平台
- 当前 Windows 第一阶段已经为 Android 预留了平台桥基础
- 当前最缺的不是实现热情，而是一份能约束后续开发范围的 Android 打包前开发方案

因此下一步应该是：

- `先固定 Android 预开发方案`
- `再做技术验证`
- `最后才进入正式编码`

这能最大程度避免：

- 平台分叉
- 业务源码复制
- Android / Windows 行为漂移
- 一开始就把范围做爆
