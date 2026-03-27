# Fieldline AI — Landing Page Full Audit
**Date:** March 23, 2026  
**Auditor:** Claude  
**Source of truth:** FIELDLINE_AI_MASTER.md, PRICING_AND_TIERS.md, COPYWRITING_UPDATES.md  
**Scope:** Copy alignment, layout/UX, section structure, pricing accuracy, guarantee removal

---

## The Core Problem (State This Up Front)

The page currently reads as a B2B SaaS product page selling a specific automation tool (missed-call texting). The actual business is a **AI implementation partner** selling a **retained AI operations partnership** — custom-scoped on a discovery call, built for each contractor's specific bottlenecks, and managed indefinitely.

Every copy and layout fix below flows from correcting that single misalignment.

**The rule for every line of copy on this page:**  
Does this line describe what we *do to their business* (partner framing), or does it describe a *feature of a product* (SaaS framing)?  
If it's the latter, rewrite it.

---

## SECTION 1 — HERO

### Current State
**H1:** "We text back every missed call while you're on a job."  
**Sub:** "We build AI systems that plug into Jobber, ServiceTitan, or HouseCall Pro and handle lead response, schedule recovery, and admin work — 24/7. You don't touch the technology. We build it, run it, and keep it current."  
**Eyebrow:** "FOR HVAC CONTRACTORS WITH 5–20 TECHS"

### What's Wrong

**Copy:**
- H1 is a feature line, not a promise. It positions you as a missed-call tool with a $49/month ceiling in the buyer's mind before they read another word.
- The subhead lists features ("lead response, schedule recovery, admin work") instead of describing the relationship and outcome.
- "We build AI systems that plug into" is SaaS framing — implies a product being installed, not a partner being retained.
- "You don't touch the technology" is buried at the end of a sentence that already lost them.

**Layout:**
- The hero section has excessive top padding before the eyebrow label — there's a visible gap that makes the section feel like it starts in the middle of the viewport on desktop.
- The H1 line breaks awkwardly at "while you're on a job." on narrow screens — "while you're on a job" becomes an orphaned phrase.
- The CTA button ("Book a discovery call") and the ghost link ("See how it works →") are separated by inconsistent spacing. The ghost link is undersized relative to the primary CTA and easy to miss.
- The microcopy below the CTAs ("30-minute call. No sales pitch. We map your workflow and tell you if we're a fit.") is doing real work but is nearly invisible — wrong font weight, insufficient contrast against the navy background at 13px.

### Recommended Fix

**Eyebrow:** `FOR HVAC CONTRACTORS WITH 5–20 TECHS` — keep, it's correct.

**H1 (new):**
> "Most HVAC contractors lose $8,600 a month to systems that don't talk to each other. We fix that."

**Subhead (new):**
> "We map where your business is leaking money, build the AI that plugs the holes, and run it. Discovery call first. Custom-built for your operation. You see results every morning — you never touch a setting."

**Why this works:**
- Opens with the validated dollar number from contractor research ($8,600/month)
- Frames the problem as a systems problem, not a feature gap — positions you as a diagnostician and builder, not a product
- "Discovery call first" signals custom engagement immediately
- "You never touch a setting" is the key differentiator and now appears in the hero, not buried in step 3

**Layout fixes:**
- Reduce top padding on hero section from 80px to 56px — the section should feel like it starts at the top of the viewport, not floating in space
- Add `font-weight: 500` and `color: var(--text-warm)` to the microcopy below CTAs — it's your strongest trust signal and currently invisible
- Give "See how it works →" a minimum tap target of 44px height so it reads as a real secondary action

---

## SECTION 2 — STATS ROW (< 60 sec / 13/mo / Zero)

### Current State
Three stats: `< 60 sec` / `13/mo` / `Zero`

### What's Wrong

**Copy:**
- `13/mo` is the pain stat (13 missed calls per month), not a Fieldline AI outcome. A contractor glancing at this reads "13 per month — 13 what? That's fine." They don't do the math. The number should represent what we deliver, not what they're currently losing — or it needs to be reframed as the loss explicitly.
- `Zero` as a stat label is the weakest possible execution of your most important objection handler (no migration, no software to learn). "Zero" requires the reader to read the subtext to understand what it refers to. At a glance it communicates nothing.
- `< 60 sec` is the one correct stat — specific, outcome-oriented, contrasted against 47-hour industry average. Keep it.

**Layout:**
- The stat row uses a lighter navy background (`--navy-900`) which creates a visible stripe across the page. This is intentional as a visual break, but the three stats are not vertically centered within the row — the labels and subtext have inconsistent baseline alignment across the three columns on mid-width viewports.
- The subtext for `13/mo` is longer than the others, causing that column to be taller — the row height is driven by the longest column but the shorter two don't vertically center their content to compensate.

