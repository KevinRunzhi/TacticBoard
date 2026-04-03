# Entity Lifecycle

## 1. Purpose
This document defines lifecycle states, transition events, and deletion/copy rules for the core V1 entities.

It is intended to reduce ambiguity across:
- FRD implementation
- frontend state management
- persistence and sync logic
- QA and acceptance testing

This document works together with:
- [domain-model.md](./domain-model.md)
- [versioning-and-sharing.md](./versioning-and-sharing.md)

## 2. Global Principles

### 2.1 Snapshot-first rule
Whenever one asset is used to create another asset, the target asset is created from a snapshot of the source, not a live reference.

Examples:
- a project created from a project template stores its own snapshot
- a project created from a team + lineup preset stores its own snapshot
- a copied player profile becomes an independent profile

### 2.2 Manual refresh rule
If the user wants to pull latest content from the original source asset, refresh must be explicitly triggered by the user.

V1 does not auto-sync downstream assets when upstream assets change.

### 2.3 Workspace-bound ownership rule
Every persistent asset belongs to exactly one workspace:
- personal workspace
- team workspace

Assets can be moved or copied across workspaces only through explicit user action.

### 2.4 Source traceability rule
Downstream assets may store lightweight source metadata for traceability, but source metadata does not imply live sync.

## 3. Entity Lifecycle Overview

Core persistent entities in V1:
- Project
- Project Version
- Share Link
- Project Template
- Formation Template
- Team
- Lineup Preset
- Player Profile

Non-persistent or semi-persistent runtime concepts:
- Guest Draft
- Editor Runtime State

## 4. Project Lifecycle

### 4.1 Project states
A project may move through these logical states:
- `draft`
- `saved`
- `shared`
- `copied`
- `deleted`

`draft` and `saved` are not mutually exclusive UI labels; they describe persistence maturity:
- draft: local or newly created work not yet fully named/organized
- saved: a persistent project record exists in a workspace

### 4.2 Project creation sources
A project may be created from:
- blank editor
- existing project copy
- project template
- formation template
- team + lineup preset
- share-page copy action

### 4.3 Project creation rules
- Blank project starts with an empty pitch and default editor state.
- Selecting a formation populates player objects on the active step.
- Creating from templates or presets imports a snapshot.
- Creating from a share page creates a new normal project, not a special shared object.

### 4.4 Project update rules
Project updates may include:
- object edits
- step edits
- layer edits
- metadata edits
- layout/view changes if persisted by product rules

Project updates do not mutate source templates, teams, presets, or player profiles unless the user explicitly enters those management flows.

### 4.5 Project deletion rules
- Personal project deletion removes the project from that workspace.
- Team project deletion is restricted by team ownership rules already defined in product docs.
- Deleting a project invalidates all share links attached to that project.

## 5. Guest Draft Lifecycle

### 5.1 Guest draft purpose
Guest draft exists to support:
- try-before-login editing
- low-friction product entry

### 5.2 Guest draft states
- `local-active`
- `bound-to-account`
- `cleared`

### 5.3 Guest draft rules
- Guest content is stored locally only until binding.
- Binding applies only to the currently active guest draft.
- After successful binding, the local guest draft is cleared.
- A bound guest draft becomes a normal project in the current logged-in account.

### 5.4 Guest draft limitations
Guest draft does not support:
- cloud persistence
- team ownership
- advanced account-bound management

## 6. Project Version Lifecycle

### 6.1 Version types
V1 supports:
- auto snapshot
- manually named version
- restore-generated version

### 6.2 Version creation events
Versions are created by:
- auto snapshot timer on changed projects
- explicit manual save as version
- restoring an old version

### 6.3 Version rules
- Auto snapshots are system-generated.
- Manual versions are user-named and retained independently.
- Restoring an old version does not overwrite history; it creates a new current state.

Detailed retention and share behavior is defined in [versioning-and-sharing.md](./versioning-and-sharing.md).

## 7. Share Link Lifecycle

### 7.1 Share link states
- `active`
- `closed`
- `invalidated`

### 7.2 Share link targets
V1 supports two share targets:
- dynamic project share
- fixed version share

### 7.3 Share link rules
- A project may own multiple share links.
- Share link behavior depends on whether the link targets a live project or a fixed version.
- Invalid links must render invalid state, never fallback content.

