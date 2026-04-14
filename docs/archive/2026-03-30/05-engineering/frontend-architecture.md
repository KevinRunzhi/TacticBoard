# Frontend Architecture

## 1. Purpose
This document defines the V1 frontend architecture boundaries for the football tactics board product.

Its goal is to reduce bugs caused by:
- duplicated state ownership
- route/UI mismatch
- editor runtime state leaking into persistent domain state
- workspace context inconsistency

This document is implementation-facing. It does not redefine product behavior already defined in:
- PRD
- IA
- FRD
- domain documents

## 2. Scope
This document covers:
- frontend module boundaries
- shell structure
- state ownership
- route-to-page responsibility
- editor runtime separation
- persistence integration points

It does not define:
- final backend APIs
- visual design system details
- deployment/runtime infra

## 3. Architecture Principles

### 3.1 Product logic is shared; layout is adaptive
- Desktop, tablet, and mobile share the same product behavior.
- Layout and UI containers may differ by breakpoint.
- Device adaptation must not create three separate product logics.

### 3.2 Domain state and UI state must be separated
- Domain state represents persistent product data.
- UI state represents temporary presentation and interaction state.
- Undo, share, save, and version logic must operate on domain state, not incidental UI chrome state.

### 3.3 Editor runtime must stay isolated
- The editor is the most complex runtime surface.
- Editor runtime state must not be casually mixed into app-shell page state.
- Entering/leaving the editor should not mutate unrelated page state.

### 3.4 Workspace context is first-class
- Personal versus team workspace is real data scope, not just a label.
- All app-shell pages must render according to active workspace context.
- Workspace context must be readable by routing and data layers.

### 3.5 Snapshot-first data handling
- Projects, templates, presets, and copied assets are instantiated by snapshot.
- Frontend should not assume downstream assets auto-update from sources.

## 4. Frontend Surface Map

### 4.0 Root landing behavior
The `/` route is dual-mode in V1:

- when logged out, it renders the landing / home experience under a minimal landing surface
- when logged in, it renders the workspace / dashboard experience under the app shell

### 4.1 App-shell surfaces
These pages live under the standard application shell:
- `/` (logged-in workspace/dashboard mode only)
- `/projects`
- `/templates`
- `/teams`
- `/settings`

Characteristics:
- global navigation visible
- workspace switcher visible
- page scroll allowed
- asset discovery and management focus

### 4.2 Editor shell
Routes:
- `/editor`
- `/editor/:projectId`

Characteristics:
- immersive editing shell
- no standard app navigation
- pitch-first layout
- editor runtime isolated from app-shell UI

### 4.3 Viewer shell
Routes:
- `/share/:id`

Characteristics:
- read-only immersive viewer
- no standard app navigation
- viewer interactions only

### 4.4 Auth shell
Routes:
- `/login`
- `/register`
- `/bind-account`

Characteristics:
- brand-consistent but not app-shell
- no asset management or project navigation

## 5. Frontend Module Boundaries

### 5.1 Shell layer
Responsibilities:
- route mounting
- shell selection
- global navigation container
- page-level composition

Should not own:
- editor object graph
- project domain persistence logic

### 5.2 Page container layer
Responsibilities:
- load page-scoped data
- derive view models
- wire actions into page sections
- handle page status states

Should not own:
- shared global state rules
- low-level visual primitives

### 5.3 Feature module layer
Examples:
- workspace switcher
- project card list
- template browser
- share viewer controls
- team asset manager
- editor tool panels

Responsibilities:
- encapsulate feature behavior
- expose stable inputs/outputs

### 5.4 UI component layer
Responsibilities:
- presentational primitives
- reusable card/button/dialog/input/layout pieces

Should not know:
- workspace semantics
- routing semantics
- domain ownership rules

## 6. State Ownership Model

The canonical detailed ownership model is defined in [state-management.md](./state-management.md).

This section is a summary only and must stay aligned with that document.

### 6.1 Route state
Examples:
- current route
- `projectId`
- `shareId`
- route-level entry source

Owner:
- routing layer

### 6.2 Workspace context state
Examples:
- active workspace type
- active workspace id

