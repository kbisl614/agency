# Fieldline AI — Brand & Design Assets

**Last Updated:** 2026-03-15

---

## Color Palette

### Primary Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--navy-800` | `#1A2535` | Hero bg, header bg, primary dark surfaces, text on light |
| `--navy-900` | `#111E2E` | Stat bar bg, footer bg, deepest dark |
| `--navy-700` | `#1F3044` | Card borders on dark, hover states, footer chips |
| `--orange-500` | `#E8934A` | Primary CTA, eyebrow labels, highlights, links |
| `--orange-600` | `#C05C1E` | CTA hover state, dark button variant |
| `--orange-400` | `#F0A86A` | Lighter accent, gradient ends |

### Background Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--bg-primary` | `#FAFAF8` | Page background, lead form section, guarantee section |
| `--bg-cream` | `#F5F2EE` | ROI banner, guarantee box, section cards |
| `--bg-secondary` | `#FFFFFF` | White cards (approval inbox, action log rows) |

### Text Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--text-primary` | `#1A2535` | Headings, body on light bg |
| `--text-secondary` | `#6A7D8E` | Subtext, labels on light bg |
| `--text-muted` | `#9AAABB` | Timestamps, secondary info on dark bg |
| `--text-warm` | `#F5F3EE` | Body text on dark/navy bg |

### Borders

| Token | Hex | Usage |
|-------|-----|-------|
| `--border-warm` | `#DDD0C0` | Outer borders of cream cards |
| `--border-subtle` | `#E8DDD0` | Inner borders, dividers, row separators |

### Semantic / Status Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--green-600` | `#1A7A4A` | Success state, "Done automatically" chip, checkmarks |
| `--emerald-500` | `#10b981` | Live indicator dot, success action dot |
| `--emerald-400` | `#34d399` | Lighter success accent |

### Chip / Status Badges

| Variant | Background | Text | Usage |
|---------|-----------|------|-------|
| Green | `#E6F4EC` | `#1A7A4A` | Done automatically, success |
| Orange | `#FEF0E6` | `#C05C1E` | Waiting on customer, pending |
| Blue | `#E6F0FE` | `#2563EB` | Info states |
| Gray | `#F0EBE3` | `#6A7D8E` | Neutral, muted |
| Red | `#FEE6E6` | `#C0392B` | Error, alert |

---

## Typography

### Fonts (Google Fonts — loaded via Next.js)

| Font | Variable | Weight | Usage |
|------|----------|--------|-------|
| **Outfit** | `--font-display` | 400–600 | Display headings, nav, CTAs |
| **DM Sans** | `--font-body` | 400–500 | Body copy, form labels, descriptions |
| System fallback | `--font-sans` | — | `-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif` |

### Type Scale

| Size | Usage |
|------|-------|
| `clamp(26px, 4vw, 36px)` | H1 / section headings |
| `22px` | Large stat numbers, ROI figure |
| `18px` | Card headers, subheadings |
| `15px` | Hero body copy |
| `14px` | Standard body, form labels |
| `13px` | Secondary body, checklist items |
| `12px` | Small captions, stat labels |
| `11px` | Eyebrow labels (uppercase, `letter-spacing: 1.4px`) |
| `9–10px` | Dashboard mock micro labels |

---

## UI Components (`components/ui/`)

### Button (`Button.tsx`)
Variants: `primary` · `dark` · `muted` · `ghost` · `outline`
Sizes: `sm` · `md` · `lg`
Prop: `fullWidth?: boolean`

| Variant | Background | Text | Use For |
|---------|-----------|------|---------|
| `primary` | `#E8934A` | white | Main CTAs |
| `dark` | `#C05C1E` | white | Secondary CTAs on light bg |
| `muted` | `#F0EBE3` | `#1A2535` | Non-primary actions |
| `ghost` | transparent | `#9AAABB` | Tertiary / text links |
| `outline` | transparent | `#6A7D8E` | Bordered quiet actions |

### SectionHeader (`SectionHeader.tsx`)
Props: `eyebrow` · `heading` · `description?` · `align?: "left" | "center"` · `descriptionMaxWidth?`
Used in: Features, Pricing, LeadForm

