# Android Slice 6 P0 Tablet Share Return Fix - 2026-04-23

## Scope

- 本轮性质：Slice 6 收口推进
- 变更规模分类：medium
- 当前关注：
  - 修复 `HUAWEI TGR-W10` 安装态 APK 上“系统分享面板返回后落回工作台”的阻塞
  - 在同一台 P0 平板上完成修复后的安装态真机复验
  - 把平板阻塞从 Slice 6 的当前阻塞项里移除，并写回源文档

## Context

关联 source of truth：
- `docs/android-packaging/android-phase1-realdevice-validation-status.md`
- `docs/android-packaging/slices/slice-6-device-tier-validation-regression-phase1-closure.md`
- `docs/android-packaging/android-phase1-slice-plan.md`
- `docs/android-packaging/android-acceptance-standard.md`
- `tactics-canvas-24/package.json`
- `tactics-canvas-24/src/App.tsx`
- `tactics-canvas-24/src/components/tactics/TacticsEditor.tsx`

本轮目标：
- 把 Android 系统分享返回路径稳定到原编辑器，而不是工作台
- 让这条修复建立在已提交范围可维护的前端 / Router / 平台桥逻辑上，而不是 generated / vendor 临时补丁
- 在同一轮里补齐自动化验证、APK 构建、平板安装态真机复验和文档回写

## Committed Scope vs Local-Only Experiments

- 本轮修复建立在共享应用层与 Router 守卫上，不依赖 `src-tauri/gen/**`、`vendor/**` 或 Android Studio 本地临时改动
- 当前结论建立在当前工作区代码与同一轮产出的 review / 源文档更新上
- 安装态平板复验使用的是当前工作区构建后的 universal release APK，再用本机 debug keystore 临时签名后安装
- 因此本轮平板结论应写成：
  - `当前工作区 + debug-signed release APK 的 P0 平板安装态修复与复验结果`
- 不应夸大写成：
  - `正式发布签名包已在 P0 平板完全验收通过`

## Touched Surfaces

- `tactics-canvas-24/src/App.tsx`
- `tactics-canvas-24/src/components/app/AndroidShareReturnGuard.tsx`
- `tactics-canvas-24/src/components/tactics/TacticsEditor.tsx`
- `tactics-canvas-24/src/lib/android-share-return.ts`
- `tactics-canvas-24/src/test/android-share-return.test.ts`
- `tactics-canvas-24/src/test/app-router-android.test.tsx`
- `docs/android-packaging/android-phase1-realdevice-validation-status.md`
- `docs/android-packaging/slices/slice-6-device-tier-validation-regression-phase1-closure.md`
- `docs/android-packaging/android-phase1-slice-plan.md`
- `docs/DocsReview/README.md`
- 证据目录：
  - `tactics-canvas-24/analysis/android-tablet-fulltest/`

## Findings

1. 之前的平板真机阻塞是真实存在的：在 `HUAWEI TGR-W10` 上，从华为系统分享面板返回后，应用会落回工作台，而不是原编辑器。
2. 根因不需要落到原生 generated 代码里修；共享应用层只要在 Android PNG 分享前记住当前编辑器路由，并在应用重新回到前台且当前路由退回 `/` 时恢复该编辑器路由，就能闭环。
3. 本轮修复后，`HUAWEI TGR-W10` 安装态 APK 上已经拿到新的硬证据：从华为系统分享面板按返回后，应用仍停留在原编辑器。
4. 因此当前最准确的 Slice 6 状态不再是“P0 平板仍有分享返回阻塞”，而是：
   - `P0 手机 + P0 平板主链路均已覆盖`
   - `当前剩余缺口是至少一轮 P1 风险观察`

## Fixes Applied

- 新增 `android-share-return` 状态模块，把 Android PNG 分享前的编辑器路由记入 `sessionStorage`，并带有过期时间与编辑器路径白名单
- 新增 `AndroidShareReturnGuard`，仅在 Android Tauri 下监听 `focus`、`pageshow`、`visibilitychange`，当应用因系统分享返回且当前路由掉回 `/` 时恢复到原编辑器
- 在 `TacticsEditor` 的 Android PNG 导出路径里接入“记住分享返回路由 / 在非 share 或失败分支清理标记”的闭环
- 新增自动化回归：
  - `src/test/android-share-return.test.ts`
  - `src/test/app-router-android.test.tsx` 中的分享返回恢复用例
