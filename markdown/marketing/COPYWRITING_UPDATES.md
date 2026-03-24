# Copywriting & Messaging Reference — Fieldline AI
**Last Updated:** 2026-03-18

This document tracks all copywriting decisions, voice guidelines, and messaging architecture for Fieldline AI. Use this when writing or updating any customer-facing copy.

---

## Core Messaging

### One Sentence
"We install an AI operations system that responds to every lead in 60 seconds, fills canceled jobs automatically, and sends you a plain-English summary every morning — you never touch it."

### The Partnership Frame
We are not a SaaS tool. We are a retained AI operations partner. The pitch always ends the same way:
> "You focus on running your business. We handle everything AI."

Don't open with features. Open with the relationship, then prove it with outcomes.

### The Guarantee
"5 recovered leads in 30 days or your second month is free. Every action is logged in your dashboard automatically — the proof is always there."

**Note: No free trial.** The $500 setup fee is the commitment signal. This is intentional.

---

## Pricing Copy (Current — Use These Numbers)

| Tier | Setup | Monthly | Commitment |
|---|---|---|---|
| Foundation | $500 | $1,500/month | Month-to-month |
| Partner | $1,500 | $2,500/month | 3-month minimum |
| Full Partner | $2,500 | $4,500/month | 3-month min + custom contract |

**ROI framing for Foundation:**
- One recovered job per month = $150–300 revenue
- System captures 5 leads in 30 days (guarantee) = ~$750–1,500 recovered
- Break-even: ~10 days on Foundation tier
- Annual: "Fieldline AI at $1,500/month → $18,000/year. 5 recovered leads/month → $9,000/year minimum recovered. Plus invoice collection, review generation, cancellation fill."

---

## Voice & Tone

### Use
- ✅ Partnership language ("your AI operations partner," "retained advisor")
- ✅ Relationship framing ("like an accountant who manages your business, except AI")
- ✅ Outcome-focused ("recover revenue," "automatically," "while you sleep")
- ✅ "You never configure anything" — key differentiator
- ✅ "You never touch it" — repeat this
- ✅ Specific numbers ($150/call, 60 seconds, 30 days)
- ✅ Contractor language ("jobs," "techs," "dispatch," "waitlist")
- ✅ "Logged automatically in your dashboard" — proof language

### Avoid
- ❌ SaaS language ("subscription," "features," "configure," "platform")
- ❌ "AI-powered" or "cutting-edge" — too generic
- ❌ Free trial language — we don't offer one
- ❌ "DispatchHVAC" branding — the name is now **Fieldline AI**
- ❌ Vendor framing ("we provide a solution") — use partner framing instead
- ❌ NemoClaw/OpenClaw as selling points — these are infrastructure, not features
- ❌ Technical jargon (n8n, Supabase, API, webhook) in customer copy

---

## Key Messaging Pillars

### 1. Storage vs. Execution
"Your CRM stores data. We execute on it. Jobber shows you what happened — we make things happen before you even open your laptop."

### 2. Partnership Over Product
"You get a retained AI operations partner — not a SaaS tool. When better AI tools come out, we upgrade your system. You never have to research AI again."

### 3. Zero Configuration Burden
"You never touch the system. We set it up, manage it, upgrade it. You just see the results in your dashboard every morning."

### 4. Proof Is Automatic
"Every action we take is logged in your dashboard with timestamps, confidence scores, and revenue impact. The 5-lead guarantee isn't marketing — it's a number you can verify yourself."

### 5. Outcome-Driven ROI
"$1,500/month. One recovered job pays for it. We guarantee 5 in 30 days or your second month is free."

---

## Hero Copy Options

**Option A (direct):**
"5 Recovered Leads in 30 Days or Your Second Month Is Free"

**Option B (outcome):**
"Your HVAC Business Running at 2 AM Without You"

**Option C (partner):**
"Your AI Operations Partner — We Run It, You See Results"

---

## CRM-Specific Angles

**Jobber:**
"Jobber handles your invoices and scheduling. We handle everything Jobber can't — the 2 AM emergency call, the canceled job slot, the dispatcher tasks eating your Saturday."

**ServiceTitan:**
"ServiceTitan is your system of record. We're your system of action. ST tells you what happened — we make things happen before you even open your laptop."
*Note: ServiceTitan partner API pending approval. Don't promise full integration until confirmed.*

**HouseCall Pro:**
"HouseCall Pro is great for running your day-to-day. But it's not watching your business at 2 AM, filling canceled slots automatically, or chasing unpaid invoices. We are."

---

## Guarantee Copy Variations

**Short:** "5 recovered leads in 30 days or your second month is free."

**Medium:** "We guarantee 5 recovered leads logged in your dashboard within 30 days. If we don't hit it, your second month is free — no conversation required, the data is the proof."

**Long (for FAQ/sales page):**
"Every action we take is written to your dashboard automatically — with timestamps, what happened, and the estimated revenue impact. At day 30 we count the recovered leads together. If it's fewer than 5, your second month is free. We designed it this way because the proof should never require a conversation."

---

## Vertical Expansion

All messaging is vertical-agnostic. To adapt for another service vertical:
- Replace "HVAC contractor" → "[service type] business owner"
- Replace job-specific language (dispatch, tech, equipment) → generic service ops language
- Keep all ROI framing, guarantee, and partnership positioning unchanged

---

## Files This Applies To

```
components/Hero.tsx
components/Features.tsx
components/Pricing.tsx
components/Guarantee.tsx
app/faq/page.tsx
app/jobber/page.tsx
app/servicetitan/page.tsx
app/houseCallpro/page.tsx
docs/cold-email-templates.md
updated-files/Selling_Angles_Updated.md
```
