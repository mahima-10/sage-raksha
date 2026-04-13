# FRD-06: Emergency Contacts

**Feature:** Add and manage emergency contacts for SMS escalation
**Version:** 1.0
**Last Updated:** 2026-04-13
**Status:** Draft
**Priority:** P0

---

## Overview

Emergency contacts are the people who get SMS alerts if no caretaker acknowledges a fall
alert within the timeout window. This screen lets caretakers manage their list of emergency
contacts.

## User Stories

- As a caretaker, I want to add emergency contacts so they get notified if I can't respond
- As a caretaker, I want to edit or remove emergency contacts as circumstances change
- As a caretaker, I want to see all my emergency contacts in one place

## Screen Layout

```
┌──────────────────────────────┐
│  ← Back    Emergency Contacts│
├──────────────────────────────┤
│                              │
│  These contacts will receive │
│  an SMS if no caretaker      │
│  responds to a fall alert    │
│  within 5 minutes.           │
│                              │
│ ┌──────────────────────────┐ │
│ │ 👤 Mrs. Sharma            │ │
│ │ Neighbor · 9876543212     │ │
│ │               ✏️   🗑️     │ │
│ └──────────────────────────┘ │
│ ┌──────────────────────────┐ │
│ │ 👤 Rohan                  │ │
│ │ Sibling · 9876543213     │ │
│ │               ✏️   🗑️     │ │
│ └──────────────────────────┘ │
│                              │
│  [+ Add Contact]             │
└──────────────────────────────┘
```

## Functional Requirements

### FR-6.1: Contact List
- Display all emergency contacts
- Each card shows: name, relationship, phone number
- Edit and delete icons per contact

### FR-6.2: Add Contact
- Form fields: name (required), phone (required), relationship (required)
- Relationship options: Neighbor, Sibling, Child, Spouse, Doctor, Friend, Other
- Validates phone number format
- Saves to store

### FR-6.3: Edit Contact
- Opens same form pre-filled with existing data
- Saves changes to store

### FR-6.4: Delete Contact
- Confirmation dialog: "Remove [name]? They will no longer receive SMS escalations."
- On confirm: removes from store

### FR-6.5: Empty State
- When no contacts: "No emergency contacts yet. Add someone who can check on your
  loved one if you can't respond to an alert."

## Technical Specifications

- Data: Zustand `contactStore`
- Form: Modal or inline form
- Validation: 10-digit phone number, non-empty name

## Prototype Scope

### Include
- Full CRUD for emergency contacts
- Contact list display
- Empty state

### Exclude
- Phone number verification (accept any valid-format number)
- Contact import from phone's address book

## Acceptance Criteria

- [ ] Contact list displays all saved contacts
- [ ] Add contact form validates required fields
- [ ] Edit contact pre-fills and saves correctly
- [ ] Delete contact shows confirmation and removes from store
- [ ] Empty state displays when no contacts exist

## Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-13 | Ivy & Caine | Initial emergency contacts FRD |
