# Implementation Review 45: Android Slice 4 Asset Import Restart

## Scope

- Rebuild Android Slice 4 so asset import no longer depends on browser-style file input assumptions.
- Keep the shared component contract on `File`, while adding Android system picker + local-copy support.
- Extend the same import boundary to both reference images and player avatars.
- Re-verify mobile touch interactions around the import path after device-side findings.

## Change Size Classification

- `large`

## Source Of Truth

- `docs/android-packaging/slices/slice-4-system-picker-and-local-copy-asset-import-boundary.md`
- `docs/android-packaging/android-phase1-slice-plan.md`
- `docs/android-packaging/android-internal-interface-spec.md`
- `docs/android-packaging/android-acceptance-standard.md`
- `tactics-canvas-24/package.json`
- `tactics-canvas-24/src/lib/asset-import.ts`
- `tactics-canvas-24/src-tauri/src/lib.rs`

## Touched Surfaces

- Android/native import bridge:
  - `tactics-canvas-24/src/lib/asset-import.ts`
  - `tactics-canvas-24/src-tauri/src/lib.rs`
- Editor import consumers and shared model:
  - `tactics-canvas-24/src/components/tactics/RightPanel.tsx`
  - `tactics-canvas-24/src/components/tactics/TacticsEditor.tsx`
  - `tactics-canvas-24/src/types/tactics.ts`
- Render/export consumers for imported avatars:
  - `tactics-canvas-24/src/components/tactics/PitchCanvas.tsx`
  - `tactics-canvas-24/src/lib/tactics-export.ts`
- Touch interaction follow-up:
  - `tactics-canvas-24/src/components/tactics/MobileToolbar.tsx`
- Automated coverage:
  - `tactics-canvas-24/src/test/asset-import.test.ts`
  - `tactics-canvas-24/src/test/right-panel-reference-import.test.tsx`
  - `tactics-canvas-24/src/test/player-avatar-model.test.tsx`
  - `tactics-canvas-24/src/test/player-avatar-render.test.tsx`
  - `tactics-canvas-24/src/test/mobile-toolbar-touch.test.tsx`
  - `tactics-canvas-24/src/test/responsive-properties-drawer.test.tsx`

## Findings

1. Android native import was still hard-disabled in the shared bridge.
   - `canUseNativeImageImport()` only treated Windows as native, so Android could not enter a formal system-picker path.

2. The bridge had no stable local-copy boundary for imported images.
   - Without a Rust/native copy step, Android import would have to leak temporary URI semantics or depend on fragile transient access.

3. Slice 4 was incomplete if only reference-image import worked.
   - Player avatar import used the same user promise class and had to pass through the same bridge and normalization rules.

4. Mobile toolbar touch de-duplication initially blocked adjacent actions.
   - A global 400ms throttle caused `对象 -> 球员` to be dropped under fast touch sequences.

5. Device validation exposed a second touch bug after the toolbar fix.
   - On the emulator, selecting the player tool could leak a ghost click to the pitch. This pointed to touch/pointer interception not being strict enough when the sheet closed.

## Fixes Applied

1. Rebuilt `asset-import.ts` as the single Android/Windows native import bridge.
   - Android and Windows now both use the native picker path.
   - Native byte reads are normalized in the bridge.
   - MIME sniffing and result-shape normalization stay in TypeScript.

2. Added a Rust local-copy command.
   - `persist_imported_image` copies imported bytes into app-local `imported-images/`.
   - The command returns a stable local path instead of leaking `content://` input to components.

3. Kept the UI contract on `File`.
   - `RightPanel` and its mobile/tablet wrappers still receive normalized `File` results.
   - `TacticsEditor` converts the imported `File` into the existing editor model.

4. Extended Slice 4 to player avatars as well as reference images.
   - `Player` now carries `avatarLocalUri`.
   - Player properties support import/replace/remove.
   - `PitchCanvas` and `tactics-export.ts` render avatars without needing native path knowledge.

5. Tightened touch handling around the import path.
   - Reference import and avatar import buttons use touch-safe handlers.
   - `MobileToolbar` now de-dupes by action key instead of globally.
   - `MobileToolbar` also intercepts `touchstart` / `pointerdown` to stop synthesized clicks from falling through to the pitch.

## Automated Commands Actually Run

