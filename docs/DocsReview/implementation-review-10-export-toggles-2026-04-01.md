# Implementation Review 10: Export Title And Match-Info Toggles

## Scope

- Add title and match-info inclusion switches to the export config panel
- Mark banner SVG nodes so export can remove title and match-info independently
- Verify the export config utility handles all toggle combinations

## Round 1: Build And Type Validation

### Findings

- Export config existed, but title and match info were still always rendered into the exported SVG
- The top banner had no stable export roles, so there was no safe way to remove only part of it

### Fixes Applied

- Added `导出标题` and `导出比赛信息` controls to `src/components/tactics/ExportConfigDialog.tsx`
- Tagged banner, title, and match-info nodes in `src/components/tactics/PitchCanvas.tsx` with explicit `data-export-role` values

### Validation

- `npm run build`

## Round 2: Scoped Behavior Tests

### Findings

- The first export utility test only covered the default case, which was not enough to prove the toggle rules

### Fixes Applied

- Expanded `src/test/export-config-utils.test.ts` to cover:
  - hide title only
  - hide match info only
  - hide both and remove the banner
- Expanded `src/test/export-config-dialog.test.tsx` to cover the new checkboxes

### Validation

- `npx vitest run src/test/export-config-dialog.test.tsx src/test/export-config-utils.test.ts`

## Round 3: Regression Validation

### Findings

- No regressions found in the broader editor, save, or settings flows
- `eslint` still reports the same 7 pre-existing fast-refresh warnings in shared UI files

### Fixes Applied

- No additional code changes were needed after regression

### Validation

- `npm run test`
- `npm run lint`

## Remaining Risks

- These toggles currently affect exported SVG output only; there is not yet a separate editor preview state for export-only visibility
- The banner still uses a single shared background block, so the exported layout is intentionally simple when only one side of the banner remains
