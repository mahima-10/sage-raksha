# FRD-11: Database Schema

**Feature:** PostgreSQL table definitions for the production backend
**Version:** 1.0
**Last Updated:** 2026-04-14
**Status:** Draft
**Priority:** P1

---

## Overview

Maps the FRD-01 data models to concrete PostgreSQL tables. Home is the central
entity. Users link to homes through a `home_members` join table (replacing the
prototype's `linkedHomeIds` array). ESP32 sensors post heartbeats and fall events;
the alerts table records the full lifecycle of both fall and stillness events.

All tables use UUIDs for primary keys and include `created_at` / `updated_at`
timestamps. `updated_at` is maintained by a trigger.

---

## Tables

---

### `users`

One row per registered caretaker. Created on first successful OTP verify.

```sql
CREATE TABLE users (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone        TEXT NOT NULL UNIQUE,          -- E.164 without +, e.g. '9876543210'
    name         TEXT,                          -- Set during onboarding, nullable until set
    mode         TEXT CHECK (mode IN ('independent', 'facility')),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_phone ON users (phone);
```

---

### `homes`

One row per monitored home.

```sql
CREATE TABLE homes (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name         TEXT NOT NULL,
    address      TEXT,
    created_by   UUID NOT NULL REFERENCES users (id) ON DELETE RESTRICT,
    invite_code  TEXT NOT NULL UNIQUE,          -- e.g. 'RAKSHA-XYZ7'
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_homes_invite_code ON homes (invite_code);
```

---

### `home_members`

Join table linking users to homes. Replaces the prototype's `User.linkedHomeIds` array.

```sql
CREATE TABLE home_members (
    home_id    UUID NOT NULL REFERENCES homes (id) ON DELETE CASCADE,
    user_id    UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    role       TEXT NOT NULL DEFAULT 'caretaker'
                   CHECK (role IN ('owner', 'caretaker')),
    joined_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    PRIMARY KEY (home_id, user_id)            -- composite PK prevents duplicates
);

CREATE INDEX idx_home_members_user_id ON home_members (user_id);
```

Notes:
- A home has exactly one `owner` (the user who called `POST /homes`).
- Caretakers who join with an invite code get `role: caretaker`.
- Deleting a home cascades and removes all membership rows.

---

### `sensors`

One row per paired mmWave radar sensor.

```sql
CREATE TABLE sensors (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hardware_id    TEXT NOT NULL UNIQUE,        -- From QR code, e.g. 'SEN-ABC123'
    home_id        UUID NOT NULL REFERENCES homes (id) ON DELETE CASCADE,
    label          TEXT NOT NULL,               -- User-assigned, e.g. 'Mom\'s Bathroom'
    status         TEXT NOT NULL DEFAULT 'offline'
                       CHECK (status IN ('online', 'offline')),
    last_heartbeat TIMESTAMPTZ,                 -- NULL until first heartbeat received
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sensors_home_id   ON sensors (home_id);
CREATE INDEX idx_sensors_hardware_id ON sensors (hardware_id);
```

---

### `alerts`

One row per alert event, regardless of type (fall or stillness). Records the full
lifecycle from trigger through resolution.

```sql
CREATE TABLE alerts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sensor_id       UUID NOT NULL REFERENCES sensors (id) ON DELETE CASCADE,
    home_id         UUID NOT NULL REFERENCES homes (id) ON DELETE CASCADE,

    -- Type and lifecycle
    alert_type      TEXT NOT NULL CHECK (alert_type IN ('fall', 'stillness')),
    state           TEXT NOT NULL DEFAULT 'active'
                        CHECK (state IN ('active', 'escalated', 'acknowledged', 'resolved')),
    outcome         TEXT CHECK (outcome IN ('real_fall', 'false_alarm')),

    -- Timestamps
    triggered_at    TIMESTAMPTZ NOT NULL,       -- Device-reported event time
    received_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),  -- Server receipt time (latency audit)
    escalated_at    TIMESTAMPTZ,
    acknowledged_at TIMESTAMPTZ,
    resolved_at     TIMESTAMPTZ,

    -- Who acted
    acknowledged_by UUID REFERENCES users (id) ON DELETE SET NULL,
    resolved_by     UUID REFERENCES users (id) ON DELETE SET NULL,

    -- Resolution notes
    notes           TEXT,

    -- Constraint: outcome is required when state = 'resolved'
    CONSTRAINT outcome_required_when_resolved
        CHECK (state != 'resolved' OR outcome IS NOT NULL),

    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Queries: active alerts for a home (dashboard)
CREATE INDEX idx_alerts_home_id_state ON alerts (home_id, state);

-- Queries: alerts for a specific sensor
CREATE INDEX idx_alerts_sensor_id    ON alerts (sensor_id);

-- Queries: alert history pagination (cursor-based, newest first)
CREATE INDEX idx_alerts_triggered_at ON alerts (triggered_at DESC);

-- Queries: filter history by type
CREATE INDEX idx_alerts_alert_type   ON alerts (home_id, alert_type);
```

---

### `emergency_contacts`

Emergency contacts that receive SMS escalation if no caretaker acknowledges in time.

```sql
CREATE TABLE emergency_contacts (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    home_id      UUID NOT NULL REFERENCES homes (id) ON DELETE CASCADE,
    name         TEXT NOT NULL,
    phone        TEXT NOT NULL,
    relationship TEXT NOT NULL,                 -- e.g. 'Neighbor', 'Sibling'
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_emergency_contacts_home_id ON emergency_contacts (home_id);
```

---

## Shared: `updated_at` Trigger

All tables use a single trigger function to keep `updated_at` fresh:

```sql
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to each table:
CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_homes_updated_at
    BEFORE UPDATE ON homes
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_sensors_updated_at
    BEFORE UPDATE ON sensors
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_alerts_updated_at
    BEFORE UPDATE ON alerts
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_emergency_contacts_updated_at
    BEFORE UPDATE ON emergency_contacts
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
```

---

## Entity Relationship Summary

```
users
  └── creates → homes (homes.created_by)
  └── joins → home_members (via home_id + user_id)
  └── acknowledges → alerts (alerts.acknowledged_by)
  └── resolves → alerts (alerts.resolved_by)

homes
  └── has many → home_members
  └── has many → sensors
  └── has many → alerts (denormalized home_id for fast dashboard queries)
  └── has many → emergency_contacts

sensors
  └── belongs to → homes
  └── triggers many → alerts

alerts
  └── belongs to → sensors
  └── belongs to → homes (denormalized)
  └── acknowledged by → users (optional)
  └── resolved by → users (optional)

emergency_contacts
  └── belongs to → homes
```

---

## Alembic Migration Strategy

Migrations are managed by Alembic. Each migration is a numbered revision file.
The initial migration creates all tables and triggers in dependency order:

1. `users`
2. `homes` (depends on `users`)
3. `home_members` (depends on `users`, `homes`)
4. `sensors` (depends on `homes`)
5. `alerts` (depends on `sensors`, `homes`, `users`)
6. `emergency_contacts` (depends on `homes`)
7. Trigger function + all triggers

---

## Acceptance Criteria

- [ ] All tables created in a single Alembic initial migration
- [ ] `updated_at` triggers fire correctly on every UPDATE
- [ ] `composite PK (home_id, user_id)` on `home_members` prevents duplicate memberships
- [ ] `outcome_required_when_resolved` constraint enforced at DB level
- [ ] Alert history queries using cursor pagination complete in < 50ms with 10k rows
- [ ] `hardware_id` uniqueness on sensors enforced at DB level

## Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-14 | Ivy & Caine | Initial schema for Phase 2 |
