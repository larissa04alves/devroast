# AGENTS.md

## Project

**DevRoast** — paste code, get a brutal AI roast with a score (0–10) and line-by-line feedback.
Built live during **NLW (Rocketseat)**.

Stack: Next.js 16 · React 19 · TypeScript · Tailwind v4 · Bun · Biome v2 · Base UI · Shiki v4

---

## Global Rules

### Colors — never hardcode hex
Use Tailwind classes (`bg-accent-green`, `text-text-primary`) or `var(--color-*)` only in JS/SVG.
All tokens live in `src/app/globals.css` under `@theme`.

### Exports — always named
Never `export default` from UI components. Use `export function` or `export const`.

### Typography
- `font-mono` — all UI text, labels, code
- `font-sans` — long-form prose only

### Class merging
- Inside `tv()` variants → `class: className`
- Outside `tv()` → `cn()` from `@/lib/cn`
- Never string interpolation or `.join(" ")`

### Components
- Composition pattern via namespace objects: `Badge.Root`, `Badge.Label`, `AnalysisCard.Root`, etc.
- Variants via `tv()` from `tailwind-variants`
- Interactive primitives via `@base-ui/react`
- Server Components by default; `"use client"` only when state/events are needed
- Client Components in `app/` use `_` prefix (e.g. `_code-input-area.tsx`)

### Lint
- Biome v2 — suppression: `// biome-ignore lint: reason`
- `enabled:hover:` instead of `hover:` on buttons to prevent hover on disabled state

---

## Structure

```
src/
├── app/
│   ├── globals.css          # design tokens (@theme)
│   ├── layout.tsx           # root layout with <Navbar />
│   ├── page.tsx             # homepage
│   └── _code-input-area.tsx # client island
└── components/ui/           # all UI components + AGENTS.md
```
