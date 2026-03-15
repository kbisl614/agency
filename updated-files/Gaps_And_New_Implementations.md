# HVAC SaaS: Gaps & New Implementations
**Last Updated:** March 2026  
**Source:** CRM Pain Point Research + Product Cross-Reference  
**Purpose:** Track what's genuinely new, what's missing, and what needs to be built or decided

---

## How to Use This Document

This is not a wishlist. Every item here was either:
- Surfaced by contractor VOC research as a real pain point not covered in the current roadmap, or
- Identified as an architectural gap that will cause the product to break or underperform in the real world

Nothing here is speculative. Everything is tied to a specific research finding or a specific missing piece in the current 17-workflow architecture.

---

## Section 1 — Net-New Features (Not in Any Existing Doc)

These three things do not exist anywhere in the current roadmap, architecture docs, or workflow specs. They need to be added.

---

### 1. Missed Call → SMS Recovery Workflow

**What it is:** A Twilio missed call webhook trigger that fires when an inbound call goes unanswered during business hours. The system texts the caller within 60 seconds with a personalized message.

**Why it's not optional:**
- Research finding: *"27% of all calls go unanswered. 13 missed calls/month. $3,900 in lost revenue."*
- This is daytime bleeding, not just after-hours. Contractors are losing revenue during their own working hours.
- It is technically trivial — one Twilio webhook, one Claude call, one SMS out.
- It nearly doubles the documented ROI pitch from $4,700/month to $8,600/month without changing the retainer price.

**How it works:**
1. Twilio fires missed call webhook → n8n receives it
2. n8n checks phone number against Airtable Leads + Waitlist tables
3. If returning customer → Claude personalizes response with service history
4. If new caller → Claude sends generic but warm response
5. SMS sent within 60 seconds:
   > *"Hey, we just missed your call — we're on a job right now. What's going on with your system? We'll get back to you within the hour."*
6. Log to audit trail with $revenue_impact estimate

**Where it fits in the roadmap:** Add as Workflow 2b — sits between lead capture (WF1) and SMS response (WF2). Build it in Week 1 alongside the core MVP.

**Revenue impact:** $3,900/month documented

---

### 2. Confidence Score Visible on the Dashboard

**What it is:** Every action in the audit trail feed shows not just what the system did, but the Claude confidence score behind the decision — and whether it auto-executed or was escalated.

**Why it's not optional:**
- Research finding: *"The more we automate, the more time I spend babysitting the software."*
- The 85% confidence threshold already exists in `agent-ops.md` as a backend rule. But the contractor never sees it.
- Without visible confidence scores, the dashboard just shows outputs. Contractors can't learn to trust the system because they can't see its reasoning.
- This is the difference between a contractor renewing at month 2 and cancelling because they don't understand why something got auto-executed.

**How it works:**
- Every action in the Next.js dashboard feed shows:
  - ✅ Auto-executed — 94% confidence
  - ⚠️ Sent for your approval — 71% confidence, ambiguous urgency
- Running monthly trust metric: *"This month: 47 actions auto-executed, 3 escalated for approval"*

**Where it fits in the roadmap:** Phase 2 dashboard build. One display addition to the Next.js action feed component.

**Impact:** Retention. Contractors who understand the system's reasoning don't cancel.

---

### 3. Multi-Turn SMS Conversation Threading

**What it is:** When a customer replies to an outbound SMS more than once, the system passes the full conversation history through Claude on each subsequent reply — not just the latest message.

**Why it's not optional:**
- Current Workflow 9 (Inbound SMS Handler) classifies a single reply and routes it. One turn.
- Real customer conversations don't stop at one reply. *"Actually can we do Thursday instead?"* — *"Is 2pm okay?"* — *"What's the price for a tune-up?"* These are all second and third replies.
- Without threading, the second reply gets treated as a brand new message with zero context. Claude will give a confused or generic response. The customer experience breaks.
- This is the exact gap that makes HCP Assist feel like a rigid script. Threading is what makes your system feel like a real conversation.

**How it works:**
1. Every outbound SMS logs a `conversation_id` + message to Airtable
2. When an inbound reply arrives, n8n queries Airtable for the last 3–4 messages in that `conversation_id`
3. Claude receives full thread context, not just the latest message
4. Response is contextually aware of everything said so far
5. Conversation closes when booking is confirmed, question is resolved, or owner escalation fires

**Where it fits in the roadmap:** Architectural addition to Workflow 9. Requires adding `conversation_id` and `thread_history` fields to the Airtable Leads table. Build this when building Workflow 9 in Week 3 — retrofitting it later is harder.

**Impact:** Product differentiation. No CRM does this. It's the feature that makes contractors say *"it actually understands the customer."*

---

## Section 2 — Architectural Gaps (Things That Will Break Without Attention)

These aren't new features. They're holes in the current architecture that will cause real problems once the product is live with a paying client.

---

### Gap 1 — No Explicit "SMS Only" Constraint for Tech-Facing Workflows

**The problem:** The research is loud on the office vs. field experience gap. *"Good for office, horrible for techs — makes me want to throw my damn phone."* Every CRM fails techs in the field because they require app logins, form submissions, and extra taps.

Your current tech-facing workflows (6b — Tech Assignment SMS) already use SMS only. But this is accidental — it's never been written as an explicit design rule. Without it documented, future workflow additions could accidentally require techs to open an app or log into something.

**The fix:** Add this as a hard constraint to `agent-ops.md`:
> *If a tech needs to open an app for a workflow to function, the workflow is wrong. All tech-facing interactions are single SMS messages. Confirmation = reply YES. That's the entire interface.*

**Impact:** Prevents a future build decision from accidentally creating the same tech-UX problem every competitor has.

---

