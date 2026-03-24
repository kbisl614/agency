# n8n AI Workflow Generation Prompt

**Copy everything below and paste into n8n's AI assistant chat**

---

Build me two complete n8n workflows with all nodes, connections, and parameters configured. Use the exact specifications below.

## Workflow 1: lead-capture-hvac-agency

**Purpose:** Capture SMS leads after hours with AI qualification

**Trigger:** Webhook POST to `/lead-capture-hvac`

**Nodes (in order):**

1. **Webhook** — receives POST from SignalWire
   - Path: `lead-capture-hvac`
   - Method: POST
   - Response: onReceived (200)

2. **Extract Signal** (Set node)
   - Extract from webhook:
     - `from_phone` = `$node.Webhook.json.From`
     - `message_text` = `$node.Webhook.json.Body`
     - `received_timestamp` = current ISO datetime

3. **Analyze Intent** (Set node)
   - Calculate:
     - `intent_keywords` = search message for ["emergency", "urgent", "asap", "broken", "leaking", "not working"]
     - `urgency_score` = 0.9 if emergency keywords found, else 0.5
     - `message_quality_score` = 0.8 if message > 10 chars, else 0.4
     - `confidence_threshold` = 0.85

4. **Create Lead** (Supabase node)
   - Operation: INSERT into `public.leads` table
   - Columns: phone, message_text, received_timestamp, intent_keywords, urgency_score, message_quality_score, status, source, created_at
   - Values:
     - phone: `$node["Extract Signal"].json.from_phone`
     - message_text: `$node["Extract Signal"].json.message_text`
     - received_timestamp: `$node["Extract Signal"].json.received_timestamp`
     - intent_keywords: `$node["Analyze Intent"].json.intent_keywords`
     - urgency_score: `$node["Analyze Intent"].json.urgency_score`
     - message_quality_score: `$node["Analyze Intent"].json.message_quality_score`
     - status: "new"
     - source: "lead_capture_hvac_agency"
     - created_at: current ISO datetime

5. **Decision: Send SMS?** (If node)
   - Condition: `$node["Analyze Intent"].json.message_quality_score >= $node["Analyze Intent"].json.confidence_threshold`
   - True branch → Send SMS
   - False branch → Log Human Review

6. **Send SMS** (Twilio node, TRUE branch)
   - Operation: Send SMS
   - To: `$node["Extract Signal"].json.from_phone`
   - Message: "Hi! We received your request. A team member will follow up within 30 minutes. Reply STOP to opt out."

7. **Log Success** (Supabase node, after Send SMS)
   - Operation: INSERT into `public.actions` table
   - Columns: timestamp, action_type, description, agent_name, confidence_score, revenue_impact, success, lead_id, sms_sid, created_at
   - Values:
     - timestamp: current ISO datetime
     - action_type: "sms_sent"
     - description: "SMS sent to {phone}"
     - agent_name: "lead_capture_hvac_agency"
     - confidence_score: `$node["Analyze Intent"].json.message_quality_score`
     - revenue_impact: 500
     - success: true
     - lead_id: `$node["Create Lead"].json.id`
     - sms_sid: `$node["Send SMS"].json.sid`
     - created_at: current ISO datetime

8. **Log Human Review** (Supabase node, FALSE branch)
   - Operation: INSERT into `public.actions` table
   - Columns: timestamp, action_type, description, agent_name, confidence_score, revenue_impact, success, lead_id, created_at
   - Values:
     - timestamp: current ISO datetime
     - action_type: "human_review_needed"
     - description: "Low confidence - needs human review"
     - agent_name: "lead_capture_hvac_agency"
     - confidence_score: `$node["Analyze Intent"].json.message_quality_score`
     - revenue_impact: null
     - success: false
     - lead_id: `$node["Create Lead"].json.id`
     - created_at: current ISO datetime

**Connections:**
- Webhook → Extract Signal
- Extract Signal → Analyze Intent
- Analyze Intent → Create Lead
- Create Lead → Decision: Send SMS?
- Decision: Send SMS? → (TRUE) Send SMS → Log Success
- Decision: Send SMS? → (FALSE) Log Human Review

---

## Workflow 2: call-recover-hvac-agency

**Purpose:** Recover missed calls with 24-hour deduplication

**Trigger:** Webhook POST to `/call-recover-hvac`

**Nodes (in order):**

1. **Webhook** — receives POST from Jobber or mock
   - Path: `call-recover-hvac`
   - Method: POST
   - Response: onReceived (200)

