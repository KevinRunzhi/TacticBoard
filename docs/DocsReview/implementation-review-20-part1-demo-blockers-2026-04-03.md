# Implementation Review 20 - Part 1 Demo Blockers - 2026-04-03

## Scope

This round covered the first batch of issues extracted from the manual V1 checklist:

- make `Settings` a real preferences page instead of an info-only page
- persist editor/export defaults locally and apply them to new projects
- make the export dialog usable on smaller screens
- align PNG export with the actual visible SVG canvas
- improve the match banner layout used by the canvas/export path

## Round 1

### Findings

- `SettingsV2` still only showed static information cards, so the user complaint "can open but cannot configure" was valid.
- `createBlankEditorState` still hardcoded `11v11 / realistic / dot`, so even a real settings page would not affect new projects.
- `PitchCanvas` still used a second canvas-only renderer for PNG export, which explained the reported mismatch between the visible canvas and exported PNG.
- `ExportConfigDialog` still used a plain fixed-size dialog and could hide the primary action on shorter screens.

### Fixes Applied

- Added `src/lib/editor-preferences.ts` to store local defaults for field format, field style, player style, export format, and export ratio.
- Reworked `src/lib/export-config.ts` so export defaults come from local editor preferences.
- Rewrote `src/pages/SettingsV2.tsx` into a real preferences screen with persisted options and a truthful data-clear action.
- Rewrote `src/components/tactics/ExportConfigDialog.tsx` to use an internal scroll area and a fixed footer for cancel/export actions.
- Updated `src/data/mockProjects.ts` so:
  - settings are part of managed local data
  - clearing local data also clears preferences
  - new blank editor state reads the saved defaults

### Validation

- targeted tests for settings and export dialog passed
- build/lint failed due syntax corruption later found in `PitchCanvas`

## Round 2

### Findings

- `PitchCanvas` contained multiple corrupted nullish-coalescing expressions introduced around the new PNG export path:
  - `referenceImage?.scale ?? 1` was broken
  - `referenceImage?.offsetX ?? 0` and `referenceImage?.offsetY ?? 0` were broken
  - `config ?? createDefaultExportConfig()` was broken in both `exportPng` and `exportGif`
- the first scripted replacement of `MatchMetaBanner` left an old trailing function fragment at the bottom of the file

### Fixes Applied

- repaired all broken nullish-coalescing expressions in `src/components/tactics/PitchCanvas.tsx`
- switched PNG export to rasterize the current SVG via:
  - `applyExportConfigToSvg`
  - new `exportSvgAsPng` helper in `src/lib/tactics-export.ts`
- replaced the match banner with a centered, larger layout in `src/components/tactics/PitchCanvas.tsx`
- removed the stale duplicated banner fragment left after replacement

### Validation

- build/lint progressed after each syntax fix
- targeted `vitest` suite for settings/export continued to pass

## Round 3

### Findings

- after the functional fixes were stable, one new lint warning remained in `PitchCanvas`: unnecessary dependencies in `useImperativeHandle`

### Fixes Applied

- trimmed the `useImperativeHandle` dependency list in `src/components/tactics/PitchCanvas.tsx`
- added/updated regression coverage:
  - `src/test/settings-data.test.tsx`
  - `src/test/export-config-dialog.test.tsx`
  - `src/test/export-config-utils.test.ts`

### Validation

- `npm run build` passed
- `npm run test` passed, `22` files / `52` tests
- `npm run lint` passed with only the pre-existing `react-refresh/only-export-components` warnings in shared UI files

## Remaining Risks

- PNG export now matches the current SVG canvas path, but it no longer invents extra export-only overlays; `includeStepInfo` and `includeGhostTrail` still need a dedicated SVG-side implementation if they must affect PNG output.
- No browser-level manual check was performed in this round for actual downloaded PNG pixels; validation here was code-level plus automated tests.
- The next manual-fix batch is still pending:
  - player home/away creation and editing
  - line hit target
  - area max bounds
  - ball icon
  - GIF speed retuning
