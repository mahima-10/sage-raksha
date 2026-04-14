# FRD-09: API Specification

**Feature:** RESTful API for the S.A.G.E Raksha production backend
**Version:** 1.0
**Last Updated:** 2026-04-14
**Status:** Draft
**Priority:** P1

---

## Overview

Defines the complete HTTP API surface for the production FastAPI backend. Mobile clients
(React Native) call this API with JWT auth. ESP32 sensors call the heartbeat and alert
creation endpoints using a static API key — they do not need JWT.

All endpoints are prefixed `/api/v1`.

---

## Conventions

### Base URL
```
https://api.sageraksha.com/api/v1
```

### Request Headers

Mobile clients:
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

ESP32 sensors (device endpoints only):
```
X-API-Key: <static_api_key>
Content-Type: application/json
```

### Error Format

All errors return a consistent shape:
```json
{
  "detail": "Human-readable message",
  "code": "ERROR_CODE"
}
```

Common error codes:

| HTTP | Code | Meaning |
|------|------|---------|
| 400 | `VALIDATION_ERROR` | Request body failed validation |
| 401 | `UNAUTHORIZED` | Missing or invalid auth credential |
| 403 | `FORBIDDEN` | Authenticated but not allowed |
| 404 | `NOT_FOUND` | Resource does not exist |
| 409 | `CONFLICT` | Duplicate resource (e.g. phone already registered) |
| 429 | `RATE_LIMITED` | Too many OTP requests |
| 500 | `INTERNAL_ERROR` | Unexpected server error |

### Pagination

Alert history uses **cursor-based pagination** to avoid offset drift:

```json
{
  "items": [...],
  "next_cursor": "2026-04-10T14:34:00Z|a-123",
  "has_more": true
}
```

Pass `?cursor=<next_cursor>&limit=20` on subsequent requests. Cursor encodes
`triggeredAt|alertId` to ensure a deterministic, stable sort.

---

## Resources

---

### Auth

Phone OTP flow: request OTP → verify OTP → receive tokens.

---

#### `POST /auth/request-otp`

Sends an OTP SMS to the given phone number. Rate-limited to 3 requests per phone
per 10 minutes.

**Auth:** None

**Request:**
```json
{
  "phone": "9876543210"
}
```

**Response `200`:**
```json
{
  "message": "OTP sent",
  "expires_in": 300
}
```

**Errors:** `VALIDATION_ERROR`, `RATE_LIMITED`

---

#### `POST /auth/verify-otp`

Verifies the OTP. Creates a new user account if the phone number is not registered.
Returns a short-lived access token and a long-lived refresh token.

**Auth:** None

**Request:**
```json
{
  "phone": "9876543210",
  "otp": "482019"
}
```

**Response `200`:**
```json
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "token_type": "Bearer",
  "user": {
    "id": "usr_abc123",
    "phone": "9876543210",
    "name": null,
    "mode": null,
    "created_at": "2026-04-14T05:30:00Z"
  }
}
```

**Errors:** `VALIDATION_ERROR`, `UNAUTHORIZED` (wrong OTP), `NOT_FOUND` (OTP expired)

---

#### `POST /auth/refresh-token`

Exchanges a valid refresh token for a new access token.

**Auth:** None (refresh token in body)

**Request:**
```json
{
  "refresh_token": "eyJ..."
}
```

**Response `200`:**
```json
{
  "access_token": "eyJ...",
  "token_type": "Bearer"
}
```

**Errors:** `UNAUTHORIZED` (expired or revoked refresh token)

---

#### `POST /auth/logout`

Logs out the current user by deleting the specified refresh token. The access token remains valid until its 15-minute expiry, but cannot be refreshed.

**Auth:** JWT

**Request:**
```json
{
  "refresh_token": "eyJ..."
}
```

**Response `200`:**
```json
{
  "message": "Logged out successfully"
}
```

**Errors:** `UNAUTHORIZED`

---

### Users

---

#### `GET /users/me`

Returns the current authenticated user's profile.

**Auth:** JWT

