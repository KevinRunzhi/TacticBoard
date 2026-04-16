# implementation-review-24-windows-phase2-router-2026-04-15

## Scope

Windows packaging Phase 2:

- add runtime platform detection
- switch desktop runtime to hash-based routing
- preserve current web routing behavior
- verify `npm run build`, `npm run test`, `npm run lint`, `npm run tauri:dev`, `npm run tauri:build`

## Findings

1. The first implementation put JSX into `src/lib/platform.ts`, which broke the TypeScript build because the file extension remained `.ts`.
2. Router adaptation needed coverage on both code paths:
   - web `BrowserRouter`
   - Windows Tauri `HashRouter`
3. The route strategy change had to stay fully isolated from business pages and editor logic.

## Fixes Applied

- Added `src/lib/platform.ts` with:
  - `getRuntimePlatform()`
  - `isWindowsTauri()`
  - `createAppRouter(children)`
- Implemented the router factory without JSX by using `createElement`, so the utility stays valid in a `.ts` module.
- Updated `src/App.tsx` to wrap the existing route tree with the platform router factory instead of directly importing `BrowserRouter`.
- Added `src/test/platform-router.test.tsx` to verify:
  - default web detection
  - browser route behavior on web
  - hash route behavior in Windows Tauri mode

## Validation

### Round 1: Web Regression

- `npm run build`
- `npm run test`
- `npm run lint`

Result:

- first build failed because `platform.ts` contained JSX
- replaced JSX with `createElement`
- reran all three commands successfully
- tests passed (`27` files, `63` tests)
- lint passed with only the existing `react-refresh/only-export-components` warnings

### Round 2: Tauri Dev

- `npm run tauri:dev`

Result:

- desktop shell started successfully after the router change
- no startup regression was introduced by switching to hash routing in Tauri mode

### Round 3: Tauri Build

- `npm run tauri:build`

Result:

- release build completed successfully
- NSIS installer output was produced successfully again

## Remaining Risks

- React Router v7 future warnings still appear in tests; they are existing upgrade warnings, not a Phase 2 regression.
- This phase validated routing startup and resolution, but not full desktop user interaction across every page.
- Native save/import behavior is still deferred to later phases.
