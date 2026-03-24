# Environment Setup Guide — Fieldline AI
**Last Updated:** 2026-03-18

Create a `.env` file at project root. Never commit it (it's `.gitignored`).

---

## Full `.env` Template

```env
# ============================================================================
# ENVIRONMENT CONFIGURATION — Fieldline AI
# ============================================================================
# STORAGE KEY:
#   [.env] = Fill in here
#   [n8n]  = Added to n8n credentials, not .env
#   [both] = Fill in .env AND add to n8n

# ─────────────────────────────────────────────────────────────────────────
# SUPABASE
# ─────────────────────────────────────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=https://cdofgroinizevjxyzvnn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...      # [.env only — SECRET, never expose]
# Get from: supabase.com → Project Settings → API

# ─────────────────────────────────────────────────────────────────────────
# SIGNALWIRE (SMS Provider)
# ─────────────────────────────────────────────────────────────────────────
SIGNALWIRE_PROJECT_ID=your_project_id      # [both]
SIGNALWIRE_API_TOKEN=your_api_token        # [both]
SIGNALWIRE_SPACE_URL=hv-agency.signalwire.com  # [both]
SIGNALWIRE_PHONE_NUMBER=+1xxxxxxxxxx       # [.env]
# Get from: signalwire.com → Your Space → API tab

# ─────────────────────────────────────────────────────────────────────────
# ANTHROPIC (Claude API)
# ─────────────────────────────────────────────────────────────────────────
ANTHROPIC_API_KEY=sk-ant-...               # [n8n only — used inside n8n HTTP Request nodes]
# Get from: console.anthropic.com → API Keys

# ─────────────────────────────────────────────────────────────────────────
# OPENROUTER (Nemotron — free orchestration layer)
# ─────────────────────────────────────────────────────────────────────────
OPENROUTER_API_KEY=sk-or-...               # [both — used by OpenClaw agents]
OPENROUTER_MODEL=nvidia/nemotron-3-super-120b  # free tier model
# Get from: openrouter.ai → API Keys
# Note: Nemotron 3 Super 120B is currently free. Budget $5/month as floor for when this ends.

# ─────────────────────────────────────────────────────────────────────────
# N8N CLOUD
# ─────────────────────────────────────────────────────────────────────────
N8N_WEBHOOK_BASE_URL=https://krn8n9394.app.n8n.cloud
N8N_API_KEY=your_n8n_api_key               # [.env]
# Get from: n8n Cloud → Settings → API → Create API Key

# ─────────────────────────────────────────────────────────────────────────
# JOBBER
# ─────────────────────────────────────────────────────────────────────────
JOBBER_WEBHOOK_SECRET=leave_blank_for_now  # [.env]
# Fill when first contractor signs: Jobber Account Settings → Integrations → Webhooks

# ─────────────────────────────────────────────────────────────────────────
# WORKFLOW CONFIGURATION
# ─────────────────────────────────────────────────────────────────────────
AFTER_HOURS_CONFIDENCE_THRESHOLD=0.85
MISSED_CALL_CONFIDENCE_THRESHOLD=0.80
MISSED_CALL_DEDUP_WINDOW_HOURS=24

# ─────────────────────────────────────────────────────────────────────────
# OPENCLAW / NEMOCLAW (Partner+ tiers only — not needed for Foundation)
# ─────────────────────────────────────────────────────────────────────────
NEMOCLAW_VPS_HOST=your-vps-ip-or-domain
NEMOCLAW_VPS_PORT=8080
NEMOCLAW_ADMIN_KEY=your_nemoclaw_admin_key
# These are set on the VPS itself, not in the Next.js app
# Reference here for documentation purposes

# Per-contractor OpenClaw config is stored in NemoClaw sandbox, not here
# Each contractor's sandbox has its own isolated credentials

# ─────────────────────────────────────────────────────────────────────────
# COST PROTECTION
# ─────────────────────────────────────────────────────────────────────────
CLAUDE_MONTHLY_BUDGET_PER_CONTRACTOR=150
# When Claude spend hits this per contractor, overflow routes to Nemotron fallback
# This is enforced in OpenClaw agent config, not in Next.js
```

---

## Setup Checklist

- [ ] Create `.env` at project root
- [ ] Supabase: confirm project exists at `cdofgroinizevjxyzvnn.supabase.co`, run `docs/SUPABASE_SCHEMA.sql`
- [ ] SignalWire: confirm space `hv-agency.signalwire.com`, provision number per new contractor
- [ ] Anthropic API key: add to n8n credentials, not `.env` (used inside n8n, not Next.js)
- [ ] OpenRouter: create account, get API key for Nemotron (free)
- [ ] n8n: confirm instance at `krn8n9394.app.n8n.cloud`, get API key
- [ ] Jobber: leave blank until first contractor signs
- [ ] Keep `.env` in `.gitignore` — never commit
