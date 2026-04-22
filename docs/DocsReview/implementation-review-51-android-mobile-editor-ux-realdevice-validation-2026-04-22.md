# Implementation Review 51 - Android Mobile Editor UX Real-Device Validation (2026-04-22)

## Scope

- 真机验证 2026-04-22 针对移动端编辑器 3 个最近补充的 UX 点：
  - 首次进入正式项目时缩放显示为 `100%`
  - 点击球员后自动打开球员属性
  - 删除球员入口位于位置字段上方且旧底部入口保持隐藏
- 在真机验证过程中同步修复一个发现的回归：上移后的主删除按钮文案在 Android WebView 中显示为乱码

## Change Size Classification

- `small` code fix + Android 真机验证回合

## Touched Surfaces

- `tactics-canvas-24/src/components/tactics/RightPanel.tsx`
- `docs/android-packaging/slices/slice-2-touch-first-main-flow-baseline.md`
- `docs/DocsReview/README.md`

## Source Of Truth

- `docs/android-packaging/slices/slice-2-touch-first-main-flow-baseline.md`
- `docs/football-tactics-board-requirements.md`
- `tactics-canvas-24/package.json`
- `tactics-canvas-24/AGENTS.md`

## Findings

1. 真机 `vivo X100s (V2359A)` 上，首次打开正式项目时缩放值已经显示为 `100%`，不再暴露之前的低百分比入口文案。
2. 真机点击球员后会自动打开 `球员属性` 抽屉，移动端不再需要再点一次底部 `属性`。
3. 主删除按钮确实已经位于 `位置` 字段上方，且旧的底部 `删除当前球员` 按钮在真机上是 `display: none`。
4. 本轮额外发现一个真实回归：上移后的主删除按钮文案在真机 WebView 中显示为乱码；这不是日志编码问题，而是前端字符串本身错误。

## Fixes Applied

- 将 `RightPanel.tsx` 中主删除按钮文案修正为 `删除球员`。

## Automated Commands Actually Run

- `cmd /c npx vitest run src/test/right-panel-reference-import.test.tsx`
- `cmd /c npm run build`
- `cmd /c npm run lint`
- `git diff --check`

## Manual Scenarios Actually Run

- 设备：`vivo X100s (V2359A)`，通过 USB + `adb` 连接
- 开发链路：
  - `adb reverse tcp:8080 tcp:8080`
  - Android WebView DevTools socket forward
  - 真机冷启动 `com.kevinrunzhi.tacticboard`
- 真实验证场景：
  - 从工作台进入 `U21 联赛 · 第三轮战术部署`
  - 确认编辑器首次进入时出现 `100%`
  - 在真机上点击球员 `张伟`，确认自动弹出 `球员属性`
  - 确认可见的主删除按钮文案为 `删除球员`
  - 确认主删除按钮位于 `位置` 字段上方
  - 确认旧的底部 `删除当前球员` 按钮仍留在 DOM 中，但计算样式为 `display: none`

## Evidence

- 真机截图：
  - `tactics-canvas-24/analysis/phone-player-properties-realdevice-fixed.png`
- Android WebView DOM / computed-style 结果：
  - 初始打开项目后 `document.body.innerText` 包含 `100%`
  - 点击球员后 `document.body.innerText` 包含 `球员属性`、`删除球员`、`位置`
  - `visibleDelete.bottom <= positionTop`
  - 隐藏底部按钮数量 `hiddenDeleteCount = 1`

## Remaining Risks

- 这轮只验证了真机开发态，不代表 release APK 已完成同等验证。
- 这轮聚焦 3 个 UX 点，没有顺带重跑 Slice 2 全链路保存 / 导出 / 导入。

## Still Unverified

- Android 真机平板
- Android release APK 手工验证
- 多 ROM / 多厂商设备差异
