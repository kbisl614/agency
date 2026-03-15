---
name: Feature Prioritization & Implementation Mapping
description: Maps market research (contractor-validated pain) to Layer 1 agents by tier. Defines what builds in Phase 1 (Tier 1 only), Phase 2 (Tier 2), and Phase 3+ (Tier 3). Source of truth for feature prioritization.
type: spec
---

# Feature Prioritization & Implementation Mapping

**Framework:** Every feature decision runs through three filters:
1. Did contractors mention this pain unprompted?
2. Does it generate measurable ROI in the first 30 days?
3. Is it technically buildable before the first client signs?

---

## TIER 1 — Phase 1 Demo (Build Now, Lead With These)

### ✅ **After-Hours Lead Capture + Instant SMS Response**
- **Workflow File:** `n8n/tier1_after_hours_lead_capture.json`
- **Contractor pain:** *"Leads that arrive after 7pm disappear by 8am."*
- **ROI:** 10 recovered leads/month @ $150 each = **$1,500/month**
- **Market validation:** ACCA data: 78% of homeowners choose the first responder
- **Build requirement:** n8n webhook → Twilio SMS → Airtable → Claude decision
- **Phase 1 demo:** YES — this is the hero feature
- **Pitch position:** Lead with it on landing page

---

### ✅ **Missed Call → SMS Recovery (NEW)**
- **Workflow File:** `n8n/tier1_missed_call_recovery_sms.json`
- **Contractor pain:** *"27% of all calls go unanswered. 13 missed calls/month. $3,900 in lost revenue."*
- **ROI:** Immediate recovery of missed daytime calls = **$3,900/month**
- **Market validation:** Unprompted mention in contractor research = high pain
- **Build requirement:** Jobber webhook (missed call) → SMS response within 60 sec → Airtable
- **Phase 1 demo:** YES — essential part of hero 1-2 punch
- **Pitch position:** Lead with this alongside after-hours capture
- **Technical complexity:** Trivial (one webhook trigger, one SMS send)

---

### ✅ **Audit Trail + ROI Logging**
- **Component:** Airtable Actions table + Mission Control dashboard
- **Contractor pain:** *"Tools that show clear ROI get renewed. Tools that don't, get canceled."*
- **ROI:** Indirect (retention + month 2-4 renewals) = **drives 80%+ year 1 revenue**
- **Market validation:** Industry research: contractor retention depends on visible ROI proof
- **Build requirement:** Every n8n workflow logs action to Airtable Actions table; dashboard polls every 10 sec
- **Phase 1 demo:** YES — show action log in dashboard as proof of performance
- **Pitch position:** Don't lead with it, show in demo as proof

---

### ⏸️ **Cancellation Fill via Waitlist SMS (Deferred to Phase 2)**
- **Layer 1 Agent:** Cancellation Fill (Agent 2 in original design)
- **Contractor pain:** Real pain, but contractors focused on lead capture first
- **ROI:** 4 filled slots/month @ $175 = $700/month (real but lower priority)
- **Market validation:** Mentioned, but not in top 3 pain points
- **Build requirement:** Jobber webhook (job canceled) → Query Waitlist → SMS offer
- **Phase 1 demo:** NO — build in Phase 2
- **Pitch position:** Mention in Phase 2 upsell, not in hero demo

---

## TIER 2 — Phase 2 (Pitch Now, Build After First Client)

Real features, validated by research, but lower urgency. Pitch them as part of full system. Build once you have paying client to justify time.

### **Speed-to-Lead Dashboard Metric**
- **Layer 1 Agent:** N/A (dashboard feature)
- **Contractor pain:** Response time visibility = proof of performance
- **ROI:** Indirect (retention + upsell when before/after comparison is dramatic)
- **Build requirement:** Pull timestamps from Airtable, calculate average response time, display on dashboard
- **Phase 1 demo:** NO — Phase 2
- **Pitch position:** Show in demo as proof, don't lead with it

### **Daily Owner Summary Email**
- **Layer 1 Agent:** Daily Summary (Agent 9 in original design)
- **Contractor pain:** *"Saved us about 40 hours a month"* (time awareness)
- **ROI:** Indirect (retention + morning reminder of ROI)
- **Build requirement:** Scheduled task → Query Actions table from yesterday → Claude summary → Email
- **Phase 1 demo:** NO — Phase 2
- **Pitch position:** Close the demo with it: *"Every morning at 7 AM, you get a summary of everything that happened."*

### **Invoice Reminder Sequence**
- **Layer 1 Agent:** Invoice Chaser (Agent 6 in original design)
- **Contractor pain:** Real but not top-3 pain point
- **ROI:** Recovers outstanding invoices (variable per contractor, ~$500-1k/month)
- **Build requirement:** Scheduled task → Query unpaid invoices from Jobber → SMS reminders
- **Phase 1 demo:** NO — Phase 2
- **Pitch position:** Mention in feature list, don't highlight

