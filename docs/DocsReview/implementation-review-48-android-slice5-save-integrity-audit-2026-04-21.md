# Implementation Review 48

## Scope

- Android Phase 1 Slice 5 three-round full validation and integrity audit
- Saved-project dirty-state correctness
- Save-failure contract closure across shared React state, storage bridge, and Android emulator runtime

## Change Size Classification

- Large

## Touched Surfaces

- `tactics-canvas-24/src/components/tactics/TacticsEditor.tsx`
- `tactics-canvas-24/src/hooks/useEditorState.ts`
- `tactics-canvas-24/src/lib/editor-persistence.ts`
- `tactics-canvas-24/src/test/editor-save-integrity.test.tsx`
- `docs/android-packaging/slices/slice-5-save-recovery-lifecycle-orientation-hardening.md`
- `docs/android-packaging/android-internal-interface-spec.md`
- `docs/android-packaging/android-phase1-slice-plan.md`
- `docs/DocsReview/README.md`

## Committed Scope vs Local-Only Experiments

- The save-integrity fixes in this round are in committed-source paths under `tactics-canvas-24/src/**`.
- The findings and conclusions do not depend on `src-tauri/gen/**`, `src-tauri/vendor/**`, or other generated-only edits.
- Emulator state, adb forwarding, WebView CDP scripts, and artifacts under `tactics-canvas-24/analysis/` are evidence only, not source of truth.

## Findings

1. The saved-project dirty-state contract was broken. `TacticsEditor.tsx` reinitialized the saved fingerprint baseline from the current editor fingerprint on later content changes, so a previously saved project could remain visually `saved` after edits.
2. The save-failure path was not closed. `useEditorState.ts` advanced the saved-project persistence baseline before `saveProjectState(...)` was known to succeed, and `TacticsEditor.tsx` treated the save path as infallible.
3. The risk was not theoretical. A targeted regression test failed before the fix, and the same contract could be exercised inside the Android tablet emulator runtime through an injected persistence failure.

## Fixes Applied

1. Added `src/lib/editor-persistence.ts` so `TacticsEditor.tsx` and `useEditorState.ts` share the same persistence fingerprint instead of drifting on separate field lists.
2. Stopped `TacticsEditor.tsx` from re-basing `lastSavedFingerprintRef` on every later content change. The saved baseline now initializes only from route-entry semantics and explicit successful saves.
3. Hardened `TacticsEditor.tsx` save handling with a guarded failure path:
   - restore the previous saved baseline
   - keep the editor in `unsaved` when appropriate
   - surface `保存失败，请稍后重试`
4. Moved the saved-project baseline update in `useEditorState.ts` to after `saveProjectState(...)` succeeds, so persistence failure cannot silently mark the project as saved.
5. Added `src/test/editor-save-integrity.test.tsx` to lock both regressions:
   - saved project becomes dirty when only `playerPlacementTeam` changes
   - save failure does not flip the editor to saved

## Automated Commands Actually Run

- Round 1 shared full validation
  - `cmd /c npm run build`
  - `cmd /c npm run test`
  - `cmd /c npm run lint`
  - `git -C E:\code\Project\IDKN diff --check`
- Round 2 packaging / runtime validation
  - `cmd /c npm run tauri:build`
  - Desktop `cmd /c npm run tauri:dev` smoke
  - `cmd /c npm run tauri:android:build` (attempted during the audit round, but the command timed out before a clean success/failure conclusion could be captured)
- Round 3 fix validation
  - `cmd /c npx vitest run src/test/editor-save-integrity.test.tsx src/test/editor-save-return.test.tsx src/test/editor-lifecycle-recovery.test.tsx`
  - `cmd /c npm run build`
  - `cmd /c npm run test`
  - `cmd /c npm run lint`
  - `git -C E:\code\Project\IDKN diff --check`
  - `cmd /c npm run tauri:build`
  - Desktop `cmd /c npm run tauri:dev` smoke
  - `cmd /c npm run tauri:android:dev`

## Manual Scenarios Actually Run

Environment:

- Android emulator: `Pixel_Tablet_API_34`
- Connected device id: `emulator-5554`
- Evidence type: running Android dev shell plus adb-forwarded WebView CDP interaction against the live application

Scenarios:

1. Saved project becomes dirty after a persistence-field change
   - Opened the saved project `#/editor/1` from the workbench
   - Changed only the placement team from `主队` to `客队`
   - Verified the editor switched to `有未保存修改`
2. Save failure does not silently mark the project as saved
   - Temporarily patched `Storage.prototype.setItem` inside the running WebView to throw for `tactics-canvas:project:v1:*`
   - Triggered `保存项目`
   - Verified the UI showed `保存失败，请稍后重试`
   - Verified the editor stayed `有未保存修改` instead of returning to `本地已保存`
3. Normal save still recovers the clean state after the failure injection is removed
   - Restored the original storage implementation
   - Triggered `保存项目` again
   - Verified the UI returned to `本地已保存`

## Automated / Smoke Evidence vs Device-Side Evidence

- Automated evidence:
  - full shared build / test / lint / diff checks
  - dedicated regression coverage for the dirty-state and save-failure contracts
  - desktop Tauri smoke and desktop bundle build
- Device-side evidence:
  - Android tablet emulator only
  - live WebView CDP verification of:
    - dirty-state transition after a real UI change
    - injected persistence failure staying dirty
    - normal save restoring clean status after the failure condition is removed

## Remaining Risks

1. This round still does not establish true-device Slice 5 completion. The lifecycle / save-integrity conclusion remains simulator-only.
2. The Android release APK path was not freshly closed in this round. An attempted `npm run tauri:android:build` timed out before a clean conclusion could be recorded.
3. OEM ROM storage policy differences, lock/unlock behavior, and background restrictions remain unverified until true-device work in Slice 6.

## Anything Still Unverified

- Android phone hardware
- Android tablet hardware
- Cleanly captured Android release APK build success after the save-integrity fixes
- Final Phase 1 device-tier acceptance

## Durable Conclusions Written Back

- Slice 5 source docs now explicitly require that dirty/saved transitions track the shared persistence fingerprint.
- The Android internal interface spec now states that the saved baseline may advance only after `saveProjectState(...)` succeeds.
- Slice 5 exit criteria now include injected save-failure handling and saved-project dirty-state correctness, not just happy-path lifecycle recovery.
