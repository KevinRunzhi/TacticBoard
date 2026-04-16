# implementation-review-23-windows-phase1-tauri-base-2026-04-15

## Scope

Windows packaging Phase 1:

- add Tauri base engineering
- keep existing web business code unchanged
- verify `npm run build`, `npm run test`, `npm run lint`, `npm run tauri:dev`, `npm run tauri:build`

## Findings

1. The machine did not have Rust / Cargo installed, so `tauri:dev` could not start.
2. `eslint` was scanning `.vite/` generated files, which created false failures unrelated to source code.
3. The first cold `tauri:dev` run required a long Rust dependency compilation window; this is an environment/runtime characteristic, not a code defect.

## Fixes Applied

- Installed the Rust toolchain with `rustup`.
- Added Tauri npm dependencies:
  - `@tauri-apps/cli`
  - `@tauri-apps/plugin-dialog`
  - `@tauri-apps/plugin-fs`
- Added scripts:
  - `tauri:dev`
  - `tauri:build`
- Updated `vite.config.ts` for Tauri compatibility:
  - `clearScreen: false`
  - `strictPort: true`
  - `TAURI_DEV_HOST` aware dev host / HMR
  - `watch.ignored` for `src-tauri`
- Added `src-tauri/` base project:
  - frozen app identifier
  - frozen product/window name
  - NSIS bundle target
  - basic Rust entrypoint
  - base capabilities directory
- Registered `tauri-plugin-dialog` and `tauri-plugin-fs` in the Rust shell.
- Updated `.gitignore` and `eslint.config.js` so generated desktop/build artifacts do not pollute validation.
- Synced packaging docs with Phase 1 implementation realities:
  - rustup requires terminal PATH refresh
  - first cold compile is expected to take noticeably longer

## Validation

### Round 1: Web Regression

- `npm run build`
- `npm run test`
- `npm run lint`

Result:

- build passed
- tests passed (`26` files, `60` tests)
- lint initially failed because `.vite/` was included
- fixed lint ignore configuration
- reran all three commands successfully

### Round 2: Tauri Dev

- `npm run tauri:dev`

Result:

- first attempt failed because current shell PATH had not yet picked up the new Rust installation
- reran with refreshed cargo path available to the process
- cold compile completed
- desktop executable launched successfully from `target\\debug\\tacticboard.exe`

### Round 3: Tauri Build

- `npm run tauri:build`

Result:

- release build completed successfully
- NSIS installer artifact was produced successfully under:
  - `src-tauri\\target\\release\\bundle\\nsis\\`
- This round records bundle-directory evidence rather than freezing one installer filename, because the visible artifact name can vary with product naming or local encoding presentation

## Remaining Risks

- Router is still `BrowserRouter`; desktop-safe routing is intentionally deferred to Phase 2.
- File save and reference image import still use browser behavior; native file bridge work is intentionally deferred to later phases.
- The generated icons are still Tauri defaults and should be replaced before release packaging.
- This round validated shell startup/build, not full desktop user workflows inside the packaged app.
