# Credential Setup Guide with Direct Links

Copy the `.env` template below into your `.env` file and fill in the values from the links provided.

## Quick Copy-Paste Template

```env
# ============================================================================
# ENVIRONMENT CONFIGURATION — Fieldline AI
# ============================================================================
# STORAGE LOCATION KEY:
#   [.env] = You fill this in here
#   [n8n] = Claude will add to n8n (don't put in .env)
#   [Both] = You fill in .env, Claude copies to n8n
# ============================================================================

# SUPABASE
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR_PROJECT_ID].supabase.co
# STORAGE: [Both]
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
# STORAGE: [Both]
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
# STORAGE: [.env only - SECRET]

# SIGNALWIRE
SIGNALWIRE_PROJECT_ID=your_signalwire_project_id
# STORAGE: [n8n] - Claude will add to n8n
SIGNALWIRE_API_TOKEN=your_signalwire_api_token
# STORAGE: [n8n] - Claude will add to n8n
SIGNALWIRE_SPACE_URL=your-space.signalwire.com
# STORAGE: [n8n] - Claude will add to n8n
SIGNALWIRE_PHONE_NUMBER=+1234567890
# STORAGE: [n8n] - Claude will add to n8n

# JOBBER
JOBBER_WEBHOOK_SECRET=leave_blank_for_now
# STORAGE: [.env only]
# STATUS: ⏳ Will setup when you get Jobber API access

# N8N CLOUD
N8N_WEBHOOK_BASE_URL=https://your-n8n-instance.app.n8n.cloud
# STORAGE: [.env]
N8N_AFTER_HOURS_WEBHOOK_URL=https://your-n8n-instance.app.n8n.cloud/webhook/after-hours-capture
# STORAGE: [.env]
N8N_MISSED_CALL_WEBHOOK_URL=https://your-n8n-instance.app.n8n.cloud/webhook/missed-call-recovery
# STORAGE: [.env]

# WORKFLOW CONFIGURATION
AFTER_HOURS_CONFIDENCE_THRESHOLD=0.85
MISSED_CALL_CONFIDENCE_THRESHOLD=0.8
MISSED_CALL_DEDUP_WINDOW_HOURS=24
```

---

## Where to Get Each Credential

### 1. NEXT_PUBLIC_SUPABASE_URL
**What it is**: Your Supabase database URL
**Where to get it**: https://supabase.com/dashboard
**Steps**:
1. Sign up at https://supabase.com
2. Create new project
3. Go to **Settings → API**
4. Copy "Project URL" (looks like `https://[id].supabase.co`)

**Storage**: Fill in `.env` AND I'll add to n8n

---

### 2. NEXT_PUBLIC_SUPABASE_ANON_KEY
**What it is**: Public API key for Supabase
**Where to get it**: https://supabase.com/dashboard
**Steps**:
1. Your project → **Settings → API**
2. Copy the "anon public" key (starts with `eyJ...`)

**Storage**: Fill in `.env` AND I'll add to n8n

---

### 3. SUPABASE_SERVICE_ROLE_KEY ⚠️ SECRET
**What it is**: Secret key for backend operations (NEVER expose publicly)
**Where to get it**: https://supabase.com/dashboard
**Steps**:
1. Your project → **Settings → API**
2. Copy the "service_role" key (marked `[SECRET]`)

**Storage**: ⚠️ ONLY in `.env`, never in n8n or frontend code

---

### 4. SIGNALWIRE_PROJECT_ID
**What it is**: SignalWire account/project identifier
**Where to get it**: https://signalwire.com → your space dashboard
**Steps**:
1. Log in to SignalWire
2. Go to your Space → **API** tab
3. Copy "Project ID"

**Storage**: Fill in `.env`, I'll add to n8n

---

### 5. SIGNALWIRE_API_TOKEN
**What it is**: SignalWire API authentication token
**Where to get it**: https://signalwire.com → your space dashboard
**Steps**:
1. Space → **API** tab
2. Copy "API Token"

**Storage**: Fill in `.env`, I'll add to n8n

---

### 6. SIGNALWIRE_SPACE_URL
**What it is**: Your SignalWire space domain
**Example**: `yourname.signalwire.com`
**Where to get it**: The subdomain of your SignalWire space

**Storage**: Fill in `.env`, I'll add to n8n

---

### 7. SIGNALWIRE_PHONE_NUMBER
**What it is**: Your SignalWire SMS phone number
**Where to get it**: SignalWire dashboard → Phone Numbers
**Steps**:
1. Dashboard → **Phone Numbers → Buy or provision a number**
2. Copy in E.164 format: `+1234567890`

**Storage**: Fill in `.env`, I'll add to n8n

**Then configure webhooks**:
- Phone Numbers → Your number → **Configure**
- "Incoming SMS" → Set webhook to: `https://YOUR_N8N_URL/webhook/after-hours-capture`
- "Incoming Call" → Set webhook to: `https://YOUR_N8N_URL/webhook/missed-call-recovery`

---

### 8. JOBBER_WEBHOOK_SECRET
**What it is**: Jobber webhook authentication key
**Where to get it**: Jobber Account Settings → Integrations
**Link**: https://app.jobber.com/settings/integrations

**Status**: ⏳ Leave blank for now
**Why**: You need a paying Jobber account with API access
**When to fill**: After you upgrade and get API access

---

### 9. N8N_WEBHOOK_BASE_URL
**What it is**: Your n8n Cloud instance URL
**Where to get it**: https://app.n8n.cloud
**Steps**:
1. Log into n8n Cloud
2. Copy base URL from browser: `https://[workspace].app.n8n.cloud`

**Storage**: Fill in `.env`

---

### 10. N8N_AFTER_HOURS_WEBHOOK_URL & N8N_MISSED_CALL_WEBHOOK_URL
**What it is**: Webhook URLs for your workflows
**Where to get it**: Inside each n8n workflow
**Steps**:
1. Go to n8n Cloud → Your workflow
2. Open **Webhook** trigger node
3. Click **"Copy URL"** button
4. Paste into `.env`

**Storage**: Fill in `.env`

---

## Setup Checklist

- [ ] Create Supabase project, run `docs/SUPABASE_SCHEMA.sql`, get API keys
- [ ] Create SignalWire account, provision phone number, configure webhooks
- [ ] Create n8n workflows (or confirm existing IDs)
- [ ] Get n8n webhook URLs from each workflow
- [ ] Fill in all credentials in `.env`
- [ ] Notify Claude when ready to proceed

## What I'll Do

Once you fill in `.env`, I will:
- ✓ Read your SignalWire credentials from `.env`
- ✓ Create SignalWire credentials in n8n
- ✓ Read your Supabase credentials from `.env`
- ✓ Create Supabase credentials in n8n
- ✓ Build both workflows with all nodes
- ✓ Connect all the integrations
- ✓ Test end-to-end

You just provide the credentials, I handle the rest.
