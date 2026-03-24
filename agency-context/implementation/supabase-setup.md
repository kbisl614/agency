# Supabase Setup Guide — DispatchHVAC

Complete guide for configuring Supabase database schema, tables, and policies for the DispatchHVAC landing page.

---

## Prerequisites

1. Supabase account (free tier works fine for trials)
2. Project created in Supabase
3. API keys from Project Settings → API

---

## Step 1: Environment Variables

Copy your Supabase credentials to `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Finding these:**
1. Go to Supabase dashboard → Your project
2. Click "Settings" → "API"
3. Copy `anon` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Copy `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`
5. Copy project URL → `NEXT_PUBLIC_SUPABASE_URL`

---

## Step 2: Create Leads Table

In Supabase dashboard, go to **SQL Editor** and run this SQL:

```sql
-- Create leads table
create table public.leads (
  id uuid default gen_random_uuid() primary key,
  business_name text not null,
  owner_name text not null,
  email text not null unique,
  phone text not null,
  industry text not null check (industry in ('HVAC Contractor', 'HVAC with Plumbing', 'HVAC with Electrical')),
  monthly_calls_missed integer,
  ip_address text,
  demo_booked boolean default false,
  demo_booked_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create index on email for faster lookups
create index idx_leads_email on public.leads(email);

-- Create index on created_at for reporting
create index idx_leads_created_at on public.leads(created_at);

-- Enable RLS (Row Level Security)
alter table public.leads enable row level security;

-- Allow anonymous users to INSERT (for form submissions)
create policy "Allow anonymous insert" on public.leads
  for insert
  with check (true);

-- Allow anonymous users to SELECT their own lead (optional)
create policy "Allow select own record" on public.leads
  for select
  using (true);

-- Authenticated/admin can do anything (for dashboard later)
create policy "Allow admin full access" on public.leads
  for all
  using (auth.jwt() ->> 'role' = 'service_role');
```

### What this creates:

- **leads table**: Stores all form submissions
- **Columns**:
  - `id`: Unique identifier (auto-generated UUID)
  - `business_name`: Company name (required)
  - `owner_name`: Contact person (required)
  - `email`: Contact email (required, unique - prevents duplicates)
  - `phone`: Contact phone in (XXX) XXX-XXXX format
  - `industry`: One of the 3 HVAC categories
  - `monthly_calls_missed`: Optional field for estimated missed calls
  - `ip_address`: Source IP for rate limiting
  - `demo_booked`: Boolean flag (for future demo booking feature)
  - `demo_booked_at`: Timestamp when demo was booked
  - `created_at`: Auto-timestamp when record created
  - `updated_at`: Auto-timestamp when record updated

- **Indexes**: Speed up queries by email and date range
- **RLS Policies**: Control who can read/write
  - Anonymous users can INSERT (form submissions)
  - Service role (backend) has full access
  - Regular authenticated users have read-only access

---

## Step 3: Create Leads Notification Table (Optional)

For tracking email sends to leads:

```sql
create table public.lead_notifications (
  id uuid default gen_random_uuid() primary key,
  lead_id uuid not null references public.leads(id) on delete cascade,
  notification_type text not null check (notification_type in ('confirmation', 'followup', 'onboarding')),
  sent_at timestamp with time zone default now(),
  email_sent_to text not null,
  status text default 'pending' check (status in ('pending', 'sent', 'failed'))
);

-- Index for faster queries
create index idx_lead_notifications_lead_id on public.lead_notifications(lead_id);
create index idx_lead_notifications_sent_at on public.lead_notifications(sent_at);
```

This allows you to track which notifications have been sent to each lead.

---

## Step 4: Create Admin Analytics View (Optional)

For viewing lead data in the Supabase dashboard:

```sql
create view public.leads_summary as
select
  count(*) as total_leads,
  count(case when demo_booked then 1 end) as demos_booked,
  count(distinct industry) as industries_represented,
  min(created_at) as first_lead_date,
  max(created_at) as most_recent_lead
from public.leads;

-- For weekly breakdown:
create view public.leads_by_week as
select
  date_trunc('week', created_at) as week_start,
  count(*) as leads_this_week,
  count(case when demo_booked then 1 end) as demos_booked
from public.leads
group by date_trunc('week', created_at)
order by week_start desc;
```

---

## Step 5: Test the Connection

From your Next.js project root:

```bash
npm run dev
```

Go to the landing page and submit a test lead. Check:
1. Form validates correctly
2. Success message appears
3. Redirect to thank-you page works
4. In Supabase dashboard → Table Editor → `leads` table, your test record appears

**Troubleshooting:**
- No data appears? Check SUPABASE_SERVICE_ROLE_KEY is correct
- 401 errors? Check NEXT_PUBLIC_SUPABASE_ANON_KEY is correct
- Email uniqueness error? Try with a different email
- Check browser console for error messages

---

## Step 6: Enable Backups (Recommended)

In Supabase dashboard:
1. Go to **Settings** → **Backups**
2. Enable daily automatic backups
3. Choose retention period (7 days minimum for free tier)

---

## Step 7: Set Up Realtime Notifications (Optional)

For real-time updates when new leads arrive:

```sql
-- Enable Realtime on the leads table
alter publication supabase_realtime add table leads;
```

Then you can subscribe to new leads in the app:

```typescript
import { supabase } from '@/lib/supabase';

supabase
  .channel('leads')
  .on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'leads' },
    (payload) => {
      console.log('New lead:', payload.new);
    }
  )
  .subscribe();
```

---

## Database Backup & Recovery

### Manual Backup

1. Supabase dashboard → **Settings** → **Backups**
2. Click "Back up now"
3. Choose timeframe and download

### Restore from Backup

1. **Settings** → **Backups**
2. Click the backup you want to restore
3. Follow confirmation prompts
4. Database resets to that point in time

---

## Monitoring & Maintenance

### Check Database Size

Supabase dashboard → **Settings** → **Database** → View usage

Free tier: 500 MB storage. For reference:
- 1,000 leads = ~300 KB
- You could store 1.5M+ leads before hitting limit

### View Logs

**Settings** → **Logs** → View API activity, errors, slow queries

### Query Performance

For large datasets later:
- Add indexes on commonly filtered columns
- Use LIMIT/OFFSET for pagination
- Archive old leads to a separate table

---

## FAQ

**Q: What happens if I exceed storage limits?**
A: Supabase will warn you. Upgrade to a paid tier ($25/month) for 100GB+ storage.

**Q: Can I export all leads?**
A: Yes. Supabase dashboard → Table Editor → CSV export (top right)

**Q: How do I delete a lead?**
A: Table Editor → Right-click row → Delete, or via SQL:
```sql
delete from public.leads where id = 'uuid-here';
```

**Q: What about GDPR compliance?**
A: You should delete leads on request. Add this to your privacy policy:
"We store lead information in Supabase. Contact us to request deletion."

**Q: Can I use this with my own database?**
A: Yes, but you'll need to modify `/api/submit-lead/route.ts` to use your own database driver instead of Supabase.

---

## Next Steps

1. ✅ Create tables above
2. Test form submission locally
3. Set up email notifications (see `email-notifications.md`)
4. Configure admin dashboard to view leads
5. Set up Slack notifications when leads arrive
