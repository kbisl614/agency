# Market Research Integration Report
**Date:** March 14, 2026  
**Status:** Complete - All market research insights integrated into landing page and dashboard copy

---

## What Was Updated

### 1. Hero Section (components/Hero.tsx)
**Change:** Updated subheading to directly use voice-of-customer language
- **Before:** "We become your retained AI operations partner—like an accountant who manages your business..."
- **After:** "Leads that arrive after 7pm disappear by 8am. Every call matters. We answer your emergency calls in 30 seconds, capture leads competitors miss, and fill your cancellations on autopilot."
- **Market Research:** Direct contractor quote "Leads that arrive after 7pm disappear by 8am" is the sharpest contrast in the pitch (47-hour industry avg vs. 30-second response)

### 2. Features Section (components/Features.tsx)
**Change:** Completely restructured features to match market-validated priorities

**Before:**
1. Revenue Recovery
2. Zero Configuration
3. Continuous Evolution
4. Partnership, Not Product

**After (Market Research Priority Order):**
1. Never Miss an Emergency Call (includes $3,900/month lost revenue statistic)
2. Backfill Your Schedule Automatically (cancellation fill, $40 hours saved)
3. See Your Speed to Lead Every Morning (dashboard metric, 88% contractor benchmark)
4. You Never Configure Anything (zero config anchor)

**Section Header:** Changed from "The Partnership Model" to "Four Revenue Streams You Control" with subtitle "How We Generate Your $4,700 Monthly ROI"

### 3. Pricing Section (components/Pricing.tsx)
**Change:** Added dispatcher salary anchor to address price objection
- **Added:** "Reference point: A full-time dispatcher costs $38k to $55k annually. $1,500/month pays for itself with 10 recovered emergency calls."
- **Market Research:** "Price" objection can be countered by anchoring to dispatcher salary, not product features

### 4. FAQ Section (app/faq/page.tsx)
**Changes:**
- Added 3 new objection-handling questions:
  1. "Can I just hire a virtual assistant instead?" - Addresses competitor concern
  2. "What if I'm worried about the AI making mistakes?" - Addresses fear of automation
  3. "How is this different from HCP Assist?" - Addresses HCP competitive threat
- Updated all pricing language to remove dashes ($3,000 to $5,000 instead of $3,000-5,000)
- Replaced all em-dashes with period breaks or commas for professional tone

### 5. Market Research Documentation
**Added:** docs/market-research.md
- Complete voice-of-customer research from Perplexity
- Key statistics validated by industry sources
- Feature priority stack aligned with contractor feedback
- Objection pre-emption strategies
- HCP competitive differentiation framework

---

## Key Market Research Findings Applied

### Stats Integrated Into Copy
| Stat | Where Used | Impact |
|---|---|---|
| 47-hour industry response time vs. 30-second response | Hero section subheading | Hero feature, clearest data contrast |
| $3,900/month in missed call recovery | Features "Never Miss" card | Quantified pain point |
| 88% of contractors take 5+ min to reply | Features "Speed to Lead" card | Pain validation |
| $4,700/month average ROI | Features header, multiple locations | Outcome proof |
| Dispatcher salary $38k to $55k | Pricing section | Price anchor |
| 78% of homeowners choose first responder | Hero stats card | Trust signal (existing) |

### Voice-of-Customer Phrases Applied
- "Leads that arrive after 7pm disappear by 8am" → Hero subheading (primary hook)
- "Every call matters, never miss a call" → Hero subheading
- "Backfill open time when a job falls off the schedule" → Features card #2
- "Saved us about 40 hours a month" → Features card #2 stats

### Objections Pre-Empted
| Objection | Counter Applied | Location |
|---|---|---|
| Price | $38-55K dispatcher salary anchor | Pricing section |
| Complexity | "Zero config" emphasis | Features card #4 |
| Fear of AI mistakes | "Human in the loop, 85% confidence" | FAQ new question |
| HCP competition | "We fill cancellations, they answer phones" | FAQ new question |
| Virtual assistant alternative | Comparison on cost, scale, 24/7 | FAQ new question |

---

## Tone Monitoring Results

### Professional & Consultative (Not Salesy)
✓ Removed aggressive superlatives
✓ Used industry data instead of hype
✓ Replaced emotion-driven language with outcome focus
✓ Structured as partnership/advisor positioning, not vendor pitch
✓ Replaced all em-dashes and aggressive punctuation with period breaks

### Specific Improvements
- Changed "We save you 40 hours a month" → "Saved us 40 hours a month" (voice of customer)
- Changed "Revolutionary AI" → Specific metrics and capabilities
- Removed all dash-based list formatting for cleaner reading
- Maintained technical credibility while keeping accessible language

---

## All Dashes Removed ✓

### Replaced Throughout:
- "$X-$Y" → "$X to $Y" format
- "X-Y days/hours" → "X to Y days/hours" format
- "fact—statement" → "fact. Statement" format
- "list—item" → "list, item" format

### Files Updated:
✓ app/faq/page.tsx (7 dash replacements)
✓ components/Features.tsx (0 existing dashes)
✓ components/Hero.tsx (em-dash to period break)
✓ components/Pricing.tsx (em-dash to period break)
✓ docs/market-research.md (2 em-dash to word replacements)

---

## Next Steps

### Recommended QA Checklist
- [ ] Read Hero section aloud to verify conversational tone
- [ ] Verify all pricing comparisons are clear and non-pushy
- [ ] Test Features section on mobile to ensure clarity without dashes
- [ ] Have a contractor (not insider) read FAQ objection section
- [ ] Check that "market research" language sounds natural, not quoted
- [ ] Verify no dashes appear in deployed HTML

### Future Market Research Applications
1. **Email Templates:** Apply VOC phrases to welcome sequence
2. **Sales Deck:** Use priority feature stack and objection counters
3. **CRM Landing Pages:** Customize HCP/Jobber/ServiceTitan pages with specific competitive positioning
4. **Support Documentation:** Use "human in the loop" language for trust
5. **Vertical Expansion:** Use dispatcher salary anchor for any service vertical

---

**Status:** Ready for QA review and stakeholder sign-off
