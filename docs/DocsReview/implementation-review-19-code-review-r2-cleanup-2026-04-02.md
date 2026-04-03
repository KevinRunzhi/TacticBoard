# Implementation Review 19

## Scope

- Address the remaining cleanup items from `code-review-r2-2026-04-02.md`
- Targeted items:
  - `CR2-01` project-name fallback hack cleanup
  - `CR2-03` shared step-frame clone logic
  - `CR2-08` dead `mockTeams.ts` / `mockTemplates.ts`
  - `CR2-09` byte usage calculation
  - `CR2-10` autosave signature optimization

## Round 1: Code Cleanup And Build Validation

### Focus

- Move active project-name normalization into a shared utility
- Move active step-frame cloning into a shared utility
- Remove dead data files
- Replace autosave-wide `JSON.stringify` dependency tracking

### Fixes Applied

1. Added shared project-name normalization
   - New file: `tactics-canvas-24/src/lib/project-name.ts`
   - Added:
     - `DEFAULT_PROJECT_NAME`
     - `normalizeProjectNameValue`
   - Active storage normalization now goes through the shared helper in `mockProjects.ts`.

2. Added shared step-frame clone utility
   - New file: `tactics-canvas-24/src/lib/step-frame.ts`
   - Added:
     - `buildStepLabel`
     - `cloneStepFrame`
   - Active storage and editor call sites now use the same shared clone function.

3. Removed dead source files
   - Deleted:
     - `tactics-canvas-24/src/data/mockTeams.ts`
     - `tactics-canvas-24/src/data/mockTemplates.ts`

4. Replaced approximate storage usage counting
   - `mockProjects.ts` now uses `new Blob([key, value]).size`
   - This is closer to actual UTF-8 byte size than raw character counts.

5. Optimized autosave trigger dependencies
   - Removed the `autosaveSignature = JSON.stringify(...)` pattern from `useEditorState.ts`
   - Autosave now depends directly on the persisted state slices instead of serializing the entire step tree on every meaningful edit.

6. Routed actual project-name display/use paths through shared normalization
   - `DashboardV2.tsx` recent-project display now uses `normalizeProjectNameValue`
   - `TacticsEditor.tsx` active save/export/return flows now use a normalized `displayProjectName`

### Validation

- Command: `npm run build`
- Result: passed
- Note: existing Vite chunk-size warning remains, but no new build issues were introduced.

## Round 2: Targeted Regression Tests

### Focus

- Add direct regression coverage for the cleanup batch
- Confirm storage and clone behavior changed as intended

### Added / Updated Tests

- Updated `tactics-canvas-24/src/test/mock-projects-store.test.ts`
  - Added project-name normalization coverage
  - Added UTF-8 byte counting coverage
  - Added shared step-frame clone consistency coverage

### Validation

- Command:
  - `npx vitest run src/test/mock-projects-store.test.ts src/test/settings-data.test.tsx src/test/step-management.test.tsx src/test/step-structure-behavior.test.tsx`
- Result: passed
- Totals: 4 files, 12 tests

## Round 3: Full Regression

### Focus

- Confirm that the cleanup batch did not regress the broader app

### Validation

- Command: `npm run test`
  - Result: passed
  - Totals: 22 files, 51 tests
- Command: `npm run lint`
  - Result: passed with existing warnings only
  - Existing warnings: 7 `react-refresh/only-export-components` warnings in shared UI files

### Notes

- Full regression still emits the same existing React Router future-flag warnings in UI tests.
- These warnings were already present and are not introduced by this cleanup round.

## Files Changed In This Review Round

- `tactics-canvas-24/src/lib/project-name.ts`
- `tactics-canvas-24/src/lib/step-frame.ts`
- `tactics-canvas-24/src/data/mockProjects.ts`
- `tactics-canvas-24/src/hooks/useEditorState.ts`
- `tactics-canvas-24/src/pages/DashboardV2.tsx`
- `tactics-canvas-24/src/components/tactics/TacticsEditor.tsx`
- `tactics-canvas-24/src/test/mock-projects-store.test.ts`
- `tactics-canvas-24/src/data/mockTeams.ts` (deleted)
- `tactics-canvas-24/src/data/mockTemplates.ts` (deleted)

## Remaining Risks

1. A legacy local fallback snippet still exists in a couple of UI files.
   - Active behavior paths now go through shared normalization, so the functional risk is removed.
   - If needed, those old inline snippets can be cleaned further in a low-risk follow-up.

2. Autosave is lighter now, but still depends on immutable state discipline.
   - If future code starts mutating `steps` in place, autosave triggers could become less reliable.

## Conclusion

- The targeted `code-review-r2` cleanup batch is functionally addressed.
- Storage and editor now share the same active step-clone path.
- Local storage usage reporting is more accurate.
- Unused team/template seed files are removed.
- Autosave no longer serializes the full step tree just to detect changes.
