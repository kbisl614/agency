#!/usr/bin/env node

const https = require('https');
const fs = require('fs');
const path = require('path');

// Read .env file manually
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match && !line.startsWith('#')) {
    env[match[1].trim()] = match[2].trim();
  }
});

const N8N_BASE_URL = env.N8N_WEBHOOK_BASE_URL || 'https://krn8n9394.app.n8n.cloud/';
const N8N_API_KEY = env.N8N_API_KEY;
const SUPABASE_URL = env.SUPABASE_PROJECT_URL;
const SUPABASE_KEY = env.SUPABASE_ANON_KEY;
const SIGNALWIRE_SPACE_URL = env.SIGNALWIRE_SPACE_URL;
const SIGNALWIRE_PROJECT_ID = env.SIGNALWIRE_PROJECT_ID;
const SIGNALWIRE_API_TOKEN = env.SIGNALWIRE_API_TOKEN;
const SIGNALWIRE_PHONE = env.SIGNALWIRE_PHONE_NUMBER;
const DEDUP_WINDOW = env.MISSED_CALL_DEDUP_WINDOW_HOURS || 24;

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

      res.on('data', (chunk) => {
        data += chunk;
      });

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

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

async function buildMissedCallWorkflow() {
  console.log('🚀 Building tier1_missed_call_recovery_sms workflow...\n');

  try {
    // Get existing workflow
    const workflowsResponse = await makeRequest('GET', '/api/v1/workflows');
    const workflow = workflowsResponse.data?.find(w => w.name === 'tier1_missed_call_recovery_sms');
    
    if (!workflow) {
      throw new Error('Workflow not found. Run create-n8n-workflows.js first.');
    }

    const workflowId = workflow.id;
    console.log(`📋 Found workflow: ${workflowId}\n`);

    // Build the complete workflow with all nodes
    const updatedWorkflow = {
      name: 'tier1_missed_call_recovery_sms',
      nodes: [
        // 1. Webhook Trigger (from Jobber or mock)
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
        // 2. Extract phone and timestamp
        {
          name: 'Extract Data',
          type: 'n8n-nodes-base.set',
          typeVersion: 1,
          position: [500, 300],
          parameters: {
            values: {
              string: [
                {
                  name: 'phone',
                  value: '={{ $node.Webhook.json.phone || $node.Webhook.json.From }}',
                },
                {
                  name: 'received_timestamp',
                  value: '={{ $node.Webhook.json.timestamp || new Date().toISOString() }}',
                },
                {
                  name: 'source_type',
                  value: '={{ $node.Webhook.json.source || "missed_call" }}',
                },
              ],
            },
            options: {},
          },
        },
        // 3. Check for duplicates in Supabase (24h window)
        {
          name: 'Check Duplicates',
          type: 'n8n-nodes-base.supabase',
          typeVersion: 1,
          position: [750, 300],
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
        // 4. Decision: Duplicate check
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
        // 4a. Log Dedup Skip (TRUE - is duplicate)
        {
          name: 'Log Dedup Skip',
          type: 'n8n-nodes-base.supabase',
          typeVersion: 1,
          position: [750, 550],
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
        // 4b. Continue if NOT duplicate (FALSE branch)
        // 5. Create Lead
        {
          name: 'Create Lead',
          type: 'n8n-nodes-base.supabase',
          typeVersion: 1,
          position: [1250, 200],
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
        // 6. Analyze intent for missed calls
        {
          name: 'Analyze Confidence',
          type: 'n8n-nodes-base.set',
          typeVersion: 1,
          position: [1500, 200],
          parameters: {
            values: {
              string: [
                {
                  name: 'confidence_score',
                  value: '=0.8',
                },
                {
                  name: 'should_send',
                  value: '=true',
                },
              ],
            },
            options: {},
          },
        },
        // 7. Decision: Send SMS?
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
        // 7a. Send SMS (TRUE)
        {
          name: 'Send SMS',
          type: 'n8n-nodes-base.twilio',
          typeVersion: 1,
          position: [2000, 100],
          parameters: {
            resource: 'sms',
            operation: 'send',
            toNumber: '={{ $node["Extract Data"].json.phone }}',
            message: '=We noticed we missed your call. A team member will reach out shortly. Reply STOP to opt out.',
          },
        },
        // 7b. Log Success
        {
          name: 'Log Success',
          type: 'n8n-nodes-base.supabase',
          typeVersion: 1,
          position: [2250, 100],
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
        // 7c. Log Skipped (FALSE)
        {
          name: 'Log Skipped',
          type: 'n8n-nodes-base.supabase',
          typeVersion: 1,
          position: [2000, 300],
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
        // 8. Error Handler
        {
          name: 'Error Handler',
          type: 'n8n-nodes-base.supabase',
          typeVersion: 1,
          position: [500, 600],
          parameters: {
            resource: 'database',
            operation: 'insert',
            schema: 'public',
            table: 'actions',
            columns: 'timestamp,action_type,description,agent_name,success,error_message,created_at',
            values: {
              timestamp: '={{ new Date().toISOString() }}',
              action_type: 'error',
              description: '=Workflow error occurred in missed call recovery',
              agent_name: 'tier1_missed_call_recovery_sms',
              success: false,
              error_message: '={{ $node.Webhook.json.error || "Unknown error" }}',
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

    // Update workflow
    await makeRequest('PUT', `/api/v1/workflows/${workflowId}`, updatedWorkflow);
    console.log('✅ Workflow nodes configured\n');

    console.log('═'.repeat(70));
    console.log('🎉 SUCCESS — tier1_missed_call_recovery_sms is ready!');
    console.log('═'.repeat(70));
    console.log('\nWorkflow structure:');
    console.log('1. Webhook (receives POST from Jobber or mock)');
    console.log('2. Extract Data (parse phone, timestamp)');
    console.log('3. Check Duplicates (query Supabase: is this phone in last 24h?)');
    console.log('4. Decision: Is Duplicate? ');
    console.log('   ├─ YES → Log Dedup Skip (STOP)');
    console.log('   └─ NO → Continue');
    console.log('5. Create Lead (insert into Supabase)');
    console.log('6. Analyze Confidence (set confidence = 0.8)');
    console.log('7. Decision: Send SMS? (should_send = true?)');
    console.log('   ├─ YES → Send SMS → Log Success');
    console.log('   └─ NO → Log Skipped');
    console.log('8. Error Handler (catches any failures)\n');

    console.log('📝 Next steps:');
    console.log('1. Log in to n8n: https://app.n8n.cloud');
    console.log(`2. Open workflow: ${workflowId}`);
    console.log('3. Add n8n Supabase credential (if not already set)');
    console.log('4. Add n8n Twilio/SignalWire credential');
    console.log('5. Test with curl POST (with mock data)');

  } catch (error) {
    console.error('❌ Error building workflow:', error.message);
    process.exit(1);
  }
}

buildMissedCallWorkflow();
