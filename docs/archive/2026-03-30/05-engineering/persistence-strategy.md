# Persistence Strategy

## 1. Purpose
This document defines the V1 persistence strategy across:
- guest drafts
- local editor state
- workspace assets
- versions
- share metadata

## 2. Persistence Layers

### 2.1 Guest-local persistence
Used for:
- guest draft recovery
- try-before-login flow

### 2.2 User-local persistence
Used for:
- unsynced drafts
- recent project continuity
- project recovery before backend sync is finalized

### 2.3 Workspace asset persistence
Used for:
- saved projects
- templates
- teams
- presets
- player profiles

### 2.4 Version persistence
Used for:
- auto snapshots
- manual versions
- restore-generated versions

### 2.5 Share persistence
Used for:
- share links
- share target type
- share permission flags
- invalidation state

### 2.6 Recommended V1 storage mapping

Recommended implementation direction for V1:

- guest-local persistence: browser local storage abstraction, upgradeable later if needed
- user-local persistence: browser local storage abstraction for unsynced continuity and recovery
- workspace asset persistence: repository-backed storage layer (mock or remote implementation behind the same interface)
- version persistence: same repository-backed layer as project persistence
- share persistence: same repository-backed layer as project persistence

V1 engineering may still begin with mock-backed repositories, but page behavior must not depend on static seed arrays after the prototyping stage.

## 3. V1 Strategy Rules

### 3.1 Local-first editing
Editor must remain resilient even when the user has not yet completed a full remote save flow.

### 3.2 Explicit binding
Guest or local draft content becomes account/workspace content only through explicit save or bind actions.

### 3.3 Snapshot persistence
Saved project records persist snapshot content, not live upstream references.

## 4. Required Persistence Guarantees

### 4.1 Guest guarantee
Guest users should not lose the current active draft because they opened auth flow.

### 4.2 Saved project guarantee
Saved project updates should be able to appear back in project lists and dashboard views.

### 4.3 Version guarantee
Version restore should not destroy prior recoverable state.

### 4.4 Share guarantee
Invalidated links should never load valid content accidentally.

## 5. Migration Guidance

V1 may begin with partial local persistence or mock-backed persistence, but the frontend architecture should already respect:
- workspace ownership boundaries
- project identity
- share identity
- version identity

Do not hardcode page behavior to static seed arrays beyond prototyping stages.

## 6. Related Documents

- [../04-domain/entity-lifecycle.md](../04-domain/entity-lifecycle.md)
- [../04-domain/versioning-and-sharing.md](../04-domain/versioning-and-sharing.md)
- [state-management.md](./state-management.md)
