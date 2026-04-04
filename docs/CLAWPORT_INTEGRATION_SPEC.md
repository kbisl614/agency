# ClawPort Integration Spec
**Status:** Planning  
**Last Updated:** 2026-04-04  
**Scope:** Integrate `kbisl614/claw-ui` (ClawPort fork) as the agent operations backend for Workfloor's multi-tenant HVAC contractor platform.

---

## What We're Building

ClawPort today is a single-workspace command center for your own OpenClaw agents. We're adapting it to serve as Workfloor's internal **agent operations backend** — tracking every agent deployed per client, what those agents have done, what they've cost to run, and what revenue they've generated. The admin dashboard surfaces this across all clients; the client dashboard shows a clean, client-facing slice of it.

```
ClawPort fork (kbisl614/claw-ui)        Workfloor Next.js app
─────────────────────────────────       ─────────────────────────────────
Agent registry per contractor        →  /admin: cross-client agent status
CronRun logs (token usage/cost)      →  /admin/[id]: per-client ops view
Action feed (n8n outcomes)           →  /dashboard: client revenue view
Cost tracking (Claude API spend)     →  Admin cost-vs-revenue P&L view
Memory browser (agent context)       →  Client sees what agent "remembers"
```

ClawPort is **not embedded in the client-facing dashboard**. It runs internally and its data surfaces through Workfloor's existing `/api/dashboard/*` routes.

---

## Architecture

### Data Flow

```
n8n workflow executes
  → writes action to Supabase (actions table, with contractor_id)
  → ClawPort polls Supabase for its contractor's actions
  → Workfloor /api/dashboard/metrics reads same Supabase actions
  → Admin dashboard reads ClawPort gateway for agent cost data
  → Client dashboard reads Workfloor API (never touches ClawPort directly)
```

### Multi-Tenant Adaptation

ClawPort is single-workspace today. We need per-contractor isolation:

| ClawPort concept | Workfloor adaptation |
|---|---|
| Single agent registry (`lib/agents.json`) | One `agents.json` per contractor, keyed by `contractor_id` |
| Global cron jobs | Cron jobs tagged with `contractor_id` in Supabase |
| Single OpenClaw gateway | One OpenClaw sandbox per contractor (NemoClaw via NVIDIA) |
| Shared memory store | Memory namespaced by `contractor_id` partition |
| Single cost dashboard | Per-contractor cost + cross-client aggregate in admin |

### Gateway URL Strategy

Each contractor's OpenClaw sandbox exposes a local gateway (or we proxy through a single VPS endpoint):

```
Admin:  CLAWPORT_GATEWAY_BASE = https://ops.workfloor.ai
        Per-contractor:         /gateway/{contractor_id}/
Client: No direct gateway access — reads from Supabase only
```

---

## Phase 1: Foundation (Do First)

### 1A. Supabase Schema Additions

Add these to the existing schema (migrations only — do not touch existing tables):

