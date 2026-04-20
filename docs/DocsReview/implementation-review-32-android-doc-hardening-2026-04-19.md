# implementation-review-32-android-doc-hardening-2026-04-19

## Scope

本轮只覆盖 Android 开发文档本身的审查与加固，不涉及 Android 代码实现。

目标：

- 对 Android 文档集做 3 轮交叉审查
- 把“文档优先级、切片退出、证据等级、提交卫生、generated/vendor 边界”写得更细、更硬
- 直接把结论写回源文档，而不是只停留在 review 记录

本轮涉及的源文档：

- `docs/05-engineering/android-packaging-plan.md`
- `docs/android-packaging/android-development-guide.md`
- `docs/android-packaging/android-acceptance-standard.md`
- `docs/android-packaging/android-phase1-slice-plan.md`

## Review Passes

### Pass 1: 文档分层与约束顺序

关注点：

- 哪份文档管总路线
- 哪份文档定义“通过 / 不通过”
- 哪份文档定义切片退出
- `DocsReview` 能不能反向改写基线

结论：

- 原文档集默认层次基本存在，但没有足够明确地写出优先级
- 执行者仍可能把 `DocsReview` 里的阶段性结论误当成源文档事实

### Pass 2: 可钻空子的执行规则

关注点：

- generated / vendor / 本地截图 / logcat / IDE 目录是否会被误当成正常源码或正常提交物
- 未提交本地实验能不能被误写成切片完成
- 系统分享、系统文件选择器、生命周期项是否会被“自动化已过”误判为“设备侧已通过”

结论：

- 原文档对验证和提交卫生有要求，但还不够硬
- 对 Android 系统集成项缺少“设备侧硬证据”这层明确门槛

### Pass 3: 切片退出与验收表述

关注点：

- Slice 3 / Slice 4 / Slice 5 / Slice 6 的退出条件是否足够明确
- “可启动”“可演示”“已验收”“阶段完成”是否容易混用

结论：

- 原文档里这些概念仍然容易被写混
- 需要把状态术语和证据等级显式冻结

## Findings

1. Android 文档集原本已经覆盖方案、实施、验收和切片四层，但优先级和冲突处理规则不够显式。
2. generated 目录、vendor 副本、未提交本地实验、截图日志等内容，原文档没有被统一写成“不能直接支撑切片关闭”的硬规则。
3. 系统分享、系统文件选择器、生命周期 / 方向切换这类 Android 系统集成项，原文档缺少“设备侧硬证据”这一条显式门槛。
4. Slice 3 之后的退出条件偏重“跑通过”，不够强调“证据级别”和“提交状态”。

## Fixes Applied

### 1. 总路线文档加固

更新：

- `docs/05-engineering/android-packaging-plan.md`

新增或收紧：

- Android 文档优先级
- Android 状态术语
- 阶段推进必须区分已提交改动与本地实验
- 系统集成项需要设备侧硬证据
- `DocsReview` 只能做证据，不反向覆盖基线

### 2. 开发指导文档加固

更新：

- `docs/android-packaging/android-development-guide.md`

新增或收紧：

- 文档使用优先级
- generated / vendor / 临时补丁规则
- 仓库与提交卫生的显式黑名单
- “应用能启动”与“系统集成已通过”的区分
- `DocsReview` 记录必须说明结论依赖的是已提交改动还是本地实验

### 3. 验收文档加固

更新：

- `docs/android-packaging/android-acceptance-standard.md`

新增或收紧：

- 验收术语与证据等级
- 系统分享的设备侧硬证据要求
- 系统文件选择器 / 本地复制的设备侧硬证据要求
- 未提交实验和 generated/vendor 临时补丁不能直接支撑阶段完成

### 4. 切片计划文档加固

更新：

- `docs/android-packaging/android-phase1-slice-plan.md`

新增或收紧：

- 切片共享的提交状态与证据等级规则
- generated / vendor 例外规则
- Slice 3 / Slice 4 / Slice 5 / Slice 6 的更硬退出条件

## Remaining Risks

1. 当前只是把规则写得更明确，不等于已经重新启动 Android 代码实施。
2. 仓库当前这条 Android 分支上仍存在一个本地未推送提交，需要后续单独整理其提交内容边界。
3. 如果后续 Android 重新开始实施，仍需要持续检查顶层产品文档与 Android 专项文档是否继续保持一致。

## Conclusion

这轮审查后的 Android 文档集，比原来更明确地回答了四件事：

- 哪份文档说了算
- 什么证据才算通过
- 哪些本地实验不能直接算完成
- 哪些切片不能只靠 generated / vendor 补丁关闭

当前判断：

- Android 文档基线已经明显更适合重新启动实施
- 后续如果再推进 Android 代码实现，应优先按这轮加固后的文档执行
