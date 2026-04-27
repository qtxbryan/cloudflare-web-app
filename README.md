# Cloudflare Demo

A hands-on demonstration of the Cloudflare developer platform — combining Zero Trust, Workers, R2, D1, Tunnels, and WAF in a single working project.

Live at **bryantansx.me**.

---

## What It Does

The demo exposes a landing page with a Southeast Asia flag explorer and a secure, identity-verified area. Every request flows through Cloudflare's edge network before reaching the origin:

| Path | What happens |
|---|---|
| `/` | FastAPI origin serves the landing page through a Cloudflare Tunnel |
| `/api/countries?q=` | FastAPI returns filtered SEA country data; WAF blocks SQL injection |
| `/secure` | Cloudflare Access enforces Google SSO; the Worker reads the verified email and visitor's country from request headers |
| `/flags/<CC>` | Worker streams the flag PNG directly from an R2 bucket |
| `/flags-d1/<CC>` | Worker looks up the R2 key in a D1 SQLite database, then streams the image |
| `/health` | Edge health check, no origin hit |

---

## Architecture

```
Browser
  │
  ▼
Cloudflare Edge
  ├── WAF Managed Rules (OWASP, SQLi, …)
  ├── Zero Trust Access (Google SSO on /secure*)
  ├── Edge Worker (routing, flag serving, identity display)
  │     ├── R2 Bucket  ← flag images
  │     └── D1 Database ← flag metadata → R2 key
  │
  └── Cloudflare Tunnel ──► FastAPI Origin (Python)
                                 ├── GET /
                                 └── GET /api/countries
```

---

## Repository Layout

```
cloudflare-web/
├── backend/                  # Python / FastAPI origin server
│   ├── data/
│   │   └── sea_countries.py  # SEA country code → name map
│   ├── routers/
│   │   ├── countries.py      # GET /api/countries
│   │   └── health.py         # GET /health
│   ├── schemas/
│   │   └── country.py        # Pydantic response model
│   ├── templates/
│   │   └── landing.html      # Landing page (Tailwind CDN)
│   ├── main.py               # FastAPI app entry point
│   ├── requirements.txt
│   └── start.sh
│
└── cloudflare-worker/        # TypeScript Cloudflare Worker
    ├── src/
    │   ├── index.ts          # Worker entry point
    │   ├── router.ts         # Path-based routing
    │   └── handlers/
    │       ├── flags.ts      # R2 and D1 flag serving
    │       ├── health.ts     # Health check response
    │       ├── secure.ts     # Authenticated identity page
    │       └── notFound.ts   # 404 handler
    ├── migrations/
    │   ├── 0001_init.sql     # D1 flags table schema
    │   └── 0002_seed_flags.sql
    ├── scripts/
    │   └── seed-d1.js        # Seed script for D1
    ├── flags/                # PNG flag images (per country code)
    ├── wrangler.jsonc         # Worker config (R2 + D1 bindings, routes)
    └── vitest.config.mts
```

---

## Cloudflare Platform Features

### Cloudflare Tunnel
The FastAPI origin has no open inbound ports. All traffic reaches it through an encrypted outbound-only tunnel (`cloudflared`), so the server is never directly exposed to the internet.

### Zero Trust Access
The `/secure` path is protected by a Cloudflare Access policy that requires Google SSO authentication. After verification, the Worker reads the `Cf-Access-Authenticated-User-Email` header to display the visitor's identity.

### Edge Worker
Handles routing, flag serving, and the authenticated page entirely at the edge. The origin is only hit for the landing page and country search API.

### R2 Object Storage
Flag images are stored in a private R2 bucket (`flags-bucket`) and served via Worker binding — no public bucket URL needed.

### D1 Database
A SQLite database (`flags-db`) stores a `flags` table mapping `country_code → r2_key`. The `/flags-d1/<CC>` path demonstrates a D1 lookup before the R2 fetch.

### WAF Managed Rules
The `/api/countries` endpoint is intentionally searchable so you can try submitting a SQL injection payload (e.g. `' OR 1=1 --`) and watch Cloudflare's WAF block it at the edge before it reaches the origin.

---

## Local Development

### Backend

```bash
cd backend
pip install -r requirements.txt
./start.sh
# Runs on http://localhost:8000
```

### Cloudflare Worker

```bash
cd cloudflare-worker
npm install
npm run dev          # wrangler dev (local preview)
npm test             # vitest
npm run deploy       # deploy to Cloudflare
```

After changing bindings in `wrangler.jsonc`, regenerate TypeScript types:

```bash
npx wrangler types
```

### Seeding D1

```bash
# Apply migrations
npx wrangler d1 migrations apply flags-db

# Seed flag records
node scripts/seed-d1.js
```

---

## Environment & Bindings

| Binding | Type | Purpose |
|---|---|---|
| `flags_bucket` | R2 Bucket | Stores flag PNG images |
| `flags_db` | D1 Database | Maps country codes to R2 keys |

Secrets (e.g. API tokens) are managed via `wrangler secret put` and are never stored in `wrangler.jsonc`.

---

## Routes

Defined in `wrangler.jsonc`, all served under `bryantansx.me`:

| Pattern | Handler |
|---|---|
| `bryantansx.me/health` | Edge health check |
| `bryantansx.me/secure*` | Zero Trust + identity page |
| `bryantansx.me/flags/*` | R2 flag serving |
| `bryantansx.me/flags-d1/*` | D1 + R2 flag serving |
