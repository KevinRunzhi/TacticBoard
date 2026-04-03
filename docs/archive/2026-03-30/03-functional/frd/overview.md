# Football Tactics Board - FRD Overview

## 1. Purpose

This document set defines the page-level functional behavior for V1 of the football tactics board product.

It sits below the PRD and IA:

- PRD answers: what the product is and what V1 includes.
- IA answers: which pages exist, how they connect, and what each page is responsible for.
- FRD answers: what each page and each key action actually does.

## 2. Scope

This FRD batch focuses on the pages that currently carry the highest product and implementation risk:

- dashboard / workspace
- projects
- editor
- share

This batch also includes the supporting pages needed to close the V1 page system:

- templates
- teams
- settings
- auth entry flows

## 3. Core Principles

### 3.1 One Product Logic, Multiple Layouts

- Desktop, tablet, and mobile share the same product logic.
- Layout and entry style may differ by device size.
- Mobile editing is intentionally limited to light editing.

### 3.2 Snapshot First

- Projects are created from templates, teams, and presets through snapshot import.
- Existing projects do not automatically mutate when upstream assets change.
- Refresh from source must be explicit and user-triggered.

### 3.3 Editor Is for Creation

- The editor creates and modifies tactics content.
- Heavy asset management for templates, teams, lineups, and player libraries must remain outside the editor.

### 3.4 Share Is for Viewing

- The share page is a viewer, not a mirrored editor.
- Copying from share creates a new project.
- Share permissions determine whether copy actions are visible.

## 4. Shared Rules Across FRDs

### 4.1 Space Context

- The app supports `personal` and `team` workspace contexts.
- App-shell pages must render data according to the active workspace.
- Editor entry may carry asset context from templates, teams, and presets.

### 4.2 Status Categories

Every primary page should define, when applicable:

- loading state
- empty state
- no-result state
- error state
- destructive confirmation state
- success feedback state
- invalid access or expired-link state

### 4.3 Routing Contract

- Root route in V1: `/`
- `/` renders landing / home when logged out, and workspace / dashboard when logged in
- App-shell pages: `/`, `/projects`, `/templates`, `/teams`, `/settings`
- Immersive pages: `/editor`, `/editor/:projectId`, `/share/:id`
- Auth entry pages: `/login`, `/register`, `/bind-account`

### 4.4 V1 Delivery Boundary

The FRD should describe V1 behavior only.

If an interaction is intentionally postponed, it should be marked as one of:

- not in V1
- placeholder UI only
- later engineering enhancement

## 5. Current FRD File Map

- `overview.md`
- `workspace.md`
- `editor.md`
- `projects.md`
- `share.md`
- `templates.md`
- `teams.md`
- `settings.md`
- `auth.md`

## 6. Definition of Done for a Page Spec

A page-level FRD is considered ready when it clearly defines:

- page purpose
- route and entry sources
- major modules
- primary actions
- permissions and workspace behavior
- device differences
- failure and edge states

## 7. Next Recommended Documents

After this FRD batch, the next most valuable documents are:

1. `05-engineering/frontend-architecture.md`
2. `05-engineering/routing-and-shells.md`
3. `05-engineering/state-management.md`
4. `06-quality/acceptance-checklist.md`
5. `06-quality/test-matrix.md`
