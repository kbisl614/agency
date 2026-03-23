# Client Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the full Fieldline AI client dashboard — approval inbox, stats row, tabbed action feed with polling, and all 4 API routes — replacing the existing v1 placeholder.

**Architecture:** Server component (`page.tsx`) handles auth and redirects only. Four focused API routes serve metrics, inbox, approvals, and actions. Client components handle all interactivity: count-up animation, 10-second polling, expand/collapse, approve/skip with fade.

**Tech Stack:** Next.js 16 App Router, `@supabase/ssr`, inline CSS only (no Tailwind in dashboard files), TTF fonts via `@font-face`, n8n webhook on approval.

**Spec:** `/Users/karsynregennitter/Downloads/DASHBOARD_BUILD_PROMPT.md`
**Mockup:** `/Users/karsynregennitter/Downloads/fieldline_mockup_B7_expandable_feed.html`

---

## File Map

| Action | Path | Purpose |
|--------|------|---------|
| Modify | `lib/supabase.ts` | Add `first_name` to `Client` interface |
| Modify | `app/admin/onboard/page.tsx` | Add First Name field to form |
| Modify | `app/api/admin/onboard/route.ts` | Save `first_name` to clients table |
| Verify | `lib/supabase-server.ts` | Confirm exists before Task 4 (all API routes depend on it) |
| Create | `middleware.ts` | Protect `/dashboard` and `/admin` routes |
| Create | `public/fonts/` | Static TTF font files (TTF only — no woff2 files available in `open_sans/`) |
| Modify | `app/globals.css` | Add `@font-face` declarations |
| Create | `app/api/dashboard/metrics/route.ts` | Revenue, leads, response time metrics |
| Create | `app/api/dashboard/inbox/route.ts` | Actions awaiting human review |
| Create | `app/api/dashboard/approve/route.ts` | Approve/skip + n8n trigger |
| Create | `app/api/dashboard/actions/route.ts` | Tabbed action feed |
| Rewrite | `app/dashboard/page.tsx` | Auth-only server shell |
| Create | `app/dashboard/DashboardClient.tsx` | Root client component, polling orchestration |
| Create | `app/dashboard/components/NavBar.tsx` | Nav with pulsing dot + sign out |
| Create | `app/dashboard/components/Greeting.tsx` | Time-of-day greeting |
| Create | `app/dashboard/components/ApprovalInbox.tsx` | Approval cards, expand, approve/skip |
| Create | `app/dashboard/components/StatsRow.tsx` | 3 stat cards, count-up, last-updated |
| Create | `app/dashboard/components/ActionFeed.tsx` | Tabbed feed, polling, expand/collapse |

---

## Task 1: Add `first_name` to schema and onboard flow

**Files:**
- Modify: `lib/supabase.ts`
- Modify: `app/admin/onboard/page.tsx`
- Modify: `app/api/admin/onboard/route.ts`

- [ ] **Step 1.1: Add `first_name` to Client interface**

In `lib/supabase.ts`, add `first_name` to the `Client` interface after `business_name`:

```ts
export interface Client {
  contractor_id: string;
  business_name: string;
  first_name: string | null;   // ← add this line
  owner_email: string;
  // ... rest unchanged
}
```

- [ ] **Step 1.2: Add First Name field to onboard form**

In `app/admin/onboard/page.tsx`:

Add `first_name: string` to `OnboardFormData` interface and `first_name: ""` to `EMPTY_FORM`.

Add a new `<Field>` between Business Name and Owner Email:

```tsx
<Field label="Owner First Name" required>
  <input
    type="text"
    value={form.first_name}
    onChange={(e) => set("first_name", e.target.value)}
    required
    style={inputStyle}
    placeholder="Mike"
  />
</Field>
```

- [ ] **Step 1.3: Save first_name in the API route**

In `app/api/admin/onboard/route.ts`, add `first_name` to destructuring:

```ts
const {
  business_name,
  first_name,        // ← add
  owner_email,
  // ...
} = body;
```

Add to required fields check:
```ts
if (!business_name || !first_name || !owner_email || !owner_phone || !crm_type) {
```

Add to the clients insert:
```ts
const { error: clientError } = await supabaseAdmin.from("clients").insert({
  contractor_id: userId,
  business_name,
  first_name: first_name || null,   // ← add
  owner_email,
  // ... rest unchanged
});
```

- [ ] **Step 1.4: Run Supabase migration**

Run this SQL in the Supabase SQL editor for `cdofgroinizevjxyzvnn.supabase.co`:

```sql
ALTER TABLE clients ADD COLUMN IF NOT EXISTS first_name text;
```

- [ ] **Step 1.5: Verify**

Navigate to `localhost:3000/admin/onboard`. Confirm "Owner First Name" field appears. Submit a test client and verify `first_name` column is populated in Supabase.

- [ ] **Step 1.6: Commit**

```bash
git add lib/supabase.ts app/admin/onboard/page.tsx app/api/admin/onboard/route.ts
git commit -m "feat: add first_name to clients schema and onboard form"
```

---

## Task 2: Fonts and global CSS

**Files:**
- Create: `public/fonts/` (copy TTF files)
- Modify: `app/globals.css`

- [ ] **Step 2.1: Copy font files to public/fonts**

> **Note:** The spec references `.woff2` files, but only `.ttf` files exist in `open_sans/static/`. TTF works in all modern browsers and is used here. If woff2 files are added later, update the `src` URLs and format strings accordingly.

