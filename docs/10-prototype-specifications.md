# FRD-10: Prototype Specifications

**Feature:** Defines the exact scope and boundaries of the Phase 1 prototype
**Version:** 1.0
**Last Updated:** 2026-04-13
**Status:** Draft
**Priority:** P1

---

## Overview

This document defines what is and isn't included in the Phase 1 clickable prototype.
The prototype uses mock data and Zustand stores to simulate the full user experience
without a backend, database, or real hardware integration.

## Prototype Objective

Validate the UX/UI of Independent Home mode on real devices via Expo Go. Get stakeholder
feedback on the core flows before committing to backend architecture.

## What's IN the Prototype

### Screens

| # | Screen | FRD | Tab/Navigation |
|---|--------|-----|----------------|
| 1 | Mode Selection | FRD-02 | Auth stack |
| 2 | Phone Auth (OTP) | FRD-02 | Auth stack |
| 3 | Sensor Pairing | FRD-02 | Auth stack / Settings |
| 4 | Dashboard | FRD-03 | Bottom tab: Home |
| 5 | Active Alert | FRD-04 | Modal / Full screen |
| 6 | Sensor Detail | FRD-05 | Stack from Dashboard |
| 7 | Emergency Contacts | FRD-06 | Bottom tab: Contacts OR Settings drill-down |
| 8 | Alert History | FRD-07 | Bottom tab: History |
| 9 | Settings | FRD-08 | Bottom tab: Settings |

### Navigation Structure

```
Root Stack
├── Auth Stack (before login)
│   ├── ModeSelectionScreen
│   ├── PhoneAuthScreen
│   └── SensorPairingScreen
│
└── Main Tabs (after login)
    ├── Home Tab (Stack)
    │   ├── DashboardScreen
    │   └── SensorDetailScreen
    ├── History Tab
    │   └── AlertHistoryScreen
    ├── Contacts Tab
    │   └── EmergencyContactsScreen
    └── Settings Tab (Stack)
        ├── SettingsScreen
        └── SensorPairingScreen (add new sensor)

Active Alert → presented as modal over Main Tabs
```

### Mock Data

- 2 sensors (one online, one offline)
- 5 resolved alerts across both sensors (mix of real and false)
- 1 active alert (for testing the alert flow)
- 2 emergency contacts
- 1 authenticated user

### Simulated Features

- OTP: any 6-digit code accepted
- QR scanning: works with real camera, but any QR content becomes the sensor ID
- Sensor heartbeats: simulated with timers
- Alert triggers: via "Test Alert" button in Sensor Detail
- Escalation: visual-only timer (no actual SMS)
- Pull-to-refresh: simulated delay

## What's NOT in the Prototype

| Feature | Deferred To | Reason |
|---------|-------------|--------|
| Real OTP (Twilio/Firebase Auth) | Phase 2 | Requires backend |
| Push notifications (FCM) | Phase 2 | Requires backend + device tokens |
| SMS escalation (Twilio) | Phase 2 | Requires backend + Twilio account |
| Multi-device sync | Phase 2 | Requires backend + real-time |
| Facility mode | Phase 3 | Lower priority |
| Anomaly detection ML | Phase 3 | Research needed |
| Sensor firmware OTA | Never (separate repo) | Out of scope |

## Tech Stack for Prototype

| Layer | Technology |
|-------|------------|
| Framework | React Native (Expo SDK, latest) |
| Language | TypeScript |
| Navigation | React Navigation (native-stack + bottom-tabs) |
| State | Zustand + AsyncStorage persistence |
| Icons | lucide-react-native |
| Camera/QR | expo-camera |
| Phone dialer | React Native Linking |
| Date formatting | date-fns or dayjs |

## Design Guidelines

- Dark-mode-first design with premium feel
- Color palette: deep navy/charcoal background, vibrant red for alerts,
  green for online, amber for warnings
- Typography: clean sans-serif (system font or Inter)
- Cards with subtle shadows and rounded corners
- Micro-animations for state transitions (alert pulse, acknowledge feedback)
- Haptic feedback on critical actions (alert acknowledge)

## Development Approach

1. Set up Expo project with TypeScript
2. Define types in `src/types/`
3. Create mock data in `src/constants/mockData.ts`
4. Build Zustand stores in `src/store/`
5. Set up navigation in `src/navigation/`
6. Build screens in `src/screens/`
7. Create shared components in `src/components/`
8. Test on Expo Go

## Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-13 | Ivy & Caine | Initial prototype spec |
