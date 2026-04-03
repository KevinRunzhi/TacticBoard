# Test Matrix

## 1. Purpose
This document lists the highest-value V1 test coverage combinations across:
- pages
- device classes
- workspace modes
- sharing modes

## 2. Device Classes

- Desktop
- Tablet
- Mobile

## 3. Workspace Modes

- Personal workspace
- Team workspace

## 4. Entry Modes

- Blank editor
- Existing project
- Template-seeded project
- Team/preset-seeded project
- Share viewer
- Guest flow

## 5. High-Priority Test Matrix

| Area | Scenario | Device | Workspace | Expected Result |
| --- | --- | --- | --- | --- |
| Workspace | switch personal -> team | Desktop | both | data changes, not just label |
| Projects | open specific project | Desktop | personal | correct project loads |
| Projects | open specific project | Tablet | team | correct project loads |
| Templates | use project template to create | Desktop | personal | new project seeded correctly |
| Templates | use formation template to create | Tablet | team | new project seeded correctly |
| Teams | open lineup preset in editor | Desktop | team | editor receives team + preset context |
| Editor | blank create | Desktop | personal | blank draft with visible pitch |
| Editor | formation apply | Desktop | personal | players auto-populate current step |
| Editor | pan/zoom controls | Tablet | any | pitch remains controllable |
| Editor | light edit | Mobile | any | limited but usable editing flow |
| Share | invalid link | Mobile | n/a | explicit invalid state |
| Share | fixed share copy | Desktop | personal | copied project contains fixed viewed content |
| Share | dynamic share copy | Desktop | personal | copied project contains current viewed content |
| Auth | guest save/share gate | Desktop | n/a | user is routed into auth flow |
| Auth | bind current guest draft | Mobile | n/a | only active draft binds |

## 6. Edge Case Matrix

| Area | Edge Case | Expected Result |
| --- | --- | --- |
| Editor | missing project id | invalid project state |
| Templates | invalid template seed | no unrelated fallback |
| Teams | selected team unavailable after workspace switch | selection resets safely |
| Share | copy not permitted | copy CTA hidden |
| Share | closed share link | explicit invalid/closed state |
| Versions | restore old version | pre-restore state preserved |

## 7. Recommended Manual Regression Set

Run before each important milestone:
1. create blank project
2. apply formation
3. save and reopen
4. create and open from template
5. create and open from team preset
6. generate fixed share and open it
7. generate dynamic share and open it
8. copy from share
9. switch workspace and verify all asset pages refresh
10. test tablet and mobile editor entry
