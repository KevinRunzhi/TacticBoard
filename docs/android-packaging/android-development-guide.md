# Android 打包开发指导

## 1. 文档目标

这份文档用于指导 Android 打包分支上的实际开发方式。

目标：

- 固定 Android 打包阶段的分支策略
- 固定“单一业务源码 + 平台壳层”的开发原则
- 明确允许改动的目录、禁止做法、验证顺序和合并规则
- 降低后续同时维护 Web、Windows、Android 时的分叉风险

## 2. 推荐分支策略

Android 打包阶段建议新建专用分支：

- `develop-android-packaging`

推荐基线：

- 从当前稳定且已经完成 Windows 第一阶段收口的开发主线拉出 `develop-android-packaging`

原因：

- Android 打包属于平台适配开发，不应直接污染稳定主线
- Android 端当前仍处在“先验证技术路线，再逐步接平台能力”的阶段
- 独立分支更方便回滚、对比和审查阶段性改动

### 2.1 长分支同步规则

`develop-android-packaging` 是一个中期开发分支，不应长期脱离当前主开发分支独自演化。

要求：

- 每完成一个实施阶段前，先同步一次最新主开发分支
- 如果主开发分支上有新的 Web 主链路修复，优先先合到 Android 分支再继续打包开发
- 如果 Windows 打包分支仍在继续演化，要优先同步已经验证稳定的平台桥改动，而不是在 Android 分支独自复制一套

原因：

- Android 打包本质上仍是“在现有本地 Web 应用上加移动端壳”
- 如果 Android 分支与 Web / Windows 基线漂移过远，后面会同时处理平台问题、业务回归问题和文档口径问题

## 3. 核心原则

Android 打包阶段必须遵守以下原则：

1. 业务源码保持单一来源
2. 平台差异只放在壳层和桥接层
3. 不为 Android 复制一份前端项目
4. 不以破坏 Web 版本或 Windows 版本为代价换取 Android 版本可运行
5. 先验证技术路线，再扩大触控与平台能力接入范围

一句话原则：

- `Web / Windows / Android 共用同一套前端业务代码，Android 只新增移动端壳层和平台适配。`

## 4. 单一源码原则

### 4.1 必须保留的单一业务源码

当前唯一业务源码目录仍然是：

- `tactics-canvas-24/src/`

这一层继续承载：

- 页面
- 编辑器组件
- 项目状态
- 本地保存逻辑
- 导出生成逻辑
- 测试

### 4.2 允许新增的平台壳层目录

Android 打包阶段允许新增：

- Android 壳层目录
- Android 平台工程目录
- `tactics-canvas-24/src/lib/platform.ts` 的 Android 分支
- `tactics-canvas-24/src/lib/file-access.ts` 的 Android 分支
- `tactics-canvas-24/src/lib/export-save.ts` 的 Android 分支
- `tactics-canvas-24/src/lib/asset-import.ts` 的 Android 分支

### 4.3 明确禁止

不允许新增：

- `tactics-canvas-24-android/`
- `src-mobile/`
- `src-android-ui/`
- 任何复制现有 `src/` 业务代码的平行目录

不允许把项目拆成：

- 一套 Web 业务代码
- 一套 Windows 业务代码
- 一套 Android 业务代码

原因：

- 后续每次修 bug、补功能、调交互都要改多遍
- 会迅速导致 Web、Windows、Android 三端行为漂移

## 5. 允许改动的代码层

Android 第一阶段优先允许改动：

- Android 平台工程目录
- Android 壳层配置文件
- `tactics-canvas-24/package.json`
- `tactics-canvas-24/vite.config.ts`
- `tactics-canvas-24/src/lib/platform.ts`
- `tactics-canvas-24/src/lib/file-access.ts`
- `tactics-canvas-24/src/lib/export-save.ts`
- `tactics-canvas-24/src/lib/asset-import.ts`
- `tactics-canvas-24/src/App.tsx`
- `tactics-canvas-24/src/main.tsx`
- 编辑器内与 Android 触控主链路直接相关的少量组件

Android 第一阶段尽量不要动：

- `tactics-canvas-24/src/hooks/useEditorState.ts`
- `tactics-canvas-24/src/types/tactics.ts`
- 页面树本身
- 与 Android 主链路无关的大规模 UI 重构

例外原则：

- 只有在 Android 运行验证被现有类型、主链路或交互硬阻塞时，才允许做最小修正
- 不允许借 Android 打包之机顺手重构编辑器核心状态或大改业务结构

### 5.1 平台桥职责边界

平台桥只负责：

- 平台识别
- 文件选择
- 文件保存
- 导出后的保存 / 分享分流
- 路由容器差异
- 原生结果到前端可消费输入结构的转换

平台桥不负责：

- 修改编辑器核心状态
- 重写对象模型
- 注入额外业务规则
- 在组件外偷偷维护第二套 Android 专用业务状态

原则：

- 平台桥是 I/O 与运行时适配层，不是第二业务层

## 6. 平台边界规则

### 6.1 Android 原生能力不得泄漏到业务层

