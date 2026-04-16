# DocsReview

This directory stores review notes, self-audits, cross-check reports, and implementation verification logs.

## Rules

- Each review round should be written as a separate file.
- Every review file should record:
  - scope
  - findings
  - fixes applied
  - remaining risks
- Review conclusions should not stop at "issues found"; the related docs or code should be updated in the same round.

## Templates

- `android-technical-validation-template.md`

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