```bash
mkdir -p public/fonts
cp open_sans/static/OpenSans-Regular.ttf public/fonts/
cp open_sans/static/OpenSans-Medium.ttf public/fonts/
cp open_sans/static/OpenSans-SemiBold.ttf public/fonts/
cp open_sans/static/OpenSans-Bold.ttf public/fonts/
```

- [ ] **Step 2.2: Add @font-face to globals.css**

Add at the top of `app/globals.css` (before any existing rules):

```css
@font-face {
  font-family: 'Open Sans';
  src: url('/fonts/OpenSans-Regular.ttf') format('truetype');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: 'Open Sans';
  src: url('/fonts/OpenSans-Medium.ttf') format('truetype');
  font-weight: 500;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: 'Open Sans';
  src: url('/fonts/OpenSans-SemiBold.ttf') format('truetype');
  font-weight: 600;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: 'Open Sans';
  src: url('/fonts/OpenSans-Bold.ttf') format('truetype');
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}
```

- [ ] **Step 2.3: Verify**

Run `npm run dev`. Open `localhost:3000`. In DevTools → Network → filter "ttf" — confirm font files load with 200 status.

- [ ] **Step 2.4: Commit**

```bash
git add public/fonts/ app/globals.css
git commit -m "feat: add Open Sans font files and @font-face declarations"
```

---

## Task 3: Verify lib/supabase-server.ts exists

**All 4 API routes import `createSupabaseServerClient` from `@/lib/supabase-server`. Confirm this file exists before proceeding.**

- [ ] **Step 3.0: Verify**

```bash
cat lib/supabase-server.ts
```

Expected: exports an async `createSupabaseServerClient()` function using `@supabase/ssr` `createServerClient`. If the file does not exist, create it:

```ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() { return cookieStore.getAll(); },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch { /* read-only in Server Components — safe to ignore */ }
      },
    },
  });
}
```

---

## Task 4: Route protection middleware

**Files:**
- Create: `middleware.ts` (at project root, same level as `app/`)

- [ ] **Step 3.1: Create middleware.ts**

```ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isProtected = pathname.startsWith("/dashboard") || pathname.startsWith("/admin");

  if (isProtected && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
```

- [ ] **Step 3.2: Verify**

Open an incognito window. Navigate to `localhost:3000/dashboard`. Confirm redirect to `/login`.

- [ ] **Step 3.3: Commit**

```bash
git add middleware.ts
git commit -m "feat: add middleware to protect /dashboard and /admin routes"
```

---

## Task 5: API route — `/api/dashboard/metrics`

**Files:**
- Create: `app/api/dashboard/metrics/route.ts`

- [ ] **Step 4.1: Create metrics route**

```ts
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!supabaseAdmin) return NextResponse.json({ error: "Server error" }, { status: 500 });

  const { data: profile } = await supabaseAdmin
    .from("users").select("contractor_id").eq("id", user.id).single();
  if (!profile) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { contractor_id } = profile;

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  // Load in parallel
  const [{ data: client }, { data: actions }, { data: todayActions }] = await Promise.all([
    supabaseAdmin.from("clients").select("agents_active").eq("contractor_id", contractor_id).single(),
    supabaseAdmin
      .from("actions")
      .select("revenue_impact, response_time_ms, status, created_at")
      .eq("contractor_id", contractor_id)
      .gte("created_at", monthStart.toISOString()),
    supabaseAdmin
      .from("actions")
      .select("id")
      .eq("contractor_id", contractor_id)
      .gte("created_at", todayStart.toISOString()),
  ]);

  const allActions = actions ?? [];

  const revenue_mtd = allActions.reduce(
    (sum, a) => sum + (a.revenue_impact ?? 0), 0
  );

  const leadsActions = allActions.filter(
    (a) => a.status === "auto_executed" || a.status === "human_approved"
  );
  const leads_recovered = leadsActions.length;

  const responseTimes = allActions
    .map((a) => a.response_time_ms)
    .filter((t): t is number => t != null && t > 0);
  const avg_response_ms = responseTimes.length
    ? Math.round(responseTimes.reduce((s, t) => s + t, 0) / responseTimes.length)
    : 0;

  return NextResponse.json({
    revenue_mtd,
    retainer_amount: 1500,
    leads_recovered,
    leads_guarantee: 5,
    avg_response_ms,
    actions_today: todayActions?.length ?? 0,
    last_updated: new Date().toISOString(),
  });
}
```

- [ ] **Step 4.2: Verify**

Log in as the test client. Open `localhost:3000/api/dashboard/metrics` in the browser. Confirm JSON response with all 7 fields. Confirm 401 in an incognito window without a session.

- [ ] **Step 4.3: Commit**

```bash
git add app/api/dashboard/metrics/route.ts
git commit -m "feat: add /api/dashboard/metrics route"
```

---

## Task 6: API route — `/api/dashboard/inbox`

**Files:**
- Create: `app/api/dashboard/inbox/route.ts`

- [ ] **Step 5.1: Create inbox route**

> **Spec note — empty state:** The spec has an internal contradiction: it first says "Only render this section if inbox returns 1 or more records" but then says "Section still renders but shows this state — do not hide the section entirely." The plan follows the second instruction (always render, show empty state) because hiding the section entirely could make contractors think it failed to load.
>
> **Spec deviation:** The inbox route returns `action_type` in addition to the fields listed in the spec. This is required so the client can derive the approve button label (`Yes, book it` / `Yes, send it`) from the action type.

