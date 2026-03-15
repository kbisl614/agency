# Dashboard Design Spec — AIops Mission Control
**Date:** 2026-03-15
**Status:** Approved — ready for implementation planning

---

## What We're Building

Two dashboards for the AIops HVAC implementation partner platform:

1. **Client Dashboard** — one per contractor, they log in themselves, see only their data
2. **Admin Dashboard** — you + your partner only, see all clients, agent health, API spend, errors

This is not a SaaS product. It's a managed service deliverable. Each client has a contracted feature set (Tier 1 / Tier 2 / Tier 3) and the dashboard reflects exactly what they've activated. Greyed "Ask about activating" cards represent features available via a tier upgrade conversation — not software plan upgrades.

---

## Architecture

**FastAPI Gateway (chosen)**

All dashboard reads and writes go through FastAPI. The frontend never touches Airtable directly. FastAPI validates the Supabase JWT on every request and maps the authenticated user to their `airtable_base_id` before querying.

```
Browser → Supabase Auth → JWT
Browser → FastAPI (JWT validated → maps to client's airtable_base_id) → Airtable → response
Browser → FastAPI (POST /approve or /skip) → Airtable update + n8n webhook
```

**Why this survives Phase 2:** When data migrates from Airtable to Supabase, only FastAPI changes what it queries. Dashboard code is unchanged.

### Services

| Service | Role | Hosting |
|---|---|---|
| Next.js | Client + Admin dashboard UI | Vercel |
| FastAPI | Auth enforcement, data gateway, approval writes | Railway |
| Supabase | Auth (email + password), `users` + `clients` tables | Supabase |
| Airtable | Phase 1 data store (Leads, Actions, Waitlist) | Airtable |

---

## Supabase Schema (Phase 1 — auth + client mapping only)

These tables must be created in Supabase. Data stays in Airtable in Phase 1 — Supabase is auth-only.

```sql
-- User accounts (Supabase Auth handles password hashing)
create table users (
  id uuid primary key references auth.users(id),
  email text not null,
  role text not null check (role in ('client', 'admin')),
  first_name text,
  created_at timestamptz default now()
);

-- RLS: users can only read their own row
alter table users enable row level security;
create policy "users_own_row" on users
  for select using (auth.uid() = id);

-- Maps each client user to their Airtable base
create table clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id),
  name text not null,
  airtable_base_id text not null,
  tier int not null check (tier in (1, 2, 3)),
  retainer_amount int not null default 1500,  -- monthly $ for ROI card
  active bool not null default true,
  created_at timestamptz default now()
);

-- RLS: clients can only read their own row; admins read all
alter table clients enable row level security;
create policy "clients_own_row" on clients
  for select using (
    auth.uid() = user_id
    or exists (
      select 1 from users where id = auth.uid() and role = 'admin'
    )
  );
```

> Note: FastAPI is the primary enforcement layer. RLS is a defense-in-depth backup in case of FastAPI bugs. Both layers must be in place per the success criteria "Contractor sees only their data."

---

## Airtable Field Names

FastAPI reads these exact field names from Airtable. **All field names are case-sensitive.**

### Actions Table (primary dashboard source)

| Field | Type | Notes |
|---|---|---|
| `action_id` | text | Primary key |
| `timestamp` | datetime | ISO 8601, when action occurred |
| `action_type` | text | enum: `sms_sent`, `lead_created`, `human_review`, `human_approved`, `human_skipped`, `sms_failed`, `missed_call_recovery` |
| `description` | text | One-line human-readable detail |
| `agent_name` | text | enum: `after_hours_capture`, `missed_call_recovery`, `system` |
| `revenue_impact` | number | Dollar value of this action (0 if no direct revenue) |
| `confidence_score` | number | 0.0–1.0, Claude's confidence |
| `response_time_ms` | number | Milliseconds from trigger to SMS sent (null if no SMS) |
| `success` | boolean | true = completed, false = error |
| `error_message` | text | Populated on failure |
| `cost_usd` | number | Pre-computed Claude API cost in USD, written by FastAPI at call time |
| `status` | text | enum: `auto_executed`, `awaiting_customer`, `jobber_synced`, `human_review`, `human_approved`, `human_skipped`, `failed` |
| `lead_id` | link | Link to Leads table record |

### Leads Table

