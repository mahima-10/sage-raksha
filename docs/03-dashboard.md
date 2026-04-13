# FRD-03: Dashboard & Sensor Overview

**Feature:** Main screen showing sensor status and active alert awareness
**Version:** 1.0
**Last Updated:** 2026-04-13
**Status:** Draft
**Priority:** P0

---

## Overview

The Dashboard is the primary screen after login. It provides a quick overview of all paired
sensors' health status, an active alert banner when a fall is detected, and navigation
to sensor details and alert management.

## User Stories

- As a caretaker, I want to see all my sensors at a glance so I know everything is working
- As a caretaker, I want to immediately see if there's an active alert so I can respond
- As a caretaker, I want to see when each sensor last sent a heartbeat so I know if
  something is disconnected
- As a caretaker, I want to tap a sensor to see its details

## Screen Layout

```
┌──────────────────────────────┐
│  S.A.G.E Raksha          ⚙️  │  ← Header with settings gear
├──────────────────────────────┤
│ ┌──────────────────────────┐ │
│ │ 🚨 ACTIVE ALERT          │ │  ← Active alert banner (if any)
│ │ Fall detected in Mom's    │ │     Tapping navigates to alert screen
│ │ Bathroom — 2 min ago      │ │
│ │ TAP TO RESPOND  →        │ │
│ └──────────────────────────┘ │
├──────────────────────────────┤
│  Your Sensors (2)            │
│ ┌──────────────────────────┐ │
│ │ 🟢 Mom's Bathroom         │ │  ← Sensor card
│ │ Online · Last seen 30s ago│ │     Status indicator + heartbeat
│ │ 0 alerts today            │ │
│ └──────────────────────────┘ │
│ ┌──────────────────────────┐ │
│ │ 🔴 Hall Bathroom          │ │  ← Offline sensor (red indicator)
│ │ Offline · Last seen 2h ago│ │
│ │ 1 alert today             │ │
│ └──────────────────────────┘ │
│                              │
│  [+ Add Sensor]              │  ← Navigates to sensor pairing
└──────────────────────────────┘
```

## Functional Requirements

### FR-3.1: Active Alert Banner
- Displayed at the top of the dashboard when there's at least one `active` or
  `acknowledged` alert
- Shows: sensor label, time since triggered, current alert state
- Visual urgency: pulsing/glowing red background for `active`, amber for `acknowledged`
- Tapping the banner navigates to the Active Alert screen
- Hidden when no active alerts exist

### FR-3.2: Sensor List
- Displays all paired sensors as cards
- Each card shows:
  - Status indicator (green dot = online, red dot = offline)
  - Sensor label (user-defined name)
  - Status text ("Online" / "Offline")
  - Time since last heartbeat (relative, e.g., "30s ago", "2h ago")
  - Alert count for today
- Tapping a sensor card navigates to Sensor Detail screen
- Cards are sorted: offline sensors first (most urgent), then by label alphabetically

### FR-3.3: Add Sensor Button
- Prominent "Add Sensor" button at the bottom of the sensor list
- Navigates to the SensorPairingScreen (same as onboarding)

### FR-3.4: Empty State
- When no sensors are paired, show a friendly illustration/message
- Direct the user to add their first sensor

### FR-3.5: Pull-to-Refresh
- Pulling down refreshes sensor status data
- In prototype: simulates a refresh with a brief delay

## Technical Specifications

- Sensor data: sourced from Zustand `sensorStore`
- Alert data: sourced from Zustand `alertStore`
- Relative time: calculated from `lastHeartbeat` field
- Navigation: tapping sensor card → `SensorDetail` with `sensorId` param
- Navigation: tapping alert banner → `ActiveAlert` with `alertId` param

## Prototype Scope

### Include
- Sensor card list with status indicators
- Active alert banner with navigation
- Add sensor button
- Empty state
- Pull-to-refresh (simulated)

### Exclude
- Real-time WebSocket updates (use polling simulation)
- Push notification handling (Phase 2)
- Sensor battery level display

## Acceptance Criteria

- [ ] Dashboard shows all paired sensors with correct status
- [ ] Active alert banner appears when an alert is active
- [ ] Banner shows correct sensor label and relative time
- [ ] Tapping sensor card navigates to sensor detail
- [ ] Tapping alert banner navigates to alert screen
- [ ] Offline sensors are visually distinct from online sensors
- [ ] "Add Sensor" button navigates to pairing flow
- [ ] Empty state displays when no sensors are paired

## Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-13 | Ivy & Caine | Initial dashboard FRD |