- 把修复结果和新的平板硬证据写回 Android Slice 6 源文档

## Automated Commands Actually Run

- `cmd /c npx vitest run src/test/android-share-return.test.ts src/test/app-router-android.test.tsx`
- `cmd /c npm run build`
- `cmd /c npm run test`
- `cmd /c npm run lint`
- `git diff --check`
- `cmd /c npm run tauri:dev`
- `cmd /c npm run tauri:android:build`
- `E:\develop\SDK\build-tools\37.0.0\apksigner.bat sign --ks C:\Users\Kevin\.android\debug.keystore --ks-pass pass:android --ks-key-alias androiddebugkey --key-pass pass:android --out E:\code\Project\IDKN\tactics-canvas-24\src-tauri\gen\android\app\build\outputs\apk\universal\release\app-universal-release-debugsigned.apk E:\code\Project\IDKN\tactics-canvas-24\src-tauri\gen\android\app\build\outputs\apk\universal\release\app-universal-release-unsigned.apk`
- `adb -s 3GLUN24828G02727 install -r E:\code\Project\IDKN\tactics-canvas-24\src-tauri\gen\android\app\build\outputs\apk\universal\release\app-universal-release-debugsigned.apk`
- `adb -s 3GLUN24828G02727 shell monkey -p com.kevinrunzhi.tacticboard 1`
- 多轮 `adb -s 3GLUN24828G02727 shell uiautomator dump ...`
- 多轮 `adb -s 3GLUN24828G02727 exec-out screencap -p ...`

结果：
- 定向 Vitest 通过：`2` files / `7` tests
- 全量 `build / test / lint / git diff --check` 通过
- `npm run tauri:dev` smoke 通过
- `npm run tauri:android:build` 通过
- debug-signed release APK 安装到 `HUAWEI TGR-W10` 成功

## Manual Scenarios Actually Run

设备：
- `HUAWEI TGR-W10`
- `TGR-W10 / TGR-W20`
- `Android 12`
- `P0 平板`

本轮实际执行并留有现场证据的场景：
1. 启动安装态 APK 并进入工作台
2. 切到项目页
3. 打开正式项目 `U21 联赛 · 第三轮战术部署`
4. 确认编辑器打开且状态为 `本地已保存`
5. 点击 `导出项目`
6. 选择 `导出 PNG`
7. 确认华为系统分享面板拉起
8. 在系统分享面板按一次返回
9. 确认应用仍停留在原编辑器，而不是落回工作台

证据文件：
- `tactics-canvas-24/analysis/android-tablet-fulltest/29-editor-from-projects.png`
- `tactics-canvas-24/analysis/android-tablet-fulltest/29-editor-from-projects.xml`
- `tactics-canvas-24/analysis/android-tablet-fulltest/30-export-dialog.png`
- `tactics-canvas-24/analysis/android-tablet-fulltest/30-export-dialog.xml`
- `tactics-canvas-24/analysis/android-tablet-fulltest/31-share-sheet-after-export.png`
- `tactics-canvas-24/analysis/android-tablet-fulltest/31-share-sheet-after-export.xml`
- `tactics-canvas-24/analysis/android-tablet-fulltest/32-after-share-back.png`
- `tactics-canvas-24/analysis/android-tablet-fulltest/32-after-share-back.xml`

## Remaining Risks

- Slice 6 仍缺至少一轮 `P1` 设备风险观察
- 当前平板安装态结论基于 debug-signed release APK，不是正式发布签名包
- 这轮没有额外扩展到第二台平板或其他 ROM 平板

## Anything Still Unverified

- `P1` 设备风险观察
- 正式发布签名包在平板上的安装态验证
- 最终 `implementation-review-android-phase1-final-closure-YYYY-MM-DD.md`

## Decision

本轮结论：
- `HUAWEI TGR-W10` 上“系统分享面板返回后落回工作台”的阻塞已修复并复验通过
- 该阻塞可以从当前 Slice 6 阻塞项中移除
- Slice 6 仍未关闭，但剩余缺口已经收敛为：
  - `至少一轮 P1 风险观察`
