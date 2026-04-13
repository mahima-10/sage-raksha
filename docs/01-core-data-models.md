# FRD-01: Core Data Models

**Feature:** TypeScript interfaces for all domain entities
**Version:** 1.1
**Last Updated:** 2026-04-13
**Status:** Draft
**Priority:** P0

---

## Overview

Defines the core data types shared across the app. These models represent homes, sensors,
alerts, users, and contacts. Home is the central entity — sensors and emergency contacts
belong to a Home, and users link to Homes (not directly to sensors). In the prototype,
these are used with mock data and Zustand stores. In production, they map to database
tables and API responses.

## Data Models

### User (Caretaker)

```typescript
type AppMode = 'independent' | 'facility';

interface User {
  id: string;
  name: string;
  phone: string;               // Phone number used for OTP login
  mode: AppMode;               // Which mode the user selected at onboarding
  linkedHomeIds: string[];     // Homes this user monitors
  createdAt: string;           // ISO 8601
}
```

### Home

```typescript
interface Home {
  id: string;
  name: string;                // e.g. "Mom's House", "Dad's Apartment"
  address?: string;            // Optional street address
  createdBy: string;           // User ID of the caretaker who created this home
  createdAt: string;           // ISO 8601
}
```

### Sensor

```typescript
type SensorStatus = 'online' | 'offline';

interface Sensor {
  id: string;                   // Unique hardware ID (from QR code)
  homeId: string;               // Which home this sensor belongs to
  label: string;                // User-defined name, e.g. "Mom's Bathroom"
  status: SensorStatus;
  lastHeartbeat: string;        // ISO 8601 timestamp of last heartbeat
  pairedAt: string;             // ISO 8601 timestamp when sensor was paired
}
```

### Alert

```typescript
type AlertState = 'active' | 'escalated' | 'acknowledged' | 'resolved';
type AlertOutcome = 'real_fall' | 'false_alarm';

interface Alert {
  id: string;
  sensorId: string;             // Which sensor triggered this alert
  state: AlertState;
  outcome?: AlertOutcome;       // Set when resolved
  triggeredAt: string;          // ISO 8601
  acknowledgedAt?: string;      // ISO 8601, set when a caretaker acknowledges
  acknowledgedBy?: string;      // User ID of acknowledging caretaker
  resolvedAt?: string;          // ISO 8601, set when resolved
  resolvedBy?: string;          // User ID of resolving caretaker
  escalatedAt?: string;         // ISO 8601, set when SMS escalation fires
  notes?: string;               // Optional resolution notes
}
```

### EmergencyContact

```typescript
interface EmergencyContact {
  id: string;
  homeId: string;               // Which home this contact is for
  name: string;
  phone: string;
  relationship: string;         // e.g. "Neighbor", "Sibling", "Doctor"
}
```

### SensorHeartbeat (for status tracking)

```typescript
interface SensorHeartbeat {
  sensorId: string;
  timestamp: string;            // ISO 8601
  signalStrength?: number;      // RSSI or similar metric
}
```

## Relationships

```
Home (central entity)
  └── created by one User
  └── has many Sensors
  └── has many EmergencyContacts
  └── monitored by many Users (via User.linkedHomeIds)

User (Caretaker)
  └── links to many Homes (via linkedHomeIds)
  └── acknowledges/resolves Alerts

Sensor
  └── belongs to one Home
  └── triggers many Alerts
  └── emits many SensorHeartbeats

Alert
  └── belongs to one Sensor
  └── acknowledged by one User (optional)
  └── resolved by one User (optional)

EmergencyContact
  └── belongs to one Home
```

## Prototype Scope

### Include
- All interfaces defined above
- Mock data generator functions for each type
- Zustand stores using these interfaces

### Exclude
- Database schemas (Phase 2)
- API request/response DTOs (Phase 2)
- Validation schemas (Phase 2)

## Acceptance Criteria

- [ ] All interfaces are defined in `src/types/`
- [ ] Mock data covers at least 1 home, 2 sensors, 5 alerts, 2 emergency contacts
- [ ] Zustand stores accept and return these types

## Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-13 | Ivy & Caine | Initial data models |
| 1.1 | 2026-04-13 | Ivy & Caine | Add Home model as central entity; User links to Homes not Sensors; add mode to User; add homeId to Sensor and EmergencyContact; remove roomName from Sensor; remove batteryLevel from SensorHeartbeat; add escalated to AlertState |
