# FRD - Templates Page

## 1. Page Identity

- Page name: Templates
- Route: `/templates`
- Shell type: App shell

## 2. Purpose

The templates page is the reuse center of the product.

It is responsible for:

- browsing reusable templates
- filtering templates by category and format
- previewing templates
- creating a new project from a selected template

It is not responsible for full project editing.

## 3. Data Scope

- Template data must reflect the active workspace context.
- The page must distinguish between template categories, not flatten all templates into one undifferentiated list.
- Official and private template behavior may differ, but both should still be displayed within the same page framework.

## 4. Template Types in V1

The page must clearly support these types:

- official templates
- private templates
- project templates
- formation templates

### 4.1 Formation Template Rule

Formation templates represent standing structure only.

They do not represent:

- multi-step logic
- text explanations
- line drawings
- full project content

### 4.2 Project Template Rule

Project templates may carry:

- step structure
- style defaults
- text structure
- optional team or lineup snapshot context

## 5. Core Modules

### 5.1 Page Header

- page title
- current workspace context
- optional quick CTA for creating a blank project

### 5.2 Category Tabs

The page must support ownership-oriented category switching across:

- all
- official
- workspace

In personal workspace, `workspace` is presented as `my templates`.
In team workspace, `workspace` is presented as `team templates`.

### 5.3 Search / Filter / Sort Area

- keyword search
- template type filter:
  - all types
  - project templates
  - formation templates
- format filter
- sort mode

### 5.4 Template Card Grid

Each card should expose:

- template preview
- title
- type/category
- format
- step count where applicable
- updated time
- ownership / source hint where applicable

### 5.5 Template Preview Layer

- dialog, side panel, or equivalent preview surface
- used to inspect template contents before creation

## 6. Core Behaviors

### 6.1 Use Template to Create Project

- Clicking `use template` must open the editor with the selected template context.
- The editor must receive enough seed data to initialize the new project from that template.
- The result must be a new editable project, not a live template instance.

### 6.2 Blank Project Fallback

- The page may also provide a `new blank project` action.
- That action must open the editor in blank draft mode, not template-seeded mode.

### 6.3 Preview Behavior

- Previewing a template must not mutate current editor state.
- Preview is read-only.

### 6.4 Workspace Switching

- Switching workspace must reload the template set.
- Template counts and cards must update with the new workspace context.

## 7. Required States

### 7.1 Normal State

- category tabs visible
- cards visible
- preview available

### 7.2 Empty State

- no template exists for the current scope
- clear CTA to create a blank project or return to workbench

### 7.3 No Result State

- current filter/search returned nothing
- clear way to reset filters

### 7.4 Feedback States

- template applied successfully
- preview opened

## 8. Device Rules

### 8.1 Desktop

- card grid
- visible category tabs
- preview as dialog or side panel

### 8.2 Tablet

- card grid with slightly compressed filtering controls
- preview remains easily accessible without hover-only behavior

### 8.3 Mobile

- single-column or tight two-column card layout
- category tabs may scroll horizontally
- preview should use a full-screen sheet or dialog

## 9. Permission and Ownership Rules

- Official templates may be viewable to all users in scope.
- Private templates belong to the current workspace context.
- Team-internal templates should follow the active team workspace visibility rules.
- Ownership tabs and type filters are orthogonal:
  - category tabs answer who owns or provides the template
  - type filters answer whether the template is a project template or a formation template

## 10. Not in V1

- public marketplace publishing workflow
- community ratings or comments on templates
- advanced template analytics
