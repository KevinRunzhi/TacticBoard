# Implementation Review 44: Android Slice 3 Export Share Restart (2026-04-20)

## Scope

- Android Phase 1 Slice 3 restart
- Android PNG export -> system share bridge
- Export result semantics back to UI
- Web / Windows regression watchpoints for shared export code

## Change size classification

- `large`

## Source of truth checked

- `docs/android-packaging/slices/slice-3-png-export-and-system-share-boundary.md`
- `docs/android-packaging/android-phase1-slice-plan.md`
- `docs/android-packaging/android-internal-interface-spec.md`
- `tactics-canvas-24/AGENTS.md`
- `tactics-canvas-24/package.json`
- `tactics-canvas-24/src/lib/export-save.ts`
- `tactics-canvas-24/src/components/tactics/TacticsEditor.tsx`
- `tactics-canvas-24/src-tauri/Cargo.toml`
- `tactics-canvas-24/src-tauri/src/lib.rs`
- `tactics-canvas-24/src-tauri/capabilities/default.json`

## Touched surfaces

- `tactics-canvas-24/src/lib/export-save.ts`
- `tactics-canvas-24/src/test/export-save.test.ts`
- `tactics-canvas-24/src-tauri/src/lib.rs`
- `tactics-canvas-24/src-tauri/capabilities/default.json`
- `docs/android-packaging/slices/slice-3-png-export-and-system-share-boundary.md`
- `docs/android-packaging/android-phase1-slice-plan.md`
- `docs/android-packaging/android-internal-interface-spec.md`
- `docs/DocsReview/README.md`

## Findings

1. The initial Android attempt failed before native share launch completed because the frontend called `plugin:share|shareFile`, which hit a plugin permission / command-name drift and returned `share.shareFile not allowed. Command not found`.
2. Moving share launch into Rust fixed the permission boundary, but a blocking `run_mobile_plugin(...)` call still left the frontend promise hanging even after the Android share sheet was already visible.
3. The third-party `tauri-plugin-share` Android wrapper is usable as a transport layer, but its current callback behavior is not a safe UI contract for Slice 3. The app needs a fire-and-forget bridge boundary on the Rust side.

## Fixes applied

- `export-save.ts` now treats Android export as a two-step share-first bridge:
  - `prepare_share_export_binary`
  - `share_export_file`
- Rust now owns Android share launch semantics instead of exposing a direct frontend plugin invoke.
- Android share launch is dispatched from Rust as fire-and-forget so the UI can immediately resolve to `shared` after the system share sheet is launched.
- Android `shared` semantics are now aligned to “the system share sheet was launched”, not “the user completed an external target action”.
- `export-save.test.ts` was updated to lock the new command contract and shared result semantics.

## Automated commands actually run

- `cmd /c npx vitest run src/test/export-save.test.ts`
- `cmd /c npm run build`
- `cmd /c npm run test`
- `cmd /c npm run lint`
- `git diff --check`
- `cmd /c npm run tauri:build`
- `cmd /c npm run tauri:dev`
  - smoke only
  - log reached `Running target\\debug\\tacticboard.exe`
- `cmd /c npm run tauri:android:dev`
  - used for emulator-side validation during this round

## Manual scenarios actually run

- Device: `Pixel_7` Android emulator
- Flow:
  - workbench
  - `新建空白项目`
  - editor
  - topbar `导出项目`
  - dialog `导出 PNG`
- Device-side evidence gathered:
  - WebView DOM / UI text
  - `adb logcat`
  - `adb shell uiautomator dump`

## Device-side hard evidence

- WebView returned controlled UI feedback:
  - `已进入系统分享`
  - `新建战术板.png`
- `adb logcat` hit:
  - `[android-share] prepared /data/user/0/com.kevinrunzhi.tacticboard/cache/export-share/新建战术板.png`
  - `[android-share] launching share sheet /data/user/0/com.kevinrunzhi.tacticboard/cache/export-share/新建战术板.png`
- `uiautomator dump` hit the native Android chooser with:
  - title `Share`
  - visible targets including `Photos`, `Maps`, `Bluetooth`, `Drive`, `Gmail`

## Regression conclusion

- Web / Windows shared export code paths did not regress under `build / test / lint`.
- Desktop Tauri still builds successfully after the Rust bridge changes.
- Slice 3 is now closed for the current Phase 1 development baseline.

## Remaining risks

- The hard evidence comes from emulator dev-shell validation, not from a physical Android device.
- A separately packaged Android release APK was not manually retested in this round.
- Downstream chooser completion / cancellation is still not observable through the current Android share bridge, so Slice 3 defines `shared` as “share sheet launched”.
- OEM-specific share sheets may behave differently and remain a Slice 6 validation risk.

## Still unverified

- Physical Android device behavior
- Release APK manual share validation outside `tauri:android:dev`
- Any downstream result after the user selects or dismisses a share target
