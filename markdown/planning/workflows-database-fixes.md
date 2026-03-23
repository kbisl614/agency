# Handoff — Workflow & Database Fixes
# READ THIS FIRST before touching any n8n workflows or Supabase schema.
# Updated: 2026-03-21

---

## Cold Start Protocol
1. Read this file in full
2. Check n8n workflow status at `krn8n9394.app.n8n.cloud`
3. Check Supabase schema via MCP before writing any INSERT queries

---

## What Was Accomplished This Session

### Workflows Activated
Both Tier 1 workflows were upgraded and activated via the n8n REST API:

| Workflow | n8n ID | Status |
|---|---|---|
| `tier1_after_hours_lead_capture` | `WN1y1bxcoclgF5EF` | **Active** |
| `tier1_missed_call_recovery_sms` | `DvkqrNoPZ4BbMFb2` | **Active** |
| `Fieldline AI — New Lead Notification` | `EVtjW8VElN5Bvf32` | Active (was already) |

**Note:** The memory file had wrong workflow IDs. Correct IDs are listed above.

### Node Fixes Applied (Both Workflows)
- Set nodes upgraded: typeVersion 1 → 3.4 (`values.string[]` → `assignments.assignments[]`)
- IF nodes upgraded: typeVersion 1 → 2.2 (`conditions.boolean[]` → `conditions.conditions[]`)
- Twilio node: added missing `from: "+12057011297"`, fixed param names (`to` not `toNumber`), removed stray `=` prefix on plain string message

### Credential Bindings (Already Set in n8n UI)
- Supabase: credential ID `Pm10coWJeiICVYIi` (name: `hvac-agency`)
- SignalWire/Twilio: credential ID `r9gOGGtsAO3GswJR` (name: `hvac-agency`)

---

## What Is Still Broken / In Progress

### The Core Problem: Schema Mismatch
The workflows were originally designed against a planned schema that does NOT match what was actually created in Supabase. The real schema is simpler and dashboard-oriented.

**Actual `leads` table schema:**
| Column | Type | Nullable |
|---|---|---|
| `lead_id` | uuid | NOT NULL (auto-gen) |
| `contractor_id` | uuid | NOT NULL ← required |
| `customer_name` | text | NOT NULL ← required |
| `phone` | text | NOT NULL |
| `message` | text | YES |
| `urgency_score` | integer | YES |
| `service_type` | text | YES |
| `status` | text | NOT NULL |
| `created_at` | timestamptz | NOT NULL |

**Actual `actions` table schema:**
| Column | Type | Nullable |
|---|---|---|
| `action_id` | uuid | NOT NULL (auto-gen) |
| `contractor_id` | uuid | NOT NULL ← required |
| `action_type` | text | NOT NULL |
| `description` | text | NOT NULL |
| `revenue_impact` | numeric | YES |
| `agent_name` | text | NOT NULL |
| `confidence_score` | numeric | YES |
| `success` | boolean | NOT NULL |
| `created_at` | timestamptz | NOT NULL |

**Columns the workflows assumed exist but DON'T:**
- `message_text` → actual column is `message`
- `intent_keywords` → doesn't exist
- `message_quality_score` → doesn't exist
- `received_timestamp` → doesn't exist
- `source` → doesn't exist
- `sms_sid` → doesn't exist
- `lead_id` in actions → doesn't exist (no FK to leads in actions table)

### The Contractor ID Problem
Both workflows need `contractor_id` (NOT NULL) but have no way to determine it at runtime. The correct production flow:
1. Incoming webhook has `To` field = contractor's SignalWire number
2. Workflow does: `SELECT contractor_id FROM clients WHERE phone_number = $Webhook.To`
3. Use that `contractor_id` for all inserts

Without this, every lead is unlinked from any contractor.

### Supabase Node Failure
The n8n Supabase node (typeVersion 1) throws `"Could not get parameter: operation"` when activated via API. Root cause unclear — likely a format mismatch between API-created nodes and what the Supabase node expects at runtime. **All Supabase operations must be done via HTTP Request nodes instead.**

