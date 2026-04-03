# ADR-002 - Editor Layout Strategy

## Status
Accepted

## Context
The editor must work across desktop, tablet, and mobile without becoming three separate products.

## Decision
V1 keeps one product logic with different layout strategies:
- desktop: full editing layout
- tablet: full logic with lighter panels/drawers
- mobile: light editing only

Pitch visibility is always the first layout priority.

## Consequences
- desktop may use fixed panels
- tablet/mobile must avoid hover-only critical controls
- small-screen adaptation reorganizes entry points instead of deleting capabilities
