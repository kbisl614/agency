# n8n AI Prompt — Workflow 2: call-recover-hvac-agency

**Copy everything below and paste into n8n's AI assistant**

---

Build me a complete n8n workflow named "call-recover-hvac-agency" that recovers missed calls with 24-hour deduplication and automatic SMS response.

## Trigger
- **Webhook** node
  - Path: `call-recover-hvac`
  - HTTP Method: POST
  - Response Mode: On Received
  - Response Code: 200

## Node 1: Extract Data (Set node)
Extract data from the webhook:
- `phone` = `{{ $node.Webhook.json.phone || $node.Webhook.json.From }}`
- `received_timestamp` = `{{ $node.Webhook.json.timestamp || new Date().toISOString() }}`
- `source_type` = `{{ $node.Webhook.json.source || "missed_call" }}`

## Node 2: Check Duplicates (Supabase node)
- Resource: Database
- Operation: Select
- Schema: public
- Table: leads
- WHERE conditions (both must be true):
  - Column: phone, Operator: equals, Value: `{{ $node["Extract Data"].json.phone }}`
  - Column: created_at, Operator: is greater than, Value: `{{ new Date(new Date().getTime() - 24 * 60 * 60 * 1000).toISOString() }}`
- This checks if the phone number has a lead created in the last 24 hours

## Node 3: Is Duplicate? (If node)
- Condition: Check if `{{ $node["Check Duplicates"].json.length }}` is greater than 0
- This creates two branches: TRUE (is duplicate) and FALSE (not duplicate)

## Node 4: Log Dedup Skip (Supabase node) — Connected to TRUE branch
- Resource: Database
- Operation: Insert
- Schema: public
- Table: actions
- Columns: timestamp, action_type, description, agent_name, success, created_at
- Values:
  - timestamp: `{{ new Date().toISOString() }}`
  - action_type: "dedup_blocked"
  - description: "Skipped: lead already captured in 24h window for {{ $node["Extract Data"].json.phone }}"
  - agent_name: "call_recover_hvac_agency"
  - success: false
  - created_at: `{{ new Date().toISOString() }}`
- **IMPORTANT:** This branch STOPS here — no SMS is sent for duplicates

## Node 5: Create Lead (Supabase node) — Connected to FALSE branch
- Resource: Database
- Operation: Insert
- Schema: public
- Table: leads
- Columns: phone, message_text, received_timestamp, intent_keywords, urgency_score, message_quality_score, status, source, created_at
- Values:
  - phone: `{{ $node["Extract Data"].json.phone }}`
  - message_text: "Missed call - no message"
  - received_timestamp: `{{ $node["Extract Data"].json.received_timestamp }}`
  - intent_keywords: "missed_call"
  - urgency_score: 0.8
  - message_quality_score: 0.7
  - status: "new"
  - source: "call_recover_hvac_agency"
  - created_at: `{{ new Date().toISOString() }}`

## Node 6: Analyze Confidence (Set node)
Set confidence values for missed call SMS:
- `confidence_score` = 0.8
- `should_send` = true

## Node 7: Decision: Send? (If node)
- Condition: Check if `{{ $node["Analyze Confidence"].json.should_send }}` equals true
- This creates two branches: TRUE and FALSE

## Node 8: Send SMS (Twilio node) — Connected to TRUE branch
- Resource: SMS
- Operation: Send
- To Number: `{{ $node["Extract Data"].json.phone }}`
- Message: "We noticed we missed your call. A team member will reach out shortly. Reply STOP to opt out."

## Node 9: Log Success (Supabase node) — Connected after Send SMS
- Resource: Database
- Operation: Insert
- Schema: public
- Table: actions
- Columns: timestamp, action_type, description, agent_name, confidence_score, revenue_impact, success, lead_id, sms_sid, created_at
- Values:
  - timestamp: `{{ new Date().toISOString() }}`
  - action_type: "sms_sent"
  - description: "Missed call recovery SMS sent to {{ $node["Extract Data"].json.phone }}"
  - agent_name: "call_recover_hvac_agency"
  - confidence_score: `{{ $node["Analyze Confidence"].json.confidence_score }}`
  - revenue_impact: 500
  - success: true
  - lead_id: `{{ $node["Create Lead"].json.id }}`
  - sms_sid: `{{ $node["Send SMS"].json.sid }}`
  - created_at: `{{ new Date().toISOString() }}`

## Node 10: Log Skipped (Supabase node) — Connected to FALSE branch
- Resource: Database
- Operation: Insert
- Schema: public
- Table: actions
- Columns: timestamp, action_type, description, agent_name, success, created_at
- Values:
  - timestamp: `{{ new Date().toISOString() }}`
  - action_type: "sms_skipped"
  - description: "Skipped: should_send condition not met"
  - agent_name: "call_recover_hvac_agency"
  - success: false
  - created_at: `{{ new Date().toISOString() }}`

## Connections (Flow)
1. Webhook → Extract Data
2. Extract Data → Check Duplicates
3. Check Duplicates → Is Duplicate?
4. Is Duplicate? → TRUE branch → Log Dedup Skip (STOPS)
5. Is Duplicate? → FALSE branch → Create Lead
6. Create Lead → Analyze Confidence
7. Analyze Confidence → Decision: Send?
8. Decision: Send? → TRUE branch → Send SMS → Log Success
9. Decision: Send? → FALSE branch → Log Skipped

## Credentials
- Use your Supabase credential for all Supabase nodes (Check Duplicates, Create Lead, Log Dedup Skip, Log Success, Log Skipped)
- Use your Twilio credential (configured for SignalWire) for the Send SMS node

## After Building
1. Click **"Publish"** button (top right)
2. Click **"Activate"** toggle to enable the workflow
3. Test by sending a POST to the webhook URL with sample data including a phone number

---
