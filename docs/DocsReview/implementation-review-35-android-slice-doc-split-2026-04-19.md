# Implementation Review 35 - Android Slice Doc Split - 2026-04-19

## Scope

- Re-check Android Phase 1 slice planning for a third tightening round
- Split `Slice 0` to `Slice 6` into independent execution documents
- Tighten slice-by-slice acceptance rules, development closure, APK packaging path, and internal interface checkpoints
- Align the new slice docs back into the Android docset instead of leaving them as side notes

## Change Size

- Medium documentation change

## Touched Surfaces

- `docs/android-packaging/README.md`
- `docs/android-packaging/android-phase1-slice-plan.md`
- `docs/android-packaging/android-development-guide.md`
- `docs/android-packaging/android-acceptance-standard.md`
- `docs/android-packaging/android-internal-interface-spec.md`
- `docs/android-packaging/slices/README.md`
- `docs/android-packaging/slices/slice-0-android-shell-feasibility-baseline.md`
- `docs/android-packaging/slices/slice-1-runtime-platform-and-router-boundary.md`
- `docs/android-packaging/slices/slice-2-touch-first-main-flow-baseline.md`
- `docs/android-packaging/slices/slice-3-png-export-and-system-share-boundary.md`
- `docs/android-packaging/slices/slice-4-system-picker-and-local-copy-asset-import-boundary.md`
- `docs/android-packaging/slices/slice-5-save-recovery-lifecycle-orientation-hardening.md`
- `docs/android-packaging/slices/slice-6-device-tier-validation-regression-phase1-closure.md`
- `docs/DocsReview/README.md`

## Three-Pass Findings

### Pass 1 - Slice boundary and restart-baseline check

Findings:

- The old `android-phase1-slice-plan.md` had already tightened restart status, but it still forced developers to read one large master file while carrying each slice in their heads.
- The current code reality still differs materially from older Android experiments:
  - `package.json` currently lacks committed `tauri:android:*` scripts
  - `src/lib/platform.ts` still only models `web | windows-tauri`
  - `export-save.ts` / `file-access.ts` still do not model Android share semantics
  - `asset-import.ts` still only supports Windows native import
- Because of that, old Slice 0-3 review files remain useful as historical evidence, but not as operational execution checklists.

Fixes applied:

- Split every slice into its own document under `docs/android-packaging/slices/`
- Wrote current code reality explicitly into each slice doc
- Wrote APK packaging relevance into each slice instead of keeping it implicit

### Pass 2 - Acceptance and development-closure check

Findings:

- The docset had strong global acceptance rules, but the per-slice path from “edit code” to “prove this slice is closed” was still too implicit.
- Developers could still miss the difference between:
  - automated evidence
  - emulator smoke
  - device-side hard evidence
  - committed implementation vs local-only experiment

Fixes applied:

- Added a per-slice closed-loop structure:
  - current code reality
  - relation to the APK packaging chain
  - what this slice does not solve
  - development closure
  - close criteria
  - what does not count as done
  - handoff expectations to the next slice
- Wrote device-side hard-evidence requirements directly into Slice 3, Slice 4, Slice 5, and Slice 6
- Updated the Android README and parent docs so `slices/*.md` are now part of the official source docset instead of a detached appendix

### Pass 3 - Internal interface and front/back boundary check

Findings:

- The repo does not have a remote backend, so “front/back interface” can be misunderstood unless explicitly redefined.
- Interface bugs in Android work are most likely to appear across:
  - UI / component callers
  - TypeScript platform bridges
  - Tauri / Rust / Android native capability wiring
- Those boundaries needed to be repeated slice-by-slice, not just once in the interface spec.

Fixes applied:

- Defined “front/back interface” in the slice doc set as:
  - shared frontend business layer
  - TypeScript platform bridge
  - Tauri / Rust / Android native shell
- Added interface-check sections to every slice doc
- Updated `android-internal-interface-spec.md` and `android-acceptance-standard.md` so they explicitly reference the new split slice docs
- Updated `android-development-guide.md` so `slices/*.md` now sit in the formal Android doc priority chain

## Source-of-Truth Cross-Checks

Reviewed against:

- `docs/football-tactics-board-prd.md`
- `docs/football-tactics-board-requirements.md`
- `docs/football-tactics-board-information-architecture.md`
- `docs/05-engineering/android-packaging-plan.md`
- `docs/android-packaging/android-acceptance-standard.md`
- `docs/android-packaging/android-development-guide.md`
- `docs/android-packaging/android-phase1-slice-plan.md`
- `docs/android-packaging/android-internal-interface-spec.md`
- `tactics-canvas-24/package.json`
- `tactics-canvas-24/src/lib/platform.ts`
- `tactics-canvas-24/src/lib/file-access.ts`
- `tactics-canvas-24/src/lib/export-save.ts`
- `tactics-canvas-24/src/lib/asset-import.ts`
- `tactics-canvas-24/src-tauri/tauri.conf.json`
- `tactics-canvas-24/src-tauri/src/lib.rs`
- `tactics-canvas-24/src-tauri/capabilities/default.json`

## Automated Commands Actually Run

- `rg --files docs/android-packaging`
- `rg -n "^## |^### " docs/android-packaging/android-internal-interface-spec.md`
- `rg -n "^## |^### " docs/android-packaging/android-acceptance-standard.md`
- `rg -n "^## |^### " docs/android-packaging/android-development-guide.md`
- `rg -n "android-phase1-slice-plan|android-development-guide|android-device-validation-plan|android-internal-interface-spec|Current Files|implementation-review-34" docs/android-packaging/README.md docs/DocsReview/README.md`
- `rg -n "## 6\\.|## 7\\.|## 8\\.|Slice 0|Slice 1|Slice 6|Current restart status|Does not count as done|Handoff to next slice" docs/android-packaging/android-phase1-slice-plan.md`
- `npx tauri --version`
- `npx tauri android --help`
- `npx tauri android dev --help`
- `npx tauri android build --help`

## Manual Scenarios Actually Run

- None

This round was documentation-only. No Android emulator or device validation was performed in this review round.

## Remaining Risks

- The new slice docs are now operationally clearer, but they do not change the fact that the current code tree is still effectively pre-Android-implementation in several key areas.
- Slice 0 still needs the repository command truth to be reconciled with `package.json`.
- Slice 3 and Slice 4 still depend on future native capability work that does not exist in the current committed code.
- Slice 5 and Slice 6 still depend on future device-side hard evidence.

## Still Unverified

- No build, test, or lint run was needed for this round because only documentation was changed.
- No emulator startup, APK installation, system share, or Android system picker behavior was verified in this round.
- No new code-level interface implementation was validated; only the documentation contract and closure rules were tightened.
