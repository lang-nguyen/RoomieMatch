# RommieMatch – Backend

FastAPI backend following a **modular monolith** structure, organized by feature.

## Tech Stack

- **FastAPI** + **SQLAlchemy** (ORM) + **MySQL 8**
- **Alembic** for database migrations
- **JWT** authentication + **Google OAuth 2.0**
- **Docker / Docker Compose**

## Project Structure

```
src/app/
├── api/v1/router.py       # aggregated API router
├── core/                  # config, security, email
├── database/              # session, model registry
├── features/
│   ├── users/             # auth, accounts, profiles, roles
│   ├── rooms/             # posts, images, amenities, reviews, favorites
│   ├── matching/          # preference-based roommate matching
│   ├── packages/          # subscriptions, purchases, VNPay webhook
│   ├── rental_requests/   # rental request flow
│   ├── landlord/          # landlord-specific logic
│   └── chatbot/           # chat sessions & AI tools
└── shared/                # pagination, common helpers
```

## Getting Started

**Requirements:** Python 3.10+, MySQL 8+

```bash
cp .env.example .env
python -m venv .venv && .venv\Scripts\activate   # Windows
pip install -e ".[dev]"
alembic upgrade head
uvicorn app.main:app --reload --app-dir src
```

App runs at `http://127.0.0.1:8000`. API docs at `/docs`.

## Docker

```bash
cp .env.example .env
docker compose up --build
```

## Seed Sample Data

```bash
python scripts/seed_sample_data.py
```

Demo accounts: `tenant.demo@example.com`, `landlord.demo@example.com`, `admin.demo@example.com` — password: `password123`

## Tests

```bash
python -m pytest
```
