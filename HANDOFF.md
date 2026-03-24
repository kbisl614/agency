# HANDOFF — Fieldline AI
# Last updated: 2026-03-22
# For full strategic context (pricing, tiers, architecture, OpenClaw): see handoff-agency-changes.md

---

## What This Is

Fieldline AI — productized AI ops agency for HVAC contractors. You build and operate everything.
Contractors pay a monthly retainer and never configure anything. Dashboard is read-and-approve only.
Target user: 40-60 year old HVAC contractor checking from his phone between jobs.

**Tiers:** Foundation $1,500/mo · Partner $2,500/mo · Full Partner $4,500/mo
**Guarantee:** 5 recovered leads in 30 days or second month free
**Stack:** Next.js 14 (Vercel) · Supabase · n8n Cloud · SignalWire (SMS) · Open Sans font (local, no CDN)
**Supabase:** `cdofgroinizevjxyzvnn.supabase.co`
**n8n:** `krn8n9394.app.n8n.cloud`
**Production:** `hvac-agency.vercel.app` (Vercel project: `hvac-agency`, team: `kbisl614s-projects`)
**Repo branch:** `feature/dashboard-components` — built and reviewed, not yet merged to main

---

## What Was Just Built (This Session)

### Client Dashboard (`/dashboard`)
Full read-and-approve contractor dashboard, built to spec from `DASHBOARD_BUILD_PROMPT.md`.
Visual reference: `/Users/karsynregennitter/Downloads/fieldline_mockup_B7_expandable_feed.html`

**Middleware** (`middleware.ts`)
- `@supabase/ssr` `createServerClient` with dual-cookie update pattern
- Redirects unauthenticated users → `/login` for `/dashboard/:path*` and `/admin/:path*`

**API Routes** (all in `app/api/dashboard/`)
- `metrics` — revenue MTD, leads recovered, avg response time, actions today
- `inbox` — actions with `status = 'human_review'`, ordered newest first
- `approve` — updates Supabase to `human_approved`/`human_skipped`, fires n8n webhook best-effort
- `actions` — tabbed feed: `needs_attention` (awaiting_customer, failed) / `completed` (auto_executed, human_approved, human_skipped, jobber_synced)

