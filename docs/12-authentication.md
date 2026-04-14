# FRD-12: Authentication & Authorization

**Feature:** Phone OTP auth, JWT tokens, and request authorization for the production backend
**Version:** 1.0
**Last Updated:** 2026-04-14
**Status:** Draft
**Priority:** P1

---

## Overview

Two distinct auth systems run in parallel:

1. **Mobile client auth** — Phone OTP → JWT (access + refresh tokens). Used by the React
   Native app for all user-facing endpoints.
2. **Device auth** — Static API key in a header. Used by ESP32 sensors for heartbeat
   and alert creation. Sensors don't have users; they authenticate as devices.

---

## 1. Phone OTP Flow

### Full Sequence

```
Mobile App                          Backend                         SMS Provider (Twilio)
    │                                   │                                  │
    ├── POST /auth/request-otp ────────►│                                  │
    │   { phone: "9876543210" }         │── send OTP SMS ─────────────────►│
    │                                   │   store hash(OTP) + expiry        │
    │◄──────────────── 200 OK ──────────┤                                  │
    │   { expires_in: 300 }             │                                  │
    │                                   │                                  │
    ├── POST /auth/verify-otp ─────────►│                                  │
    │   { phone, otp: "482019" }        │── verify hash(OTP)               │
    │                                   │── upsert user row                │
    │                                   │── generate access + refresh      │
    │◄── 200 OK ────────────────────────┤                                  │
    │   { access_token, refresh_token } │                                  │
```

### OTP Details

| Property | Value |
|----------|-------|
| Length | 6 digits |
| Expiry | 5 minutes |
| Rate limit | 3 requests per phone per 10 minutes |
| Storage | PostgreSQL `otp_codes` table |
| Hash | bcrypt of the 6-digit code (not stored in plaintext) |
| Max attempts | 5 incorrect guesses → OTP invalidated |

OTPs are stored in the PostgreSQL `otp_codes` table. Expired or used rows are cleaned up
either lazily (when a new OTP is requested for the same phone) or via a periodic
background job.

### Token Details

| Token | expiry | Storage |
|-------|--------|---------|
| Access token | 15 minutes | Not stored — stateless JWT |
| Refresh token | 7 days | Stored in PostgreSQL `refresh_tokens` table per user |

#### Access Token Payload

```json
{
  "sub": "usr_abc123",
  "phone": "9876543210",
  "iat": 1713066000,
  "exp": 1713066900,
  "type": "access"
}
```

#### Refresh Token Payload

```json
{
  "sub": "usr_abc123",
  "jti": "rft_xyz789",
  "iat": 1713066000,
  "exp": 1713670800,
  "type": "refresh"
}
```

`jti` (JWT ID) allows individual refresh tokens to be revoked (e.g. on logout) by
deleting the `jti` row from the `refresh_tokens` table. Expired refresh tokens are cleaned
up on a daily schedule or lazily on token refresh.

### Token Refresh Flow

```
Mobile App                          Backend
    │                                   │
    ├── POST /auth/refresh-token ──────►│
    │   { refresh_token: "eyJ..." }     │── verify signature
    │                                   │── check jti in PostgreSQL
    │                                   │── lazily delete expired tokens
    │                                   │── issue new access token
    │◄── 200 OK ────────────────────────┤
    │   { access_token: "eyJ..." }      │
```

The refresh token itself is **not rotated** on each use — the same refresh token is
reused until it expires or logout is called. This avoids race conditions in mobile
apps with concurrent background refreshes.

### Logout

Logout deletes the `jti` from the PostgreSQL `refresh_tokens` table. The access token becomes effectively revoked
at next refresh since the short expiry (15 min) limits the window of misuse.

```
POST /auth/logout
Authorization: Bearer <access_token>
Body: { "refresh_token": "eyJ..." }
```

---

## 2. Device Auth (ESP32 API Key)

ESP32 sensors use a **static API key** instead of JWT. This keeps the firmware simple —
devices never need to exchange tokens.

### How it works

1. A unique API key is generated when a sensor is paired to a home (`POST /homes/{home_id}/sensors`).
2. The key is returned once to the mobile app, which programs it into the ESP32 over BLE
   (out of scope for Phase 2 prototype — for now the key is hardcoded in firmware).
