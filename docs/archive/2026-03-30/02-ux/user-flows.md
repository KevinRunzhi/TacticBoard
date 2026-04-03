# User Flows

## 1. Purpose
This document summarizes the highest-value user flows for V1.

It complements the IA and FRDs by focusing on end-to-end user intent rather than page internals.

## 2. Guest Trial Flow

1. user lands in product
2. user starts a guest editing session
3. user creates a draft in editor
4. draft is persisted locally until account binding
5. user triggers an account-gated action
6. user enters auth flow
7. active guest draft binds to current logged-in account

## 3. Blank Create Flow

1. user opens workspace/dashboard
2. user clicks new tactics board
3. blank editor opens
4. user intentionally selects a formation
5. the selected formation populates players on the current step
6. user edits content
7. user saves project

## 4. Template Create Flow

1. user opens templates page
2. user browses or filters templates
3. user previews chosen template
4. user clicks use template
5. editor opens seeded from template snapshot
6. user edits and saves as a normal project

## 5. Team Preset Flow

1. user opens teams page
2. user selects a team
3. user opens a lineup preset, or manually chooses a preset from the selected team context
4. editor opens seeded with team and preset context
5. user adjusts tactics
6. user saves or shares result

## 6. Share Viewing Flow

1. user opens share link
2. system validates the share
3. user views content in read-only viewer
4. user plays through steps or zooms/pans
5. if copy is permitted, user creates a new editable copy
6. the new copy opens as a normal editable project and does not inherit the original share link

## 7. Workspace Switch Flow

1. user switches from personal to team workspace or back
2. app updates active workspace context
3. dashboard, projects, templates, and teams re-scope data
4. invalid selections reset safely if asset no longer exists in new scope
