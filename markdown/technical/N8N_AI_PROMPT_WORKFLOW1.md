# n8n AI Prompt — Workflow 1: lead-capture-hvac-agency

**Copy everything below and paste into n8n's AI assistant**

---

Build me a complete n8n workflow named "lead-capture-hvac-agency" that captures SMS leads after hours with AI qualification.

## Trigger
- **Webhook** node
  - Path: `lead-capture-hvac`
  - HTTP Method: POST
  - Response Mode: On Received
  - Response Code: 200

## Node 1: Extract Signal (Set node)
Extract data from the webhook:
- `from_phone` = `{{ $node.Webhook.json.From }}`
- `message_text` = `{{ $node.Webhook.json.Body }}`
- `received_timestamp` = `{{ new Date().toISOString() }}`

## Node 2: Analyze Intent (Set node)
Calculate intent signals:
- `intent_keywords` = Search the message_text for these keywords: ["emergency", "urgent", "asap", "broken", "leaking", "not working"]. Return comma-separated list of found keywords, or "general" if none found.
- `urgency_score` = 0.9 if any of ["emergency", "urgent", "asap", "broken"] are found in message, else 0.5
- `message_quality_score` = 0.8 if message_text length > 10 characters, else 0.4
- `confidence_threshold` = 0.85

## Node 3: Create Lead (Supabase node)
- Resource: Database
- Operation: Insert
- Schema: public
- Table: leads
- Columns: phone, message_text, received_timestamp, intent_keywords, urgency_score, message_quality_score, status, source, created_at
- Values:
  - phone: `{{ $node["Extract Signal"].json.from_phone }}`
  - message_text: `{{ $node["Extract Signal"].json.message_text }}`
  - received_timestamp: `{{ $node["Extract Signal"].json.received_timestamp }}`
  - intent_keywords: `{{ $node["Analyze Intent"].json.intent_keywords }}`
  - urgency_score: `{{ $node["Analyze Intent"].json.urgency_score }}`
  - message_quality_score: `{{ $node["Analyze Intent"].json.message_quality_score }}`
  - status: "new"
  - source: "lead_capture_hvac_agency"
  - created_at: `{{ new Date().toISOString() }}`

## Node 4: Decision: Send SMS? (If node)
- Condition: Check if `{{ $node["Analyze Intent"].json.message_quality_score }}` is greater than or equal to `{{ $node["Analyze Intent"].json.confidence_threshold }}`
- This creates two branches: TRUE and FALSE

## Node 5: Send SMS (Twilio node) — Connected to TRUE branch
- Resource: SMS
- Operation: Send
- To Number: `{{ $node["Extract Signal"].json.from_phone }}`
- Message: "Hi! We received your request. A team member will follow up within 30 minutes. Reply STOP to opt out."

## Node 6: Log Success (Supabase node) — Connected after Send SMS
- Resource: Database
- Operation: Insert
- Schema: public
- Table: actions
- Columns: timestamp, action_type, description, agent_name, confidence_score, revenue_impact, success, lead_id, sms_sid, created_at
- Values:
  - timestamp: `{{ new Date().toISOString() }}`
  - action_type: "sms_sent"
  - description: "SMS sent to {{ $node["Extract Signal"].json.from_phone }}"
  - agent_name: "lead_capture_hvac_agency"
  - confidence_score: `{{ $node["Analyze Intent"].json.message_quality_score }}`
  - revenue_impact: 500
  - success: true
  - lead_id: `{{ $node["Create Lead"].json.id }}`
  - sms_sid: `{{ $node["Send SMS"].json.sid }}`
  - created_at: `{{ new Date().toISOString() }}`

## Node 7: Log Human Review (Supabase node) — Connected to FALSE branch
- Resource: Database
- Operation: Insert
- Schema: public
- Table: actions
- Columns: timestamp, action_type, description, agent_name, confidence_score, revenue_impact, success, lead_id, created_at
- Values:
  - timestamp: `{{ new Date().toISOString() }}`
  - action_type: "human_review_needed"
  - description: "Low confidence ({{ $node["Analyze Intent"].json.message_quality_score }}) - needs human review"
  - agent_name: "lead_capture_hvac_agency"
  - confidence_score: `{{ $node["Analyze Intent"].json.message_quality_score }}`
  - revenue_impact: null
  - success: false
  - lead_id: `{{ $node["Create Lead"].json.id }}`
  - created_at: `{{ new Date().toISOString() }}`

## Connections (Flow)
1. Webhook → Extract Signal
2. Extract Signal → Analyze Intent
3. Analyze Intent → Create Lead
4. Create Lead → Decision: Send SMS?
5. Decision: Send SMS? → TRUE branch → Send SMS → Log Success
6. Decision: Send SMS? → FALSE branch → Log Human Review

## Credentials
- Use your Supabase credential for all Supabase nodes (Create Lead, Log Success, Log Human Review)
- Use your Twilio credential (configured for SignalWire) for the Send SMS node

## After Building
1. Click **"Publish"** button (top right)
2. Click **"Activate"** toggle to enable the workflow
3. Test by sending a POST to the webhook URL with sample data

---