Owner:
- app-level shared state

Rules:
- must be available to all app-shell pages
- must not live only inside a nav component
- switching workspace must trigger data refresh in dependent pages

### 6.3 Persistent domain state
Examples:
- projects
- templates
- teams
- share metadata

Owner:
- domain data layer / repository layer

### 6.4 Editor working state
Examples:
- active project content
- steps
- object graph
- selection
- history
- seed state already applied

Owner:
- editor-specific state model

### 6.5 Transient UI state
Examples:
- open drawer
- active tab
- open dialog
- toast visibility

Owner:
- nearest responsible page/feature component

## 7. Editor Runtime Boundaries

### 7.1 What belongs to editor domain state
- step content
- object identities
- layers
- project title and core metadata
- undo/redo history
- play position

### 7.2 What belongs to editor UI/runtime state
- currently open drawer
- active tool tab
- hover state
- current temporary drag state
- viewport controls if not explicitly persisted

### 7.3 Non-negotiable rules
- App-shell navigation state must not own editor object graph.
- Editor state must be explicitly seeded on entry.
- Leaving editor should not corrupt saved project state.
- Share viewer must not reuse mutable editor state directly.

## 8. Route and Data Loading Rules

### 8.1 Blank editor route
`/editor`

Must create:
- a new blank draft runtime
- no implicit template unless one is explicitly provided

### 8.2 Existing project route
`/editor/:projectId`

Must load:
- the project matching the id in the active allowed scope

Must not:
- silently fallback to an unrelated project

### 8.3 Share route
`/share/:id`

Must load:
- exactly the requested share resource

Must not:
- fallback to a default item if id is invalid

### 8.4 Seeded editor entries
Template or team/preset entry into editor must carry explicit seed context and create a new working project snapshot.

In V1, this seed context is passed by query params:

- `/editor?templateId=<id>`
- `/editor?teamId=<id>`
- `/editor?teamId=<id>&presetId=<id>`

## 9. Workspace Handling Rules

### 9.1 V1 route model
V1 keeps page routes simple:
- `/projects`
- `/templates`
- `/teams`
- `/settings`

Workspace context is not encoded as a separate path segment in V1.

### 9.2 V1 workspace implementation expectation
- active workspace must still be global and real
- page data must react to workspace changes
- workspace switching must not be a purely cosmetic local component state

### 9.3 Future extension note
Space-scoped URLs may be introduced later, but V1 implementation should not depend on them.

## 10. Persistence Integration Rules

### 10.1 Local-first draft support
The frontend must support local persistence for:
- guest draft
- unsynced draft
- editor recovery

### 10.2 Project list consistency
Asset pages such as dashboard and projects page must be able to reflect locally saved project updates, not just static seed data.

### 10.3 Share consistency
Share page should consume share-specific snapshots or project projections, not ad hoc UI state.

## 11. Interaction Safety Rules

### 11.1 Dead button rule
Do not expose major primary controls as clickable unless a real behavior exists.

### 11.2 Invalid-state clarity
Invalid project, invalid share, and missing seed cases must render explicit states.

### 11.3 Touch compatibility
Any control needed on tablet/mobile must not rely solely on hover state.

## 12. Frontend Implementation Priorities

Recommended implementation order:
1. workspace context integrity
2. editor load/save/share correctness
3. asset-page data consistency
4. responsive editing interactions
5. polish and secondary states

## 13. V1 Engineering Constraints

V1 should avoid:
- over-generalized state systems before product boundaries are stable
- hidden coupling between nav components and data scope
- hover-only critical actions
- multiple conflicting project sources without explicit resolution rules

## 14. Related Documents

- [../03-functional/frd/editor.md](../03-functional/frd/editor.md)
- [../03-functional/frd/projects.md](../03-functional/frd/projects.md)
- [../03-functional/frd/share.md](../03-functional/frd/share.md)
- [../04-domain/domain-model.md](../04-domain/domain-model.md)
- [../04-domain/entity-lifecycle.md](../04-domain/entity-lifecycle.md)
- [../04-domain/versioning-and-sharing.md](../04-domain/versioning-and-sharing.md)
