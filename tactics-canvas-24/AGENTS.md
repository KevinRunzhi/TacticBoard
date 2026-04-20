# AGENTS.md

## Scope

- This file applies to `tactics-canvas-24/` including `src-tauri/`.
- Use it together with the repository root `AGENTS.md` and the canonical docs under `../docs/`.

## Current Stack And Structure

- React 18 + TypeScript + Vite 5
- Vitest + Testing Library with `jsdom` via `vitest.config.ts` and `src/test/setup.ts`
- Tauri 2 shell under `src-tauri/`
- Shared business code in `src/`
- Automated tests in `src/test/`
- Routes defined in `src/App.tsx`
- Runtime platform and router split handled in `src/lib/platform.ts`

## Executable Source Of Truth

- Commands: `package.json`
- Web dev/build behavior: `vite.config.ts`
- Test environment: `vitest.config.ts`, `src/test/setup.ts`
- Tauri shell configuration:
  - `src-tauri/tauri.conf.json`
  - `src-tauri/Cargo.toml`
  - `src-tauri/capabilities/default.json`
  - `src-tauri/src/lib.rs`
- User-facing scope and acceptance:
  - `../docs/football-tactics-board-prd.md`
  - `../docs/football-tactics-board-requirements.md`
  - `../docs/football-tactics-board-information-architecture.md`
  - `../docs/05-engineering/**`
  - `../docs/06-quality/**`
  - `../docs/windows-packaging/**`
  - `../docs/android-packaging/**`

## Commands

- Use the documented npm workflow:
  - `npm install`
  - `npm run dev`
  - `npm run build`
  - `npm run build:dev`
  - `npm run test`
  - `npm run test:watch`
  - `npm run lint`
  - `npm run preview`
  - `npm run tauri`
  - `npm run tauri:dev`
  - `npm run tauri:build`
  - `npm run tauri:android:init`
  - `npm run tauri:android:dev`
  - `npm run tauri:android:build`
- `playwright.config.ts` exists, but there are no package scripts or root workflows invoking Playwright. Do not claim Playwright coverage unless you wire and run it yourself.
- Raw Tauri CLI usage is acceptable only when you verify the exact command locally and record it explicitly. If you then promote that command into `package.json`, keep the docs and review records in sync.

## Package Manager And Lockfiles

- Repository docs currently use `npm`.
- `package-lock.json`, `bun.lock`, and `bun.lockb` are all tracked.
- If dependency changes are intentional, update the lockfile(s) for the toolchain you actually used and state which ones were regenerated.
- Do not casually switch the documented workflow to another package manager without updating the docs and validating the result.

## Architecture Rules

- `src/` is the single business-code source. Do not create separate Web, Windows, or Android copies of the app.
- Keep route selection centralized in `src/App.tsx` and `src/lib/platform.ts`.
- Keep platform I/O inside the bridge modules:
  - `src/lib/platform.ts`
  - `src/lib/file-access.ts`
  - `src/lib/export-save.ts`
  - `src/lib/asset-import.ts`
- Do not import `@tauri-apps/*` directly from `src/components/**`, `src/pages/**`, or `src/hooks/**`.
- Components should consume normalized bridge results, not raw native paths, URIs, or raw dialog/plugin payloads.
- When changing save, export, import, or routing behavior, preserve the shared business contract unless the task explicitly includes a broader refactor.

## High-Risk Areas

- `package.json`
- `vite.config.ts`
- `vitest.config.ts`
- `src/App.tsx`
- `src/lib/platform.ts`
- `src/lib/file-access.ts`
- `src/lib/export-save.ts`
- `src/lib/asset-import.ts`
- `src-tauri/tauri.conf.json`
- `src-tauri/Cargo.toml`
- `src-tauri/Cargo.lock`
- `src-tauri/capabilities/default.json`
- Save and draft-recovery flows
- PNG and GIF export
- Reference image and avatar import
- Route behavior between browser and Tauri runtimes

## Change Size Classification

- Treat a change as `medium` if any of the following are true:
  - it changes user-visible behavior across more than one file
  - it touches routing, save, export, import, recovery, platform bridges, or shared state
  - it changes both runtime code and tests for the same feature
  - it changes app code together with config or packaging-related files
- Treat a change as `large` if any of the following are true:
  - it spans multiple features or layers
  - it changes persistence rules, platform contracts, or packaging/runtime identity
  - it changes both shared app code and Tauri/runtime configuration in the same work unit
  - it requires validating more than one major user flow to trust the result
