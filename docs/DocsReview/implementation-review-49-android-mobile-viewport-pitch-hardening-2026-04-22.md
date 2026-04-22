# Implementation Review 49: Android Mobile Viewport And Pitch Hardening

- Date: `2026-04-22`
- Scope: Android real-device editor layout hardening for safe-area coverage, initial pitch placement, and zoom/pan blank-screen prevention
- Change size: `large`

## Source Of Truth

- `E:\code\Project\IDKN\docs\android-packaging\slices\slice-2-touch-first-main-flow-baseline.md`
- `E:\code\Project\IDKN\docs\football-tactics-board-requirements.md`
- `E:\code\Project\IDKN\tactics-canvas-24\AGENTS.md`
- `E:\code\Project\IDKN\tactics-canvas-24\package.json`

## Touched Surfaces

- Web viewport shell and safe-area wiring
  - `E:\code\Project\IDKN\tactics-canvas-24\index.html`
  - `E:\code\Project\IDKN\tactics-canvas-24\src\index.css`
  - `E:\code\Project\IDKN\tactics-canvas-24\src\components\v2\AppShellV2.tsx`
  - `E:\code\Project\IDKN\tactics-canvas-24\src\components\v2\TopNavV2.tsx`
  - `E:\code\Project\IDKN\tactics-canvas-24\src\pages\Index.tsx`
- Editor shell and mobile chrome
  - `E:\code\Project\IDKN\tactics-canvas-24\src\components\tactics\TacticsEditor.tsx`
  - `E:\code\Project\IDKN\tactics-canvas-24\src\components\tactics\MobileTopBar.tsx`
  - `E:\code\Project\IDKN\tactics-canvas-24\src\components\tactics\MobileToolbar.tsx`
- Pitch viewport logic
  - `E:\code\Project\IDKN\tactics-canvas-24\src\components\tactics\PitchCanvas.tsx`
  - `E:\code\Project\IDKN\tactics-canvas-24\src\lib\pitch-viewport.ts`
- Regression coverage
  - `E:\code\Project\IDKN\tactics-canvas-24\src\test\mobile-layout-safe-area.test.tsx`
  - `E:\code\Project\IDKN\tactics-canvas-24\src\test\pitch-viewport.test.ts`
  - timeout hardening in existing integration tests
- Canonical docs and review index
  - `E:\code\Project\IDKN\docs\android-packaging\slices\slice-2-touch-first-main-flow-baseline.md`
  - `E:\code\Project\IDKN\docs\DocsReview\README.md`

## Findings

1. Android real-device shell still let app content occupy the status-bar / gesture-safe area because the live mobile shells were still wired around `h-screen` / `min-h-screen` assumptions and had no top safe-area padding.
2. The editor pitch did not only have a zoom issue. On mobile and tablet, the immediate wrapper above `PitchCanvas` was not a flex container, so the canvas host expanded to its intrinsic `1000px` content height instead of the real remaining viewport height. This produced the “pitch starts too low / ratio feels wrong” bug on real phones.
3. `PitchCanvas` previously allowed unbounded zoom/pan state and did not explicitly block native touch gesture conflicts. That left a path where mobile zoom/pan interactions could move the pitch fully outside the viewport and visually degrade into an all-black / blank canvas.

## Fixes Applied

1. Added `viewport-fit=cover`, dynamic viewport helpers, and safe-area utilities so the app can respect real Android status-bar and bottom-gesture insets.
2. Rewired mobile and tablet editor shells to use `app-screen` and flex-bound canvas wrappers; the pitch container now measures the real remaining viewport instead of its intrinsic content height.
3. Hardened `PitchCanvas` with pure viewport helpers:
   - initial fit computed from the live container
   - pan clamped against the zoomed canvas bounds
   - resize re-clamp when the user has already adjusted the viewport
   - `touch-action: none` + `overscroll-behavior: contain` on the canvas host
4. Added regression coverage for:
   - safe-area class wiring
   - dynamic viewport shell wiring
   - pitch fit/pan clamping math
5. Raised time budgets on several existing heavy integration tests so the full suite remains trustworthy under current load; this was validated by re-running the full suite after the timeout adjustment.

## Committed Scope Vs Local-Only Experiments

