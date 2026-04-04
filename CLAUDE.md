# Work Floor — Agency Project

AI implementation partner for HVAC contractors. Custom-built AI systems for operations, lead capture, dispatch, and reporting.

## Stack
- Single-file HTML dashboard (`workfloor-command-center.html`)
- Work Floor branding (see `agency-context/copywriting-and-sales/BRAND_ASSETS.md`)
- Google Sheets CSV for leads — no auth required
- localStorage for pipeline state and notes
- n8n workflows for automation (`krn8n9394.app.n8n.cloud`)

## Key Files
- `workfloor-command-center.html` — CRM + analytics dashboard
- `workfloor-cold-call.html` — 5-phase cold call script reference
- `agency-context/` — full business context (index: `agency-context/README.md`)

## Rules
- Always match Work Floor branding from BRAND_ASSETS.md
- Sanitize all dynamic HTML with `esc()` — no raw string interpolation
- Do not modify files inside `agency-context/`
- Read `agency-context/README.md` before any business/product/pricing decisions

## Before Starting
1. Check `handoffs/` for latest session state
2. Read `~/Obsidian/obsidian-vault/FOCUS.md` for today's priorities
3. Read `agency-context/README.md` for current project phase
