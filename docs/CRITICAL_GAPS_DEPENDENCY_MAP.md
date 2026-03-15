# Critical Gaps: Dependency Map & Implementation Blocking Chart
**Status:** 5 Critical Gaps Identified | 3 Must Complete Before Any Build | 2 Embedded in Week 1-2

---

## Critical Gaps at a Glance

| Gap # | Name | Type | Blocks | Fix Before |
|---|---|---|---|---|
| 1 | Missed Call → SMS Recovery Workflow | Net-New Feature | Demo ROI pitch | Build Workflow 2b (Week 1) |
| 2 | Multi-Turn SMS Threading | Architecture | Product credibility | Build Workflow 9 (Week 3) |
| 3 | Revenue Impact on Every Action | Architecture | Dashboard ROI visibility | Start Phase 1 (Week 1) |
| 4 | SMS-Only Tech Constraint Doc | Design Rule | Future UX disasters | Write docs NOW |
| 5 | Jobber API Error Handling | Reliability | Silent failures | Week 2 Jobber build |

---

## **DO NOT START BUILDING ANYTHING UNTIL THESE ARE DONE**

### ☐ Gap #4: SMS-Only Tech Constraint (0.5 hours)
**Status:** Not in documentation  
**Action:** Add this to `agent-ops.md` RIGHT NOW
```
Hard Constraint for Tech-Facing Workflows:
If a technician must open an app for a workflow to function, 
the workflow is fundamentally broken. 
All tech interactions = single SMS only. 
Confirmation = SMS reply YES. That's the interface.
```
**Why:** Prevents future developers from repeating every competitor's mistake.
**Blocks:** Nothing. Do this now anyway.

---

### ☐ Gap #3: Revenue Impact Field Architecture (2 hours)
**Status:** Partially designed, not in database  
**Actions Required:**
1. **Airtable Actions table:** Add these fields
   - `revenue_impact` (Number, required on every record)
   - `confidence_score` (Number 0–100)
   - `confidence_tier` (Select: auto_execute | auto_with_flag | escalated)
   - `action_type` (Select: lead_capture | missed_call | cancellation_fill | invoice_sent | sms_response | etc.)

2. **Define revenue impact values for every action type:**
   ```
   lead_capture → $150
   missed_call_recovery → $300
   cancellation_fill → $175
   invoice_sent → invoice_amount
   sms_response → $0 (retention only)
   daily_summary → $0 (retention only)
   review_request → $0 (retention only)
   ```

3. **Leads table:** Add these fields
   - `conversation_id` (Text, required for Workflow 9 threading)
   - `thread_history` (Long text, JSON array of previous messages)
   - `revenue_impact` (Number, reference to associated action)

4. **New Error Log table:**
   ```
   error_id, client_id, api_name, error_code, error_message, 
   workflow_name, retry_count, status, timestamp
   ```

**Why:** Every workflow will log revenue_impact. Must exist before Week 1 build or you'll have to migrate data.  
**Blocks:** Everything else (all workflows depend on this).  
**Timeline:** Before writing any code.

---

### ☐ Gap #5: Jobber API Error Handling Strategy (1 hour)
**Status:** Not in any workflow spec  
**Actions Required:**
1. **Define error handling pattern for EVERY Jobber API call:**
   ```
   HTTP Request to Jobber
   ├─ If success (200–299)
   │  └─ Continue workflow, log action
   └─ If error (4xx, 5xx, timeout)
      ├─ Log to API Error Log table
      ├─ Retry logic: 
      │  ├─ Attempt 1: immediately
      │  ├─ Attempt 2: +5 seconds
      │  ├─ Attempt 3: +10 seconds
      │  └─ If all fail: escalate to owner email
      ├─ Send contractor dashboard alert:
      │  "Jobber connection issue — [workflow] paused. Retrying..."
      └─ Dashboard shows error status (not silent fail)
   ```

2. **Create n8n error handling wrapper template** (reusable on all Jobber calls)

**Why:** Prevents silent failures when Jobber is down or rate-limited.  
**Blocks:** Workflow 5 (Jobber webhook listener) in Week 2  
**Timeline:** Before Week 2 build.

---

## **CRITICAL GAPS EMBEDDED IN BUILD SEQUENCE**

### Gap #1: Missed Call → SMS Recovery Workflow
**Status:** MISSING from roadmap entirely  
**When to build:** **Week 1, right after Workflow 1**  
**What to build:** New Workflow 2b

```
Twilio Missed Call Webhook
         ↓
    Extract phone
         ↓
  Query Leads table
         ↓
If returning customer:
  → Claude personalizes with service history
If new customer:
  → Generic but warm response
         ↓
[CRITICAL: Log revenue_impact = $300]
         ↓
  Send SMS within 60 seconds
         ↓
   Create conversation_id
```

**Revenue Impact:** $3,900/month (27% calls go unanswered × 13 calls/month × $300 avg)  
**Demo Impact:** Doubles ROI pitch from $4,700 to $8,600 without raising price  
**Build Time:** 4 hours (Twilio webhook + Claude integration + SMS)  
**Blocks:** Nothing else. Makes everything better.  
**Must be ready for:** First client demo

---

### Gap #2: Multi-Turn SMS Conversation Threading  
**Status:** Architecture documented, not implemented  
**When to build:** **Week 3, as part of Workflow 9**  
**Prerequisites:** Gap #3 (conversation_id + thread_history fields must exist)

