#!/usr/bin/env node

const https = require('https');
const fs = require('fs');
const path = require('path');

const N8N_BASE_URL = 'https://krn8n9394.app.n8n.cloud';
const N8N_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlMzBkZGM0Ny00ODZiLTRkZmUtODc0ZS1mM2MzMDQ2NDA3NzIiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiNWJiZmRiYWMtMGVhNC00MzEwLWFiZjUtM2JhNjRhYWZhNzk1IiwiaWF0IjoxNzczNTU5ODQwLCJleHAiOjE3ODEzMjY4MDB9.OiXXD8qW3IbdwJtjEfEbxFf0x6PnvKxsbVlndJuWAv0';
const N8N_WEBHOOK_BASE_URL = 'https://krn8n9394.app.n8n.cloud/';

function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'krn8n9394.app.n8n.cloud',
      port: 443,
      path: path,
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

async function createWorkflow(name, description) {
  console.log(`\n📝 Creating workflow: ${name}...`);

  const workflowData = {
    name: name,
    nodes: [
      {
        name: 'Webhook',
        type: 'n8n-nodes-base.webhook',
        typeVersion: 1,
        position: [250, 300],
        webhookId: 'default',
        parameters: {
          path: name.toLowerCase().replace(/ /g, '-'),
          httpMethod: 'POST',
          responseMode: 'onReceived',
          responseCode: 200,
        },
      },
    ],
    connections: {},
    settings: {},
  };

  try {
    const response = await makeRequest('POST', '/api/v1/workflows', workflowData);
    const workflowId = response.id;
    const webhookUrl = `${N8N_WEBHOOK_BASE_URL}webhook/${name.toLowerCase().replace(/ /g, '-')}`;

    console.log(`✅ Workflow created: ${name}`);
    console.log(`   ID: ${workflowId}`);

    return {
      name: name,
      id: workflowId,
      webhookUrl: webhookUrl,
    };
  } catch (error) {
    console.error(`❌ Error creating ${name}:`, error.message);
    throw error;
  }
}

async function updateEnvFile(workflows) {
  const envPath = path.join(__dirname, '..', '.env');
  
  try {
    let envContent = fs.readFileSync(envPath, 'utf-8');
    
    // Update webhook URLs
    envContent = envContent.replace(
      /N8N_AFTER_HOURS_WEBHOOK_URL=.*/,
      `N8N_AFTER_HOURS_WEBHOOK_URL=${workflows.afterHours.webhookUrl}`
    );
    
    envContent = envContent.replace(
      /N8N_MISSED_CALL_WEBHOOK_URL=.*/,
      `N8N_MISSED_CALL_WEBHOOK_URL=${workflows.missedCall.webhookUrl}`
    );
    
    fs.writeFileSync(envPath, envContent, 'utf-8');
    console.log('✅ .env file updated with webhook URLs (stored securely)');
  } catch (error) {
    console.error('❌ Error updating .env file:', error.message);
    throw error;
  }
}

async function main() {
  console.log('🚀 Creating n8n workflows...\n');
  console.log(`Using n8n instance: ${N8N_BASE_URL}`);

  try {
    const workflow1 = await createWorkflow(
      'tier1_after_hours_lead_capture',
      'Capture SMS leads after hours with high confidence'
    );

    const workflow2 = await createWorkflow(
      'tier1_missed_call_recovery_sms',
      'Recover missed calls with deduplication logic'
    );

    // Update .env file immediately
    await updateEnvFile({
      afterHours: workflow1,
      missedCall: workflow2,
    });

    console.log('\n' + '='.repeat(70));
    console.log('✨ SUCCESS — Both workflows created & .env updated!');
    console.log('='.repeat(70));

    console.log('\n✅ Webhook URLs stored in .env (not exposed in chat)');
    console.log('\n💡 Next steps:');
    console.log('1. Log in to n8n Cloud: https://app.n8n.cloud');
    console.log('2. Open both workflows:');
    console.log(`   - ${workflow1.name} (ID: ${workflow1.id})`);
    console.log(`   - ${workflow2.name} (ID: ${workflow2.id})`);
    console.log('3. Ready to add nodes for SignalWire, Supabase, etc.');

  } catch (error) {
    console.error('\n❌ Failed:', error.message);
    process.exit(1);
  }
}

main();
