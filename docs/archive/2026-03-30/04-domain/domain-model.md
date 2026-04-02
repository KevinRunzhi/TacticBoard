# Football Tactics Board - Domain Model Overview

## 1. Purpose

This document defines the core domain entities and their high-level relationships for V1.

It exists to reduce bugs caused by:

- ambiguous ownership
- unclear snapshot rules
- mixed responsibilities between editor state and asset state

## 2. Core Entities

### 2.1 Workspace

- `personal`
- `team`

Workspace determines the scope for:

- projects
- templates
- teams
- player libraries

### 2.2 Project

A project is the main editable tactics artifact.

It contains:

- pitch settings
- object graph
- steps
- view state
- sharing metadata
- save metadata

### 2.3 Project Version

A project version is a saved snapshot of a project state.

Types:

- automatic snapshot
- manually named version
- restore-generated version

### 2.4 Share Link

A share link exposes a project or a fixed version through the share page.

Types:

- dynamic project link
- fixed version link

### 2.5 Project Template

A reusable project skeleton that may include:

- step structure
- visual style
- text structure
- optional team or lineup snapshot source

### 2.6 Formation Template

A reusable standing layout definition.

It contains:

- player count
- relative placement structure

It does not contain:

- free text
- line drawings
- multi-step logic

### 2.7 Team

A team asset contains:

- team identity
- visual defaults
- lineup presets
- player profiles

### 2.8 Lineup Preset

A lineup preset belongs to a team and represents:

- players
- positions
- formation or standing layout

### 2.9 Player Profile

A player profile belongs to a team-scoped player library within a workspace.

In V1:

- player profiles are managed inside team context
- the team itself may belong to either personal or team workspace

Copies between personal and team libraries are independent after copy.

## 3. Relationship Rules

### 3.1 Snapshot Rule

- Projects are created from upstream assets by snapshot.
- Existing projects do not live-reference upstream assets.
- Manual refresh is explicit and conflict-managed.

### 3.2 Workspace Rule

- Assets belong to either a personal or team workspace.
- Workspace is not just a UI label; it changes real data scope.

### 3.3 Sharing Rule

- Share links never mutate project ownership.
- Copying from share creates a new project in the current user's allowed scope.

## 4. Current High-Risk Areas

These areas remain the most important implementation-risk areas after the current domain batch:

1. project persistence and local draft merge rules
2. workspace switching data isolation and stale state reset
3. version lifecycle and share invalidation rules
4. editor runtime state versus stored project snapshot

Related detailed documents:

- [entity-lifecycle.md](./entity-lifecycle.md)
- [versioning-and-sharing.md](./versioning-and-sharing.md)
