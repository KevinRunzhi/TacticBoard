# AGENTS.md

## Scope

- This file applies to the entire repository.
- This repository has two main working areas: `docs/` and `tactics-canvas-24/`.
- Use the existing language of the file you are editing. This repo intentionally mixes English and Chinese. Do not translate files just for consistency unless the task explicitly requires it.
- Treat code execution and validation rules as strict for `tactics-canvas-24/`. Treat documentation hierarchy and review-writeback rules as strict for `docs/`.

## Repository Map

- `README.md`: repository overview, current release surface, and developer entry commands.
- `docs/`: active documentation baseline.
- `docs/football-tactics-board-prd.md`
- `docs/football-tactics-board-requirements.md`
- `docs/football-tactics-board-information-architecture.md`
  - These three top-level documents define the active product baseline.
- `docs/01-product/` to `docs/07-decisions/`: derived implementation layers.
- `docs/06-quality/`: acceptance checklist, test matrix, and known risks.
- `docs/05-engineering/`, especially `docs/05-engineering/windows-packaging-plan.md`: engineering rules and the overall Windows packaging route.
- `docs/windows-packaging/`, especially `docs/windows-packaging/windows-development-guide.md`: Windows packaging boundary rules, validation order, and implementation guardrails.
- `docs/android-packaging/`: Android packaging rules and validation planning.
- `docs/DocsReview/`: review notes, validation records, and implementation verification logs.
- `tactics-canvas-24/src/`: shared business/frontend code.
- `tactics-canvas-24/src/test/`: automated tests.
- `tactics-canvas-24/src-tauri/`: Tauri shell, capabilities, Rust-side config, native packaging config, and generated/native artifacts.

Current release facts that matter for implementation:

- The current shipped surface is Windows `x64` with NSIS packaging.
- Code signing and auto-update are not current-scope assumptions.
- Android packaging docs and commands exist, but do not assume feature parity or parity deadlines unless the source docs explicitly require them.

## Source of Truth

Use the right source for the right kind of decision.

1. Product intent, scope, non-goals, and user-flow truth:
   - `docs/football-tactics-board-prd.md`
   - `docs/football-tactics-board-requirements.md`
   - `docs/football-tactics-board-information-architecture.md`
2. Derived implementation interpretation:
   - `docs/01-product/` to `docs/07-decisions/`
3. Engineering and platform-boundary rules:
   - `docs/05-engineering/`
   - `docs/05-engineering/windows-packaging-plan.md`
   - `docs/windows-packaging/`
   - `docs/windows-packaging/windows-development-guide.md`
   - `docs/android-packaging/`
4. Acceptance, test coverage targets, and known failure modes:
   - `docs/06-quality/`
   - `docs/06-quality/v1验收标准.md`
   - `docs/06-quality/v1手动测试清单.md`
5. Verification evidence and review history:
   - `docs/DocsReview/`
6. Executable command/runtime truth:
   - `tactics-canvas-24/package.json`
   - `tactics-canvas-24/vitest.config.ts`
   - `tactics-canvas-24/src-tauri/tauri.conf.json`
   - other project config files inside `tactics-canvas-24/`

Mandatory rules:

- Treat the three top-level docs in `docs/` as canonical. Do not let `01-07` override them.
- Treat `01-07` as derived layers. If they drift from the top-level baseline, update them or call out the conflict explicitly.
- Treat `DocsReview/` as evidence, not as canonical product truth.
- If a review changes the baseline understanding, write the conclusion back into the real source document in the same round. Do not leave important corrections trapped only in `DocsReview/`.
- Do not treat `dist/`, `.vite/`, `analysis/`, `src-tauri/target/`, `src-tauri/gen/`, generated schemas, logs, screenshots, or captured artifacts as source-of-truth inputs.

## Where to Change What