### **Post-Job Follow-Up + Review Request**
- **Layer 1 Agent:** Review Request (Agent 7 in original design)
- **Contractor pain:** Review generation is table stakes (not differentiator)
- **ROI:** Indirect (improves Google ranking, inbound over time)
- **Build requirement:** Jobber webhook (job completed) + delay → SMS review request
- **Phase 1 demo:** NO — Phase 2
- **Pitch position:** Include in feature list, don't highlight

---

## TIER 3 — Phase 3+ (Keep in Roadmap, Don't Pitch Yet)

Legitimate features but not validated as acute pain. Build after multiple paying clients.

### **Seasonal Outreach Campaign**
- **Layer 1 Agent:** Seasonal Outreach (Agent 10 in original design)
- **Contractor pain:** Real revenue opportunity, but month 2 conversation
- **ROI:** $500-1k/month (variable by contractor)
- **Market validation:** Mentioned positively but not as top pain point
- **Build requirement:** Scheduled trigger (Apr 1, Oct 1) → Query customers by service type → SMS campaign
- **Phase 1 demo:** NO — Phase 3+
- **Pitch position:** Month 2+ upsell: *"Once we've proven ROI on leads, we'll layer in seasonal campaigns."*

### **Tech ETA Monitor**
- **Layer 1 Agent:** ETA Monitor (Agent 5 in original design)
- **Contractor pain:** Zero unprompted mentions in research
- **ROI:** Nice-to-have, not a closer
- **Market validation:** Not validated
- **Build requirement:** Scheduled polling (every 15 min) → Jobber job status → SMS to customer
- **Phase 1 demo:** NO — Month 3+ only
- **Pitch position:** Don't mention until Month 3+

### **Dispatch Router + Inbound SMS Handler**
- **Layer 1 Agent:** Dispatch Router (Agent 3), Inbound SMS Handler (Agent 4)
- **Contractor pain:** Valuable but can be manual in Phase 1
- **ROI:** Labor savings (~$2,500/month) + dispatch accuracy
- **Market validation:** Real pain, but contractors want lead capture + missed calls first
- **Build requirement:** Orchestrator routing → tech assignment → SMS to tech + customer
- **Phase 1 demo:** NO — Phase 2 integration
- **Pitch position:** Month 2+ feature

### **Waitlist Manager**
- **Layer 1 Agent:** Waitlist Manager (Agent 11 in original design)
- **Contractor pain:** Back-office optimization, not customer-facing
- **ROI:** Indirect (max out throughput of existing system)
- **Market validation:** Not mentioned as pain point
- **Build requirement:** Scheduled task → Query Waitlist → Prioritize + age out
- **Phase 1 demo:** NO — Phase 2+
- **Pitch position:** Don't mention in Phase 1

---

## CUT FROM PITCH — Don't Lead With These

### ❌ **Google Review Monitor**
- **Layer 1 Agent:** Review Monitor (Agent 8 in original design)
- **Why it's cut:** Zero unprompted mentions in contractor research
- **Market validation:** Failed all three filters
- **Decision:** Remove from Phase 1 pitch and marketing materials entirely
- **Keep in roadmap?** Yes, if clients specifically ask for it (Month 2+)

---

## Phase 1 Demo: Hero 1-2 Punch

### What the first client gets (Tier 1 only):
1. **After-hours lead capture** — SMS response to evening leads
2. **Missed call recovery** — SMS response to daytime missed calls
3. **Audit trail** — Actions table showing every operation (proof of ROI)
4. **Basic dashboard** — Action log + daily summary email

### What they DON'T get yet:
- Cancellation fill (Phase 2)
- Dispatch automation (Phase 2)
- SMS reply handling (Phase 2)
- ETA monitoring (Month 3+)
- Review campaigns (Phase 2)
- Seasonal outreach (Phase 3)
- Everything in Layer 2/3

### ROI Story:
**$8,600/month recovered revenue** (from three Tier 1 workflows):
- After-hours lead capture: $1,500/month
- Missed call recovery: $3,900/month
- Cancellation fill: $700/month
- Dispatcher labor optimization: $2,500/month

**Retainer:** $1,500/month
**Payback period:** ~1.5 months
**Year 1 ROI:** ~$85,000

---

## Phase 2 Upsell (After First Client Sees Phase 1 ROI)

Once Phase 1 is live with first client and they see the $8,600 + action audit trail:
- Add speed-to-lead dashboard (shows 47 hours → 30 seconds response time)
- Add daily summary email (morning recap of everything)
- Add cancellation fill automation (backfill job cancellations)
- Add invoice reminders (chase unpaid invoices)
- Add review request automation
- Mention seasonal outreach as future add-on

---

## Phase 3+ Roadmap

- Seasonal campaigns (verified ROI + historical patterns)
- Tech ETA monitoring
- Advanced dispatch optimization
- Specialist routing
- All Layer 2 agents

---

**Status:** Tier mapping complete. Feature prioritization locked. Ready for Phase 1 implementation plan (Tier 1 only).
