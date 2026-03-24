#!/usr/bin/env node

const https = require('https');
const fs = require('fs');
const path = require('path');

// Load .env
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match && !line.startsWith('#')) {
    env[match[1].trim()] = match[2].trim();
  }
});

const N8N_API_KEY = env.N8N_API_KEY;
const N8N_BASE_URL = 'https://krn8n9394.app.n8n.cloud';

// Credential IDs (found via API)
const SUPABASE_CREDENTIAL_ID = 'Pm10coWJeiICVYIi';
const SIGNALWIRE_CREDENTIAL_ID = 'r9gOGGtsAO3GswJR';

// Workflow IDs
const AFTER_HOURS_WF_ID = 'jlWxZ52pFxelh7aU';
const MISSED_CALL_WF_ID = 'EjrtbF205kPsOCxO';

function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, N8N_BASE_URL);
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'X-N8N-API-KEY': N8N_API_KEY,
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode >= 400) {
            reject(new Error(`API Error (${res.statusCode}): ${data}`));
          } else {
            resolve(parsed);
          }
        } catch (e) {
          reject(new Error(`Failed to parse response: ${data}`));
        }
      });
    });

    req.on('error', reject);
    if (body) { req.write(JSON.stringify(body)); }
    req.end();
  });
}

async function buildAfterHoursWorkflow() {
  console.log('🚀 Building tier1_after_hours_lead_capture...\n');

  const workflow = {
    name: 'tier1_after_hours_lead_capture',
    nodes: [
      {
        name: 'Webhook',
        type: 'n8n-nodes-base.webhook',
        typeVersion: 1,
        position: [250, 300],
        webhookId: 'default',
        parameters: {
          path: 'tier1-after-hours-lead-capture',
          httpMethod: 'POST',
          responseMode: 'onReceived',
          responseCode: 200,
        },
      },
      {
        name: 'Extract Signal',
        type: 'n8n-nodes-base.set',
        typeVersion: 1,
        position: [500, 300],
        parameters: {
          values: {
            string: [
              { name: 'from_phone', value: '={{ $node.Webhook.json.From }}' },
              { name: 'message_text', value: '={{ $node.Webhook.json.Body }}' },
              { name: 'received_timestamp', value: '={{ new Date().toISOString() }}' },
            ],
          },
          options: {},
        },
      },
      {
        name: 'Analyze Intent',
        type: 'n8n-nodes-base.set',
        typeVersion: 1,
        position: [750, 300],
        parameters: {
          values: {
            string: [
              {
                name: 'intent_keywords',
                value: '={{ ["emergency", "urgent", "asap", "broken", "leaking", "not working"].filter(k => $node["Extract Signal"].json.message_text.toLowerCase().includes(k)).join(",") || "general" }}',
              },
              {
                name: 'urgency_score',
                value: '={{ ["emergency", "urgent", "asap", "broken"].some(k => $node["Extract Signal"].json.message_text.toLowerCase().includes(k)) ? 0.9 : 0.5 }}',
              },
              {
                name: 'message_quality_score',
                value: '={{ $node["Extract Signal"].json.message_text.length > 10 ? 0.8 : 0.4 }}',
              },
              { name: 'confidence_threshold', value: '=0.85' },
            ],
          },
          options: {},
        },
      },
      {
        name: 'Create Lead',
        type: 'n8n-nodes-base.supabase',
        typeVersion: 1,
        position: [1000, 300],
        credentials: {
          supabaseApi: {
            id: SUPABASE_CREDENTIAL_ID,
            name: 'hvac-agency',
          },
        },
        parameters: {
          resource: 'database',
          operation: 'insert',
          schema: 'public',
          table: 'leads',
          columns: 'phone,message_text,received_timestamp,intent_keywords,urgency_score,message_quality_score,status,source,created_at',
          values: {
            phone: '={{ $node["Extract Signal"].json.from_phone }}',
            message_text: '={{ $node["Extract Signal"].json.message_text }}',
            received_timestamp: '={{ $node["Extract Signal"].json.received_timestamp }}',
            intent_keywords: '={{ $node["Analyze Intent"].json.intent_keywords }}',
            urgency_score: '={{ $node["Analyze Intent"].json.urgency_score }}',
            message_quality_score: '={{ $node["Analyze Intent"].json.message_quality_score }}',
            status: 'new',
            source: 'tier1_after_hours_lead_capture',
            created_at: '={{ new Date().toISOString() }}',
          },
        },
      },
      {
        name: 'Decision: Send SMS?',
        type: 'n8n-nodes-base.if',
        typeVersion: 1,
        position: [1250, 300],
        parameters: {
          conditions: {
            boolean: [
              {
                value1: '={{ $node["Analyze Intent"].json.message_quality_score }}',
                operator: '>=',
                value2: '={{ $node["Analyze Intent"].json.confidence_threshold }}',
              },
            ],
            combinator: 'and',
          },
        },
      },
      {
        name: 'Send SMS',
        type: 'n8n-nodes-base.twilio',
        typeVersion: 1,
        position: [1500, 150],
        credentials: {
          twilioApi: {
            id: SIGNALWIRE_CREDENTIAL_ID,
            name: 'hvac-agency',
          },
        },
        parameters: {
          resource: 'sms',
          operation: 'send',
          toNumber: '={{ $node["Extract Signal"].json.from_phone }}',
          message: '=Hi! We received your request. A team member will follow up within 30 minutes. Reply STOP to opt out.',
        },
      },
      {
        name: 'Log Success',
        type: 'n8n-nodes-base.supabase',
        typeVersion: 1,
        position: [1750, 150],
        credentials: {
          supabaseApi: {
            id: SUPABASE_CREDENTIAL_ID,
            name: 'hvac-agency',
          },
        },
        parameters: {
          resource: 'database',
          operation: 'insert',
          schema: 'public',
          table: 'actions',
          columns: 'timestamp,action_type,description,agent_name,confidence_score,revenue_impact,success,lead_id,sms_sid,created_at',
          values: {
            timestamp: '={{ new Date().toISOString() }}',
            action_type: 'sms_sent',
            description: '=SMS sent to {{ $node["Extract Signal"].json.from_phone }}',
            agent_name: 'tier1_after_hours_lead_capture',
            confidence_score: '={{ $node["Analyze Intent"].json.message_quality_score }}',
            revenue_impact: 500,
            success: true,
            lead_id: '={{ $node["Create Lead"].json.id }}',
            sms_sid: '={{ $node["Send SMS"].json.sid }}',
            created_at: '={{ new Date().toISOString() }}',
          },
        },
      },
      {
        name: 'Log Human Review',
        type: 'n8n-nodes-base.supabase',
        typeVersion: 1,
        position: [1500, 450],
        credentials: {
          supabaseApi: {
            id: SUPABASE_CREDENTIAL_ID,
            name: 'hvac-agency',
          },
        },
        parameters: {
          resource: 'database',
          operation: 'insert',
          schema: 'public',
          table: 'actions',
          columns: 'timestamp,action_type,description,agent_name,confidence_score,revenue_impact,success,lead_id,created_at',
          values: {
            timestamp: '={{ new Date().toISOString() }}',
            action_type: 'human_review_needed',
            description: '=Low confidence ({{ $node["Analyze Intent"].json.message_quality_score }}) - needs human review',
            agent_name: 'tier1_after_hours_lead_capture',
            confidence_score: '={{ $node["Analyze Intent"].json.message_quality_score }}',
            revenue_impact: null,
            success: false,
            lead_id: '={{ $node["Create Lead"].json.id }}',
            created_at: '={{ new Date().toISOString() }}',
          },
        },
      },
    ],
    connections: {
      Webhook: {
        main: [[{ node: 'Extract Signal', type: 'main', index: 0 }]],
      },
      'Extract Signal': {
        main: [[{ node: 'Analyze Intent', type: 'main', index: 0 }]],
      },
      'Analyze Intent': {
        main: [[{ node: 'Create Lead', type: 'main', index: 0 }]],
      },
      'Create Lead': {
        main: [[{ node: 'Decision: Send SMS?', type: 'main', index: 0 }]],
      },
      'Decision: Send SMS?': {
        main: [
          [{ node: 'Send SMS', type: 'main', index: 0 }],
          [{ node: 'Log Human Review', type: 'main', index: 0 }],
        ],
      },
      'Send SMS': {
        main: [[{ node: 'Log Success', type: 'main', index: 0 }]],
      },
    },
    settings: {},
  };

  await makeRequest('PUT', `/api/v1/workflows/${AFTER_HOURS_WF_ID}`, workflow);
  console.log('✅ After-hours workflow built & credentials bound\n');
}

