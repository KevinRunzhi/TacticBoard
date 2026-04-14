# Implementation Review 21

Date: 2026-04-03

## Scope

This round implemented the next editor usability batch after `implementation-review-20-part1-demo-blockers-2026-04-03.md`:

- explicit home/away selection for newly added players
- selected player team editing
- larger line click hit area
- larger area width/height limits
- clearer football rendering on canvas and GIF export
- slower GIF timing calibration

## Round 1

### Checks

- `cmd /c npm run build`
- `cmd /c npx vitest run src/test/core-object-crud.test.tsx src/test/pitch-canvas-line-reset.test.tsx src/test/pitch-canvas-line-hitarea.test.tsx src/test/tactics-export.test.ts`

### Findings

- The first attempt to run build/test inside the sandbox failed with `spawn EPERM` from Vite/Vitest child-process startup. This was environment-related, not a code error.
- The new batch needed state-model support first; otherwise UI controls would still be wired to the old implicit player-team behavior.

### Fixes Applied

- Added `playerPlacementTeam` to `EditorState` and normalized/persisted it through `mockProjects.ts`.
- Replaced automatic home/away balancing in `useEditorState.ts` with explicit team placement state.
- Added selected-player team editing through `RightPanel.tsx`.
- Rewrote `LeftPanel.tsx` and `MobileToolbar.tsx` to expose explicit home/away selection for new players.
- Updated `TabletLeftDrawer.tsx` and `TacticsEditor.tsx` to pass the new team-selection props through desktop, tablet, and mobile shells.
- Increased line hit area in `PitchCanvas.tsx` with a transparent `pointerEvents="stroke"` overlay.
- Replaced the simple ball circle with a clearer football graphic in both `PitchCanvas.tsx` and `tactics-export.ts`.
- Increased area width/height max from `60` to `100` in `RightPanel.tsx`.
- Retuned GIF delays in `tactics-export.ts`:
  - `slow`: `1200ms`
  - `standard`: `900ms`
  - `fast`: `650ms`
- Added/updated tests:
  - `core-object-crud.test.tsx`
  - `pitch-canvas-line-hitarea.test.tsx`
  - `pitch-canvas-line-reset.test.tsx`
  - `tactics-export.test.ts`

### Result

- `build` passed
- targeted tests passed: `4` files / `11` tests

## Round 2

### Checks

- `cmd /c npm run test`
- `cmd /c npm run lint`

### Findings

- No functional regressions were found in the full test suite.
- `eslint` still reports the existing `react-refresh/only-export-components` warnings in shared UI files; this batch did not introduce new lint errors.

### Fixes Applied

- No additional code fixes were required after the full regression pass.

### Result

- full tests passed: `23` files / `54` tests
- lint passed with `7` pre-existing warnings and `0` errors

## Round 3

### Checks

- reviewed the focused diff for:
  - state persistence
  - desktop/mobile/tablet prop flow
  - export timing updates
  - selection and click-target behavior

### Findings

- The explicit team-selection flow is now consistently wired through hook state, desktop left panel, mobile toolbar, tablet drawer, and player properties panel.
- The line hit-area change is additive and does not alter visible line rendering.
- PNG export is already handled by the visible SVG path from the previous batch; the new football graphic therefore affects both canvas view and PNG export automatically.
- GIF export now has the updated football graphic and slower timing, but visual playback still has not been manually inspected in a real downloaded file.

### Fixes Applied

- No further code changes were needed after diff review.

## Remaining Risks

- GIF timing is code- and test-verified, but not yet manually judged against a real exported file.
- The larger line hit area improves selection, but line editing is still a V1 coordinate-panel workflow rather than endpoint drag handles.
- New-player team defaults are persisted in editor state, but there is no separate global preference for default home/away placement yet.

## Conclusion

This batch is complete at the code-validation level. The next useful step is manual regression on:

- add home/away players from desktop and mobile layouts
- change a selected player from home to away in the properties panel
- select lines with the wider hit area
- create a full-field area using the new `100` width/height limits
- export and visually inspect a GIF with the recalibrated timing
