# Safe Portal IN

A full-stack **tourism safety & monitoring platform prototype for India** — React/Vite frontend, Node/Express/MongoDB backend, JWT authentication, and a real emergency SOS workflow backed by a database rather than browser `alert()` calls.

> **Important:** This is a student full-stack project, not an official Government of India system. Demo statistics come from this deployment's own database. SOS alerts are recorded in the app only — they are **not** currently routed to real police or emergency services.

---

## 1. What's implemented

| Area | Status |
|---|---|
| Auth (register/login, JWT, bcrypt) | ✅ Working |
| Destinations (list, detail, search, geolocation "nearby") | ✅ Working, DB-backed |
| Safety Map (Leaflet, color-coded markers, filters) | ✅ Working |
| Trips (create, activate/pause monitoring, end trip) | ✅ Working |
| Emergency SOS (geolocation → DB record → status lifecycle) | ✅ Working |
| User Dashboard (profile, trips, saved destinations, SOS history) | ✅ Working |
| Admin Dashboard (live overview stats, live SOS queue + status updates) | ✅ Working |
| Services marketplace (guides/drivers/photographers, filter by type) | ✅ Working (read + demo "contact") |
| Seasonal advisories | ✅ Working |
| Safety alerts | ✅ API + surfaced on destination pages |
| Weather | ✅ Mock data out of the box; real API is a one-line swap (see below) |
| Toasts instead of `alert()` | ✅ Everywhere |
| Rate limiting, Helmet, CORS, mongo-sanitize, xss-clean, input validation | ✅ Working |

**Not built yet (clearly a next iteration, not pretended to exist):**
- Admin CRUD *forms* for destinations/alerts/services (the REST endpoints exist and are protected by `requireAdmin` — see API docs below — but the admin UI only has the live-overview + SOS queue screens)
- Real weather provider wiring (the endpoint and `.env` slot exist; only mock data is returned until you add a key)
- Real push/SMS notifications to authorities

---

## 2. Tech stack

**Frontend:** React 18, Vite, React Router, Tailwind CSS, Axios, Leaflet / React-Leaflet
**Backend:** Node.js, Express, MongoDB + Mongoose, JWT, bcryptjs, Helmet, CORS, express-rate-limit, express-mongo-sanitize, xss-clean, express-validator

---

## 3. Project structure

```
safe-portal-in/
├── backend/
│   ├── config/db.js
│   ├── controllers/        # auth, users, destinations, trips, sos, alerts, services, weather, admin
│   ├── middleware/         # auth (JWT), errorHandler, validate
│   ├── models/              # User, Destination, Trip, SOS, SafetyAlert, ServiceProvider, SeasonalAdvisory
│   ├── routes/
│   ├── utils/seed.js
│   ├── server.js
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/     # Navbar, Footer, DestinationCard, SosModal, SafetyStatusPill, ProtectedRoute
│   │   ├── context/         # AuthContext, ToastContext
│   │   ├── pages/            # Landing, Login, Signup, Destinations(+Detail), SafetyMap, Dashboard, Trips, Services, Seasonal, Admin, About
│   │   ├── services/api.js  # axios instance + auth interceptor
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   └── package.json
│
└── package.json             # convenience scripts
```

---

## 4. Setup

### Prerequisites
- Node.js 18+
- A MongoDB instance — either local (`mongod`) or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster

### Install

```bash
git clone <this-repo>
cd safe-portal-in
npm run install:all
```

### Configure environment variables

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Edit `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/safe-portal-in
JWT_SECRET=<generate a long random string>
CLIENT_URL=http://localhost:5173
```

`frontend/.env` defaults to pointing at `http://localhost:5000/api` — change it if your backend runs elsewhere.

### Seed the database

```bash
npm run seed
```

This inserts 10 real Indian destinations, 6 service providers, 4 seasonal advisories, 3 safety alerts, and two **demo accounts**:

| Role | Email | Password |
|---|---|---|
| Traveler | `traveler@example.com` | `Traveler@123` |
| Admin | `admin@example.com` | `Admin@12345` |

Change or remove these before any real deployment.

### Run it

In two terminals:

```bash
npm run dev:backend    # http://localhost:5000
npm run dev:frontend   # http://localhost:5173
```

---

## 5. API documentation

Base URL: `/api`

### Auth — `/api/auth`
| Method | Route | Body | Notes |
|---|---|---|---|
| POST | `/register` | `fullName, phone, email, password, state, idType?, idNumber?` | Returns `{ token, user }` |
| POST | `/login` | `email, password` | Returns `{ token, user }` |
| GET | `/me` | — | Requires `Authorization: Bearer <token>` |

