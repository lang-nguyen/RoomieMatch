# RommieMatch – Frontend

React frontend built with a **feature-sliced** architecture.

## Tech Stack

- **React 19** + **Vite**
- **Redux Toolkit** + **RTK Query** — global state & server data
- **React Router v7** — role-based routing
- **Google OAuth** (`@react-oauth/google`)

## Project Structure

```
src/
├── app/
│   ├── store.js        # Redux store
│   ├── router.jsx      # App routes (tenant / landlord / admin)
│   └── providers.jsx   # Global providers
├── features/           # Domain modules (auth, room, matching, landlord, chatbot...)
├── shared/             # Reusable components, hooks, utils, baseApi
├── layouts/            # RootLayout, AuthLayout, LandlordLayout...
└── pages/              # Route-level page components
```

## Getting Started

```bash
cp .env.example .env.local
npm install
npm run dev
```

App runs at `http://localhost:5173`.

## Key Patterns

- **RTK Query** (`shared/api/baseApi.js`) — auto token injection, 401 auto-logout, cache invalidation
- **Role-based route guards** — `ProtectedRoute` (authenticated) / `RequireAuth` (role-specific)
- **Feature isolation** — features expose a public API via `index.js`; no deep cross-feature imports
