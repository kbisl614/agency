# Fix Lint Errors Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate all 37 ESLint problems (16 errors, 21 warnings) across 3 groups: script `require()` imports, dead code in LeadForm, and an unused destructure in submit-lead.

**Architecture:** Three independent fixes. Task 1 wipes 34 issues in one config change by excluding standalone Node.js utility scripts from ESLint. Tasks 2–3 fix the remaining 3 issues in app code directly. No new files. No new dependencies.

**Tech Stack:** ESLint 9 flat config (`eslint.config.mjs`), Next.js App Router, React

---

## Files Modified

- `eslint.config.mjs` — add `scripts/**` to `globalIgnores`
- `components/LeadForm.tsx` — escape apostrophe + remove dead `isVisible` state and IntersectionObserver
- `app/api/submit-lead/route.ts` — rename `agreed_to_contact` destructure to `_`

---

## Issue Map

| File | Line | Rule | Count |
|------|------|------|-------|
| `scripts/build-after-hours-workflow.js` | 3–5, 20–25, 56 | `no-require-imports`, `no-unused-vars` | 10 |
| `scripts/build-missed-call-workflow.js` | 3–5, 20–26, 57 | `no-require-imports`, `no-unused-vars` | 11 |
| `scripts/build-workflows-with-credentials.js` | 3–5, 54 | `no-require-imports`, `no-unused-vars` | 4 |
| `scripts/create-fresh-workflows.js` | 3–5, 48 | `no-require-imports`, `no-unused-vars` | 4 |
| `scripts/create-n8n-workflows.js` | 3–5, 39, 55 | `no-require-imports`, `no-unused-vars` | 5 |
| `components/LeadForm.tsx` | 15, 143 | `no-unused-vars`, `no-unescaped-entities` | 2 |
| `app/api/submit-lead/route.ts` | 47 | `no-unused-vars` | 1 |
| **Total** | | | **37** |

---

### Task 1: Exclude scripts from ESLint

**File:** `eslint.config.mjs`

The 5 scripts in `scripts/` are standalone Node.js CLI utilities — they use CommonJS `require()` because they run directly with `node`, not through the Next.js build pipeline. Linting them with `@typescript-eslint/no-require-imports` is a false positive. Adding them to `globalIgnores` is the correct approach (same pattern as `.next/**`, `out/**` etc. in the existing config).

- [ ] **Step 1: Add `scripts/**` to globalIgnores**

  Current `eslint.config.mjs`:
  ```js
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  ```

  Replace with:
  ```js
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "scripts/**",
  ]),
  ```

- [ ] **Step 2: Verify — run lint and confirm scripts no longer appear**

  ```bash
  npm run lint 2>&1 | grep "scripts/"
  ```
  Expected: no output (scripts excluded from lint entirely).

- [ ] **Step 3: Commit**

  ```bash
  git add eslint.config.mjs
  git commit -m "fix: exclude scripts/ from ESLint — standalone Node.js CJS utilities"
  ```

---

### Task 2: Fix LeadForm.tsx — unescaped entity + dead state

**File:** `components/LeadForm.tsx`

Two issues:

1. **Line 143** (`react/no-unescaped-entities`): `We'll` contains a raw apostrophe inside JSX text. JSX requires HTML entity encoding for `'`.
2. **Line 15** (`no-unused-vars`): `isVisible` is set by an IntersectionObserver callback (`setIsVisible(true)`) but never read anywhere in the component. The state variable and the entire IntersectionObserver `useEffect` that serves only to set it are dead code. Per YAGNI, remove both.

- [ ] **Step 1: Escape the apostrophe on line 143**

  Find:
  ```tsx
  We'll contact you within 2 hours to finalize setup. Redirecting...
  ```

  Replace with:
  ```tsx
  We&apos;ll contact you within 2 hours to finalize setup. Redirecting...
  ```

- [ ] **Step 2: Remove the dead `isVisible` state and IntersectionObserver**

  Remove line 15:
  ```tsx
  const [isVisible, setIsVisible] = useState(false);
  ```

  Remove the entire `useEffect` block (lines 20–36):
  ```tsx
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);
  ```

  > `sectionRef` at line 14 is still used on the JSX element (`ref={sectionRef}`), so keep it.

- [ ] **Step 3: Verify — check for `isVisible` references**

  ```bash
  grep -n "isVisible\|setIsVisible" components/LeadForm.tsx
  ```
  Expected: no output.

- [ ] **Step 4: Commit**

  ```bash
  git add components/LeadForm.tsx
  git commit -m "fix: remove dead isVisible state, escape apostrophe in LeadForm"
  ```

---

### Task 3: Fix unused `agreed_to_contact` in submit-lead

**File:** `app/api/submit-lead/route.ts`

Line 47 destructures `agreed_to_contact` from the request body to exclude it from the `leadData` spread — the right intent, but ESLint flags it as an unused variable. The TypeScript/ESLint convention for intentional unused destructure bindings is to prefix with `_`.

- [ ] **Step 1: Rename the destructure binding**

  Current (line 47):
  ```typescript
  const { agreed_to_contact, ...leadData } = body;
  ```

  Replace with:
  ```typescript
  const { agreed_to_contact: _, ...leadData } = body;
  ```

- [ ] **Step 2: Commit**

  ```bash
  git add app/api/submit-lead/route.ts
  git commit -m "fix: rename agreed_to_contact destructure to _ to silence unused-vars"
  ```

---

## Final Verification

After all commits:

```bash
# Full lint — expect 0 problems
npm run lint 2>&1 | tail -5
# Expected: ✔ No ESLint warnings or errors (or exit 0 with no output)

# Confirm no isVisible in LeadForm
grep -n "isVisible" components/LeadForm.tsx
# Expected: no output

# Confirm underscore rename in submit-lead
grep -n "agreed_to_contact" app/api/submit-lead/route.ts
# Expected: one line showing `agreed_to_contact: _`
```
