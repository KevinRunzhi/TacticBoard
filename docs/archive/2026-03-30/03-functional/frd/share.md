# FRD - Share Page

## 1. Page Identity

- Page name: Share / View
- Route: `/share/:id`
- Shell type: Viewer immersive shell

## 2. Purpose

The share page is the read-only presentation surface for a tactics board.

It is used to:

- view a tactics board
- play through steps
- inspect content on desktop or mobile
- optionally create a personal copy if permission allows

## 3. Share Types

The share page supports two link semantics:

- dynamic project share link
- fixed version share link

The page must clearly distinguish which one is being viewed.

## 4. Core Modules

### 4.1 Minimal Header

- title
- optional author and match metadata
- return path

### 4.2 Read-Only Canvas

- pitch content viewer
- zoom and pan
- fit-to-view and reset

### 4.3 Playback Controls

- previous / next step
- play / pause
- speed control if supported by current mode

### 4.4 Copy Action Area

- show copy CTA only if the link has copy permission
- if the user is not logged in, route to login / bind flow first

### 4.5 Download / Export Rule

- V1 share page does not provide a dedicated export or download workflow.
- Viewing and copy are the primary actions on the share page.
- If browser-native image save exists, it is outside product-level share behavior.

## 5. Core Behaviors

### 5.1 Invalid Link

- An invalid share id must not silently fall back to another share item.
- The page must show an explicit invalid or expired state.

### 5.2 Permission Handling

- If the share exists but access is denied, show a clear restricted-access state.
- If copy is disallowed, hide the copy CTA instead of showing a dead button.
- V1 share page never exposes direct edit controls; `edit allowed` remains future-facing terminology only.

### 5.3 Playback

- Play must actually auto-advance steps.
- Play state must be visible.

### 5.4 Copy Semantics

- Copy from fixed version link -> copy the fixed version content currently being viewed
- Copy from dynamic share link -> copy the project state currently being viewed
- New copy does not inherit the original share link
- New copy becomes a normal editable project

## 6. Rendering Rules

- Default render includes only currently visible content
- hidden objects and hidden layers are excluded
- reference background is excluded by default unless explicitly enabled
- previous-step ghosting is excluded by default unless explicitly enabled
- title, notes, match info, and brand info are optional overlays

## 7. Required States

### 7.1 Normal State

- share content visible
- playback controls visible
- zoom/pan available

### 7.2 Invalid or Expired State

- invalid link id
- deleted share
- disabled share link

### 7.3 Restricted State

- share exists but user lacks access

### 7.4 Copy Feedback State

- copy success
- login required before copy

## 8. Device Rules

### 8.1 Desktop

- wide read-only canvas
- visible playback controls
- strong readability for titles and metadata

### 8.2 Mobile

- mobile-first readability
- controls anchored in a compact bottom area
- content remains understandable without desktop hover behavior
- no dedicated image / GIF / MP4 download controls on share page in V1

## 9. Not in V1

- comment thread on share page
- collaborative editing from share page
- dedicated export/download workflow from share page
- heavy article-style share pages
