# Implementation Review 18

## Scope

- Retest `Part 1: 核心对象 CRUD`
- Retest `Part 2: 步骤管理`
- Expand verification from hook-level behavior to component-level interaction coverage

## Round 1: Build And Boundary Review

### Focus

- Re-read the current `useEditorState` structural step mutations
- Re-read `PitchCanvas` object interaction boundaries
- Run a full production build before adding deeper regression coverage

### Findings

1. Structural step mutations were not fully aligned.
   - `deleteCurrentStep` already stopped playback.
   - `addStep`, `duplicateCurrentStep`, and `moveCurrentStep` should follow the same rule to avoid playback continuing against a changed step order.

2. Pending line creation state could survive object interaction.
   - When a line start point had already been chosen, clicking a player, ball, text, area, or existing line could leave the pending start active.
   - That made it possible for a later background click to create an unintended line segment.

### Fixes Applied

- Updated `tactics-canvas-24/src/hooks/useEditorState.ts`
  - `addStep`, `duplicateCurrentStep`, and `moveCurrentStep` now all force `isPlaying: false`.
- Updated `tactics-canvas-24/src/components/tactics/PitchCanvas.tsx`
  - Clear `pendingLineStart` inside player/ball/text/area/line interaction handlers.

### Validation

- Command: `npm run build`
- Result: passed
- Note: existing Vite chunk-size warning remains, but no new build failures were introduced.

## Round 2: Targeted Regression Tests

### Focus

- Add deeper regression coverage for the two touched parts
- Cover both state-level logic and UI-level action wiring

### Added Tests

- `tactics-canvas-24/src/test/step-structure-behavior.test.tsx`
  - Verifies that add/duplicate/move/delete step actions stop playback and clear stale selection.
- `tactics-canvas-24/src/test/step-controls-ui.test.tsx`
  - Verifies desktop step-bar action wiring for duplicate/move/delete and disabled edge states.
- `tactics-canvas-24/src/test/pitch-canvas-line-reset.test.tsx`
  - Verifies that starting a line, then switching to player selection, does not produce an accidental line on the next canvas click.

### Findings

1. The first version of the step-bar UI test used the last step as the current step.
   - That made the "move right" action correctly disabled, so the test expectation was wrong.

### Fixes Applied

- Updated `tactics-canvas-24/src/test/step-controls-ui.test.tsx`
  - Switched the test fixture to a three-step setup with the middle step selected.

### Validation

- Command:
  - `npx vitest run src/test/core-object-crud.test.tsx src/test/step-management.test.tsx src/test/step-structure-behavior.test.tsx src/test/step-controls-ui.test.tsx src/test/pitch-canvas-line-reset.test.tsx`
- Result: passed
- Totals: 5 files, 12 tests

## Round 3: Full Regression

### Focus

- Confirm that the stricter coverage and small fixes do not regress the broader editor/workbench flow

### Validation

- Command: `npm run test`
  - Result: passed
  - Totals: 22 files, 48 tests
- Command: `npm run lint`
  - Result: passed with existing warnings only
  - Existing warnings: 7 `react-refresh/only-export-components` warnings in shared UI files

### Notes

- The full test run still emits existing React Router future-flag warnings in some UI tests.
- These warnings were already present and are not introduced by this round.

## Files Changed In This Review Round

- `tactics-canvas-24/src/hooks/useEditorState.ts`
- `tactics-canvas-24/src/components/tactics/PitchCanvas.tsx`
- `tactics-canvas-24/src/test/step-controls-ui.test.tsx`
- `tactics-canvas-24/src/test/step-structure-behavior.test.tsx`
- `tactics-canvas-24/src/test/pitch-canvas-line-reset.test.tsx`

## Remaining Risks

1. The new coverage is still unit/component-level.
   - Real browser pointer feel for drag interactions has not been manually re-checked in this round.

2. Step reordering is currently button-based only.
   - Drag-and-drop timeline reorder is still out of scope.

3. Line creation is still a two-click V1 flow.
   - Endpoint drag handles are still not implemented.

## Conclusion

- `Part 1` and `Part 2` both passed a stricter three-round retest.
- Two real behavior edges were tightened:
  - structural step operations now always stop playback
  - pending line creation no longer leaks across object selection
- Regression coverage is now stronger at both state and component levels, and the broader app test suite remains green.