**Response `200`:**
```json
{
  "id": "usr_abc123",
  "phone": "9876543210",
  "name": "Ananya",
  "mode": "independent",
  "home_ids": ["hom_xyz789"],
  "created_at": "2026-04-14T05:30:00Z",
  "updated_at": "2026-04-14T05:30:00Z"
}
```

---

#### `PATCH /users/me`

Updates the user's name or mode. Mode can only be set once (from null to a value).

**Auth:** JWT

**Request:**
```json
{
  "name": "Ananya",
  "mode": "independent"
}
```

**Response `200`:** Updated user object (same shape as `GET /users/me`)

**Errors:** `VALIDATION_ERROR`, `CONFLICT` (mode already set)

---

### Homes

---

#### `POST /homes`

Creates a new home. The calling user becomes a member with `role: owner`.

**Auth:** JWT

**Request:**
```json
{
  "name": "Mom's House",
  "address": "123 Main St, Springfield"
}
```

**Response `201`:**
```json
{
  "id": "hom_xyz789",
  "name": "Mom's House",
  "address": "123 Main St, Springfield",
  "created_by": "usr_abc123",
  "invite_code": "RAKSHA-XYZ7",
  "created_at": "2026-04-14T05:30:00Z"
}
```

---

#### `GET /homes/{home_id}`

Returns a home and its members.

**Auth:** JWT (must be a member of this home)

**Response `200`:**
```json
{
  "id": "hom_xyz789",
  "name": "Mom's House",
  "address": "123 Main St, Springfield",
  "created_by": "usr_abc123",
  "invite_code": "RAKSHA-XYZ7",
  "members": [
    {
      "user_id": "usr_abc123",
      "name": "Ananya",
      "role": "owner",
      "joined_at": "2026-04-14T05:30:00Z"
    }
  ],
  "created_at": "2026-04-14T05:30:00Z"
}
```

**Errors:** `NOT_FOUND`, `FORBIDDEN`

---

#### `PATCH /homes/{home_id}`

Updates the home name or address. Only the owner may call this.

**Auth:** JWT (owner only)

**Request:**
```json
{
  "name": "Mom's New House",
  "address": "456 Oak Ave, Springfield"
}
```

**Response `200`:** Updated home object (same shape as `GET /homes/{home_id}`)

**Errors:** `VALIDATION_ERROR`, `FORBIDDEN`

---

#### `POST /homes/{home_id}/invite`

Generates or refreshes the home's invite code. Only the owner may call this.

**Auth:** JWT (owner only)

**Response `200`:**
```json
{
  "invite_code": "RAKSHA-NEW1"
}
```

**Errors:** `FORBIDDEN`

---

#### `POST /homes/join`

Joins an existing home using an invite code. The user becomes a member with
`role: caretaker`.

**Auth:** JWT

**Request:**
```json
{
  "invite_code": "RAKSHA-XYZ7"
}
```

**Response `200`:** Full home object (same shape as `GET /homes/{home_id}`)

**Errors:** `NOT_FOUND` (invalid code), `CONFLICT` (already a member)

---

### Sensors

These endpoints cover the mobile app side (CRUD). For ESP32 sensor posting, see the
Device Endpoints section below.

---

#### `POST /homes/{home_id}/sensors`

Registers (pairs) a new sensor to a home. Called when the mobile app scans the QR code.

**Auth:** JWT (must be a member of this home)

**Request:**
```json
{
  "hardware_id": "SEN-ABC123",
  "label": "Mom's Bathroom"
}
```

**Response `201`:**
```json
{
  "id": "sen_def456",
  "hardware_id": "SEN-ABC123",
  "home_id": "hom_xyz789",
  "label": "Mom's Bathroom",
  "status": "offline",
  "api_key": "sk_live_...",
  "last_heartbeat": null,
  "created_at": "2026-04-14T05:30:00Z"
}
```

**Errors:** `VALIDATION_ERROR`, `CONFLICT` (hardware_id already registered)

---

#### `GET /homes/{home_id}/sensors`

