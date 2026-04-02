# FRD - Projects Page

## 1. Page Identity

- Page name: Projects
- Route: `/projects`
- Shell type: App shell

## 2. Purpose

The projects page is the primary asset management surface for tactics projects inside the currently active workspace.

It is responsible for:

- listing projects
- filtering and sorting projects
- opening projects in the editor
- project-level copy / share / delete actions

## 3. Data Scope

- Data must reflect the active workspace context.
- The page must not ignore local saved editor state.
- Newly saved drafts and modified local projects must be reflected in the project list.

## 4. Core Modules

### 4.1 Page Header

- page title
- current workspace indicator
- primary CTA: `new project`

### 4.2 Search and Filter Area

- keyword search
- format filter
- tag filter where available
- sort control
- optional list/grid toggle

### 4.3 Project Asset List

Each project card should include:

- preview
- project title
- format
- step count
- last updated time
- workspace-appropriate metadata

### 4.4 Project Action Menu

Each project card should support:

- open
- rename
- duplicate
- create copy in another allowed context
- create or manage share link
- delete

## 5. Core Behaviors

### 5.1 New Project

- Clicking `new project` opens `/editor` in blank draft mode.

### 5.2 Open Existing Project

- Clicking a project card opens `/editor/:projectId`.
- The editor must load the matching project state.

### 5.3 Saved State Reflection

- The projects page must reflect local and workspace-aware saved state.
- It must not remain hardwired to static mock data when local saved versions exist.

### 5.4 Workspace Switching

- Changing workspace changes the visible project set.
- The page title may remain the same, but project data must be re-scoped.

### 5.5 Folder Rule

- V1 does not support project folders or move-to-folder actions.
- Project organization in V1 relies on workspace scope, filters, sorting, and tags where available.

## 6. Required States

### 6.1 Normal State

- project list rendered
- filters available
- actions visible

### 6.2 Empty State

- no project exists in the current workspace
- clear CTA to create a first project

### 6.3 No Result State

- search or filter returned nothing
- clear reset-filter action

### 6.4 Confirmation and Feedback States

- delete confirmation
- copy success feedback
- share success feedback

## 7. Device Rules

### 7.1 Desktop

- grid or list view with full controls visible

### 7.2 Tablet

- controls may compress
- cards remain easily scannable

### 7.3 Mobile

- single-column cards
- search/filter may move into sheet or collapsible panel

## 8. Permission and Context Rules

- Personal projects default to owner-only visibility unless shared.
- Team projects follow team visibility rules.
- Share actions must respect project permission settings, including share creation and share revocation.

## 9. Not in V1

- deep folder hierarchy
- complex bulk operations
- advanced analytics on projects page