```
Inbound SMS from customer
         ↓
Query Leads table for conversation_id
         ↓
[CRITICAL: Query previous 3-4 messages in conversation]
         ↓
Build context for Claude:
  Full thread history = [msg1, msg2, msg3]
  Latest message = msg4
         ↓
Claude receives FULL CONTEXT (not just latest message)
         ↓
Response is thread-aware:
  Before threading: "Thanks for replying!"
  After threading:  "Yes, Thursday 2pm works. Better than morning?"
         ↓
Continue conversation
```

**Differentiation:** HCP Assist treats each reply as isolated. You don't.  
**Build Time:** 6 hours (Airtable query + Claude context building + response chaining)  
**Database Prerequisite:** conversation_id + thread_history fields MUST exist before building  
**Blocks:** Nothing else. Improves Workflow 9 quality 10x.  
**Customer Experience Impact:** "It actually understands what I'm saying"

---

## **Build Sequence WITH Gap Integration**

### Week 1 (Foundation + Gaps #1, #3, #4)

1. **BEFORE CODE:** Document Gap #4 in agent-ops.md (SMS-only constraint)
2. **BEFORE CODE:** Create Airtable schema with Gap #3 fields (revenue_impact, confidence_score, thread history)
3. **BEFORE CODE:** Define revenue impact values for all action types
4. Build Workflow 1: Lead Capture
5. Build Workflow 2b: **[GAP #1]** Missed Call → SMS Recovery (NEW)
6. Build Workflow 3: Audit Trail (logs revenue_impact, confidence_score)
7. Build Workflow 4: **[GAP #5 prep]** API error handling wrapper
8. Build Next.js Dashboard: Show confidence_score on every action

**Demo-ready at end of Week 1:**
- ✅ Lead captured → SMS in 30 sec ($150 logged)
- ✅ Missed call → SMS in 60 sec ($300 logged)
- ✅ Dashboard shows: "This month: $450 recovered"
- ✅ Every action shows confidence (94%, 72%, etc.)
- ✅ SMS-only constraint documented

---

### Week 2 (Jobber Integration + Gap #5)

1. **BEFORE CODE:** Define Gap #5 error handling pattern for ALL Jobber calls
2. Build Workflow 5: Jobber Webhook Listener (with **[GAP #5]** error wrapping)
3. Build Workflow 6: Cancellation Fill (with **[GAP #5]** error wrapping)
4. Test: Jobber API errors show dashboard alert (not silent fail)

**Demo-ready at end of Week 2:**
- ✅ Job cancellation → SMS to waitlist in 60 sec ($175 logged)
- ✅ Jobber error → dashboard alert (retrying visible)
- ✅ Running total: "$325 this month"

---

### Week 3 (SMS Orchestration + Gap #2)

1. **BEFORE CODE:** Verify conversation_id + thread_history fields exist in Airtable
2. Build Workflow 9: Inbound SMS Handler with **[GAP #2]** multi-turn threading
3. Test: Multi-message thread shows context awareness

**Demo-ready at end of Week 3:**
- ✅ SMS thread awareness (not isolated replies)
- ✅ Quality improvement obvious vs single-reply handler

---

### Week 4 (Business Processes)

1. Create: Client onboarding checklist
2. Create: Cancellation policy
3. Create: Client health monitoring logic (admin dashboard)

**First client ready at end of Week 4**

---

## **Critical Path to First Client Demo**

```
Gaps #4, #3 (DOCS)  →  [Week 1 Core Build]  ←  Gap #1 (New WF2b)
                               ↓
                        Gap #5 (Week 2)  ←  [Jobber Build]
                               ↓
                        Gap #2 (Week 3)  ←  [SMS Threading]
                               ↓
                     [Demo Ready: $8,600 ROI pitch]
                               ↓
                    [First Client Signature]
```

---

## **Risk Assessment: What Breaks If Gaps Are Skipped**

### If Gap #1 (Missed Call) is skipped:
- ROI pitch drops from $8,600 to $4,700 (36% lower)
- First client sees $3,900/month opportunity missed
- Demo impact: 🔴 CRITICAL

### If Gap #2 (Threading) is skipped:
- Product feels like HCP Assist (script-based)
- Customer experience: "It doesn't understand context"
- Churn risk: 🔴 CRITICAL

### If Gap #3 (Revenue Impact) is skipped:
- Dashboard shows "$150 from one lead" instead of "$4,200 this month"
- Contractor underestimates system value
- Retention driver disappears
- Churn risk: 🔴 CRITICAL

### If Gap #4 (SMS Constraint) is skipped:
- Future developer builds tech workflow that requires app open
- You've recreated competitor's UX failure
- Technical debt: 🟡 HIGH

### If Gap #5 (Error Handling) is skipped:
- Jobber API downtime = silent failure
- Contractor thinks system is broken when it's not
- Trust loss: 🔴 CRITICAL

---

## **Sign-Off Checklist Before Phase 1 Build**

- [ ] Gap #4 documented in agent-ops.md
- [ ] Gap #3 Airtable schema finalized (revenue_impact, confidence_score fields added)
- [ ] Gap #3 revenue impact values defined for all action types
- [ ] Gap #5 error handling pattern written (template for reuse)
- [ ] All team members read and understand these gaps
- [ ] Week 1 schedule includes Workflow 2b (Missed Call recovery)
- [ ] Week 3 schedule includes conversation_id + threading for Workflow 9
- [ ] Database migrations scheduled before code begins

**Do not start building Week 1 until all checkboxes are complete.**

---

*Last updated: March 14, 2026 | Ready for implementation*
