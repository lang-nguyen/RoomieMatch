# RommieMatch

A full-stack web platform for finding rental rooms and compatible roommates in Vietnam.

## Features

- **Room listing & search** — filter by city, district, price, and amenities
- **Roommate matching** — preference-based matching system
- **Multi-role support** — tenant, landlord, and admin dashboards
- **Landlord tools** — post management, rental request handling, stats
- **Subscription packages** — VNPay payment integration
- **AI Chatbot** — room search assistance
- **Auth** — JWT, Google OAuth, forgot/reset password via email

## Tech Stack

| Layer    | Technology                                      |
|----------|-------------------------------------------------|
| Frontend | React 19, Vite, Redux Toolkit, RTK Query        |
| Backend  | FastAPI, SQLAlchemy, Alembic, MySQL             |
| Auth     | JWT, Google OAuth 2.0                           |
| Payment  | VNPay                                           |
| Deploy   | Docker, Docker Compose                          |

## Project Structure

```
RommieMatch/
├── BE/   # FastAPI backend
└── FE/   # React frontend
```

## Quick Start

See [`BE/README.md`](./BE/README.md) and [`FE/README.md`](./FE/README.md) for setup instructions.
