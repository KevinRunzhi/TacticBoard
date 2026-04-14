# Implementation Review 22

## Scope

- Fix saved-project reopen state drift in the editor.
- Fix duplicate-project state drift when a saved project also has a draft overlay.
- Fix match-info separator inconsistency between canvas and export output.
- Add stronger regression coverage for roundtrip and mixed-session editing flows.

## Round 1

### Findings

- Reopening a saved project rebuilt editor state from `MockProject`, which dropped `fieldView`, `fieldStyle`, `playerStyle`, `activeFormationId`, `formationMode`, and `playerPlacementTeam`.
- Duplicating a project reused the same reduced reconstruction path, so duplicates could also lose project-level editor settings.
- The canvas match banner used a wrong separator, while export used a different separator path.

### Fixes Applied

- Added `loadProjectEditorState()` in [E:\code\Project\IDKN\tactics-canvas-24\src\data\mockProjects.ts](E:\code\Project\IDKN\tactics-canvas-24\src\data\mockProjects.ts) to load the full persisted `EditorState`.
- Updated [E:\code\Project\IDKN\tactics-canvas-24\src\hooks\useEditorState.ts](E:\code\Project\IDKN\tactics-canvas-24\src\hooks\useEditorState.ts) so project entry restores from full saved state instead of rebuilding from display-only data.
- Updated [E:\code\Project\IDKN\tactics-canvas-24\src\data\mockProjects.ts](E:\code\Project\IDKN\tactics-canvas-24\src\data\mockProjects.ts) so `duplicateProject()` prefers the visible draft state, then the full saved state, and only falls back to the reduced reconstruction path when necessary.
- Added `META_TEXT_SEPARATOR` in [E:\code\Project\IDKN\tactics-canvas-24\src\lib\tactics-export.ts](E:\code\Project\IDKN\tactics-canvas-24\src\lib\tactics-export.ts) and reused it in [E:\code\Project\IDKN\tactics-canvas-24\src\components\tactics\PitchCanvas.tsx](E:\code\Project\IDKN\tactics-canvas-24\src\components\tactics\PitchCanvas.tsx).

### Verification

- Targeted regression suite:
  - `src/test/project-roundtrip-state.test.tsx`
  - `src/test/pitch-canvas-match-banner.test.tsx`
  - `src/test/entry-semantics.test.tsx`
  - `src/test/mock-projects-store.test.ts`
  - `src/test/tactics-export.test.ts`

## Round 2

### Findings

- A new mixed-session stress test initially failed because the test expected `addStep()` to preserve the current step description. Current product behavior intentionally clears description on `addStep()`.
- The same stress test also initially failed because `addLineFromTool()` depends on tool selection state, so the test had to follow the real UI sequence: switch tool first, then add the line.

### Fixes Applied

- Added [E:\code\Project\IDKN\tactics-canvas-24\src\test\editor-stress-roundtrip.test.tsx](E:\code\Project\IDKN\tactics-canvas-24\src\test\editor-stress-roundtrip.test.tsx) to simulate a mixed editing session:
  - preset start
  - project-level display changes
  - match-meta edits
  - player/text/line/area changes
  - step add/duplicate/reorder
  - save and reopen
- Adjusted the test flow to match actual editor semantics instead of asserting the wrong behavior.

### Verification

- Stress regression suite:
  - `src/test/editor-stress-roundtrip.test.tsx`
  - `src/test/project-roundtrip-state.test.tsx`
  - `src/test/pitch-canvas-match-banner.test.tsx`

## Round 3

### Findings

- No additional logic regressions were found in the saved-project entry path or separator path after the new tests passed.
- `npm run lint` failed once when run in parallel with build/test due a temporary `vitest.config.ts.timestamp-*.mjs` file race. This was an execution-order issue, not a source issue.

### Fixes Applied

- Re-ran `lint` serially after build/test to confirm the codebase state.

### Verification

- `cmd /c npm run build`
- `cmd /c npm run test`
- `cmd /c npm run lint`

All passed. Current automated status after this round:

- `26` test files passed
- `58` tests passed
- `lint` has `7` pre-existing `react-refresh/only-export-components` warnings and no errors

## Remaining Risks

- This round did not include a browser-driven manual export visual check. PNG/GIF logic is covered by regression tests, but final visual parity should still be confirmed manually.
- The repository still contains older Chinese encoding issues in unrelated UI strings and fixtures; they were not expanded in this round because the fixes here were intentionally scoped to the two confirmed bugs and their adjacent risks.
- `createEditorStateFromProject()` still exists as a fallback path. Current tested entry and duplication flows no longer depend on it for normal saved-project roundtrips, but it remains worth removing or narrowing in a later cleanup round.