### Chip (`Chip.tsx`)
Variants: `green` · `orange` · `blue` · `gray` · `red`
Used in: Dashboard, action logs, status badges

---

## Layout Patterns

### Responsive Two-Column
```tsx
// No media queries — wraps automatically at ~600px viewport
display: "flex", flexWrap: "wrap", gap: "clamp(32px, 5vw, 64px)"
// Each column:
flex: "1 1 300px", minWidth: 0
```

### Section Padding
```tsx
// Standard section
padding: "80px clamp(20px, 4vw, 48px)"
// Tighter section
padding: "48px clamp(16px, 4vw, 32px)"
```

### Card
```tsx
background: "#FFFFFF", border: "0.5px solid #E8DDD0", borderRadius: "8px", padding: "16px"
```

### Cream Banner / Guarantee Box
```tsx
background: "#F5F2EE", border: "0.5px solid #DDD0C0", borderRadius: "10px"
```

---

## Shadows

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 1px 2px 0 rgb(0 0 0 / 0.05)` | Subtle lift |
| `--shadow-md` | `0 4px 6px -1px rgb(0 0 0 / 0.1)` | Cards |
| `--shadow-lg` | `0 10px 15px -3px rgb(0 0 0 / 0.1)` | Modals, dropdowns |
| `--shadow-xl` | `0 20px 25px -5px rgb(0 0 0 / 0.1)` | Elevated panels |
| `--shadow-glow` | `0 0 40px -10px #E8934A` | Orange CTA glow |
| Browser chrome | `0 24px 64px rgba(0,0,0,0.6)` | Dashboard mock frame |

---

## Animations (`globals.css`)

| Class | Effect | Duration |
|-------|--------|----------|
| `.animate-fade-in-up` | Slide up + fade | 0.6s |
| `.animate-fade-in` | Fade only | 0.5s |
| `.animate-float` | Gentle bob | 6s loop |
| `.animate-pulse-glow` | Orange CTA glow pulse | 2s loop |
| `.animate-scale-in` | Scale from 95% | 0.3s |
| `.delay-100` → `.delay-800` | Stagger delays | 100ms steps |

---

## Brand Voice (Copy Patterns)

- **Eyebrow labels:** ALL CAPS, `letter-spacing: 1.4px`, orange `#E8934A`
- **Headlines:** Sentence case, weight 500 (not bold), conversational
- **Money figures:** Orange `#E8934A`, prominent size
- **Recovered/success figures:** Green `#1A7A4A`
- **Tone:** Contractor-direct ("We text back missed calls"), no jargon

---

## Current Assets (`public/`)

| File | Type | Status |
|------|------|--------|
| `favicon.ico` | Icon | ✅ Present |
| `file.svg` | SVG | Default Next.js |
| `globe.svg` | SVG | Default Next.js |
| `next.svg` | SVG | Default Next.js |
| `vercel.svg` | SVG | Default Next.js |
| `window.svg` | SVG | Default Next.js |
| `public/images/` | Folder | ⚠️ Empty |
| `/og-image.jpg` | OG image | ❌ Missing — needed for social sharing |

---

## Pages

| Route | File | Status |
|-------|------|--------|
| `/` | `app/page.tsx` | ✅ Live |
| `/faq` | `app/faq/page.tsx` | ✅ Live |
| `/thank-you` | `app/thank-you/page.tsx` | ✅ Live |
| `/jobber` | `app/jobber/page.tsx` | ✅ Live |
| `/servicetitan` | `app/servicetitan/page.tsx` | ✅ Live |
| `/housecallpro` | `app/housecallpro/page.tsx` | ✅ Live |

---

## Known Issues / TODOs

- [ ] `layout.tsx` — metadata still says `"dispachhvac.ai"` and `"Dispatch HVAC"` → update to Fieldline AI
- [ ] `public/og-image.jpg` — missing, needed for social sharing previews
- [ ] `public/images/` — empty, no product screenshots or brand images yet
- [ ] `components/Industries.tsx` — exists but not used on any page, uses old Tailwind-heavy code
- [ ] Demo video — play button overlay has no `href`, links nowhere
- [ ] `verification.google` in layout.tsx — placeholder value needs real code
