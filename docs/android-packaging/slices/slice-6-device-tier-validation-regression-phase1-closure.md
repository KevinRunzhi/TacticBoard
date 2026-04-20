# Slice 6：Device-Tier Validation, Regression, and Phase-1 Closure

## 1. 切片目标

Slice 6 负责把前面各片的实现和证据收束成 Android Phase 1 的正式关闭结论。

这一片不是再做新功能，而是确认三件事：

- 当前提交范围下，Android APK 是否真的可交付到第一阶段目标线
- Web / Windows 是否没有被 Android 适配拖坏
- 设备等级覆盖、证据等级、未完成项是否写清楚

## 2. 当前代码现实（2026-04-19）

- 当前代码树没有正式的 Slice 6 收口记录
- `docs/android-packaging/android-device-compatibility-matrix.md` 与 `android-device-validation-plan.md` 已定义设备等级与验证计划
- `android-acceptance-standard.md` 已定义第一阶段通过标准
- 但这些规则还没有被一轮正式“按切片全部闭环后”的设备验证收束

## 3. 与 APK 打包链路的关系

Slice 6 是整条链路的最终出口：

```text
slice 0-5 committed implementation
    -> automated validation
    -> Android APK build
    -> device-tier validation
    -> Web / Windows regression
    -> final DocsReview and phase-1 conclusion
```

没有 Slice 6，就只有若干片段式成功，不能宣布 Android Phase 1 完成。

## 4. 前后端接口检查清单

### 4.1 共享前端与平台桥

必须重新确认：

- 组件层没有直接调用 `@tauri-apps/*`
- Android 分支仍然收口在 `src/lib/*`
- Slice 1 到 Slice 5 的接口语义没有互相打架

### 4.2 Tauri / 原生壳层

必须重新确认：

- `Cargo.toml`
- `src-tauri/src/lib.rs`
- `src-tauri/capabilities/default.json`
- `tauri.conf.json`

这些文件中的 Android 能力、配置和打包入口已经同步，不存在“代码用了能力但权限没开”或“文档写了命令但脚本不存在”的漂移。

### 4.3 设备与证据

必须重新确认：

- 哪些结论来自自动化测试
- 哪些结论来自模拟器 smoke
- 哪些结论来自设备侧硬证据

不能把这三类证据混写成同一个“已验证”。

## 5. 本切片不解决的问题

- 不扩展 Android 第一阶段范围
- 不为了闭环去硬塞第二阶段功能
- 不把“存在限制”偷换成“没有问题”

## 6. 开发闭环

建议按以下顺序执行：

1. 先核对 Slice 0 到 Slice 5 的关闭条件是否都以已提交实现为基础
2. 跑 Web 基线：`npm run build`、`npm run test`、`npm run lint`
3. 跑 Android 构建：`npx tauri android build --apk` 或当前仓库已提交脚本
4. 在设备等级计划上执行手动验证：
   - P0：必须完整
   - P1 / P2：按矩阵要求收集观察与阻塞结论
5. 做 Windows 回归观察，至少覆盖工作台、编辑器、保存、PNG / GIF 导出、参考图导入
6. 汇总未完成项、限制项和风险项
7. 写最终 `DocsReview`

## 7. 验收规则

### 7.1 进入条件

- Slice 0 到 Slice 5 已关闭
- 各片对应的 `DocsReview` 已存在

### 7.2 关闭条件

以下全部满足，Slice 6 才能关闭：

- 当前提交范围可以真实生成 APK
- APK 可以在目标设备等级上安装并启动
- Android 主链路、导出、导入、保存 / 恢复、生命周期已按验收标准验证
- Web / Windows 没有出现阻塞级回归
- 最终 `DocsReview` 明确区分：
  - 已提交实现
  - 自动化证据
  - 模拟器 smoke
  - 设备侧硬证据
  - 未完成项与非承诺范围

### 7.3 不算完成的情况

- 只有 APK 构建成功
- 只有模拟器 smoke，没有设备侧硬证据
- Android 看起来能用，但 Web / Windows 回归没做
- 每片各自有结论，但没有最终统一收口文件
- 仍在依赖 generated / vendor 临时补丁

### 7.4 建议留痕

- `implementation-review-android-phase1-final-closure-YYYY-MM-DD.md`
- 至少记录：
  - 使用的 commit 范围
  - APK 构建结果
  - 设备矩阵执行结果
  - Web / Windows 回归结果
  - 仍未关闭的风险

## 8. 关闭 Android Phase 1 前必须已经成立的事

- `android-acceptance-standard.md` 的通过标准已经被实际验证支撑
- `android-phase1-slice-plan.md` 中每片的共享规则都没有被违反
- `DocsReview` 已能追溯每片闭环和最终收口
- Android Phase 1 的完成声明不再依赖口头说明、单机记忆或未提交本地实验
