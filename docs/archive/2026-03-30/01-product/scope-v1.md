# Scope V1

## 1. Purpose
This document defines the committed V1 product scope.

It exists to:
- freeze what V1 includes
- reduce uncontrolled scope growth
- give engineering and QA a stable delivery target

## 2. V1 Product Definition

V1 is a web-based football tactics board product for:
- football enthusiasts
- amateur teams
- content creators

Its V1 promise is:
- create tactics boards
- organize reusable assets
- share and view tactics content
- manage personal and team workspace content

## 3. V1 Core Pages

V1 includes:
- workspace/dashboard
- projects page
- templates page
- teams page
- editor page
- share page
- settings page
- auth entry pages

## 4. V1 Core Capabilities

### 4.1 Editing
- pitch templates
- player, ball, text, region, and line objects
- multi-step tactics
- zoom/pan canvas
- undo/redo
- formation application
- guest editor with local draft and login-upgrade path

### 4.2 Asset flows
- projects
- project templates
- formation templates (standing layout only; no step logic, no line objects, no text structure)
- teams
- lineup presets
- player profiles

### 4.3 Sharing and versioning
- fixed version share links
- dynamic project share links
- project versions
- copy-from-share

### 4.4 Workspace model
- personal workspace
- team workspace
- workspace-aware asset views
- V1 workspace context uses app-level shared state, not route path segments
- team workspace includes asset isolation and basic invite-code entry
- V1 team workspace does not include real-time co-editing or advanced role-based permissions

## 5. V1 Responsive Scope

- Desktop: full app and full editor
- Tablet: full app and full editor logic with adaptive layout
- Mobile: full viewing plus light editor (same editor page with reduced capability, not a separate editor product)

## 6. V1 Explicitly Not Included

- AI-assisted generation in first release
- real-time collaboration
- share-page comments
- advanced video analysis workflows
- complex branching/version tree workflows

## 7. Scope Freeze Principle

New major systems should not be added to V1 unless they unblock:
- correctness
- major UX failure
- release-critical product coherence
