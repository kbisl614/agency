# Prompt for Dashboard Build Session
# Use this as the opening context when starting a dedicated dashboard/landing page Claude session.

---

## Session Context

You're picking up a dashboard build for Fieldline AI — a productized AI operations agency for HVAC contractors. You are NOT building a SaaS product. This is a managed service. Contractors pay a monthly retainer and never configure anything.

**Read these files before writing any code:**
1. `HANDOFF.md` — current project state
2. `docs/FIELDLINE_AI_MASTER.md` — full strategic context
3. `docs/agent-ops.md` — agent architecture
4. `docs/BRAND_ASSETS.md` — design tokens

---

## What You're Building

**A multi-tenant Next.js dashboard** at `dashboard.fieldlineai.com`:

| Route | Who | What |
|---|---|---|
| `/login` | All | Supabase Auth email + password |
| `/dashboard` | Clients | Action feed, metrics, lead log |
| `/admin` | Admin (Karsyn) | All clients overview, system health |
| `/admin/onboard` | Admin | Provision new contractor (30 min) |

The dashboard shows what the AI system did. Read-only for clients. Karsyn sees everything.

---

## Technical Context

- **Framework:** Next.js 14 (already scaffolded, see `app/` directory)
- **Database:** Supabase at `cdofgroinizevjxyzvnn.supabase.co`
- **Auth:** `@supabase/ssr` (NOT `@supabase/auth-helpers-nextjs` — deprecated)
- **Service role key:** Server-side only, never `NEXT_PUBLIC_`
- **RLS:** Every table has `WHERE contractor_id = auth.uid()` policy
- **Styling:** Inline CSS only — NO Tailwind (conflicts with existing site)

---

## Design Tokens (Must Use These)

```
Navy:   #1A2535  — sidebar, headers, dark backgrounds
Orange: #E8934A  — primary accent, CTAs, highlights
Cream:  #FAFAF8  — page background
Green:  #1A7A4A  — revenue numbers, success states
```

Responsive: `flex: "1 1 300px"` + `flexWrap: wrap` pattern throughout.

---

## Supabase Schema

Tables: `clients`, `users`, `leads`, `actions`, `workflow_performance`
Full schema in `handoff-dashboard.md`.

Key pattern:
```ts
// Every API route authenticates then gets contractor_id
const { data: userData } = await supabase
  .from('users')
  .select('contractor_id, role')
  .eq('id', user.id)
  .single()
```

---

## Build Order

Start here, in this order:
1. **Supabase schema** — run SQL from `handoff-dashboard.md`, verify RLS
2. **Auth flow** — `/login` page + middleware + role-based redirect
3. **Client dashboard** — metrics bar + action feed (read-only first)
4. **Admin dashboard** — client list overview
5. **`/admin/onboard`** — new contractor provisioning form

---

## What Done Looks Like for Phase 1

- [ ] Log in at `/login` with Supabase credentials → redirects to `/dashboard` (client) or `/admin` (admin)
- [ ] Client dashboard shows action feed, metrics, and lead count for that contractor only
- [ ] Logging in as a different contractor shows different data
- [ ] `/admin/onboard` form creates a client row + auth user in Supabase
- [ ] No Tailwind classes in dashboard files (inline CSS only)