```sql
-- ─────────────────────────────────────────────────────────────
-- AGENT_DEPLOYMENTS TABLE
-- Source of truth for which agents are live per contractor
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS agent_deployments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contractor_id TEXT NOT NULL REFERENCES clients(contractor_id) ON DELETE CASCADE,

  -- Agent identity (matches ClawPort agent slug)
  agent_slug VARCHAR(100) NOT NULL,         -- e.g. "missed_call_responder"
  agent_name VARCHAR(200) NOT NULL,         -- e.g. "Missed Call Responder"
  agent_tier INTEGER NOT NULL DEFAULT 1,   -- 1=MVP, 2=Differentiator, 3=Long Game

  -- Lifecycle
  status VARCHAR(50) DEFAULT 'provisioning',  -- provisioning | active | paused | failed
  deployed_at TIMESTAMP WITH TIME ZONE,
  paused_at TIMESTAMP WITH TIME ZONE,
  last_run_at TIMESTAMP WITH TIME ZONE,
  run_count INTEGER DEFAULT 0,

  -- Configuration snapshot (what was used to configure this agent)
  config JSONB DEFAULT '{}',

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(contractor_id, agent_slug)
);

CREATE INDEX idx_agent_deployments_contractor ON agent_deployments(contractor_id);
CREATE INDEX idx_agent_deployments_status ON agent_deployments(status);

ALTER TABLE agent_deployments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_n8n_agent_deployments_all" ON agent_deployments
  FOR ALL USING (TRUE) WITH CHECK (TRUE);

-- ─────────────────────────────────────────────────────────────
-- AGENT_RUNS TABLE
-- Per-run log from ClawPort's CronRun data, enriched with revenue
-- Mirrors ClawPort's CronRun shape but adds contractor + revenue
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS agent_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contractor_id TEXT NOT NULL,
  agent_slug VARCHAR(100) NOT NULL,

  -- From ClawPort CronRun
  run_ts TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'ok',   -- ok | error
  duration_ms INTEGER,
  model VARCHAR(100),
  input_tokens INTEGER DEFAULT 0,
  output_tokens INTEGER DEFAULT 0,
  cache_tokens INTEGER DEFAULT 0,
  ai_cost_usd DECIMAL(10, 6) DEFAULT 0,       -- computed from ClawPort pricing
  error_message TEXT,
  summary TEXT,

  -- Revenue side (from actions table outcome)
  revenue_impact DECIMAL(10, 2) DEFAULT 0,
  linked_action_id UUID REFERENCES actions(id) ON DELETE SET NULL,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_agent_runs_contractor ON agent_runs(contractor_id, run_ts DESC);
CREATE INDEX idx_agent_runs_slug ON agent_runs(agent_slug, run_ts DESC);

ALTER TABLE agent_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_agent_runs_all" ON agent_runs
  FOR ALL USING (TRUE) WITH CHECK (TRUE);

-- ─────────────────────────────────────────────────────────────
-- CONTRACTOR_METRICS TABLE (materialized daily snapshot)
-- Pre-aggregated so dashboards don't do expensive joins
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contractor_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contractor_id TEXT NOT NULL,
  date DATE NOT NULL,

  -- Revenue
  revenue_usd DECIMAL(10, 2) DEFAULT 0,
  leads_recovered INTEGER DEFAULT 0,
  cancellations_filled INTEGER DEFAULT 0,
  invoices_collected DECIMAL(10, 2) DEFAULT 0,

  -- Agent activity
  total_runs INTEGER DEFAULT 0,
  successful_runs INTEGER DEFAULT 0,
  failed_runs INTEGER DEFAULT 0,
  agents_active INTEGER DEFAULT 0,

  -- Cost
  ai_cost_usd DECIMAL(10, 6) DEFAULT 0,
  avg_response_ms INTEGER DEFAULT 0,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(contractor_id, date)
);

CREATE INDEX idx_contractor_metrics_contractor_date ON contractor_metrics(contractor_id, date DESC);

ALTER TABLE contractor_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_contractor_metrics_all" ON contractor_metrics
  FOR ALL USING (TRUE) WITH CHECK (TRUE);

-- Existing actions table: add contractor_id if not present
-- ALTER TABLE actions ADD COLUMN IF NOT EXISTS contractor_id TEXT;
-- ALTER TABLE actions ADD COLUMN IF NOT EXISTS response_time_ms INTEGER;
-- ALTER TABLE actions ADD COLUMN IF NOT EXISTS agent_slug VARCHAR(100);
-- CREATE INDEX IF NOT EXISTS idx_actions_contractor ON actions(contractor_id, created_at DESC);
```

### 1B. ClawPort Fork Adaptations

Changes to make in `kbisl614/claw-ui` before wiring it in:

**Required:**
- [ ] Add `contractor_id` to all Supabase writes (`agent_runs`, `agent_deployments`)
- [ ] Replace `lib/agents.json` with dynamic load: `SELECT * FROM agent_deployments WHERE contractor_id = ?`
- [ ] Replace local file-based cron storage with Supabase `agent_runs` table
- [ ] Add `CLAWPORT_CONTRACTOR_ID` env var — one ClawPort instance per contractor (NemoClaw sandbox) reads only its own data
- [ ] Strip the client-facing UI entirely — ClawPort is admin/internal only

