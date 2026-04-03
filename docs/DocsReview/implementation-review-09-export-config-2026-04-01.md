# Implementation Review 09: Export Config

## Scope

- Add a temporary export configuration model for the editor
- Add an export settings dialog before PNG export
- Pass export configuration into the canvas export pipeline

## Round 1: Build And Type Validation

### Findings

- Export was still a one-click PNG action with no intermediate configuration state
- Reference image state needed forward-compatible defaults because `ReferenceImage` now carries transform fields

### Fixes Applied

- Added `ExportConfig` and temporary export defaults in `src/types/tactics.ts` and `src/lib/export-config.ts`
- Added `ExportConfigDialog` and wired editor export buttons to open it instead of exporting immediately
- Extended `PitchCanvasHandle.exportPng()` to accept export config and honor export scale
- Added `scale / offsetX / offsetY` defaults to imported reference images
- Normalized persisted reference image data in `src/data/mockProjects.ts`

### Validation

- `npm run build`

## Round 2: Scoped Behavior Tests

### Findings

- The initial Windows command shape only executed one targeted test file, which would have under-reported this round's coverage
- New export-specific tests had not yet been created

### Fixes Applied

- Added `src/test/export-config-dialog.test.tsx`
- Added `src/test/export-config-utils.test.ts`
- Re-ran the targeted verification with direct `npx vitest run ...` invocation

### Validation

- `npx vitest run src/test/export-config-dialog.test.tsx src/test/export-config-utils.test.ts src/test/reference-image-model.test.tsx`

## Round 3: Regression Validation

### Findings

- No functional regressions found in the existing main-flow test suite
- `eslint` still reports the same 7 pre-existing `react-refresh/only-export-components` warnings in shared UI files

### Fixes Applied

- No additional code fixes were needed after regression

### Validation

- `npm run test`
- `npm run lint`

## Remaining Risks

- Export config is currently focused on PNG and output scale; title and match-info inclusion rules are not wired into the SVG yet
- GIF export is still outside the implemented scope even though the broader product docs mention it as a later-first-phase capability
- Export ratio currently means output resolution (`1x` / `2x`), not layout aspect presets like `16:9`
