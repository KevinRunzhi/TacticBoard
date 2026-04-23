# Android Slice 6 P0 Tablet Real-Device Validation - 2026-04-22

## Scope

- 本轮性质：Slice 6 设备收口推进
- 变更规模分类：validation + docs-only
- 当前关注：
  - P0 平板安装态真机验证
  - 当前本地工作区 release APK 在平板上的可安装性与主链路表现
  - 把平板侧真实结论写回 Slice 6，而不是继续把“P0 平板未覆盖”和“P0 平板已通过”混在一起

## Context

关联 source of truth：

- `docs/android-packaging/android-phase1-realdevice-validation-status.md`
- `docs/android-packaging/slices/slice-6-device-tier-validation-regression-phase1-closure.md`
- `docs/android-packaging/android-phase1-slice-plan.md`
- `docs/android-packaging/android-device-compatibility-matrix.md`
- `docs/android-packaging/android-device-validation-plan.md`
- `docs/android-packaging/android-acceptance-standard.md`
- `tactics-canvas-24/package.json`

本轮目标：

- 在一台真实 P0 平板上执行安装态 Android 验证
- 覆盖启动、旧项目进入、导出分享、参考底图导入、生命周期、方向切换、保存回到继续编辑、项目页、设置页
- 明确平板侧是“已覆盖并通过”还是“已覆盖但仍有阻塞”

## Committed Scope vs Local-Only Experiments

- 本轮没有新增业务代码修复
- 本轮结论建立在当前本地工作区代码基础上，不是干净已提交 baseline
- Android 安装态验证使用的是当前本地工作区构建出来的 release APK
- 由于当前仓库直接产出的 universal release APK 是 unsigned，本轮为了继续真机安装态验证，使用本机 debug keystore 对 release APK 做了本地临时签名安装
- 因此本轮平板结论应写成：
  - `当前本地工作区 + 本地 debug-signed release APK 的 P0 平板安装态验证结果`
- 不应夸大写成：
  - `正式发布签名包已经在 P0 平板上验证通过`

## Device Inventory

- 设备：`HUAWEI TGR-W10`
- product / device：`TGR-W20 / HWTGR-L`
- 等级：`P0`
- Android：`12`
- 物理分辨率：`1840x2800`
- adb 序列号：`3GLUN24828G02727`

## Touched Surfaces

- `docs/android-packaging/android-phase1-realdevice-validation-status.md`
- `docs/android-packaging/slices/slice-6-device-tier-validation-regression-phase1-closure.md`
- `docs/android-packaging/android-phase1-slice-plan.md`
- `docs/DocsReview/README.md`
- 证据目录：
  - `tactics-canvas-24/analysis/android-tablet-fulltest/`

## Findings

1. P0 平板真机安装态验证已经完成，不再是“尚未覆盖”状态。
2. `HUAWEI TGR-W10` 上，以下链路已经拿到真机硬证据：
   - 冷启动进入工作台
   - 工作台 -> 继续最近项目 -> 旧项目进入编辑器
   - 导出设置打开
   - PNG 导出 -> 华为系统分享面板拉起
   - 参考底图 -> 系统选择器打开 -> 导入成功
   - Home -> 回前台恢复
   - 竖屏 / 横屏切换后上下文保留
   - 新建空白项目首次保存 -> 返回工作台 -> 再次继续编辑
   - 项目页打开
   - 设置页打开
3. 本轮同时暴露出一个明确阻塞：从华为系统分享面板返回后，应用回到了工作台，而不是原编辑器。
4. 因此当前最准确的 Slice 6 描述不是“P0 平板未覆盖”，也不是“P0 平板已通过”，而是：
   - `P0 平板已覆盖，但导出 / 系统分享返回编辑器链路存在真实阻塞`

## Fixes Applied

- 无代码修复
- 本轮做的是状态回写与证据收口

## Automated Commands Actually Run