**Nice to have:**
- [ ] Replace ElevenLabs voice IDs with Workfloor-specific config
- [ ] Point ClawPort memory browser at contractor's Supabase namespace

### 1C. ClawPort Internal Admin Route

Add `/admin/ops` to the Workfloor Next.js app — an **iframe or embedded view** of the ClawPort UI, protected behind admin auth:

```
/admin              → client list (existing)
/admin/[id]         → per-client detail (new — see Phase 2)
/admin/ops          → ClawPort embedded (agent registry, cron health, costs)
/admin/onboard      → existing onboard form
```

---

## Phase 2: Per-Client Detail View

The most important missing page in the admin dashboard right now.

### `/admin/[contractor_id]` — Client Detail Page

Sections (in order):

```
┌─ Client Header ──────────────────────────────────────────────┐
│  Business name · CRM type · Owner email · Retainer amount    │
│  [ Pause All Agents ]  [ Edit Config ]  [ View Dashboard ]   │
└──────────────────────────────────────────────────────────────┘

┌─ Revenue Summary (MTD) ──────────────────────────────────────┐
│  $X,XXX recovered  ·  $X,XXX AI cost  ·  $X,XXX net margin  │
│  [sparkline chart — daily revenue last 30 days]              │
└──────────────────────────────────────────────────────────────┘

┌─ Agent Roster ───────────────────────────────────────────────┐
│  Agent Name     Tier  Status   Last Run    Runs   Revenue    │
│  Missed Call    1     LIVE     2 min ago   47     $7,050     │
│  Invoice Chaser 1     LIVE     7 AM today  12     $2,100     │
│  Review Request 1     PAUSED   —           0      —          │
│  [ + Deploy Agent ]                                          │
└──────────────────────────────────────────────────────────────┘

┌─ Recent Actions ─────────────────────────────────────────────┐
│  [same ActionFeed component, filtered to this contractor_id] │
└──────────────────────────────────────────────────────────────┘

┌─ AI Cost Breakdown ──────────────────────────────────────────┐
│  [ClawPort cost data: token usage, model mix, daily cost]    │
│  Week-over-week  ·  Cache savings  ·  Optimization score     │
└──────────────────────────────────────────────────────────────┘
```

### New API Routes Needed

```
GET  /api/admin/clients/[id]          — full client record + config
GET  /api/admin/clients/[id]/agents   — agent_deployments for this client
POST /api/admin/clients/[id]/agents   — deploy a new agent to this client
PATCH /api/admin/clients/[id]/agents/[slug] — pause/resume/config update
GET  /api/admin/clients/[id]/metrics  — contractor_metrics last 30 days
GET  /api/admin/clients/[id]/runs     — agent_runs last 7 days
GET  /api/admin/costs                 — cross-client AI cost aggregate
```

---

## Phase 3: Client Dashboard Enrichment

The client dashboard (`/dashboard`) today polls `/api/dashboard/metrics` and `/api/dashboard/actions`. Feed ClawPort's data into these without exposing ClawPort internals.

### Additions to Client Dashboard

**StatsRow — add two new cards:**
- "AI spend this month" — what we've spent running agents on their behalf (shows value of the service, not a cost they pay)
- "Agent uptime" — % of time agents were live and responding (SLA visibility)

**New section: Agent Status Strip**
Below the ActionFeed — a compact read-only row of their active agents with last-run time and run count. No controls (admin-only). Just: "Your agents are running. Here's proof."

```
Missed Call Responder  ●  ran 4 min ago  ·  47 runs this month
Invoice Chaser         ●  ran 7 AM today ·  12 runs this month
```

**New section: Monthly Report Card** (bottom of dashboard)
Pulled from `contractor_metrics`, shown as a simple table:

| Week | Revenue | Leads | Avg Response | Runs |
|------|---------|-------|--------------|------|
| Mar 31 | $1,200 | 8 | 14s | 34 |
| Mar 24 | $900 | 6 | 18s | 27 |

---

## Phase 4: Revenue Intelligence (Later)

