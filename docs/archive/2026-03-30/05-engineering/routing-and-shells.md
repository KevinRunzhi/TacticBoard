# Routing and Shells

## 1. Purpose
This document defines the V1 route map, shell map, and navigation behavior.

It exists to prevent:
- shell/page mismatch
- routing fallback bugs
- incorrect navigation exposure in immersive surfaces

## 2. Route Inventory

### 2.0 Root route rule
- `/` is the only root route in V1.
- When logged out, `/` renders the landing / home experience.
- When logged in, `/` renders the workspace / dashboard experience.

### 2.1 App-shell routes
- `/` (logged-in workspace/dashboard mode only)
- `/projects`
- `/templates`
- `/teams`
- `/settings`

### 2.2 Editor routes
- `/editor`
- `/editor/:projectId`

### 2.3 Viewer routes
- `/share/:id`

### 2.4 Auth routes
- `/login`
- `/register`
- `/bind-account`

### 2.5 Fallback routes
- `*` -> 404 page

## 3. Shell Types

### 3.1 App shell
Used for:
- dashboard/workspace
- projects
- templates
- teams
- settings

Contains:
- primary navigation
- workspace switcher
- top-level search if present

Does not contain:
- immersive editor controls

### 3.2 Editor shell
Used for:
- `/editor`
- `/editor/:projectId`

Contains:
- editor-specific top bar
- pitch-centered workspace
- tool panels / drawers / step bar

Does not contain:
- app-shell primary navigation

### 3.3 Viewer shell
Used for:
- `/share/:id`

Contains:
- minimal viewer header
- read-only canvas
- playback controls

Does not contain:
- app-shell primary navigation
- full editor controls

### 3.4 Auth shell
Used for:
- `/login`
- `/register`
- `/bind-account`

Contains:
- brand surface
- auth forms
- auth progression messaging

Does not contain:
- app-shell navigation

## 4. Navigation Rules

### 4.1 App-shell navigation
Primary nav items:
- workspace
- projects
- templates
- teams
- settings

Workspace switcher is visible only inside app shell.

### 4.2 Editor navigation
Editor must provide:
- a clear return path
- project title context
- save/share/export entry

Editor must not display normal app-shell primary navigation.

### 4.3 Viewer navigation
Viewer must provide:
- minimal return or brand path
- copy entry if permitted

Viewer must not expose full app-shell navigation.

## 5. Route Entry Rules

### 5.1 Dashboard
Acts as the default in-app landing route for logged-in users.

### 5.1.1 Landing
Acts as the default logged-out landing route through the same `/` path in V1.

### 5.2 Editor
May be entered from:
- dashboard quick create
- dashboard recent items
- projects page
- templates page
- teams page
- share copy flow

V1 seed transport rules:

- template-seeded entry uses query params: `/editor?templateId=<id>`
- team/preset-seeded entry uses query params: `/editor?teamId=<id>&presetId=<id>`
- team-only seeded entry uses query params: `/editor?teamId=<id>`

### 5.3 Share route
May be entered directly from external links without prior app-shell context.

### 5.4 Auth routes
May be entered from:
- direct user navigation
- guest upgrade flow
- gated action redirects

## 6. Invalid Route Behavior

### 6.1 Unknown app route
Must render 404, not random fallback content.

### 6.2 Invalid editor project id
Must render explicit invalid project state.

### 6.3 Invalid share id
Must render explicit invalid share state.

## 7. Cross-Shell Transition Rules

### 7.1 App shell -> editor shell
Transition should preserve:
- workspace context
- project or seed context

### 7.2 App shell -> viewer shell
Usually occurs via share action; viewer opens outside normal app navigation.

### 7.3 Viewer shell -> auth shell
May happen when user attempts to copy and login is required.

### 7.4 Auth shell -> editor/app shell
Must resume intended action when possible:
- continue guest binding
- continue copy-from-share
- enter logged-in workspace

## 8. V1 Routing Constraints

- V1 routes are intentionally simple and flat.
- Workspace context is global application state, not route segment in V1.
- Seed context must be explicit in V1 query params for template/team/preset-seeded editor entry.
- Seed context must not be implicit.

## 9. Related Documents

- [frontend-architecture.md](./frontend-architecture.md)
- [../03-functional/frd/overview.md](../03-functional/frd/overview.md)
- [../03-functional/frd/auth.md](../03-functional/frd/auth.md)
