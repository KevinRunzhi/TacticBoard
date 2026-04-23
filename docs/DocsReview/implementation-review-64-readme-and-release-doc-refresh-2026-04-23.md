# README And Release Doc Refresh - 2026-04-23

## Scope

- Round type: docs refresh + consistency pass
- Goal: align the public-facing README and release-facing documentation with the current Android Phase 1 baseline and the current public GitHub release state
- No application code changes in this round

## Touched Surfaces

- `README.md`
- `tactics-canvas-24/README.md`
- `docs/README.md`
- `docs/android-packaging/README.md`
- `docs/android-packaging/android-release-distribution-status.md`
- `docs/DocsReview/README.md`
- `docs/DocsReview/implementation-review-64-readme-and-release-doc-refresh-2026-04-23.md`

## Findings

1. The repository root README was still written as a Windows-first release page and did not clearly separate:
   - public GitHub release availability
   - completed Android Phase 1 baseline
   - signed APK local release readiness
2. The app workspace README did not reflect that Android Phase 1 and signed APK validation had already been completed in the codebase baseline.
3. The docs index did not have a dedicated Android release/distribution status entry.
4. As of `2026-04-23`, the latest public GitHub release page still exposes Windows `v0.1.0`; Android APK is not yet attached as a public release asset.

## Fixes Applied

- Rewrote the repository root `README.md` into a clearer public-facing product page.
- Rewrote `tactics-canvas-24/README.md` into a cleaner developer-facing workspace guide.
- Added `docs/android-packaging/android-release-distribution-status.md` to distinguish:
  - release-ready signed APK baseline
  - public GitHub release availability
- Updated `docs/README.md`, `docs/android-packaging/README.md`, and the DocsReview index so the new release-status document is discoverable.

## Automated Commands Actually Run

```bash
git diff --check
Test-Path docs/assets/readme/dashboard-hero.png
Test-Path docs/assets/readme/editor-export.png
Test-Path docs/assets/readme/editor-workspace.png
Test-Path docs/assets/readme/projects-overview.png
```

## Manual Scenarios Actually Run

- No new application runtime scenarios in this round
- One documentation-side public-state cross-check was performed against:
  - `https://github.com/KevinRunzhi/TacticBoard/releases/latest`

## Remaining Risks

- The public GitHub release itself was not edited in this round.
- Therefore, the repo docs are now aligned with the real release state, but the public release asset set is still Windows-only until Android APK is actually uploaded there.

## Anything Still Unverified

- No new Android build, signing, or device validation was rerun in this round, because this was a docs-only refresh.
- No live GitHub release asset upload was performed in this round.
