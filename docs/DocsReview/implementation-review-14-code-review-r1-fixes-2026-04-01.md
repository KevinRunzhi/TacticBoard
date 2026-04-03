# Implementation Review 14

Date: 2026-04-01
Scope: address the valid high-priority findings from `code-review-r1-2026-04-01.md` in the current V1 codebase

## Targeted Findings

- `CR1-03` dragging interactions were still flowing through autosave debounce and could trigger repeated draft writes during move
- `CR1-07` step duplication still relied on a shallow spread in `addStep`, which was easy to misread and risky to maintain
- `CR1-08` `applyFormation` only rebuilt the home team and left the away team untouched
- `CR1-04` workspace typing still allowed `team` even though V1 is personal-only
- `CR1-05` / `CR1-06` export config and export format types had drifted behind the frozen docs
- `CR1-13` editor entry still carried old `teamId` / `templateId` seed branches
- `CR1-15` the 404 page still used English copy and only offered a single return path

## Round 1: Build / Type Pass

### Findings

- The storage and editor layers could be tightened without touching the current save/open main flow.
- The old team/template seed path was still wired into `Index.tsx`, `TacticsEditor.tsx`, and `useEditorState.ts`.

### Fixes Applied

- Removed `teamId` / `templateId` from the active editor entry path and reduced seed handling to `presetId` only.
- Moved `resume` restoration ahead of preset seeding inside `useEditorState`.
- Added `cloneStepFrame(...)` and switched `addStep` to clone nested arrays and objects explicitly.
- Added drag-aware autosave control by skipping draft autosave while dragging and triggering a post-drag autosave cycle on drag end.
- Updated `applyFormation(...)` to rebuild both home and away players and clear transient lines, text, and areas for the current step.
- Expanded `ExportFormat` to `'png' | 'gif'` and aligned `ExportConfig` with current docs fields.
- Added transparent export handling via `data-export-role="canvas-background"`.
- Reduced `Workspace` to `personal` only at the type level.
- Rewrote `NotFound.tsx` into Chinese and added both workbench and projects exits.

### Validation

- `npm run build`

Result: passed

## Round 2: Targeted Behavior Tests

### Findings

- The key risks after the code edits were behavior-level, not compile-level:
  - autosave firing during drag
  - formation rebuild symmetry
  - workspace normalization still accepting old team-only assumptions in tests
  - export config helper behavior after the new fields were added

### Fixes Applied

- Added `src/test/editor-autosave-drag.test.tsx`
  - verifies no draft is written during drag
  - verifies draft is written after drag end
- Extended `src/test/format-switch.test.tsx`
  - verifies `applyFormation(...)` rebuilds both teams
  - verifies transient areas/texts are cleared
  - verifies added steps do not share player references with previous steps
- Updated `src/test/mainflow-cleanup.test.tsx`
  - workspace test now asserts personal-only semantics without depending on a V1-nonexistent `team` setter path
- Extended `src/test/export-config-utils.test.ts`
  - verifies transparent background and optional export layers are stripped when toggled off

### Validation

- `npx vitest run src/test/editor-autosave-drag.test.tsx src/test/format-switch.test.tsx src/test/mainflow-cleanup.test.tsx src/test/export-config-utils.test.ts`

Result: 4 files passed, 12 tests passed

## Round 3: Full Regression

### Findings

- No new runtime regressions were surfaced by the full suite.
- Remaining warnings are pre-existing and outside this change scope.

### Validation

- `npm run test`
- `npm run lint`

Results:

- Full test suite passed: 16 files, 31 tests
- Lint passed with 7 existing `react-refresh/only-export-components` warnings in shared UI files

## Remaining Risks / Follow-up

- GIF is now aligned at the type/config level, but actual GIF export behavior is still not implemented in the canvas export path.
- `mockTeams.ts` and `mockTemplates.ts` remain in the repo as unused data files. They no longer affect the active editor entry flow, but they can still be removed or explicitly archived later.
- The document-to-code naming drift called out in `CR1-09` to `CR1-12` is partly a documentation alignment task rather than a runtime bug fix. This round intentionally prioritized behavior bugs and active-code drift first.
- `CR1-02` was left unchanged because current `clearAllLocalProjectData()` behavior is consistent with the current V1 setting-page expectation: clear means stay cleared, not reseed.
- `CR1-01` was not treated as an active runtime bug after the current entry flow cleanup because the active route logic still forces seeded quick-starts into `new` mode instead of `resume`.

## Conclusion

The valid, active high-priority issues from `code-review-r1-2026-04-01.md` that could affect the current V1 main flow have been repaired and covered with behavior tests. The remaining items are either intentional behavior, archived/unused residue, or doc-alignment follow-up rather than current-flow breakage.
