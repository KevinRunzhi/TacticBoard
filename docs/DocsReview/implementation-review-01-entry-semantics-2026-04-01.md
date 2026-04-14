# Entry Semantics Review

Date: 2026-04-01
Scope: `/editor` entry semantics, draft resume flow, dashboard/project-page navigation

## Goal

Make `new`, `resume draft`, and `open saved project` three explicit behaviors instead of one overloaded `/editor` path.

## Round 1

Checks:
- `npm run build`

Findings:
- No compile or type errors after introducing explicit editor entry mode handling.

Changes in this round:
- Added explicit editor entry modes in `useEditorState`: `new`, `resume`, `project`
- Made `/editor` default to `new`
- Forced preset/template/team quick start to behave as `new`
- Added dedicated helpers for draft and saved-project resolution in local project storage
- Updated dashboard and project-page navigation to use `mode=new` or `mode=resume` explicitly

## Round 2

Checks:
- `npm run test -- entry-semantics`

Findings:
- The repo had no targeted regression coverage for entry semantics.

Changes in this round:
- Added `src/test/entry-semantics.test.tsx`
- Locked these cases with tests:
  - `mode=new` ignores unsaved draft
  - `mode=resume` restores unsaved draft
  - `projectId` opens saved project
  - preset quick start is treated as forced-new and does not get overridden by draft

## Round 3

Checks:
- `npm run build`
- `npm run test`
- `npm run lint`

Findings:
- Build and tests passed
- Lint reported one warning introduced by this round in `ProjectsV2.tsx` due to a refresh-only `useMemo` dependency pattern

Changes in this round:
- Replaced the refresh-only `useMemo` pattern in `ProjectsV2.tsx` with explicit local state + `refreshProjects`
- Re-ran lint and confirmed the remaining 7 warnings are pre-existing UI fast-refresh warnings in shared component files, not introduced by this change set

## Result

Entry semantics are now stable enough for downstream work:
- `new` no longer silently restores draft
- `resume` is explicit
- saved projects stay on `/editor/:projectId`
- dashboard quick-start no longer gets hijacked by local draft state

## Remaining Risks

- Dashboard and editor still depend on localStorage-only state, so browser-tab concurrency is not yet addressed
- The worktree still contains a legacy workspace context, but it no longer drives the main entry semantics in practice
