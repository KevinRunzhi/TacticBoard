# Implementation Review 47

## Scope

- Android Phase 1 Slice 5 tablet-simulator coverage
- Save / recovery / lifecycle / orientation validation after commit `626e839`
- Device-side evidence extension for `docs/android-packaging/slices/slice-5-save-recovery-lifecycle-orientation-hardening.md`

## Change Size Classification

- Validation-only round after a committed Slice 5 implementation
- No runtime code changes in this round

## Touched Surfaces

- `docs/android-packaging/slices/slice-5-save-recovery-lifecycle-orientation-hardening.md`
- `docs/android-packaging/android-phase1-slice-plan.md`
- `docs/android-packaging/android-internal-interface-spec.md`
- `docs/DocsReview/README.md`

## Committed Scope vs Local-Only Experiments

- This round does not depend on new uncommitted runtime code under `tactics-canvas-24/src/**`.
- The implementation under validation is the committed Slice 5 baseline at `626e839`.
- The created AVD, emulator process state, screenshots, `uiautomator dump` XML, and DOM-capture artifacts under `tactics-canvas-24/analysis/` are evidence only, not source of truth.

## Findings

1. Slice 5 no longer lacks tablet-class simulator evidence. `Pixel_Tablet_API_34` covered both saved-project recovery and unsaved new-session recovery across background/foreground and orientation transitions.
2. The earlier blocker “only `Pixel_7` phone simulator coverage exists” is closed. The remaining gap is true-device coverage, not tablet coverage.
3. Tablet validation also confirmed that the workbench and editor remained reachable after rotation with a tablet-class viewport (`1280x744` landscape, `800x1224` portrait in WebView-observed content area).

## Fixes Applied

- No runtime code changes were required in this round.
- Wrote the tablet-simulator conclusions back into Slice 5 source docs and the phase plan.
- Added a dedicated DocsReview record for the tablet coverage round.

## Automated Commands Actually Run

- `adb devices`
- `E:\develop\SDK\emulator\emulator.exe -list-avds`
- `cmd /c "E:\develop\SDK\cmdline-tools\latest\bin\avdmanager.bat list device"`
- `'no' | & 'E:\develop\SDK\cmdline-tools\latest\bin\avdmanager.bat' create avd -n Pixel_Tablet_API_34 -k 'system-images;android-34;google_apis_playstore;x86_64' -d pixel_tablet --force`
- `E:\develop\SDK\emulator\emulator.exe -avd Pixel_Tablet_API_34 -no-snapshot-load -no-boot-anim`
- `cmd /c npm run tauri:android:dev`
- `adb -s emulator-5554 shell wm size`
- `adb -s emulator-5554 shell wm density`
- `adb -s emulator-5554 shell getprop ro.product.model`
- `adb forward tcp:9222 localabstract:webview_devtools_remote_5780`
- `Invoke-WebRequest http://127.0.0.1:9222/json/list`
- Multiple CDP DOM-inspection and interaction scripts against the running Android WebView
- `adb -s emulator-5554 shell input keyevent KEYCODE_HOME`
- `adb -s emulator-5554 shell am start -W -n com.kevinrunzhi.tacticboard/.MainActivity`
- `adb -s emulator-5554 shell settings put system accelerometer_rotation 0`
- `adb -s emulator-5554 shell settings put system user_rotation 1`
- `adb -s emulator-5554 shell settings put system user_rotation 0`
- `adb -s emulator-5554 shell settings put system accelerometer_rotation 1`

## Manual Scenarios Actually Run

Environment:

- Android emulator: `Pixel_Tablet_API_34`
- Connected device id: `emulator-5554`
- Evidence type: simulator device-side observation through the Android dev shell plus WebView DOM inspection and adb lifecycle/orientation control

Scenarios:

1. Saved project reopen stays clean on tablet
   - Opened the recent saved project from the workbench in landscape
   - Verified route stayed on `#/editor/1`
   - Verified editor status text was `本地已保存`
   - Verified saved-project draft keys remained empty
2. Saved project background / foreground recovery on tablet
   - Sent the app to background with `KEYCODE_HOME`
   - Brought it back with `am start`
   - Verified route, status text, and clean saved-project state all remained intact
3. Saved project orientation recovery on tablet
   - Rotated landscape -> portrait -> landscape
   - Verified route remained `#/editor/1`
   - Verified editor content stayed on the same saved project
   - Verified no stale project-draft key reappeared
4. Unsaved new-session recovery on tablet
   - Returned to the workbench and opened a fresh route `#/editor?mode=new&session=...`
   - Opened the formations panel and applied `4-4-2`
   - Verified `tactics-canvas:draft:new:v1` existed and contained `activeFormationId: "f-442"`
   - Sent the app to background and resumed
   - Verified the same `session` route and unsaved editor content remained
5. Unsaved new-session orientation recovery on tablet
   - Rotated landscape -> portrait -> landscape
   - Verified the same `session` route remained
   - Verified the `draft:new` payload still contained the applied `4-4-2` state after rotation

## Automated / Smoke Evidence vs Device-Side Evidence

- Device-side evidence in this round is still simulator-only.
- Phone-class simulator evidence remains in Review 46 (`Pixel_7`).
- Tablet-class simulator evidence now exists in this round (`Pixel_Tablet_API_34`).
- The combined result supports “手机 + 平板模拟器验证通过” for Slice 5, but not “真机完成”.

## Remaining Risks

1. True-device lifecycle behavior is still unverified.
2. OEM ROM background policy differences, lock/unlock behavior, and battery-management edge cases remain unverified.
3. Release APK lifecycle behavior has not been manually validated.

## Anything Still Unverified

- Android phone hardware
- Android tablet hardware
- Release APK manual lifecycle validation
- Final Phase 1 device-tier acceptance

## Durable Conclusions Written Back

- Slice 5 docs now reflect that both phone-class and tablet-class simulator evidence exist.
- Slice 5 can hand off to Slice 6 for device-matrix and true-device closure.
- The current lifecycle conclusion remains simulator-only and must not be written as true-device completion.
