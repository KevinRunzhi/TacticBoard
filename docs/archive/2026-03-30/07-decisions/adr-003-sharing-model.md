# ADR-003 - Sharing Model

## Status
Accepted

## Context
The product needs to support both stable published views and ongoing dynamic review flows.

## Decision
V1 supports:
- fixed version share links
- dynamic project share links

Default share behavior is fixed version sharing.

Copy rules:
- fixed share copy copies the viewed fixed content
- dynamic share copy copies the current viewed project state
- copied projects do not inherit original share links

## Consequences
- share UI must clearly label link type
- invalid links must render explicit invalid state
- sharing and copying must remain traceable and predictable
