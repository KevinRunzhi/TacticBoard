# implementation-review-25-windows-phase3-export-save-2026-04-15

## Scope

Windows packaging Phase 3:

- add platform-aware file save bridge
- keep existing PNG / GIF generation logic
- replace only the final save side effect
- preserve browser download behavior on web
- verify `npm run build`, `npm run test`, `npm run lint`, `npm run tauri:dev`, `npm run tauri:build`

## Findings

1. The initial `file-access.test.ts` assumed `URL.createObjectURL` existed in the test runtime; in jsdom it did not, so the new save bridge tests failed.
2. The Windows save path needed explicit coverage for all result states:
   - saved
   - cancelled
   - failed
3. The export bridge had to stay narrow:
   - `tactics-export.ts` returns bytes
   - `PitchCanvas` forwards bytes
   - `TacticsEditor` decides how to save them
4. The Tauri permission surface needed to stay minimal:
   - save dialog
   - file write

## Fixes Applied

- Added `src/lib/file-access.ts` with a platform-aware `saveFile()` contract:
  - web downloads with `Blob` + anchor
  - Windows uses Tauri dialog + fs write
- Added `src/lib/export-save.ts` with `saveExportBinary()` to normalize:
  - suggested file name
  - extension
  - mime type
  - dialog filter labels
- Refactored `src/lib/tactics-export.ts`:
  - PNG export returns `Uint8Array`
  - step PNG export returns `Uint8Array`
  - GIF export returns `Uint8Array`
  - removed direct browser download side effects
- Updated `src/components/tactics/PitchCanvas.tsx` so export handlers now return bytes instead of triggering downloads.
- Updated `src/components/tactics/TacticsEditor.tsx` so export confirmation now:
  - requests bytes from the canvas
  - calls `saveExportBinary()`
  - handles `cancelled` / `failed` / `saved` separately
- Added and expanded tests:
  - `src/test/file-access.test.ts`
  - `src/test/export-save.test.ts`
- Updated `src-tauri/capabilities/default.json` to keep only the required permissions:
  - `dialog:allow-save`
  - `fs:allow-write-file`

## Validation

### Round 1: Web Regression

- `npm run build`
- `npm run test`
- `npm run lint`

Result:

- build passed
- tests initially failed because `URL.createObjectURL` was missing in the test runtime
- fixed the test stubs and added explicit Windows-path coverage
- reran all three commands successfully
- tests passed (`29` files, `66` tests)
- lint passed with only the existing `react-refresh/only-export-components` warnings

### Round 2: Tauri Dev

- `npm run tauri:dev`

Result:

- desktop shell started successfully with the new export save bridge in place
- no startup regression was introduced by the new platform file save code

### Round 3: Tauri Build

- `npm run tauri:build`

Result:

- release build completed successfully
- NSIS installer output was produced successfully with the new export save bridge still linked correctly

## Remaining Risks

- This phase validates save-bridge wiring, not full manual desktop interaction with the OS save dialog.
- Browser export still uses an anchor-based download path; that is intentional for Phase 3 and should remain covered in later regressions.
- Reference image native import is not covered by this phase and remains for the next implementation step.
