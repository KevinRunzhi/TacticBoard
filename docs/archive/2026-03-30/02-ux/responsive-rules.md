# Responsive Rules

## 1. Purpose
This document captures the V1 responsive behavior rules across app-shell pages and immersive pages.

## 2. Global Rule

The product keeps one logic model across devices, but layout and entry style adapt by screen size.

## 3. App-Shell Pages

App-shell pages include:
- workspace
- projects
- templates
- teams
- settings

### Desktop
- full navigation visible
- wider list/card layouts
- multi-column density allowed

### Tablet
- denser but still readable layout
- no hover-only primary actions
- key filters/actions remain visible or one tap away

### Mobile
- stacked layout
- filters and secondary actions may collapse into drawers/sheets
- primary actions remain visible

## 4. Home / Landing

### Desktop
- hero area, primary CTA, and supporting examples may share the first screen
- marketing content can use wider editorial spacing than app-shell pages

### Mobile
- primary CTAs stack vertically
- supporting examples or preview cards may become horizontal carousels
- first screen should keep trial and auth entry visible without requiring deep scrolling

## 5. Auth Pages

### Desktop
- centered auth surface with clear brand continuity
- login, registration, and bind-account remain outside app shell

### Mobile
- single-column form layout
- primary CTA remains visible without excessive scrolling
- validation and next-step messaging must remain readable in compact width

## 6. Editor

### Desktop
- full editing layout
- multiple panels allowed

### Tablet
- full editor logic retained
- fewer fixed side panels
- drawers/sheets may replace constant sidebars
- pitch remains dominant

### Mobile
- light editing only
- pitch first
- tools and properties open on demand
- no heavy management panels
- no full desktop three-column layout
- no GIF / MP4 export
- image export allowed
- detailed exclusions and retained capabilities should follow `frd/editor.md`

## 7. Share Viewer

### Desktop
- wide readable canvas
- visible playback controls

### Mobile
- compact controls
- read-only viewing remains fully usable
- content remains understandable without hover behavior

## 8. Non-Negotiable Responsive Rules

- pitch must not be cropped by default on first open
- critical controls must not depend solely on hover
- smaller screens must reorganize access, not silently remove needed capabilities
