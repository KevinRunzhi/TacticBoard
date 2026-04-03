# Implementation Review 15

Date: 2026-04-01
Scope: implement the first usable GIF export flow for the V1 editor, aligned with the current PRD / requirements constraints

## Goal

Ship a basic, offline GIF export path that:

- works from the existing editor export entry
- follows the “PNG + Windows-first GIF” product boundary
- enforces the first-phase GIF constraints
- does not mutate or interrupt the editor state while exporting

## Round 1: Build / Structure Pass

### Findings

- The existing export path only supported PNG and relied on cloning the live SVG.
- `ExportConfig` had already been expanded at the type level, but the export dialog and export runtime were still effectively PNG-only.
- A real GIF flow needed an off-screen export path instead of mutating the live editor frame-by-frame.

### Fixes Applied

- Added `gifenc` as a lightweight GIF encoder dependency.
- Added `GifSpeed` and `gifSpeed` to `ExportConfig`.
- Rebuilt the export dialog to support:
  - PNG / GIF format selection
  - GIF speed selection (`slow / standard / fast`)
  - desktop-only GIF availability
  - 15-second limit feedback
  - title / step info / match info / ghost trail / reference image / transparent background toggles
- Added a new `src/lib/tactics-export.ts` renderer that:
  - renders export frames into an off-screen canvas
  - exports PNG from that canvas
  - encodes GIF from a step sequence with `gifenc`
  - computes duration and constraint warnings
- Updated `PitchCanvas` to expose both `exportPng(...)` and `exportGif(...)` through the same off-screen export path.
- Updated `TacticsEditor` to:
  - pass step data into `PitchCanvas`
  - branch export behavior by `ExportConfig.format`
  - prevent invalid GIF exports before running the encoder

### Validation

- `npm run build`

Result: passed

## Round 2: Targeted Behavior Tests

### Findings

- The main risks after wiring the feature were in:
  - export dialog behavior
  - GIF speed / duration math
  - regression in existing export-config helper behavior

### Fixes Applied

- Added `src/test/tactics-export.test.ts`
  - verifies GIF speed delays
  - verifies duration estimation
  - verifies first-phase duration limit messaging
- Rewrote `src/test/export-config-dialog.test.tsx`
  - verifies PNG / GIF config changes
  - verifies GIF is disabled when unsupported
  - verifies duration over-limit warning and disabled confirm state
- Kept `src/test/export-config-utils.test.ts` aligned with the expanded export config behavior

### Validation

- `npx vitest run src/test/export-config-dialog.test.tsx src/test/export-config-utils.test.ts src/test/tactics-export.test.ts`

Result: 3 files passed, 12 tests passed

## Round 3: Full Regression

### Findings

- No save / workbench / editor regressions were introduced by the GIF export changes.
- Existing React Router future warnings remain test-environment noise, not change-specific failures.

### Validation

- `npm run test`
- `npm run lint`

Results:

- Full test suite passed: 17 files, 36 tests
- Lint passed with 7 pre-existing `react-refresh/only-export-components` warnings in shared UI component files

## Remaining Risks / Follow-up

- This round implements the basic export path, but not a browser-level end-to-end assertion that a downloaded `.gif` file is visually correct frame-by-frame.
- GIF export is intentionally still desktop-first in the UI. Mobile and tablet layouts continue to guide users toward PNG.
- The GIF encoder currently builds per-frame palettes for simplicity and correctness; later performance work could optimize this if export time becomes noticeable on very large projects.
- The PNG export path now uses the same off-screen renderer as GIF. This keeps behavior consistent, but it also means future visual tweaks to the live SVG may need to be mirrored in `src/lib/tactics-export.ts`.
- GIF export still follows the “basic playback result” rule only. It does not implement camera moves, per-frame editing, or MP4-class output.

## Conclusion

The project now has a real first-phase GIF export path instead of only type-level placeholders. The export dialog, runtime constraints, and off-screen render pipeline are aligned with the current V1 product definition, and the existing main flow remains intact after regression validation.