Detailed behavior is defined in [versioning-and-sharing.md](./versioning-and-sharing.md).

## 8. Project Template Lifecycle

### 8.1 Project template states
- `created`
- `updated`
- `used`
- `deleted`

### 8.2 Creation source
Project templates are created from existing projects.

### 8.3 Project template rules
- A project template stores structure as a snapshot.
- It may include step structure, visual defaults, and source bindings metadata.
- Using a project template to create a project generates a new downstream project snapshot.
- Updating a project template does not update projects already created from it.
- Deleting a project template does not break projects created from it.

## 9. Formation Template Lifecycle

### 9.1 Formation template states
- `created`
- `updated`
- `used`
- `deleted`

### 9.2 Formation template rules
- Formation templates only store standing structure.
- They do not store step-by-step tactical content, text, or routes.
- Applying a formation template can populate players on the active step.
- Updating or deleting a formation template does not mutate already created projects.

## 10. Team Lifecycle

### 10.1 Team states
- `created`
- `active`
- `updated`
- `deleted`

### 10.2 Team rules
- Team belongs to a workspace scope and may exist in either personal or team workspace.
- Team may contain lineup presets and player profiles.
- Team deletion requires prior cleanup according to product ownership rules.
- Team-level assets should not silently reassign themselves on deletion.

## 11. Lineup Preset Lifecycle

### 11.1 Lineup preset states
- `created`
- `updated`
- `used`
- `deleted`

### 11.2 Lineup preset rules
- A lineup preset belongs to a team.
- It may store players, substitutes, standing structure, and role placement.
- Using a preset to create or seed a project produces a snapshot in that project.
- Deleting a preset does not invalidate projects previously created from it.

## 12. Player Profile Lifecycle

### 12.1 Player profile states
- `created`
- `updated`
- `copied`
- `deleted`

### 12.2 Player profile rules
- Personal and team workspaces keep separate player profile libraries.
- Copying a player profile creates an independent copy.
- V1 does not auto-detect or auto-merge duplicate player identities.
- Minimal source metadata may be preserved for copied profiles.
- Deleting a player profile does not mutate historic project snapshots.

## 13. Copy and Move Lifecycle Rules

### 13.1 Copy rule
Copy creates a new independent asset in the target workspace.

Applicable to:
- projects
- templates
- player profiles
- team-related assets where product rules allow it

### 13.2 Move rule
Move transfers ownership/workspace of the same asset where product rules allow it.

### 13.3 Copy versus move consequences
- Copy preserves the original asset.
- Move may invalidate share links if the moved asset's share identity changes under sharing rules.
- Both operations must preserve source traceability where defined.

## 14. Refresh From Source Lifecycle

### 14.1 Refresh availability
Refresh from latest source is supported only as a manual user action.

### 14.2 Refresh conflict handling
When refreshing from latest source:
- user must be prompted first
- V1 only supports:
  - cancel
  - save as new project then refresh
  - refresh and overwrite current project
- before overwrite, system creates a version
- V1 does not support field-level merge

## 15. Editor Runtime State Lifecycle

### 15.1 Purpose
Editor runtime state includes temporary UI/session state such as:
- selected object
- open drawers
- active tool
- zoom and pan
- temporary overlays

### 15.2 Rule
Runtime state is not equivalent to persistent project data.

Product must explicitly define which view-state pieces persist and which are session-only.

### 15.3 Current V1 expectation
At minimum:
- project content persists
- share-safe content persists
- transient UI chrome state should not silently leak across unrelated projects

## 16. Lifecycle Invariants

The following invariants should always hold:
- downstream assets never silently auto-sync from upstream assets
- invalid share links never display unrelated content
- deleting a source asset does not corrupt already created downstream project snapshots
- workspace ownership is explicit
- copy creates a distinct new asset identity
- restore creates a new current version, not destructive history rewrite

## 17. Open Implementation Notes

This document intentionally leaves engineering strategy to later docs, but frontend/backend implementation must preserve:
- source snapshot semantics
- manual refresh semantics
- workspace ownership
- clear invalidation behavior

## 18. V1 Out of Scope Summary

The following are intentionally out of scope at the lifecycle layer in V1:

- field-level merge during refresh from source
- automatic downstream sync from upstream assets
- automatic duplicate detection or merge for player profiles
- implicit workspace reassignment on delete, move, or ownership changes
