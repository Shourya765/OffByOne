# Event Finder

Full-stack web app to discover events near you or in a chosen country, filtered by interests, date, distance, and price. Built with **React**, **Tailwind CSS**, **Node.js**, **Express**, and **MongoDB**, with **Ticketmaster Discovery API** support and **OpenStreetMap** maps.

## Features

- **Location**: browser GPS, IP-based approximate location ([ip-api.com](http://ip-api.com)), or city + country search.
- **Interests**: Tech, Music, Sports, Food, Business, Art, Festivals, Education — filters list and boosts ranking when signed in.
- **Views**: responsive **list** and **map** (Leaflet + OSM).
- **Search & filters**: keyword, today / this week / this month, radius (km), categories, free vs paid.
- **Event detail**: description, organizer, ticket link, **Google Calendar** + **`.ics` download**, save favorites.
- **Accounts**: sign up / log in (JWT), saved favorites, **behavior-weighted recommendations** (opens category views + interests).
- **Extras**: trending by view counts (per region), **Surprise me** (random event), optional **browser notifications** for upcoming saved events (within 48h).

Without a Ticketmaster API key, the API serves **rich sample events** (San Francisco–based) so the UI is demo-ready.

## Prerequisites

- Node.js 18+
- MongoDB running locally (or set `MONGODB_URI`), for auth, favorites, stats, and recommendations

## Setup

1. **Clone** (or use this folder) and install dependencies:

   ```bash
   npm run install:all
   ```

2. **Server env** — copy `server/.env.example` to `server/.env` and adjust:

   ```env
   PORT=5050
   MONGODB_URI=mongodb://127.0.0.1:27017/event-finder
   JWT_SECRET=your-long-random-secret
   TICKETMASTER_API_KEY=   # optional when using sample data
   USE_SAMPLE_EVENTS=true  # set false + add key to use Ticketmaster
   CLIENT_ORIGIN=http://localhost:5173
   ```

3. **Ticketmaster** (optional): create an app at [Ticketmaster Developer](https://developer.ticketmaster.com/) and set `TICKETMASTER_API_KEY`.

## Run locally

Terminal 1 — API:

```bash
cd server && npm run dev
```

Terminal 2 — client:

```bash
cd client && npm run dev
```

Or from the repo root (after `npm install` for root `concurrently`):

```bash
npm install
npm run dev
```

- App: [http://localhost:5173](http://localhost:5173)  
- API: [http://localhost:5050/api/health](http://localhost:5050/api/health) — **use the same port** in `server/.env` (`PORT=`) and `client/vite.config.js` (`proxy./api.target`). Default is **5050** because macOS often reserves **5000** (AirPlay).

If you change the API port, update both files or the UI will show a connection error and no events.

## Production build

```bash
npm run build --prefix client
```

Serve `client/dist` with any static host and point API `CLIENT_ORIGIN` to that origin. Run the server with `npm run start --prefix server`.

## API overview

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/events/geolocate` | Approximate location from IP |
| GET | `/api/events/cities` | `country` (ISO2) — distinct cities with sample events (e.g. India lists 60+ cities) |
| GET | `/api/events/nearest-city` | `lat`, `lng` — nearest demo city (for GPS → city-only results) |
| GET | `/api/events/search` | Query: `lat`, `lng`, `radiusKm`, `q`, `date`, `price`, `categories`, `city`, `country` |
| GET | `/api/events/trending` | Trending / popular events for a region |
| GET | `/api/events/recommendations` | Auth required — personalized list |
| GET | `/api/events/:id` | Event detail (+ view tracking) |
| POST | `/api/auth/register`, `/api/auth/login` | JWT auth |
| GET | `/api/auth/me` | Current user |
| PATCH | `/api/user/interests` | Update interests |
| GET/POST/DELETE | `/api/user/favorites`, `/api/user/favorites/:eventId` | Favorites |

## Tech choices

- **Maps**: OpenStreetMap tiles (no API key). You can swap to Google Maps by replacing the Leaflet layer in `client/src/components/EventsMap.jsx`.
- **Privacy**: GPS and notifications require user consent in the browser.

## License

MIT
