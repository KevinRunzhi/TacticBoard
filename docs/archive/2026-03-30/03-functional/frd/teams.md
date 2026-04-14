# FRD - Teams Page

## 1. Page Identity

- Page name: Teams
- Route: `/teams`
- Shell type: App shell

## 2. Purpose

The teams page is the heavy management surface for team-related assets.

It is responsible for:

- team configuration
- lineup preset management
- player profile management
- home / away visual defaults

It is not responsible for free-form tactics editing.

## 3. Data Scope

- Teams data must reflect the active workspace context.
- Personal and team workspace data sets must not be mixed silently.
- Team page must carry real context into downstream editor entry flows.
- Teams may exist in either personal workspace or team workspace in V1.
- The active workspace determines which team set is visible and editable.

## 4. Core Modules

### 4.1 Page Header

- page title
- team count
- primary CTA: `new team`

### 4.2 Team List Area

- list or card rail of available teams
- active team selection state

### 4.3 Team Detail Area

For the selected team, show:

- identity
- basic summary
- major actions

### 4.4 Home / Away Visual Configuration

- home colors
- away colors
- team visual defaults

### 4.5 Lineup Preset Section

The page must display the lineup presets attached to the selected team.

Each preset card should expose:

- preset name
- formation label
- player count
- open-in-editor action

### 4.6 Player Library Section

The page must display the players attached to the selected team.

Each player row or card should expose:

- number
- name
- position
- position label
- actions

## 5. Core Behaviors

### 5.1 Team Selection

- Selecting a team updates the detail area.
- On mobile, team selection may switch from list view into detail view.

### 5.2 Enter Editor from a Lineup Preset

- Clicking a lineup preset must open the editor with both:
  - `teamId`
  - `presetId`
- The editor must not drop this context and fall back to a generic blank editor.

### 5.3 Team Actions

The page may expose:

- create team
- edit team
- duplicate team
- delete team

If some of these are placeholder UI in V1 implementation, they must be marked as such in engineering delivery, but the page-level responsibility still belongs here.

### 5.4 Player Actions

The page may expose:

- add player
- edit player
- remove player

### 5.5 Workspace Switching

- Switching workspace changes the visible team list and associated presets/players.
- The active selected team must reset safely if it is not available in the new workspace scope.

## 6. Structural Rules

### 6.1 No Extra Top-Level Navigation

Lineup presets and player profiles must stay inside the teams page hierarchy.

They must not become new top-level navigation items in V1.

### 6.2 Editor Boundary

- Team data may seed editor content.
- The editor may lightly apply teams and presets.
- Heavy management of teams, presets, and player records stays on the teams page.

## 7. Required States

### 7.1 Normal State

- team list visible
- selected team detail visible
- lineup presets visible
- player library visible

### 7.2 Empty State

- no team exists in current workspace
- CTA to create first team

### 7.3 Confirmation and Feedback States

- duplicate success
- delete confirmation
- delete success

### 7.4 Partial Empty States

Within a selected team:

- no lineup presets
- no players

These must not collapse the entire page.

## 8. Device Rules

### 8.1 Desktop

- split layout between team list and detail area

### 8.2 Tablet

- compressed split layout or navigable stacked layout
- no hover-only core actions

### 8.3 Mobile

- team list first
- selected team detail may replace list view
- presets and players become stacked sections

## 9. Ownership and Permission Rules

- Team assets belong to the active workspace context.
- A team asset may belong to either:
  - personal workspace
  - team workspace
- Team page visibility and editability should follow workspace rules already defined in PRD.
- Editor seeding from a lineup preset does not transfer ownership of the source team asset.

## 10. Not in V1

- advanced bulk import for entire rosters
- complex approval workflow for team changes
- real-time collaborative team management