| Field | Type | Notes |
|---|---|---|
| `lead_id` | text | Primary key |
| `phone` | text | E.164 format (+1...) |
| `message` | text | Original customer message |
| `urgency_score` | number | 1–10 |
| `service_type` | text | e.g., `emergency_ac`, `maintenance` |
| `status` | text | enum: `new`, `awaiting_confirmation`, `confirmed`, `dispatched`, `completed`, `cancelled` |
| `source` | text | enum: `after_hours_sms`, `missed_call`, `web_form` |
| `created_at` | datetime | ISO 8601 |

---

## Dot Color → Status Mapping

| Dot color | `status` field value(s) | Chip label |
|---|---|---|
| Green (#4ADE80) | `auto_executed`, `human_approved` | "Auto-executed · X% confident" |
| Amber (#F5A623) | `awaiting_customer` | "Waiting on customer" |
| Blue (#60a5fa) | `jobber_synced` | "Jobber updated" |
| Gray (#3d5068) | `human_skipped` | "Skipped" |
| Red (#E8756A) | `failed` | "Error" |
| — (never rendered) | `human_review` | Not shown in feed — these records are excluded from `GET /dashboard/actions` and appear only in the approval inbox |

---

## Confidence Threshold Logic

| Score range | Behavior |
|---|---|
| `>= 0.85` | Auto-execute — SMS sent, action logged as `auto_executed` |
| `>= 0.60 AND < 0.85` | Hold for human — logged as `human_review`, surfaces in approval inbox |
| `< 0.60` | Ask customer clarifying question — separate flow, not in dashboard inbox |

---

## FastAPI Routes

### Client dashboard reads (scoped by JWT → `airtable_base_id`)

**`GET /dashboard/actions?limit=50`**
- Returns last 50 Actions table records sorted by `timestamp` DESC
- Filters: all `status` values except `human_review` (those go to inbox)
- Response: `[{ action_id, timestamp, action_type, description, agent_name, revenue_impact, confidence_score, status, success }]`

**`GET /dashboard/metrics`**
- `revenue_mtd`: sum of `revenue_impact` in Actions table where `timestamp >= first day of current UTC month`
- `leads_captured`: count of records in Leads table where `created_at >= first day of current UTC month`
- `avg_response_ms`: mean of `response_time_ms` in Actions table where value is not null, same month filter
- `retainer_amount`: read from Supabase `clients.retainer_amount` for this user
- All date filters use **UTC midnight** as the day boundary
- Response: `{ revenue_mtd, leads_captured, avg_response_ms, retainer_amount }`

**`GET /dashboard/inbox`**
- Returns Actions where `status = 'human_review'`, sorted by `timestamp` DESC
- Response: `[{ action_id, timestamp, action_type, description, revenue_impact, confidence_score }]`

### Client dashboard writes

**`POST /dashboard/approve`**
- Body: `{ action_id: string }`
- FastAPI steps:
  1. Validate JWT, confirm `action_id` belongs to this client's base
  2. Update Airtable Actions record: `status → human_approved`
  3. POST to n8n webhook: `POST {N8N_BASE_URL}/webhook/action-approved` with body `{ action_id, airtable_base_id, action_type }`
  4. n8n executes the held action (sends SMS, creates job, etc.)
  5. Return `{ success: true }`
- Error: if Airtable update succeeds but n8n returns non-200, log error to Actions table and return `{ success: false, error: "n8n trigger failed" }` — do not rollback Airtable (idempotent retry is handled in n8n)

**`POST /dashboard/skip`**
- Body: `{ action_id: string }`
- FastAPI steps:
  1. Validate JWT, confirm ownership
  2. Update Airtable Actions record: `status → human_skipped`
  3. Return `{ success: true }`
- No n8n trigger needed
- If `action_id` not found in client's base: return `404 { error: "action not found" }`

**Error responses (both approve and skip)**
- `401` — invalid or expired JWT
- `403` — action belongs to a different client
- `404` — action_id not found in this client's Airtable base
- `500` — Airtable write failed (with `{ error: string }`)

### Admin routes (admin JWT only — return 403 for non-admin)

**`GET /admin/clients`**
- Reads all active records from Supabase `clients` table
- For each client, queries their Airtable base for:
  - `actions_today`: count of Actions where `timestamp >= UTC midnight today`
  - `last_activity`: `MAX(timestamp)` across all Actions records for that base (live Airtable query, not a stored field)
  - `spend_today_usd`: sum of `cost_usd` where `timestamp >= UTC midnight today`
  - `revenue_mtd`: sum of `revenue_impact` where `timestamp >= UTC month start`
  - `alert`: `true` if any Actions record has `success = false` in last 24 hours
- All date comparisons use **UTC**
- Response: `[{ client_id, name, tier, airtable_base_id, actions_today, last_activity, spend_today_usd, revenue_mtd, alert: bool }]`

**`GET /admin/feed?limit=100`**
- Queries Actions table across ALL client bases (loop, parallel requests)
- Merges and sorts by `timestamp` DESC, returns top 100
- Each record includes `client_name` field injected by FastAPI
- Response: same as `/dashboard/actions` + `client_name` field

**`GET /admin/spend`**
- Aggregates `cost_usd` from Actions table per client base for today (UTC) and MTD (UTC)
- Response: `[{ client_name, spend_today_usd, spend_mtd_usd }]`
- Note: `cost_usd` is pre-computed by FastAPI at Claude API call time using: `(input_tokens × 0.000003) + (output_tokens × 0.000015)`. FastAPI has access to separate input/output counts from the Anthropic API response object before writing to Airtable. The Airtable field stores the final dollar amount — no conversion needed at query time.

**`GET /admin/errors`**
- Queries Actions where `success = false` across all client bases
- Filters to last 72 hours
- Response: `[{ client_name, action_id, timestamp, error_message, action_type }]`

**`GET /admin/clients/:client_id`**
- Admin-only route that returns the full dashboard data for a specific client
- Same data as `/dashboard/actions` + `/dashboard/metrics` + `/dashboard/inbox`
- Used by the "View →" button in the admin client table — renders the client's dashboard in a read-only admin view at `/admin/clients/:client_id`
- Admin does NOT impersonate the client — they use their own admin JWT with this scoped route

---

## Client Dashboard — Sections

**Reference design:** `updated-files/aiops_dashboard_clean.html`

> Note: The reference HTML shows Tier 2 features (cancellations, invoice reminders, review requests) as active green items. **Those are demo-state only.** Tier 1 clients will show only after-hours capture and missed call recovery as live. All other action types render as greyed "Ask about activating" cards in the metrics sidebar.

### Top bar
- AIops logo, contractor first name, live dot, today's date
- **Live dot states:** green (pulsing) = polling active; amber = 2 consecutive poll failures; red = 5+ consecutive failures or JWT expired

### Greeting
- "Good morning / afternoon / evening, [first_name] 👋" (time-based)
- "Your AI ran X actions [since midnight today / while you slept (if morning)]."
- X = count of all Actions records where `timestamp >= today 00:00 local`

### ROI card
- Big number: sum of `revenue_impact` for current calendar month
- "Your retainer is $[retainer_amount] — you're up $[revenue_mtd - retainer_amount] net this month"
- Right stats: leads_captured (count from metrics), avg response time in seconds (`avg_response_ms / 1000`)
- **Phase 1 only:** "Slots filled" stat is hidden (not rendered)

### Approval inbox
- Only renders if `GET /dashboard/inbox` returns 1+ records
- Each card: action description, dollar value, confidence % (formatted as "71% confident")
- **Approve:** calls `POST /dashboard/approve`, removes card from inbox on success
- **Skip:** calls `POST /dashboard/skip`, removes card from inbox on success
- Empty state (when no pending items): section is fully hidden, not shown as empty

### Action feed
- Polls `GET /dashboard/actions` every 10 seconds
- Renders newest first, last 50 records
- Each row: dot (color per status mapping above) + action name + "X min ago" + description + chip

### Metrics sidebar
- Rendered dynamically based on client `tier` from Supabase
- **Tier 1 live cards:** Emergency leads recovered, Missed calls recovered
- **Tier 2 greyed cards:** Cancellations filled, Invoice reminders — each shows:
  - Feature name
  - Teaser: "Recover ~$700/mo from open schedule slots"
  - "Ask about activating" label (static text, no link in Phase 1)
- **Tier 3 greyed cards:** (none in Phase 1 scope)

### Mobile (fully responsive)
- Approval inbox: full-width stacked cards, min tap target 44px
- ROI card: stacks vertically (revenue on top, stats below)
- Two-column layout collapses to single column: feed on top, metrics sidebar below
- All Approve / Skip interactions work on iPhone

---

## Admin Dashboard — Sections

**Reference design:** `updated-files/aiops_admin_dashboard.html`

### Summary strip
5 stat cards reading from `GET /admin/clients` and `GET /admin/spend`:
- Active clients (count of `clients.active = true`)
- Actions today (sum across all clients)
- Claude spend today (sum of `spend_today_usd`)
- Revenue MTD (sum of all client `revenue_mtd`)
- Open alerts (count of clients where `alert = true` + count of open errors)

### Client health table
- Data from `GET /admin/clients`
- Status dot logic: green if `last_activity < 30 min ago`, amber if `30 min–4 hrs`, red if `> 4 hrs`
- "View →" navigates to `/admin/clients/:client_id` (admin-scoped read-only view)
- "⚠ Check / Fix" button: links to `/admin/errors` filtered to that client (Phase 1: just navigates to error log)
- Tier badges: Tier 1 = green chip, Tier 2 = blue chip, Tier 3 = purple chip

### Live feed — all clients
- Polls `GET /admin/feed` every **30 seconds** (less frequent than client 10s to reduce Airtable load)
- Each row same as client feed + `client_name` chip

### Claude spend by client
- Data from `GET /admin/spend`
- Bar width = proportional to that client's share of total spend today
- MTD total shown at bottom
- Each client gets a distinct color (assigned in order: amber, blue, coral, green, purple...)

### Error log
- Data from `GET /admin/errors`
- Open errors only (last 72 hours where `success = false`)
- Each row: error title, description, time ago, client name

---

## Auth Flow

1. User visits `/login` → Supabase Auth UI (email + password)
2. Supabase returns JWT with custom claim `role` (`client` or `admin`)
3. Next.js stores session via Supabase client SDK, sends JWT as `Authorization: Bearer` header on all FastAPI calls
4. FastAPI middleware validates JWT signature on every request
5. For client JWT: reads `clients` table in Supabase to get `airtable_base_id` → scopes all Airtable queries to that base
6. For admin JWT: bypasses base scoping, has access to all `/admin/*` routes
7. Next.js middleware: unauthenticated → redirect to `/login`; non-admin on `/admin/*` → redirect to `/dashboard`

---

## Routes (Next.js)

| Route | Auth | Description |
|---|---|---|
| `/login` | Public | Supabase Auth login page |
| `/dashboard` | Client or Admin | Client's Mission Control |
| `/admin` | Admin only | All-client ops view |
| `/admin/clients/:id` | Admin only | Read-only view of one client's dashboard |

---

## Environment Variables

### FastAPI (Railway)
```
ANTHROPIC_API_KEY=sk-ant-...
AIRTABLE_API_KEY=pat...
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...       # server-side only, never in frontend
N8N_BASE_URL=https://your.n8n.cloud # base URL for n8n webhook triggers
N8N_WEBHOOK_SECRET=...              # shared secret for n8n webhook auth (optional but recommended)
```

### Next.js (Vercel)
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...   # public anon key for Supabase Auth client
NEXT_PUBLIC_API_URL=https://your-fastapi.railway.app
```

---

## What's NOT in This Spec

- Supabase data migration (Phase 2 — Airtable is the source of truth for Phase 1)
- Historical data export / reporting
- Multi-permission admin roles (both admins have full access)
- Email notifications from dashboard (handled by n8n workflows)
- Jobber deep-link integration (Phase 2)
- Dashboard onboarding flow for new clients (Phase 2)

---

## Design References

- Client dashboard: `updated-files/aiops_dashboard_clean.html`
- Admin dashboard: `updated-files/aiops_admin_dashboard.html`
- Color palette: `#0d1221` (bg), `#F5A623` (amber), `#4ADE80` (green), `#E8756A` (coral), `#60a5fa` (blue)
- Font: system-ui / -apple-system

---

## Success Criteria

- [ ] Contractor logs in → sees only their data, never another client's
- [ ] Approval inbox shows held actions (`0.60 <= confidence < 0.85`) → contractor approves/skips from iPhone
- [ ] Approved action triggers n8n within 2 seconds of tap
- [ ] Action feed updates within 10s of a new Action record appearing in Airtable
- [ ] Admin sees all clients in health table with correct status dots
- [ ] Admin "View →" loads a specific client's full dashboard data
- [ ] Claude spend is visible per client in admin with today + MTD breakdown
- [ ] Errors from the last 72 hours surface in admin error log
- [ ] Mobile: approve/skip tap targets are accessible on iPhone without zooming
