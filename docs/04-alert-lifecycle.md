# FRD-04: Alert Lifecycle

**Feature:** End-to-end alert flow from detection to resolution
**Version:** 1.1
**Last Updated:** 2026-04-13
**Status:** Draft
**Priority:** P0

---

## Overview

When the ESP32 sensor detects a fall, it posts an event to the backend, which sends push
notifications to all linked caretakers. The app displays an active alert screen where
caretakers can acknowledge the alert, call emergency services, and mark the final outcome.

## User Stories

- As a caretaker, I want to see a prominent alert when a fall is detected so I can
  respond immediately
- As a caretaker, I want to acknowledge the alert ("I'm on my way") so other caretakers
  know I'm handling it
- As a caretaker, I want to see if another caretaker has already acknowledged the alert
  so I don't duplicate the response
- As a caretaker, I want a "Call Emergency Services" button during active alerts
- As a caretaker, I want to mark the alert as "real fall" or "false alarm" when I'm done
- As a caretaker, I want to add notes when resolving an alert

## Alert State Machine

```
              ┌─────────┐
              │  active  │ ← Created when fall is detected
              └────┬─────┘
                   │
         ┌─────────┼──────────────────┐
         │         │                  │
         │ (ack)   │ (timeout)        │ (quick dismiss)
         ▼         ▼                  ▼
  ┌──────────┐  ┌───────────┐   ┌──────────┐
  │ acknowledged│  │ escalated │   │ resolved │
  └──────┬───┘  └─────┬─────┘   │(false_alarm)│
         │            │          └──────────┘
         │    ┌───────┘
         │    │ (caretaker acks after escalation)
         │    ▼
         │  ┌──────────────┐
         │  │ acknowledged │
         │  └──────┬───────┘
         │         │
         └────┬────┘
              │ caretaker marks outcome
              ▼
        ┌──────────┐
        │ resolved │ ← Outcome: real_fall | false_alarm
        └──────────┘

Transitions:
  active → acknowledged      Caretaker taps "I'm on my way"
  active → escalated          No ack within X minutes, SMS sent
  active → resolved           Quick dismiss as false alarm
  escalated → acknowledged    Caretaker acks after escalation
  acknowledged → resolved     Caretaker marks outcome
```

## Screen Layout: Active Alert

```
┌──────────────────────────────┐
│           🚨 ALERT           │  ← Full-screen urgency
│                              │
│     Fall Detected            │
│     Mom's Bathroom           │
│     2 minutes ago            │
│                              │
│  ┌────────────────────────┐  │
│  │   I'M ON MY WAY        │  │  ← Primary action (state: active)
│  └────────────────────────┘  │
│                              │
│  ┌────────────────────────┐  │
│  │  📞 Call Emergency      │  │  ← Opens phone dialer
│  │     Services            │  │
│  └────────────────────────┘  │
│                              │
│  Linked caretakers:          │
│  • Ananya — not yet responded│
│  • Rohan — not yet responded │
│                              │
│  ┌────────────────────────┐  │
│  │  ✕ Dismiss False Alarm  │  │  ← Quick dismiss (no ack needed)
│  └────────────────────────┘  │
│                              │
└──────────────────────────────┘
```

## Screen Layout: Acknowledged Alert

```
┌──────────────────────────────┐
│          ✅ RESPONDING        │
│                              │
│     Fall Detected            │
│     Mom's Bathroom           │
│     5 minutes ago            │
│                              │
│  Acknowledged by Ananya      │
│  3 minutes ago               │
│                              │
│  ┌────────────────────────┐  │
│  │  Mark as Real Fall      │  │
│  └────────────────────────┘  │
│  ┌────────────────────────┐  │
│  │  Mark as False Alarm    │  │
│  └────────────────────────┘  │
│                              │
│  Notes (optional):           │
│  ┌────────────────────────┐  │
│  │                         │  │
│  └────────────────────────┘  │
│                              │
│  ┌────────────────────────┐  │
│  │  📞 Call Emergency      │  │
│  │     Services            │  │
│  └────────────────────────┘  │
└──────────────────────────────┘
```

## Functional Requirements

### FR-4.1: Alert Creation
- Triggered when a fall event is received (mock: button in prototype)
- Creates an Alert with state `active` and `triggeredAt` timestamp
- All linked caretakers see the alert

### FR-4.2: Alert Acknowledgment
- Caretaker taps "I'm on my way"
- Alert state changes to `acknowledged`
- `acknowledgedAt` and `acknowledgedBy` are recorded
- Other caretakers see who acknowledged and when
- Only one caretaker can acknowledge (first-come-first-served)

### FR-4.3: Alert Resolution
- Caretaker chooses "Real Fall" or "False Alarm"
- Optional notes field
- Alert state changes to `resolved`
- `resolvedAt`, `resolvedBy`, and `outcome` are recorded
- Alert moves to history

### FR-4.3a: Quick Dismiss (False Alarm)
- From `active` state, caretaker can directly mark as false alarm without acknowledging
- Skips the "I'm on my way" step for obvious false alarms
- Alert transitions directly: active → resolved (outcome: false_alarm)
- `resolvedAt`, `resolvedBy`, `outcome` are set; `acknowledgedAt`/`acknowledgedBy` remain unset

### FR-4.4: Emergency Call
- "Call Emergency Services" button is always visible during active/acknowledged alerts
- Tapping opens the phone dialer with a configurable emergency number
- No auto-dialing — the user must confirm the call

### FR-4.5: Escalation (Prototype Simulation)
- If alert remains `active` for X minutes (configurable, default 5), escalation fires
- Alert state transitions from `active` to `escalated`
- `escalatedAt` timestamp is recorded
- In prototype: a visual indicator shows "SMS would be sent to emergency contacts"
- Lists which emergency contacts would receive the SMS
- An escalated alert can still be acknowledged (escalated → acknowledged)
- In production: actual Twilio SMS dispatch

### FR-4.6: Multi-Caretaker Visibility
- When multiple caretakers are linked to a sensor, all see the same alert state
- The list shows each caretaker's response status
- In prototype: simulated with mock data (only one user actually interacts)

## Technical Specifications

- Alert state: Zustand `alertStore`
- Navigation: full-screen modal or dedicated stack screen
- Phone dialer: `Linking.openURL('tel:...')`
- Escalation timer: `setTimeout` in prototype

## Prototype Scope

### Include
- Active alert screen with acknowledge button
- Acknowledged state with resolution options
- Emergency call button (opens dialer)
- Resolution with outcome selection and notes
- Escalation simulation (visual indicator, no actual SMS)
- Mock "trigger alert" button for testing

### Exclude
- Real push notifications (use in-app simulation)
- Real SMS dispatch (show "would send" preview)
- Multi-device sync (prototype is single-device)

## Acceptance Criteria

- [ ] Active alert screen displays with sensor info and time
- [ ] "I'm on my way" transitions alert to acknowledged state
- [ ] Quick dismiss transitions active alert directly to resolved (false_alarm)
- [ ] Acknowledged screen shows who acknowledged and when
- [ ] "Real Fall" and "False Alarm" buttons resolve the alert
- [ ] Notes can be added during resolution
- [ ] Emergency call button opens phone dialer
- [ ] Escalation transitions alert to escalated state after timeout
- [ ] Escalated alert can still be acknowledged
- [ ] Resolved alerts disappear from active view

## Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-13 | Ivy & Caine | Initial alert lifecycle FRD |
| 1.1 | 2026-04-13 | Ivy & Caine | Add escalated state; add quick dismiss path (active→resolved) |
