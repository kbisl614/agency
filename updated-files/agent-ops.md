# AI Implementation Partner — Autonomous Revenue Systems

## What this is

A retained AI operations partnership for service businesses. We are NOT a SaaS product and NOT a traditional agency. We are an ongoing AI partner — we assess a business's operations, identify the highest-ROI automation opportunities, build and deploy the systems, and continuously upgrade them as AI tools evolve.

The client never configures anything. They see a read-only Mission Control dashboard showing what their agents did. We operate the backend entirely.

**Two engagement lanes:**
- **Productized Verticals** — Pre-built workflow packages for specific niches (HVAC is Vertical #1). Fixed price, fast deployment, high margin.
- **Custom Implementation** — Discovery-led builds for businesses that don't fit a template. Higher ticket, more time, feeds the productized library.

Both lanes land on a monthly retainer. Both get upgraded as AI tools evolve.

---

## Vertical Library

### Vertical #1: HVAC Contractors (ACTIVE — MVP)
- **CRM:** Jobber (full API now), ServiceTitan (partner access pending, 4–8 weeks)
- **Bleeding wounds:** Missed emergency leads, idle techs during cancellations, dispatcher overhead
- **Monthly retainer:** $1,200–$2,500 depending on CRM and size
- **ROI anchor:** $4,700/month in recovered revenue across 3 channels
- **Status:** Build in progress — all 17 workflows mapped

### Vertical #2–N: (To be added after first client win)
Each new vertical gets its own entry here after a real custom engagement.

---

## Tech stack

- **Frontend:** Next.js 14+ (Mission Control dashboard)
- **Backend:** Python FastAPI (logic layer, Claude API integration)
- **Workflows:** n8n (orchestration, webhook handling, CRM/tool integration)
- **AI:** Claude API — claude-sonnet-4-20250514 (NLP, qualification, response generation)
- **SMS:** Twilio
- **Database (MVP):** Airtable (3 tables: Leads, Actions, Waitlist)
- **Database (scale):** Supabase (month 3+, first paying client)
- **CRM (HVAC MVP):** Jobber (full API access now)
- **CRM (HVAC future):** ServiceTitan (partner API — 4–8 week approval pending)
- **Non-CRM integrations:** Google Calendar, Calendly, booking software APIs as needed per vertical
- **Payments:** Stripe
- **Deployment:** Vercel (Next.js) + Render/Railway (FastAPI)
- **Future layer:** NemoClaw (NVIDIA, Q3–Q4 2026 evaluation)

---

## Architecture — read this before writing any code

### The hybrid agent model

Agents are NOT separate services. Each agent = one n8n workflow + one Claude API call inside it.

**Two types of workflows:**

**1. Independent (fire directly from trigger — no orchestrator):**
- Cancellation fill → fires on `job_canceled` webhook (or calendar event deleted)
- Review request → fires on `job_completed` webhook (30 min delay)
- Invoice chaser → fires on daily 8 AM schedule
- Daily summary → fires on 7 AM schedule
- Seasonal outreach → fires on April/October schedule
- ETA monitor → fires every 15 min during business hours

**2. Orchestrated (ambiguous input → orchestrator decides → delegates):**
- Inbound SMS handler → all customer replies route through orchestrator first
- New lead router → all new leads route through orchestrator first
- Dispatch router → orchestrator chains lead capture → dispatch → customer notification

### The rule of thumb
- Predictable trigger + predictable action = independent workflow
- Ambiguous input or multi-step chain = goes through orchestrator

### How Claude API fits in

Claude never acts directly. n8n executes, Claude decides. Every Claude call returns structured JSON:

```json
{
  "action": "send_sms",
  "urgency_score": 9,
  "response_text": "Hi! We got your message...",
  "confidence": 0.94
}
```

### Airtable schema (MVP — works across verticals)

- **Leads:** lead_id, client_id, customer_name, phone, message, urgency_score, service_type, status, timestamp
- **Actions:** action_id, client_id, action_type, description, revenue_impact, agent_name, timestamp
- **Waitlist:** waitlist_id, client_id, customer_name, phone, service_type, location, last_contacted

> Note: `contractor_id` renamed to `client_id` to support non-HVAC verticals.

---

## Build order — always respect this

### Phase 1 (NOW — get to demo-ready, HVAC vertical)
1. FastAPI endpoint: `POST /leads/qualify` → calls Claude API → returns JSON
2. Twilio setup → SMS hits a real phone from a test lead
3. n8n workflow: webhook → FastAPI → Airtable → Twilio
4. Next.js dashboard: polls Airtable every 10s, shows live action feed

### Phase 2 (after first client signed)
5. Jobber webhook listener → routes by event type
6. Cancellation fill workflow (highest ROI — $175/slot)
7. Admin dashboard — your view of all clients
8. Inbound SMS orchestrator

### Phase 3 (month 2+)
9. Remaining independent workflows (invoice, review, ETA, summary)
10. Full orchestrator layer
11. Client-facing read-only dashboard
12. Supabase migration

### Phase 4 (second vertical)
13. Discovery framework document for new niche
14. Adapt workflow templates for new vertical's triggers and language
15. Add new vertical entry to Vertical Library above

---

## Key constraints

- Never build the client config UI — they don't touch the system
- Always write every action to the Actions table (audit trail = proof of ROI)
- Human-in-the-loop required for: contracts, replacement quotes, anything >$500 commitment
- Auto-execute only if Claude confidence score >85%
- Jobber is HVAC MVP — do not wait for ServiceTitan API approval to build
- Keep workflow logic niche-agnostic where possible — parameters change, architecture doesn't

---

## Claude API usage pattern

```python
# Always use this model
model = "claude-sonnet-4-20250514"
max_tokens = 1000

# Always return structured JSON — prompt must specify this
# Adjust system prompt per vertical — the schema stays the same
system = """You are an AI operations assistant for a [VERTICAL] business.
Return ONLY valid JSON. No preamble. No explanation.
Schema: { action, urgency_score, service_type, response_text, confidence }"""
```

---

## Engagement pricing reference

| Engagement Type | Setup Fee | Monthly Retainer |
|---|---|---|
| Productized vertical (HVAC, cleaning, etc.) | $1,500 | $800–$1,500 |
| Semi-custom (template with modifications) | $2,500 | $1,200–$2,000 |
| Full custom implementation | $3,500–$5,000 | $1,500–$3,000 |

---

## File structure

```
/
├── agent-ops.md               ← you are here
├── frontend/                  ← Next.js dashboard
│   └── app/
├── backend/                   ← FastAPI
│   ├── main.py
│   ├── routes/
│   │   ├── leads.py           ← POST /leads/qualify
│   │   ├── cancellations.py   ← POST /cancellations/match
│   │   └── orchestrator.py    ← POST /orchestrate
│   └── services/
│       ├── claude_service.py  ← all Claude API calls
│       ├── twilio_service.py
│       └── airtable_service.py
├── n8n/                       ← workflow exports (JSON)
│   ├── wf1_lead_capture.json
│   ├── wf2_sms_response.json
│   └── wf3_audit_log.json
└── docs/
    ├── architecture.md        ← full hybrid agent architecture
    ├── workflows.md           ← all 17 workflows reference (HVAC vertical)
    ├── selling_angles.md      ← pitch guide by vertical and CRM
    ├── vertical_playbook_template.md  ← blank template for new verticals
    └── roi.md                 ← ROI frameworks by vertical
```

---

## What done looks like for Phase 1

- Send a curl request to `/leads/qualify`
- Lead appears in Airtable within 5 seconds
- SMS hits a real phone with a human-sounding response
- Dashboard shows the action in the live feed
- End-to-end test passes before moving to Phase 2
