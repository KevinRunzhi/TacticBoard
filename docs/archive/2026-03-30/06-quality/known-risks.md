# Known Risks

## 1. Purpose
This document tracks current V1 risks that deserve repeated attention during implementation and review.

## 2. Product Risks

### 2.1 Workspace context drift
Risk:
- UI may appear to switch workspace while underlying data does not.

Impact:
- wrong project/template/team data shown

### 2.2 Seeded editor context loss
Risk:
- template or team preset entry may fall back to generic blank editor

Impact:
- core reuse flows appear broken

### 2.3 Share semantics confusion
Risk:
- fixed versus dynamic share behavior may be implemented inconsistently

Impact:
- copy/share behavior becomes untrustworthy

## 3. UX Risks

### 3.1 Tablet hover dependency
Risk:
- controls implemented only for hover become unusable on touch devices

### 3.2 Pitch visibility regression
Risk:
- responsive layout changes can shrink or crop the pitch

### 3.3 Dead-control regression
Risk:
- exposing buttons before real behavior exists creates false completeness

## 4. Engineering Risks

### 4.1 Static mock dependency
Risk:
- pages continue reading static data while editor writes local state elsewhere

### 4.2 State duplication
Risk:
- workspace, project, or share identity stored in multiple places

### 4.3 Editor/share state coupling
Risk:
- viewer accidentally reuses mutable editor state instead of snapshot/view state

## 5. Quality Risks

### 5.1 Incomplete invalid-state handling
Risk:
- invalid id falls back silently

### 5.2 Incomplete responsive coverage
Risk:
- desktop works, but tablet/mobile interactions break in subtle ways

### 5.3 Spec drift
Risk:
- PRD, FRD, and implementation drift apart over time

## 6. Current Mitigation Priorities

Current priorities:
1. preserve workspace-aware data loading
2. preserve seeded entry correctness
3. preserve invalid-state explicitness
4. preserve tablet/mobile editor reachability
5. keep docs and implementation aligned
