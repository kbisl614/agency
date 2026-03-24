# Fieldline AI — Landing Page Full Audit & Implementation Guide
**Date:** 2026-03-23 (v3 — final)
**Status:** All changes confirmed and reflected. Ready to implement.
**Source file to replace:** `app/page.tsx`
**Metadata to update:** `app/layout.tsx`

---

## What This Document Is

Complete section-by-section audit of the live landing page with every confirmed change applied.
Each section shows: current live copy → what's wrong → exact replacement ready to paste.

All changes from the March 23 session are reflected:
- Agency positioning (not SaaS, not a product)
- CRM-agnostic language throughout
- Guarantee removed → contract/terms framing
- Step 3 rewritten (smarter over time, never behind on AI)
- What's Included completely rewritten — custom AI framing, 6 titled cards
- No named features, no named agents in customer copy
- No upcharge language in either direction
- "No pitch" removed from form
- Pricing context section added above form
- Padding increased throughout
- Footer pricing text removed
- Metadata fully updated

---

## METADATA — app/layout.tsx

### Current (broken)
```
title:       "HVAC Dispatch Automation | Capture Emergency Calls at 2 AM"
description: "AI-powered autonomous revenue system... 30-day free trial."
author:      "Dispatch HVAC"
og:url:      "https://dispachhvac.ai"
og:siteName: "Dispatch HVAC"
```

### Problems
- Title references old concept and old brand name
- Description says "30-day free trial" — does not exist
- All OG/Twitter tags reference "Dispatch HVAC" — old brand

### Replacement
```ts
export const metadata: Metadata = {
  title: "Fieldline AI — AI Operations for HVAC Contractors",
  description:
    "We map where your HVAC business is losing money, build the AI that fixes it, and run it. Discovery call first. Custom-built for your operation.",
  authors: [{ name: "Fieldline AI" }],
  keywords: ["HVAC AI operations", "HVAC contractor automation", "AI for HVAC",
    "Jobber AI", "ServiceTitan AI", "HVAC lead recovery", "HVAC dispatch automation"],
  creator: "Fieldline AI",
  robots: "index, follow",
  openGraph: {
    title: "Fieldline AI — AI Operations for HVAC Contractors",
    description: "Custom AI built for your HVAC operation. We map your bottlenecks, build the system, and run it. Discovery call first.",
    url: "https://fieldlineai.com",
    siteName: "Fieldline AI",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fieldline AI — AI Operations for HVAC Contractors",
    description: "Custom AI built for your HVAC operation. We map your bottlenecks, build the system, and run it.",
  },
};
```

---

## SECTION 1 — HERO

### Current live copy
```
H1:        "We text back every missed call while you're on a job."
Sub:       "We build AI systems that plug into Jobber, ServiceTitan, or HouseCall Pro
            and handle lead response, schedule recovery, and admin work — 24/7."
Microcopy: "30-minute call. No sales pitch. We map your workflow and tell you if we're a fit."
Padding:   clamp(48px, 8vw, 80px)
```

### Problems
- H1 is a feature line — puts a $49/month ceiling on perceived value
- Subhead locks to 3 named CRMs
- "No sales pitch" is inaccurate — we are pitching them
- Padding too tight

### Replacement copy
```
H1:        "Most HVAC contractors lose $8,600 a month to systems that don't
            talk to each other. We fix that."

Sub:       "We map where your business is leaking money, build the AI that plugs
            the holes, and run it. Discovery call first. Custom-built for your
            operation. You see results every morning — you never touch a setting."

Microcopy: "30-minute call. We map your operation and tell you honestly how AI
            can be implemented and scaled."

Padding:   clamp(72px, 10vw, 112px)
```

---

## SECTION 2 — STATS ROW

### Current live copy
```
Label 1: "< 60 sec"   Sub: "We text back every missed call. Most contractors don't respond for 47+ hours."
Label 2: "13/mo"      Sub: "Average missed calls for a 10-tech contractor. Every one is revenue walking out the door."
Label 3: "Zero"       Sub: "New software for your team to learn. It runs on top of what you already have."
Gap:     32px
```