3. The ESP32 sends `X-API-Key: <key>` on every device endpoint request.
4. The backend looks up the sensor by hardware_id and verifies the key matches.

### API Key Storage

```sql
-- See sensors table in FRD-11
```

The key is stored as a bcrypt hash. The plaintext key is only returned once (at
pairing time) and never stored.

### Device Endpoint Auth Middleware

```python
async def require_device_auth(hardware_id: str, x_api_key: Header):
    sensor = await db.sensors.get_by_hardware_id(hardware_id)
    if not sensor:
        raise HTTP 404 NOT_FOUND
    if not bcrypt.verify(x_api_key, sensor.api_key_hash):
        raise HTTP 401 UNAUTHORIZED
    return sensor
```

---

## 3. JWT Auth Middleware

Applied to all routes **except** the OTP endpoints and device endpoints.

```python
async def require_auth(authorization: Header) -> User:
    token = extract_bearer(authorization)
    payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
    if payload["type"] != "access":
        raise HTTP 401 UNAUTHORIZED
    user = await db.users.get(payload["sub"])
    if not user:
        raise HTTP 401 UNAUTHORIZED
    return user
```

### Routes that skip JWT auth

| Route | Auth instead |
|-------|-------------|
| `POST /auth/request-otp` | None (public) |
| `POST /auth/verify-otp` | None (public) |
| `POST /auth/refresh-token` | None (refresh token in body) |
| `POST /device/heartbeat` | API Key |
| `POST /device/alerts` | API Key |

All other routes require `Authorization: Bearer <access_token>`.

---

## 4. Authorization Rules

Authentication confirms *who you are*. Authorization confirms *what you're allowed to do*.

### Home-scoped access

Users can only read and write resources that belong to homes they are a member of.
This is checked at the route handler level, not in middleware.

```python
async def assert_home_member(user: User, home_id: UUID, db: Database):
    member = await db.home_members.get(home_id=home_id, user_id=user.id)
    if not member:
        raise HTTP 403 FORBIDDEN
```

### Owner-only operations

Some home operations are restricted to the home owner:

| Operation | Required role |
|-----------|---------------|
| `PATCH /homes/{id}` | `owner` |
| `POST /homes/{id}/invite` | `owner` |
| `DELETE /homes/{id}` | `owner` (Phase 3) |

```python
async def assert_home_owner(user: User, home_id: UUID, db: Database):
    member = await db.home_members.get(home_id=home_id, user_id=user.id)
    if not member or member.role != 'owner':
        raise HTTP 403 FORBIDDEN
```

### Sensor and alert access

Sensors and alerts belong to homes. A membership check on the home is sufficient.
There is no per-sensor or per-alert ACL.

```python
# A sensor's home_id is fetched and membership is verified before returning data
sensor = await db.sensors.get(sensor_id)
await assert_home_member(user, sensor.home_id, db)
```

### Summary table

| Resource | Read | Create | Update | Delete |
|----------|------|--------|--------|--------|
| Home | member | any auth'd user | owner | owner (P3) |
| Sensor | member | member | member | member |
| Alert | member | device (API key) | member | — |
| Emergency Contact | member | member | member | member |
| User profile | self | — (created on OTP) | self | — |

---

## 5. Security Notes

- **JWT secret** stored in environment variable only, not in source code.
- **API keys** stored as bcrypt hashes; plaintext never logged.
- **OTPs** stored as bcrypt hashes; never returned in API responses or logs.
- **Phone numbers** are not considered PII for Phase 2, but will be masked in logs.
- **HTTPS only** — HTTP requests redirected to HTTPS in production.
- **CORS** — restricted to the Expo development origin in development; production origins
  only in production.

---

## Acceptance Criteria

- [ ] OTP request rate-limited: 4th request within 10 minutes returns `RATE_LIMITED`
- [ ] OTP expires after 5 minutes
- [ ] Access token rejected after 15 minutes
- [ ] Refresh token rejected after 7 days or after logout
- [ ] A member of Home A can not access sensors or alerts from Home B
- [ ] Non-owner caretaker receives `FORBIDDEN` on owner-only routes
- [ ] Device endpoint with wrong API key returns `UNAUTHORIZED`
- [ ] All auth errors use `{ "detail": "...", "code": "..." }` format

## Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-14 | Ivy & Caine | Initial auth spec for Phase 2 |
