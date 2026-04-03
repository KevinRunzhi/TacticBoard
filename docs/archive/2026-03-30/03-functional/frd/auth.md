# FRD - Auth Entry Flows

## 1. Page Identity

- Page group: Auth entry flows
- Routes:
  - `/login`
  - `/register`
  - `/bind-account`
- Shell type: Auth shell

## 2. Scope

This document covers the V1 authentication entry surfaces:

- login page
- register page
- bind-account page
- guest-triggered auth prompts

## 3. Purpose

These flows exist to:

- convert guest users into account users
- support email and WeChat login entry
- bind current work to the currently logged-in account
- preserve product continuity between guest editing and saved asset management

## 4. Core Entry Scenarios

### 4.1 Direct Login

- user intentionally opens login page
- user logs in and enters the app

### 4.2 Direct Registration

- user intentionally opens register page
- user creates an account and enters the app

### 4.3 Guest Upgrade Flow

- user is editing as guest
- user triggers an account-gated action
- system routes to login or registration
- current draft binds to the current logged-in account

### 4.4 Share-to-Copy Flow

- user opens share page
- user clicks copy
- if not logged in, the system routes into auth flow first
- after login, copy continues into a new project

### 4.5 Bind Account Flow

- user needs to bind current work to the current logged-in account context
- the flow must be explicit and confirm target account identity

## 5. Supported Login Methods in V1

- email
- WeChat

The two methods remain separate account systems as defined in product rules.

## 6. Core Behaviors

### 6.1 Guest Draft Binding

- guest content binds only to the currently logged-in account
- binding does not auto-import all local guest drafts
- after successful binding, the bound guest draft is removed from local guest-only storage
- one-time undo window follows the already defined product rule

### 6.2 Login Gating

Auth-gated actions include:

- cloud save
- share generation
- copy-from-share when login is required
- account-bound workspace actions

The system must not fail silently when guest users trigger these actions.

### 6.3 Account Identity Clarity

- Because email and WeChat are separate accounts in V1, the auth UI must make current account identity clear.
- Binding and login flows must avoid ambiguous "merged account" wording.

## 7. Required States

### 7.1 Normal States

- login form
- register form
- bind-account flow

### 7.2 Validation States

- invalid email input
- missing required fields
- invalid verification flow inputs

### 7.3 Transition States

- auth success
- bind success
- login required before continuing

### 7.4 Error States

- failed login
- failed registration
- failed binding

## 8. Device Rules

### 8.1 Desktop

- centered auth surface with clear brand continuity

### 8.2 Mobile

- single-column auth layout
- primary CTA visible without excessive scrolling

## 9. Structural Rules

- Auth pages must not inherit app-shell navigation.
- They should visually belong to the same product, but remain separate from project management surfaces.
- Bind-account is a process page, not a general settings page replacement.

## 10. Not in V1

- merged account identity across email and WeChat
- enterprise SSO
- advanced device/session management
