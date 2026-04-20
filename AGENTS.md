# AGENTS.md

## Scope

- This file applies repository-wide.
- More specific rules live in `docs/AGENTS.md` and `tactics-canvas-24/AGENTS.md`. Always follow the nearest `AGENTS.md` for the files you edit.
- This repository intentionally mixes English and Chinese. Preserve the existing language of each file unless the task explicitly requires translation.
- The repository has two active working surfaces:
  - `docs/`: active product, UX, engineering, packaging, quality, and review baseline
  - `tactics-canvas-24/`: React + Vite + Tauri application code

## Repository Facts

- The repository root does not contain a project CI/workflow directory or a root build manifest. Do not invent root-level CI jobs or root-level build commands.
- Current executable commands live under `tactics-canvas-24/package.json`.
- Current product and acceptance baseline lives under `docs/`.
- `README.md` is an entry document, not the only source of truth.

## Source Of Truth

1. Product scope, non-goals, and platform commitments:
   - `docs/football-tactics-board-prd.md`
   - `docs/football-tactics-board-requirements.md`
   - `docs/football-tactics-board-information-architecture.md`
2. Derived implementation documents:
   - `docs/01-product/` through `docs/07-decisions/`
3. Quality, acceptance, and review evidence:
   - `docs/06-quality/`
   - `docs/DocsReview/`
4. Executable application truth:
   - `tactics-canvas-24/package.json`
   - `tactics-canvas-24/vite.config.ts`
   - `tactics-canvas-24/vitest.config.ts`
   - `tactics-canvas-24/src-tauri/tauri.conf.json`
   - `tactics-canvas-24/src-tauri/Cargo.toml`

## Global Rules

- Do not confuse planned product scope with currently wired implementation. If docs promise more than the current code or scripts support, say so explicitly.
- Do not invent commands, package scripts, CI jobs, release steps, or platform capabilities.
- When a task changes both behavior and its documented baseline, update the canonical docs and the implementation in the same round, or clearly call out the remaining gap.
- Medium or large code changes under `tactics-canvas-24/` require both:
  - executed self-validation by the agent before handoff
  - a dated record under `docs/DocsReview/`
- Treat review logs as evidence, not canonical truth. If a review changes the baseline, write it back into the real source document.
- Do not use artifacts as source-of-truth inputs:
  - `docs.zip`
  - `.playwright-mcp/`
  - `tactics-canvas-24/dist/`
  - `tactics-canvas-24/.vite/`
  - `tactics-canvas-24/analysis/`
  - `tactics-canvas-24/node_modules/`
  - `tactics-canvas-24/src-tauri/target/`
  - `tactics-canvas-24/src-tauri/gen/`
- For cross-cutting tasks, read both subtree instruction files before editing.

## Where To Read Next

- If you are editing `docs/**`, read `docs/AGENTS.md`.
- If you are editing `tactics-canvas-24/**`, read `tactics-canvas-24/AGENTS.md`.
- If you are editing both, obey both files and apply the stricter rule to each touched area.

## Completion Expectations

- Final handoff must state what changed, why, which canonical docs or config files were used, what was verified, what was not verified, and any remaining risks or assumption gaps.
- Do not mark work complete based only on "should work" reasoning when local verification or docs-consistency checks are possible.
- For medium or large code changes, "verified" means commands were actually executed by the agent, not merely recommended.
