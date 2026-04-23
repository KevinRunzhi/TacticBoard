# Implementation Review 40 - Android Slice 1 Strict Round 3

## Scope

- Third strict review round for Slice 1
- Focus on the strongest remaining evidence gap:
  - device-side invalid-route observation inside the Android shell
- Also classify newly discovered shell-entry behavior around external URL / `VIEW intent`

## Change Size

- Medium

## Touched Surfaces

- `docs/android-packaging/slices/slice-1-runtime-platform-and-router-boundary.md`
- `docs/android-packaging/android-phase1-slice-plan.md`
- `docs/android-packaging/android-internal-interface-spec.md`
- `docs/DocsReview/README.md`

## Source Of Truth Used

- `docs/android-packaging/slices/slice-1-runtime-platform-and-router-boundary.md`
- `docs/android-packaging/android-phase1-slice-plan.md`
- `docs/android-packaging/android-internal-interface-spec.md`
- `tactics-canvas-24/src/lib/platform.ts`
- `tactics-canvas-24/src/App.tsx`
- `tactics-canvas-24/src/pages/NotFound.tsx`
- `tactics-canvas-24/src-tauri/src/lib.rs`
- `tactics-canvas-24/src-tauri/Cargo.toml`
- `tactics-canvas-24/src-tauri/capabilities/default.json`

## Findings

1. Live Android WebView DOM inspection proved that an invalid in-shell hash route enters the controlled `NotFound` screen and can return to the dashboard. This closes the strongest remaining Slice 1 evidence gap.
2. Emulator screenshots and `Page.captureScreenshot` were unreliable for this WebView session and frequently produced blank white captures even while DOM inspection showed the correct page. Screenshot blankness was therefore not valid evidence of route failure.
3. A separate issue appears when the activity is launched through `android.intent.action.VIEW` with URL data: the shell can white-screen and report `Entry not found`.
4. Current committed source contains no deep-link plugin, no deep-link capability, and no deep-link-specific configuration. Therefore the `VIEW intent + URL data` behavior is an unsupported external-entry contract, not a failure of the committed Slice 1 in-shell `HashRouter` boundary.

## Fixes Applied

- Wrote the strict invalid-route evidence back into the Slice 1 source docs
- Wrote the external `VIEW intent` boundary explicitly into the router interface contract so future work does not confuse unsupported external URL entry with in-shell routing failure

## Committed Scope Vs Local-Only Evidence

### Committed scope

- Documentation and interface-contract writeback for the final Slice 1 evidence state

### Local-only evidence

- WebView devtools session details
- Local `analysis/` logs and screenshots used during this round

## Generated / Vendored Dependency Check

- No conclusion in this round depends on edits under `src-tauri/gen/**`
- No conclusion in this round depends on edits under `src-tauri/vendor/**`

## Automated Commands Actually Run

Android shell and WebView inspection commands executed:

```bash
adb shell pidof com.kevinrunzhi.tacticboard
adb forward tcp:9222 localabstract:webview_devtools_remote_14904
Invoke-WebRequest http://127.0.0.1:9222/json/list
adb shell am start -W -a android.intent.action.VIEW -d "http://198.18.0.1:8080/#/route-that-does-not-exist" -n com.kevinrunzhi.tacticboard/com.kevinrunzhi.tacticboard.MainActivity
adb shell am start -W -a android.intent.action.VIEW -d "http://tauri.localhost/#/route-that-does-not-exist" -n com.kevinrunzhi.tacticboard/com.kevinrunzhi.tacticboard.MainActivity
```

Additionally, a PowerShell `ClientWebSocket` script was executed against the forwarded WebView devtools endpoint to:

- inspect current DOM text
- set `window.location.hash = "#/route-that-does-not-exist"`
- confirm `NotFound` content is rendered
- confirm the page can return to the dashboard

## Manual Scenarios Actually Run

Android emulator (`Pixel_7`) with a live `tauri:android:dev` shell:

- observe normal in-shell dashboard state
- drive the running app into an invalid hash route
- confirm `NotFound` route content exists in the live WebView DOM
- confirm the controlled route can return to the dashboard
- separately test unsupported external `VIEW intent + URL data` launch

## Remaining Risks

1. External URL / deep-link entry is still unsupported in the current committed Android shell.
2. This round still used the emulator rather than a physical Android device.

## Still Unverified

- Real-device observation for the same invalid-route and unsupported external-entry scenarios
- A future deep-link implementation path, because that is out of scope for current Slice 1

## Decision

- Slice 1 now satisfies the strictest in-slice evidence bar for Android Phase 1.
- The slice can be considered closed under the current contract.
- External `VIEW intent + URL data` launch remains a separate future interface item and must not be silently mixed into Slice 2.
