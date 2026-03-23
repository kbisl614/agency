# HANDOFF — Fieldline AI
# Last updated: 2026-03-22

---

## What This Is
Fieldline AI — productized AI ops agency for HVAC contractors. You build and operate everything. Contractors pay a monthly retainer ($1,500 Foundation / $2,500 Partner / $4,500 Full Partner) and never configure anything. The dashboard is read-and-approve only.

**Stack:** Next.js 14 (Vercel) · Supabase · n8n Cloud · SignalWire (SMS) · Open Sans font (local, no CDN)
**Supabase project:** `cdofgroinizevjxyzvnn.supabase.co`
**n8n instance:** `krn8n9394.app.n8n.cloud`
**Production URL:** `hvac-agency.vercel.app`

---

## What Was Just Built

Full client dashboard at `/dashboard` on branch `feature/dashboard-components` (not yet merged):
- Route protection middleware (`@supabase/ssr`)
- 4 API routes: metrics, inbox, approve, actions
- Components: NavBar, Greeting, ApprovalInbox (approve/skip), StatsRow (count-up animation), ActionFeed (two tabs, polling)
- Inline CSS only — no Tailwind in dashboard files
- `first_name` added to `clients` table (migration already run in Supabase)
- All Vercel env vars confirmed set
- Code reviewed, lint clean, final commit `aee9002`

---

## Immediate Next Task

**Build the n8n approve workflow.** When a contractor taps "Yes, do it" in the dashboard, `/api/dashboard/approve` fires a POST to `{N8N_WEBHOOK_BASE_URL}/webhook/approve` with `{ action_id, decision, contractor_id }`. There is no workflow at that endpoint yet.

**Blocker first:** The `actions` table has no `payload` column. The workflow needs execution context (phone number, message text) to actually do anything. Tier1 workflows must write this when creating `human_review` actions.

**Step 1 — Supabase migration:**
```sql
ALTER TABLE actions ADD COLUMN IF NOT EXISTS payload JSONB;
```

**Step 2 — Build approve workflow in n8n:**
1. Webhook trigger at `/webhook/approve` — Header Auth credential (already exists, same value as `N8N_WEBHOOK_SECRET`)
2. If `decision = skipped` → stop
3. Fetch action from Supabase by `action_id` (get `action_type` + `payload`)
4. Switch on `action_type`:
   - `missed_call_recovery` / `after_hours_lead` → send SMS via SignalWire using `payload.to` + `payload.message`
   - anything else → Telegram notification that action was approved
5. Telegram confirmation to Karsyn

**Pending question for Karsyn:** Phase 1 SMS sends only, or also scheduling/proposals?

**Also note:** The tier1 workflow IDs in memory (`WN1y1bxcoclgF5EF`, `DvkqrNoPZ4BbMFb2`) returned "not found" in n8n — those workflows need to be rebuilt and must write `payload` to the action row when creating `human_review` actions.

---

## n8n Credentials (existing)
| Credential | ID | Status |
|---|---|---|
| Gmail | `uWYzlK7ftArlL8zw` | Active |
| Telegram | `OjlxZCBapUKW4KEu` | Active |
| Header Auth (webhook secret) | exists (2 copies, same value) | Active |
| Supabase | not yet created | — |
| SignalWire | not yet created | — |

---

## Still To Do Before Go-Live
- [ ] Merge `feature/dashboard-components` → main, deploy
- [ ] Confirm `actions` table exists with correct schema
- [ ] Add `payload JSONB` to `actions`
- [ ] Rebuild tier1 n8n workflows (write `payload` on human_review actions)
- [ ] Build n8n approve workflow
- [ ] Seed test contractor + actions data, smoke-test dashboard end-to-end
- [ ] Supabase RLS policies (API routes use `supabaseAdmin` so not blocking, but needed)

---

## Key Rules
- **Multi-tenant n8n:** one workflow handles ALL contractors — lookup by SignalWire TO number, never duplicate per client
- **Inline CSS only** in dashboard files — no Tailwind
- **`N8N_WEBHOOK_BASE_URL`** has trailing slash in `.env.local` — code strips it with `.replace(/\/$/, "")`
- **`supabaseAdmin`** (service role) used for all server-side data queries — bypasses RLS
- Full strategic context (pricing, architecture, OpenClaw, tier contents) in `handoff-agency-changes.md`
