---
name: Project File Organization Preference
description: Where planning, implementation, and reference docs should be saved
type: feedback
---

# File Organization for Agency Project

**Rule:** All planning files, implementation plans, design specs, and reference documentation should be saved to the `updated-files/` folder at the root of the agency directory.

**Why:** Keeps active working documents separate from archived/strategic docs. Makes it clear what's current and actively being used vs. foundational reference material.

**How to apply:**
- Implementation plans → `updated-files/YYYY-MM-DD-<feature>-implementation.md`
- Design specs → `updated-files/YYYY-MM-DD-<feature>-design.md`
- Reference docs → `updated-files/FILENAME.md`
- Feature prioritization → `updated-files/feature-tier-mapping.md`

**Directory structure:**
```
agency/
├── app/ (Next.js application)
├── backend/ (FastAPI)
├── n8n/ (workflows)
├── docs/ (archived/strategic docs)
├── updated-files/ ← ALL NEW PLANNING/IMPLEMENTATION FILES GO HERE
└── ...
```

This keeps the working project state clear and organized for both of us to stay oriented.