### Recommended Fix

| Current Label | Current Subtext | New Label | New Subtext |
|---|---|---|---|
| `< 60 sec` | "We text back every missed call. Most contractors don't respond for 47+ hours." | `< 60 sec` | Keep as-is — strongest stat on the page |
| `13/mo` | "Average missed calls for a 10-tech contractor. Every one is revenue walking out the door." | `$3,900/mo` | "Average monthly revenue lost to missed calls alone. Every one is logged, texted back, recovered." |
| `Zero` | "New software for your team to learn. It runs on top of what you already have." | `No migration` | "Runs on top of Jobber, ServiceTitan, or HouseCall Pro. Your crew never touches it." |

**Layout fix:** Add `align-items: flex-start` to the stat row flex container and use consistent min-height per stat cell so uneven subtext length doesn't break the visual balance.

---

## SECTION 3 — HOW IT WORKS (3-step)

### Current State
**Header:** "Three steps, then it runs itself."  
Step 1: "We map your bottlenecks"  
Step 2: "We build it in about a week"  
Step 3: "It runs. We keep it current."

### What's Wrong

**Copy:**
- "Three steps, then it runs itself" is almost right but "runs itself" undersells the partner framing. The whole point is that *we* run it, not that it runs itself. "Runs itself" implies set-it-and-forget-it SaaS. The reality is you're actively managing it.
- Step 1 body copy: "We look at where calls and jobs are slipping through, what software you're on, and what your crew's day actually looks like." — "Slipping through" is good but "what your crew's day actually looks like" sounds like a consultant intake form, not a trusted partner. Contractors don't want to explain their business to another vendor.
- Step 2: "We connect to your CRM and configure everything around your business — your schedule, your service area, the way you talk to customers. You don't touch a single setting." — The "you don't touch a single setting" line is your best line and it's at the end of a paragraph they may not finish. It needs to be the label, not the footnote.
- Step 3: "Monthly retainer means we're watching it, fixing it, and rolling out new capabilities as AI improves — so you never have to think about it." — This is excellent. It's the most honest description of the retained partner model on the entire page. But it's buried in body copy of step 3.

**Layout:**
- The three step cards have borders that are too faint (`#1F3044` on `#1A2535` background) — they barely read as distinct cards on dark displays.
- Step numbers ("01", "02", "03") are the right style (small, muted, eyebrow-weight) but the label text beneath them doesn't have sufficient visual hierarchy separation from the body copy. At small sizes, the step label and the body blur together.
- The cards have equal visual weight — there's no visual cue that Step 3 is the ongoing, permanent state (the one that makes them stay). Consider making Step 3 slightly more prominent.

### Recommended Fix

**Header:** "Three steps. Then we run it."
**Sub:** "Most contractors are live within a week of their discovery call."

**Step 1 — "We find the leaks"**
> "30-minute call. We look at where calls and jobs are slipping, which CRM you're on, and what a day actually looks like for your dispatcher. We tell you upfront what we'd build and what it would recover. If we're not a fit, we tell you that too."

**Step 2 — "We build it. You don't touch a thing."**
> "We connect to your CRM, configure every workflow to your business — your service area, your pricing, how you talk to customers. End-to-end tested before anything goes live. You don't change a setting."

**Step 3 — "It runs. We stay."** *(make this card visually distinct — slightly brighter border or subtle amber accent)*
> "Missed leads get answered. Open slots fill. Admin takes care of itself. And as AI improves, we roll out new capabilities automatically — no upgrade cycle, no new software, no re-training your team. That's what the retainer is for."

---

## SECTION 4 — WHAT'S INCLUDED

### Current State
**Header:** "Everything that runs after we build it."  
Checklist of 7 items across two columns.

### What's Wrong

