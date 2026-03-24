> ⚠️ **SUPERSEDED — DO NOT USE AS REFERENCE**
> This document contains outdated information. See current reference below.
> **Current reference:** `agency-context/agency_AI_MASTER.md`
> Preserved for session history only.

---

**PLAN 1: TECHNICAL ARCHITECTURE & PRODUCT STACK**

AI Implementation Partner --- Autonomous Revenue Systems

*Updated March 2026 \| Reflects Two-Lane Partner Model + Multi-Vertical
Architecture*

**Business Mission**

In 2026, small and mid-sized service businesses run on tools that store
data but require human labor to act on it. We provide the missing layer:
an autonomous AI operations system that sits on top of whatever tools a
business already uses, executes revenue-generating actions 24/7, and
continuously upgrades as the AI landscape evolves.

We don\'t sell software. We sell an ongoing AI operations partnership
--- becoming the business owner\'s retained AI partner who builds
autonomous systems, manages them, and stays current with every new tool
so they never have to.

  -----------------------------------------------------------------------
  **Model:** We are not a SaaS product. We are a retained AI operations
  partner --- like an accountant who manages your finances, except we
  manage your AI systems and keep your business ahead of the curve
  permanently. The relationship is the product. The AI systems are the
  deliverable.

  -----------------------------------------------------------------------

**The Two-Lane Business Model**

