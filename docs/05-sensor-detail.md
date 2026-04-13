# FRD-05: Sensor Detail & Management

**Feature:** Detailed view and management of individual sensors
**Version:** 1.0
**Last Updated:** 2026-04-13
**Status:** Draft
**Priority:** P0

---

## Overview

Tapping a sensor card on the Dashboard navigates to the Sensor Detail screen. This screen
shows the sensor's current status, linked caretakers, and recent alert history for that
specific sensor. It also allows renaming or removing the sensor.

## User Stories

- As a caretaker, I want to see the full details of a sensor including its health and
  recent activity
- As a caretaker, I want to see which other caretakers are also linked to this sensor
- As a caretaker, I want to see recent alerts from this specific sensor
- As a caretaker, I want to rename the sensor if I set it up wrong
- As a caretaker, I want to remove a sensor I no longer need

## Screen Layout

```
┌──────────────────────────────┐
│  ← Back    Mom's Bathroom    │
├──────────────────────────────┤
│                              │
│  Status: 🟢 Online           │
│  Last heartbeat: 30s ago     │
│  Paired: Jan 15, 2026        │
│  Sensor ID: SEN-ABC123       │
│                              │
├──────────────────────────────┤
│  Linked Caretakers (2)       │
│  ┌──────────────────────────┐│
│  │ 👤 Ananya  — 9876543210  ││
│  │ 👤 Rohan   — 9876543211  ││
│  └──────────────────────────┘│
│  [+ Invite Caretaker]        │  ← Share invite link/code
├──────────────────────────────┤
│  Recent Alerts               │
│  ┌──────────────────────────┐│
│  │ 🔴 Fall · Apr 10 · Real  ││
│  │ 🟡 Fall · Apr 8 · False  ││
│  │ 🔴 Fall · Apr 3 · Real   ││
│  └──────────────────────────┘│
│  [View All History →]        │
├──────────────────────────────┤
│  Sensor Actions              │
│  ┌──────────────────────────┐│
│  │ ✏️  Rename Sensor         ││
│  │ 🔔 Test Alert             ││  ← Triggers a mock fall alert
│  │ 🗑️  Remove Sensor         ││
│  └──────────────────────────┘│
└──────────────────────────────┘
```

## Functional Requirements

### FR-5.1: Sensor Info Section
- Display: sensor label, room name, status (online/offline), last heartbeat (relative time),
  paired date, sensor hardware ID
- Online/offline indicator matches dashboard

### FR-5.2: Linked Caretakers
- List all caretakers linked to this sensor
- Show name and phone number for each
- "Invite Caretaker" button (prototype: shows a share sheet or copy-to-clipboard with
  a mock invite code)

### FR-5.3: Recent Alerts
- Show the 5 most recent alerts for this specific sensor
- Each entry shows: outcome icon (red = real, yellow = false), date, outcome
- "View All History" link navigates to Alert History filtered to this sensor

### FR-5.4: Rename Sensor
- Opens an inline edit or modal to change the sensor label and room name
- Updates the store immediately

### FR-5.5: Test Alert
- Triggers a mock fall alert for this sensor
- Creates an alert in `active` state
- Useful for prototype testing and for real-world "is my notification working?" checks

### FR-5.6: Remove Sensor
- Confirmation dialog: "Remove [sensor label]? You will stop receiving alerts for this sensor."
- On confirm: removes sensor from store, navigates back to Dashboard
- Does not delete alert history for the removed sensor

## Technical Specifications

- Sensor data: `sensorStore.getSensorById(sensorId)`
- Alert data: `alertStore.getAlertsBySensorId(sensorId)`
- Share: `Share.share()` from React Native for invite flow
- Navigation: receives `sensorId` as route param

## Prototype Scope

### Include
- Full sensor info display
- Linked caretakers list (mock data)
- Recent alerts list
- Rename sensor functionality
- Test alert trigger
- Remove sensor with confirmation

### Exclude
- Real invite/share functionality (show mock code)
- Real multi-device caretaker syncing
- Sensor firmware updates

## Acceptance Criteria

- [ ] Sensor detail shows correct info from store
- [ ] Status indicator matches sensor online/offline state
- [ ] Linked caretakers are displayed
- [ ] Recent alerts show for this specific sensor
- [ ] Rename updates the sensor label in the store
- [ ] Test alert creates a new active alert
- [ ] Remove sensor shows confirmation and deletes from store

## Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-13 | Ivy & Caine | Initial sensor detail FRD |
