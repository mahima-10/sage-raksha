# S.A.G.E Raksha — Smart Alert Guard for Elderly

## Project Overview

A fall detection and alert management system for elderly people. Ceiling-mounted mmWave radar
sensors detect falls automatically; caretakers are alerted on their mobile devices and
coordinate response through this app.

## Core Vision

Detect falls automatically — no panic button needed. Alert the right people instantly.
Save lives by cutting response time from minutes to seconds.

## Key Objectives

- **Safety**: Every fall is detected, alerted, and logged with full audit trail
- **Speed**: Caretakers receive push notifications within seconds of a fall
- **Redundancy**: Push notification → SMS escalation → manual emergency call as fallback chain
- **Accountability**: Every alert outcome (real fall / false alarm) is recorded

## Target Users

### Independent Home Mode (building first)

1. **Caretaker** (Ananya, Rohan) — Family member who sets up the sensor at their elderly
   parent's home. Receives fall alerts, acknowledges them, monitors sensor health remotely.
2. **Emergency Contact** (Neighbor, sibling) — Gets SMS if primary caretakers don't respond
   in time.

### Facility Mode (building later)

3. **Caretaker** (Priya, Rahul) — Staff at old-age home. Responds to fall alerts, files reports.
4. **Manager** (Dr. Meera) — Oversees all rooms, manages caretakers, views facility dashboard.

## Technology Stack

### Mobile App

- Runtime: React Native (Expo)
- Language: TypeScript
- Navigation: React Navigation (native stack + bottom tabs)
- State (Prototype): Zustand with AsyncStorage persistence
- State (Production): React Query
- Icons: lucide-react-native
- Notifications: expo-notifications

### Backend (Phase 2)

- Runtime: Python 3.11+
- Framework: FastAPI
- Database: PostgreSQL
- ORM: SQLAlchemy + Alembic
- Auth: Phone OTP (JWT access + refresh tokens)
- Push Notifications: Firebase Cloud Messaging (firebase-admin SDK)
- SMS: Twilio

### Hardware (separate repo)

- Microcontroller: ESP32
- Sensors: DFRobot C1001 + HiLink LD2410 (dual mmWave radar fusion)
- Fall detection runs on-device (edge processing)
- ESP32 POSTs fall events directly to FastAPI backend via HTTP

## Architecture

```
[ESP32 Sensor] --HTTP POST--> [FastAPI Backend] --FCM--> [Mobile App]
                                     |                        |
                                     v                        v
                               [PostgreSQL]          [Push Notification]
                                     |
                                     v
                               [Twilio SMS]
```

## Project Structure

```
sage-raksha-newv1/
├── GEMINI.md              # Project vision & tech stack
├── docs/                  # Feature Requirements (FRDs)
│   ├── GEMINI.md
│   ├── 00-INDEX.md
│   ├── 01 through 08      (P0 feature FRDs)
│   ├── 09-api-specification.md
│   └── 10-prototype-specifications.md
├── prototype/             # Phase 1 (Expo app, mock data)
│   ├── GEMINI.md
│   ├── App.tsx
│   ├── app.json
│   └── src/
│       ├── components/
│       ├── screens/
│       ├── navigation/
│       ├── store/
│       ├── hooks/
│       ├── constants/
│       ├── types/
│       └── utils/
├── backend/               # Phase 2 (FastAPI + PostgreSQL)
└── mobile/                # Phase 2 (Expo app + real API)
```

## Development Phases

### Phase 1: Clickable Prototype (current)
- React Native (Expo) with mock data
- Independent Home mode only
- Validate UX/UI on real devices via Expo Go
- No backend, no database

### Phase 2: Production Backend
- Real database (PostgreSQL)
- FastAPI backend with APIs
- Authentication (phone OTP)
- Connect mobile app to real backend

### Phase 3: Enhancements
- Facility mode
- SMS alerts (Twilio)
- Behavior-based anomaly detection

## Notes

- Author: Ivy
- Version: 1.0
- Date: 2026-04-13