- Change top-level product docs when the task affects scope, non-goals, release surface, platform strategy, or user-facing flow definitions.
- Change `docs/01-product/` to `docs/07-decisions/` when the baseline already exists and you are updating derived implementation guidance, decomposition, engineering notes, quality notes, or decisions.
- Change `docs/06-quality/` when the task changes acceptance criteria, validation scope, or known-risk framing.
- Write verification evidence to `docs/DocsReview/` when the task includes review work, implementation verification, or manual validation records.
- Change `tactics-canvas-24/src/` for shared business logic, UI, routing entry points, state, and behavior.
- Change `tactics-canvas-24/src/test/` for automated behavior coverage.
- Change `tactics-canvas-24/src-tauri/` for Tauri shell behavior, capabilities, native packaging config, or Rust-side entry points.
- Use the platform bridge modules under `tactics-canvas-24/src/lib/` for platform I/O adaptation, especially:
  - `platform.ts`
  - `file-access.ts`
  - `export-save.ts`
  - `asset-import.ts`

Do not restructure the repo around duplicated business code.

- `tactics-canvas-24/src/` is the single business-code source.
- Do not create parallel business-code trees such as separate Web-only, Windows-only, or desktop-only copies of the app source.

## High-Risk and No-Edit Areas

### Packaging and runtime identity

Treat these as high risk:

- `tactics-canvas-24/src-tauri/tauri.conf.json`
- `tactics-canvas-24/vite.config.ts`
- `tactics-canvas-24/package.json`
- `tactics-canvas-24/src-tauri/capabilities/`

Rules:

- If you change the Vite dev port, keep Tauri `devUrl` in sync.
- The current Vite/Tauri development pairing is port `8080` and `http://localhost:8080`; do not change one without the other.
- The current Tauri `frontendDist` is `../dist`; keep build output expectations aligned with that path.
- The current desktop bundle target is `nsis`; do not assume installer parity with other bundle formats unless the docs/configs are updated together.
- If you change Tauri `identifier`, `productName`, bundle targets, or startup/build commands, treat the change as data-location and packaging-risky.
- Keep packaging config, capability changes, and related dependency changes synchronized in the same work unit when they belong to the same platform feature.
- If you change `package.json`, keep the relevant lockfile in sync.
- If you change `tactics-canvas-24/src-tauri/Cargo.toml`, review whether `Cargo.lock` must change too.

### Platform-boundary enforcement

- Do not call `@tauri-apps/*` directly from `src/components/**`, `src/pages/**`, or `src/hooks/**`.
- Keep Tauri/platform-specific calls behind the platform bridge modules in `tactics-canvas-24/src/lib/`.
- Components should consume normalized bridge results, not raw native paths or raw Tauri return payloads.
- Do not use platform work as an excuse to refactor core editor state, core types, or page structure unless the task explicitly requires it and you can justify the wider risk.

### Generated, vendored, and build-output areas

Do not manually edit these as normal source files:

- `tactics-canvas-24/dist/`
- `tactics-canvas-24/.vite/`
- `tactics-canvas-24/analysis/`
- `tactics-canvas-24/src-tauri/target/`
- `tactics-canvas-24/src-tauri/gen/`
- `tactics-canvas-24/src-tauri/vendor/tauri-plugin-share/permissions/autogenerated/**`
- cargo-generated metadata such as `tactics-canvas-24/src-tauri/vendor/tauri-plugin-share/Cargo.toml`

Additional rules:

- Respect explicit `DO NOT EDIT` markers.
- Treat `src-tauri/vendor/` as externally sourced unless the task is explicitly about updating that vendor copy.
- If a task truly requires changing vendored or generated content, explain the regeneration or upstream path before editing.
- Do not use captured logs, screenshots, exported images, or generated binaries as long-term editable deliverables.

### Other high-risk surfaces

- Routing changes are high risk because the repo explicitly distinguishes Web and desktop routing behavior.
- Save/export/import flows are high risk because `docs/06-quality/known-risks.md` calls out autosave, asset-reference loss, export failures, and silent-failure risk.
- Storage behavior is high risk because browser, `tauri dev`, and packaged Windows builds are different local environments.
- Android work is high risk when it starts pushing for desktop-feature parity without an explicit source-doc requirement.

## Commands and Validation

Run application commands from `tactics-canvas-24/`.

Supported command entry points:

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

Rules:

