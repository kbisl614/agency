# Jobber Webhook Testing (Without API Key)

Since you don't have a Jobber account yet (cost concern), we'll mock Jobber webhooks using curl/Postman to test the missed call recovery workflow.

## How Jobber Webhooks Work (For Reference)

When a call is missed in Jobber, it POSTs to a webhook with this payload:

```json
{
  "webhook_type": "missed_call",
  "timestamp": "2026-03-14T14:32:00Z",
  "client": {
    "phone_number": "+1234567890",
    "name": "John Smith"
  },
  "job": {
    "id": "job_123",
    "address": "123 Main St"
  }
}
```

## Testing Without Jobber

### Option 1: curl (Terminal)

Get your n8n webhook URL from the missed call recovery workflow, then:

```bash
curl -X POST https://your-n8n-instance.app.n8n.cloud/webhook/missed-call-recovery \
  -H "Content-Type: application/json" \
  -d '{
    "webhook_type": "missed_call",
    "timestamp": "2026-03-14T14:32:00Z",
    "client": {
      "phone_number": "+1234567890",
      "name": "John Smith"
    },
    "job": {
      "id": "job_123",
      "address": "123 Main St"
    }
  }'
```

### Option 2: Postman (GUI)

1. Create new POST request
2. URL: `https://your-n8n-instance.app.n8n.cloud/webhook/missed-call-recovery`
3. Headers tab → Add `Content-Type: application/json`
4. Body tab → Raw → Paste:

```json
{
  "webhook_type": "missed_call",
  "timestamp": "2026-03-14T14:32:00Z",
  "client": {
    "phone_number": "+1234567890",
    "name": "John Smith"
  },
  "job": {
    "id": "job_123",
    "address": "123 Main St"
  }
}
```

5. Click Send

### Option 3: n8n Test Mode

1. Open the missed call workflow in n8n
2. Click "Test workflow" button
3. Manually provide the webhook payload
4. Click "Execute"

## Testing Deduplication

Send the same phone number twice within 24 hours:

**First call (should trigger SMS):**
```bash
curl -X POST <webhook-url> \
  -H "Content-Type: application/json" \
  -d '{"client": {"phone_number": "+1234567890"}, "timestamp": "2026-03-14T14:32:00Z"}'
```

**Second call (should skip, not send SMS):**
```bash
curl -X POST <webhook-url> \
  -H "Content-Type: application/json" \
  -d '{"client": {"phone_number": "+1234567890"}, "timestamp": "2026-03-14T14:35:00Z"}'
```

Check Supabase `actions` table → should see:
- First: `action_type = 'sms_sent'`
- Second: `action_type = 'skipped_duplicate'`

**After 24+ hours (should trigger SMS again):**
```bash
curl -X POST <webhook-url> \
  -H "Content-Type: application/json" \
  -d '{"client": {"phone_number": "+1234567890"}, "timestamp": "2026-03-15T14:35:00Z"}'
```

Should see third action: `action_type = 'sms_sent'`

## When You Get Jobber Later

Once you have a paying Jobber account:

1. Go to Jobber Account Settings → Integrations
2. Enable Webhooks
3. Add webhook URL: `https://your-n8n-instance.app.n8n.cloud/webhook/missed-call-recovery`
4. Copy webhook secret → add to `.env` file
5. That's it! Jobber will now post actual missed calls to your workflow

No code changes needed — the webhook is already compatible with Jobber's payload structure.

## Test Data Scenarios

Use these phone numbers to test different scenarios:

| Phone | Scenario | Expected |
|-------|----------|----------|
| `+1111111111` | New missed call | SMS sent |
| `+1111111111` | Duplicate (same 24h) | Skipped |
| `+2222222222` | Different number | SMS sent |
| `+3333333333` | Confidence < 0.8 | Not sent (human review) |

## Troubleshooting

**Webhook not firing?**
- Check n8n workflow is active (toggle at top)
- Check webhook URL is correct
- Check n8n logs (Executions tab)

**SMS not sending?**
- Check Twilio credentials in n8n
- Check Supabase connection in n8n
- Check confidence score (need > 0.8)

**Dedup not working?**
- Check Airtable/Supabase query is correct
- Verify phone numbers match exactly
- Check created_at filter (last 24 hours)
