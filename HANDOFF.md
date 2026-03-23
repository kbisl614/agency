# HANDOFF — Fieldline AI
# Last updated: 2026-03-22
# For full strategic context (pricing, tiers, architecture, OpenClaw): see handoff-agency-changes.md

---

## What This Is

Fieldline AI — productized AI ops agency for HVAC contractors. You build and operate everything.
Contractors pay a monthly retainer and never configure anything. Dashboard is read-and-approve only.

**Tiers:** Foundation $1,500/mo · Partner $2,500/mo · Full Partner $4,500/mo
**Stack:** Next.js 14 (Vercel) · Supabase · n8n Cloud · SignalWire (SMS)
**Supabase:** `cdofgroinizevjxyzvnn.supabase.co`
**n8n:** `krn8n9394.app.n8n.cloud`
**Production:** `hvac-agency.vercel.app`
**Repo branch:** `feature/dashboard-components` — not yet merged to main

---

## What Was Just Built (This Session)

### Client Dashboard (`/dashboard`)
Full read-and-approve contractor dashboard, built to spec from `DASHBOARD_BUILD_PROMPT.md`:

- **Middleware** — `@supabase/ssr` route protection, redirects unauthenticated → `/login`
- **API routes** — `/api/dashboard/metrics`, `/inbox`, `/approve`, `/actions`
- **Components** — NavBar (pulsing green dot, company name, sign out), Greeting (time-of-day),
  ApprovalInbox (approve/skip with fade animation, polling, ··· expand), StatsRow (count-up
  animation on revenue, last-updated ticker), ActionFeed (Needs attention / Completed today tabs,
  10s polling, fade-in for new rows)
- **Design** — Inline CSS only (no Tailwind), Open Sans via `@font-face`, dark theme matching
  `fieldline_mockup_B7_expandable_feed.html`
- **Auth pattern** — `supabaseAdmin` (service role) for all data queries, scoped by `contractor_id`
- **Approve route** — updates Supabase first, then fires n8n webhook best-effort with 2s timeout

### Supporting changes
- `first_name` added to `clients` table (Supabase migration run), onboard form, and API route
- All 8 Vercel env vars confirmed set (`SUPABASE_*`, `NEXT_PUBLIC_SUPABASE_*`, `N8N_*`, `NEXT_PUBLIC_SITE_URL`)
- Code reviewed (5 real bugs fixed), lint clean
- `N8N_WEBHOOK_SECRET` added to `.env.local` — value must match Header Auth credential in n8n

---

## Immediate Next Task — n8n Approve Workflow

When a contractor taps "Yes, do it", `/api/dashboard/approve` POSTs to
`{N8N_WEBHOOK_BASE_URL}/webhook/approve` with `{ action_id, decision, contractor_id }`.
**No workflow exists at that endpoint yet.**

### Blocker: `actions` table needs a `payload` column
Without it, the workflow has no execution context (phone number, message, etc.) to act on.

**Migration to run first:**
```sql
ALTER TABLE actions ADD COLUMN IF NOT EXISTS payload JSONB;
```

Payload shape written by tier1 workflows when creating `human_review` actions:
```json
{ "to": "+15551234567", "message": "Hi Mike, following up on your missed call..." }
```

### Approve workflow design (n8n)
1. **Webhook trigger** at path `/webhook/approve` — Header Auth (existing credential, same value as `N8N_WEBHOOK_SECRET`)
2. **If** `decision = skipped` → end (Supabase already updated before webhook fires)
3. **Supabase node** — fetch action by `action_id`, get `action_type` + `payload`
4. **Switch** on `action_type`:
   - `missed_call_recovery` or `after_hours_lead` → **SignalWire SMS** using `payload.to` + `payload.message`
   - anything else → **Telegram** notification to Karsyn that action was manually approved
5. **Telegram** confirmation on success

### Also: tier1 workflows need to be rebuilt
The IDs in memory (`WN1y1bxcoclgF5EF`, `DvkqrNoPZ4BbMFb2`) returned "not found" in n8n — those
workflows don't exist in this account. They need to be rebuilt from scratch and must write `payload`
to the `actions` row when creating `human_review` actions.

**Open question for Karsyn before building:** Phase 1 SMS sends only, or also scheduling/proposals?

---

## Existing n8n Credentials
| Credential | ID | Status |
|---|---|---|
| Gmail | `uWYzlK7ftArlL8zw` | Active |
| Telegram | `OjlxZCBapUKW4KEu` | Active |
| Header Auth (webhook secret) | 2 copies, same value | Active |
| Supabase | not yet created | — |
| SignalWire | not yet created | — |

---

## Go-Live Checklist
- [ ] Merge `feature/dashboard-components` → main and deploy
- [ ] Verify `actions` table exists with correct schema
- [ ] Run `payload JSONB` migration on `actions`
- [ ] Rebuild tier1 workflows (after_hours_lead_capture, missed_call_recovery_sms) — write `payload`
- [ ] Build n8n approve workflow
- [ ] Create test contractor account + seed action rows → smoke-test full login → approve flow
- [ ] Supabase RLS policies (`supabaseAdmin` bypasses RLS so not blocking, but needed for security)
- [ ] Confirm `N8N_WEBHOOK_SECRET` in Vercel matches value in n8n Header Auth credential

---

## Key Rules (Don't Break These)
- **n8n is multi-tenant** — one workflow for ALL contractors, never duplicate per client.
  Lookup contractor config from Supabase by SignalWire TO number at runtime.
- **Inline CSS only** in all `app/dashboard/` files — no Tailwind class names ever
- **`N8N_WEBHOOK_BASE_URL`** has trailing slash in `.env.local` — always strip with `.replace(/\/$/, "")`
- **`supabaseAdmin`** (service role key) used server-side — bypasses RLS, scoped manually by `contractor_id`
- **`@supabase/ssr`** for auth — NOT deprecated `@supabase/auth-helpers-nextjs`
- **Approve route** updates Supabase FIRST, then fires webhook best-effort — never block UI on n8n