不允许在这些位置直接使用 Android 原生调用或移动端壳层返回值：

- `src/components/**`
- `src/pages/**`
- `src/hooks/**`

Android 相关调用只能收口在：

- `src/lib/platform.ts`
- `src/lib/file-access.ts`
- `src/lib/export-save.ts`
- `src/lib/asset-import.ts`

### 6.2 组件层不直接处理路径、URI 和权限结果

组件层不应直接消费：

- 原生路径字符串
- 原生 URI
- 原生权限结果对象
- 系统分享原始返回值

组件层只消费平台桥提供的统一结果。

### 6.3 素材导入决策

Android 第一阶段已明确采用：

- `兼容 File 桥 + 本地复制规则`

即：

```text
Android 系统文件选择器
-> 读取素材
-> 复制到应用本地存储
-> 转成前端兼容 File
-> 继续走现有组件契约
```

第一阶段不做：

- 统一重写组件契约为资产对象模式
- 直接把 URI / 路径交给组件层

## 7. Router 规则

当前代码里：

- Web 使用浏览器路由策略
- Windows 已经有单独平台分支

Android 第一阶段要求：

- Router 选择必须继续集中在统一入口
- Android 端不允许在页面组件里散落路由特判
- Android 接入不得复制第二套页面树

不允许的做法：

- 直接在组件里写 Android 路由判断
- 为了 Android 先重写整套路由
- 在 Android 还没验证通过前，同时动路由、页面结构和平台桥

## 8. 存储与数据环境规则

必须明确区分：

1. 浏览器版本地数据
2. Windows 版本地数据
3. Android 运行环境本地数据

第一阶段规则：

- 不承诺三者自动互通
- 不承诺浏览器数据自动迁移到 Android
- 不承诺 Windows 数据自动迁移到 Android
- 不承诺跨设备迁移

因此开发时不要把：

- “Android 看不到浏览器旧数据”

误判成：

- “Android 打包把数据弄丢了”

### 8.1 应用标识与数据位置冻结规则

一旦开始接入 Android 壳层，就要尽早冻结这些信息：

- 应用标识
- 包名 / 产品标识
- 启动入口策略
- 本地数据位置策略

原因：

- 这些配置可能影响 Android 本地数据位置、运行环境标识和升级行为
- 如果在开发中途反复更改，最容易把“环境切换”误判成“存储损坏”

### 8.2 依赖与锁文件一致性规则

Android 打包接入通常会同时引入多套依赖面：

- Node / npm 依赖
- Android 平台工程依赖
- 可能存在的移动端壳层依赖

要求：

- `package.json` 的变更必须和对应锁文件一起提交
- Android 平台工程依赖变更必须与对应工程配置放在同一实施单元中
- 平台能力配置、依赖与桥接层改动尽量放在同一实施单元里提交

不允许的做法：

- 只改依赖，不更新锁文件
- 只改平台配置，不验证对应命令与运行路径
- 只接入平台工程，不同步记录对应能力边界

### 8.3 构建与平台最低线记录规则

Android 第一阶段开始真正实施前，必须尽早冻结并记录：

- 当前目标支持的 Android 最低版本边界
- 当前首发分发输出物（APK / AAB）
- 当前安装与更新方式
- 当前实际使用的 Android 工具链前置

当前阶段默认按顶层产品 / 需求文档执行：

- GitHub Releases 提供 Android APK
- Android 10 及以上作为当前目标边界
- 手动安装与手动更新作为当前首发方式

如果后续技术验证发现这些边界需要调整，必须先改文档，再改结论。

## 9. 开发顺序

建议固定按以下顺序推进：

1. 完成 Android 技术路线可行性验证
2. 接 Router 统一入口与平台识别边界
3. 接 PNG 导出与系统分享分流
4. 接系统文件选择器与素材导入
5. 补草稿恢复、生命周期与方向切换验证
6. 跑 Android 手动验收与 Web / Windows 回归

不建议的顺序：

- 同时改 Router、导出、素材导入、持久化、布局和生命周期

原因：

- 一旦同时改太多，很难定位问题来自哪一层

## 9.1 仓库与产物卫生规则

Android 打包开发会产生很多本地构建产物和缓存目录。

这些内容不应进入正式提交：

- 前端构建产物目录
- Android 平台构建输出目录
- 安装包或 APK / AAB 输出目录
- 本地调试日志
- 临时截图与录屏
- 分析目录和临时验证文件

要求：

- 在 `develop-android-packaging` 开始第一轮实现前，先确认 `.gitignore` 能覆盖这些目录
- 每次提交前都要检查一次工作树，避免把移动端构建产物误提交进仓库

原因：

- 这类文件体积大、变动频繁、不可 review
- 一旦混进分支，会明显降低后续合并质量

## 10. 每一步的验证要求

每完成一个阶段，至少跑：

```bash
npm run build
npm run test
npm run lint
```

涉及 Android 阶段，再补：

- 当轮 Android 初始化命令
- 当轮 Android 运行命令
- 当轮 Android 构建命令

