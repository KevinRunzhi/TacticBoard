# State Management

## 1. Purpose
This document defines how frontend state should be partitioned in V1.

The goal is to reduce bugs caused by:
- duplicated state
- state living in the wrong layer
- stale UI after workspace or route changes
- editor state leaking into asset pages

This document is the canonical state ownership reference for V1 frontend implementation.

Related architecture summaries in other engineering docs should point back here rather than redefine ownership independently.

## 2. State Categories

### 2.1 Route state
Examples:
- current route
- route params
- route-level entry source

Owner:
- routing layer

### 2.2 Workspace context state
Examples:
- active workspace type
- active workspace id

Owner:
- app-level shared state

### 2.3 Asset collection state
Examples:
- project list
- template list
- team list
- current share metadata

Owner:
- domain repositories / page loaders

### 2.4 Editor working state
Examples:
- active project content
- steps
- object graph
- selection
- history
- seed state already applied

Owner:
- editor runtime store/hooks

### 2.5 Transient UI state
Examples:
- modal open/close
- toast visibility
- dropdown visibility
- active tab

Owner:
- nearest responsible page/feature component

## 3. Ownership Rules

### 3.1 Single owner rule
Every state value should have one clear owner.

### 3.2 Derived state rule
Derived values should be recomputed from source state instead of being duplicated.

### 3.3 Route truth rule
Route params and active page identity should not be shadowed by unrelated local state.

### 3.4 Workspace truth rule
Workspace context must not live only in the nav bar.

## 4. Editor State Rules

### 4.1 Seed application
Template/team/preset seed context should be applied once when the editor initializes a new working project.

If a seed reference is unavailable, the editor must render an explicit invalid-seed state and must not silently fall back to a blank draft.

### 4.2 Persistence boundary
Project content belongs to persistent domain/project state.
Temporary open panel or hover state does not.

### 4.3 Undo/redo boundary
Undo/redo tracks content-changing actions in the current project runtime.
Pure viewing state should not pollute the history stack.

## 5. Asset Page State Rules

### 5.1 Lists must reflect current workspace
Projects, templates, and teams must react to workspace changes.

### 5.2 Lists must reflect current saved local state where product requires
If local drafts or recently saved projects exist, the relevant asset pages must not remain permanently frozen on seed data.

### 5.3 Status state is page-owned
Loading, empty, no-result, and error states belong to page containers, not low-level UI primitives.

## 6. Share State Rules

### 6.1 Viewer state is read-only
Viewer state must not directly mutate the source editor state.

### 6.2 Copy action creates new working state
Copy from share produces a new project/runtime state in the destination scope.

### 6.3 Invalid link state is explicit
Viewer state must not fallback to an unrelated share item.

## 7. Tablet and Mobile State Rules

### 7.1 Responsive UI state must not drop functionality
Changing layout for tablet/mobile should reorganize access, not delete stateful capabilities silently.

### 7.2 Touch-critical controls must not depend on hover state
If state becomes unreachable on touch devices, it is an architecture problem, not only a styling issue.

## 8. Implementation Guidance

Recommended split:
- global app context for workspace and auth session
- page loaders/repositories for collections
- isolated editor state hook/store for project editing runtime
- local component state for ephemeral UI controls

Avoid:
- using component-local state for product-wide workspace context
- storing persistent asset truth only inside visual card components
- sharing mutable editor state object between editor and share viewer

## 9. Related Documents

- [frontend-architecture.md](./frontend-architecture.md)
- [routing-and-shells.md](./routing-and-shells.md)
- [../04-domain/domain-model.md](../04-domain/domain-model.md)
