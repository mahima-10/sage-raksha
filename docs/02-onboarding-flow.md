# FRD-02: Onboarding Flow

**Feature:** First-time user experience from app launch to sensor pairing
**Version:** 1.0
**Last Updated:** 2026-04-13
**Status:** Draft
**Priority:** P0

---

## Overview

When a user opens S.A.G.E Raksha for the first time, they choose their mode
(Independent Home or Facility), authenticate via phone OTP, and pair their first sensor
by scanning a QR code on the physical device.

## User Stories

- As a new caretaker, I want to choose "Independent Home" mode so the app is tailored to
  my use case
- As a caretaker, I want to log in with my phone number so I don't need to remember a
  password
- As a caretaker, I want to scan the QR code on the sensor to pair it without manual entry
- As a caretaker, I want to name my sensor (e.g., "Mom's Bathroom") so I can identify
  which room triggered an alert

## Screen Flow

```
App Launch
  └── ModeSelectionScreen (if first launch)
        ├── "Independent Home" → PhoneAuthScreen
        └── "Facility" → ComingSoonScreen (disabled in prototype)
              
PhoneAuthScreen
  └── Enter phone number
  └── Enter OTP (mock: any 6-digit code)
  └── Success → SensorPairingScreen (if no sensors) / Dashboard (if sensors exist)

SensorPairingScreen
  └── "Scan QR Code" button → Camera with QR overlay
  └── QR scanned → sensor ID captured
  └── "Enter Manually" link → text input for sensor ID
  └── Name the sensor (text input, e.g., "Mom's Bathroom")
  └── Room name (text input, e.g., "Master Bathroom")
  └── "Pair Sensor" → Success → Dashboard
```

## Functional Requirements

### FR-2.1: Mode Selection
- Full-screen choice between "Independent Home" and "Facility"
- "Facility" shows a "Coming Soon" badge and is not tappable in the prototype
- Selection is persisted (user doesn't see this again on re-launch)

### FR-2.2: Phone OTP Authentication
- User enters a 10-digit phone number
- Mock OTP: any 6-digit code is accepted in the prototype
- On success, a mock JWT token is stored
- Session persists across app restarts (AsyncStorage)

### FR-2.3: Sensor Pairing via QR
- Camera opens with a scanning frame overlay
- QR code contains the sensor hardware ID
- On scan, sensor ID auto-populates
- Manual entry fallback available
- User provides:
  - Sensor label (required, e.g., "Mom's Bathroom")
  - Room name (required, e.g., "Master Bathroom")
- On save: sensor is added to the store and user is navigated to the Dashboard

### FR-2.4: Re-launch Behavior
- If user is authenticated and has sensors → go directly to Dashboard
- If user is authenticated but no sensors → go to SensorPairingScreen
- If user is not authenticated → go to ModeSelectionScreen

## Technical Specifications

- QR scanning: `expo-camera` barcode scanning capability
- Auth state: Zustand store persisted to AsyncStorage
- Navigation: React Navigation native stack

## Prototype Scope

### Include
- Mode selection screen (Independent Home selectable, Facility disabled)
- Phone number input and mock OTP verification
- QR code scanning for sensor pairing
- Manual sensor ID entry
- Sensor naming and room naming
- Post-auth routing logic

### Exclude
- Real OTP verification (use mock)
- Real JWT token generation
- Facility mode flow
- Multiple sensor pairing in onboarding (user can add more from Dashboard)

## UI/UX Notes

- Mode selection should feel welcoming and premium — this is the first impression
- OTP screen should be clean and minimal (large phone number input, auto-focus)
- QR scanner should have a clear scan frame, torch toggle, and close button
- Success states should use brief, celebratory feedback (checkmark animation)

## Acceptance Criteria

- [ ] Mode selection screen renders with two clear options
- [ ] Facility mode is visually disabled with "Coming Soon" badge
- [ ] Phone number input accepts 10-digit numbers
- [ ] Mock OTP accepts any 6-digit code
- [ ] QR scanner opens camera with overlay frame
- [ ] Scanned QR ID populates the sensor ID field
- [ ] Manual sensor ID entry works as fallback
- [ ] Sensor is saved with label, room name, and hardware ID
- [ ] User reaches Dashboard after successful pairing
- [ ] Re-launch routes correctly based on auth/sensor state

## Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-13 | Ivy & Caine | Initial onboarding FRD |