Lists all sensors paired to a home.

**Auth:** JWT (must be a member)

**Response `200`:**
```json
{
  "sensors": [
    {
      "id": "sen_def456",
      "hardware_id": "SEN-ABC123",
      "home_id": "hom_xyz789",
      "label": "Mom's Bathroom",
      "status": "online",
      "last_heartbeat": "2026-04-14T05:29:30Z",
      "created_at": "2026-04-14T05:00:00Z"
    }
  ]
}
```

---

#### `GET /homes/{home_id}/sensors/{sensor_id}`

Returns detail for a single sensor.

**Auth:** JWT (must be a member of the sensor's home)

**Response `200`:**
```json
{
  "id": "sen_def456",
  "hardware_id": "SEN-ABC123",
  "home_id": "hom_xyz789",
  "label": "Mom's Bathroom",
  "status": "online",
  "last_heartbeat": "2026-04-14T05:29:30Z",
  "created_at": "2026-04-14T05:00:00Z",
  "active_alert_count": 0,
  "recent_alerts": [
    {
      "id": "alt_ghi789",
      "alert_type": "fall",
      "state": "resolved",
      "triggered_at": "2026-04-14T04:00:00Z",
      "outcome": "real_fall"
    }
  ]
}
```

**Errors:** `NOT_FOUND`, `FORBIDDEN`

---

#### `PATCH /homes/{home_id}/sensors/{sensor_id}`

Updates the sensor label only.

**Auth:** JWT (must be a member)

**Request:**
```json
{
  "label": "Hall Bathroom"
}
```

**Response `200`:** Updated sensor object

**Errors:** `VALIDATION_ERROR`, `FORBIDDEN`

---

#### `DELETE /homes/{home_id}/sensors/{sensor_id}`

Unpairs and permanently removes a sensor from a home.

**Auth:** JWT (must be a member)

**Response `204`:** No content

**Errors:** `NOT_FOUND`, `FORBIDDEN`

---

### Alerts

---

#### `GET /homes/{home_id}/alerts`

Returns active, escalated, and acknowledged alerts (non-resolved). Used by the
dashboard and alert banner.

**Auth:** JWT (must be a member)

**Response `200`:**
```json
{
  "alerts": [
    {
      "id": "alt_ghi789",
      "sensor_id": "sen_def456",
      "home_id": "hom_xyz789",
      "alert_type": "fall",
      "state": "active",
      "triggered_at": "2026-04-14T05:28:00Z",
      "escalated_at": null,
      "acknowledged_at": null,
      "acknowledged_by": null,
      "resolved_at": null,
      "resolved_by": null,
      "outcome": null,
      "notes": null
    }
  ]
}
```

---

#### `GET /homes/{home_id}/alerts/{alert_id}`

Returns detail for a single alert.

**Auth:** JWT (must be a member of alert's home)

**Response `200`:** Single alert object (same shape as list item above)

**Errors:** `NOT_FOUND`, `FORBIDDEN`

---

#### `POST /homes/{home_id}/alerts/{alert_id}/acknowledge`

Marks an active or escalated alert as acknowledged by the current user.

**Auth:** JWT (must be a member)

**Request:** Empty body `{}`

**Response `200`:** Updated alert object

**Errors:** `NOT_FOUND`, `FORBIDDEN`, `CONFLICT` (alert already resolved)

---

#### `POST /homes/{home_id}/alerts/{alert_id}/resolve`

Marks an alert as resolved with an outcome and optional notes.

**Auth:** JWT (must be a member)

**Request:**
```json
{
  "outcome": "real_fall",
  "notes": "Mom slipped on the wet floor."
}
```
`outcome` is required. `notes` is optional.

**Response `200`:** Updated alert object

**Errors:** `VALIDATION_ERROR`, `NOT_FOUND`, `FORBIDDEN`

---

#### `GET /homes/{home_id}/alerts/history`

Returns resolved alerts, newest first, with cursor-based pagination.

**Auth:** JWT (must be a member)

**Query params:**
- `limit` (int, default 20, max 50)
- `cursor` (string, from previous response's `next_cursor`)
- `alert_type` (optional: `fall` | `stillness` — filter by type)
- `outcome` (optional: `real_fall` | `false_alarm` — filter by outcome)

**Response `200`:**
```json
{
  "items": [ ... ],
  "next_cursor": "2026-04-10T14:34:00Z|alt_abc",
  "has_more": true,
  "total_count": 47
}
```

---

### Emergency Contacts

---

#### `GET /homes/{home_id}/contacts`

Lists emergency contacts for a home.

**Auth:** JWT (must be a member)

**Response `200`:**
```json
{
  "contacts": [
    {
      "id": "con_jkl012",
      "home_id": "hom_xyz789",
      "name": "Mrs. Sharma",
      "phone": "9876543212",
      "relationship": "Neighbor",
      "created_at": "2026-04-14T05:00:00Z"
    }
  ]
}
```

---

#### `POST /homes/{home_id}/contacts`

Adds a new emergency contact to a home.

**Auth:** JWT (must be a member)

**Request:**
```json
{
  "name": "Mrs. Sharma",
  "phone": "9876543212",
  "relationship": "Neighbor"
}
```

**Response `201`:** Created contact object (same shape as list item)

**Errors:** `VALIDATION_ERROR`

---

#### `PATCH /homes/{home_id}/contacts/{contact_id}`

Updates a contact's name, phone, or relationship.

**Auth:** JWT (must be a member)

**Request:** Partial body — any subset of `name`, `phone`, `relationship`

**Response `200`:** Updated contact object

**Errors:** `VALIDATION_ERROR`, `NOT_FOUND`, `FORBIDDEN`

---

#### `DELETE /homes/{home_id}/contacts/{contact_id}`

Removes an emergency contact.

**Auth:** JWT (must be a member)

**Response `204`:** No content

**Errors:** `NOT_FOUND`, `FORBIDDEN`

---

### Device Endpoints (ESP32)

These endpoints are called by the ESP32 hardware, not the mobile app. Auth is via
a static API key (`X-API-Key` header) rather than JWT.

---

#### `POST /device/heartbeat`

ESP32 posts here every 30 seconds to confirm the sensor is alive. The backend
sets `status: online` and updates `last_heartbeat`. If no heartbeat is received
for > 5 minutes, a background job sets the sensor `status: offline`.

**Auth:** API Key

**Request:**
```json
{
  "hardware_id": "SEN-ABC123",
  "signal_strength": -62
}
```

**Response `200`:**
```json
{
  "ok": true
}
```

**Errors:** `UNAUTHORIZED`, `NOT_FOUND` (unregistered hardware_id)

---

#### `POST /device/alerts`

ESP32 posts here when the on-device fall/stillness detection fires.
The backend creates the alert, marks the sensor as having an active alert, and
immediately fans out FCM push notifications to all home members.

**Auth:** API Key

**Request:**
```json
{
  "hardware_id": "SEN-ABC123",
  "alert_type": "fall",
  "triggered_at": "2026-04-14T05:28:00Z"
}
```

`alert_type` is `fall` or `stillness`. `triggered_at` is the device-local timestamp
at which the event fired (used for latency auditing); the server also records its own
`received_at` timestamp.

**Response `201`:**
```json
{
  "alert_id": "alt_ghi789",
  "ok": true
}
```

**Errors:** `VALIDATION_ERROR`, `UNAUTHORIZED`, `NOT_FOUND`

---

## Acceptance Criteria

- [ ] All endpoints return the documented response shapes
- [ ] All errors use `{ "detail": ..., "code": ... }` format
- [ ] Alert history pagination is cursor-based and stable under concurrent inserts
- [ ] Device endpoints reject requests with a missing or invalid API key
- [ ] JWT middleware rejects expired tokens with `UNAUTHORIZED`
- [ ] A user can only read/write resources belonging to homes they are a member of

## Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-14 | Ivy & Caine | Initial API spec for Phase 2 |
