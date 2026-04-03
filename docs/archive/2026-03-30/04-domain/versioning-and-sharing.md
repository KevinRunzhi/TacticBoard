# Versioning and Sharing

## 1. Purpose
This document defines the V1 rules for:
- project version creation and retention
- fixed versus dynamic sharing
- share link invalidation
- copy-from-share behavior
- interactions between sharing, deletion, move, and restore

It should be read together with:
- [domain-model.md](./domain-model.md)
- [entity-lifecycle.md](./entity-lifecycle.md)
- [../03-functional/frd/share.md](../03-functional/frd/share.md)

## 2. Core Principles

### 2.1 History safety over implicit mutation
Versioning must favor recoverability and traceability over silent in-place overwrite.

### 2.2 Fixed sharing is the default
When a user shares content, default behavior should favor stable, reproducible outputs.

### 2.3 Dynamic sharing is explicit
Dynamic project sharing is supported, but it must be explicitly identified to the user.

### 2.4 Shared viewing and copied creation are separate
Viewing shared content and creating your own editable copy are different actions with different semantics.

## 3. Version Model

### 3.1 Version types
V1 supports three version types:
- auto snapshot
- manually named version
- restore-generated version

### 3.2 Auto snapshot trigger rule
Auto snapshots are created:
- every 10 minutes
- only if the project has changed since the last snapshot

### 3.3 Auto snapshot retention rule
- Each project keeps at most 5 auto snapshots.
- When the limit is exceeded, the oldest auto snapshot is removed.
- Manually named versions are not affected by this limit.

### 3.4 Manual version rule
Manual versions:
- are created only by explicit user action
- include title and short note
- are preserved independently from auto snapshot rotation

### 3.5 Restore rule
Restoring an old version does not delete history and does not mutate the old version record.

Instead:
- the restored content becomes the current project state
- system creates a new version entry representing the restored result
- current pre-restore state must be preserved before restore

## 4. Share Link Types

### 4.1 Dynamic project share
Dynamic share points to the current state of a project.

Characteristics:
- updates as the project evolves
- suitable for ongoing internal review or collaborative visibility
- must be clearly labeled as dynamic

### 4.2 Fixed version share
Fixed share points to a specific immutable project version snapshot.

Characteristics:
- stable over time
- suitable for content publishing, review, archival reference, and replayable tactical explanation
- default share type in V1

## 5. Share Creation Rules

### 5.1 Default rule
Default share behavior in V1 is:
- create fixed version share

### 5.2 Additional supported mode
V1 also supports:
- dynamic project share

### 5.3 User clarity rule
When generating a share link, the product must make it explicit whether the link is:
- dynamic project share
- fixed version share

### 5.4 Multiple link rule
A project may have multiple share links at the same time.

## 6. Share Link Access Rules

### 6.1 Share link states
Share links may be:
- active
- manually closed
- invalidated by system event

### 6.2 Invalid link handling rule
If a share link is invalid, expired, closed, or otherwise unavailable:
- the product must show invalid-link state
- it must not fallback to unrelated content

### 6.3 Visibility rule
Share page actions such as copy must only appear when the current share has appropriate permission.

## 7. Copy From Share Rules

### 7.1 Fixed share copy behavior
Copying from a fixed version share creates a new project from the fixed version content the user is currently viewing.

It must not pull the latest state of the original source project.

### 7.2 Dynamic share copy behavior
Copying from a dynamic project share creates a new project from the project state visible at the moment of copy.

### 7.3 Copy target rule
A copied share becomes:
- a normal editable project
- in the user's current account/workspace context

It does not remain a special shared object.

### 7.4 Share inheritance rule
Newly copied projects do not inherit original share links.

If the user wants to share the copied project, a new share link must be created.

### 7.5 Source trace rule
Copied projects may preserve metadata indicating:
- source project
- source share link
- whether source was fixed or dynamic

This metadata is for traceability, not live sync.

## 8. Share Permission Rules

### 8.1 Share capability levels
Relevant share permissions in V1 are:
- read-only
- copy allowed
- edit allowed

In V1:
- `read-only` and `copy allowed` are implemented behaviors
- `edit allowed` is reserved terminology for future expansion and is not implemented in V1 share UX

### 8.2 Copy button visibility rule
The copy action should only be shown when the current share is allowed to be copied.

### 8.3 Team-space rule
Team-space visibility rules remain governed by workspace and permission model.

Sharing does not bypass underlying access rules.

## 9. Versioning and Share Interaction

### 9.1 Fixed share interaction
Fixed version shares are anchored to a specific version snapshot and are unaffected by later project edits.

### 9.2 Dynamic share interaction
Dynamic shares track the current project state, not a frozen version.

### 9.3 Restore interaction
If a project is restored to an old version:
- fixed shares created earlier still point to their original versions
- dynamic shares now reflect the newly restored current state

## 10. Move, Copy, and Deletion Interaction

### 10.1 Project copy interaction
Copying a project creates a new project identity.

Existing share links remain attached to the original project only.

### 10.2 Project move interaction
When a project is moved across workspace context:
- existing share links for the original project identity are invalidated
- moved project may generate new links later

This preserves clarity and avoids ambiguous access behavior across ownership boundaries.

Move here refers to cross-workspace transfer, not folder reorganization.

### 10.3 Project deletion interaction
Deleting a project invalidates all share links attached to that project.

### 10.4 Account or team deletion interaction
If the owning account/workspace context is deleted according to product rules:
- attached share links become invalid

## 11. Guest Flow Interaction

### 11.1 Guest users and sharing
Guest users may view shared content.

### 11.2 Guest copy behavior
If copying a share requires account-bound persistence:
- user is prompted to log in
- copied result binds to current logged-in account

### 11.3 Guest binding rule
Binding after guest editing applies only to the current active guest draft, not all local drafts.

## 12. UI Expectations

V1 should make the following states explicit:
- fixed versus dynamic share
- valid versus invalid link
- copy allowed versus copy unavailable
- active versus closed share
- current version versus historic version

The product should not require users to infer these semantics from behavior alone.

## 13. Acceptance Invariants

The following rules should always hold:
- invalid share links never render fallback project content
- fixed version shares never silently drift with later project edits
- dynamic shares never claim to be fixed
- copying from a share never reuses old share links
- restoring an old version never erases version history
- auto snapshots never delete manually named versions

## 14. V1 Out of Scope

The following are intentionally out of scope for V1:
- granular field-level merge during restore or refresh
- partial share of selected steps only
- live collaborative share sessions
- version trees/branches
- advanced retention policies beyond current auto snapshot rule