- `cmd /c npx vitest run src/test/asset-import.test.ts src/test/right-panel-reference-import.test.tsx src/test/player-avatar-model.test.tsx src/test/player-avatar-render.test.tsx src/test/responsive-properties-drawer.test.tsx`
- `cmd /c npx vitest run src/test/mobile-toolbar-touch.test.tsx src/test/mobile-mainflow-baseline.test.tsx src/test/right-panel-reference-import.test.tsx`
- `cmd /c npx vitest run src/test/mobile-toolbar-touch.test.tsx src/test/mobile-mainflow-baseline.test.tsx`
- `cmd /c npm run build`
- `cmd /c npm run test`
- `cmd /c npm run lint`
- `git diff --check`
- `cmd /c npm run tauri:build`
- Desktop `tauri:dev` smoke via background process and log inspection
- Android `tauri:android:dev` via background process and log inspection

## Automated Results

- `npm run test`: passed, `40` files / `98` tests.
- `npm run lint`: passed with `7` existing warnings and `0` new errors.
- `npm run build`: passed.
- `git diff --check`: passed.
- `npm run tauri:build`: passed.
- Desktop `tauri:dev` smoke: passed; log reached Vite ready + `target\\debug\\tacticboard.exe`.
- Android `tauri:android:dev`: passed; dev server, install, launch, and live app logs all reached.

Note:

- One parallel `lint` run hit a transient `ENOENT` on a Vite/Vitest temporary timestamp file while `test` was running at the same time. A standalone rerun passed cleanly. This is treated as environment noise, not as a product issue.

## Manual Scenarios Actually Run

### Android device-side hard evidence (`Pixel_7` emulator, Android dev shell)

1. Reference image import success
   - Opened editor properties.
   - Triggered Android system picker from the reference import button.
   - Navigated to `Downloads` album and selected an image.
   - Verified return to editor with the imported filename visible and button text switched to replace semantics.
   - Verified Rust log hit:
     - `[asset-import] persisted /data/user/0/com.kevinrunzhi.tacticboard/imported-images/...`

2. Player avatar import success
   - Opened player properties.
   - Triggered Android system picker from the avatar import button.
   - Selected an image from the picker.
   - Verified player properties showed the imported avatar and imported filename.
   - Verified Rust log hit:
     - `[asset-import] persisted /data/user/0/com.kevinrunzhi.tacticboard/imported-images/...`

3. Player avatar import cancel
   - Triggered avatar replace.
   - Cancelled from the Android picker.
   - Verified the previously imported avatar remained visible in player properties.
   - Verified there was no new `[asset-import] persisted ...` line after the cancel action.

4. System picker proof
   - Native picker transitions were observed in `adb logcat` with `PhotoPickerGetContentActivity`.
   - Screenshot evidence was captured under `tactics-canvas-24/analysis/`.

## Committed Scope Vs Local-Only Experiments

- All conclusions in this review are based on tracked source files under `tactics-canvas-24/` and `docs/`.
- No conclusion depends on `src-tauri/gen/**`, `src-tauri/target/**`, or `src-tauri/vendor/**` hand patches.
- Temporary screenshots, logs, and PID files under `analysis/` or `*.log` are validation artifacts only, not source of truth.

## Remaining Risks

1. Current project persistence still writes imported images back into the editor state as front-end-consumable image URIs.
   - Slice 4 closes the import boundary.
   - Slice 5 still needs to prove save/recovery/lifecycle stability for those imported assets.

2. Physical Android phones have not yet been validated for Slice 4.
   - Current hard evidence is from the `Pixel_7` emulator.

3. Release APK/manual installer validation is still deferred.
   - Current device proof is against the Android dev shell, not a standalone release APK.

4. A device-side touch risk was found and patched in `MobileToolbar`.
   - The patch is validated by automated coverage and by continuing the import flow successfully on-device.
   - A clean, fully fresh “new blank project -> 对象 -> 球员” replay via `adb tap` became inconsistent after returning to the dashboard, so that exact reproduction path was not used as final blocker evidence.

## Unverified

- Physical phone behavior for reference import / avatar import / cancel.
- Release APK behavior for Slice 4 flows.
- Oversize or unsupported MIME behavior on-device beyond automated coverage.

## Conclusion

- Slice 4 is rebuilt in the current branch/worktree with the intended boundary:
  - Android system picker
  - native/local copy
  - normalized `File`
  - shared editor consumption
- Reference images and player avatars both now satisfy the Slice 4 asset-import contract.
- The remaining work is no longer “make Android import exist”; it is “prove imported assets survive save/recovery/lifecycle hardening” in Slice 5 and final device tiers in Slice 6.
