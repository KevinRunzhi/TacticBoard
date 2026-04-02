# Match Meta Review

Date: 2026-04-01
Scope: project-level match metadata model, editor state integration, save/reopen persistence

## Goal

Implement the project-level match metadata model so the editor can carry title and match info through the main save flow.

## Round 1

Checks:
- `npm run build`

Findings:
- The editor had no project-level model for title, score, minute, or phase label.
- This blocked both the right-side properties model and any future export/header rendering.

Changes in this round:
- Added `MatchMeta` to the tactics type model
- Added project-level `matchMeta` to editor state and persistence normalization
- Wired `setMatchMetaField()` into `useEditorState`
- Added project-level match-info editing to the right-side properties panel
- Added a match-info banner render to the pitch canvas

## Round 2

Checks:
- `npm run test -- match-meta-model`

Findings:
- There was no regression coverage proving that project-level match metadata survives manual save and reopen.

Changes in this round:
- Added `src/test/match-meta-model.test.tsx`
- Locked the save/reopen persistence loop for:
  - title
  - score
  - minute
  - phase label

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
- No further code changes were required after the full regression pass

## Result

Project-level match metadata is now part of the real editor model and persists through the existing local project save flow.

## Remaining Risks

- Match metadata is rendered into the canvas banner, but export-specific include/exclude options are still not implemented
- There is no DOM interaction test yet for editing match metadata through the panel itself