```ts
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!supabaseAdmin) return NextResponse.json({ error: "Server error" }, { status: 500 });

  const { data: profile } = await supabaseAdmin
    .from("users").select("contractor_id").eq("id", user.id).single();
  if (!profile) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { data: items } = await supabaseAdmin
    .from("actions")
    .select("id, description, revenue_impact, confidence_score, created_at, action_type")
    .eq("contractor_id", profile.contractor_id)
    .eq("status", "human_review")
    .order("created_at", { ascending: false });

  return NextResponse.json(items ?? []);
}
```

- [ ] **Step 5.2: Verify**

Hit `localhost:3000/api/dashboard/inbox` while logged in as test client. Expect `[]` (no items yet — correct). Confirm 401 without session.

- [ ] **Step 5.3: Commit**

```bash
git add app/api/dashboard/inbox/route.ts
git commit -m "feat: add /api/dashboard/inbox route"
```

---

## Task 7: API route — `/api/dashboard/approve`

**Files:**
- Create: `app/api/dashboard/approve/route.ts`

- [ ] **Step 6.1: Create approve route**

```ts
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!supabaseAdmin) return NextResponse.json({ error: "Server error" }, { status: 500 });

  const { data: profile } = await supabaseAdmin
    .from("users").select("contractor_id").eq("id", user.id).single();
  if (!profile) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { action_id, decision } = await request.json();
  if (!action_id || !["approved", "skipped"].includes(decision)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const newStatus = decision === "approved" ? "human_approved" : "human_skipped";

  // Verify this action belongs to this contractor
  const { data: action } = await supabaseAdmin
    .from("actions")
    .select("id, contractor_id")
    .eq("id", action_id)
    .eq("contractor_id", profile.contractor_id)
    .single();

  if (!action) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Update status immediately — don't wait on n8n
  await supabaseAdmin
    .from("actions")
    .update({ status: newStatus })
    .eq("id", action_id);

  // Fire n8n webhook (best-effort, 2s timeout)
  // Note: project uses N8N_WEBHOOK_BASE_URL (from .env.local) — the spec calls it N8N_BASE_URL.
  // N8N_WEBHOOK_BASE_URL is what's actually set in the project, so we use that name here.
  if (decision === "approved") {
    const base = (process.env.N8N_WEBHOOK_BASE_URL ?? "").replace(/\/$/, "");
    const webhookUrl = `${base}/webhook/approve`;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-webhook-secret": process.env.N8N_WEBHOOK_SECRET ?? "",
        },
        body: JSON.stringify({
          action_id,
          decision,
          contractor_id: profile.contractor_id,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
    } catch {
      // Timeout or network error — Supabase is already updated, contractor is unblocked
    }
  }

  return NextResponse.json({ success: true });
}
```

- [ ] **Step 6.2: Verify**

Using a REST client (or curl), POST to `localhost:3000/api/dashboard/approve` with a valid session cookie. Without auth, expect 401. With a missing/invalid action_id, expect 400.

- [ ] **Step 6.3: Commit**

```bash
git add app/api/dashboard/approve/route.ts
git commit -m "feat: add /api/dashboard/approve route with n8n webhook trigger"
```

---

## Task 8: API route — `/api/dashboard/actions`

**Files:**
- Create: `app/api/dashboard/actions/route.ts`

- [ ] **Step 7.1: Create actions route**

```ts
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!supabaseAdmin) return NextResponse.json({ error: "Server error" }, { status: 500 });

  const { data: profile } = await supabaseAdmin
    .from("users").select("contractor_id").eq("id", user.id).single();
  if (!profile) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const tab = searchParams.get("tab") ?? "needs_attention";
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "50"), 100);
  const offset = parseInt(searchParams.get("offset") ?? "0");

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  let query = supabaseAdmin
    .from("actions")
    .select("id, description, status, action_type, agent_name, created_at")
    .eq("contractor_id", profile.contractor_id)
    .gte("created_at", todayStart.toISOString())
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (tab === "needs_attention") {
    // Exclude human_review — those are in the inbox
    query = query.in("status", ["awaiting_customer", "failed"]);
  } else {
    query = query.in("status", ["auto_executed", "human_approved", "human_skipped", "jobber_synced"]);
  }

  const { data: items } = await query;
  return NextResponse.json(items ?? []);
}
```

- [ ] **Step 7.2: Verify**

Hit `localhost:3000/api/dashboard/actions?tab=needs_attention` and `?tab=completed`. Expect `[]` for test client. Confirm different status sets are filtered.

- [ ] **Step 7.3: Commit**

```bash
git add app/api/dashboard/actions/route.ts
git commit -m "feat: add /api/dashboard/actions route with tab filtering"
```

---

## Task 9: Dashboard server shell

**Files:**
- Rewrite: `app/dashboard/page.tsx`

- [ ] **Step 8.1: Rewrite page.tsx as thin auth shell**

Replace the entire file:

```tsx
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  if (!supabaseAdmin) redirect("/login");

  const { data: profile } = await supabaseAdmin
    .from("users")
    .select("contractor_id, role")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");
  if (profile.role === "admin") redirect("/admin");

  const { data: client } = await supabaseAdmin
    .from("clients")
    .select("business_name, first_name, agents_active")
    .eq("contractor_id", profile.contractor_id)
    .single();

  if (!client) redirect("/login");

  return (
    <DashboardClient
      businessName={client.business_name}
      firstName={client.first_name ?? null}
    />
  );
}
```

