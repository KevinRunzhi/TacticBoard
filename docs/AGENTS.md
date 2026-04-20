# AGENTS.md

## Scope

- This file applies to `docs/` only.
- `docs/` is the active documentation baseline for the repository.
- `docs/archive/` is historical context only. Do not treat archived content as the live baseline unless the user explicitly asks to revisit it.

## Documentation Hierarchy

1. Canonical top-level baseline:
   - `football-tactics-board-prd.md`
   - `football-tactics-board-requirements.md`
   - `football-tactics-board-information-architecture.md`
2. Derived implementation layers:
   - `01-product/`: scope decomposition and sequencing
   - `02-ux/`: flows, responsive rules, editor layout
   - `03-functional/frd/`: page-level functional specs
   - `04-domain/`: entity, lifecycle, and persistence boundaries
   - `05-engineering/`: implementation and packaging strategy
   - `06-quality/`: acceptance, tests, and known risks
   - `07-decisions/`: ADRs and durable decisions
3. Specialized platform docsets:
   - `windows-packaging/`
   - `android-packaging/`
4. Evidence only:
   - `DocsReview/`

## Mandatory Workflow

- Read the top-level baseline before changing any derived doc that depends on product scope, first-release promises, navigation, platform commitments, or acceptance criteria.
- If a task changes scope, non-goals, target platforms, or page structure, update the top-level baseline first.
- If a task changes implementation interpretation, keep the affected derived layers aligned in the same round.
- If a task changes validation scope, acceptance gates, or risk framing, update `06-quality/` and any affected platform acceptance doc in the same round.
- If a task includes a medium or large code change in `tactics-canvas-24/`, ensure the same round also produces or updates a dated `DocsReview/` record with the actual commands run, manual checks performed, and remaining risks.
- If the task is a review, audit, validation pass, or consistency pass, add or update a dated file under `DocsReview/` and write durable conclusions back into the canonical docs in the same round.
- Do not leave important corrections trapped only in `DocsReview/`.
- Do not restore old web-platform assumptions or old page types unless the user explicitly asks for that direction.

## Where To Change What

- Product scope, non-goals, release promises, or platform commitments:
  - top-level baseline docs first
  - then `01-product/` if the derived layer also needs to move
- Page structure, route shape, shell boundaries, or user-flow definitions:
  - `football-tactics-board-information-architecture.md`
  - then `02-ux/` and `03-functional/` as needed
- Entity model, local save semantics, asset-copy rules, or recovery behavior:
  - `04-domain/`
- Web, Windows, or Android architecture and packaging rules:
  - `05-engineering/`
  - `windows-packaging/`
  - `android-packaging/`
- Acceptance rules, test coverage expectations, or known failure modes:
  - `06-quality/`
- Stable architecture or scope decisions:
  - `07-decisions/`
- Review evidence:
  - `DocsReview/`

## High-Risk Documentation Areas

- Any statement that turns a planned later-phase feature into an implemented current feature
- Any statement that changes the Windows + Android launch commitment without updating the top-level baseline
- Acceptance wording that could allow shallow validation to be reported as complete
- Packaging or platform docs that cite commands not present in the codebase
- Drift between the top-level trilogy and the layered docs

## Validation Rules

- Verify every referenced command against real project files before documenting it.
- Verify every referenced path exists before citing it.
- When docs describe app behavior, cross-check against current code/config files, not only older review logs.
- Treat partially completed manual checklists such as `06-quality/v1手动测试清单.md` as evidence of current gaps, not as proof of acceptance.
- When changing Android docs, use the specialized files in `android-packaging/` and the `DocsReview` templates instead of stuffing Android detail into generic docs.
- When changing Windows docs, keep `05-engineering/windows-packaging-plan.md` and `windows-packaging/` aligned.

## Writing Rules

- Preserve the existing language of each document.
- Prefer precise, auditable statements over aspirational guidance.
- Clearly separate:
  - current implemented behavior
  - current product commitment
  - later-phase or non-goal content
- Do not add repository-irrelevant best-practice sections just to make a document look complete.

## Completion Expectations

- Before handoff, cross-check touched docs against the top-level baseline and any directly affected layered docs.
- State which docs were updated, which docs were checked for consistency, and any remaining doc-vs-code gap that still exists.
