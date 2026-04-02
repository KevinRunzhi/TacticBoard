# Acceptance Checklist

## 1. Purpose
This document defines the release-gate checklist for V1.

It is meant to answer:
- what must be true before a feature is considered done
- what must be tested before V1 release
- which failures are release blockers

## 2. Product-Wide Acceptance Gates

Before V1 is accepted:
- all core page routes render correctly
- invalid ids do not silently fallback to unrelated content
- workspace switching changes real data scope
- project/template/team seeded editor entry keeps correct context
- share copy behavior matches fixed/dynamic semantics
- editor can create, edit, save, share, and reopen projects without breaking core content

## 3. Dashboard / Workspace

Must verify:
- recent items render from current workspace
- quick create opens blank editor
- continue editing opens the intended project
- empty state is explicit

## 4. Projects Page

Must verify:
- project list reflects active workspace
- saved updates can reappear in list/recent surfaces
- search/filter/empty/no-result states work
- delete/duplicate/share flows produce correct feedback
- clicking a project opens the correct project

## 5. Templates Page

Must verify:
- official/private/project/formation templates are distinguishable
- using a template seeds a new project correctly
- template preview does not mutate the template itself
- invalid template context does not open generic unrelated content

## 6. Teams Page

Must verify:
- team list reflects active workspace
- selected team updates detail area
- lineup preset entry carries team and preset context into editor
- empty team/preset/player states are explicit

## 7. Editor

Must verify:
- blank route opens blank draft
- existing project route loads the intended project
- template/team/preset seeded entries initialize correctly
- fit-to-view works on first open
- full pitch is visible by default
- zoom/pan work on supported devices
- formation selection can auto-place players
- undo/redo works for content changes
- step duplication preserves object identity
- playback advances through steps

## 8. Share Page

Must verify:
- valid share renders expected content
- invalid share shows invalid state
- restricted share shows restricted state
- fixed share copy copies fixed viewed content
- dynamic share copy copies currently viewed content
- copy result does not inherit old share link

## 9. Settings and Auth

Must verify:
- settings page only contains account/app preferences
- login/register/bind flows remain outside app shell
- guest-triggered gated actions route to auth cleanly
- guest binding only binds the current active draft

## 10. Responsive Acceptance

### 10.1 Desktop
- full editing flow usable
- app-shell pages remain readable and consistent

### 10.2 Tablet
- no hover-only critical interaction
- editor tools remain reachable
- pitch remains visible and controllable

### 10.3 Mobile
- share page remains fully usable
- editor remains usable for light editing only
- no fixed side panels block the pitch

## 11. Release Blockers

The following are release blockers:
- invalid share id loads wrong content
- project click opens wrong project
- workspace switch only changes label but not data
- team preset/template seeding loses context
- save/share/play controls are exposed but do nothing
- touch devices cannot access critical controls

## 12. Related Documents

- [test-matrix.md](./test-matrix.md)
- [known-risks.md](./known-risks.md)
- [../03-functional/frd/overview.md](../03-functional/frd/overview.md)