- [ ] **Step 8.2: Create DashboardClient.tsx placeholder**

Create `app/dashboard/DashboardClient.tsx`:

```tsx
"use client";

export default function DashboardClient({
  businessName,
  firstName,
}: {
  businessName: string;
  firstName: string | null;
}) {
  return (
    <div style={{ minHeight: "100vh", background: "#0f1923", fontFamily: "'Open Sans', sans-serif", color: "#e8ddd0" }}>
      <p style={{ padding: 32 }}>Dashboard loading... {businessName}</p>
    </div>
  );
}
```

- [ ] **Step 8.3: Verify**

Log in as test client. Confirm `/dashboard` loads without error and shows "Dashboard loading..." with the business name.

- [ ] **Step 8.4: Commit**

```bash
git add app/dashboard/page.tsx app/dashboard/DashboardClient.tsx
git commit -m "feat: dashboard server shell passes client data to DashboardClient"
```

---

## Task 10: NavBar and Greeting components

**Files:**
- Create: `app/dashboard/components/NavBar.tsx`
- Create: `app/dashboard/components/Greeting.tsx`

- [ ] **Step 9.1: Create NavBar.tsx**

```tsx
"use client";

export default function NavBar({ businessName }: { businessName: string }) {
  return (
    <nav style={{
      background: "#111e2e",
      borderBottom: "1px solid #1a2d42",
      padding: "16px 28px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15, fontWeight: 600, color: "#e8ddd0" }}>
        <div style={{
          width: 28, height: 28, background: "#e8934a", borderRadius: 5,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 13, fontWeight: 700, color: "#fff", flexShrink: 0,
        }}>F</div>
        Fieldline AI
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 13, color: "#6a7d8e" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#4ade80" }}>
          <span style={{
            width: 7, height: 7, background: "#4ade80", borderRadius: "50%",
            flexShrink: 0,
            animation: "fieldline-pulse 2s infinite",
          }} />
          All agents active
        </div>
        <span>{businessName}</span>
        <form action="/api/auth/logout" method="POST">
          <button type="submit" style={{
            background: "none", border: "none", color: "#354555",
            cursor: "pointer", fontSize: 13, padding: 0,
          }}>Sign out</button>
        </form>
      </div>
    </nav>
  );
}
```

Add the pulse keyframe to `app/globals.css`:
```css
@keyframes fieldline-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.35; }
}
```

- [ ] **Step 9.2: Create Greeting.tsx**

```tsx
"use client";

import { useMemo } from "react";

export default function Greeting({ firstName }: { firstName: string | null }) {
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Good morning";
    if (hour >= 12 && hour < 17) return "Good afternoon";
    if (hour >= 17 && hour < 22) return "Good evening";
    return "You're up late";
  }, []);

  const nameStr = firstName ? `, ${firstName}` : "";

  return (
    <div>
      <div style={{ fontSize: 24, fontWeight: 500, color: "#e8ddd0", lineHeight: 1.3 }}>
        {greeting}{nameStr}.
      </div>
      <div style={{ fontSize: 14, color: "#6a7d8e", marginTop: 6 }}>
        Everything your agents are doing.
      </div>
    </div>
  );
}
```

- [ ] **Step 9.3: Wire NavBar and Greeting into DashboardClient.tsx**

```tsx
"use client";

import NavBar from "./components/NavBar";
import Greeting from "./components/Greeting";

export default function DashboardClient({
  businessName,
  firstName,
}: {
  businessName: string;
  firstName: string | null;
}) {
  return (
    <div style={{ minHeight: "100vh", background: "#0f1923", fontFamily: "'Open Sans', sans-serif", color: "#e8ddd0" }}>
      <NavBar businessName={businessName} />
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "36px 28px", display: "flex", flexDirection: "column", gap: 30 }}>
        <Greeting firstName={firstName} />
        {/* sections mount here in subsequent tasks */}
      </div>
    </div>
  );
}
```

- [ ] **Step 9.4: Verify**

Dashboard shows nav with pulsing green dot, business name, Sign out. Greeting shows correct time-of-day salutation. Change system clock to verify all 4 time bands.

- [ ] **Step 9.5: Commit**

```bash
git add app/dashboard/components/NavBar.tsx app/dashboard/components/Greeting.tsx app/dashboard/DashboardClient.tsx app/globals.css
git commit -m "feat: dashboard NavBar and Greeting components"
```

---

## Task 11: ApprovalInbox component

**Files:**
- Create: `app/dashboard/components/ApprovalInbox.tsx`

- [ ] **Step 10.1: Create ApprovalInbox.tsx**