### Gap 2 — Revenue Impact Field Not Populated on Every Action

**The problem:** The Airtable Actions table already has a `revenue_impact` field. But looking at the workflow specs, it's only explicitly populated on a few workflows — cancellation fill logs `$175`, for example. Most other workflows (SMS responses, review requests, ETA updates) don't have a defined revenue impact value.

**The fix:** Every workflow needs a defined `revenue_impact` value logged to the Actions table, even indirect ones:

| Action | Revenue Impact to Log |
|---|---|
| Emergency lead captured + responded | $150 (avg job value) |
| Missed call recovered via SMS | $300 (avg job value) |
| Cancellation slot filled | $175 |
| Invoice reminder sent → payment received | Invoice amount |
| Tech assignment SMS sent | $8 (2 min dispatcher time saved @ $25/hr) |
| Post-job review request sent | $0 direct, flag as "retention action" |
| Daily summary delivered | $0 direct, flag as "retention action" |

Without this, the monthly ROI total on the dashboard will be incomplete and the contractor will underestimate what the system is actually doing for them. This is a churn risk.

---

### Gap 3 — No Fallback if Jobber API Goes Down

**The problem:** The research surfaced a contractor who lost $20K when HCP's VoIP went down for 30 days. The underlying fear: *"vendor-controlled core systems can fail spectacularly."* Your system depends on the Jobber API for cancellation detection, job creation, and customer data.

If Jobber's API is down or rate-limited, several workflows silently fail with no contractor notification.

**The fix:** Every Jobber API call in n8n needs an error branch:
- Log the failure to the Actions table with `action_type: api_error`
- Send the owner a dashboard alert: *"Jobber connection issue — [workflow name] paused. We'll retry automatically."*
- Retry logic: 3 attempts with exponential backoff before alerting

This doesn't require new infrastructure. It's n8n error handling on existing nodes. But it needs to be built into every Jobber-dependent workflow from the start.

---

### Gap 4 — No Defined Behavior When Claude Confidence is Between 70–85%

**The problem:** The current rule is: auto-execute above 85%, escalate to human below 85%. But there's no defined behavior for the 70–85% range on non-high-stakes actions. A lead qualification that comes back at 78% confidence — does it auto-send a generic response? Does it sit in a queue? Does it escalate?

Right now this is undefined, which means n8n will either auto-execute when it shouldn't or escalate everything in that range and create alert fatigue for the owner.

**The fix:** Define a three-tier confidence ladder in `agent-ops.md`:

| Confidence | Action |
|---|---|
| 85%+ | Auto-execute |
| 70–84% | Auto-execute with dashboard flag (visible but not blocking) |
| Below 70% | Escalate to owner for approval before any action |

The 70–84% tier acts but leaves a visible breadcrumb on the dashboard so the owner can see what the system was less certain about. They're not interrupted, but they have visibility.

---

## Section 3 — Business-Level Gaps (Not Technical)

These are gaps in how the business operates that will create problems when the first client signs.

---

### Business Gap 1 — No Defined Onboarding Process

**The problem:** The universal offer is *"30-day free trial, we set everything up."* But there's no documented onboarding checklist for what "set everything up" actually means. When the first client signs, what are the exact steps? What do you need from them? How long does it take?

**What needs to exist:**
- Client onboarding checklist (Jobber API key, Twilio number setup, Airtable base creation, dashboard access)
- Time estimate: how many hours does setup actually take per client?
- A client-facing "here's what happens in your first week" document

Without this, the first onboarding will be improvised and take 3x longer than it should.

---

### Business Gap 2 — No Defined Off-Boarding / Cancellation Policy

**The research finding:** Contractors are deeply afraid of being locked in. Jobber's hard-to-cancel experience came up multiple times as a reason contractors don't trust software vendors.

**What needs to exist:** A one-paragraph cancellation policy that's proactively shared at signup — not buried in a contract. Something like:
> *"Cancel any time, no questions asked, 30-day notice. Your data stays yours — we'll export everything before we disconnect."*

This isn't a legal document. It's a trust signal. The fact that you're willing to say it upfront is itself a differentiator.

---

### Business Gap 3 — No Client Health Monitoring

**The problem:** Once a client is live, how do you know if the system is actually performing? What triggers a proactive check-in vs. waiting for them to complain?

**What needs to exist:** A simple client health dashboard (your admin view, not the contractor's view) that flags:
- Clients with zero actions logged in the last 48 hours (system may be broken)
- Clients with declining action counts week-over-week (system may be underperforming)
- Clients approaching their 30-day trial end with low ROI logged (churn risk)

This is Workflow 17 territory (multi-contractor admin view) but the health monitoring logic needs to be defined before the first client goes live — not after the first client churns.

---

## Summary — Everything to Add or Fix

| Item | Type | Priority | When |
|---|---|---|---|
| Missed call → SMS recovery workflow | Net-new feature | P1 | Week 1 |
| Confidence score on dashboard | Net-new display feature | P2 | Phase 2 |
| Multi-turn SMS conversation threading | Net-new architecture | P1 | Week 3 (build with WF9) |
| SMS-only constraint for tech workflows | Design rule / doc fix | P1 | Now — add to agent-ops.md |
| Revenue impact on every action type | Architecture fix | P1 | Week 1 (build into WF3) |
| Jobber API error handling + fallback | Architecture fix | P2 | Week 2 (build with WF5) |
| 70–85% confidence tier definition | Architecture fix | P2 | Now — define before first build |
| Client onboarding checklist | Business process | P1 | Before first client signs |
| Cancellation policy document | Business process | P1 | Before first client signs |
| Client health monitoring (admin view) | Business process | P2 | Phase 2 |

---

*Last updated: March 2026 | Internal reference — product + business gaps*
