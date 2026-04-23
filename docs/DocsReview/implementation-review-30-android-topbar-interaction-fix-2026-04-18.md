# implementation-review-30-android-topbar-interaction-fix-2026-04-18

## Scope

Investigate and reduce the Android-specific issue where the entire top editor row was visible but appeared non-interactive in the emulator.

Affected surface:

- field format selector
- field view selector
- save button
- export button

## Context

Branch:

- `develop-android-packaging`

Related docs:

- `docs/android-packaging/android-phase1-slice-plan.md`
- `docs/DocsReview/implementation-review-android-phase1-slice2-mainflow-touch-2026-04-18.md`
- `docs/DocsReview/implementation-review-android-phase1-slice3-export-share-2026-04-18.md`

## Problem Statement

On Android emulator, the entire top editor strip was visible but manual taps produced no observable response.

This affected the whole strip together, which strongly suggested a shared interaction blocker rather than a single broken handler.

## Investigation Summary

### Code-level signals

- `MobileTopBar.tsx` originally relied on `onClick` only for return/save/export actions.
- `TacticsEditor.tsx` renders `MobileTopBar` above the canvas in a flex column, so the issue was unlikely to be caused by ordinary editor-state wiring alone.
- `PitchCanvas.tsx` contains overlays, but they live inside the canvas area and are clipped below the top bar in layout terms.

### Android shell signal

- Generated Android `MainActivity.kt` enabled `enableEdgeToEdge()`.
- After removing `enableEdgeToEdge()`, the Android UI dump showed both `android:id/content` and `android.webkit.WebView` starting at `y=136`, rather than `y=0`.
- This is strong evidence that the top strip had previously been too close to or inside the system-bar hit region.

### Device-side evidence

- Android dev smoke still starts successfully after the fix.
- ADB/UIAutomator evidence confirms the app remains interactive and the WebView is rendered below the system bar.
- Manual proof that the native share sheet definitely opens is still missing.

## Fixes Applied

### 1. Mobile touch fallback

Updated:

- `tactics-canvas-24/src/components/tactics/MobileTopBar.tsx`

Changes:

- added `onTouchEnd` fallback for:
  - return button
  - save button
  - export button
- added `touch-manipulation` on those buttons

Purpose:

- reduce Android WebView tap-delivery fragility

### 2. Safe-area / top-hit-area mitigation

Updated:

- `tactics-canvas-24/src/components/tactics/MobileTopBar.tsx`
- `tactics-canvas-24/src/index.css`
- generated Android `src-tauri/gen/android/app/src/main/java/com/kevinrunzhi/tacticboard/MainActivity.kt`

Changes:

- mobile top bar now uses `safe-top`
- top bar z-index raised to keep it above app content
- Android `enableEdgeToEdge()` removed from generated `MainActivity.kt`

Purpose:

- move the WebView content below the Android system bar hit zone
- reduce the chance that the top row is visible but untappable because of native/system overlap

## Validation

### Focused tests

- `src/test/mobile-topbar-touch.test.tsx` ✅
- `src/test/mobile-mainflow-baseline.test.tsx` ✅
- `src/test/platform-router.test.tsx` ✅
- `src/test/export-save.test.ts` ✅
- `src/test/file-access.test.ts` ✅

### Shared validation

- `npm run lint` ✅
- `npm run build` ✅
- `npm run test` ✅

Current full suite state:

- 34 test files
- 84 tests
- all passing

### Android smoke

- `npx tauri android dev` ✅
- app installs and starts on `Pixel_7` emulator ✅
- process exists via `adb shell pidof com.kevinrunzhi.tacticboard` ✅

### Structural device-side evidence

- Current UI dump shows app content beginning below the Android system bar (`y=136`), supporting the hypothesis that the previous hit-area overlap has been reduced.

## Remaining Risks

1. We still do not have hard manual evidence that tapping `导出项目` opens the Android native share sheet.
2. The safe-area / edge-to-edge fix is currently applied in generated Android code, so future regeneration must preserve or re-apply it unless the upstream cause is fixed another way.
3. Real-device validation is still missing; current confirmation is emulator-only.

## Conclusion

This round did not fully prove that every top-row interaction is fixed on-device, but it did:

- identify a shared structural cause with high confidence
- apply the lowest-risk code and shell mitigations
- prove that the app still builds, tests, and starts cleanly afterward

Current judgment:

- the fix direction is correct
- the bug is significantly reduced at the structural level
- one final device-side manual interaction proof is still needed before declaring the issue fully closed
