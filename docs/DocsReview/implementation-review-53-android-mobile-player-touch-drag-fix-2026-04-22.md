# Implementation Review 53 - Android Mobile Player Touch Drag Fix (2026-04-22)

## Scope

- 修复 Android / mobile 编辑页里“球员可选中但无法自由拖动”的触摸交互 bug
- 补自动化回归和真机验证证据

## Change Size Classification

- `medium`

## Touched Surfaces

- `tactics-canvas-24/src/components/tactics/PitchCanvas.tsx`
- `tactics-canvas-24/src/test/pitch-canvas-touch-drag.test.tsx`
- `docs/android-packaging/slices/slice-2-touch-first-main-flow-baseline.md`
- `docs/DocsReview/README.md`

## Source Of Truth

- `docs/android-packaging/slices/slice-2-touch-first-main-flow-baseline.md`
- `docs/football-tactics-board-requirements.md`
- `tactics-canvas-24/package.json`
- `tactics-canvas-24/AGENTS.md`

## Findings

1. `PitchCanvas` 的球员 / 文本 / 区域 / 球对象只绑定了 `mouse` 入口，移动端单指按住对象时不会建立对象拖拽状态。
2. 容器层的 `touchmove` 只处理双指缩放和单指平移，因此真机上会出现“能选中球员，但拖不动球员”的结果。
3. 这个 bug 不只是球员，文本、区域和球在移动端也有同类风险；本轮一起把对象触摸拖拽入口补齐。

## Fixes Applied

- 为球员、文本、区域、球对象补充 `onTouchStart`
- 单指触摸命中对象后：
  - 建立对应的 dragging 状态
  - 阻止事件冒泡到容器层，避免被误判成画布平移
- 容器层 `handleTouchMove` 现在优先处理：
  - `draggingPlayer`
  - `draggingText`
  - `draggingArea`
  - `draggingBall`
  - 仅在没有对象拖拽时才回退到画布平移
- `handleTouchEnd` 现在会正确清理 dragging 状态并触发 `onEndPlayerMove`

## Automated Commands Actually Run

- `cmd /c npx vitest run src/test/pitch-canvas-touch-drag.test.tsx`
- `cmd /c npx vitest run src/test/mobile-mainflow-baseline.test.tsx`
- `cmd /c npx vitest run src/test/pitch-canvas-initial-zoom.test.tsx src/test/pitch-viewport.test.ts`
- `cmd /c npm run build`
- `cmd /c npm run test`
- `cmd /c npm run lint`
- `git diff --check`
- `cmd /c npm run tauri:dev` smoke

## Manual Scenarios Actually Run

- Android 真机：`vivo X100s (V2359A)`，USB + `adb reverse tcp:8080 tcp:8080`
- 场景：
  - 打开 `U21 联赛 · 第三轮战术部署`
  - 记录球员 `张伟` 的 SVG 坐标
  - 使用真机 `adb shell input touchscreen swipe 630 2138 860 1890 250`
  - 再次读取同一球员的 SVG 坐标

## Evidence

- 拖动前：
  - `cx = 340`
  - `cy = 886.4`
- 真机触摸拖动后：
  - `cx = 463.6665954589844`
  - `cy = 752.799072265625`
- 说明单指拖动已真实改变球员位置，而不是只触发选中或画布平移
- 真机截图：
  - `tactics-canvas-24/analysis/phone-player-drag-after-fix.png`

## Remaining Risks

- 这轮只验证了手机真机，没有补平板真机。
- 这轮没有单独对文本 / 区域 / 球对象逐一做真机拖动验证；这些对象主要通过代码路径一致性和自动化覆盖收口。

## Still Unverified

- Android release APK 手工拖动验证
- 真机平板
- 多 ROM / 多厂商差异
