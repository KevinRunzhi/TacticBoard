# Implementation Review 46

## Scope

- Android Phase 1 Slice 5 restart
- Save / recovery / lifecycle / orientation hardening
- Shared persistence behavior under `tactics-canvas-24/src/`

## Change Size Classification

- Large

## Touched Surfaces

- `tactics-canvas-24/src/lib/editor-entry.ts`
- `tactics-canvas-24/src/pages/Index.tsx`
- `tactics-canvas-24/src/pages/DashboardV2.tsx`
- `tactics-canvas-24/src/pages/ProjectsV2.tsx`
- `tactics-canvas-24/src/hooks/useEditorState.ts`
- `tactics-canvas-24/src/data/mockProjects.ts`
- `tactics-canvas-24/src/test/editor-entry.test.ts`
- `tactics-canvas-24/src/test/editor-lifecycle-recovery.test.tsx`
- `tactics-canvas-24/src/test/editor-save-return.test.tsx`
- `docs/android-packaging/slices/slice-5-save-recovery-lifecycle-orientation-hardening.md`
- `docs/android-packaging/android-phase1-slice-plan.md`
- `docs/android-packaging/android-internal-interface-spec.md`

## Committed Scope vs Local-Only Experiments

- This round's lifecycle / recovery behavior changes are in committed-source files under `tactics-canvas-24/src/**`.
- No conclusion in this review depends on `src-tauri/gen/**`, `src-tauri/vendor/**`, or other generated-only patches.
- Screenshot and `uiautomator dump` artifacts under `tactics-canvas-24/analysis/` are evidence only, not source of truth.

## Findings

1. Fresh Android `mode=new` editor entry was ambiguous during lifecycle/orientation recovery. Without an explicit session marker, a recovered new-editor session could be misread as a brand-new blank entry or drift into resume semantics.
2. Draft persistence was too weak at lifecycle boundaries. The existing autosave timer alone was not a reliable contract for Android background/foreground or rotation transitions.
3. Saved projects could reopen as dirty after `返回工作台 -> 继续编辑`. The root cause was a stale project draft that was equivalent to the saved project snapshot but still won the reopen path.

## Fixes Applied

1. Added `src/lib/editor-entry.ts` and moved new-editor entry construction to explicit `session` tokens.
2. Routed dashboard / projects / editor entry semantics through the new entry helper so `mode=new` is no longer a loose query-string convention.
3. Hardened `useEditorState.ts` with lifecycle-boundary draft flushes on:
   - `visibilitychange` when hidden
   - `pagehide`
   - `beforeunload`
4. Added a persistence fingerprint for saved projects and updated explicit save to refresh that baseline.
5. Cleared equivalent saved-project drafts instead of reopening them as dirty.
6. Prevented transient new-project drafts from being rewritten immediately after an explicit first save.
7. Added regression coverage for:
   - new-entry session semantics
   - lifecycle recovery
   - stale equivalent project-draft cleanup
   - first-save return / reopen staying clean

## Automated Commands Actually Run

- `cmd /c npx vitest run src/test/editor-entry.test.ts src/test/editor-lifecycle-recovery.test.tsx src/test/entry-semantics.test.tsx src/test/project-roundtrip-state.test.tsx src/test/reference-image-model.test.tsx`
- `cmd /c npx vitest run src/test/dashboard-workbench-entry.test.tsx src/test/projects-entry-semantics.test.tsx src/test/editor-save-return.test.tsx src/test/mobile-mainflow-baseline.test.tsx`
- `cmd /c npx vitest run src/test/editor-lifecycle-recovery.test.tsx src/test/editor-save-return.test.tsx`
- `cmd /c npm run build`
- `cmd /c npm run test`
- `cmd /c npm run lint`
- `git diff --check`
- `cmd /c npm run tauri:build`
- Desktop `cmd /c npm run tauri:dev` smoke

## Manual Scenarios Actually Run

Environment:

- Android emulator: `Pixel_7`
- Evidence type: simulator device-side observation through the Android dev shell plus WebView DOM inspection and adb lifecycle/orientation control

Scenarios:

1. Saved project reopen stays clean
   - Opened the recent saved project from the workbench
   - Verified editor status text was `本地已保存`
   - Verified no `tactics-canvas:draft:project:v1:*` key existed for the reopened saved project
2. Saved project background / foreground recovery
   - Sent app to background with `KEYCODE_HOME`
   - Brought it back with `am start`
   - Verified route, editor text, and `本地已保存` remained intact
3. Saved project orientation recovery
   - Rotated portrait -> landscape -> portrait
   - Verified route and editor content remained on the same saved project
   - Verified no project-draft key reappeared
4. Unsaved new-session recovery
   - Opened `/editor?mode=new&session=...`
   - Applied formation `4-4-2`
   - Verified `tactics-canvas:draft:new:v1` was written
   - Sent app to background and resumed
   - Verified the same `session` route and unsaved editor content remained
5. Unsaved new-session orientation recovery
   - Rotated portrait -> landscape -> portrait
   - Verified the same `session` route and `draft:new` payload still contained the applied `4-4-2` state

## Automated / Smoke Evidence vs Device-Side Evidence

- Automated evidence:
  - Full web/test/build/lint regression
  - Slice-5-specific entry and recovery tests
  - Desktop Tauri smoke and desktop bundle build
- Device-side evidence:
  - Emulator-only
  - `Pixel_7` Android dev shell
  - DOM-visible route/status/state continuity for both unsaved and saved flows
  - Captured artifacts under `tactics-canvas-24/analysis/`

## Remaining Risks

1. Current device-side evidence is simulator-only. This round must be written as `模拟器验证通过`, not `真机完成`.
2. Slice 5 still lacks the tablet coverage required before Slice 6 can be treated as open.
3. True-device lifecycle behavior, OEM ROM background policy differences, and lock/unlock behavior remain unverified.
4. This round focused on save / recovery / lifecycle contracts. It did not re-close Android asset-import persistence on a real device.

## Anything Still Unverified

- True Android phone hardware
- Android tablet
- Release APK manual lifecycle validation
- Final Phase 1 device-tier acceptance

## Durable Conclusions Written Back

- Slice 5 docs now reflect that the branch has rebuilt lifecycle / recovery behavior.
- Android docs now explicitly distinguish simulator-only success from true-device completion.
- Internal interface docs now freeze the saved-project draft dedupe and `mode=new` session boundary as current Slice 5 behavior.
