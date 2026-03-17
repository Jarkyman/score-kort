# score-kort.dk — Project Context (Web + Database + API)

## 0) Elevator pitch
score-kort.dk is a lightweight public site that shows up-to-date scorecard data for Danish golf clubs (clubs → courses → tees → holes + optional GPS POIs). Users can report errors or request missing clubs. Data is stored in a database and exposed through a small API — the original CSV files are never publicly served.

---

## 1) Goals (MVP)
- Show **all clubs** with search (name/city) and a clean list view.
- Club detail page:
  - address + website + contact
  - list of courses for that club
- Course detail page:
  - list of tees (each tee set has slope/CR and per-hole lengths)
  - scorecard view (holes: par + hcp + length per tee)
  - optional GPS POIs if available for that course
- “Request correction / Add missing club” form:
  - stores a change request for review (no direct edits by public users)
- Keep ops cost low and keep migration easy from local → cloud.

---

## 2) Key constraint: “Hide the CSV”
You can’t fully prevent copying of data that is publicly visible, but you *can* avoid trivial bulk download:
- Do **not** host CSV files publicly.
- Store data in a database and expose only “sliced” API endpoints (paging/search/single course).
- Add caching + basic rate limiting to discourage scraping.

---

## 3) Tech stack (single repo, full-stack)
Recommended stack:
- Frontend: Cloudflare Pages (static site)
- API: Cloudflare Pages Functions (runs on Workers runtime)
- Database: Cloudflare D1 (SQLite)

This keeps everything in **one repo**, served under one domain:
- Frontend: `/`
- API: `/api/*`

Local development is supported (no paid services needed while building).

Providers:
- :contentReference[oaicite:0]{index=0} for Pages/Functions/D1
- :contentReference[oaicite:1]{index=1} as target coverage

---

## 4) Data sources (your 4 CSV files)
You currently have 4 CSVs:
- `clubs.csv` (187 rows, 13 columns): Club master data
- `courses.csv` (200 rows, 114 columns): Course metadata + per-hole Par/Hcp (including women variants)
- `tees.csv` (~701 rows): Tee sets + per-hole lengths + slope/CR
  - Note: a few lines contain a trailing comma (parsing issue). Import script should sanitize.
  - Note: `TeeID` is not reliable as a unique key (duplicates exist).
- `coordinates.csv` (2513 rows): POIs per hole (greens F/C/B, tee points, bunkers, markers, etc.)
  - Coverage is partial (not all courses have POIs).

---

## 5) Database model (normalized, API-friendly)
We store data in normalized tables so the API can query efficiently.

### Tables
**clubs**
- `club_id` (PK), `club_name`, `address`, `city`, `postal_code`, `country`, `latitude`, `longitude`, `website`, `email`, `telephone`, etc.

**courses**
- `course_id` (PK), `club_id` (FK → clubs), `course_name`, `num_holes`, `measure_meters`, `timestamp_updated`

**holes** (one row per course + hole)
- PK `(course_id, hole_no)`
- `par`, `hcp`, `par_w`, `hcp_w`, `match_index`, `split_index`

**tees**
- `tee_key` (PK, stable internal key)
- `course_id` (FK), `tee_external_id` (raw TeeID), `tee_name`, `tee_color`
- `slope`, `cr`, and front/back 9 + women variants
- Why `tee_key`? Because `TeeID` can be duplicated.

**tee_lengths** (one row per tee + hole)
- PK `(tee_key, hole_no)`
- `length`

**pois** (GPS points / points of interest)
- PK `(course_id, hole_no, poi, location)`
- `poi` (e.g., Green, Tee Front, Tee Back, 150 Marker, Water, etc.)
- `location` (F/C/B when relevant)
- `side_of_fairway` (L/C/R when relevant)
- `latitude`, `longitude`

**change_requests** (user-submitted corrections)
- `id` (PK), `created_at`, `type`, `status`
- `payload_json` (proposed changes)
- `user_message`, `user_contact`, `admin_notes`

### SQL files (kept in repo)
- `db/scorekort_schema.sql` — creates tables + indexes
- `db/scorekort_seed.sql` — inserts all current CSV data into the DB
- `db/build_seed_sql.py` — optional script that rebuilds seed SQL from CSVs

---

## 6) Local development workflow (no cloud costs while building)
### Prereqs
- Node.js + npm
- Wrangler CLI (Cloudflare dev tool)

### Local DB setup (D1 local)
Run:
- apply schema to local D1
- import seed data

Example commands (adjust DB name as needed):
```bash
# Create / update local schema
npx wrangler d1 execute scorekort --local --file=db/scorekort_schema.sql

# Seed local DB
npx wrangler d1 execute scorekort --local --file=db/scorekort_seed.sql