2. **Extract Data** (Set node)
   - Extract from webhook:
     - `phone` = `$node.Webhook.json.phone` OR `$node.Webhook.json.From`
     - `received_timestamp` = `$node.Webhook.json.timestamp` OR current ISO datetime
     - `source_type` = `$node.Webhook.json.source` OR "missed_call"

3. **Check Duplicates** (Supabase node)
   - Operation: SELECT from `public.leads` table
   - WHERE:
     - phone = `$node["Extract Data"].json.phone`
     - created_at > (now - 24 hours)

4. **Is Duplicate?** (If node)
   - Condition: `$node["Check Duplicates"].json.length > 0`
   - True branch (IS duplicate) → Log Dedup Skip
   - False branch (NOT duplicate) → Create Lead

5. **Log Dedup Skip** (Supabase node, TRUE branch)
   - Operation: INSERT into `public.actions` table
   - Columns: timestamp, action_type, description, agent_name, success, created_at
   - Values:
     - timestamp: current ISO datetime
     - action_type: "dedup_blocked"
     - description: "Skipped: lead already in 24h window for {phone}"
     - agent_name: "call_recover_hvac_agency"
     - success: false
     - created_at: current ISO datetime
   - **STOP here (do not continue to SMS)**

6. **Create Lead** (Supabase node, FALSE branch)
   - Operation: INSERT into `public.leads` table
   - Columns: phone, message_text, received_timestamp, intent_keywords, urgency_score, message_quality_score, status, source, created_at
   - Values:
     - phone: `$node["Extract Data"].json.phone`
     - message_text: "Missed call - no message"
     - received_timestamp: `$node["Extract Data"].json.received_timestamp`
     - intent_keywords: "missed_call"
     - urgency_score: 0.8
     - message_quality_score: 0.7
     - status: "new"
     - source: "call_recover_hvac_agency"
     - created_at: current ISO datetime

7. **Analyze Confidence** (Set node)
   - Set:
     - `confidence_score` = 0.8
     - `should_send` = true

8. **Decision: Send?** (If node)
   - Condition: `$node["Analyze Confidence"].json.should_send === true`
   - True branch → Send SMS
   - False branch → Log Skipped

9. **Send SMS** (Twilio node, TRUE branch)
   - Operation: Send SMS
   - To: `$node["Extract Data"].json.phone`
   - Message: "We noticed we missed your call. A team member will reach out shortly. Reply STOP to opt out."

10. **Log Success** (Supabase node, after Send SMS)
    - Operation: INSERT into `public.actions` table
    - Columns: timestamp, action_type, description, agent_name, confidence_score, revenue_impact, success, lead_id, sms_sid, created_at
    - Values:
      - timestamp: current ISO datetime
      - action_type: "sms_sent"
      - description: "Missed call recovery SMS sent to {phone}"
      - agent_name: "call_recover_hvac_agency"
      - confidence_score: `$node["Analyze Confidence"].json.confidence_score`
      - revenue_impact: 500
      - success: true
      - lead_id: `$node["Create Lead"].json.id`
      - sms_sid: `$node["Send SMS"].json.sid`
      - created_at: current ISO datetime

11. **Log Skipped** (Supabase node, FALSE branch)
    - Operation: INSERT into `public.actions` table
    - Columns: timestamp, action_type, description, agent_name, success, created_at
    - Values:
      - timestamp: current ISO datetime
      - action_type: "sms_skipped"
      - description: "Skipped: should_send not met"
      - agent_name: "call_recover_hvac_agency"
      - success: false
      - created_at: current ISO datetime

**Connections:**
- Webhook → Extract Data
- Extract Data → Check Duplicates
- Check Duplicates → Is Duplicate?
- Is Duplicate? → (TRUE) Log Dedup Skip [STOP]
- Is Duplicate? → (FALSE) Create Lead
- Create Lead → Analyze Confidence
- Analyze Confidence → Decision: Send?
- Decision: Send? → (TRUE) Send SMS → Log Success
- Decision: Send? → (FALSE) Log Skipped

---

## Credentials Required

Both workflows use:
- **Supabase** credential (for all database operations)
- **Twilio** credential configured for SignalWire (for SMS sending)

Make sure these are set up in your n8n workspace before deploying.

---

## Testing

Once deployed:
1. Click "Publish" on each workflow
2. Click "Activate" toggle
3. Test with webhook POST requests to verify data flows to Supabase

---