### Problems
- "13/mo" is the pain stat not an outcome — meaningless at a glance
- "Zero" requires reading subtext to understand — label must be self-explanatory
- Sub 1 says "text back every missed call" — still feature-specific language
- Gap too narrow, cells misalign when subtext lengths differ

### Replacement copy
```
Label 1: "< 60 sec"      Sub: "We respond to every missed contact. Most contractors don't respond for 47+ hours."
Label 2: "$3,900/mo"     Sub: "Average monthly revenue lost to missed calls alone. Every one logged, responded to, recovered."
Label 3: "No migration"  Sub: "Connects with your existing CRM, whatever it is. Your crew never touches it."
Gap:     48px  |  alignItems: flex-start
```

---

## SECTION 3 — HOW IT WORKS

### Current live copy
```
Header:       "Three steps, then it runs itself."
Step 1 label: "We map your bottlenecks"
Step 2 label: "We build it in about a week"
Step 3 label: "It runs. We keep it current."
Step 3 body:  "Monthly retainer means we're watching it, fixing it..."
All cards:    identical visual weight, padding: 24px, gap: 16px
```

### Problems
- "then it runs itself" — implies no one's running it, undercuts partner framing
- Step 2 implies fixed timeline ("in about a week") — scope varies
- Step 3 label has grammar issue and doesn't convey smarter-over-time
- All three cards look identical — Step 3 is the permanent state, should look different
- Padding too tight

### Replacement copy
```
Header:       "Three steps."
Sub:          "Most contractors are live within a week of their discovery call."

Step 1 label: "We map your bottlenecks."
Step 1 body:  "30-minute call. We look at where calls and jobs are slipping —
               which leads go unanswered, which slots go unfilled, which tasks
               eat your dispatcher's day. We tell you exactly what we'd build
               and what it would recover. If we're not the right fit, we say that too."

Step 2 label: "We build it."
Step 2 body:  "We connect to your existing CRM — whatever you're already using —
               and configure everything to your business. Your service area, your
               pricing, how you talk to customers. End-to-end tested before anything
               goes live. You don't touch a single setting."

Step 3 label: "It gets smarter. You never fall behind."
Step 3 body:  "The system learns from your business over time and improves. As AI
               tools evolve, we update and upgrade what's running for you
               automatically. You're never managing software updates or researching
               what's new — that's our job."

Step 3 card:  border: "0.5px solid #E8934A"  ← amber border signals permanent/ongoing state
All cards:    padding: 32px, gap: 20px
```

---

## SECTION 4 — WHAT'S INCLUDED

### Current live copy
```
Header:    "Everything that runs after we build it."
Sub:       "Once it's live, here's what runs without you touching it."
Format:    flat 2-column checklist, 8 items
Items:
  - "Every missed call gets a text back in under 60 seconds"
  - "Late-night leads handled — job booked before you wake up"
  - "Open slots fill automatically from your waitlist"
  - "Invoice follow-ups and payment reminders sent automatically"
  - "Post-job review requests within 24 hours"
  - "7am daily summary — plain English, what ran overnight"
  - "High-stakes actions need your approval before anything executes"
  - "Monthly upgrades as AI tools evolve — no extra charge"
```

### Problems
- Every item describes a specific named feature — SaaS product framing
- "Monthly upgrades as AI tools evolve — no extra charge" — mentions pricing direction, remove
- "7am daily summary," "Late-night leads handled," "missed call" — named product features
- Flat checklist conflates day-one automation with ongoing partnership
- Does not communicate that this is custom AI, not a product

### Replacement — 6 titled cards (left column top-to-bottom, right column top-to-bottom)

**Card 1: "Built specifically for your operation"**
> Every AI solution we implement is scoped to how your business actually runs — your jobs, your customers, your workflow. No templates. No packages. No two implementations are the same.

**Card 2: "It documents what it learns"**
> The AI continuously tracks patterns in your business — what's working, when leads come in, how customers respond. That knowledge is logged and used to make every next decision sharper.

