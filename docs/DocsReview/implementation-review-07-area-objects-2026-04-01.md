# Area Objects Review

Date: 2026-04-01
Scope: step-level area objects, canvas rendering, selection, movement, and persistence

## Goal

Add a real area-object capability so users can create region markers on the pitch, adjust their basic properties, and keep them across save/reopen.

## Round 1

Checks:
- `npm run build`

Findings:
- The editor previously exposed a `zone` tool in older iterations, but the current implementation had no state model, no canvas rendering, and no property editing path for area objects.

Changes in this round:
- Added `AreaObject` to the tactics type model
- Added `areas` to `StepFrame`
- Added selected-area state and update helpers to `useEditorState`
- Implemented area creation, selection, movement, and rendering in `PitchCanvas`
- Reintroduced the zone tool in left/mobile tool chrome now that it is backed by real behavior
- Added an area-properties view to the right-side panel

## Round 2

Checks:
- `npm run test -- areas-model`

Findings:
- There was no regression coverage for area creation/edit persistence.

Changes in this round:
- Added `src/test/areas-model.test.tsx`
- Locked the loop for:
  - create area
  - edit shape/size/colors/opacity
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
- Updated the old main-flow cleanup test to treat `zone` as a real implemented entry instead of an unfinished one

## Result

Area objects are now part of the actual editor model and can be created from the pitch canvas instead of existing as a dead toolbar concept.

## Remaining Risks

- Area resize is currently property-panel driven rather than direct canvas-handle resizing
- There is no DOM-level interaction test yet for clicking the canvas to create or drag an area