- `cmd /c npm run tauri:android:build`
- `adb -s 3GLUN24828G02727 install -r E:\\code\\Project\\IDKN\\tactics-canvas-24\\src-tauri\\gen\\android\\app\\build\\outputs\\apk\\universal\\release\\app-universal-release-unsigned.apk`
- `E:\\develop\\SDK\\build-tools\\37.0.0\\apksigner.bat sign --ks C:\\Users\\Kevin\\.android\\debug.keystore --ks-pass pass:android --ks-key-alias androiddebugkey --key-pass pass:android --out E:\\code\\Project\\IDKN\\tactics-canvas-24\\src-tauri\\gen\\android\\app\\build\\outputs\\apk\\universal\\release\\app-universal-release-debugsigned.apk E:\\code\\Project\\IDKN\\tactics-canvas-24\\src-tauri\\gen\\android\\app\\build\\outputs\\apk\\universal\\release\\app-universal-release-unsigned.apk`
- `adb -s 3GLUN24828G02727 install -r E:\\code\\Project\\IDKN\\tactics-canvas-24\\src-tauri\\gen\\android\\app\\build\\outputs\\apk\\universal\\release\\app-universal-release-debugsigned.apk`
- `adb -s 3GLUN24828G02727 shell am force-stop com.kevinrunzhi.tacticboard`
- `adb -s 3GLUN24828G02727 shell am start -W -n com.kevinrunzhi.tacticboard/.MainActivity`
- `adb -s 3GLUN24828G02727 shell uiautomator dump ...`
- `adb -s 3GLUN24828G02727 exec-out screencap -p ...`
- `adb -s 3GLUN24828G02727 push ...`
- `adb -s 3GLUN24828G02727 shell monkey -p com.kevinrunzhi.tacticboard 1`
- `adb -s 3GLUN24828G02727 shell settings put system accelerometer_rotation ...`
- `adb -s 3GLUN24828G02727 shell settings put system user_rotation ...`

结果：

- `tauri:android:build` 通过，但默认只产出 unsigned release APK
- 直接安装 unsigned release APK 失败：`INSTALL_PARSE_FAILED_NO_CERTIFICATES`
- 使用本机 debug keystore 临时签名后，debug-signed release APK 安装成功
- 平板真机安装态验证可继续执行

## Manual Scenarios Actually Run

设备：

- `HUAWEI TGR-W10`
- `Android 12`
- `P0 平板`

本轮实际执行并留有截图 / UI 树证据的场景：

1. 冷启动进入工作台
2. 工作台 -> 继续最近项目 -> 旧项目进入编辑器
3. 导出设置打开
4. PNG 导出 -> 华为系统分享面板拉起
5. 从系统分享面板返回
6. 参考底图 -> 系统选择器打开 -> 导入成功
7. Home -> 回前台恢复
8. 竖屏 / 横屏切换后上下文保留
9. 新建空白项目首次保存
10. 返回工作台 -> 再次继续编辑
11. 项目页打开
12. 设置页打开

证据文件示例：

- `tactics-canvas-24/analysis/android-tablet-fulltest/01-cold-start-dashboard.png`
- `tactics-canvas-24/analysis/android-tablet-fulltest/02-open-recent-editor.png`
- `tactics-canvas-24/analysis/android-tablet-fulltest/04-share-sheet.png`
- `tactics-canvas-24/analysis/android-tablet-fulltest/05-back-from-share.png`
- `tactics-canvas-24/analysis/android-tablet-fulltest/08-reference-import-result.png`
- `tactics-canvas-24/analysis/android-tablet-fulltest/11-landscape-rotation-restored.png`
- `tactics-canvas-24/analysis/android-tablet-fulltest/15-reopen-via-continue-edit.png`
- `tactics-canvas-24/analysis/android-tablet-fulltest/16-projects-page.png`
- `tactics-canvas-24/analysis/android-tablet-fulltest/17-settings-page.png`

## Remaining Risks

- P0 平板当前存在导出 / 系统分享返回编辑器阻塞
- 至少一轮 P1 风险观察仍未完成
- 当前结论基于本地 debug-signed release APK，不是正式发布签名包

## Anything Still Unverified

- P1 设备风险观察
- 正式发布签名包在平板上的安装态验证
- 平板上的球员拖动 / 阵型切换 / 头像导入同轮安装态正向证据

## Decision

本轮结论：

- P0 平板真机已覆盖
- 但 P0 平板当前不能写成“通过”
- Slice 6 仍未达到退出条件

当前最准确的后续动作：

1. 回到对应切片修复“系统分享面板返回后落回工作台”的平板阻塞
2. 在同一台 `HUAWEI TGR-W10` 上复验导出 / 分享返回链路
3. 补至少一轮 P1 风险观察，再决定是否进入最终 closure review
