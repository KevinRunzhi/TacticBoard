# Reference Image Review

Date: 2026-04-01
Scope: project-level reference image model, local import flow, canvas display, and persistence

## Goal

Implement a project-level reference image capability that can be imported into local project state and displayed as a non-exported canvas aid.

## Round 1

Checks:
- `npm run build`

Findings:
- The editor had no real reference-image model even though the docs already described it as a project-level asset.
- The main technical constraint was keeping the implementation aligned with the local-first rule: imported images needed to live in project state, not as transient external paths.

Changes in this round:
- Added `ReferenceImage` to the tactics type model
- Added project-level `referenceImage` to editor state and persistence normalization
- Added reference-image import/update/remove helpers to `useEditorState`
- Implemented local file import via `FileReader` in the editor shell
- Added project-properties controls for import, visibility, opacity, and removal
- Rendered the reference image inside the pitch canvas
- Marked reference images as skipped during PNG export so they remain editor-only by default

## Round 2

Checks:
- `npm run test -- reference-image-model`

Findings:
- There was no regression coverage proving that imported reference-image state survives save and reopen.

Changes in this round:
- Added `src/test/reference-image-model.test.tsx`
- Locked the loop for:
  - set reference image
  - update visibility/opacity
  - save project
  - reopen project

## Round 3

Checks:
- `npm run build`
- `npm run test`
- `npm run lint`

Findings:
- Build passed
- Full test suite passed
- Lint passed with the same 7 pre-existing shared-UI fast-refresh warnings

Changes in this round:
- No further code changes were required after the full regression pass

## Result

Reference images are now a real project-level local asset instead of a documentation-only concept, and they stay out of PNG export by default.

## Remaining Risks

- The current implementation uses data URLs in local storage; large images may pressure browser storage limits sooner than a file-backed desktop/mobile runtime would
- There is no crop/transform UI yet beyond visibility and opacity controls
