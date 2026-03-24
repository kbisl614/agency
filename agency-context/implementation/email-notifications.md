# Email Notifications Setup — DispatchHVAC

Configure automated email notifications when leads submit the form. Includes lead confirmation emails and admin notifications.

---

## Overview

When someone submits the lead form:
1. **Lead receives**: Confirmation email with next steps (automatic within 2 hours)
2. **Admin receives**: Notification with lead details + link to review

This guide covers three options: Resend (recommended), SendGrid, or Supabase Realtime + custom webhook.

---

## Option 1: Resend (Recommended)

Resend is the simplest—no configuration needed for testing, great free tier, 100+ emails/day.

### Step 1: Create Resend Account

1. Go to [resend.com](https://resend.com)
2. Sign up with email
3. Verify email address
4. Dashboard → API Keys
5. Copy the API key

### Step 2: Add Environment Variable

```bash
# .env.local
RESEND_API_KEY=re_xxxxx_xxxxxxxxx
```

### Step 3: Update API Route

Modify `/app/api/submit-lead/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { leadInsertSchema } from "@/lib/validation";
import { checkRateLimit } from "@/lib/rate-limit";
import { ZodError } from "zod";

/**
 * Optional: Send email notifications with Resend
 */
async function sendLeadEmails(
  leadData: typeof leadInsertSchema
): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not configured, skipping email notifications");
    return;
  }

  try {
    // Send lead confirmation email
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "noreply@dispachhvac.ai",
        to: leadData.email,
        subject: "Your 30-Day DispatchHVAC Trial is Set Up!",
        html: `
          <h1>Thanks for Starting Your Trial!</h1>
          <p>Hi ${leadData.owner_name},</p>
          <p>We've received your information and will call <strong>${leadData.phone}</strong> within 2 hours to finalize your setup.</p>

          <h2>What Happens Next</h2>
          <ol>
            <li><strong>Setup Call:</strong> We'll confirm your CRM and schedule the integration</li>
            <li><strong>Integration:</strong> We connect to your account (30-60 minutes)</li>
            <li><strong>Live:</strong> System starts capturing emergency calls 24/7</li>
          </ol>

          <h2>Your Guarantee</h2>
          <p>If we don't capture <strong>5 emergency leads</strong> and fill <strong>2 cancellations</strong> in your first 30 days, your first month is free.</p>
          <p>That's a minimum of <strong>$1,200 in recovered revenue</strong> — zero risk.</p>

          <p>Questions? Reply to this email or call us.</p>
          <p>– DispatchHVAC Team</p>
        `,
      }),
    });

    // Send admin notification
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "noreply@dispachhvac.ai",
        to: process.env.ADMIN_EMAIL || "hello@callconvert.ai", // Change this!
        subject: `New Lead: ${leadData.business_name} (${leadData.industry})`,
        html: `
          <h2>New Lead Submitted</h2>
          <p><strong>Business:</strong> ${leadData.business_name}</p>
          <p><strong>Contact:</strong> ${leadData.owner_name}</p>
          <p><strong>Email:</strong> ${leadData.email}</p>
          <p><strong>Phone:</strong> ${leadData.phone}</p>
          <p><strong>Industry:</strong> ${leadData.industry}</p>
          ${leadData.monthly_calls_missed ? `<p><strong>Estimated Missed Calls/Month:</strong> ${leadData.monthly_calls_missed}</p>` : ""}
          <p><strong>IP Address:</strong> ${leadData.ip_address || "N/A"}</p>

          <p><strong>Action:</strong> Call ${leadData.phone} to start onboarding.</p>
        `,
      }),
    });

    console.log(`✓ Emails sent for ${leadData.email}`);
  } catch (error) {
    console.error("Error sending emails:", error);
    // Don't fail the API call if email fails—log and continue
  }
}

/**
 * POST /api/submit-lead
 */
export async function POST(request: NextRequest) {
  try {
    // ... existing rate limiting & validation code ...

    const validatedData = leadInsertSchema.parse(leadData);

    // ... existing Supabase insert code ...

    // NEW: Send confirmation emails
    await sendLeadEmails(validatedData);

    return NextResponse.json(
      {
        success: true,
        message: "Lead submitted successfully",
        leadId: data?.id,
      },
      { status: 201 }
    );
  } catch (error) {
    // ... existing error handling ...
  }
}
```

### Step 4: Add Admin Email to Environment

```bash
# .env.local
ADMIN_EMAIL=your-email@example.com  # Change this to your email!
RESEND_API_KEY=re_xxxxx_xxxxxxxxx
```

### Step 5: Test

1. Run `npm run dev`
2. Submit a test lead on the form
3. Check your email inbox for:
   - **Confirmation email** (sent to the lead's email)
   - **Admin notification** (sent to ADMIN_EMAIL)

---

## Option 2: SendGrid

If you prefer SendGrid:

### Step 1: Create SendGrid Account

1. [sendgrid.com](https://sendgrid.com) → Sign up
2. Verify email
3. **Settings** → **API Keys** → Generate new key
4. Copy the key

### Step 2: Add Environment Variable

```bash
# .env.local
SENDGRID_API_KEY=SG.xxxxx_xxxxxxxxx
```

### Step 3: Update API Route

```typescript
async function sendLeadEmails(leadData: typeof leadInsertSchema): Promise<void> {
  if (!process.env.SENDGRID_API_KEY) return;

  try {
    // Lead confirmation
    await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: leadData.email, name: leadData.owner_name }],
            subject: "Your 30-Day DispatchHVAC Trial is Set Up!",
          },
        ],
        from: { email: "noreply@dispachhvac.ai", name: "DispatchHVAC" },
        content: [
          {
            type: "text/html",
            value: `<h1>Thanks for Starting Your Trial!</h1>...`,
          },
        ],
      }),
    });

    console.log(`✓ Email sent to ${leadData.email}`);
  } catch (error) {
    console.error("SendGrid error:", error);
  }
}
```

---

## Option 3: Supabase + Slack Webhook

For real-time Slack notifications without sending emails:

### Step 1: Create Slack Webhook

1. [slack.com/apps](https://slack.com/apps) → Search "Incoming Webhooks"
2. Click "Incoming Webhooks"
3. **Create New** → Select channel → **Generate URL**
4. Copy the webhook URL

### Step 2: Add Environment Variable

```bash
# .env.local
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/XXXXXX/XXXXXX/XXXXXX
```

### Step 3: Update API Route

```typescript
async function notifySlack(leadData: typeof leadInsertSchema): Promise<void> {
  if (!process.env.SLACK_WEBHOOK_URL) return;

  try {
    await fetch(process.env.SLACK_WEBHOOK_URL, {
      method: "POST",
      body: JSON.stringify({
        text: `🚨 New Lead: ${leadData.business_name}`,
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*New Lead Submitted*\n\n*Business:* ${leadData.business_name}\n*Contact:* ${leadData.owner_name}\n*Phone:* ${leadData.phone}\n*Email:* ${leadData.email}\n*Industry:* ${leadData.industry}`,
            },
          },
          {
            type: "actions",
            elements: [
              {
                type: "button",
                text: { type: "plain_text", text: "Call Now", emoji: true },
                value: "call",
              },
              {
                type: "button",
                text: { type: "plain_text", text: "View in DB", emoji: true },
                value: "view",
                url: "https://app.supabase.com", // Link to Supabase
              },
            ],
          },
        ],
      }),
    });

    console.log(`✓ Slack notification sent`);
  } catch (error) {
    console.error("Slack error:", error);
  }
}
```

---

## Email Templates

### Lead Confirmation Email

The lead receives this automatically:

```html
<h1>Your 30-Day DispatchHVAC Trial is Set Up!</h1>

