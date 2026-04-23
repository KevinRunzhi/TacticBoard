# Implementation Review 52 - Android Mobile Editor UX Correction (2026-04-22)

## Scope

- 根据产品澄清，修正移动端编辑器 3 个 UX 点：
  - 初始 `100%` 必须是物理上贴合可用宽度的真实基准，而不是把较小的 fit 比例只在文案上显示成 `100%`
  - 点击球员不再自动打开球员属性，恢复为手动进入属性抽屉
  - 主删除按钮移到 `基础信息` 整段下面，而不是插在基础信息字段中间

## Change Size Classification

- `medium`

## Touched Surfaces

- `tactics-canvas-24/src/components/tactics/PitchCanvas.tsx`
- `tactics-canvas-24/src/components/tactics/TacticsEditor.tsx`
- `tactics-canvas-24/src/components/tactics/RightPanel.tsx`
- `tactics-canvas-24/src/lib/pitch-viewport.ts`
- `tactics-canvas-24/src/test/pitch-canvas-initial-zoom.test.tsx`
- `tactics-canvas-24/src/test/pitch-viewport.test.ts`
- `tactics-canvas-24/src/test/mobile-mainflow-baseline.test.tsx`
- `tactics-canvas-24/src/test/right-panel-reference-import.test.tsx`
- `docs/android-packaging/slices/slice-2-touch-first-main-flow-baseline.md`

## Source Of Truth

- `docs/android-packaging/slices/slice-2-touch-first-main-flow-baseline.md`
- `docs/football-tactics-board-requirements.md`
- `tactics-canvas-24/package.json`
- `tactics-canvas-24/AGENTS.md`

## Findings

1. 上一轮把 `fit scale` 和用户缩放百分比分离后，虽然文案显示成了 `100%`，但球场实际仍保留缩小后的物理尺寸；这违背了“进入项目后直接贴边可编辑”的 UX 要求。
2. 自动弹出球员属性虽然提高了发现性，但这不是当前要的交互；用户要求恢复到手动进入属性抽屉。
3. 主删除按钮虽然被提到更靠前的位置，但插在 `基础信息` 字段中间，破坏了这一组字段的连续性。

## Fixes Applied

- `PitchCanvas` 改为：
  - 使用拟合尺寸决定 SVG 的实际渲染宽高
  - 用户缩放 `zoom` 只表示相对于该拟合基准的真实百分比
  - 去掉初始文案“伪 100%”方案
  - 默认 fit margin 改为 `0`，让球场在移动端贴齐可用宽度
- `TacticsEditor` 去掉移动端 / 平板端“选中球员即自动开属性”的逻辑，恢复为单纯更新选中状态
- `RightPanel` 将主删除按钮移动到 `基础信息` 整段之后、`显示信息` 段之前

## Automated Commands Actually Run

- `cmd /c npx vitest run src/test/pitch-canvas-initial-zoom.test.tsx`
- `cmd /c npx vitest run src/test/pitch-viewport.test.ts`
- `cmd /c npx vitest run src/test/mobile-mainflow-baseline.test.tsx`
- `cmd /c npx vitest run src/test/right-panel-reference-import.test.tsx`
- `cmd /c npm run build`
- `cmd /c npm run test`
- `cmd /c npm run lint`
- `git diff --check`
- `cmd /c npm run tauri:dev` smoke

## Manual Scenarios Actually Run

- Android 真机：`vivo X100s (V2359A)`，USB + `adb reverse tcp:8080 tcp:8080`
- 真机场景 1：
  - 打开 `U21 联赛 · 第三轮战术部署`
  - 读取 WebView DOM，确认缩放文案为 `100%`
  - 读取 SVG `getBoundingClientRect()`，确认 `left = 0`、`right ≈ viewport.width`，球场物理宽度贴齐两侧
- 真机场景 2：
  - 在编辑页点击球员区域
  - 读取 WebView DOM，确认没有自动出现 `.player-properties`

## Evidence

- 真机 DOM 结果：
  - `zoomLabel = 100%`
  - `svg rect.left = 0`
  - `svg rect.right ≈ visualViewport.width`
  - 球员点击后 `hasPlayerProperties = false`
- 自动化结构结果：
  - `删除球员` 在组件结构中位于 `位置 / 队伍` 行之后、`显示样式` 之前

## Remaining Risks

- 远程自动化输入链在真机上不够稳定，未拿到“选中球员后再手动打开属性抽屉”的同轮真机硬证据。
- 这轮没有重跑 Android release APK，只验证了开发态真机链路。

## Still Unverified

- Android release APK 的同场景手工验证
- 真机平板
- 多厂商 ROM 差异