**Card 3: "It improves autonomously — and we tune it alongside that"**
> The system improves on its own as it accumulates data. We actively manage and tune it on top of that — monitoring performance, adjusting behavior, and pushing updates. You get both: a self-improving system and a team watching it.

**Card 4: "It scales as your business scales"**
> More techs, more jobs, more complexity — the system handles it without needing to be rebuilt. As your operation grows, we expand what the AI covers to match.

**Card 5: "Every decision is logged and visible"**
> You always know what the AI did, when it did it, and why. Full transparency on every action — so you can trust what's running and we can show you exactly what it's recovering.

**Card 6: "We keep you current as AI evolves"**
> When better tools and capabilities emerge, we integrate them into your system. You never have to research what's new in AI or worry about falling behind — that's what we're here for.

**Format:** 2-column grid of titled cards on dark navy background. Each card has title + body. Subtle border and background differentiate from section background.

**New sub before cards:**
> "The AI we implement isn't a product you buy — it's a custom system we build into your business, manage on your behalf, and grow alongside you."

---

## SECTION 5 — GUARANTEE (REMOVE ENTIRELY → REPLACE)

### Current live copy
```
Eyebrow: "Our guarantee"
H2:      "5 recovered leads in your first 30 days — or your second month is free."
Body:    "We connect to your tools... at least 5 leads or fill 2 open slots..."
Badges:  "Works with Jobber / Works with ServiceTitan / Works with HouseCall Pro / No long-term contracts"
```

### Why removed
- Money-back guarantee framing = SaaS product thinking, not retained partner
- "5 recovered leads" is a universal promise on a custom-scoped engagement — unmanageable
- CRM lock-in badges need to be CRM-agnostic

### Replacement — "No contracts until we've proven the fit"
```
Eyebrow: "How it works for you"
H2:      "No contracts until we've proven the fit."

Three items:
1. "Discovery call first. We map your operation and tell you honestly what
    we'd build and what it would recover."
2. "Custom-built in about a week. Everything configured to your business
    before anything goes live."
3. "We scope the engagement on the call. If what we'd build makes sense for
    your operation, we'll outline terms and move forward together."

Badges:  "Works with any CRM" / "Custom-built for your operation" / "No generic packages"
CTA:     "Book a discovery call"
```

---

## SECTION 6 — PRICING CONTEXT (NEW — ADD BEFORE FORM)

### Current state
No pricing section. Only reference is footer text: `"$1,500/mo after trial"` — wrong (no trial) and wrong placement.

### New section
```
Eyebrow: "What does it cost"
H2:      "Scoped on the call. Transparent before you pay."

Para 1:  "Engagements start at $1,500/month depending on scope. Some contractors
          need one agent. Some need four. We scope everything on the discovery call
          and send a proposal within 24 hours — you know exactly what you're
          getting before any money changes hands."

Para 2:  "Setup fee starts at $500 and scales with scope. No generic packages.
          No pressure — just a clear proposal and a straightforward decision."
```

---

## SECTION 7 — FORM

### Current live copy
```
Sub:          "...tell you honestly whether we're the right fit. No pitch. No obligation."
CRM field:    no helper text
Techs field:  no helper text
Button:       "Request a discovery call"
Confirmation: "We'll reach out within a few hours to confirm your time. No contracts, no pressure."
```

### Problems
- "No pitch" — inaccurate
- "Request" implies waiting for approval — passive
- "A few hours" is vague
- No helper text on fields

### Replacement
```
Sub:          "We'll map your operation, identify where AI makes the most sense for
               your business, and walk you through exactly what we'd build. You'll
               leave with a clear picture of what's possible."

CRM helper:   "So we can confirm how we'd connect before we talk."
Techs helper: "Helps us size the right build for your operation."

Button:       "Book my discovery call"
Confirmation: "We'll confirm your time by end of day. Just 30 minutes."
```

---

## FOOTER

### Current
```
Right side: "$1,500/mo after trial"  ← no trial exists, wrong placement
```

### Replacement
```
Right side: "AI operations for HVAC contractors"
```

---

## FULL CHANGE SUMMARY TABLE