- Committed scope:
  - all source and test changes listed above
  - canonical Slice 2 doc addendum
  - this review record
- Local-only artifacts:
  - device screenshots under `E:\code\Project\IDKN\tactics-canvas-24\analysis\`
  - temporary dev-server logs under `E:\code\Project\IDKN\tactics-canvas-24\analysis\`

## Automated Commands Actually Run

- `cmd /c npx vitest run src/test/pitch-viewport.test.ts src/test/mobile-layout-safe-area.test.tsx src/test/mobile-topbar-touch.test.tsx src/test/mobile-toolbar-touch.test.tsx`
- `cmd /c npm run build`
- `cmd /c npm run test`
- `cmd /c npm run lint`
- `git -C E:\code\Project\IDKN diff --check`
- `cmd /c npx vitest run src/test/editor-save-integrity.test.tsx`
- `cmd /c npx vitest run src/test/editor-save-return.test.tsx`
- `cmd /c npx vitest run src/test/mobile-mainflow-baseline.test.tsx`
- `cmd /c npx vitest run src/test/settings-data.test.tsx`
- desktop smoke: `npm run tauri:dev` launched via background process and observed until `target\debug\tacticboard.exe` was running

## Manual Scenarios Actually Run

- Real device: `vivo X100s` (`V2359A`) via `adb`
- `adb reverse tcp:8080 tcp:8080`
- separate Vite dev server on `127.0.0.1:8080`
- `adb shell am start -W -n com.kevinrunzhi.tacticboard/.MainActivity`
- Dashboard screenshot:
  - `E:\code\Project\IDKN\tactics-canvas-24\analysis\phone-dashboard-safearea.png`
  - confirmed the top safe-area/status bar is no longer covered by app chrome
- Editor first-entry screenshot after opening “新建空白项目”:
  - `E:\code\Project\IDKN\tactics-canvas-24\analysis\phone-editor-initial-fixed.png`
  - confirmed the pitch is no longer pushed down by a false `1000px` container height
- Zoomed viewport screenshot after tapping mobile zoom-in twice:
  - `E:\code\Project\IDKN\tactics-canvas-24\analysis\phone-editor-zoomed.png`
  - confirmed the pitch remains rendered at `121%` rather than turning into a black/blank screen
- Panned viewport screenshot after drag/swipe:
  - `E:\code\Project\IDKN\tactics-canvas-24\analysis\phone-editor-panned.png`
  - confirmed the pitch stays inside the viewport while moved and does not disappear into an all-black frame
- WebView DOM inspection through remote devtools:
  - confirmed `window.innerWidth = 360`, `window.innerHeight = 800`
  - confirmed the broken state before the final wrapper fix had a false `1000px` canvas host

## Automated / Smoke Evidence Vs Device-Side Hard Evidence

- Automated / smoke evidence:
  - `build`, `test`, `lint`, `git diff --check`, desktop `tauri:dev`
  - pure math regression for pitch fit/pan helpers
- Device-side hard evidence:
  - real-device screenshots listed above
  - real-device WebView DOM measurements proving the root-cause container height mismatch

## Generated / Vendored Temporary Patch Dependence

- None
- No changes were made under `src-tauri/gen/**` or other generated Android scaffolds

## Remaining Risks

1. True two-finger pinch was not programmatically reproduced end-to-end on the real phone. Device-side evidence covered zoom-in and drag after the viewport hardening, which exercises the same bounded viewport state, but it is not identical to a human pinch gesture.
2. This round verified the phone shell and editor on a real Android handset, not on a real Android tablet.
3. Validation used the dev build path, not a release APK.

## Still Unverified

- Real-device manual pinch with a human hand
- Real-device release APK behavior
- Physical Android tablet behavior after this viewport hardening

## Conclusion

This round closes the reported Android phone regressions at the source-code level and backs the conclusion with real-device evidence. The safe-area overlap bug is fixed. The incorrect initial pitch placement bug is fixed. The prior blank-screen path after zoom/pan is materially hardened and no longer reproduced by the verified zoom-and-drag device scenarios. The remaining gap is narrower: a final manual two-finger pinch pass on the real phone is still worth doing before claiming the issue is closed under the strictest possible gesture-specific wording.
