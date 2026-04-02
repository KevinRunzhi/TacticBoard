# FRD - Workspace / Dashboard Page

## 1. Page Identity

- Page name: Workspace / Dashboard
- Route: `/`
- Shell type: App shell

## 2. Purpose

The workspace page is the default entry after login.

It is designed to minimize time-to-create and time-to-resume by exposing:

- quick create
- continue editing
- shortcut navigation into major asset areas

It is not a full management page for projects, templates, or teams.

## 3. Data Scope

- Data must reflect the active workspace context.
- Recent projects, shortcut counts, and quick-access cards must not stay hardcoded once workspace-aware data exists.
- Switching workspace must refresh the dashboard content.

## 4. Core Modules

### 4.1 Welcome / Hero Area

- personalized greeting
- quick explanation of next actions
- primary CTA: create new tactics board
- secondary CTA: create from template

### 4.2 Continue Editing Area

- recently edited project cards
- direct entry back into the editor

### 4.3 Quick Asset Entry Area

- shortcut cards into:
  - projects
  - templates
  - teams

### 4.4 Optional Summary Area

- current workspace summary counts
- lightweight overview only

## 5. Core Behaviors

### 5.1 New Blank Project

- Clicking the main CTA opens `/editor` in blank draft mode.

### 5.2 Create from Template

- Clicking the template CTA should route users into the templates page or a template picker flow, not a generic blank editor.
- Template-based creation should only enter the editor after the user has selected a concrete template.

### 5.3 Continue Editing

- Clicking a recent project card must open the matching project in the editor.
- This flow must respect local saved state and current workspace scope.

### 5.4 Workspace Switching

- Switching workspace changes the dataset shown in:
  - recent projects
  - template shortcuts
  - asset summary cards

## 6. Required States

### 6.1 Normal State

- greeting visible
- main CTA visible
- recent projects visible
- shortcut cards visible

### 6.2 Empty State

- no recent projects in the current workspace
- dashboard still offers create and template entry

### 6.3 Mixed State

- recent projects empty but templates / teams exist
- some quick cards may still show valid counts

## 7. Device Rules

### 7.1 Desktop

- hero, recent projects, and quick entries should all be visible without excessive scrolling

### 7.2 Tablet

- stacked but still visually balanced layout

### 7.3 Mobile

- quick create stays first
- recent projects become vertical cards
- shortcut areas remain readable without dashboard feeling like a dense admin page

## 8. Permission and Workspace Rules

- Workspace page content always follows the active workspace context.
- Personal workspace shows personal assets only.
- Team workspace shows assets visible in the active team workspace only.
- Workspace page may expose counts and recent items, but it does not override underlying project/template/team permission rules.

## 9. Not in V1

- deep analytics dashboard
- activity feeds with operational complexity
- notification center beyond simple placeholders
