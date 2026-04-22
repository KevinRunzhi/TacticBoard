# Android Landscape Safe-Area Fix - 2026-04-22

## Scope

- 本轮性质：Android 真机问题修复 + 同轮安装态复验
- 变更规模分类：medium
- 关联 slice：
  - Slice 2：touch-first main-flow editor chrome
  - Slice 6：device-tier validation blocking issue

## Context

关联 source of truth：
- `docs/android-packaging/slices/slice-2-touch-first-main-flow-baseline.md`
- `docs/android-packaging/slices/slice-6-device-tier-validation-regression-phase1-closure.md`
- `docs/android-packaging/android-phase1-realdevice-validation-status.md`
- `docs/android-packaging/android-acceptance-standard.md`
- `tactics-canvas-24/src/components/tactics/TopToolbar.tsx`
- `tactics-canvas-24/src/index.css`
- `tactics-canvas-24/src/test/mobile-layout-safe-area.test.tsx`

本轮目标：
- 修复 `vivo X100s` 真机安装态 release APK 在 landscape editor 上出现的顶部编辑栏遮挡问题
- 把修复限制在 `phone landscape -> tablet breakpoint -> TopToolbar` 这条路径，不误动已正常的 `MobileTopBar`
- 在同轮 release APK + 真机路径下重新取得正向硬证据

## Committed Scope vs Local-Only Experiments

- 本轮验证基于当前本地工作区，不是干净已提交的 acceptance commit
- 修复位于已提交路径内的前端 UI / CSS，没有触碰 `src-tauri/gen/**` 或 vendor 临时补丁
- 本轮结论可以写成：
  - `当前本地工作区在 vivo X100s 安装态 release APK 上已修复 landscape top-toolbar safe-area`
- 但仍不能写成：
  - `Android Phase 1 已关闭`

## Touched Surfaces

- `tactics-canvas-24/src/components/tactics/TopToolbar.tsx`
- `tactics-canvas-24/src/index.css`
- `tactics-canvas-24/src/test/mobile-layout-safe-area.test.tsx`
- `docs/android-packaging/android-phase1-realdevice-validation-status.md`
- `docs/android-packaging/slices/slice-2-touch-first-main-flow-baseline.md`
- `docs/DocsReview/README.md`

## Findings

1. 当前真机 landscape editor 问题的根因不在 `MobileTopBar`，而在于 phone 横屏后跨过 mobile breakpoint，布局切换到 tablet 路径，由 `TopToolbar` 承接顶部壳层。
2. `TopToolbar` 原先是 `h-12 + px-3` 的固定高度容器，没有承接 Android landscape phone 在 safe-area / status-bar 叠加场景下的顶部补偿。
3. 只测 `MobileTopBar` 不足以锁住 Slice 2 editor chrome 的回归，需要单独对 `TopToolbar` 补齐 safe-area regression。

## Fixes Applied

- 把 `TopToolbar` 根容器替换成专用 `top-toolbar-shell`
- 在 `src/index.css` 为该壳层补齐：
  - 基础 `safe-area-inset-top / left / right`
  - `phone landscape + tablet breakpoint` 下的额外顶部补偿（`max-width: 1023px`、`max-height: 600px`、`pointer: coarse`、`orientation: landscape`）
- 在 `mobile-layout-safe-area.test.tsx` 补了 `TopToolbar` 壳层 class regression，避免以后只测 mobile 顶栏

## Automated Commands Actually Run

- `cmd /c npx vitest run src/test/mobile-layout-safe-area.test.tsx`
- `cmd /c npm run build`
- `cmd /c npm run test`
- `cmd /c npm run lint`
- `git diff --check`
- `cmd /c npm run tauri:dev`
- `cmd /c npm run tauri:android:build`
- `apksigner.bat sign --ks %USERPROFILE%\\.android\\debug.keystore ...`
- `adb install -r ...\\app-universal-release-debugsigned.apk`
- `adb shell am start -W -n com.kevinrunzhi.tacticboard/.MainActivity`

结果：
- `vitest` 定向回归通过
- `build` 通过
- `test` 通过：`47` files / `119` tests
- `lint` 通过，仅有 `7` 个既有 warning
- `git diff --check` 通过
- `tauri:dev` 第一次因 `8080` 被前一轮 Vite 占用而失败；清理残留 `node` 进程后重跑，通过 `vite` 监听 `8080` + `target\\debug\\tacticboard.exe` 进程存在确认 desktop smoke 成功
- `tauri:android:build` 通过，成功生成 `app-universal-release-unsigned.apk`
- 签名、安装、冷启动真机链路通过

## Manual Scenarios Actually Run

设备：
- `vivo X100s`
- `V2359A / PD2309`
- `Android 16 / SDK 36`

本轮真机安装态实际执行：

1. 冷启动应用 -> 工作台  
   证据：`analysis/android-fulltest/55-launch-home-after-fix.png`
2. 工作台 -> 继续最近项目 -> 进入编辑器  
   证据：`analysis/android-fulltest/56-open-recent-after-fix.png`
3. 编辑器 -> 切换横屏  
   证据：`analysis/android-fulltest/57-landscape-after-fix.png`  
   结论：顶部编辑栏已不再压进系统状态区，状态栏图标与应用控件之间已有明确间隔
4. 编辑器 -> 切回竖屏  
   证据：`analysis/android-fulltest/58-portrait-restored-after-fix.png`  
   结论：没有把竖屏 editor chrome 与现有布局带坏

## Remaining Risks

- Slice 6 仍未收口，因为安装态 release APK 上的三个关键交互仍缺同轮正向硬证据：
  - 球员拖动
  - 阵型切换
  - 参考底图导入
- 本轮只验证了 `vivo X100s` 这一台 P0 手机，没有覆盖平板或 P1 / P2 设备

## Anything Still Unverified

- release APK 下的球员拖动（人工手指同轮正向证据仍需补）
- release APK 下的阵型卡片应用
- release APK 下的参考底图导入
- 真机平板
- 正式发布签名包

## Decision

本轮结论：
- `landscape top-toolbar safe-area` 真机问题已有修复和安装态再验证硬证据
- 这项问题不再作为当前 Slice 6 阻塞项
- 但整个 Slice 6 仍未达到关闭条件