### Users — `/api/users` *(auth required)*
- `GET /dashboard` — profile + trips (upcoming/active/completed) + saved destinations + SOS history
- `PUT /profile` — update editable profile fields
- `POST /saved-destinations` — `{ destinationId }`, toggles save

### Destinations — `/api/destinations`
- `GET /` — paginated list (`?page=&limit=`)
- `GET /search?q=` — text search across name/state/category/status
- `GET /nearby?lat=&lng=` — sorted by haversine distance
- `GET /:id`
- `POST /`, `PUT /:id`, `DELETE /:id` — admin only

### Trips — `/api/trips` *(auth required)*
- `POST /` — `{ destination, startDate, endDate, emergencyContacts?, companions?, itinerary? }`
- `GET /` — current user's trips
- `GET /:id`
- `PUT /:id`
- `PATCH /:id/monitoring` — `{ active: boolean }`
- `PATCH /:id/end`

### SOS — `/api/sos` *(auth required)*
- `POST /` — `{ latitude, longitude, trip?, emergencyMessage? }`
- `GET /my` — current user's SOS history
- `GET /:id`
- `GET /admin/active` — admin only, all non-resolved SOS records
- `PATCH /:id/status` — admin only, `{ status: ACTIVE|ACKNOWLEDGED|RESPONDING|RESOLVED|CANCELLED }`

### Alerts — `/api/alerts`
- `GET /?destination=` — active alerts, optionally scoped
- `POST /`, `PUT /:id`, `DELETE /:id` — admin only

### Services — `/api/services`
- `GET /?type=&location=`
- `POST /`, `PUT /:id`, `DELETE /:id` — admin only

### Weather — `/api/weather/:destinationId`
- Returns mock weather unless `WEATHER_API_KEY` is set in `backend/.env`. To wire a real provider, edit `backend/controllers/weatherController.js` — the fetch call and `.env` slot (`WEATHER_API_BASE`, `WEATHER_API_KEY`) are already there; only the mock branch needs replacing. The key never touches frontend code.

### Seasonal — `/api/seasonal`
- `GET /?season=`
- `POST /` — admin only

### Admin — `/api/admin` *(admin only)*
- `GET /overview` — live counts: users, active trips, active SOS, active alerts, destinations, providers

**Standard status codes:** `200/201` success, `400` bad input, `401` unauthenticated, `403` unauthorized, `404` not found, `500` server error. Errors return `{ "message": "..." }`.

---

## 6. Security notes

- Passwords hashed with bcrypt (12 rounds), never returned by the API (`select: false` on the schema field)
- JWT auth via `Authorization: Bearer <token>`, verified in `middleware/auth.js`
- `helmet`, `cors` (scoped to `CLIENT_URL`), `express-rate-limit` (300 req/15min general, 20 req/15min on `/api/auth`), `express-mongo-sanitize`, `xss-clean`, and `express-validator` on write routes
- `.env` is git-ignored; only `.env.example` is committed
- No API keys are ever sent to the frontend — the weather key stays server-side

---

## 7. Known gaps / roadmap

These are intentionally left for a follow-up pass rather than faked:
1. Admin CRUD forms for destinations/alerts/services (endpoints are done, UI isn't)
2. Real weather provider integration (swap-in point documented above)
3. Socket.IO or polling for live SOS updates on the admin dashboard (currently refresh-on-load)
4. Image upload for destinations/providers (currently URL-based)
5. Automated tests

---

## 8. Migrating from the old static site

The original static project (`index.html`, `login.html`, `signup.html`, `services.html`, `seasonal.html`, plus a duplicate `Safe-portal-in-website.html`, one global `Styles.css`, one `Script.js`) has been fully replaced. Specifically fixed:
- The duplicate homepage file and duplicated nav/CSS/JS across every page → single React app with shared `Navbar`/`Footer`
- The hard-coded `DESTINATIONS` array in `Script.js` → MongoDB `Destination` collection, served over `/api/destinations`
- Placeholder `your-image-link.jpg` entries → real Unsplash URLs in the seed data (swap for your own before production)
- `alert()`-based search and SOS confirmation → toast notifications + a real SOS API call
- Static login/signup forms with no backend → JWT-authenticated `/api/auth` endpoints
- Inconsistent footer copyright years (2024 vs 2025) → single dynamic `{new Date().getFullYear()}`
- Missing backend, database, auth, dashboard, and admin system → all added as described above
