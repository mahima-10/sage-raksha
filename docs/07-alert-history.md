# FRD-07: Alert History

**Feature:** Monthly view of past alerts with filtering
**Version:** 1.0
**Last Updated:** 2026-04-13
**Status:** Draft
**Priority:** P0

---

## Overview

The Alert History screen shows all resolved alerts organized by month. Caretakers can
review past incidents, see outcomes (real fall vs false alarm), and filter by sensor.

## User Stories

- As a caretaker, I want to see past alerts organized by month so I can track patterns
- As a caretaker, I want to filter alerts by sensor to see which room has the most incidents
- As a caretaker, I want to see the details of past alerts including who responded and
  the outcome

## Screen Layout

```
┌──────────────────────────────┐
│  Alert History    [Filter ▼] │
├──────────────────────────────┤
│  ◀  April 2026  ▶           │  ← Month navigator
├──────────────────────────────┤
│  Summary                     │
│  Total: 5 · Real: 2 · False: 3│
├──────────────────────────────┤
│  Apr 10, 2:34 PM             │
│  🔴 Mom's Bathroom — Real Fall│
│  Ack by Ananya in 45s        │
│  Notes: "Mom slipped..."     │
├──────────────────────────────┤
│  Apr 8, 11:15 AM             │
│  🟡 Mom's Bathroom — False   │
│  Ack by Rohan in 2m          │
├──────────────────────────────┤
│  Apr 3, 9:00 PM              │
│  🔴 Hall Bathroom — Real Fall │
│  Ack by Ananya in 30s        │
│  Notes: "Found on floor..."  │
├──────────────────────────────┤
│  (more entries...)           │
└──────────────────────────────┘
```

## Functional Requirements

### FR-7.1: Monthly Navigation
- Left/right arrows to navigate between months
- Current month shown by default
- Show month and year label

### FR-7.2: Monthly Summary
- Total alerts, real falls, and false alarms for the displayed month
- Displayed as a summary bar at the top

### FR-7.3: Alert Entry Display
- Each resolved alert shows:
  - Date and time
  - Sensor label
  - Outcome (real fall / false alarm) with color indicator
  - Time to acknowledgment
  - Resolution notes (if any)
- Sorted newest first within each month

### FR-7.4: Sensor Filter
- Dropdown/picker to filter by a specific sensor
- "All Sensors" option to show everything
- Filter persists while navigating months

### FR-7.5: Empty State
- When no alerts for a month: "No alerts this month. That's good news! 🎉"

### FR-7.6: Navigation from Sensor Detail
- When navigated from Sensor Detail's "View All History", pre-filter by that sensor

## Technical Specifications

- Data: `alertStore.getResolvedAlerts()` filtered by month and sensor
- Date handling: group by `YYYY-MM` from `triggeredAt`
- Month navigation: maintained as local component state

## Prototype Scope

### Include
- Monthly navigation with summary stats
- Alert entry list with full details
- Sensor filter dropdown
- Empty state
- Pre-filtering when navigated from Sensor Detail

### Exclude
- Export to PDF/CSV
- Date range custom selection
- Analytics charts

## Acceptance Criteria

- [ ] Monthly navigation shows correct month/year
- [ ] Summary stats match the displayed alerts
- [ ] Alert entries show all required fields
- [ ] Sensor filter correctly filters the list
- [ ] Empty state shows for months with no alerts
- [ ] Pre-filtering from Sensor Detail works correctly

## Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-13 | Ivy & Caine | Initial alert history FRD |