验证规则：

- Web 验证必须先过，再进 Android 验证
- 不接受“Web 已坏，但 Android 先凑合能跑”
- Android 的系统分享、系统文件选择器、生命周期变化如果没有自动化覆盖，必须留下明确的手动验收记录
- “应用能安装 / 能启动”不等于 Android 第一阶段已完成

## 11. 手动回归重点

每一轮 Android 打包改动后，至少手动回归：

1. 工作台打开
2. 新建项目或打开项目
3. 进入编辑器
4. 完成至少一种核心对象编辑
5. 保存项目
6. 返回工作台或项目页
7. 再次打开项目
8. 导出 PNG
9. 进入系统分享
10. 导入球员头像或参考底图
11. 切后台再回前台
12. 横竖屏切换

同时必须补一轮 Web 回归：

1. 浏览器模式启动
2. 工作台 -> 编辑器 -> 保存 -> 返回
3. PNG 导出
4. 现有素材导入路径

同时必须至少观察一轮 Windows 基线：

1. 平台桥没有被 Android 分支污染
2. Windows 平台判断逻辑仍成立
3. 导出 / 导入边界没有被写回组件层

### 11.1 设备等级执行顺序

Android 设备验证建议固定按以下顺序推进：

1. 先跑 P0 设备
2. 再跑 P1 设备
3. 最后才看 P2 观察项

原因：

- P0 决定当前阶段能不能成立
- P1 负责暴露真实市场风险
- P2 只负责未来形态观察，不应倒逼第一阶段膨胀

### 11.2 设备兼容记录规则

如果某一轮 Android 验证涉及明确的设备兼容覆盖，除了技术验证记录外，建议额外产出：

- `docs/DocsReview/android-device-compatibility-validation-template.md`

至少要写清：

- 每台设备属于 P0 / P1 / P2 哪一类
- 每台设备实际跑了哪些场景
- 哪些是通过、失败、仅观察
- 是否影响 Android 第一阶段完成结论

## 12. 提交与合并建议

Android 打包分支建议按功能拆小提交：

1. `Android 技术路线验证`
2. `Router / 平台识别适配`
3. `PNG 导出与系统分享适配`
4. `素材导入适配`
5. `生命周期与方向切换验证`
6. `Android 构建与验收`

每一块都要：

- 单独可回滚
- 单独可验证
- 不混入无关 UI 重构

### 12.1 验证记录留痕规则

每完成一个实施单元，建议至少留一份简短记录到：

- `docs/DocsReview/`

记录内容至少包括：

- 改了什么
- 跑了哪些命令
- 手动验收走了哪些路径
- 当前剩余风险

涉及 Android 验证时，建议额外写清：

- 使用了什么设备或模拟器
- 是否只验证到“应用可启动 + 页面可打开”
- 是否实际执行了“PNG 导出 / 系统分享 / 素材导入 / 生命周期切换”
- 如果某一项没有执行，要明确写成“本轮未验证”，不要默认写成已通过

原因：

- Android 打包是跨平台改造，不适合只靠口头记忆回溯
- 后续合回主开发分支时，需要能快速说明每一段改动的验证证据

合并建议：

- 先在 `develop-android-packaging` 上做完整链路
- 验证稳定后，再合回主开发分支
- 不建议在 Android 实现未稳定前直接合进默认主分支

### 12.2 范围收窄治理规则

如果在实施过程中发现：

- Android 第一阶段某项能力本轮做不完
- 某条验收边界需要临时放宽
- 某类能力希望从“第一阶段默认承诺”降级为“后续再做”

必须先做的不是口头说明，而是先更新：

- `docs/05-engineering/android-packaging-plan.md`
- `docs/android-packaging/android-acceptance-standard.md`

必要时再同步更新：

- `docs/android-packaging/android-technical-architecture.md`
- `docs/android-packaging/android-internal-interface-spec.md`

然后才能：

- 在评审记录里写“本轮未纳入”
- 在对外结论里宣称当前阶段完成

不允许的做法：

- 先口头收窄范围，文档不改
- 先按缩小后的范围宣布完成，之后再补文档

原则：

- `完成标准以方案文档和验收文档为准，不以临时口头约定为准。`

## 13. 与现有 Web / Windows 的关系

当前这样做的目标之一，就是让 Android 能站在现有 Web / Windows 基线上继续演进，而不是另起炉灶。

如果遵守本文件的规则，后续 Android 可以：

- 继续复用 `tactics-canvas-24/src/` 业务代码
- 继续复用已经建立的平台桥边界
- 和 Windows 一起共享更稳定的跨平台约束

如果现在复制一份 Android 版业务代码，后面基本也会被迫单独维护，成本会迅速失控。

## 14. 当前结论

Android 打包开发阶段最重要的不是“尽快打出一个 APK”，而是：

- 在不复制业务源码的前提下，把 Android 的平台差异收口到最小范围

只要守住这一点，后续：

- Web 不会被拖坏
- Windows 不会被拖坏
- Android 才有可能稳定迭代
