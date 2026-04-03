# Implementation Review 13 - Editor Save And Return - 2026-04-01

## Scope

- Tighten the editor shell save flow so users can see truthful save state.
- Make returning to the workbench immediately reflect the latest project state.
- Preserve first-save feedback through the first route transition from `/editor` to `/editor/:projectId`.

## Round 1 - Build And Interface Validation

### Findings

- The old editor chrome still treated "return to workbench" as a plain route change, so the workbench could not show any immediate feedback after a save.
- The toolbar components did not have a stable place to surface save state, especially on mobile where there was no explicit save action.

### Fixes Applied

- Reworked the editor shell to compute save status from the current editor fingerprint and entry source.
- Added save-state UI to both desktop/tablet and mobile top bars.
- Added explicit save action to the mobile top bar.
- Added workbench return payloads so the dashboard can show a just-saved banner and highlight the corresponding project card.

### Validation

- `npm run build`

### Result

- Passed.

## Round 2 - Targeted Behavior Tests

### Findings

- The first-save label was being lost after the route changed from `/editor` to `/editor/:projectId`.
- The original targeted test expected the reopened project to keep the "first save" label forever, which is not the correct long-term state.

### Fixes Applied

- Passed the save-kind metadata through the first route replacement so the editor can keep the "首次已保存" status immediately after the first save.
- Updated the targeted flow test so reopening the project from the workbench expects the stable "本地已保存" state.
- Refreshed the workbench entry test copy to match the rewritten dashboard text.

### Validation

- `npx vitest run src/test/dashboard-workbench-entry.test.tsx src/test/editor-save-return.test.tsx src/test/entry-semantics.test.tsx src/test/projects-entry-semantics.test.tsx`

### Result

- Passed.

## Round 3 - Full Regression Validation

### Findings

- No new logic regressions were found in the touched main-flow area.
- Existing repository warnings remain in shared UI component files under `react-refresh/only-export-components`.
- The Vite production bundle still crosses the 500 kB warning threshold.

### Fixes Applied

- No additional code fixes were required after the full regression pass.

### Validation

- `npm run build`
- `npm run test`
- `npm run lint`

### Result

- All commands passed.
- `lint` finished with 7 pre-existing warnings and no new errors.

## Files Touched In This Round

- `tactics-canvas-24/src/components/tactics/TopToolbar.tsx`
- `tactics-canvas-24/src/components/tactics/MobileTopBar.tsx`
- `tactics-canvas-24/src/components/tactics/TacticsEditor.tsx`
- `tactics-canvas-24/src/hooks/useEditorState.ts`
- `tactics-canvas-24/src/data/mockProjects.ts`
- `tactics-canvas-24/src/pages/DashboardV2.tsx`
- `tactics-canvas-24/src/test/dashboard-workbench-entry.test.tsx`
- `tactics-canvas-24/src/test/editor-save-return.test.tsx`

## Remaining Risks

- Some seeded sample project names and relative-time strings still come from older encoded mock data outside this flow and may need a broader copy-cleanup pass later.
- The current workbench feedback is router-state based; it is stable for normal navigation, but it is not intended to survive a hard refresh in the middle of the return jump.
- The build still emits a chunk-size warning, which is not a correctness issue but is worth revisiting when the editor feature set grows further.