- When uncertain, classify upward.

## Platform-Specific Rules

- If you change the Vite dev port, keep `src-tauri/tauri.conf.json` `devUrl` in sync. The current pairing is `8080` and `http://localhost:8080`.
- If you change Tauri `identifier`, `productName`, or bundle targets, call out the data-location and packaging risk explicitly.
- `src-tauri/src/lib.rs` already exposes a mobile-capable entry point, and `src-tauri/gen/android/` exists as generated scaffold. Treat `src-tauri/gen/**` as generated output, not canonical hand-edit source.
- Product docs currently commit to Windows + Android as launch platforms, but the currently documented package-script workflow is Web/Windows-oriented. Do not claim Android implementation completeness without Android-specific commands and validation evidence.

## Generated And Non-Source Files

- Do not treat these as canonical source or normal edit targets:
  - `dist/`
  - `.vite/`
  - `analysis/`
  - `node_modules/`
  - `src-tauri/target/`
  - `src-tauri/gen/`
  - local debug logs such as `*.log`, `playwright-*.log`, and `tauri-dev*.log`
- If a task truly requires changing generated output, explain the regeneration path first.

## Validation And Run Order

- Use the quality docs in `../docs/06-quality/` to choose the required depth.
- After every `medium` or `large` code change, the agent must run validation itself before handoff. Recommending commands without running them is not sufficient.
- Default order for shared or Web code:
  1. `npm run build`
  2. `npm run test`
  3. `npm run lint`
- Minimum automated validation for every `medium` or `large` code change:
  1. `npm run build`
  2. `npm run test`
  3. `npm run lint`
  4. `git diff --check`
- Add desktop validation for Tauri, packaging, bridge, or runtime-config changes:
  4. `npm run tauri:dev`
  5. `npm run tauri:build`
- `npm run tauri:dev` is mandatory for `medium` or `large` changes that touch:
  - platform bridges
  - routing/runtime platform detection
  - save/export/import flows
  - Tauri-facing UI behavior
- `npm run tauri:build` is mandatory for `medium` or `large` changes that touch:
  - `src-tauri/**`
  - `package.json`
  - `vite.config.ts`
  - `src-tauri/tauri.conf.json`
  - `src-tauri/Cargo.toml`
  - `src-tauri/capabilities/**`
- Build success is not the same as behavioral verification. State exactly what you executed.
- Manual regression is required for save, export, import, routing, or persistence changes.
- For `large` changes, happy-path-only checking is not enough. Run the relevant edge/failure scenarios from `../docs/06-quality/test-matrix.md`, `../docs/06-quality/acceptance-checklist.md`, and `../docs/06-quality/v1手动测试清单.md`.
- Minimum desktop regression path when those areas change:
  - dashboard or workspace open
  - new or existing project open
  - edit
  - save
  - return
  - reopen
  - PNG export
  - GIF export
  - reference image import
- Also run the equivalent Web regression when shared code or platform bridges change.
- If important behavior lacks automated coverage and adding a test under `src/test/` is practical, add or update it.
- There is no root CI or workflow file to rely on. Local validation is the required baseline evidence.
- The following do not count as sufficient validation for `medium` or `large` changes:
  - only reasoning that the code "should work"
  - only running one shallow command when broader commands are available
  - only checking the happy path for save/export/import/routing/platform changes
  - only citing an older `DocsReview` record without rerunning checks
- If any required command cannot be executed, the handoff must say exactly which command was blocked, why it was blocked, and which risk remains. In that case, do not present the task as fully accepted.

## Review And Acceptance Records

- Every `medium` or `large` code change requires a dated record under `../docs/DocsReview/`.
- Reviews, audits, packaging phases, acceptance passes, and manual validation rounds also require a dated record even when no code changed.
- Each record must include:
  - scope
  - change size classification (`medium` or `large` when applicable)
  - touched surfaces
  - findings
  - fixes applied
  - automated commands actually run
  - manual scenarios actually run
  - remaining risks
  - anything still unverified
- Ordinary small code fixes do not need a new review log unless the task itself is a review or validation deliverable.

## Completion Expectations

- Final handoff must cite the docs and config files you treated as source of truth.
- Report automated validation and manual validation separately.
- Report anything not verified, especially Android behavior, installer behavior, native dialogs, or clean-machine packaging behavior.
- For `medium` or `large` code changes, do not hand off the work as complete until the required self-run validation and `DocsReview` record both exist.
