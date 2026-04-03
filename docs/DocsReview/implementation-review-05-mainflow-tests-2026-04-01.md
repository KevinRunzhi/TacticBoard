# Main Flow Test Coverage Review

Date: 2026-04-01
Scope: storage-layer regression tests, format-switch regression tests, final main-flow test pass

## Goal

Close the biggest remaining regression gaps in the V1 main flow by adding durable tests for:
- storage operations
- draft vs saved project separation
- format-switch keep-objects path
- format-switch regenerate path

## Round 1

Checks:
- `npm run build`

Findings:
- Existing coverage already protected entry semantics, property writeback, and part of the cleaned UI shell.
- The remaining weak spots were:
  - storage-layer rename / duplicate / delete behavior
  - draft vs saved project separation
  - format switching behavior after the new confirmation flow

Changes in this round:
- Added `src/test/mock-projects-store.test.ts`
- Added `src/test/format-switch.test.tsx`

## Round 2

Checks:
- `npm run test -- mock-projects-store format-switch`

Findings:
- Newly added tests passed on the first targeted run.
- This confirmed that:
  - storage operations now act on the real local index rather than placeholder UI behavior
  - unnamed drafts remain separate from saved projects in workspace listings
  - format switching preserves objects for the keep-objects path
  - format regeneration resets players, drawings, and ball position for the regenerate path

Changes in this round:
- No code fixes were required after the targeted run

## Round 3

Checks:
- `npm run build`
- `npm run test`
- `npm run lint`

Findings:
- Build passed
- Full test suite passed with 7 files / 14 tests
- The first lint run failed due the same transient Vite timestamp-module environment issue seen earlier
- The second lint run succeeded
- Remaining lint output is still limited to the 7 pre-existing shared-UI fast-refresh warnings

Changes in this round:
- No further code changes were required after the full regression pass

## Result

The main flow now has regression coverage across:
- entry semantics
- property writeback
- fake-entry cleanup
- settings/local-data truthfulness
- storage operations
- format switching

## Remaining Risks

- There is still no DOM-driven end-to-end editor interaction test for dragging or canvas gestures
- Export behavior is currently verified by build/runtime path confidence rather than file-output assertions