- Do not invent alternative command names when a package script already exists.
- For app changes, validate with the smallest relevant command set first, then broaden validation when the risk surface expands.
- For packaging-sensitive changes, Web validation must pass before Tauri validation.
- Do not accept “desktop works but Web is broken” as complete.

Default validation order for Web or shared-app work:

1. `npm run build`
2. `npm run test`
3. `npm run lint`

Additional validation for Tauri/platform changes:

4. `npm run tauri:dev`
5. `npm run tauri:build`

Validation rules:

- A generated artifact is not the same as a verified outcome.
- If you only confirmed “build succeeded,” say exactly that.
- Do not claim installer/runtime success unless you actually launched the app or installer and observed the result.
- For docs-only work, no app build is required, but source-of-truth consistency checks are still required.

## Testing Expectations

Before changing non-trivial behavior, check the repo’s quality documents:

- `docs/06-quality/acceptance-checklist.md`
- `docs/06-quality/test-matrix.md`
- `docs/06-quality/known-risks.md`
- `docs/06-quality/v1验收标准.md`
- `docs/06-quality/v1手动测试清单.md`

Use them to decide what must be validated.

Mandatory rules:

- Validation is part of the task, not an optional follow-up.
- Validation depth must match risk, surface area, and user impact.
- Happy-path-only validation is not enough for exports, autosave, routing, packaging, or asset import.
- If relevant automated tests already exist, run them.
- If important behavior lacks test coverage and adding a test is practical, add or update a test in `tactics-canvas-24/src/test/`.
- Keep automated test assumptions aligned with the actual Vitest setup: `jsdom`, global test APIs, and `src/test/setup.ts`.

Expected validation patterns:

- UI/business logic changes:
  - run the smallest relevant automated test set first
  - then run broader build/test/lint if the change crosses feature boundaries
- Packaging/platform bridge changes:
  - run Web validation first
  - then run Tauri validation
  - then do manual regression through the affected flows
  - use `docs/06-quality/v1手动测试清单.md` and `docs/06-quality/v1验收标准.md` when the change is broad, user-visible, or packaging-sensitive
  - for Windows/Tauri work, the default manual regression path is: workbench open -> new/open project -> editor -> save -> return -> reopen -> PNG export -> GIF export -> reference import
  - also run a Web regression pass through the equivalent main flow before calling the task complete
- Docs/source-of-truth changes:
  - verify top-level docs, derived docs, and review logs stay aligned

When relevant to the change, verify plausible failure modes, not just success cases. Examples already reflected in repo docs include:

- autosave failure
- save cancelled vs save failed
- export generation succeeded but file save failed
- GIF limit / duration constraints
- invalid or missing project route
- incompatible format switch behavior
- asset import failure leaving an empty reference

## Completion and Handoff Standards

Do not mark work complete until all of the following are true:

- You consulted the correct source-of-truth files for the task.
- You changed the correct layer instead of the most convenient file.
- Required automated validation ran.
- Required manual validation ran for platform-sensitive work.
- Any remaining unverified items are listed explicitly.

Every final handoff must state:

- what changed
- why it changed
- which source-of-truth docs and config files were used
- what was verified
- how it was verified
- what was not verified
- why it was not verified
- what risks or assumptions remain

If the task includes review or verification work:

- write or update a dated record in `docs/DocsReview/`
- record at least:
  - scope
  - findings
  - fixes applied
  - remaining risks
- do not stop at “issues found”; update the related docs or code in the same round when the conclusion changes the baseline

## Nested AGENTS Policy

- The root `AGENTS.md` is the only required agent contract right now.
- Do not create nested `AGENTS.md` files by default.
- Consider a nested file later only if repeated mistakes show that one subtree needs stricter local rules than the root file can express cleanly.

Likely future candidates, only if needed:

- `docs/`
- `tactics-canvas-24/`
- `tactics-canvas-24/src-tauri/`

Good trigger conditions for a future nested file:

- repeated source-of-truth mistakes inside `docs/`
- repeated platform-boundary or vendor-edit mistakes inside `tactics-canvas-24/`
- the root file becoming bloated with subtree-specific exceptions