async function buildMissedCallWorkflow() {
  console.log('🚀 Building tier1_missed_call_recovery_sms...\n');

  const workflow = {
    name: 'tier1_missed_call_recovery_sms',
    nodes: [
      {
        name: 'Webhook',
        type: 'n8n-nodes-base.webhook',
        typeVersion: 1,
        position: [250, 300],
        webhookId: 'default',
        parameters: {
          path: 'tier1-missed-call-recovery-sms',
          httpMethod: 'POST',
          responseMode: 'onReceived',
          responseCode: 200,
        },
      },
      {
        name: 'Extract Data',
        type: 'n8n-nodes-base.set',
        typeVersion: 1,
        position: [500, 300],
        parameters: {
          values: {
            string: [
              { name: 'phone', value: '={{ $node.Webhook.json.phone || $node.Webhook.json.From }}' },
              { name: 'received_timestamp', value: '={{ $node.Webhook.json.timestamp || new Date().toISOString() }}' },
              { name: 'source_type', value: '={{ $node.Webhook.json.source || "missed_call" }}' },
            ],
          },
          options: {},
        },
      },
      {
        name: 'Check Duplicates',
        type: 'n8n-nodes-base.supabase',
        typeVersion: 1,
        position: [750, 300],
        credentials: {
          supabaseApi: {
            id: SUPABASE_CREDENTIAL_ID,
            name: 'hvac-agency',
          },
        },
        parameters: {
          resource: 'database',
          operation: 'select',
          schema: 'public',
          table: 'leads',
          where: [
            {
              column: 'phone',
              operator: '=',
              value: '={{ $node["Extract Data"].json.phone }}',
            },
            {
              column: 'created_at',
              operator: '>',
              value: '={{ new Date(new Date().getTime() - 24 * 60 * 60 * 1000).toISOString() }}',
            },
          ],
        },
      },
      {
        name: 'Is Duplicate?',
        type: 'n8n-nodes-base.if',
        typeVersion: 1,
        position: [1000, 300],
        parameters: {
          conditions: {
            number: [
              {
                value1: '={{ $node["Check Duplicates"].json.length }}',
                operator: '>',
                value2: 0,
              },
            ],
            combinator: 'and',
          },
        },
      },
      {
        name: 'Log Dedup Skip',
        type: 'n8n-nodes-base.supabase',
        typeVersion: 1,
        position: [750, 550],
        credentials: {
          supabaseApi: {
            id: SUPABASE_CREDENTIAL_ID,
            name: 'hvac-agency',
          },
        },
        parameters: {
          resource: 'database',
          operation: 'insert',
          schema: 'public',
          table: 'actions',
          columns: 'timestamp,action_type,description,agent_name,success,created_at',
          values: {
            timestamp: '={{ new Date().toISOString() }}',
            action_type: 'dedup_blocked',
            description: '=Skipped: lead already captured in 24h window for {{ $node["Extract Data"].json.phone }}',
            agent_name: 'tier1_missed_call_recovery_sms',
            success: false,
            created_at: '={{ new Date().toISOString() }}',
          },
        },
      },
      {
        name: 'Create Lead',
        type: 'n8n-nodes-base.supabase',
        typeVersion: 1,
        position: [1250, 200],
        credentials: {
          supabaseApi: {
            id: SUPABASE_CREDENTIAL_ID,
            name: 'hvac-agency',
          },
        },
        parameters: {
          resource: 'database',
          operation: 'insert',
          schema: 'public',
          table: 'leads',
          columns: 'phone,message_text,received_timestamp,intent_keywords,urgency_score,message_quality_score,status,source,created_at',
          values: {
            phone: '={{ $node["Extract Data"].json.phone }}',
            message_text: '=Missed call - no message',
            received_timestamp: '={{ $node["Extract Data"].json.received_timestamp }}',
            intent_keywords: 'missed_call',
            urgency_score: 0.8,
            message_quality_score: 0.7,
            status: 'new',
            source: 'tier1_missed_call_recovery_sms',
            created_at: '={{ new Date().toISOString() }}',
          },
        },
      },
      {
        name: 'Analyze Confidence',
        type: 'n8n-nodes-base.set',
        typeVersion: 1,
        position: [1500, 200],
        parameters: {
          values: {
            string: [
              { name: 'confidence_score', value: '=0.8' },
              { name: 'should_send', value: '=true' },
            ],
          },
          options: {},
        },
      },
      {
        name: 'Decision: Send?',
        type: 'n8n-nodes-base.if',
        typeVersion: 1,
        position: [1750, 200],
        parameters: {
          conditions: {
            boolean: [
              {
                value1: '={{ $node["Analyze Confidence"].json.should_send }}',
                operator: '===',
                value2: true,
              },
            ],
            combinator: 'and',
          },
        },
      },
      {
        name: 'Send SMS',
        type: 'n8n-nodes-base.twilio',
        typeVersion: 1,
        position: [2000, 100],
        credentials: {
          twilioApi: {
            id: SIGNALWIRE_CREDENTIAL_ID,
            name: 'hvac-agency',
          },
        },
        parameters: {
          resource: 'sms',
          operation: 'send',
          toNumber: '={{ $node["Extract Data"].json.phone }}',
          message: '=We noticed we missed your call. A team member will reach out shortly. Reply STOP to opt out.',
        },
      },
      {
        name: 'Log Success',
        type: 'n8n-nodes-base.supabase',
        typeVersion: 1,
        position: [2250, 100],
        credentials: {
          supabaseApi: {
            id: SUPABASE_CREDENTIAL_ID,
            name: 'hvac-agency',
          },
        },
        parameters: {
          resource: 'database',
          operation: 'insert',
          schema: 'public',
          table: 'actions',
          columns: 'timestamp,action_type,description,agent_name,confidence_score,revenue_impact,success,lead_id,sms_sid,created_at',
          values: {
            timestamp: '={{ new Date().toISOString() }}',
            action_type: 'sms_sent',
            description: '=Missed call recovery SMS sent to {{ $node["Extract Data"].json.phone }}',
            agent_name: 'tier1_missed_call_recovery_sms',
            confidence_score: '={{ $node["Analyze Confidence"].json.confidence_score }}',
            revenue_impact: 500,
            success: true,
            lead_id: '={{ $node["Create Lead"].json.id }}',
            sms_sid: '={{ $node["Send SMS"].json.sid }}',
            created_at: '={{ new Date().toISOString() }}',
          },
        },
      },
      {
        name: 'Log Skipped',
        type: 'n8n-nodes-base.supabase',
        typeVersion: 1,
        position: [2000, 300],
        credentials: {
          supabaseApi: {
            id: SUPABASE_CREDENTIAL_ID,
            name: 'hvac-agency',
          },
        },
        parameters: {
          resource: 'database',
          operation: 'insert',
          schema: 'public',
          table: 'actions',
          columns: 'timestamp,action_type,description,agent_name,success,created_at',
          values: {
            timestamp: '={{ new Date().toISOString() }}',
            action_type: 'sms_skipped',
            description: '=Skipped: should_send condition not met',
            agent_name: 'tier1_missed_call_recovery_sms',
            success: false,
            created_at: '={{ new Date().toISOString() }}',
          },
        },
      },
    ],
    connections: {
      Webhook: {
        main: [[{ node: 'Extract Data', type: 'main', index: 0 }]],
      },
      'Extract Data': {
        main: [[{ node: 'Check Duplicates', type: 'main', index: 0 }]],
      },
      'Check Duplicates': {
        main: [[{ node: 'Is Duplicate?', type: 'main', index: 0 }]],
      },
      'Is Duplicate?': {
        main: [
          [{ node: 'Log Dedup Skip', type: 'main', index: 0 }],
          [{ node: 'Create Lead', type: 'main', index: 0 }],
        ],
      },
      'Create Lead': {
        main: [[{ node: 'Analyze Confidence', type: 'main', index: 0 }]],
      },
      'Analyze Confidence': {
        main: [[{ node: 'Decision: Send?', type: 'main', index: 0 }]],
      },
      'Decision: Send?': {
        main: [
          [{ node: 'Send SMS', type: 'main', index: 0 }],
          [{ node: 'Log Skipped', type: 'main', index: 0 }],
        ],
      },
      'Send SMS': {
        main: [[{ node: 'Log Success', type: 'main', index: 0 }]],
      },
    },
    settings: {},
  };

  await makeRequest('PUT', `/api/v1/workflows/${MISSED_CALL_WF_ID}`, workflow);
  console.log('✅ Missed call workflow built & credentials bound\n');
}

