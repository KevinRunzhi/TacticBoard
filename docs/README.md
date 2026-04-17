# Docs

This folder keeps the active documentation baseline for the project.

## Current active baseline

- `football-tactics-board-prd.md`
  Product definition, first-release scope, platform strategy, and non-goals.
- `football-tactics-board-requirements.md`
  V1 requirement baseline, implementation constraints, and later-evaluation items.
- `football-tactics-board-information-architecture.md`
  Current V1 page structure, navigation boundaries, shell design, and key user flows.

## Derived implementation layers

- `01-product/`
- `02-ux/`
- `03-functional/`
- `04-domain/`
- `05-engineering/`
- `06-quality/`
- `07-decisions/`
- `DocsReview/`

## Current quality / acceptance entry points

- `06-quality/acceptance-checklist.md`
- `06-quality/v1验收标准.md`
- `06-quality/v1手动测试清单.md`
- `DocsReview/acceptance-review-v1-r1-2026-04-03.md`

## Current packaging / engineering entry points

- `05-engineering/windows-packaging-plan.md`
- `05-engineering/android-packaging-plan.md`
- `windows-packaging/windows-internal-interface-spec.md`
- `windows-packaging/windows-technical-architecture.md`
- `windows-packaging/windows-data-structure.md`
- `windows-packaging/windows-acceptance-standard.md`
- `windows-packaging/windows-development-guide.md`
- `android-packaging/android-technical-architecture.md`
- `android-packaging/android-internal-interface-spec.md`
- `android-packaging/android-device-compatibility-matrix.md`
- `android-packaging/android-device-validation-plan.md`
- `android-packaging/android-acceptance-standard.md`
- `android-packaging/android-development-guide.md`

## Validation / review workflow entry points

- `DocsReview/README.md`
- `DocsReview/android-technical-validation-template.md`
- `DocsReview/android-device-compatibility-validation-template.md`

## Recommended reading order

1. `football-tactics-board-prd.md`
2. `football-tactics-board-requirements.md`
3. `football-tactics-board-information-architecture.md`

## Current documentation rule

- Keep the three top-level baseline documents as the primary source of truth.
- Use `01-07` as derived implementation documents, not as competing baselines.
- Use `DocsReview/` to store review rounds, audit logs, and doc self-check records.
- Historical drafts, layered specs, reviews, and idea notes should live under `archive/`.
- If new docs are added later, prefer topic-based documents over large nested spec trees.

## Notes

- As of `2026-03-30`, older layered product / UX / functional / engineering / quality docs have been archived because they reflected the previous web-platform direction and would conflict with the current local-app baseline.
- A fresh `01-07` layered set has now been rebuilt from the current PRD, requirements, and information architecture.