| Location | Old | New | Why |
|---|---|---|---|
| Metadata title | "HVAC Dispatch Automation \| Capture Emergency Calls at 2 AM" | "Fieldline AI — AI Operations for HVAC Contractors" | Old brand, old concept |
| Metadata description | "...30-day free trial." | Agency description, no trial mention | No trial exists |
| Metadata author/OG | "Dispatch HVAC" everywhere | "Fieldline AI" everywhere | Old brand name |
| Hero padding | clamp(48px...) | clamp(72px...) | Too cramped |
| Hero H1 | Feature line — missed call texting | Pain/outcome — $8,600 number | Feature → partner frame |
| Hero subhead | Feature list, 3 named CRMs | Relationship + outcome, CRM-agnostic | SaaS → agency frame |
| Hero microcopy | "No sales pitch..." | "...how AI can be implemented and scaled." | Inaccurate + wrong frame |
| Stats label 2 | "13/mo" | "$3,900/mo" | Pain stat → outcome number |
| Stats label 3 | "Zero" | "No migration" | Self-explanatory label |
| Stats sub 3 | CRM lock-in implied | "Connects with your existing CRM, whatever it is." | CRM-agnostic |
| Stats gap | 32px | 48px + flex-start | Alignment fix |
| How it works header | "Three steps, then it runs itself." | "Three steps." | "Runs itself" = wrong partner framing |
| Step 2 label | "We build it in about a week" | "We build it." | Fixed timeline implies packaged product |
| Step 2 body | "your CRM" | "your existing CRM — whatever you're already using" | CRM-agnostic |
| Step 3 label | "It runs. We keep it current." | "It gets smarter. You never fall behind." | Smarter-over-time + never-behind framing |
| Step 3 body | "Monthly retainer means we're watching it..." | Smarter-over-time, AI evolution, our job | Matches new positioning |
| Step 3 card | Same border as Steps 1+2 | Amber border | Visual signal = permanent/ongoing |
| Section padding (all) | clamp(32–40px...) | clamp(64px, 8vw, 96px) | Too cramped throughout |
| What's included sub | "Once it's live, here's what runs..." | "The AI we implement isn't a product you buy..." | Sets custom framing before the list |
| What's included format | Flat 8-item checklist | 6 titled cards with body copy | Feature list → custom AI description |
| What's included items | Named features (missed call, daily summary, etc.) | Custom AI value props (learns, improves, scales, etc.) | SaaS feature list → agency positioning |
| "No extra charge" | Present in checklist | Removed entirely | Pricing direction — don't mention either way |
| Guarantee section | Full section with money-back framing | Removed entirely | SaaS framing, wrong for custom engagement |
| New section | — | "No contracts until we've proven the fit" | Replaces guarantee with partner-appropriate risk reversal |
| New section | — | Pricing context block | No pricing existed on page; footer text was wrong |
| Form sub | "No pitch. No obligation." | Outcome-led description | "No pitch" is inaccurate |
| Form CRM field | No helper text | "So we can confirm how we'd connect before we talk." | Reduces form friction |
| Form techs field | No helper text | "Helps us size the right build for your operation." | Reduces form friction |
| Form button | "Request a discovery call" | "Book my discovery call" | "Request" is passive — implies waiting |
| Form confirmation | "Within a few hours" | "By end of day" | Vague → specific |
| Footer right | "$1,500/mo after trial" | "AI operations for HVAC contractors" | Wrong price framing, no trial exists |

---

## IMPLEMENTATION INSTRUCTIONS

**`page.tsx`** — drop into `app/page.tsx`. Full replacement. All changes applied.

**`layout-metadata.ts`** — copy the `metadata` export into `app/layout.tsx`. Replace the existing one. Leave fonts, body, and children unchanged.

**Pages NOT covered by this file (need separate updates):**
- `app/jobber/page.tsx` — still has CRM lock-in and guarantee language
- `app/servicetitan/page.tsx` — same
- `app/housecallpro/page.tsx` — same
- `app/faq/page.tsx` — still references guarantee

These are lower priority but will be inconsistent with the main page once deployed.
