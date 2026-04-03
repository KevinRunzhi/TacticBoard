# FRD - Editor Page

## 1. Page Identity

- Page name: Editor
- Routes:
  - `/editor`
  - `/editor/:projectId`
- Shell type: Immersive shell

## 2. Purpose

The editor is the core creation surface of the product. It is used to create, edit, review, and export tactics boards.

It must prioritize:

- pitch visibility
- fast object manipulation
- multi-step tactics explanation
- stable save/share/export behavior

## 3. Entry Sources

The editor can be entered from:

- dashboard quick create
- dashboard recent projects
- projects page
- template center
- teams page
- share-page copy flow
- guest trial flow

## 4. Entry Modes

### 4.1 Blank Draft

- Route: `/editor`
- Meaning: create a new blank draft
- Initial state:
  - pitch visible
  - no players placed by default
  - default field format and field view loaded from app defaults

### 4.2 Existing Project

- Route: `/editor/:projectId`
- Meaning: open an existing saved project or local draft
- Initial state:
  - project snapshot loaded
  - saved steps restored
  - saved view restored if available, otherwise fit-to-view

### 4.3 Template-Seeded Project

- Entry source: template center
- Required seed:
  - `templateId`
- Expected behavior:
  - editor opens as a new project seeded from the selected template
  - seed is applied before first render of the working document
  - result is a normal editable new project, not a live template reference

### 4.4 Team / Preset-Seeded Project

- Entry source: teams page
- Required seed:
  - `teamId`
  - optional `presetId`
- Expected behavior:
  - editor opens as a new project seeded from the selected team context
  - if a preset exists, lineup and layout are seeded from the preset snapshot
  - result is a normal editable new project

## 5. Core Modules

### 5.1 Top Toolbar

Primary responsibilities:

- exit editor
- show project title
- show save state
- undo / redo
- zoom controls
- fit-to-view / reset view
- save draft
- export
- share
- play / pause

### 5.2 Tool Panel

Primary responsibilities:

- player insertion / lineup tools
- line tools
- region tools
- text tools
- formation selection
- lightweight team/template seeding entry

### 5.3 Pitch Canvas

Primary responsibilities:

- render pitch
- render players, ball, regions, text, lines, and optional overlays
- support selection, drag, zoom, and pan

### 5.4 Step Bar

Primary responsibilities:

- switch steps
- add steps
- reorder steps
- duplicate steps
- show current step metadata
- control playback

### 5.5 Context Panel

Primary responsibilities:

- object properties
- style settings
- line / text / region options
- layer and grouping context, where applicable

## 6. Core Behavior Rules

### 6.1 Pitch Visibility

- On first open, the pitch must default to fit-to-view.
- Full pitch must be fully visible on first load.
- Field change between full / half pitch must trigger fit-to-view.
- View logic must preserve pitch aspect ratio and avoid default cropping.

### 6.2 Canvas Navigation

Desktop:

- wheel / trackpad zoom
- drag on empty canvas to pan
- space + drag to pan
- middle mouse drag may exist as a shortcut, but not as the only pan method

Tablet / mobile:

- pinch to zoom
- drag to pan
- fit-to-view button always available

### 6.3 Object Identity Across Steps

- When a step is duplicated, object identity is preserved into the new step.
- Step-to-step comparison and previous-step ghosting rely on object identity.
- Deleting an object in a step does not retroactively change earlier steps.
- Re-adding an object after deletion creates a new identity.

### 6.4 Undo / Redo Scope

- Undo / redo applies to the current project editing history, not just the current step.
- Step switching does not clear the undo stack.
- Pure view actions do not enter history.
- Content-changing actions do enter history.

### 6.5 Formation Application

- New blank drafts do not place players automatically.
- Selecting a formation should auto-place players on the current step.
- Formation application should work on desktop and tablet.

## 7. Device Rules

### 7.1 Desktop

- Full editing mode
- multi-panel layout allowed
- all core editing tools visible or one-click reachable

### 7.2 Tablet

- full editing logic retained
- fewer fixed side panels
- tools and properties may appear in drawers / slide panels
- function visibility must remain high

### 7.3 Mobile

- light editing only
- no full desktop three-column layout
- pitch first, tools second
- no heavy asset management
- no GIF / MP4 export
- image export allowed

## 8. Save and Share Rules

- Blank draft may exist locally before login.
- Logged-in users can save to workspace context.
- Share behavior must follow the project / version / link rules defined in PRD.
- Share link generation is unavailable to guest users.

## 9. States

### 9.1 Required States

- blank new draft
- existing project loaded
- template-seeded new project
- team/preset-seeded new project
- guest editing state
- save success feedback
- share success feedback
- invalid project state

### 9.2 Error / Edge Cases

- missing project id
- invalid project id
- seed references unavailable
- unsupported action in guest mode

## 10. Not in V1

- full mobile editing parity with desktop
- advanced field-level merge when refreshing from source
- auto-generated tactics by AI
- complex video editing or timeline authoring