```tsx
"use client";

import { useState, useEffect, useCallback } from "react";

interface InboxItem {
  id: string;
  description: string;
  revenue_impact: number | null;
  confidence_score: number | null;
  created_at: string;
  action_type: string;
}

const COUNT_WORDS: Record<number, string> = {
  1: "One thing needs your approval",
  2: "Two things need your approval",
  3: "Three things need your approval",
  4: "Four things need your approval",
  5: "Five things need your approval",
};

function getApproveLabel(action_type: string): string {
  if (action_type.includes("schedule") || action_type.includes("book")) return "Yes, book it";
  if (action_type.includes("proposal") || action_type.includes("sms") || action_type.includes("send")) return "Yes, send it";
  return "Yes, do it";
}

export default function ApprovalInbox() {
  const [items, setItems] = useState<InboxItem[]>([]);
  const [fadingOut, setFadingOut] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState(false);

  const fetchInbox = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard/inbox");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setItems(data);
      setError(false);
    } catch {
      setError(true);
    }
  }, []);

  useEffect(() => {
    fetchInbox();
    // 10-second polling for normal updates
    const interval = setInterval(fetchInbox, 10000);
    return () => clearInterval(interval);
  }, [fetchInbox]);

  // Separate 30-second retry when in error state (spec: "auto-retry failed requests every 30 seconds")
  useEffect(() => {
    if (!error) return;
    const retryInterval = setInterval(fetchInbox, 30000);
    return () => clearInterval(retryInterval);
  }, [error, fetchInbox]);

  async function handleDecision(id: string, decision: "approved" | "skipped") {
    setFadingOut((prev) => new Set(prev).add(id));
    setTimeout(() => {
      setItems((prev) => prev.filter((item) => item.id !== id));
      setFadingOut((prev) => { const s = new Set(prev); s.delete(id); return s; });
    }, 400);
    try {
      await fetch("/api/dashboard/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action_id: id, decision }),
      });
    } catch { /* fire-and-forget */ }
  }

  if (error) {
    return (
      <div style={{ color: "#6a7d8e", fontSize: 13 }}>
        Couldn't load approvals — will retry shortly
      </div>
    );
  }

  const visibleItems = expanded ? items : items.slice(0, 3);
  const hiddenCount = items.length - 3;
  const headerText = items.length >= 6
    ? "5+ things need your approval"
    : COUNT_WORDS[items.length] ?? `${items.length} things need your approval`;

  return (
    <div style={{
      background: "#0d1420",
      border: "1px solid rgba(232,147,74,0.33)",
      borderRadius: 8,
      overflow: "hidden",
    }}>
      <div style={{
        padding: "12px 20px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        borderBottom: items.length === 0 ? "none" : "1px solid rgba(232,147,74,0.13)",
      }}>
        {items.length === 0 ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: "#4ade80", fontSize: 14 }}>✓</span>
            <div>
              <div style={{ fontSize: 12, fontWeight: 500, color: "#e8ddd0" }}>You're all caught up.</div>
              <div style={{ fontSize: 12, color: "#6a7d8e", marginTop: 2 }}>Nothing needs your attention right now.</div>
            </div>
          </div>
        ) : (
          <>
            <span style={{ fontSize: 12, fontWeight: 500, color: "#e8934a" }}>{headerText}</span>
            <span style={{ fontSize: 11, color: "#6a7d8e" }}>Takes 10 seconds</span>
          </>
        )}
      </div>

      {visibleItems.map((item) => (
        <div
          key={item.id}
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid rgba(232,147,74,0.09)",
            display: "flex", alignItems: "center", gap: 16,
            opacity: fadingOut.has(item.id) ? 0.3 : 1,
            transition: "opacity 0.4s ease",
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: "#e8ddd0" }}>{item.description}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
            {item.revenue_impact != null && item.revenue_impact > 0 && (
              <div style={{ fontSize: 16, fontWeight: 600, color: "#e8934a", whiteSpace: "nowrap" }}>
                ${item.revenue_impact.toLocaleString()}
              </div>
            )}
            <div style={{ display: "flex", gap: 7 }}>
              <button
                onClick={() => handleDecision(item.id, "approved")}
                style={{
                  background: "#0f2a18", color: "#4ade80",
                  border: "1px solid #1a4a28", padding: "7px 16px",
                  borderRadius: 6, fontSize: 12, cursor: "pointer",
                  fontWeight: 500, whiteSpace: "nowrap",
                  minHeight: 44, minWidth: 80,
                }}
              >
                {getApproveLabel(item.action_type)}
              </button>
              <button
                onClick={() => handleDecision(item.id, "skipped")}
                style={{
                  background: "transparent", color: "#4a5e70",
                  border: "1px solid #1a2d42", padding: "7px 16px",
                  borderRadius: 6, fontSize: 12, cursor: "pointer",
                  whiteSpace: "nowrap", minHeight: 44, minWidth: 80,
                }}
              >
                Skip
              </button>
            </div>
          </div>
        </div>
      ))}

      {!expanded && hiddenCount > 0 && (
        <button
          onClick={() => setExpanded(true)}
          style={{
            background: "none", border: "none", color: "#4a5e70",
            fontSize: 12, cursor: "pointer", padding: "10px 20px 12px",
            display: "flex", alignItems: "center", gap: 6, letterSpacing: "0.3px",
          }}
        >
          <span style={{ fontSize: 16, letterSpacing: 2, color: "#354555" }}>···</span>
          {hiddenCount} more to review
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 10.2: Mount ApprovalInbox in DashboardClient**

Add inside the `<div>` gap container in `DashboardClient.tsx`:

```tsx
import ApprovalInbox from "./components/ApprovalInbox";
// ...
<ApprovalInbox />
```

- [ ] **Step 10.3: Verify**

Dashboard shows approval inbox. With no items: shows "✓ You're all caught up." with green checkmark. Insert a test row directly in Supabase into `actions` table with `status = 'human_review'` and the test contractor's `contractor_id`. Reload — card appears. Click "Yes, do it" — card fades and disappears. Check Supabase: `status` updated to `human_approved`.

- [ ] **Step 10.4: Commit**

```bash
git add app/dashboard/components/ApprovalInbox.tsx app/dashboard/DashboardClient.tsx
git commit -m "feat: ApprovalInbox with approve/skip, expand, polling"
```

---

## Task 12: StatsRow component

**Files:**
- Create: `app/dashboard/components/StatsRow.tsx`

- [ ] **Step 11.1: Create StatsRow.tsx**

```tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface Metrics {
  revenue_mtd: number;
  retainer_amount: number;
  leads_recovered: number;
  leads_guarantee: number;
  avg_response_ms: number;
  actions_today: number;
  last_updated: string;
}

