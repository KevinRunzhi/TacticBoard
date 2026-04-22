# DocsReview

This directory stores review notes, self-audits, cross-check reports, and implementation verification logs.

## Rules

- Each review round should be written as a separate file.
- Every medium or large code change in `tactics-canvas-24/` must produce or update a dated file here in the same round.
- Every review file should record:
  - scope
  - change size classification when applicable
  - touched surfaces
  - findings
  - fixes applied
  - automated commands actually run
  - manual scenarios actually run
  - remaining risks
  - anything still unverified
- Every Android review file should also distinguish:
  - committed scope vs local-only experiments
  - automated / smoke evidence vs device-side hard evidence
  - whether any conclusion still depends on generated or vendored temporary patches
- Review conclusions should not stop at "issues found"; the related docs or code should be updated in the same round.
- For medium or large code changes, "tested" means the agent actually executed the commands it reports. Suggested-but-not-run commands do not count as completed validation.

## Templates

- `android-technical-validation-template.md`
- `android-device-compatibility-validation-template.md`

Recommended usage:

- Copy the template before each Android validation round.
- Recommended file naming:
  - `implementation-review-android-phaseX-topic-YYYY-MM-DD.md`
- Use it when validating:
  - Android startup and routing
  - touch main flow
  - PNG export and system share
  - asset import through the Android system picker
  - lifecycle / orientation behavior
  - Web and Windows regression watchpoints

Additional compatibility-specific template:

- `android-device-compatibility-validation-template.md`

Recommended usage:

- Copy it when the round is explicitly about P0 / P1 / P2 device coverage.
- Use it to record:
  - which devices were tested
  - which tier each device belongs to
  - which scenarios passed / failed / were only observed
  - whether the result blocks Android Phase 1 completion

## Current Files

- `docs-review-r1-2026-03-30.md`
- `docs-review-r2-2026-03-30.md`
- `docs-review-r3-2026-03-30.md`
- `docs-review-r4-2026-03-30.md`
- `docs-review-r4.1-2026-03-30.md`
- `docs-review-r5-2026-03-30.md`
- `docs-review-r5-2026-03-31.md`
- `docs-review-r5.1-2026-03-31.md`
- `docs-review-r6-2026-03-31.md`
- `docs-review-r7-2026-04-01.md`
- `implementation-review-01-entry-semantics-2026-04-01.md`
- `implementation-review-02-property-writeback-2026-04-01.md`
- `implementation-review-03-mainflow-cleanup-2026-04-01.md`
- `implementation-review-04-settings-2026-04-01.md`
- `implementation-review-05-mainflow-tests-2026-04-01.md`
- `implementation-review-06-match-meta-2026-04-01.md`
- `implementation-review-07-area-objects-2026-04-01.md`
- `implementation-review-08-reference-image-2026-04-01.md`
- `implementation-review-09-export-config-2026-04-01.md`
- `implementation-review-10-export-toggles-2026-04-01.md`
- `implementation-review-11-reference-image-transform-2026-04-01.md`
- `implementation-review-12-workspace-entry-2026-04-01.md`
- `implementation-review-13-editor-save-return-2026-04-01.md`
- `implementation-review-14-code-review-r1-fixes-2026-04-01.md`
- `implementation-review-15-gif-export-2026-04-01.md`
- `implementation-review-16-core-object-crud-2026-04-02.md`
- `implementation-review-17-step-management-2026-04-02.md`
- `implementation-review-18-core-step-retest-2026-04-02.md`
- `implementation-review-19-code-review-r2-cleanup-2026-04-02.md`
- `implementation-review-20-part1-demo-blockers-2026-04-03.md`
- `implementation-review-21-editor-usability-batch-2026-04-03.md`
- `implementation-review-22-state-roundtrip-and-banner-2026-04-14.md`
- `implementation-review-23-windows-phase1-tauri-base-2026-04-15.md`
- `implementation-review-24-windows-phase2-router-2026-04-15.md`
- `implementation-review-25-windows-phase3-export-save-2026-04-15.md`
- `implementation-review-26-windows-phase4-reference-import-2026-04-15.md`
- `implementation-review-27-windows-phase5-final-acceptance-2026-04-15.md`
- `acceptance-review-v1-r1-2026-04-03.md`
- `packaging-plan-review-r1-2026-04-15.md`
- `packaging-plan-review-r2-2026-04-15.md`
- `packaging-plan-review-r3-2026-04-15.md`
- `packaging-plan-review-r4-2026-04-15.md`
- `implementation-review-28-android-docset-consistency-2026-04-16.md`
- `implementation-review-29-android-doc-closure-2026-04-17.md`
- `implementation-review-30-android-topbar-interaction-fix-2026-04-18.md`
- `implementation-review-31-android-export-touch-chain-fix-2026-04-19.md`
- `implementation-review-32-android-doc-hardening-2026-04-19.md`
- `implementation-review-33-android-docset-final-closure-2026-04-19.md`
- `implementation-review-34-android-slice-plan-closure-2026-04-19.md`
- `implementation-review-35-android-slice-doc-split-2026-04-19.md`
- `implementation-review-36-android-slice0-baseline-restart-2026-04-19.md`
- `implementation-review-37-android-slice1-runtime-router-restart-2026-04-19.md`
- `implementation-review-38-android-slice1-strict-round1-2026-04-19.md`
- `implementation-review-39-android-slice1-strict-round2-2026-04-19.md`
- `implementation-review-40-android-slice1-strict-round3-2026-04-19.md`
- `implementation-review-41-android-slice2-touch-mainflow-restart-2026-04-20.md`
- `implementation-review-42-mobile-formation-entry-recovery-2026-04-20.md`
- `implementation-review-43-mobile-formation-device-validation-2026-04-20.md`
- `implementation-review-44-android-slice3-export-share-restart-2026-04-20.md`
- `implementation-review-45-android-slice4-asset-import-restart-2026-04-21.md`
- `implementation-review-46-android-slice5-lifecycle-recovery-restart-2026-04-21.md`
- `implementation-review-47-android-slice5-tablet-simulator-validation-2026-04-21.md`
- `implementation-review-48-android-slice5-save-integrity-audit-2026-04-21.md`
- `implementation-review-49-android-mobile-viewport-pitch-hardening-2026-04-22.md`
- `implementation-review-50-android-mobile-editor-ux-followup-2026-04-22.md`
- `implementation-review-51-android-mobile-editor-ux-realdevice-validation-2026-04-22.md`
- `implementation-review-52-android-mobile-editor-ux-correction-2026-04-22.md`
- `implementation-review-53-android-mobile-player-touch-drag-fix-2026-04-22.md`
- `implementation-review-54-android-realdevice-full-validation-2026-04-22.md`
- `implementation-review-55-android-landscape-safe-area-fix-2026-04-22.md`