**Components** (`app/dashboard/components/`)
- `NavBar` — orange F logo, "All agents active" pulsing dot (static Phase 1), company name, sign out
- `Greeting` — time-of-day (Good morning/afternoon/evening/You're up late), contractor first name
- `ApprovalInbox` — approve/skip buttons (44px min tap targets), 400ms fade on decision, ··· expand
  for >3 items, always renders (empty state shows ✓ "You're all caught up"), 10s polling
- `StatsRow` — revenue count-up animation (requestAnimationFrame, ease-out cubic, fires once),
  "Last updated X min ago" refreshes every 30s, day-1 empty state, flex wrap for mobile
- `ActionFeed` — Needs attention tab (default) + Completed today, 10s polling, fade-in for new rows,
  ··· expand (3 default for attention, 5 for completed), dot colors by status

**Design constraints (enforce these)**
- Inline CSS only — zero Tailwind class names in any `app/dashboard/` file
- Open Sans loaded via `@font-face` in `globals.css` from `/public/fonts/`
- `@import "tailwindcss"` must be FIRST line in `globals.css` — before any `@font-face`
- Color tokens: page `#0f1923`, card `#111e2e`, orange `#e8934a`, green `#4ade80`, text `#e8ddd0`

### Supporting changes
- `first_name` added to `clients` table (Supabase migration already run via SQL editor)
- `first_name` field added to admin onboard form (`/admin/onboard`) and API route
- All 8 Vercel env vars confirmed set across all environments
- Code reviewed (5 bugs fixed: middleware missing from disk, orphaned clients rollback, silent approve
  failure recovery, duplicate polling loops, wrong "Yesterday" timestamp label)
- Lint clean — zero errors in dashboard files

---

## Environment Variables
All set in Vercel. Local `.env.local` has all values filled except:
- `N8N_WEBHOOK_SECRET` — placeholder value. Must match the Header Auth credential value in n8n.
  Generate with `openssl rand -hex 32`, update `.env.local`, update Vercel, confirm n8n credential.

```
SUPABASE_PROJECT_URL / NEXT_PUBLIC_SUPABASE_URL  → same value (server + client aliases)
SUPABASE_ANON_KEY / NEXT_PUBLIC_SUPABASE_ANON_KEY → same value
SUPABASE_SERVICE_ROLE_KEY                         → sb_secret_... (new Supabase key format)
N8N_WEBHOOK_BASE_URL                              → has trailing slash — code strips it
N8N_WEBHOOK_SECRET                                → must match n8n Header Auth credential
NEXT_PUBLIC_SITE_URL                              → https://hvac-agency.vercel.app (production)
```

---

## Immediate Next Task — n8n Approve Workflow

When a contractor taps "Yes, do it", `/api/dashboard/approve` POSTs to
`{N8N_WEBHOOK_BASE_URL}/webhook/approve` with `{ action_id, decision, contractor_id }`.
**No workflow exists at that endpoint yet.**

### Step 1 — Add `payload` column to `actions` (run in Supabase SQL editor)
The workflow needs execution context. Without it, there's nothing to act on.
```sql
ALTER TABLE actions ADD COLUMN IF NOT EXISTS payload JSONB;
```
Payload shape written by tier1 workflows on `human_review` actions:
```json
{ "to": "+15551234567", "message": "Hi Mike, following up on your missed call..." }
```

### Step 2 — Build approve workflow in n8n
1. Webhook trigger at `/webhook/approve` — Header Auth (existing credential = `N8N_WEBHOOK_SECRET`)
2. If `decision = skipped` → end (Supabase already updated before webhook fires)
3. Supabase node — fetch action by `action_id`, get `action_type` + `payload`
4. Switch on `action_type`:
   - `missed_call_recovery` / `after_hours_lead` → SignalWire SMS (`payload.to` + `payload.message`)
   - anything else → Telegram notification to Karsyn
5. Telegram confirmation on success

### Also: tier1 workflows need to be rebuilt
IDs in memory (`WN1y1bxcoclgF5EF`, `DvkqrNoPZ4BbMFb2`) returned "not found" in n8n.
Workflows don't exist in this account. Rebuild from scratch — must write `payload` to the
`actions` row when creating `human_review` actions so the approve workflow can execute.

**Open question for Karsyn before building:** Phase 1 SMS sends only, or also scheduling/proposals?

---

## Existing n8n Credentials
| Credential | ID | Status |
|---|---|---|
| Gmail | `uWYzlK7ftArlL8zw` | Active |
| Telegram | `OjlxZCBapUKW4KEu` | Active |
| Header Auth (webhook secret) | 2 copies, same value | Active — reuse for approve webhook |
| Supabase | not yet created | Needed for approve workflow |
| SignalWire | not yet created | Needed for SMS execution |

---

## Go-Live Checklist
- [ ] Merge `feature/dashboard-components` → main and deploy to Vercel
- [ ] Verify `actions` table exists in Supabase with correct schema
- [ ] Run `payload JSONB` migration on `actions`
- [ ] Confirm `N8N_WEBHOOK_SECRET` in Vercel matches n8n Header Auth credential value
- [ ] Rebuild tier1 n8n workflows (after_hours_lead_capture, missed_call_recovery_sms)
- [ ] Build n8n approve workflow
- [ ] Create Supabase + SignalWire credentials in n8n
- [ ] Create test contractor account + seed action rows → smoke-test login → approve → n8n fires
- [ ] Supabase RLS policies (`supabaseAdmin` bypasses RLS so not day-1 blocking, but needed)

---

## Key Rules (Don't Break These)
- **n8n is multi-tenant** — one workflow for ALL contractors, never duplicate per client.
  Lookup contractor config from Supabase by SignalWire TO number at runtime.
- **Inline CSS only** in all `app/dashboard/` files — no Tailwind class names, ever
- **`N8N_WEBHOOK_BASE_URL`** has trailing slash in `.env.local` — strip with `.replace(/\/$/, "")`
- **`supabaseAdmin`** (service role) for all server-side queries — bypasses RLS, scope by `contractor_id`
- **`@supabase/ssr`** for auth — NOT deprecated `@supabase/auth-helpers-nextjs`
- **Approve route** updates Supabase FIRST, then fires webhook best-effort — never block UI on n8n
- **`@import "tailwindcss"`** must be first line of `globals.css` — CSS spec requires imports first
