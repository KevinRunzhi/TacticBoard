# Settings Review

Date: 2026-04-01
Scope: settings page truthfulness, local data summary, clear-local-data behavior

## Goal

Turn the settings page into a truthful V1 local-app page:
- remove conflicting or fake platform settings
- remove obsolete watermark and web-platform wording
- implement real local data clearing
- prevent cleared data from being silently reseeded by example content

## Round 1

Checks:
- `npm run build`

Findings:
- The old settings page still exposed fake controls, obsolete watermark options, and mixed `Web / Windows / Android` wording.
- The more serious hidden risk was in the storage layer: sample seed data was auto-created whenever storage looked empty, so a naive "clear local data" feature would appear to work and then silently repopulate content later.

Changes in this round:
- Added storage metadata in `mockProjects.ts` to distinguish initial seeding from intentional empty storage
- Added `getLocalProjectDataSummary()`
- Added `clearAllLocalProjectData()`
- Rebuilt `SettingsV2` into a truthful local-app page with:
  - display summary
  - export summary
  - local data summary
  - real clear-data flow
  - corrected product/platform copy

## Round 2

Checks:
- `npm run test -- settings-data`

Findings:
- The first targeted test run exposed a test-path issue rather than a product bug: the test tried to assert export-copy content while the page still opened on the display tab by default.

Changes in this round:
- Added `src/test/settings-data.test.tsx`
- Locked two behaviors:
  - clearing local data removes projects, drafts, and old workspace storage and does not trigger sample-data reseeding on the next read
  - settings copy no longer exposes obsolete watermark or mixed web-platform wording
- Fixed the test to switch into the export section before asserting export-copy content

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

The settings page is now aligned with the current product direction:
- no fake watermark toggle
- no obsolete `Web / Windows / Android` platform copy
- local data usage is summarized from real storage
- clearing local data is a real destructive action and no longer conflicts with sample-data bootstrapping

## Remaining Risks

- Display and export preferences are currently explanatory rather than globally configurable defaults
- If the app later introduces persistent editor defaults, those settings should be wired through the same local persistence layer instead of adding page-only state
