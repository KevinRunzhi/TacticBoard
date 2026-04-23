# Android Slice 6 P1 Phone Risk Observation - 2026-04-23

## Scope

- 本轮性质：Slice 6 收口推进
- 变更规模分类：validation + docs-only
- 当前关注：
  - 使用 `vivo X100s` 完成至少一轮 `P1` 风险观察
  - 判断深度定制 ROM / 激进后台管理设备上是否存在会阻塞 Android Phase 1 的差异
  - 把观察结论写回 Android 设备矩阵相关源文档

## Context

关联 source of truth：
- `docs/android-packaging/android-device-validation-plan.md`
- `docs/android-packaging/android-device-compatibility-matrix.md`
- `docs/android-packaging/android-phase1-realdevice-validation-status.md`
- `docs/android-packaging/slices/slice-6-device-tier-validation-regression-phase1-closure.md`
- `docs/android-packaging/android-phase1-slice-plan.md`
- `docs/android-packaging/android-acceptance-standard.md`
- `tactics-canvas-24/package.json`

本轮目标：
- 补齐 Slice 6 明确要求的“至少一轮 P1 风险观察”
- 观察 `vivo X100s` 这类深度定制 ROM / 厂商后台管理倾向设备上，启动、系统分享、回前台恢复是否出现 ROM 级阻塞差异
- 明确哪些结论有同轮设备侧证据，哪些仍只算支持性信息

## Committed Scope vs Local-Only Experiments

- 本轮没有新增业务代码修复
- 本轮设备结论建立在当前工作区已构建的 debug-signed release APK 上，不依赖 `src-tauri/gen/**`、`vendor/**` 或 Android Studio 本地临时补丁
- 本轮使用的 `P1` 观察载体是同一台 `vivo X100s`
  - 它仍是 `P0` 主流手机基线设备
  - 同时也承担本轮 `P1` 深度定制 ROM / 激进后台管理风险观察角色
- 这一点应写成：
  - `已完成一轮 P1 风险观察`
- 不应夸大写成：
  - `已覆盖多台 P1 设备或广泛 ROM 风险样本`

## Touched Surfaces

- `docs/android-packaging/android-phase1-realdevice-validation-status.md`
- `docs/android-packaging/slices/slice-6-device-tier-validation-regression-phase1-closure.md`
- `docs/android-packaging/android-phase1-slice-plan.md`
- `docs/DocsReview/README.md`
- 证据目录：
  - `tactics-canvas-24/analysis/android-p1-phone-observation/`

## Findings

1. `vivo X100s` 这一轮可以合理承担 `P1` 观察角色，因为它属于深度定制 ROM 手机，且文档并未禁止同一物理设备在已有 `P0` 基线外再承担 `P1` 风险观察。
2. 当前工作区构建出的安装态 debug-signed release APK 在该设备上未观察到阻塞级 ROM 差异：
   - 冷启动可正常完成
   - 应用内可进入 `导出设置`
   - PNG 导出后命中标准 Android `com.android.intentresolver` 分享面板
   - `Home -> 再次拉回前台` 时本轮拿到 `HOT` 返回，而不是立即被系统杀死后重新冷启动
3. 这一轮也观察到设备 / 工具层差异，但它更像验证工具适配问题，不是产品阻塞：
   - `WebView CDP` 在该 vivo 设备上不稳定，`/json/list` 无法稳定返回
   - 因此同轮证据采集切换到 `uiautomator dump` 和系统 XML，而不是继续依赖 CDP
4. 本轮没有重新采集 `P1` 文件选择器的同轮硬证据；文件选择器 / 参考底图导入在这台手机上的“可用”结论，仍主要由 `2026-04-22` 用户手工真机确认提供支持。
5. 因此当前最准确的 Slice 6 结论应收紧为：
   - `P0 手机 + P0 平板 + 至少一轮 P1 观察` 已具备
   - `当前剩余不是设备矩阵缺口，而是最终统一收口文档`

