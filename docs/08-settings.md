# FRD-08: Settings

**Feature:** Account management and app configuration
**Version:** 1.0
**Last Updated:** 2026-04-13
**Status:** Draft
**Priority:** P0

---

## Overview

The Settings screen provides access to account information, notification preferences, and
app management. Accessible from the Dashboard header or bottom tab.

## User Stories

- As a caretaker, I want to see and edit my account info
- As a caretaker, I want to configure notification preferences
- As a caretaker, I want to log out of the app
- As a caretaker, I want to access emergency contacts management

## Screen Layout

```
┌──────────────────────────────┐
│  Settings                    │
├──────────────────────────────┤
│  Account                     │
│  ┌──────────────────────────┐│
│  │ 👤 Ananya                ││
│  │ 9876543210                ││
│  └──────────────────────────┘│
├──────────────────────────────┤
│  Sensors                     │
│  ┌──────────────────────────┐│
│  │ 📱 Manage Sensors    →   ││
│  │ 🔗 Pair New Sensor   →   ││
│  └──────────────────────────┘│
├──────────────────────────────┤
│  Alerts                      │
│  ┌──────────────────────────┐│
│  │ 📞 Emergency Contacts →  ││
│  │ ⏱️  Escalation Timeout →  ││  ← Configure minutes before SMS
│  └──────────────────────────┘│
├──────────────────────────────┤
│  App                         │
│  ┌──────────────────────────┐│
│  │ 📄 About S.A.G.E Raksha  ││
│  │ 🔓 Privacy Policy        ││
│  │ 📜 Terms of Use          ││
│  └──────────────────────────┘│
├──────────────────────────────┤
│  ┌──────────────────────────┐│
│  │ 🚪 Log Out               ││  ← Red, with confirmation
│  └──────────────────────────┘│
│                              │
│  v1.0.0 — Prototype         │
└──────────────────────────────┘
```

## Functional Requirements

### FR-8.1: Account Section
- Display user name and phone number
- Allow editing user name (inline or modal)

### FR-8.2: Sensor Management
- "Manage Sensors" → navigates to a list of paired sensors (can rename/remove)
- "Pair New Sensor" → navigates to SensorPairingScreen

### FR-8.3: Alert Configuration
- "Emergency Contacts" → navigates to Emergency Contacts screen (FRD-06)
- "Escalation Timeout" → opens a picker/modal to set the number of minutes before
  SMS escalation (default: 5 minutes, options: 2, 3, 5, 10, 15)

### FR-8.4: App Info
- "About" → modal or screen with app name, version, and brief description
- "Privacy Policy" → scrollable modal with privacy text
- "Terms of Use" → scrollable modal with terms text

### FR-8.5: Log Out
- Confirmation dialog: "Log out of S.A.G.E Raksha?"
- On confirm: clears auth state, navigates to ModeSelectionScreen
- Does NOT clear sensor/alert data (that stays for re-login)

## Technical Specifications

- Auth: `authStore.logout()`
- Escalation timeout: `settingsStore.escalationTimeoutMinutes`
- Navigation: native stack for drill-down screens

## Prototype Scope

### Include
- Account display and name editing
- Sensor management navigation
- Emergency contacts navigation
- Escalation timeout configuration
- About, Privacy, Terms modals
- Log out with confirmation

### Exclude
- Real notification permission management
- Account deletion
- Data export

## Acceptance Criteria

- [ ] Account info displays correctly
- [ ] User name can be edited
- [ ] Sensor management links navigate correctly
- [ ] Emergency contacts link navigates to FRD-06 screen
- [ ] Escalation timeout can be configured
- [ ] About/Privacy/Terms modals display content
- [ ] Log out clears auth and navigates to mode selection

## Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-13 | Ivy & Caine | Initial settings FRD |
