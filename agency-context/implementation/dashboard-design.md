# Dashboard Design Spec — AIops Mission Control
**Date:** 2026-03-15
**Status:** Approved — ready for implementation planning
**Updated:** 2026-03-15 — Architecture updated: Supabase replaces Airtable, Next.js API routes replace FastAPI

---

## What We're Building

Two dashboards for the AIops HVAC implementation partner platform:

1. **Client Dashboard** — one per contractor, they log in themselves, see only their data
2. **Admin Dashboard** — you + your partner only, see all clients, agent health, API spend, errors

This is not a SaaS product. It's a managed service deliverable. Each client has a contracted feature set (Tier 1 / Tier 2 / Tier 3) and the dashboard reflects exactly what they've activated. Greyed "Ask about activating" cards represent features available via a tier upgrade conversation — not software plan upgrades.

---

## Architecture

**Next.js API Routes (no separate backend)**

All dashboard reads and writes go through Next.js API routes (`/api/*`). The frontend never reads Supabase directly (except for auth state). API routes validate the Supabase JWT on every request and scope queries to the authenticated user's `client_id`.

```
Browser → Supabase Auth → JWT stored in cookie
Browser → /api/dashboard/actions (JWT validated server-side) → Supabase → response
Browser → /api/dashboard/approve → Supabase update + n8n webhook trigger
```

### Services

| Service | Role | Hosting |
|---|---|---|
| Next.js | Client + Admin dashboard UI + API routes | Vercel |
| Supabase | Auth (email + password), all data tables | Supabase |
| n8n | Workflow execution (triggered by API routes on approval) | n8n Cloud |

---

## Supabase Schema

All data lives in Supabase. No external data stores.

```sql
-- User accounts (Supabase Auth handles password hashing)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('client', 'admin')),
  first_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: users can only read their own row
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_row" ON users
  FOR SELECT USING (auth.uid() = id);

-- Maps each client user to their contractor profile
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  tier INT NOT NULL CHECK (tier IN (1, 2, 3)),
  retainer_amount INT NOT NULL DEFAULT 1500,
  crm_type TEXT DEFAULT 'jobber',       -- 'jobber' | 'servicetitan' | 'housecallpro'
  signalwire_number TEXT,               -- assigned SignalWire phone number
  active BOOL NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: clients can only read their own row; admins read all
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "clients_own_row" ON clients
  FOR SELECT USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- All AI actions taken (primary dashboard source)
CREATE TABLE actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id),
  action_type TEXT NOT NULL,  -- 'sms_sent' | 'lead_created' | 'human_review' | 'human_approved' | 'human_skipped' | 'sms_failed' | 'missed_call_recovery'
  description TEXT,
  agent_name TEXT,            -- 'after_hours_capture' | 'missed_call_recovery' | 'system'
  revenue_impact NUMERIC NOT NULL DEFAULT 0,
  confidence_score NUMERIC,   -- 0.0–1.0
  response_time_ms INTEGER,   -- ms from trigger to SMS sent
  cost_usd NUMERIC DEFAULT 0, -- Claude API cost: (input_tokens × 0.000003) + (output_tokens × 0.000015)
  status TEXT NOT NULL DEFAULT 'auto_executed',  -- 'auto_executed' | 'awaiting_customer' | 'jobber_synced' | 'human_review' | 'human_approved' | 'human_skipped' | 'failed'
  success BOOL NOT NULL DEFAULT TRUE,
  error_message TEXT,
  lead_id UUID REFERENCES leads(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: clients see only their actions; admins see all
ALTER TABLE actions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "actions_client_scoped" ON actions
  FOR ALL USING (
    client_id IN (SELECT id FROM clients WHERE user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- All captured leads
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id),
  phone TEXT NOT NULL,
  message TEXT,
  urgency_score INTEGER,      -- 1–10
  service_type TEXT,
  status TEXT DEFAULT 'new',  -- 'new' | 'awaiting_confirmation' | 'confirmed' | 'dispatched' | 'completed' | 'cancelled'
  source TEXT,                -- 'after_hours_sms' | 'missed_call' | 'web_form'
  conversation_id UUID,
  thread_history JSONB DEFAULT '[]',
  revenue_impact NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: same client scoping as actions
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "leads_client_scoped" ON leads
  FOR ALL USING (
    client_id IN (SELECT id FROM clients WHERE user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );
```

---

## Dot Color → Status Mapping