async function main() {
  console.log('═'.repeat(70));
  console.log('🔧 BUILDING WORKFLOWS WITH CREDENTIAL BINDINGS');
  console.log('═'.repeat(70));
  console.log('');

  try {
    await buildAfterHoursWorkflow();
    await buildMissedCallWorkflow();

    console.log('═'.repeat(70));
    console.log('✨ SUCCESS — Both workflows built with credentials bound!');
    console.log('═'.repeat(70));
    console.log('');
    console.log('📋 Workflow Summary:');
    console.log('');
    console.log('1️⃣  tier1_after_hours_lead_capture (jlWxZ52pFxelh7aU)');
    console.log('   └─ Webhook → Parse → Analyze → Create Lead → Decision');
    console.log('      ├─ High confidence (≥0.85) → Send SMS → Log Success');
    console.log('      └─ Low confidence → Log Human Review');
    console.log('');
    console.log('2️⃣  tier1_missed_call_recovery_sms (EjrtbF205kPsOCxO)');
    console.log('   └─ Webhook → Extract → Check Duplicates → Decision');
    console.log('      ├─ NOT duplicate → Create Lead → Analyze → Send SMS → Log');
    console.log('      └─ IS duplicate → Log Dedup Skip');
    console.log('');
    console.log('🔐 Credentials Bound:');
    console.log(`   • Supabase: Pm10coWJeiICVYIi (${SUPABASE_CREDENTIAL_ID.substring(0, 8)}...)`);
    console.log(`   • SignalWire: r9gOGGtsAO3GswJR (${SIGNALWIRE_CREDENTIAL_ID.substring(0, 8)}...)`);
    console.log('');
    console.log('⚠️  NEXT STEPS (UI Only):');
    console.log('   1. Log in to n8n: https://app.n8n.cloud');
    console.log('   2. For each workflow:');
    console.log('      a. Click "Publish" (top right) ← NEW: needed for webhook re-registration');
    console.log('      b. Click "Activate" (toggle) ← required for scheduled runs');
    console.log('   3. Verify webhook URLs are in .env (already there)');
    console.log('   4. Ready to test!');
    console.log('');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
