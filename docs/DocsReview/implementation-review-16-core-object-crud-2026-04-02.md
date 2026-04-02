# Implementation Review 16

Date: 2026-04-02
Scope: implement Part 1 of `code-review-r2-2026-04-02.md` by filling the editor's core object CRUD gaps for players, ball, lines, and text

## Goal

Close the highest-priority editor capability gap called out in `CR2-05`:

- player add / remove
- ball independent movement
- line add / update / remove
- text add / update / remove

The scope for this round was intentionally limited to the minimum usable loop:

- create from the canvas
- select on the canvas
- edit / delete in the right properties panel
- persist through local save and reopen

## Round 1: Build / Structure Pass

### Findings

- `EditorState` still only had dedicated selection state for players and areas.
- `useEditorState` exposed no CRUD APIs for lines or text, no player add / remove, and no independent ball move API.
- `PitchCanvas` already rendered lines, texts, and the ball, but only areas had a real create/edit/remove loop.
- `RightPanel` only knew how to edit project data, players, and areas.

### Fixes Applied

- Expanded `EditorState` with:
  - `selectedLineId`
  - `selectedTextId`
- Updated state normalization and blank project creation in:
  - `src/types/tactics.ts`
  - `src/data/mockProjects.ts`
- Added new editor-state actions in `src/hooks/useEditorState.ts`:
  - `selectLine`
  - `selectText`
  - `addPlayerAt`
  - `removeSelectedPlayer`
  - `addTextAt`
  - `updateSelectedText`
  - `removeSelectedText`
  - `addLineFromTool`
  - `updateSelectedLine`
  - `removeSelectedLine`
  - `moveBall`
  - `moveText`
- Updated `TacticsEditor` to wire the new state actions into the editor shell.
- Rebuilt `RightPanel` so it can now switch between:
  - project properties
  - player properties
  - text properties
  - line properties
  - area properties
- Extended `PitchCanvas` to support:
  - click-to-add player
  - click-to-add text
  - two-click line creation from the active line tool
  - ball movement in ball mode
  - text selection / dragging
  - line selection

### Validation

- `npm run build`

Result: passed

## Round 2: Targeted Behavior Tests

### Findings

- The new state APIs needed direct regression coverage for the exact gaps from `CR2-05`.
- The first draft of the line test failed because it changed the active tool and created the line inside the same `act(...)` block.
- That failure exposed a test modeling issue, not a runtime editor bug:
  - in the real UI, tool selection and canvas click are two separate events
  - `addLineFromTool(...)` reads the current tool from state, so a same-tick synthetic call can observe the old value

### Fixes Applied

- Added `src/test/core-object-crud.test.tsx` covering:
  - player add / remove
  - line create / update / remove
  - text create / update / move / remove
  - ball move persistence after save / reopen
- Adjusted the line tests so tool change and line creation happen in separate acts, matching the real UI interaction model.
- Re-ran neighboring editor state tests to make sure the new object CRUD did not break existing area or property writeback behavior.

### Validation

- `npx vitest run src/test/core-object-crud.test.tsx src/test/areas-model.test.tsx src/test/property-writeback.test.tsx`

Result: 3 files passed, 6 tests passed

## Round 3: Full Regression / Interaction Cleanup

### Findings

- While reviewing the canvas interaction flow after the targeted tests passed, there was still a subtle UX bug:
  - the outer pan handler could still steal background clicks in some object-creation modes
  - this would make a tool appear "unresponsive" even though the state logic was correct
- `pendingLineStart` could also linger too long if the user switched intent mid-creation.
- The first full lint run hit the same transient Vite timestamp-file `ENOENT` seen in earlier rounds; the rerun confirmed this was environment noise, not a code regression.

### Fixes Applied

- Tightened `PitchCanvas` pan entry rules so background pan only starts from the true select/pan flow instead of object-creation flows.
- Cleared `pendingLineStart` when:
  - switching away from line tools
  - creating another object type
  - returning to neutral background selection
  - moving the ball through ball mode
- Kept the line system intentionally minimal for this round:
  - create with two clicks
  - select by clicking the rendered line
  - edit coordinates / type in the right panel
  - delete from the right panel

### Validation

- `npm run build`
- `npm run test`
- `npm run lint`

Results:

- Build passed
- Full test suite passed: 18 files, 40 tests
- Lint passed after rerun with 7 pre-existing `react-refresh/only-export-components` warnings in shared UI files
- The transient first-run lint `ENOENT` against a Vite timestamp module did not reproduce on rerun

## Remaining Risks / Follow-up

- This round validates state and component wiring well, but it does not include a browser-level manual pass for direct canvas pointer interactions.
- Line editing is intentionally still a minimal V1 flow:
  - two-click create
  - properties-panel coordinate editing
  - no endpoint drag handles yet
- The ball now moves independently, but it still has no dedicated selection state or properties panel.
- Player add defaults are intentionally simple:
  - alternating home / away assignment by count
  - generated name / number / `SUB` position
  - this is good enough for V1 CRUD, but later may need smarter defaults

## Conclusion

The editor no longer has a major CRUD hole for its core object types. Players, text notes, lines, and the ball now participate in the same basic create/select/edit/delete loop as areas, and the changes persist through the local save/reopen flow. This closes the highest-value implementation gap from `code-review-r2` and gives the editor a much more complete V1 baseline before step-management work begins.