We operate two parallel engagement types that feed each other:

  -----------------------------------------------------------------------
  **LANE 1: Productized Verticals**  **LANE 2: Custom Implementation**
  ---------------------------------- ------------------------------------
  Pre-built workflow packages for    Discovery-led builds for any service
  specific niches (HVAC is Vertical  business
  #1)                                

  Fixed price, fast deployment,      Higher ticket, more tailored, feeds
  repeatable                         the library

  \$1,500 setup +                    \$3,500--\$5,000 setup +
  \$800--\$1,500/month               \$1,500--\$3,000/month

  Scale without proportional time    Every engagement produces a new
  increase                           productized vertical
  -----------------------------------------------------------------------

Both lanes land on a monthly retainer. Both get upgraded as AI tools
evolve. Lane 2 custom work is systematically documented and converted
into Lane 1 packages --- this is how the vertical library grows without
guesswork.

**Vertical Library**

HVAC is the first productized vertical. Every new niche gets added here
after a real custom engagement proves the workflow is repeatable.

  -----------------------------------------------------------------------------
  **Vertical**    **Status**       **Monthly          **Primary Angle**
                                   Retainer**         
  --------------- ---------------- ------------------ -------------------------
  HVAC            ACTIVE --- MVP   \$1,200--\$2,500   Lead capture,
                                                      cancellation fill,
                                                      dispatcher automation

  Plumbing /      Next target      TBD                Same emergency lead
  Electrical                                          dynamic as HVAC

  Cleaning        Queued           TBD                High cancellation rate,
  Services                                            waitlist fill

  Lawn Care       Queued           TBD                Weather cancellations,
                                                      seasonal campaigns

  \[Your next     After first      TBD                Document from discovery
  vertical\]      custom build                        
  -----------------------------------------------------------------------------

**Core Architecture**

**The Headless Model**

We build the smart valves that control the water flow, not the plumbing.
Our system sits on top of whatever tools the business already uses ---
their CRM, their calendar, their booking system --- and adds the
autonomous execution layer those tools lack.

**Mission Control Dashboard (Next.js)**

-   Owner-facing interface showing real-time proof of performance

-   Shows actions taken: leads captured, cancellations filled, invoices
    chased

-   Displays forward-looking automation activity --- not historical CRM
    data

-   Human-in-the-Loop approval for high-stakes actions (contracts, large
    quotes)

-   Read-only --- the client never configures anything

**Logic Layer (Python FastAPI)**

-   Core engine connecting to business tools via webhooks for real-time
    event triggers

-   Analyzes inbound messages using NLP and executes appropriate
    response workflows

-   Two-way natural conversation with customers about urgency, pricing,
    and scheduling

-   Niche-agnostic architecture --- system prompts and parameters change
    per vertical, architecture doesn\'t

**Workflow Orchestration (n8n)**

-   Handles all triggers: webhooks, scheduled runs, inbound SMS

-   Routes events to correct workflow or orchestrator

-   Executes all external actions: Twilio SMS, CRM writes, Airtable logs

-   Claude decides --- n8n executes. Never the other way around.

  -----------------------------------------------------------------------
  **NemoClaw (Q3--Q4 2026):** NVIDIA\'s NemoClaw --- announced GTC March
  2026, Apache 2.0 licensed --- will be evaluated as an enhancement layer
  on top of the existing Claude API + n8n stack once stable. Cloud-hosted
  at \~\$20--50/month per client. Target experimentation: Q3 2026. Client
  rollout: Q4 2026--Q1 2027.

  -----------------------------------------------------------------------

**Core Features (All Verticals)**

**Feature 1: Inbound Lead Capture & Response**

-   Automatic lead ingestion from web forms, phone calls, SMS, and chat

-   AI qualifies urgency in under 30 seconds, 24/7

-   Natural language responses address immediate concerns: timeline,
    pricing, availability

-   Captures 100% of leads vs. 80% manual capture rate when staff are
    occupied

**Feature 2: Cancellation & Schedule Recovery**

-   Real-time monitoring of appointments and job slots

-   Detects cancellations and immediately texts waitlist customers with
    available slots

-   SMS only sent to geographically relevant customers for the open slot

-   Recovered slot logged with revenue impact to audit trail

**Feature 3: Administrative Automation**

-   Invoice reminders and payment follow-up

-   Post-job follow-up and review requests within 24 hours

-   Seasonal maintenance and outreach campaigns

-   Daily owner summary --- plain English, delivered by 7 AM

-   Handles 80% of routine operations independently

**Feature 4: Ongoing AI Operations Management (The Retainer
Justification)**

-   Proactively monitor system performance and surface issues

-   Roll out new capabilities as AI tools mature --- including NemoClaw
    when ready

-   Quarterly business reviews showing ROI, churn signals, and growth
    opportunities

-   Serve as the client\'s eyes and ears on the AI landscape --- they
    never have to research it themselves

**Tech Stack**

  -----------------------------------------------------------------------
  **Layer**          **Technology**         **Notes**
  ------------------ ---------------------- -----------------------------
  Frontend           Next.js 14+            Mission Control Dashboard

  Backend            Python FastAPI         Logic layer, AI integration

  AI Brain           Claude API (Anthropic) NLP, qualification, response
                                            generation

  Workflows          n8n                    Orchestration, webhooks, CRM
                                            integration

  SMS                Twilio                 Customer outreach,
                                            confirmations

  Payments           Stripe                 Retainer billing

  CRM (HVAC MVP)     Jobber (full API)      First vertical, full access
                                            now

  CRM (HVAC future)  ServiceTitan           Partner API --- 4--8 week
                                            approval

  Non-CRM            Google Calendar,       For verticals without a CRM
  integrations       Calendly, booking APIs 

  Database (MVP)     Airtable               Weeks 1--8, zero setup
                                            friction

  Database (scale)   Supabase (PostgreSQL)  Month 3+, first paying client

  Deployment         Vercel +               Frontend + backend hosting
                     Render/Railway         

  Future layer       NemoClaw (Q3--Q4 2026) NVIDIA open-source agent
                                            platform
  -----------------------------------------------------------------------

**Competitive Advantages**

**Zero Migration Friction**

Business owners fear new software: data loss, staff retraining, workflow
disruption. Since we integrate with their existing tools --- not replace
them --- migration friction is 90% lower than any competing solution. No
data migration. No retraining. Just activate and go.

**Vertical Portability**

The same workflow architecture deploys across HVAC, cleaning, pest
control, plumbing, and any appointment-based service business with minor
configuration changes. System prompts change. The n8n + Claude + Twilio
stack does not. Every new vertical is faster to build than the last.

**The Sticky Factor**

Once our AI manages 30% of scheduling and 100% of lead follow-up, the
client can\'t fire us without losing revenue immediately. We become an
integral utility, not a luxury. Churn drops sharply once automation goes
live.

**The Relationship Factor**

The retained partner model creates a second stickiness layer beyond
technical integration. When a client has relied on us for 12+ months to
stay ahead of AI changes, we become their trusted advisor --- not a
vendor. That relationship survives any tooling change, any CRM feature
launch, or any platform shift.

**Risk Mitigation**

**Platform Risk**

  -----------------------------------------------------------------------
  **Risk:** A CRM ships native AI features that overlap with our product.

  -----------------------------------------------------------------------

Mitigation: The retained partner model survives tooling shifts. When
Jobber ships an AI receptionist, we roll out the next layer ---
cancellation fill, invoice automation, seasonal outreach --- before the
client notices the gap closed. We\'re not selling a fixed feature set.
We\'re selling permanent currency with the AI landscape.

**API / Integration Risk**

  -----------------------------------------------------------------------
  **Risk:** A CRM raises API fees or restricts access.

  -----------------------------------------------------------------------

Mitigation: Contracts explicitly state that CRM API fees are client
responsibility. We operate the integration layer, we don\'t own the
underlying platform. For verticals without a CRM, we integrate with
calendar and booking tools that have no gating risk.

**AI Hallucination & Liability**

  -----------------------------------------------------------------------
  **Risk:** AI commits the business to a price, contract, or warranty
  term the owner didn\'t approve.

  -----------------------------------------------------------------------

Mitigation: Human-in-the-Loop guardrail --- all high-stakes actions
require owner approval via a simple Approve button in the dashboard.
Auto-execute only if Claude confidence score exceeds 85%.

*End of Plan 1 --- Updated March 2026*
