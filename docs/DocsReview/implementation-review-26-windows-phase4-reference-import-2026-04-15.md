# implementation-review-26-windows-phase4-reference-import-2026-04-15

## Scope

Windows packaging Phase 4:

- add native reference image import bridge for Windows
- preserve the existing browser `File -> FileReader` business flow
- use the agreed `兼容 File 桥` strategy instead of rewriting component contracts
- verify `npm run build`, `npm run test`, `npm run lint`, `npm run tauri:dev`, `npm run tauri:build`

## Findings

1. The existing editor contract for reference image import is still `(file: File) => void`; changing that contract now would expand scope and increase regression risk.
2. The first test version assumed `File.arrayBuffer()` existed in the test runtime, which was not portable enough.
3. The first UI test asserted the import callback synchronously, but the new native picker flow is async.
4. Windows import needed extra Tauri permissions beyond Phase 3:
   - native open dialog
   - file read

## Fixes Applied

- Added `src/lib/asset-import.ts` with:
  - `canUseNativeImageImport()`
  - `pickImageFile()`
- Implemented the Windows native bridge as:
  - Tauri open dialog
  - read selected file bytes
  - convert bytes into a browser-compatible `File`
  - return the file to the existing import callback
- Updated `src/components/tactics/RightPanel.tsx` so:
  - web keeps using hidden `<input type="file">`
  - Windows uses the native picker bridge
  - import failure shows a toast
- Updated `src-tauri/capabilities/default.json` with:
  - `dialog:allow-open`
  - `fs:allow-read-file`
- Added tests:
  - `src/test/asset-import.test.ts`
  - `src/test/right-panel-reference-import.test.tsx`
- Fixed the new tests after the first run:
  - changed the file-content assertion to `size`
  - changed the UI assertion to wait for the async callback

## Validation

### Round 1: Web Regression

- `npm run build`
- `npm run test`
- `npm run lint`

Result:

- build passed
- tests initially failed in two new tests:
  - `File.arrayBuffer()` assumption
  - async callback timing
- fixed both test issues
- reran all three commands successfully
- tests passed (`31` files, `73` tests)
- lint passed with only the existing `react-refresh/only-export-components` warnings

### Round 2: Tauri Dev

- `npm run tauri:dev`

Result:

- desktop shell started successfully with the new native image import bridge in place
- the added open/read permissions did not block desktop startup

### Round 3: Tauri Build

- `npm run tauri:build`

Result:

- release build completed successfully
- NSIS installer output was produced successfully with the new import permissions and bridge code

## Remaining Risks

- This phase validates the native bridge wiring, not a human clicking through the OS image picker dialog end-to-end.
- Large images still enter the existing in-browser `FileReader -> data URL` path after bridging; storage pressure behavior remains unchanged from the web implementation.
- Native import is currently only wired for reference images, not for future generic asset workflows.
