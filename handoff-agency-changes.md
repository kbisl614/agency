# HANDOFF — Fieldline AI
# READ THIS FIRST before any session touching product, pricing, architecture, or code.
# Last updated: 2026-03-22

---

## Recent Work (Last 2-5 Tasks) — What We Did and Why

### 1. Built the full client-facing dashboard (`/dashboard`)
**Why:** Contractors need a read-and-approve interface to see what their AI agents are doing and approve held actions. This is the product — not a SaaS config panel, just a clean briefing screen.
**What was built:**
- 4 API routes: `/api/dashboard/metrics`, `/api/dashboard/inbox`, `/api/dashboard/approve`, `/api/dashboard/actions`
- Dashboard page with NavBar, Greeting, ApprovalInbox, StatsRow, ActionFeed components
- Route protection middleware (`@supabase/ssr`)
- Open Sans font via `@font-face` in globals.css
- Inline CSS only — no Tailwind in dashboard files
- All on branch `feature/dashboard-components` — **not yet merged to main**

### 2. Added `first_name` to `clients` table + onboard form
**Why:** Greeting says "Good morning, Mike" — needs the contractor's first name from the DB.
**What was done:** Added column via Supabase SQL editor (Playwright), updated `lib/supabase.ts` Client interface, onboard form, and onboard API route.

### 3. Ran final code review + lint fixes
**Why:** Dashboard was fully built but needed a quality gate before PR. Lint had 4 unescaped apostrophe errors in dashboard components. Code reviewer found 5 real bugs.
**What was fixed:**
- Restored `middleware.ts` (was in git HEAD but deleted from disk)
- Orphaned `clients` row on onboard rollback — now deletes clients row before auth user on failure
- Silent approve failure — card now re-inserts if the POST to `/api/dashboard/approve` fails
- Duplicate polling loops during error state (10s + 30s both running simultaneously) — removed redundant 30s retry from all 3 polling components
- "Yesterday" timestamp label was wrong for items >24h but not actually yesterday — fixed to compare calendar dates

### 4. Confirmed Vercel env vars are set
**Why:** Dashboard can't function in production without these.
**Status:** All 8 required vars confirmed in Vercel (`hvac-agency` project, team `kbisl614s-projects`):
`SUPABASE_PROJECT_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL`, `N8N_WEBHOOK_BASE_URL`, `N8N_WEBHOOK_SECRET`
Production URL: **`hvac-agency.vercel.app`**

### 5. Started n8n approve workflow planning — BLOCKED on missing data
**Why:** The approve route fires a webhook to n8n when a contractor taps "Yes, do it" — that webhook needs a workflow to actually execute the action (send SMS, etc.).
**Blocker discovered:** See "Immediate Next Step" section below.

---

## Immediate Next Step — Build the n8n Approve Workflow

> The Fieldline AI tier1 workflows aren't in this n8n account — the IDs from the memory file returned "not found". So the approve workflow is being designed from scratch.
>
> Before building it, there's a critical gap: the `actions` table has no `payload` column. When a tier1 workflow creates a `human_review` action, it needs to store execution context (phone number, message text, customer ID, etc.) so the approve workflow knows what to actually *do* when approved.
>
> **What needs to be built:**
>
> 1. Add `payload JSONB` column to `actions` table — stores structured data like `{ "to": "+15551234567", "message": "Hi Mike, following up on your AC..." }`
> 2. Build the approve workflow in n8n — receives webhook → fetches action + payload → routes by `action_type` → executes (SMS for Phase 1) → sends Telegram confirmation
>
> **For Phase 1 the approve workflow needs to handle:**
> - `missed_call_recovery` → send SMS via SignalWire
> - `after_hours_lead` → send SMS via SignalWire
> - Anything else → Telegram notification to you that it was approved
>
> **Question still pending from Karsyn:** Are SMS sends the only action type needing approval in Phase 1, or are there others (scheduling, proposals)?

**To start this work:**
1. Answer the question above
2. Run Supabase migration: `ALTER TABLE actions ADD COLUMN IF NOT EXISTS payload JSONB;`
3. Build n8n approve workflow (webhook trigger → Supabase fetch → SignalWire SMS → Telegram confirm)
4. Also: the tier1 workflows (after_hours_lead_capture, missed_call_recovery_sms) need to be rebuilt in n8n — their IDs from the memory file (`WN1y1bxcoclgF5EF`, `DvkqrNoPZ4BbMFb2`) returned "not found". These workflows must store a `payload` on the action row when creating `human_review` actions.

