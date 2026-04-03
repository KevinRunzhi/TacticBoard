# FRD - Settings Page

## 1. Page Identity

- Page name: Settings
- Route: `/settings`
- Shell type: App shell

## 2. Purpose

The settings page is the account-level and app-level configuration surface.

It is responsible for:

- personal profile settings
- login and security settings
- workspace and creation preferences
- account-level destructive actions

It is not responsible for project, template, or team asset management.

## 3. Core Modules

### 3.1 Section Navigation

The page should expose these sections:

- profile
- security
- preferences
- account actions

### 3.2 Profile Section

- avatar
- display name
- profile description
- team label or related profile information

### 3.3 Security Section

- email login information
- password management
- WeChat binding status
- optional two-step verification switch

### 3.4 Preferences Section

- default workspace
- default landing page
- default creation preferences

### 3.5 Account Actions Section

- logout
- account deletion

## 4. Core Behaviors

### 4.1 Profile Save

- Editing profile fields should support explicit save.
- Save success should show clear feedback.

### 4.2 Workspace Preference

- Changing default workspace affects future app entry and default creation behavior.
- It must not silently reassign existing assets.

### 4.3 Logout

- Logout must require confirmation.
- Logout is an account action, not a project action.

### 4.4 Account Deletion

- Account deletion must require explicit confirmation.
- The destructive nature must be clearly stated.
- Product-level preconditions already defined in PRD still apply.

## 5. Structural Rules

- Settings must not contain project, template, or team asset lists.
- Team invite code generation and team profile management must stay outside settings.
- High-risk actions must be visually separated from normal preferences.

## 6. Required States

### 6.1 Normal State

- settings section navigation visible
- current section content visible

### 6.2 Save Feedback State

- profile saved
- preference updated

### 6.3 Confirmation States

- logout confirmation
- delete account confirmation

## 7. Device Rules

### 7.1 Desktop

- left-side navigation plus content pane

### 7.2 Tablet

- side navigation may compress but should remain readable

### 7.3 Mobile

- section navigation becomes tabs or collapsible navigation
- content becomes a single-column flow

## 8. Not in V1

- advanced security center
- billing / subscription management
- device session management
