# Implementation Review 36 - Android Slice 0 Baseline Restart - 2026-04-19

## Scope

- Re-establish Android Slice 0 on the current branch
- Restore the committed Android command entrypoints into `package.json`
- Validate the shared build/test/lint baseline, desktop Tauri baseline, and Android init/dev/build baseline
- Write the new Slice 0 outcome back into the source docs instead of leaving it only in historical review files

## Change Size

- Medium code/config + documentation change

## Touched Surfaces

- `tactics-canvas-24/package.json`
- `tactics-canvas-24/README.md`
- `README.md`
- `tactics-canvas-24/AGENTS.md`
- `docs/android-packaging/slices/slice-0-android-shell-feasibility-baseline.md`
- `docs/android-packaging/android-phase1-slice-plan.md`
- `docs/DocsReview/README.md`

## Findings

1. The current branch really had lost the committed Android command entrypoints even though earlier Slice 0 validation history existed.
2. The Tauri Android CLI and local toolchain were still usable on this machine; the missing piece was repository command truth, not the shell/toolchain capability itself.
3. Desktop `tauri:dev` did not fail because of code regression; the first smoke attempt collided with a Vite process already holding port `8080`, which came from an earlier Android dev run.
4. Android `tauri:android:dev` is a long-running command, so its validation needs device-side evidence instead of waiting for the command to exit cleanly.

## Fixes Applied

- Restored these committed npm entrypoints in `tactics-canvas-24/package.json`:
  - `tauri`
  - `tauri:android:init`
  - `tauri:android:dev`
  - `tauri:android:build`
- Fixed the developer command documentation in:
  - `README.md`
  - `tactics-canvas-24/README.md`
- Updated the local app-level agent instructions in `tactics-canvas-24/AGENTS.md` so they no longer describe the Android scripts as missing.
- Wrote the new Slice 0 baseline status back into:
  - `docs/android-packaging/slices/slice-0-android-shell-feasibility-baseline.md`
  - `docs/android-packaging/android-phase1-slice-plan.md`

## Automated Commands Actually Run

- `cmd /c npm run build`
- `cmd /c npm run test`
- `cmd /c npm run lint`
- `cmd /c npm run tauri:build`
- desktop `tauri:dev` smoke via background process/log capture
- `adb devices`
- `emulator -list-avds`
- `cmd /c npm run tauri:android:init`
- `cmd /c npm run tauri:android:build -- --target x86_64`
- Android `tauri:android:dev` smoke via uninstall -> background process/log capture -> package/process verification
- `adb uninstall com.kevinrunzhi.tacticboard`
- `adb shell pm list packages | Select-String 'com.kevinrunzhi.tacticboard'`
- `adb shell pidof com.kevinrunzhi.tacticboard`
- `adb shell am force-stop com.kevinrunzhi.tacticboard`
- `adb shell am start -W -n com.kevinrunzhi.tacticboard/com.kevinrunzhi.tacticboard.MainActivity`
- `netstat -ano | Select-String ':8080'`
- `git diff --check`

## Manual Scenarios Actually Run

- Desktop Tauri smoke:
  - confirmed `npm run tauri:dev` could start Vite on `http://localhost:8080`
  - confirmed a local `tacticboard` process launched
- Android emulator smoke on `Pixel_7`:
  - confirmed package install
  - confirmed process existence
  - confirmed cold start via `adb shell am start -W`

## Key Results

- `build`: passed
- `test`: passed, 32 files / 76 tests all green in this round
- `lint`: passed with 7 pre-existing `react-refresh/only-export-components` warnings and no errors
- `tauri:build`: passed and produced the Windows NSIS installer
- `tauri:dev` smoke: passed after clearing the stale `8080` port holder
- `tauri:android:init`: passed
- `tauri:android:build -- --target x86_64`: passed and produced:
  - `src-tauri/gen/android/app/build/outputs/apk/universal/release/app-universal-release-unsigned.apk`
- `tauri:android:dev` smoke: succeeded as a long-running install/start path on the emulator; validation was based on install/process/cold-start evidence rather than command exit

## Remaining Risks

- Slice 0 is now re-established, but nothing beyond Slice 0 is implied by this round. Router/platform branching, touch main flow, export/share, asset import, and lifecycle hardening still remain for later slices.
- Android `dev` remains a long-running command; future validation rounds should keep recording device-side evidence instead of pretending the command naturally “completed”.
- The Android emulator logs showed expected mobile/runtime warnings, but no Slice 0 blocker was observed from them in this round.

## Still Unverified

- No real physical Android handset was validated in this round; evidence is emulator-based.
- No Android UI walkthrough beyond install/start/cold-start was performed in this round.
- No Android share, system picker, save/recovery, or lifecycle behavior was validated in this round because they are outside Slice 0.

## Decision

- Slice 0 can now be treated as re-established on the current branch.
- The next valid implementation step is Slice 1: Runtime Platform and Router Boundary.