---

## Things Still To Do Before Go-Live

- [ ] Merge `feature/dashboard-components` → main and deploy to Vercel
- [ ] Verify `actions` table exists in Supabase with correct schema (may need to be created)
- [ ] Add `payload JSONB` column to `actions` table
- [ ] Rebuild tier1 n8n workflows (after_hours + missed_call) with `payload` writing
- [ ] Build n8n approve workflow
- [ ] Create test contractor account + seed actions data to smoke-test dashboard
- [ ] Wire `N8N_WEBHOOK_SECRET` into the n8n Webhook node Header Auth credential
- [ ] Supabase RLS policies (all API routes use `supabaseAdmin` which bypasses RLS, but needed for defense-in-depth)

---

## Project Context (Preserved from Previous Handoff)

### Business Model
**Productized Agency** — you build and operate everything, contractor pays one retainer. Not SaaS. Contractors don't configure anything.

### Pricing
| Tier | Setup | Monthly | Commitment |
|---|---|---|---|
| Foundation | $500 | $1,500 | Month-to-month |
| Partner | $1,500 | $2,500 | 3-month min |
| Full Partner | $2,500 | $4,500 | 3-month min |

**Guarantee:** 5 recovered leads in 30 days or second month free.

### Tech Stack
```
Layer 1 (deterministic):   n8n Cloud, Claude Sonnet 4.6, SignalWire, Supabase
Layer 2+ (autonomous):     NemoClaw (sandbox manager), OpenClaw (agent runtime)
                           Nemotron 3 Super 120B (free via OpenRouter), Claude Sonnet 4.6
Infrastructure:            Vercel (Next.js), VPS (NemoClaw sandboxes)
```

### n8n Multi-Tenant Pattern
One workflow handles ALL contractors. Never duplicate per client.
```
Webhook fires → includes TO number (contractor's SignalWire number)
→ Supabase lookup: SELECT * FROM clients WHERE signalwire_number = TO
→ Returns contractor config → workflow executes using that config
→ All actions logged with contractor_id
```

### Confirmed n8n Instance
`krn8n9394.app.n8n.cloud`

### Existing n8n Credentials
| Credential | ID | Status |
|---|---|---|
| Gmail | `uWYzlK7ftArlL8zw` | Active |
| Telegram | `OjlxZCBapUKW4KEu` | Active |
| Supabase | Not yet created | — |
| SignalWire | Not yet created | — |
| Header Auth (webhook secret) | Exists (2 copies, same value) | Active |

### Supabase Project
URL: `https://cdofgroinizevjxyzvnn.supabase.co`
Schema tables: `clients`, `users`, `leads`, `actions`, `workflow_performance`
Note: `clients` has `first_name` column (added this session). `actions` needs `payload JSONB` (not yet added).

### Key Architectural Decisions
- **FastAPI is DEFERRED not removed** — Phase 3
- **Seasonal outreach removed from Foundation** — lives in Partner tier under marketing agent
- **OpenClaw agents custom-built per client as part of setup fee** — nothing pre-built speculatively
- **NemoClaw sandboxes hosted centrally on Fieldline AI VPS** — contractors never see them
- **Nemotron 3 Super is currently FREE on OpenRouter** — budget $5/month floor
- **$150/month Claude budget cap per contractor** — overflow to Nemotron
- **Supabase RLS critical** — every table needs `WHERE contractor_id = auth.uid()` policy
- **"the banana ate the monkey"** — trigger phrase for full stale file rewrite/delete

### Open Questions
1. First client acquisition strategy (most important blocker)
2. WhatsApp provisioning details per contractor
3. Partner/Full Partner guarantee wording
4. Contract terms (payment, data ownership, cancellation notice)
5. ServiceTitan partner API — still unapproved (4-8 week window), can't accurately price ST clients yet
6. Phase 1 approve action types — SMS only, or also scheduling/proposals?

### How to Read Session Context
Memory files at `~/.claude/projects/-Users-karsynregennitter-projects-agency/memory/` — read at session start per CLAUDE.md.
