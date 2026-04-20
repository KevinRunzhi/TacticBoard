# Implementation Review 37 - Android Slice 1 Runtime / Router Restart

## Scope

- Re-establish Android Slice 1 on the current branch:
  - committed runtime identity for Android
  - centralized router entry for Android Tauri
  - regression validation across Web, Windows Tauri, and Android Tauri

## Change Size

- Medium

## Touched Surfaces

- `tactics-canvas-24/src/lib/platform.ts`
- `tactics-canvas-24/src/test/platform-router.test.tsx`
- `docs/android-packaging/slices/slice-1-runtime-platform-and-router-boundary.md`
- `docs/android-packaging/android-phase1-slice-plan.md`
- `docs/DocsReview/README.md`

## Source Of Truth Used

- `docs/android-packaging/slices/slice-1-runtime-platform-and-router-boundary.md`
- `docs/android-packaging/android-phase1-slice-plan.md`
- `docs/android-packaging/android-internal-interface-spec.md`
- `docs/android-packaging/android-acceptance-standard.md`
- `docs/android-packaging/android-development-guide.md`
- `tactics-canvas-24/package.json`
- `tactics-canvas-24/src/lib/platform.ts`

## Findings

1. Slice 0 baseline had already been restored, but the current committed code still lacked a committed Android runtime identity in `platform.ts`.
2. The actual implementation gap for Slice 1 was narrow: platform detection and router centralization were already designed to funnel through `platform.ts`; no wider page-tree rewrite was required.
3. A Tauri-internals check plus Android user-agent detection is sufficient for the current Slice 1 baseline, but it still deserves later real-device confirmation.
4. The previously captured `198.18.0.1:8080` error page was not valid Slice 1 route evidence, because the dev server had already been stopped when that screenshot was taken.

## Fixes Applied

- Expanded `RuntimePlatform` to `web | windows-tauri | android-tauri`
- Added explicit `isAndroidTauri()` detection
- Kept router creation centralized in `createAppRouter()`
- Fixed router policy to:
  - Web -> `BrowserRouter`
  - Tauri runtimes -> `HashRouter`
- Added Android runtime and router regression coverage in `src/test/platform-router.test.tsx`
- Wrote the resulting Slice 1 status back into the slice doc and the Phase 1 slice plan

## Committed Scope Vs Local-Only Evidence

### Committed scope

- Runtime platform detection and router centralization in shared source
- Automated regression coverage for Web / Windows / Android runtime routing behavior
- Documentation writeback for current Slice 1 status

### Local-only evidence

- Emulator screenshots captured during this round under local `analysis/`
- Temporary dev logs from `tauri:dev` and `tauri:android:dev`

These local artifacts support the review record for this round, but they are not treated as canonical source documents and do not replace committed implementation.

## Generated / Vendored Dependency Check

- No conclusion in this round depends on edits under `src-tauri/gen/**`
- No conclusion in this round depends on edits under `src-tauri/vendor/**`
- No generated or vendored temporary patch was required to re-establish Slice 1

## Automated Commands Actually Run

From `tactics-canvas-24/`:

```bash
cmd /c npx vitest run src/test/platform-router.test.tsx
cmd /c npm run build
cmd /c npm run test
cmd /c npm run lint
cmd /c npm run tauri:build
cmd /c npm run tauri:dev
cmd /c npm run tauri:android:dev
git diff --check
```

Additional runtime verification commands executed during this round:

```bash
adb uninstall com.kevinrunzhi.tacticboard
adb shell pm list packages | Select-String tacticboard
adb shell pidof com.kevinrunzhi.tacticboard
adb shell am force-stop com.kevinrunzhi.tacticboard
adb shell am start -W -n com.kevinrunzhi.tacticboard/com.kevinrunzhi.tacticboard.MainActivity
adb shell wm size
```

## Manual Scenarios Actually Run

Android emulator (`Pixel_7`) with a live `tauri:android:dev` shell:

- cold-start app launch
- observe dashboard / workbench page
- navigate to settings page
- navigate to projects page
- navigate from dashboard into editor entry

Desktop Tauri smoke:

- observe `tauri:dev` can attach to the Vite dev server
- observe the desktop shell process starts successfully

## Key Results

- `platform-router.test.tsx` passed with 6 tests
- `npm run build` passed
- `npm run test` passed
- `npm run lint` passed with only pre-existing warnings and no new errors
- `npm run tauri:build` passed
- Desktop `tauri:dev` smoke passed
- Android `tauri:android:dev` smoke passed
- Emulator cold start succeeded with `LaunchState: COLD`
- Dashboard, settings, projects, and editor entry were observed inside the Android shell

## Remaining Risks

1. Android runtime detection currently depends on user-agent classification; that is acceptable for this slice, but it should still be re-confirmed later on a real device.
2. The most strict route evidence is still missing one device-side observation for the invalid-route recovery case.
3. This round intentionally did not touch Slice 2+ functionality such as touch ergonomics, export, import, or lifecycle hardening.

## Still Unverified

- A direct device-side observation of “invalid route -> controlled fallback state” is still missing.
- No real-device run was completed in this round; validation was done on the Android emulator.

## Decision

- Slice 1 implementation has been re-established on the current branch.
- The committed code now contains an explicit Android runtime identity and a centralized router policy.
- The evidence chain is strong enough to continue planning and implementation, but if the team wants the strictest possible exit proof, one more device-side invalid-route observation should be captured before calling Slice 1 fully closed.
