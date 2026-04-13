# FRD-01: Core Data Models

**Feature:** TypeScript interfaces for all domain entities
**Version:** 1.0
**Last Updated:** 2026-04-13
**Status:** Draft
**Priority:** P0

---

## Overview

Defines the core data types shared across the app. These models represent sensors, alerts,
users, and contacts. In the prototype, these are used with mock data and Zustand stores.
In production, they map to database tables and API responses.

## Data Models

### User (Caretaker)

```typescript
interface User {
  id: string;
  name: string;
  phone: string;               // Phone number used for OTP login
  createdAt: string;            // ISO 8601
}
```

### Sensor

```typescript
type SensorStatus = 'online' | 'offline';

interface Sensor {
  id: string;                   // Unique hardware ID (from QR code)
  label: string;                // User-defined name, e.g. "Mom's Bathroom"
  roomName: string;             // Room location descriptor
  status: SensorStatus;
  lastHeartbeat: string;        // ISO 8601 timestamp of last heartbeat
  linkedCaretakerIds: string[]; // User IDs of caretakers monitoring this sensor
  pairedAt: string;             // ISO 8601 timestamp when sensor was paired
}
```

### Alert

```typescript
type AlertState = 'active' | 'acknowledged' | 'resolved';
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
  batteryLevel?: number;        // 0-100 percentage (if applicable)
  signalStrength?: number;      // RSSI or similar metric
}
```

## Relationships

```
User (Caretaker)
  └── monitors many Sensors (via Sensor.linkedCaretakerIds)
  └── manages many EmergencyContacts

Sensor
  └── triggers many Alerts
  └── emits many SensorHeartbeats

Alert
  └── belongs to one Sensor
  └── acknowledged by one User (optional)
  └── resolved by one User (optional)
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
- [ ] Mock data covers at least 2 sensors, 5 alerts, 2 emergency contacts
- [ ] Zustand stores accept and return these types

## Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-13 | Ivy & Caine | Initial data models |
