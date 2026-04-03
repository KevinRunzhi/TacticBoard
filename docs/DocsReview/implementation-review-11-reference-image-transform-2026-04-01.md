# Implementation Review 11: Reference Image Crop And Position

## Scope

- Make project-level reference images positionable and scalable inside the pitch
- Add reference-image export toggle in the export config panel
- Keep reference-image export truthful when no reference image exists

## Round 1: Build And Type Validation

### Findings

- Reference images were still stretched to the full pitch with no crop or positioning controls
- The right-side property panel could not adjust any transform fields
- Wrappers around `RightPanel` needed to forward the new reference-image callbacks

### Fixes Applied

- Extended `ReferenceImage` with `scale / offsetX / offsetY`
- Updated import defaults and local persistence normalization so older records still load safely
- Added reference-image transform controls to `src/components/tactics/RightPanel.tsx`
- Forwarded the new callbacks through tablet and mobile property drawers
- Updated `src/components/tactics/PitchCanvas.tsx` to render the reference image with clip-path, centered scaling, and offset-based positioning

### Validation

- `npm run build`

## Round 2: Scoped Behavior Tests

### Findings

- A disabled reference-image export checkbox still triggered `onConfigChange` in tests, which would have created a misleading fake control

### Fixes Applied

- Added an explicit disabled guard in `ToggleRow`
- Added export-dialog coverage for disabled reference-image export state
- Extended reference-image persistence coverage to include `scale / offsetX / offsetY`
- Expanded export utility coverage to prove reference images stay in the export tree only when the toggle is enabled

### Validation

- `npx vitest run src/test/export-config-dialog.test.tsx src/test/export-config-utils.test.ts src/test/reference-image-model.test.tsx`

## Round 3: Regression Validation

### Findings

- No regressions found in editor entry, save, property writeback, area-object, or settings flows
- `eslint` still reports the same 7 pre-existing fast-refresh warnings in shared UI files

### Fixes Applied

- No additional code fixes were needed after the final regression run

### Validation

- `npm run test`
- `npm run lint`

## Remaining Risks

- Reference-image crop is currently implemented as scaled, clipped positioning over the pitch rather than a dedicated drag-handle crop box
- Large base64 reference images still live in local storage, so storage pressure remains a practical limit for very large source files
- There is not yet a direct canvas drag gesture for reference-image positioning; this round uses panel controls for predictability and lower regression risk
