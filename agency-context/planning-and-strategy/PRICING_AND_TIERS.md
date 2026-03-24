# Fieldline AI — Pricing Model
**Last Updated:** 2026-03-19

---

## How Pricing Works

**No fixed tiers. No packages. Custom-quoted per engagement.**

Every engagement starts with a discovery call. We learn the contractor's specific bottlenecks, identify which agents will have the highest immediate ROI, and send a custom proposal within 24 hours. Pricing is scoped to what they actually need — not a menu they pick from.

**Floor:** Engagements start at **$1,500/month** (Concierge agent only)
**Setup fee:** Starts at **$500**, scales with scope of build
**Commitment:** 3-month minimum recommended once agents beyond Concierge are deployed

---

## The Guarantee

**5 recovered leads in 30 days or the second month is free.**

**What "recovered lead" means precisely:**
A lead that was (1) captured by the system, (2) received an automated response within 60 seconds, and (3) resulted in a booked appointment or a followed-up conversation. Logged automatically in the Supabase `actions` table. No arguing. The data is always there.

**No free trial.** The setup fee is the commitment signal. It filters contractors who aren't serious.

---

## The Four Agents (What Gets Built)

Contractors don't buy tiers. They buy whichever agents solve their biggest bottlenecks, discovered on the call.

### The Concierge — Always First
**What it solves:** Missed leads, slow response, no-shows from unanswered calls
**What it does:** 24/7 lead intake (SMS, missed calls, Facebook, LSA, web forms), urgency triage, review requests, inbound reply routing
**Why first:** Zero behavior change required from the contractor or their techs. Delivers the guarantee. Most visible ROI immediately.
**Floor price when standalone:** $1,500/month

### The Closer — Add When Concierge Is Stable
**What it solves:** Late-night quoting, inconsistent pricing, low close rates
**What it does:** Tech marks diagnostic in Jobber → agent drafts proposal from pricebook → sends to tech → auto-sends or escalates based on job value
**Requires:** Jobber pricebook to be maintained by contractor
**Approval logic:**
- Under $500 → auto-sends to customer
- $500–$2,000 → owner gets 1-tap SMS approval
- $2,000+ → owner must approve first

### The Dispatcher — Add After Concierge Has Data
**What it solves:** Empty schedule gaps, wasted windshield time, customers not knowing when tech arrives
**What it does:** Monitors Jobber job events, fills cancelled slots from waitlist, sends ETA updates, coordinates tech assignment
**Best for:** Contractors with 3+ techs running multiple jobs daily

### The Strategist — Add at Month 2+
**What it solves:** Dead customer list, slow weeks, no visibility into business performance
**What it does:** Mines old customer data for tune-up opportunities, organizes block specials, sends monthly ROI report to contractor
**Requires:** 30+ days of Concierge data to be effective

---

## Pricing Examples (Not Fixed — Discovery-Dependent)

| Situation | What Gets Built | Approx Monthly |
|---|---|---|
| Concierge only (entry) | After-hours capture, missed calls, review requests, inbound routing | $1,500 |
| Concierge + Closer | Above + proposal generation from Jobber diagnostics | $2,000–2,500 |
| Concierge + Dispatcher | Above + cancellation fill, ETA updates, schedule optimization | $2,000–2,500 |
| Full Digital Front Office | All 4 agents | $3,500–4,500 |
| No CRM (build from scratch) | Full Supabase + Next.js CRM + agents | Custom — higher |

*Actual pricing set after discovery call. These are reference ranges.*

---

## Setup Fee Structure

| Scope | Setup Fee |
|---|---|
| Concierge only | $500 |
| 2 agents | $750–1,000 |
| Full Digital Front Office | $1,500–2,000 |
| Full Digital Front Office + custom CRM build | $5,000–10,000 |

Setup fee covers: number porting, Supabase provisioning, Jobber webhook configuration, agent build and configuration, end-to-end testing, go-live call, dashboard setup.

---

## Cost Structure (Internal Reference)

Variable costs per client per month (worst case, heavy usage):

| Cost Item | Monthly |
|---|---|
| Claude API (standard + batch mix) | $30–80 |
| Nemotron (fallback, usually $0) | $0–5 |
| SignalWire SMS | $5–20 |
| Supabase (shared) | $5–10 |
| n8n Cloud (shared) | $5–10 |
| VPS share (NemoClaw) | $10–15 |
| **Total worst case** | **~$53–140** |

At $1,500/month minimum: **89%+ gross margin worst case.**

**Cost protection rules:**
1. Non-real-time calls (reports, summaries, scoring) → Claude Batch API (50% off)
2. If Claude spend hits $150/month per contractor → overflow to Nemotron fallback

---

## Sales Pitch by Bottleneck

**If they're losing after-hours leads:**
> "We put a Concierge on your business. Every lead that texts in after hours gets a response in 60 seconds. Every missed call gets a follow-up within 5 minutes. You don't touch anything. Guarantee: 5 recovered leads in 30 days or second month free."

**If they're quoting too slowly:**
> "We build a Closer. Your tech marks what they found in Jobber. A proposal shows up on their phone in under 60 seconds with the right price and margin. They present it on-site. The customer decides now, not 2 days later."

**If their schedule has gaps:**
> "We build a Dispatcher. When a job cancels, we text your waitlist automatically and fill the slot before you even know it opened."

**If they have a dead customer list:**
> "We build a Strategist. It scans your old customers, finds everyone due for a tune-up, and organizes campaigns to fill your slow weeks with high-margin maintenance calls."

---

## ServiceTitan Note

ServiceTitan is a target market but the partner API is not yet approved (4-8 week timeline). Do not promise full ST-native automation until approved. Current approach: sell the vision, confirm availability before committing to ST-specific features.

ServiceTitan contractors are often the highest-value prospects — they're already paying $1,500-3,000/month for software, which means they believe in paying for tools that work.
