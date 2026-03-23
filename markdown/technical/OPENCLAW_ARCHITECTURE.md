# OpenClaw / NemoClaw Architecture
**Last Updated:** 2026-03-18
**Applies to:** Partner and Full Partner tiers

---

## What OpenClaw Is

OpenClaw is a **full autonomous agent runtime** — not a coding tool or CLI utility. It runs goal-driven agents that reason, decide, and act across platforms.

**Key capabilities:**
- Cross-platform: Mac, Windows, Linux
- WhatsApp, Telegram, Slack native interfaces — contractors interact here, never see infrastructure
- 5,700+ community skills in ClawHub
- Embeddable via `createAgentSession()` SDK
- Persistent memory → pointed at Supabase instead of local files
- Self-healing: reasons through API failures, tries alternatives
- Sub-agent spawning for parallel background tasks
- MIT licensed (commercial use allowed)

## What NemoClaw Is

NemoClaw is NVIDIA's enterprise wrapper for OpenClaw. It adds:

- **OpenShell isolation** — one sandbox per contractor, prevents credential bleed between clients
- **Cross-platform** — same as OpenClaw
- **Configurable inference** — use Nemotron OR Claude OR any OpenAI-compatible endpoint
- **NVIDIA Open Model License** — commercial use allowed
- Deployed centrally on a VPS — contractors never see or provision it

---

## How They Fit in the Stack

```
Fieldline AI VPS
└── NemoClaw (sandbox manager)
    ├── Sandbox: contractor_001
    │   └── OpenClaw runtime
    │       ├── Marketing agent
    │       ├── Ops agent
    │       └── Supabase memory (contractor_001's data only)
    ├── Sandbox: contractor_002
    │   └── OpenClaw runtime
    │       └── (same structure)
    └── ...
```

Each contractor gets their own OpenShell sandbox. Credentials, memory, and context are fully isolated. One contractor's agent cannot access another's data.

---

## How OpenClaw Agents Relate to n8n

OpenClaw agents sit **on top of** n8n workflows. n8n does execution. OpenClaw does judgment.

```
Inbound event (WhatsApp, webhook, schedule)
→ OpenClaw agent receives it
→ Reasons: "What's the full context here? What should happen?"
  Uses: Nemotron 3 Super 120B for routing decisions (free)
  Uses: Claude Sonnet 4.6 for complex reasoning ($3/M in)
→ Decides which n8n workflow(s) to invoke
→ Calls n8n webhook with appropriate payload
→ n8n executes the workflow
→ Result logged to Supabase with contractor_id
→ OpenClaw updates its memory with outcome
```

**n8n workflows are tools that OpenClaw calls.** n8n handles the execution complexity (API calls, error handling, retries). OpenClaw handles the judgment (when to call them, with what parameters, in what sequence).

---

## AI Model Routing Within Agents

| Decision Type | Model | Why |
|---|---|---|
| Tool routing, agent loops | Nemotron 3 Super 120B | Free via OpenRouter |
| Customer-facing responses | Claude Sonnet 4.6 | Best quality for customer copy |
| Complex reasoning | Claude Sonnet 4.6 | Multi-step HVAC domain logic |
| Reports, summaries, scoring | Claude Batch API | 50% cost reduction for non-urgent |
| Fallback (if Claude > $150/mo cap) | Nemotron via DeepInfra | ~$0.20/M blended |

---

## Agent Skill Files

OpenClaw agents are configured via skill files. For HVAC domain agents, skill files define:
- Agent's role and domain knowledge
- Available tools (n8n webhook URLs they can call)
- Memory schema (what to remember per contractor)
- Response style (matches contractor's business tone)
- Escalation rules (when to involve human)

**Status:** HVAC skill file structure is an open design question. See `docs/FIELDLINE_AI_MASTER.md` → Open Questions.

---

## Infrastructure Setup

**VPS (DigitalOcean or Railway):**
- One VPS hosts all NemoClaw sandboxes
- Estimated cost: $40–60/month regardless of client count
- One OpenShell sandbox per contractor

**Per-Contractor Provisioning (when client signs Partner/Full Partner):**
1. Create new OpenShell sandbox in NemoClaw
2. Configure OpenClaw runtime inside sandbox
3. Point memory storage at contractor's Supabase schema (using contractor_id partition)
4. Configure agent skill files for contractor's specific business
5. Set up WhatsApp/Telegram interface (contractor gets contact info for their agent)
6. Test end-to-end: contractor sends message → agent responds → action logged to Supabase

---

## WhatsApp Setup (Provisional)

**Approach A (confirmed):** Fieldline AI provisions SignalWire WhatsApp Business API per contractor. Each contractor gets their own AI-managed WhatsApp number.

**Exact provisioning flow:** Not yet fully mapped. This is an open question.

**What's confirmed:**
- SignalWire supports WhatsApp Business API
- Each contractor gets their own number (not shared)
- OpenClaw connects to it via native WhatsApp interface
- Contractor never provisions anything — we do it during 48-hour onboarding

---

## OpenAI / Model API Per Contractor

If using OpenAI OAuth features: create `contractor@fieldlineai.com` email aliases, $200/month OpenAI account per contractor. Cost is baked into the retainer price at Partner+ tiers.

Alternatively: use Anthropic API (Claude) + OpenRouter (Nemotron) without OpenAI entirely. This is the preferred approach for cost predictability.

---

## Credentials Flow

```
Fieldline AI VPS
├── NemoClaw config: knows all sandbox paths
├── Each sandbox:
│   ├── ANTHROPIC_API_KEY (shared or per-contractor)
│   ├── OPENROUTER_API_KEY (Nemotron — shared)
│   ├── SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
│   ├── SIGNALWIRE credentials (contractor-specific)
│   └── N8N_WEBHOOK_URLS (contractor-specific webhook URLs)
```

Contractors never see any of this. They interact only via WhatsApp and their read-only dashboard.
