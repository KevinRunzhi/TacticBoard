# Implementation Review 17

Date: 2026-04-02
Scope: implement Part 2 of `code-review-r2-2026-04-02.md` by closing `CR2-04` for step deletion, duplication, and reordering

## Goal

Close the current step-management gap in the editor so the user can:

- duplicate the current step
- delete the current step
- move the current step left / right

This round intentionally stayed within the existing V1 UI shell:

- no timeline drag-and-drop rework
- no editable custom step labels
- no bulk step actions

The goal was to make the current timeline and mobile steps drawer actually usable without widening scope.

## Round 1: Build / State Pass

### Findings

- `useEditorState` only exposed:
  - `addStep`
  - `setStep`
  - `togglePlay`
- The bottom step bar already showed a copy icon, but it was wired to `onAddStep`, so it did not behave like a real duplicate action.
- Neither the desktop step bar nor the mobile steps drawer exposed delete or reorder controls.
- Step labels were generated in multiple places, so any new step-management logic needed a single renumbering rule to avoid drift.

### Fixes Applied

- Added `renumberStepFrames(...)` in `src/hooks/useEditorState.ts` so step labels stay consistent after structural changes.
- Added new step actions in `src/hooks/useEditorState.ts`:
  - `duplicateCurrentStep`
  - `deleteCurrentStep`
  - `moveCurrentStep('left' | 'right')`
- Implemented these behaviors:
  - duplicate inserts immediately after the current step
  - delete never removes the final remaining step
  - delete clamps the active index to the nearest valid step
  - reorder keeps the moved step selected by updating `currentStepIndex`
  - all three operations clear current object selections to avoid stale selection state leaking across steps
- Updated `TacticsEditor` to wire the new step actions into:
  - desktop bottom step bar
  - tablet bottom step bar
  - mobile steps drawer

### Validation

- `npm run build`

Result: passed

## Round 2: Targeted Step Tests

### Findings

- The most important risks in this round were:
  - duplicated steps accidentally sharing nested references
  - delete producing an invalid active index
  - reorder moving frames but not the active selection
- The first draft of the duplicate test assumed the duplicated area would remain selected automatically.
- The implementation intentionally clears selection after structural step operations, so that assumption was wrong.

### Fixes Applied

- Added `src/test/step-management.test.tsx` covering:
  - duplicate inserts after the source step
  - duplicate content is deep-cloned
  - delete keeps at least one step alive
  - delete chooses a valid next current step
  - reorder left / right keeps the moved step active
  - labels stay renumbered after structure changes
- Updated the duplicate test to explicitly re-select the duplicated area before mutating it, matching the intended editor behavior.
- Re-ran neighboring tests that touch step cloning and editor object behavior:
  - `format-switch.test.tsx`
  - `core-object-crud.test.tsx`

### Validation

- `npx vitest run src/test/step-management.test.tsx src/test/format-switch.test.tsx src/test/core-object-crud.test.tsx`

Result: 3 files passed, 12 tests passed

## Round 3: Full Regression / UI Wiring Check

### Findings

- No regression appeared in save / workbench / export / object CRUD flows after wiring the new step actions into the existing editor shell.
- The mobile and desktop step surfaces now both expose the same core operations, which reduces behavior drift between breakpoints.
- React Router future warnings remain test-environment noise, not regressions caused by this round.

### Fixes Applied

- Rebuilt `src/components/tactics/BottomStepBar.tsx` into a cleaner version with:
  - real duplicate action
  - delete action
  - left / right move actions
  - disabled states at boundaries
- Rebuilt `src/components/tactics/MobileStepsDrawer.tsx` to match the same action set in the mobile flow.

### Validation

- `npm run test`
- `npm run lint`

Results:

- Full test suite passed: 19 files, 44 tests
- Lint passed with the same 7 pre-existing `react-refresh/only-export-components` warnings in shared UI component files

## Remaining Risks / Follow-up

- This round does not add drag-and-drop step reordering in the timeline; reorder is button-based only.
- Step labels are still system-generated (`第 1 步`, `第 2 步`, ...). If later versions allow custom labels, renumbering rules will need to change.
- I did not run a browser-level manual interaction pass for the new step buttons yet, so remaining risk is mainly in visual / tactile UX rather than state logic.
- Structural step actions currently clear selected objects by design. That avoids stale selection bugs, but it is still a UX choice worth keeping in mind if later reviews expect selection persistence.

## Conclusion

`CR2-04` is now functionally closed for the V1 editor. The editor no longer stops at "only add and switch steps"; users can now duplicate, delete, and reorder steps in both desktop and mobile flows, and the state logic is covered by dedicated tests plus full-suite regression validation.