## Fixes Applied

- 无代码修复
- 本轮做的是 P1 风险观察、证据留痕和源文档回写

## Automated Commands Actually Run

- `adb devices -l`
- `adb -s 10AE5T0861000YC shell getprop ro.product.model`
- `adb -s 10AE5T0861000YC shell getprop ro.build.version.release`
- `adb -s 10AE5T0861000YC shell getprop ro.build.display.id`
- `adb -s 10AE5T0861000YC install -r E:\code\Project\IDKN\tactics-canvas-24\src-tauri\gen\android\app\build\outputs\apk\universal\release\app-universal-release-debugsigned.apk`
- `adb -s 10AE5T0861000YC shell am force-stop com.kevinrunzhi.tacticboard`
- `adb -s 10AE5T0861000YC shell am start -W -n com.kevinrunzhi.tacticboard/.MainActivity`
- `adb shell cat /proc/net/unix | Select-String 'webview_devtools_remote'`
- `adb forward tcp:9222 localabstract:webview_devtools_remote_27374`
- `Invoke-WebRequest http://127.0.0.1:9222/json/list`
- 多轮 `adb -s 10AE5T0861000YC shell uiautomator dump ...`
- `adb -s 10AE5T0861000YC shell input keyevent KEYCODE_HOME`
- `adb -s 10AE5T0861000YC shell am start -W -n com.kevinrunzhi.tacticboard/.MainActivity`

结果：
- 设备识别到 `V2359A / PD2309`
- Android 版本为 `16 / SDK 36`
- ROM 标识为 `PD2359C_A_16.2.10.1.W10`
- 安装态 debug-signed release APK 可重新安装
- 冷启动成功，命令输出为 `LaunchState: COLD`
- 同轮 `Home -> am start -W` 返回为 `LaunchState: HOT`
- `WebView CDP` 在该设备上未能稳定返回 `/json/list`

## Manual Scenarios Actually Run

设备：
- `vivo X100s`
- `V2359A / PD2309`
- `Android 16 / SDK 36`
- `P1 观察角色：深度定制 ROM / 激进后台管理倾向设备`

本轮实际执行并留有现场证据的场景：

1. 重新安装当前 debug-signed release APK
2. 冷启动进入应用
3. 进入编辑器并命中 `导出设置`
4. 触发 `导出 PNG`
5. 观察系统分享面板是否为标准 Android `intentresolver`
6. 按 `Home` 退到后台
7. 再次拉回应用，观察是否发生立即冷启动或明显状态丢失

证据文件：
- `tactics-canvas-24/analysis/android-p1-phone-observation/03-after-export-attempt.xml`
- `tactics-canvas-24/analysis/android-p1-phone-observation/04-share.xml`
- `tactics-canvas-24/analysis/android-p1-phone-observation/01-home.xml`

## Remaining Risks

- 本轮 `P1` 观察使用的是同一台 `vivo X100s`，不等于已经覆盖第二台独立 ROM 风险设备
- 本轮 `P1` 文件选择器没有新增同轮硬证据，仍主要由前一轮用户手工确认支撑
- `WebView CDP` 在该设备上不稳定，后续如果要继续做深度 DOM 级观察，仍需准备 `uiautomator` / 截图兜底路径

## Anything Still Unverified

- 第二台 `P1` 设备的风险样本
- `P1` 设备上的同轮文件选择器硬证据
- 基于干净已提交基线的最终 `Android Phase 1` 收口文档

## Decision

本轮结论：
- `vivo X100s` 已完成至少一轮 `P1` 风险观察
- 当前没有观察到会阻塞 Android Phase 1 的 ROM 级差异，尤其是：
  - 冷启动
  - 系统分享
  - 后台 / 前台热返回
- Slice 6 的设备矩阵缺口已不再是“缺 P1 观察”，而是：
  - `还未写最终统一收口 DocsReview`
