# Implementation Review 38 - Android Slice 1 Strict Round 1

## Scope

- First strict review round for Slice 1 after the runtime/router restart
- Focus on code-level interface alignment and automated regression gaps around:
  - runtime detection
  - App-level router fallback
  - neighboring platform bridges that must not silently drift into Android native semantics before later slices

## Change Size

- Medium

## Touched Surfaces

- `tactics-canvas-24/src/test/app-router-android.test.tsx`
- `tactics-canvas-24/src/test/file-access.test.ts`
- `tactics-canvas-24/src/test/asset-import.test.ts`

## Source Of Truth Used

- `docs/android-packaging/slices/slice-1-runtime-platform-and-router-boundary.md`
- `docs/android-packaging/android-phase1-slice-plan.md`
- `docs/android-packaging/android-internal-interface-spec.md`
- `docs/06-quality/test-matrix.md`
- `docs/06-quality/acceptance-checklist.md`
- `tactics-canvas-24/src/App.tsx`
- `tactics-canvas-24/src/lib/platform.ts`
- `tactics-canvas-24/src/lib/file-access.ts`
- `tactics-canvas-24/src/lib/asset-import.ts`

## Findings

1. The Slice 1 restart had rebuilt `platform.ts`, but the test suite still lacked an App-level Android router regression proving that the real route tree reaches `NotFound` and can return to the dashboard.
2. Neighboring bridge modules still relied on `getRuntimePlatform()`, but there was no explicit regression coverage proving that `android-tauri` remains on non-native file save / image import semantics until later slices.
3. Static audit of `src/` showed the Android runtime check remains centralized in `src/lib/platform.ts`; no page/component-level Android route detection was found outside the platform bridge.

## Fixes Applied

- Added `src/test/app-router-android.test.tsx`
- Added Android guardrail coverage in `src/test/file-access.test.ts`
- Added Android guardrail coverage in `src/test/asset-import.test.ts`
- Hardened the new App-level test cleanup by restoring mocked console state after each test

## Committed Scope Vs Local-Only Evidence

### Committed scope

- New App-level Android router regression coverage
- New Android guardrail coverage for `file-access` and `asset-import`

### Local-only evidence

- Local static-audit command output used during this round

## Generated / Vendored Dependency Check

- No conclusion in this round depends on edits under `src-tauri/gen/**`
- No conclusion in this round depends on edits under `src-tauri/vendor/**`

## Automated Commands Actually Run

From `tactics-canvas-24/`:

```bash
cmd /c npx vitest run src/test/platform-router.test.tsx src/test/app-router-android.test.tsx src/test/file-access.test.ts src/test/asset-import.test.ts
git diff --check
```

Static interface audit commands executed from the repository root:

```powershell
Get-ChildItem -Path tactics-canvas-24\src -Recurse -Include *.ts,*.tsx | Select-String -Pattern '__TAURI_INTERNALS__|__TAURI__|navigator\.userAgent|Android'
Get-ChildItem -Path tactics-canvas-24\src -Recurse -Include *.ts,*.tsx | Select-String -Pattern 'getRuntimePlatform\(|isAndroidTauri\(|isWindowsTauri\(|createAppRouter\('
```

## Manual Scenarios Actually Run

- None in this round; this round was limited to code audit and targeted automated regression

## Remaining Risks

1. This round did not yet provide device-side proof for invalid-route fallback inside the Android shell.
2. This round did not yet distinguish application-internal hash routing from external URL / `VIEW intent` entry behavior.

## Still Unverified

- Device-side invalid-route recovery
- Desktop Tauri and Android shell smoke after the new test additions

## Decision

- Round 1 closed the largest automated regression gaps around Slice 1.
- Slice 1 still required cross-surface smoke and device-side invalid-route evidence after this round.
