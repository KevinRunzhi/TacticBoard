# Main Flow Cleanup Review

Date: 2026-04-01
Scope: editor chrome cleanup, unfinished tool entry removal, workspace behavior freeze

## Goal

Remove editor entry points that over-promise unfinished V1 capabilities, and freeze workspace behavior to the current single-device personal-only product direction.

## Round 1

Checks:
- `npm run build`

Findings:
- The main editor chrome still exposed unfinished `zone`, `layers`, quick-action, and custom-formation-save affordances.
- Workspace behavior was still structurally dual-mode even though the product has already narrowed to local personal-only usage.

Changes in this round:
- Rebuilt `LeftPanel` to keep only real V1 tabs and actions:
  - objects
  - formations
  - line tools
- Removed unfinished zone, layers, quick-action, and custom-formation-save entry points from the left panel
- Rebuilt `MobileToolbar` to remove the zone drawer path
- Rebuilt `TabletToolStrip` to remove layers and other misleading shortcuts
- Froze `WorkspaceProvider` to `personal` only while preserving the existing context API shape

## Round 2

Checks:
- `npm run test -- mainflow-cleanup`

Findings:
- The first targeted test run exposed a real regression risk in local imports: `@/context/workspace-context` resolves to the `.ts` context file, not the `.tsx` provider file.
- This did not affect the application because `App.tsx` already imports the provider with an explicit extension, but it would have made future tests misleading and brittle.

Changes in this round:
- Added `src/test/mainflow-cleanup.test.tsx`
- Locked two behaviors:
  - unfinished zone/layer/quick-action entries do not appear in the main editor chrome
  - workspace context always resolves to `personal`, even if stale `team` storage exists
- Fixed the test import to use `@/context/workspace-context.tsx` explicitly

## Round 3

Checks:
- `npm run build`
- `npm run test`
- `npm run lint`

Findings:
- Build passed
- Full test suite passed
- Lint passed with the same 7 pre-existing `react-refresh/only-export-components` warnings in shared UI files

Changes in this round:
- No further code changes were required after the full regression pass

## Result

The main flow editor chrome now matches the current V1 truth:
- only implemented object and formation tools remain visible
- unfinished zone/layer affordances no longer mislead users or future implementation work
- workspace state is functionally fixed to personal-only local usage

## Remaining Risks

- The context API still exists even though its behavior is now fixed; a later cleanup pass can remove the old abstraction entirely
- Region tools, layer tools, and custom formation persistence still need their own future implementation plan before being reintroduced