| Dot color | `status` field value(s) | Chip label |
|---|---|---|
| Green (#4ADE80) | `auto_executed`, `human_approved` | "Auto-executed · X% confident" |
| Amber (#F5A623) | `awaiting_customer` | "Waiting on customer" |
| Blue (#60a5fa) | `jobber_synced` | "Jobber updated" |
| Gray (#3d5068) | `human_skipped` | "Skipped" |
| Red (#E8756A) | `failed` | "Error" |
| — (never rendered) | `human_review` | Not shown in feed — appears only in approval inbox |

---

## Confidence Threshold Logic

| Score range | Behavior |
|---|---|
| `>= 0.85` | Auto-execute — SMS sent, action logged as `auto_executed` |
| `>= 0.60 AND < 0.85` | Hold for human — logged as `human_review`, surfaces in approval inbox |
| `< 0.60` | Ask customer clarifying question — separate flow, not in dashboard inbox |

---

## Next.js API Routes (`/api/*`)

All routes use Supabase service role key (server-side only). JWT validated via `createServerClient` from `@supabase/ssr`.

### Client dashboard reads (scoped by JWT → `client_id`)

**`GET /api/dashboard/actions?limit=50`**
- Returns last 50 actions for authenticated client, sorted by `created_at` DESC
- Filters: all `status` values except `human_review` (those go to inbox)
- Response: `[{ id, created_at, action_type, description, agent_name, revenue_impact, confidence_score, status, success }]`

**`GET /api/dashboard/metrics`**
- `revenue_mtd`: `SUM(revenue_impact)` where `created_at >= first day of current UTC month`
- `leads_captured`: `COUNT(*)` from leads where `created_at >= first day of current UTC month`
- `avg_response_ms`: `AVG(response_time_ms)` from actions where not null, same month filter
- `retainer_amount`: from `clients.retainer_amount` for authenticated user
- Response: `{ revenue_mtd, leads_captured, avg_response_ms, retainer_amount }`

**`GET /api/dashboard/inbox`**
- Returns actions where `status = 'human_review'` for this client, sorted by `created_at` DESC
- Response: `[{ id, created_at, action_type, description, revenue_impact, confidence_score }]`

### Client dashboard writes

**`POST /api/dashboard/approve`**
- Body: `{ action_id: string }`
- Steps:
  1. Validate JWT, confirm `action_id` belongs to authenticated client
  2. Supabase UPDATE: `status → 'human_approved'`
  3. POST to n8n webhook: `{ action_id, client_id, action_type }`
  4. n8n executes the held action (sends SMS, creates job, etc.)
  5. Return `{ success: true }`
- Error: if Supabase update succeeds but n8n returns non-200, return `{ success: false, error: "n8n trigger failed" }` — do not rollback (n8n handles idempotent retry)

**`POST /api/dashboard/skip`**
- Body: `{ action_id: string }`
- Steps:
  1. Validate JWT, confirm ownership
  2. Supabase UPDATE: `status → 'human_skipped'`
  3. Return `{ success: true }`
- No n8n trigger needed

**Error responses (both approve and skip)**
- `401` — invalid or expired JWT
- `403` — action belongs to a different client
- `404` — action_id not found for this client
- `500` — Supabase write failed

### Admin routes (admin role required — return 403 for non-admin)

**`GET /api/admin/clients`**
- Reads all active records from Supabase `clients` table with aggregated stats
- For each client:
  - `actions_today`: `COUNT(*)` from actions where `created_at >= UTC midnight today`
  - `last_activity`: `MAX(created_at)` from actions for this client
  - `spend_today_usd`: `SUM(cost_usd)` where `created_at >= UTC midnight today`
  - `revenue_mtd`: `SUM(revenue_impact)` where `created_at >= first of month`
  - `alert`: `true` if any action has `success = false` in last 24 hours
- Response: `[{ client_id, name, tier, actions_today, last_activity, spend_today_usd, revenue_mtd, alert }]`

**`GET /api/admin/feed?limit=100`**
- Returns last 100 actions across ALL clients, sorted by `created_at` DESC
- Each record includes `client_name` (joined from `clients`)
- Response: same as `/api/dashboard/actions` + `client_name` field

**`GET /api/admin/spend`**
- Aggregates `cost_usd` per client for today and MTD
- `cost_usd` is written by n8n at call time: `(input_tokens × 0.000003) + (output_tokens × 0.000015)`
- Response: `[{ client_name, spend_today_usd, spend_mtd_usd }]`

**`GET /api/admin/errors`**
- Returns actions where `success = false` across all clients, last 72 hours
- Response: `[{ client_name, id, created_at, error_message, action_type }]`

**`GET /api/admin/clients/:client_id`**
- Admin-only route returning full dashboard data for a specific client
- Same data as `/api/dashboard/actions` + `/api/dashboard/metrics` + `/api/dashboard/inbox`
- Used by "View →" in admin table — renders client's dashboard at `/admin/clients/:client_id`
- Admin uses their own JWT with this scoped route (no impersonation)

---

## Client Dashboard — Sections

**Reference design:** `updated-files/aiops_dashboard_clean.html`

> Note: The reference HTML shows Tier 2 features as active. **Those are demo-state only.** Tier 1 clients show only after-hours capture and missed call recovery as live. All other action types render as greyed "Ask about activating" cards.

### Top bar
- AIops logo, contractor first name, live dot, today's date
- **Live dot states:** green (pulsing) = polling active; amber = 2 consecutive poll failures; red = 5+ failures or JWT expired

### Greeting
- "Good morning / afternoon / evening, [first_name]"
- "Your AI ran X actions [since midnight today / while you slept (if morning)]."
- X = count of actions where `created_at >= today 00:00 local`

### ROI card
- Big number: `revenue_mtd` from metrics
- "Your retainer is $[retainer_amount] — you're up $[revenue_mtd - retainer_amount] net this month"
- Right stats: `leads_captured`, avg response time in seconds (`avg_response_ms / 1000`)
- **Phase 1 only:** "Slots filled" stat is hidden (not rendered)

### Approval inbox
- Only renders if `/api/dashboard/inbox` returns 1+ records
- Each card: action description, dollar value, confidence % (formatted as "71% confident")
- **Approve:** calls `/api/dashboard/approve`, removes card from inbox on success
- **Skip:** calls `/api/dashboard/skip`, removes card from inbox on success
- Empty state: section is fully hidden

### Action feed
- Polls `/api/dashboard/actions` every 10 seconds
- Renders newest first, last 50 records
- Each row: dot (color per status mapping) + action name + "X min ago" + description + chip

### Metrics sidebar
- Rendered dynamically based on `clients.tier` from Supabase
- **Tier 1 live cards:** Emergency leads recovered, Missed calls recovered
- **Tier 2 greyed cards:** Cancellations filled, Invoice reminders
  - Shows teaser: "Recover ~$700/mo from open schedule slots"
  - "Ask about activating" label (static text, no link in Phase 1)
- **Tier 3 greyed cards:** (none in Phase 1 scope)

### Mobile (fully responsive)
- Approval inbox: full-width stacked cards, min tap target 44px
- ROI card: stacks vertically (revenue on top, stats below)
- Two-column layout collapses to single column: feed on top, metrics sidebar below

---

## Admin Dashboard — Sections

**Reference design:** `updated-files/aiops_admin_dashboard.html`

### Summary strip
5 stat cards from `/api/admin/clients` and `/api/admin/spend`:
- Active clients (count where `active = true`)
- Actions today (sum across all clients)
- Claude spend today (sum of `spend_today_usd`)
- Revenue MTD (sum of all client `revenue_mtd`)
- Open alerts (count of clients where `alert = true`)

### Client health table
- Data from `/api/admin/clients`
- Status dot: green if `last_activity < 30 min ago`, amber if `30 min–4 hrs`, red if `> 4 hrs`
- "View →" navigates to `/admin/clients/:client_id`
- Tier badges: Tier 1 = green chip, Tier 2 = blue chip, Tier 3 = purple chip

### Live feed — all clients
- Polls `/api/admin/feed` every 30 seconds
- Each row same as client feed + `client_name` chip

### Claude spend by client
- Data from `/api/admin/spend`
- Bar width = proportional to client's share of total spend today
- Each client gets a distinct color

### Error log
- Data from `/api/admin/errors`
- Open errors from last 72 hours where `success = false`
- Each row: error title, description, time ago, client name

---

## Auth Flow

1. User visits `/login` → Supabase Auth UI (email + password)
2. Supabase returns JWT + sets cookie via `@supabase/ssr`
3. Next.js middleware reads cookie on every request
4. API routes use `createServerClient` with service role key → validate JWT, read `users.role`
5. For client: queries `clients` table by `user_id` → scopes all queries by `client_id`
6. For admin: bypasses client scoping, has access to all `/api/admin/*` routes
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

### Next.js (Vercel)
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...     # public anon key for Supabase Auth client
SUPABASE_SERVICE_ROLE_KEY=...         # server-side only (API routes), never exposed to browser
ANTHROPIC_API_KEY=sk-ant-...          # used in API routes for any server-side Claude calls
N8N_BASE_URL=https://your.n8n.cloud   # base URL for n8n webhook triggers from approval actions
N8N_WEBHOOK_SECRET=...                # shared secret for n8n webhook auth (optional but recommended)
```

---

## What's NOT in This Spec

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
- [ ] Action feed updates within 10s of a new action appearing in Supabase
- [ ] Admin sees all clients in health table with correct status dots
- [ ] Admin "View →" loads a specific client's full dashboard data
- [ ] Claude spend is visible per client in admin with today + MTD breakdown
- [ ] Errors from the last 72 hours surface in admin error log
- [ ] Mobile: approve/skip tap targets are accessible on iPhone without zooming