<p>Hi [Owner Name],</p>

<p>Thanks for signing up. We'll call [Phone] within 2 hours to finalize your setup.</p>

<h2>What Happens Next</h2>
<ol>
  <li><strong>Setup Call:</strong> Confirm your [CRM Type] account</li>
  <li><strong>Integration:</strong> Connect to your CRM (30-60 min)</li>
  <li><strong>Live:</strong> System captures emergency calls 24/7</li>
</ol>

<h2>Your Guarantee</h2>
<p>If we don't capture <strong>5 emergency leads</strong> + fill <strong>2 cancellations</strong> in 30 days, your first month is free.</p>

<p>Questions? Reply to this email.</p>
```

### Admin Notification Email

The admin (you) receives this:

```html
<h2>New Lead: [Business Name]</h2>

<p><strong>Contact:</strong> [Owner Name]</p>
<p><strong>Email:</strong> [Email]</p>
<p><strong>Phone:</strong> [Phone]</p>
<p><strong>CRM Type:</strong> [Industry]</p>
<p><strong>Estimated Missed Calls/Month:</strong> [Number]</p>

<p><strong>Next Step:</strong> Call [Phone] to confirm CRM details and schedule integration.</p>
```

---

## Testing Email Setup Locally

### Resend (Easiest)

Resend works locally with your API key. Just test the form submission.

### SendGrid

Same as Resend—use API key locally.

### Slack

Webhook works locally too—test by submitting a form and checking your Slack channel.

---

## Troubleshooting

### Email not sending?

1. Check API key is in `.env.local`
2. Verify email address is valid
3. Check browser console for errors
4. Check `/api/submit-lead` route logs in terminal

### Emails going to spam?

1. Add SPF/DKIM records (Resend/SendGrid docs)
2. Use a proper `from:` domain (not Gmail)
3. Add unsubscribe link for compliance

### Rate limiting emails?

Don't send more than 1 email per second per provider.

---

## Production Checklist

- [ ] API key stored in `.env.local` (never commit to git)
- [ ] Admin email set correctly in `ADMIN_EMAIL`
- [ ] Test email received successfully
- [ ] Email domain verified (SPF/DKIM if applicable)
- [ ] Unsubscribe links added to emails
- [ ] Email templates reviewed for branding
- [ ] Error logging configured (console.error in API route)

---

## Next Steps

1. Choose email provider (Resend recommended)
2. Create account and API key
3. Update `/api/submit-lead/route.ts` with email code
4. Add environment variables
5. Test form submission
6. Monitor emails in first week of going live
