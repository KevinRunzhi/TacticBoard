# ADR-001 - Workspace Context

## Status
Accepted

## Context
The product supports personal and team workspaces. Workspace context changes real data scope for projects, templates, teams, and player libraries.

## Decision
V1 uses:
- simple routes such as `/projects`, `/templates`, `/teams`
- a real app-level workspace context

Workspace context must not be implemented as a local nav-only label.

## Consequences
- workspace switching must refresh page data
- app-shell pages must consume shared workspace context
- future route-scoped workspace URLs remain possible, but are not required in V1
