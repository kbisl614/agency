# Credential Setup Guide with Direct Links

Copy the `.env` template below into your `.env` file and fill in the values from the links provided.

## Quick Copy-Paste Template

```env
# ============================================================================
# ENVIRONMENT CONFIGURATION — Agency AI Ops
# ============================================================================
# STORAGE LOCATION KEY:
#   [.env] = You fill this in here
#   [n8n] = Claude will add to n8n (don't put in .env)
#   [Both] = You fill in .env, Claude copies to n8n
# ============================================================================

# FASTAPI BACKEND
FASTAPI_BASE_URL=https://your-fastapi-backend-url.com
# STORAGE: [.env]

# SUPABASE
SUPABASE_PROJECT_URL=https://[YOUR_PROJECT_ID].supabase.co
# STORAGE: [Both]
SUPABASE_ANON_KEY=your_anon_key_here
# STORAGE: [Both]
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
# STORAGE: [.env only - SECRET]

# TWILIO
TWILIO_ACCOUNT_SID=your_account_sid_here
# STORAGE: [n8n] - Claude will add to n8n
TWILIO_AUTH_TOKEN=your_auth_token_here
# STORAGE: [n8n] - Claude will add to n8n
TWILIO_PHONE_NUMBER=+1234567890
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

# LOGGING & MONITORING
LOG_LEVEL=info

# WORKFLOW CONFIGURATION
AFTER_HOURS_CONFIDENCE_THRESHOLD=0.85
MISSED_CALL_CONFIDENCE_THRESHOLD=0.8
MISSED_CALL_DEDUP_WINDOW_HOURS=24
```

---

## Where to Get Each Credential

### 1. FASTAPI_BASE_URL
**What it is**: Your deployed backend URL  
**Where to get it**: Check your deployment platform dashboard  
**Links to check**:
- Railway: https://railway.app/dashboard
- Render: https://dashboard.render.com
- Vercel: https://vercel.com/dashboard
- Your provider's dashboard  

**Example**: `https://agency-api-prod.railway.app`

---

### 2. SUPABASE_PROJECT_URL
**What it is**: Your Supabase database URL  
**Where to get it**: https://supabase.com/dashboard  
**Steps**:
1. Sign up at https://supabase.com
2. Create new project
3. Go to **Settings → API**
4. Copy "Project URL" (looks like `https://[id].supabase.co`)

**Storage**: Fill in `.env` AND I'll add to n8n

---

### 3. SUPABASE_ANON_KEY
**What it is**: Public API key for Supabase  
**Where to get it**: https://supabase.com/dashboard  
**Steps**:
1. Your project → **Settings → API**
2. Copy the "anon public" key (starts with `eyJ...`)

**Storage**: Fill in `.env` AND I'll add to n8n

---

### 4. SUPABASE_SERVICE_ROLE_KEY ⚠️ SECRET
**What it is**: Secret key for backend (NEVER expose publicly)  
**Where to get it**: https://supabase.com/dashboard  
**Steps**:
1. Your project → **Settings → API**
2. Copy the "service_role" key (marked `[SECRET]`)

**Storage**: ⚠️ ONLY in `.env`, NEVER in n8n or public

---

### 5. TWILIO_ACCOUNT_SID
**What it is**: Twilio account identifier  
**Where to get it**: https://console.twilio.com/  
**Steps**:
1. Sign up at https://www.twilio.com
2. Log into console: https://console.twilio.com
3. Dashboard → Copy "Account SID"

**Storage**: Fill in `.env`, I'll add to n8n

---

### 6. TWILIO_AUTH_TOKEN
**What it is**: Twilio API authentication token  
**Where to get it**: https://console.twilio.com/  
**Steps**:
1. Console → Dashboard
2. Copy "Auth Token" (next to Account SID)

**Storage**: Fill in `.env`, I'll add to n8n

---

### 7. TWILIO_PHONE_NUMBER
**What it is**: Your Twilio SMS phone number  
**Where to get it**: https://console.twilio.com/phone-numbers/incoming  
**Steps**:
1. Console → **Phone Numbers → Manage Numbers → Buy a Number**
2. Select country/area code, buy number
3. Copy in E.164 format: `+1234567890`

**Storage**: Fill in `.env`, I'll add to n8n

**Then configure webhooks**:
- Phone Numbers → Your number → **Configure**
- "A Message Comes In" → Set webhook to: `https://YOUR_N8N_URL/webhook/after-hours-capture`
- "A Call Comes In" → Set webhook to: `https://YOUR_N8N_URL/webhook/missed-call-recovery`

---

### 8. JOBBER_WEBHOOK_SECRET
**What it is**: Jobber webhook authentication key  
**Where to get it**: Jobber Account Settings → Integrations  
**Link**: https://app.jobber.com/settings/integrations  

**Status**: ⏳ Leave blank for now  
**Why**: You don't have a paying Jobber account yet  
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

- [ ] Create Supabase project, run schema SQL, get API keys
- [ ] Create Twilio account, buy phone number, configure webhooks
- [ ] Create n8n workflows (empty, just the names)
- [ ] Get n8n webhook URLs from each workflow
- [ ] Fill in all credentials in `.env`
- [ ] Notify Claude when ready to proceed

## What I'll Do

Once you fill in `.env`, I will:
- ✓ Read your Twilio credentials from `.env`
- ✓ Create Twilio credentials in n8n
- ✓ Read your Supabase credentials from `.env`
- ✓ Create Supabase credentials in n8n
- ✓ Build both workflows with all nodes
- ✓ Connect all the integrations
- ✓ Test end-to-end

You just provide the credentials, I handle the rest.