### Dedup Logic Problem
If Supabase SELECT returns 0 rows (no duplicate found), n8n outputs 0 items and downstream nodes don't run — breaking the "not a duplicate" path entirely. **Fix: use HTTP GET with `select=lead_id` — returns empty array `[]` which the IF node can check via `.length`.**

---

## Decided Architecture (Option A — Production Ready)

### Step 1: Extend the Supabase schema
Add missing workflow signal columns to `leads`:
```sql
ALTER TABLE leads ADD COLUMN IF NOT EXISTS source text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS intent_keywords text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS message_quality_score numeric;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS received_timestamp timestamptz;
```

### Step 2: Add contractor lookup step to both workflows
Before any INSERT, add an HTTP GET node:
- `GET /rest/v1/clients?phone_number=eq.{{ $node.Webhook.json.To }}&select=contractor_id`
- Returns `[{contractor_id: "uuid"}]` if found, `[]` if not
- If not found: log error and stop (don't insert orphaned lead)
- If found: use `$node['Lookup Contractor'].json[0].contractor_id` in all downstream inserts

### Step 3: Rebuild all DB write nodes as HTTP Request nodes
Supabase node is unreliable via API. All INSERT/SELECT operations should use `n8n-nodes-base.httpRequest` with:
- Method: POST (INSERT) or GET (SELECT)
- Headers: `apikey`, `Authorization: Bearer`, `Prefer: return=representation` (for INSERT)
- Body: `specifyBody: "keypair"`, `contentType: "json"` — lets n8n resolve each value expression separately

---

## n8n Webhook URLs (Production)

| Workflow | Webhook URL |
|---|---|
| After-hours lead capture | `https://krn8n9394.app.n8n.cloud/webhook/tier1-after-hours-lead-capture` |
| Missed call recovery | `https://krn8n9394.app.n8n.cloud/webhook/tier1-missed-call-recovery-sms` |

**Test command (after-hours):**
```bash
curl -X POST \
  "https://krn8n9394.app.n8n.cloud/webhook/tier1-after-hours-lead-capture" \
  -d "From=%2B15551234567&To=%2B12057011297&Body=My AC is broken, need help ASAP" \
  -H "Content-Type: application/x-www-form-urlencoded"
```

**Test command (missed call):**
```bash
curl -X POST \
  "https://krn8n9394.app.n8n.cloud/webhook/tier1-missed-call-recovery-sms" \
  -d "From=%2B15551234567&To=%2B12057011297&CallStatus=no-answer" \
  -H "Content-Type: application/x-www-form-urlencoded"
```

---

## Exact Next Steps (in order)

1. **Run the schema migration** — add missing columns to `leads` table via Supabase MCP
2. **Check `clients` table schema** — confirm it has a `phone_number` column for contractor lookup
3. **Rebuild `tier1_missed_call_recovery_sms`** — full workflow rebuild via REST API using HTTP Request nodes + contractor lookup step
4. **Test missed call workflow** — send test webhook, verify lead in Supabase + SMS received
5. **Apply same rebuild to `tier1_after_hours_lead_capture`** — same pattern, different webhook path and message fields
6. **Test after-hours workflow** — same verification
7. **Move to admin visual redesign** — see `handoff-dashboard-figuring-it-out.md`

---

## Key Technical Decisions (don't re-litigate)

- **No Supabase n8n node** — use HTTP Request nodes for all DB ops
- **No Code node HTTP requests** — `$httpRequest`, `fetch`, `https` module all blocked in n8n task runner sandbox
- **Keypair body mode** — use `specifyBody: "keypair"` + `contentType: "json"` on HTTP Request nodes so n8n resolves each field expression separately
- **Contractor lookup is required** — even for testing. Onboard a test client via `/admin/onboard` before running live tests
- **`urgency_score` is integer** — not float. Use 8, not 0.8
- **`customer_name` required** — use "Unknown" for missed calls, extract from message for after-hours

---

## API Access

```
n8n Base URL:  https://krn8n9394.app.n8n.cloud
n8n API Key:   in .env.local → N8N_API_KEY
Supabase URL:  https://cdofgroinizevjxyzvnn.supabase.co
Supabase Key:  in .env.local → SUPABASE_SERVICE_ROLE_KEY
SignalWire #:  +12057011297
```

All credentials are in `.env.local` — never hardcode them in committed files.