**Copy — this is the worst section on the page for copy:**
- "Two daily summary" — grammatically broken. Should be "Daily summary."
- "High-stakes actions need your approval before anything executes" — passive, legalistic, sounds like a disclaimer. This is actually a *feature* (you're in control of high-stakes decisions) and it's written like a warning label.
- "Monthly upgrades as AI tools evolve — no extra charge" — this is your single strongest retention and differentiation argument and it's item 7 of 7 in a checklist. It should be a standalone section or at minimum the first item.
- The checklist mixes outcomes ("every missed call gets a text back in under 60 seconds") with operational mechanics ("invoice follow-ups and payment reminders sent automatically") with partnership commitments ("monthly upgrades as AI tools evolve"). These are three different emotional registers and they dilute each other.
- None of the checklist items have a dollar figure. This section is positioned directly above the guarantee but doesn't build toward value — it just lists.

**Layout:**
- The two-column checklist layout breaks on tablet widths in a way that creates orphaned single items in the right column.
- The checkmark icons are green (`#1A7A4A`) on navy, which is correct, but the 13px text size makes the items hard to scan. These should be 14px minimum.
- The section has the least padding of any section on the page — it feels compressed compared to the generous spacing above and below it.
- The italic disclaimer at the bottom ("Not a fit for every business...") is the right sentiment but wrong placement — it's sitting in the middle of the page before the guarantee, which creates a hesitation moment right before the conversion point.

### Recommended Fix

**Restructure this section entirely.** Split into two subsections:

**Subsection A — "What runs from day one"**  
Lead with the highest-impact automated actions:
- Every missed call → text back within 60 seconds
- After-hours leads handled — job booked before you wake up
- Open slots fill automatically from your waitlist
- Invoice reminders and payment follow-ups — automatic
- Review requests sent 30 minutes after every completed job
- Daily plain-English summary of everything that ran overnight

**Subsection B — "What we do every month"** *(visually distinct — different background or card treatment)*
> "As AI tools improve, we upgrade your system. New capabilities roll out automatically — no re-training, no new software, no extra charge. The longer you're a partner, the more your system can do."

This separates the "what the automation does" from "what the partnership includes" — two distinct value propositions that are currently muddled.

**Move the disclaimer** ("Not a fit for every business...") to just below the CTA section at the bottom of the page, or to the form section. Putting it mid-page creates a hesitation moment at the wrong time.

---

## SECTION 5 — GUARANTEE

### Current State
**Header:** "OUR GUARANTEE"  
**H2:** "5 recovered leads in your first 30 days — or your second month is free."  
Body copy explaining the guarantee terms.  
CTA: "Book a discovery call"

### ❌ REMOVE THIS SECTION ENTIRELY

**Why:**

1. **You are not a SaaS product with a money-back guarantee — you are a retained partner.** A guarantee section implies a transactional, product-like relationship. "Try it and if it doesn't work, you get a refund" is how $49/month tools think about their offer. A $1,500+/month retained engagement with a discovery-call intake should not have a guarantee banner — it should have confidence language and clear scoping.

2. **The guarantee creates a misaligned expectation.** "5 recovered leads in 30 days" implies a fixed, testable deliverable that either happens or doesn't. But per PRICING_AND_TIERS.md, the engagement is custom-scoped on the discovery call. What you build for one contractor may look completely different from another. Pinning a universal guarantee to a custom engagement creates an impossible-to-manage promise.

3. **It undercuts the premium positioning.** The guarantee section's design (cream box, bullet checkmarks listing CRM integrations) feels like a SaaS pricing page reassurance block. It signals "we know you don't trust us yet" — which is the wrong frame for a retained partner who gets on a call before any money changes hands.

4. **The discovery call is your trust mechanism, not a guarantee.** You already built in the right risk-reversal: "No pitch. We tell you if you're a fit." That's more powerful than a money-back guarantee because it puts the qualification in your hands and signals confidence. The guarantee undermines that.

**What to replace it with:**

A short "What to expect" section with three plain statements:
> - Discovery call first. We map your operation and tell you honestly what we'd build and what it would recover.
> - Custom-built in about a week. Everything configured to your business before anything goes live.
> - Month-to-month after the first 90 days. No long-term contract. You stay because the system produces.

This communicates the same risk-reversal (you can leave, we're confident you won't) without the SaaS-guarantee framing.

---

## SECTION 6 — PRICING (NOT ON PAGE — NEEDS TO BE ADDED OR ADDRESSED)

### Current State
The current page has **no visible pricing section.** The only pricing reference is gray footer text that reads "$1,500/mo after trial" — which is both wrong (no trial exists) and the worst possible placement (last thing they read, first thing that creates sticker shock with no context).

### What's Wrong

**The pricing model in PRICING_AND_TIERS.md is:**
- No fixed tiers — custom-quoted per engagement
- Floor: $1,500/month (Concierge agent only)
- Setup fee starts at $500, scales with scope
- 3-month minimum recommended once agents beyond Concierge are deployed

**The page needs to address pricing honestly without either hiding it or presenting a misleading SaaS-style tier table.** Contractors will Google-close this tab if they can't find a ballpark.

### Recommended Fix

**Add a brief "How pricing works" section above the form:**

> **What does it cost?**  
> Engagements start at $1,500/month — that's the Concierge agent running 24/7 lead capture, missed call recovery, and daily summaries. Most contractors find this pays for itself within the first 10 days.
>
> We scope everything on the discovery call. Some contractors need one agent. Some need four. We'll tell you exactly what we'd build and what it would cost before any money changes hands. Setup fee starts at $500 and scales with scope.
>
> No long-term contracts until we've proven ROI together.

**Remove the "$1,500/mo after trial" from the footer.** There is no trial. This is a false signal.

---

## SECTION 7 — FORM

### Current State
**Header:** "Let's talk. 30 minutes."  
**Sub:** "We'll map your workflow, look at where calls and jobs are slipping, and tell you honestly whether we're the right fit. No pitch. No obligation."  
Fields: Business name, Your name, Email, Phone, What scheduling software do you use?, How many techs do you run?

### What's Wrong

**Copy:**
- The header and subtext are the strongest copy on the entire page — keep both exactly as-is.
- "What scheduling software do you use?" has no inline explanation. Contractors may wonder why you need this before the call. Add: "(So we can confirm integration before we talk)"
- The submit button says "Request a discovery call" — "request" implies waiting for approval. First-person active converts better.
- The confirmation microcopy ("We'll reach out within a few hours to confirm your time") is vague. "A few hours" could mean 8 hours. If you can respond same-day, say same-day.

**Layout:**
- The form is centered on the page with a max-width container, which is correct, but the input fields have inconsistent border radius — some appear slightly more rounded than others on different browsers.
- Email and Phone are on the same row (correct) but the row breaks to stacked layout too early on mid-width screens, creating a long single-column form that feels like a lot of fields.
- The "How many techs do you run?" field is marked optional but the placeholder text ("e.g., 8") doesn't explain why you're asking. Add: "(Helps us size the right setup)" as helper text.
- The submit button is full-width on mobile — correct. But on desktop it's also full-width inside the form container, which makes it feel like a banner rather than a button.

### Recommended Fix
- **Button:** "Book my discovery call" — active, first-person, implies immediate confirmation
- **Confirmation microcopy:** "We'll confirm your time by end of day. No contract. No pitch. Just 30 minutes."
- Add helper text to CRM field: "(So we can confirm integration before we talk)"
- Add helper text to techs field: "(Helps us size the right build)"
- Cap button width at 280px on desktop, centered — feels more intentional

---

## LAYOUT AUDIT — PAGE-WIDE ISSUES

### Issue 1: Inconsistent Section Padding
The page has no consistent vertical rhythm. Some sections use 80px top/bottom padding, others appear tighter. The "What's Included" section is visibly compressed compared to the hero and guarantee sections. All sections should use the established `padding: "80px clamp(20px, 4vw, 48px)"` pattern from BRAND_ASSETS.md — currently several sections deviate from this.

### Issue 2: The Floating Chat/Help Icons
There are three floating icons on the right edge of the page at different scroll positions. They create visual noise and their purpose isn't clear from the screenshot. If these are support or navigation anchors, they need consistent styling and placement. If they're leftover from a widget integration, remove them.

### Issue 3: No Visual Break Between Partnership Description and Form
The page goes from the guarantee section (now removed) directly to the form with no intermediate trust-building content. With the guarantee removed, this gap will be even more pronounced. The "What to expect" replacement content and the pricing context block should fill this space.

### Issue 4: The Pricing Model Mismatch
Per PRICING_AND_TIERS.md, there are four named agents (Concierge, Closer, Dispatcher, Strategist) with custom pricing scoped per engagement. The current page's "What's Included" section presents a flat checklist that implies everything is included at one price — this is factually wrong and will create misaligned expectations on the discovery call. The checklist needs to either (a) only describe Concierge-level capabilities (what every engagement starts with), or (b) be restructured to show the four agents as separate expandable items.

### Issue 5: Footer Pricing Text
"$1,500/mo after trial" in the footer is wrong on two counts: (1) there is no trial, and (2) this is the minimum floor price, not a standard price. Remove it or replace with "Starting at $1,500/month — scoped on discovery call."

### Issue 6: No Section That Explains What Working With You Looks Like Over Time
The biggest structural gap: nowhere on the page does it explain that the engagement grows with the business. The scalability of the offer — more agents added as the business grows, system gets smarter over time, retainer increases as value increases — is not represented anywhere. This is the core of the business model and it's invisible. A short "How it grows with you" or "What month 3 looks like" section would close this gap.

---

## PRIORITIZED IMPLEMENTATION ORDER

### Tier 1 — Do These Before Publishing (Copy Breaks)
1. **Hero H1 and subhead** — the current hero mispositions the entire business. Highest impact, 10 minutes to implement.
2. **Remove the guarantee section** — SaaS framing, wrong model, creates unmanageable promises.
3. **Fix the "$1,500/mo after trial" footer text** — factually wrong, creates immediate credibility gap.
4. **Fix "13/mo" stat to "$3,900/mo"** — the current label communicates nothing at a glance.

### Tier 2 — High Leverage, Implement This Week
5. **Replace How It Works labels and body copy** — partner framing throughout, "You don't touch a thing" as Step 2 label.
6. **Add a pricing context block above the form** — ballpark transparency before they fill out the form reduces drop-off.
7. **Fix the form CTA button** — "Book my discovery call" + correct microcopy.
8. **Restructure What's Included** — separate day-one automation from monthly partnership commitments.

### Tier 3 — Before First Paid Client
9. **Add "How it grows with you" section** — explains the scalability model, positions Phase 2/3 upsell.
10. **Replace guarantee section with "What to expect" block** — risk-reversal without transactional framing.
11. **Add HCP differentiation line** — HCP users will object "we already have that." Kill it in the copy.
12. **Fix layout padding consistency** — standardize all sections to BRAND_ASSETS.md spec.

---

## COMPLETE COPY REWRITES (READY TO IMPLEMENT)

### Hero

**Eyebrow:** `FOR HVAC CONTRACTORS WITH 5–20 TECHS`

**H1:**
> Most HVAC contractors lose $8,600 a month to systems that don't talk to each other. We fix that.

**Subhead:**
> We map where your business is leaking money, build the AI that plugs the holes, and run it. Discovery call first. Custom-built for your operation. You see results every morning — you never touch a setting.

**CTA primary:** `Book a discovery call`  
**CTA secondary:** `See how it works →`  
**Microcopy:** `30-minute call. No pitch. We map your operation and tell you honestly if we're a fit.`

---

### Stats Row

| Label | Subtext |
|---|---|
| `< 60 sec` | "We text back every missed call. Most contractors don't respond for 47+ hours." |
| `$3,900/mo` | "Average monthly revenue lost to missed calls alone. Every one logged, texted back, recovered." |
| `No migration` | "Runs on top of Jobber, ServiceTitan, or HouseCall Pro. Your crew never touches it." |

---

### How It Works

**Section header:** "Three steps. Then we run it."  
**Sub:** "Most contractors are live within a week of their discovery call."

**Step 1 — "We find the leaks"**
> 30-minute call. We look at where calls and jobs are slipping — which leads go unanswered, which slots go unfilled, which tasks eat your dispatcher's day. We tell you exactly what we'd build and what it would recover. If we're not the right fit, we say that too.

**Step 2 — "We build it. You don't touch a thing."**
> We connect to your CRM and configure everything to your business — your service area, your pricing, how you talk to customers. End-to-end tested before anything goes live. You approve the setup. Then it runs.

**Step 3 — "It runs. We stay."**
> Missed leads get answered. Open slots fill. Admin handles itself. And as AI improves, we roll out new capabilities automatically — no upgrade cycle, no re-training your team. That's what the retainer is for.

---

### What to Expect (Replaces Guarantee)

**Section header:** "No contracts until you're confident."

> - Discovery call first. We map your operation and tell you honestly what we'd build and what it would recover.
> - Custom-built in about a week. Everything configured to your business before anything goes live.
> - Month-to-month after the first 90 days. No long-term contract. You stay because the system delivers.

---

### Pricing Context Block (New — Above Form)

**Eyebrow:** `WHAT DOES IT COST`

**Header:** "Scoped on the call. Transparent before you pay."

> Engagements start at $1,500/month — that's the Concierge running 24/7 lead capture, missed call recovery, and daily summaries. Most contractors find this pays for itself within the first two weeks.
>
> Some operations need one agent. Some need four. We scope everything on the discovery call and send a proposal within 24 hours. You know exactly what you're getting before any money changes hands. Setup fee starts at $500.

---

### Form

**Section eyebrow:** `BOOK A DISCOVERY CALL`  
**H2:** `Let's talk. 30 minutes.`  
**Sub:** `We'll map your workflow, look at where calls and jobs are slipping, and tell you honestly whether we're the right fit. No pitch. No obligation.`

**Field helper text:**
- "What scheduling software do you use?" → helper: `(So we can confirm integration before we talk)`
- "How many techs do you run?" → helper: `(Helps us size the right build for your operation)`

**Button:** `Book my discovery call`  
**Confirmation microcopy:** `We'll confirm your time by end of day. No contract. No pitch. Just 30 minutes.`

---

*End of audit. All copy is ready to implement. Layout notes require dev review against actual component files.*
