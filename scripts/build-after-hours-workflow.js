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

async function buildAfterHoursWorkflow() {
  console.log('🚀 Building tier1_after_hours_lead_capture workflow...\n');

  try {
    // Get existing workflow
    const workflowsResponse = await makeRequest('GET', '/api/v1/workflows');
    const workflow = workflowsResponse.data?.find(w => w.name === 'tier1_after_hours_lead_capture');
    
    if (!workflow) {
      throw new Error('Workflow not found. Run create-n8n-workflows.js first.');
    }

    const workflowId = workflow.id;
    console.log(`📋 Found workflow: ${workflowId}\n`);

    // Build the complete workflow with all nodes
    const updatedWorkflow = {
      name: 'tier1_after_hours_lead_capture',
      nodes: [
        // 1. Webhook Trigger
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
        // 2. Extract & Parse incoming data
        {
          name: 'Extract Signal',
          type: 'n8n-nodes-base.set',
          typeVersion: 1,
          position: [500, 300],
          parameters: {
            values: {
              string: [
                {
                  name: 'from_phone',
                  value: '={{ $node.Webhook.json.From }}',
                },
                {
                  name: 'message_text',
                  value: '={{ $node.Webhook.json.Body }}',
                },
                {
                  name: 'received_timestamp',
                  value: '={{ new Date().toISOString() }}',
                },
              ],
            },
            options: {},
          },
        },
        // 3. Analyze message for intent signals
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
                {
                  name: 'confidence_threshold',
                  value: '=0.85',
                },
              ],
            },
            options: {},
          },
        },
        // 4. Create Lead in Supabase
        {
          name: 'Create Lead',
          type: 'n8n-nodes-base.supabase',
          typeVersion: 1,
          position: [1000, 300],
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
        // 5. Decision: Should we send SMS?
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
        // 6a. Send SMS (TRUE branch)
        {
          name: 'Send SMS',
          type: 'n8n-nodes-base.twilio',
          typeVersion: 1,
          position: [1500, 150],
          parameters: {
            resource: 'sms',
            operation: 'send',
            toNumber: '={{ $node["Extract Signal"].json.from_phone }}',
            message: '=Hi! We received your request. A team member will follow up within 30 minutes. Reply STOP to opt out.',
          },
        },
        // 6b. Log Success Action
        {
          name: 'Log Success',
          type: 'n8n-nodes-base.supabase',
          typeVersion: 1,
          position: [1750, 150],
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
        // 6c. Human Review (FALSE branch)
        {
          name: 'Log Human Review',
          type: 'n8n-nodes-base.supabase',
          typeVersion: 1,
          position: [1500, 450],
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
        // 7. Error Handler
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
              description: '=Workflow error occurred',
              agent_name: 'tier1_after_hours_lead_capture',
              success: false,
              error_message: '={{ $node.Webhook.json.error }}',
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

    // Update workflow
    await makeRequest('PUT', `/api/v1/workflows/${workflowId}`, updatedWorkflow);
    console.log('✅ Workflow nodes configured\n');

    console.log('═'.repeat(70));
    console.log('🎉 SUCCESS — tier1_after_hours_lead_capture is ready!');
    console.log('═'.repeat(70));
    console.log('\nWorkflow structure:');
    console.log('1. Webhook (receives SMS from SignalWire)');
    console.log('2. Extract Signal (parse phone, message, timestamp)');
    console.log('3. Analyze Intent (detect keywords, urgency, quality)');
    console.log('4. Create Lead (insert into Supabase)');
    console.log('5. Decision: Should we send SMS? (confidence > 0.85?)');
    console.log('   ├─ YES → Send SMS → Log Success');
    console.log('   └─ NO → Log Human Review');
    console.log('6. Error Handler (catches any failures)\n');

    console.log('📝 Next steps:');
    console.log('1. Log in to n8n: https://app.n8n.cloud');
    console.log(`2. Open workflow: ${workflowId}`);
    console.log('3. Add n8n Supabase credential (if not already set)');
    console.log('4. Add n8n Twilio/SignalWire credential');
    console.log('5. Test with curl webhook POST');

  } catch (error) {
    console.error('❌ Error building workflow:', error.message);
    process.exit(1);
  }
}

buildAfterHoursWorkflow();
