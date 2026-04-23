# Implementation Review 50 - Android Mobile Editor UX Follow-up - 2026-04-22

## Scope

- Follow-up UX hardening for the Android/mobile editor after the safe-area and pitch viewport fixes.
- Requested behaviors:
  - entering an existing project should show the pitch at a user-facing `100%` zoom state
  - selecting a player should auto-open player properties on mobile/tablet
  - the player delete action should be easier to find than the old bottom-of-panel placement

## Change Size

- `medium`

## Touched Surfaces

- `tactics-canvas-24/src/components/tactics/PitchCanvas.tsx`
- `tactics-canvas-24/src/components/tactics/TacticsEditor.tsx`
- `tactics-canvas-24/src/components/tactics/RightPanel.tsx`
- `tactics-canvas-24/src/index.css`
- `tactics-canvas-24/src/test/mobile-mainflow-baseline.test.tsx`
- `tactics-canvas-24/src/test/pitch-canvas-initial-zoom.test.tsx`
- `tactics-canvas-24/src/test/right-panel-reference-import.test.tsx`
- `docs/android-packaging/slices/slice-2-touch-first-main-flow-baseline.md`

## Findings

1. `PitchCanvas` still used one absolute zoom value for both viewport fit and user-visible zoom text. On narrow Android screens that made the first open read as roughly `46%`, even though the pitch was already correctly fitted.
2. Player selection on mobile/tablet still required a second tap on the properties drawer entry. This broke the expected “tap player -> edit player” loop.
3. The destructive player action remained visually buried at the bottom of the player panel, far away from the first editable fields that users inspect immediately after selecting a player.

## Fixes Applied

1. Split `PitchCanvas` viewport state into:
   - internal fit scale for container fitting
   - user-facing relative zoom multiplier for UI controls and displayed percentage
2. Updated viewport reset / fit / clamp flow so:
   - initial entry reports `100%`
   - the effective rendered transform still uses `fitScale * zoom`
   - resize clamping keeps using the real effective scale
3. Wrapped player selection in `TacticsEditor` so mobile/tablet selection immediately opens player properties.
4. Added a second selection-path safeguard for state transitions where a new player becomes selected without going through the explicit canvas select callback, such as player creation selecting the new player.
5. Surfaced a primary player delete button above the position field inside the first player-info block.
6. Hid the legacy trailing player delete button from the player-properties root so the UI only exposes the surfaced primary action.

## Automated Commands Run

- `cmd /c npx vitest run src/test/pitch-canvas-initial-zoom.test.tsx src/test/mobile-mainflow-baseline.test.tsx src/test/right-panel-reference-import.test.tsx src/test/pitch-viewport.test.ts`
- `cmd /c npm run build`
- `cmd /c npm run test`
- `cmd /c npm run lint`
- `git -C E:\code\Project\IDKN diff --check`
- desktop `tauri:dev` smoke via background launch log capture

## Manual Scenarios Run

- Desktop `tauri:dev` smoke only:
  - confirmed Vite dev server started
  - confirmed Cargo dev command launched `target\debug\tacticboard.exe`
  - then terminated the background `cargo` / `tacticboard` processes

## Remaining Risks

- This round did not rerun Android emulator or real-device manual validation after the UX follow-up.
- The player delete UI is now surfaced at the intended location, but the new layout has not yet been rechecked in the Android shell with touch input in this round.

## Unverified

- Android simulator touch validation for:
  - initial `100%` zoom label on first project entry
  - auto-open player properties after tapping a player
  - surfaced player delete action inside the player-properties drawer
- Android real-device validation
