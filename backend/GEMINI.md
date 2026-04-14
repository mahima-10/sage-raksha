# Backend Directory Guide

**Purpose:** Production FastAPI backend with PostgreSQL

## Scope

### Include
- RESTful API per docs/09-api-specification.md
- PostgreSQL database setup and async operations using SQLAlchemy
- Auth: Phone OTP (Twilio) with stateless JWT access tokens and stateful Refresh tokens
- Sensor event endpoints for ESP32 with static API Key Auth
- Notification dispatcher endpoints for Firebase Cloud Messaging (FCM)
- Alembic database migration schemas

### Exclude
- Mobile app code (see /prototype and /mobile)
- Hardware embedded systems (separate repo)

## Tech Stack
- Python 3.11+
- FastAPI
- SQLAlchemy 2.0 (async via asyncpg)
- Alembic (schema migrations)
- PostgreSQL
- PyJWT for authorization
- passlib with bcrypt hashing

## Key Commands

- `source venv/bin/activate` or start your python environment.
- `pip install -r requirements.txt` to install dependencies.
- `alembic upgrade head` to run all migrations.
- `uvicorn app.main:app --reload` to start the REST API.

## Related Directories
- [Docs](../docs/00-INDEX.md)