Once data accumulates (30+ days per client):

### Cross-Client Aggregation (Admin Only)

New admin page `/admin/intelligence`:
- Which agent type generates the most revenue across all clients
- Average revenue per agent per tier (benchmark)
- Clients whose revenue is trending down (churn risk flag)
- Best-performing SMS templates across all clients

### Automated QBR Generation

New n8n workflow: on the 1st of each month, per contractor:
1. Pull `contractor_metrics` for last 90 days
2. Generate QBR narrative with Claude (revenue recovered, ROI vs retainer, top agents, next recommendations)
3. Store in Supabase, surface in client dashboard as "Your Monthly Report"
4. Admin gets a notification to review before it auto-sends

---

## What Else Should Be Added

These aren't in ClawPort today but belong in the integrated system:

### Agent Health Monitoring
- **Dead-man switch**: if an agent hasn't run in >24h and is marked LIVE, alert admin via Slack/email
- **Error rate threshold**: if >20% of runs fail in a rolling 1h window, pause agent and flag for review
- **Response time degradation**: alert if avg_response_ms increases >50% week-over-week

### Agent Deployment Lifecycle (Admin Flow)
Currently `agents_active` in the `clients` table is a static boolean. Replace with:
1. Admin clicks "+ Deploy Agent" on client detail page
2. Form: select agent type from catalog, configure (review link, invoice threshold, etc.)
3. POST `/api/admin/clients/[id]/agents` → inserts `agent_deployments` row → triggers n8n provisioning webhook → updates `status` from `provisioning` → `active`
4. Client dashboard shows the new agent in the status strip immediately

### Retainer ROI Guard
- If `revenue_mtd < retainer_amount` at the 20th of the month, admin gets an alert
- Enables proactive outreach ("we're going to hit your guarantee — here's what we're doing")
- Powers the guarantee enforcement logic the client dashboard already shows

### Audit Log
Every config change, agent deploy/pause, and approval decision logged to a `audit_log` table with `admin_user_id`, `action`, `before`, `after`, `timestamp`. Required for:
- Debugging "why did the agent do that?"
- Client disputes
- Future compliance requirements (SOC2 eventually)

### Client Notification Preferences
New table `notification_prefs` per contractor:
- Daily summary: yes/no, time
- Low revenue alert: yes/no, threshold
- Agent failure alert: yes/no
- New lead SMS: always on (can't opt out — core product)

---

## Implementation Order

| Priority | Task | Blocks |
|---|---|---|
| 1 | Supabase schema migrations (1A) | Everything |
| 2 | Add `contractor_id` to all existing actions writes in n8n | Metrics accuracy |
| 3 | `/admin/[id]` client detail page | Per-client visibility |
| 4 | Agent deployments table + deploy flow | Lifecycle management |
| 5 | ClawPort fork adaptations (1B) | Cost tracking |
| 6 | ClawPort `agent_runs` sync to Supabase | Cost-vs-revenue P&L |
| 7 | Client dashboard agent status strip | Client trust signal |
| 8 | Dead-man switch + error rate alerts | Reliability |
| 9 | Monthly report card + QBR generation | Retention / expansion |
| 10 | Cross-client intelligence page | Layer 3 product |

---

## Open Questions

1. **ClawPort hosting**: One ClawPort instance per NemoClaw sandbox, or one central ClawPort with contractor switching? The multi-tenant isolation of NemoClaw suggests one per sandbox, but that's more infrastructure to manage.
2. **Cost attribution**: ClawPort tracks Claude API spend by run. But if we use shared Anthropic keys, cost per contractor requires tagging at the API call level. Do we move to per-contractor API keys, or use usage metadata + tag-based cost allocation?
3. **Client dashboard ClawPort access**: Should clients ever get a read-only ClawPort view of their own agent activity, or is the Workfloor dashboard always the client-facing interface? (Current answer: Workfloor dashboard only — ClawPort is internal.)
4. **`agent_runs` sync frequency**: ClawPort syncs run logs to Supabase in real-time via its gateway. How do we handle ClawPort gateway downtime without losing run history?