function useCountUp(target: number, duration = 1000) {
  const [value, setValue] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (target === 0 || hasAnimated.current) return;
    hasAnimated.current = true;
    const start = performance.now();
    function frame(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }, [target, duration]);

  return value;
}

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return "Just updated";
  const mins = Math.floor(diff / 60);
  return `Last updated ${mins} min ago`;
}

export default function StatsRow() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [lastUpdatedDisplay, setLastUpdatedDisplay] = useState("");
  const [error, setError] = useState(false);

  const fetchMetrics = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard/metrics");
      if (!res.ok) throw new Error();
      const data: Metrics = await res.json();
      setMetrics(data);
      setError(false);
    } catch {
      setError(true);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
    // 10-second polling for normal updates
    const interval = setInterval(fetchMetrics, 10000);
    return () => clearInterval(interval);
  }, [fetchMetrics]);

  // Separate 30-second retry when in error state (spec: "auto-retry failed requests every 30 seconds")
  useEffect(() => {
    if (!error) return;
    const retryInterval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(retryInterval);
  }, [error, fetchMetrics]);

  useEffect(() => {
    if (!metrics) return;
    setLastUpdatedDisplay(timeAgo(metrics.last_updated));
    const tick = setInterval(() => setLastUpdatedDisplay(timeAgo(metrics.last_updated)), 30000);
    return () => clearInterval(tick);
  }, [metrics]);

  const animatedRevenue = useCountUp(metrics?.revenue_mtd ?? 0);

  if (error) {
    return <div style={{ color: "#6a7d8e", fontSize: 13 }}>Couldn't load stats — will retry shortly</div>;
  }

  if (!metrics) {
    return (
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ flex: "1 1 200px", background: "#111e2e", border: "1px solid #1a2d42", borderRadius: 8, padding: 20, minHeight: 90 }} />
        ))}
      </div>
    );
  }

  const isEmpty = metrics.revenue_mtd === 0 && metrics.actions_today === 0;

  if (isEmpty) {
    return (
      <div style={{ background: "#111e2e", border: "1px solid #1a2d42", borderRadius: 8, padding: "28px 20px", textAlign: "center" }}>
        <div style={{ color: "#9aaabb", fontSize: 14, marginBottom: 6 }}>Your system is live and standing by.</div>
        <div style={{ color: "#4a5e70", fontSize: 13 }}>Actions will appear here as your agents get to work.</div>
      </div>
    );
  }

  const ahead = metrics.revenue_mtd - metrics.retainer_amount;
  const leadsLeft = metrics.leads_guarantee - metrics.leads_recovered;
  const avgSecs = Math.round(metrics.avg_response_ms / 1000);

  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
        {/* Revenue */}
        <div style={{ flex: "1 1 200px", background: "#111e2e", border: "1px solid #1a2d42", borderRadius: 8, padding: 20 }}>
          <div style={{ fontSize: 12, color: "#4a5e70", marginBottom: 10, fontWeight: 500 }}>Money recovered this month</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#e8934a", lineHeight: 1 }}>${animatedRevenue.toLocaleString()}</div>
          <div style={{ fontSize: 12, color: ahead >= 0 ? "#4ade80" : "#354555", marginTop: 7 }}>
            {ahead >= 0 ? `$${ahead.toLocaleString()} ahead of your retainer` : `$${Math.abs(ahead).toLocaleString()} behind retainer`}
          </div>
        </div>
        {/* Leads */}
        <div style={{ flex: "1 1 200px", background: "#111e2e", border: "1px solid #1a2d42", borderRadius: 8, padding: 20 }}>
          <div style={{ fontSize: 12, color: "#4a5e70", marginBottom: 10, fontWeight: 500 }}>Missed calls answered</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#e8ddd0", lineHeight: 1 }}>{metrics.leads_recovered}</div>
          <div style={{ fontSize: 12, color: "#354555", marginTop: 7 }}>
            {leadsLeft <= 0 ? "Guarantee met ✓" : `${leadsLeft} more to hit your guarantee`}
          </div>
        </div>
        {/* Response time */}
        <div style={{ flex: "1 1 200px", background: "#111e2e", border: "1px solid #1a2d42", borderRadius: 8, padding: 20 }}>
          <div style={{ fontSize: 12, color: "#4a5e70", marginBottom: 10, fontWeight: 500 }}>Average response time</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#4ade80", lineHeight: 1 }}>{avgSecs}s</div>
          <div style={{ fontSize: 12, color: "#354555", marginTop: 7 }}>Industry average is 8 hours</div>
        </div>
      </div>
      <div style={{ textAlign: "right", fontSize: 11, color: "#354555", marginTop: 8 }}>
        {lastUpdatedDisplay}
      </div>
    </div>
  );
}
```

- [ ] **Step 11.2: Mount StatsRow in DashboardClient**

```tsx
import StatsRow from "./components/StatsRow";
// After <ApprovalInbox />:
<StatsRow />
```

- [ ] **Step 11.3: Verify**

Revenue card shows `$0` for day-1 test client but no broken layout. When `actions_today === 0` and `revenue_mtd === 0`, shows "Your system is live" card. "Last updated X min ago" appears below stats row. Count-up animation fires once on page load — does NOT re-animate on polling refresh.

- [ ] **Step 11.4: Commit**

```bash
git add app/dashboard/components/StatsRow.tsx app/dashboard/DashboardClient.tsx
git commit -m "feat: StatsRow with count-up animation, polling, last-updated"
```

---

## Task 13: ActionFeed component

**Files:**
- Create: `app/dashboard/components/ActionFeed.tsx`

- [ ] **Step 12.1: Create ActionFeed.tsx**

```tsx
"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface ActionItem {
  id: string;
  description: string;
  status: string;
  action_type: string;
  agent_name: string;
  created_at: string;
}

