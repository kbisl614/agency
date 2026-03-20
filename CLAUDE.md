# Fieldline AI — Claude Code Session Guide

## Session Start (Non-Negotiable — Read These First)

Before any task, read:
1. `~/.claude/GLOBAL_LEARNINGS.md`
2. `~/.claude/N8N_LEARNINGS.md` (if n8n work involved)
3. `/users/karsynregennitter/projects/obsidian-vault/Meta/User-Profile.md`
4. `/users/karsynregennitter/projects/obsidian-vault/Learnings/n8n-automation-learnings-comprehensive.md` (if n8n work involved)
5. Memory files in `.claude/projects/-Users-karsynregennitter-projects-agency/memory/MEMORY.md`

## Autonomous Execution Rules

- **Credentials in `.env`** → read and use them directly. Never ask Karsyn to provide values that are already there.
- **Steps in `docs/`** → read and execute. Never ask for manual steps that are already documented.
- **`docs/CREDENTIAL_SETUP_GUIDE.md`** → explicitly authorizes Claude to read `.env` and act on all credentials.
- **Obsidian vault** is readable at `/users/karsynregennitter/projects/obsidian-vault/` — no MCP needed.

## Project

**Fieldline AI** — AI ops platform for HVAC contractors. See memory files for full context, decisions, and current status.

## Style Guide

- Inline CSS only — no Tailwind (override conflicts)
- Design tokens: `#1A2535` navy · `#E8934A` orange · `#FAFAF8` cream · `#1A7A4A` green
- `flex: "1 1 300px"` + `flexWrap: wrap` for responsive layouts
