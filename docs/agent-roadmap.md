# Agent Roadmap

Agents to build on the claude.ai subscription via RemoteTrigger (24/7, no API key costs).
Each runs on your existing MCP connections: Gmail, Google Calendar, Apollo.io, Notion, Telegram, n8n.

---

## 1. Morning Briefing Agent

**What it does:** Runs at 7am daily. Reads your calendar for the day, scans Gmail for anything urgent, checks Apollo pipeline for lead activity, and sends a 60-second brief to Telegram before you touch a screen.

**Trigger:** CronCreate — `57 6 * * *` (6:57am daily, durable)

**Tools needed:** Google Calendar MCP, Gmail MCP, Apollo MCP, Telegram (via n8n webhook)

**Output:** Telegram message with:
- Today's meetings + who they're with
- Unread emails that need a reply
- Any leads that moved in Apollo overnight
- One priority for the day

**Why high ROI:** Saves 20-30 min of context-gathering every morning. Compounds to 120+ hours/year.

---

## 2. Meeting Prep Agent

**What it does:** Fires 30 minutes before any calendar event that has an external attendee. Pulls the contact from Apollo, finds company news, writes a 3-bullet briefing. Sends to Telegram so you're prepped before the call.

**Trigger:** CronCreate — `*/15 * * * *` (polls every 15 min, checks for upcoming meetings)

**Tools needed:** Google Calendar MCP, Apollo MCP, Telegram (via n8n webhook)

**Output:** Telegram message with:
- Who you're meeting + their title/company
- Apollo enrichment data (funding, size, tech stack)
- 2-3 conversation openers or context points

**Why high leverage:** You walk into every call knowing something about them. Closes more deals.

---

## 3. Instagram Analyzer + Content Repurposer

**What it does:** Ingests Instagram analytics (reels, posts, stories) and identifies what's getting traction. Then takes high-performing content and repurposes it into: cold DM, LinkedIn post, and cold email opener — automatically.

**Trigger:** Weekly (Sunday evening) + on-demand via `/run`

**Tools needed:** Instagram data export or API, Claude for analysis + repurposing, Notion MCP (to store output library)

**Output:**
- Weekly analytics report (what worked, what didn't, why)
- Repurposed content for each high-performer:
  - Cold DM version
  - LinkedIn post
  - Cold email opener

**Why high leverage:** One piece of content becomes 3+ outreach angles. Multiplies output without more content creation time.

---

## 4. Apollo Enrichment Agent

**What it does:** Watches for new leads entering Supabase with incomplete data. Auto-enriches with Apollo: title, direct phone, LinkedIn URL, company size, funding stage, tech stack, recent news. Writes enriched data back to the lead record.

**Trigger:** n8n webhook on new Supabase row insert → RemoteTrigger (event-driven)

**Tools needed:** Apollo MCP (`apollo_people_match`, `apollo_organizations_enrich`), Supabase MCP

**Output:** Fully enriched lead record in Supabase — no manual research required.

**Why high ROI:** Eliminates all manual lead research. Each enrichment saves 10-15 min. At 10 leads/week = 2+ hours saved weekly.

---

## 5. Proposal Draft Agent

**What it does:** After a discovery call, you send a voice memo or bullet notes to Telegram. Agent transcribes/reads the notes, writes a full proposal draft in Work Floor brand voice, and emails it to you within minutes — ready to review and send.

**Trigger:** Telegram message to a specific channel/bot command

**Tools needed:** Gmail MCP (send draft), Notion MCP (pull proposal template), Claude (draft generation)

**Output:** Gmail draft with:
- Personalized intro based on call notes
- Service recommendation (Tier 1/2/3)
- Pricing in Work Floor format
- Next steps / CTA

**Why high ROI:** Proposals sent within 1 hour of a call close 3-5x more than proposals sent the next day. Speed wins.

---

## 6. Work Documentation Agent

**What it does:** Tracks everything you build, ship, and learn. Runs weekly to pull git commits, n8n workflow changes, Notion updates, and any notable Claude sessions — then writes a structured work log entry. Builds a running portfolio of real work with context.

**Trigger:** CronCreate — `0 17 * * 5` (Friday 5pm weekly)

**Tools needed:** Git log (Bash), n8n MCP (list workflows), Notion MCP (create page), Claude (narrative writing)

**Output:** Notion page per week with:
- What was built (with links/screenshots)
- Technical decisions made and why
- Business impact / metrics moved
- Shareable summary paragraph (LinkedIn-ready)

**Compounding value:**
- Portfolio of real work for future clients
- LinkedIn content pipeline (proof, not claims)
- Honest track record for yourself

---

## Build Order (Recommended)

| Priority | Agent | Reason |
|----------|-------|---------|
| 1 | Morning Briefing | Fastest to build, highest daily value, proves the pattern |
| 2 | Apollo Enrichment | Fully automated, saves the most time per week |
| 3 | Meeting Prep | High close-rate impact, low complexity |
| 4 | Work Documentation | Builds compounding portfolio value over time |
| 5 | Proposal Draft | Requires more prompt tuning but highest revenue impact |
| 6 | Instagram Analyzer | Most complex, needs data pipeline — build last |

---

## Shared Infrastructure

All agents use:
- **RemoteTrigger** or **CronCreate** for scheduling (claude.ai subscription, no API key)
- **Telegram** as the primary output channel (already connected)
- **Notion** as the knowledge store (already connected)
- **Apollo MCP** for lead/contact data (already connected)
- **Gmail MCP** for email I/O (already connected)
- **Google Calendar MCP** for event awareness (already connected)