type Tab = "needs_attention" | "completed";

const DOT_COLOR: Record<string, string> = {
  auto_executed: "#4ade80",
  human_approved: "#4ade80",
  awaiting_customer: "#e8934a",
  human_review: "#e8934a",
  jobber_synced: "#60a5fa",
  human_skipped: "#3d5068",
  failed: "#E8756A",
};

function relativeTime(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  const d = new Date(iso);
  return `Yesterday at ${d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
}

export default function ActionFeed() {
  const [tab, setTab] = useState<Tab>("needs_attention");
  const [attentionItems, setAttentionItems] = useState<ActionItem[]>([]);
  const [completedItems, setCompletedItems] = useState<ActionItem[]>([]);
  const [attentionExpanded, setAttentionExpanded] = useState(false);
  const [completedExpanded, setCompletedExpanded] = useState(false);
  const [error, setError] = useState(false);
  const seenIds = useRef<Set<string>>(new Set());
  const [newIds, setNewIds] = useState<Set<string>>(new Set());

  const fetchTab = useCallback(async (t: Tab) => {
    try {
      const res = await fetch(`/api/dashboard/actions?tab=${t}`);
      if (!res.ok) throw new Error();
      const data: ActionItem[] = await res.json();

      // Track net-new for fade-in
      const incoming = new Set(data.map((a) => a.id));
      const fresh = new Set<string>();
      incoming.forEach((id) => { if (!seenIds.current.has(id)) fresh.add(id); });
      data.forEach((a) => seenIds.current.add(a.id));
      if (fresh.size > 0) {
        setNewIds((prev) => new Set([...prev, ...fresh]));
        setTimeout(() => setNewIds((prev) => { const s = new Set(prev); fresh.forEach((id) => s.delete(id)); return s; }), 300);
      }

      if (t === "needs_attention") setAttentionItems(data);
      else setCompletedItems(data);
      setError(false);
    } catch {
      setError(true);
    }
  }, []);

  useEffect(() => {
    fetchTab("needs_attention");
    fetchTab("completed");
    // 10-second polling for normal updates
    const interval = setInterval(() => {
      fetchTab("needs_attention");
      fetchTab("completed");
    }, 10000);
    return () => clearInterval(interval);
  }, [fetchTab]);

  // Separate 30-second retry when in error state (spec: "auto-retry failed requests every 30 seconds")
  useEffect(() => {
    if (!error) return;
    const retryInterval = setInterval(() => {
      fetchTab("needs_attention");
      fetchTab("completed");
    }, 30000);
    return () => clearInterval(retryInterval);
  }, [error, fetchTab]);

  function renderRows(items: ActionItem[], defaultCount: number, expanded: boolean, setExpanded: (v: boolean) => void) {
    const visible = expanded ? items : items.slice(0, defaultCount);
    const hiddenCount = items.length - defaultCount;

    if (items.length === 0) {
      return tab === "needs_attention" ? (
        <div style={{ color: "#4a5e70", fontSize: 13, padding: "16px 0" }}>
          Nothing needs your attention right now.
        </div>
      ) : (
        <div style={{ padding: "16px 0" }}>
          <div style={{ color: "#4a5e70", fontSize: 13 }}>No completed actions yet today.</div>
          <div style={{ color: "#4a5e70", fontSize: 13, marginTop: 4 }}>Your agents are standing by.</div>
        </div>
      );
    }

    return (
      <>
        {visible.map((item) => (
          <div
            key={item.id}
            style={{
              display: "flex", alignItems: "flex-start", gap: 14,
              padding: "14px 0", borderBottom: "1px solid #0d1420",
              opacity: newIds.has(item.id) ? 0 : 1,
              transition: "opacity 0.3s ease",
            }}
          >
            <span style={{
              width: 8, height: 8, borderRadius: "50%", flexShrink: 0, marginTop: 5,
              background: DOT_COLOR[item.status] ?? "#3d5068",
            }} />
            <div style={{ flex: 1, fontSize: 13, color: "#9aaabb", lineHeight: 1.7 }}>
              {item.description}
            </div>
            <div style={{ fontSize: 12, color: "#2e3f50", whiteSpace: "nowrap", paddingTop: 3 }}>
              {relativeTime(item.created_at)}
            </div>
          </div>
        ))}

        {!expanded && hiddenCount > 0 && (
          <button
            onClick={() => setExpanded(true)}
            style={{
              background: "none", border: "none", color: "#4a5e70",
              fontSize: 12, cursor: "pointer", padding: "10px 0 2px",
              display: "flex", alignItems: "center", gap: 6, letterSpacing: "0.3px",
            }}
          >
            <span style={{ fontSize: 16, letterSpacing: 2, color: "#354555" }}>···</span>
            {hiddenCount} more {tab === "needs_attention" ? "things need attention" : "completed actions"}
          </button>
        )}
        {expanded && items.length > defaultCount && (
          <button
            onClick={() => setExpanded(false)}
            style={{
              background: "none", border: "none", color: "#4a5e70",
              fontSize: 12, cursor: "pointer", padding: "10px 0 2px",
            }}
          >
            Show less
          </button>
        )}
      </>
    );
  }

  if (error) {
    return <div style={{ color: "#6a7d8e", fontSize: 13 }}>Couldn't load this section — will retry shortly</div>;
  }

  return (
    <div>
      {/* Tabs */}
      <div style={{ display: "flex", gap: 24, marginBottom: 16, borderBottom: "1px solid #1a2d42" }}>
        {(["needs_attention", "completed"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              background: "none", border: "none", cursor: "pointer",
              fontSize: 13, fontWeight: 500,
              color: tab === t ? "#e8ddd0" : "#4a5e70",
              padding: "0 0 12px",
              borderBottom: tab === t ? "2px solid #e8934a" : "2px solid transparent",
              marginBottom: -1,
            }}
          >
            {t === "needs_attention" ? "Needs attention" : "Completed today"}
          </button>
        ))}
      </div>

      {tab === "needs_attention"
        ? renderRows(attentionItems, 3, attentionExpanded, setAttentionExpanded)
        : renderRows(completedItems, 5, completedExpanded, setCompletedExpanded)}
    </div>
  );
}
```

- [ ] **Step 12.2: Mount ActionFeed in DashboardClient**

```tsx
import ActionFeed from "./components/ActionFeed";
// After <StatsRow />:
<ActionFeed />
```

- [ ] **Step 12.3: Verify**

Both tabs render. "Needs attention" defaults on load. Switching tabs works. Empty state shows correct message per tab. `···` expand button appears when more than 3/5 items. "Show less" collapses back. Polling: insert a row in Supabase with `status = 'auto_executed'` and today's timestamp — it fades in within 10 seconds without re-rendering the whole list.

- [ ] **Step 12.4: Commit**

```bash
git add app/dashboard/components/ActionFeed.tsx app/dashboard/DashboardClient.tsx
git commit -m "feat: ActionFeed with tabs, polling, expand/collapse, fade-in for new rows"
```

---

## Task 14: Mobile pass and acceptance checklist

**Files:**
- `app/dashboard/DashboardClient.tsx` — add responsive wrapper styles
- All component files — verify tap targets

- [ ] **Step 13.1: Add responsive styles to stats row**

In `StatsRow.tsx`, the stats already use `flex: "1 1 200px"` on each card with `flexWrap: "wrap"` on the container — this is already responsive per spec. No change needed here. Verify it wraps correctly at 390px width.

- [ ] **Step 13.2: Verify mobile at iPhone viewport**

Open DevTools → toggle device toolbar → iPhone 14 Pro (390px width). Check:
- [ ] No horizontal scroll anywhere
- [ ] Stats cards stack to single column
- [ ] Approve/Skip buttons are ≥ 44px tall and ≥ 80px wide
- [ ] Approval card value + buttons stack below description (they already do since buttons are `flexShrink: 0` and description is `flex: 1`)

- [ ] **Step 13.3: Run full acceptance checklist from spec**

```
[ ] Contractor logs in → sees only their data (contractor_id scoped)
[ ] Greeting uses correct time-of-day and contractor first name
[ ] Approval inbox shows held actions and fires n8n within 2s of tap
[ ] ··· in inbox shows correct count of remaining unapproved items
[ ] Stats ROI number counts up on page load (once only)
[ ] "Last updated X min ago" accurate and refreshes every 30 seconds
[ ] Action feed defaults to "Needs attention" tab
[ ] "Needs attention" shows only unresolved items (not inbox items)
[ ] "Completed today" shows auto-executed and approved items
[ ] Both tabs have working ··· expand with correct counts
[ ] All empty states render correctly — no blank sections
[ ] Mobile: approve/skip buttons are 44px+ tap targets, no horizontal scroll
[ ] Day-1 contractor with zero data sees clean empty state
[ ] No Tailwind classes in dashboard files — inline CSS only
```

- [ ] **Step 13.4: Final commit**

```bash
git add -A
git commit -m "feat: complete Fieldline AI client dashboard — approval inbox, stats, action feed, mobile"
```

---

## SQL Reference (run in Supabase SQL editor)

```sql
-- Task 1: Add first_name column
ALTER TABLE clients ADD COLUMN IF NOT EXISTS first_name text;

-- Verify actions table has required columns (add if missing)
ALTER TABLE actions ADD COLUMN IF NOT EXISTS response_time_ms integer;
ALTER TABLE actions ADD COLUMN IF NOT EXISTS status text DEFAULT 'auto_executed';
ALTER TABLE actions ADD COLUMN IF NOT EXISTS contractor_id uuid;
```
