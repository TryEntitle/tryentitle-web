# TryEntitle — marketing website

The marketing site for TryEntitle, an operations company that redesigns manual,
document-heavy workflows and automates the repeatable parts while keeping a
human on the judgment calls and exceptions.

Built to the spec in `tryentitle-website-prd.md` (v1.1). This is a **marketing
site, not an application** — no authentication, no accounts, no dashboards, and
no data collection beyond the third-party scheduler.

---

## Stack

| Layer | Choice |
|---|---|
| Framework | Vue 3 + TypeScript (`strict`), Vite |
| Static generation | `vite-ssg` — every route is prerendered to HTML |
| Head / SEO | `@unhead/vue`, driven by one `buildHead()` helper |
| Styling | Hand-built components + CSS custom-property design tokens |
| Content | Markdown compiled to typed data at build time, Zod-validated frontmatter |
| Testing | Vitest + Vue Test Utils, Playwright, axe-core, Lighthouse CI |

> The PRD recommended Next.js/React. This build uses **Vue + Vite** at the
> owner's direction; the PRD's framework-agnostic parts — design tokens, the
> palette, component boundaries, and engineering standards — carry over intact.

## 3D layer (Three.js)

The site carries a lazy Three.js layer for a "tech" visual language:

- **Hero** — `WorkflowScene` in `cover` mode: a full-bleed dark backdrop with a
  labelled exception-flow pipeline (INTAKE → … → FILED, brass document tokens, a
  human-review node), weighted to the right so the overlaid copy stays legible.
- **Detail-page headers** and the **closing CTA** — `AmbientScene`: a subtle
  drifting node/link constellation.

All 3D goes through one composable, `src/lib/three/useThreeScene.ts`, which:

- imports `three` **lazily on the client** (its own ~183 KB gz code-split chunk,
  fetched after first paint — never in SSR);
- **never initialises under `prefers-reduced-motion`** or without WebGL — the
  static `ExceptionRail` SVG (and the plain page) is the fallback;
- **pauses** when the canvas scrolls offscreen or the tab is hidden, caps DPR at
  2, and **disposes** every GPU resource on unmount.

**Deliberate performance trade-off.** This exceeds the PRD's per-route JS budget
(NFR2) on pages that mount a scene — an explicit "look first, lazy-load 3D"
decision. The *initial* per-route JS stays small (~56 KB gz on Home); the `three`
chunk loads after paint, so first paint and the no-JS/reduced-motion experience
are unaffected. Every canvas is `aria-hidden` and the accessible flow description
lives on the SVG, so the 3D adds nothing a screen reader must parse. To return to
strict budgets, remove the `WorkflowScene`/`AmbientScene` mounts — the SVG
fallbacks already render everything meaningful.

## Requirements

- Node — version pinned in `.nvmrc` (Node 24)
- npm 10+

## Getting started

```bash
git clone <repo-url>
cd tryentitle
npm install --legacy-peer-deps
npm run dev
```

Open http://localhost:5173.

> `--legacy-peer-deps` is required because the original scaffold pins
> `oxlint@~1.74` against `eslint-plugin-oxlint@1.73`, whose peer range does not
> include it. Resolving that mismatch removes the need for the flag.

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Dev server with HMR |
| `npm run build` | Typecheck, then build + prerender every route to `dist/` |
| `npm run build-only` | Build without the typecheck step |
| `npm run type-check` | `vue-tsc` over the whole project |
| `npm run lint` | oxlint + ESLint, with `--fix` |
| `npm run format` | Prettier over `src/` |
| `npx vitest run` | Unit and component tests |
| `npm run test:e2e` | Playwright: e2e, accessibility, responsive |

### Previewing the real build

E2E tests run against the **built** site served with static-host semantics
(clean URLs, real 404 status) — not `vite preview`, which uses SPA fallback and
would serve `index.html` for every path:

```bash
npm run build
node scripts/serve-dist.mjs   # http://localhost:4173
```

## Project layout

```
src/
├─ components/
│  ├─ primitives/     Design-system layer. Knows tokens, knows nothing about TryEntitle.
│  ├─ layout/         Chrome on every page: header, mobile nav, footer, skip link, logo.
│  ├─ sections/       Page sections. Presentational — data arrives via props.
│  └─ marketing/      BookingButton (the only component that knows the booking URL)
│                     and ExceptionRail (the signature visual).
├─ content/           Markdown: services, industries, blog, legal, proof (empty).
├─ data/              Typed, non-markdown site data (navigation, copy, process steps).
├─ lib/               constants, metadata/SEO, JSON-LD, content access, formatting.
├─ pages/             Route components. Compose sections; resolve data and pass it down.
├─ router/            Route table, mirroring the IA.
├─ styles/            tokens.css (the ONLY file with hex values) + globals.css.
└─ types/             Content types and Zod frontmatter schemas.

vite/                 Build-time: markdown compiler, route enumeration, OG images.
scripts/              serve-dist.mjs — static-host-accurate server for the build.
e2e/                  Playwright specs.
```

## How to…

### Change the booking URL

Edit `BOOKING_URL` in `src/lib/constants.ts`. That is the only place it exists —
every CTA renders through `BookingButton`, and an e2e test asserts that a single
booking destination is reachable from every page.

### Add a blog post

Create `src/content/blog/my-post.md`:

```markdown
---
title: How intake actually breaks
description: One sentence that also becomes the meta description.
publishedAt: '2026-08-01'
draft: false
---

Body in Markdown. Headings get anchors, reading time is computed at build.
```

Frontmatter is Zod-validated at build (`src/types/content.ts`). A missing
`description` or a malformed date **fails the build**. `draft: true` excludes the
post from production builds and from the sitemap.

Services, industries, and legal documents work the same way, in their own
folders under `src/content/`.

### Add proof (testimonials)

Drop a JSON file in `src/content/proof/`. While that folder is empty the proof
section renders **nothing** — deliberately. The schema requires a named person,
role, company, and `permission: true`, so an anonymous testimonial fails the
build. See `src/content/proof/README.md`.

### Change a colour, size, or spacing value

Edit `src/styles/tokens.css`. It is the only file in the repository permitted to
contain a hex value; everything else references a variable, so a rebrand is a
one-file change and an unapproved colour is trivially greppable in review.

## Deployment

Static output in `dist/`. Any static host + CDN works.

- `vercel.json` sets security headers (CSP, HSTS, `X-Content-Type-Options`,
  `Referrer-Policy`, `Permissions-Policy`), long-lived immutable caching for
  hashed assets, and `cleanUrls`.
- On a non-Vercel host, port those headers to its own configuration and enable
  clean URLs (`/services` → `services.html`).

### A note on the CSP

`script-src` includes `'unsafe-inline'` because each page embeds a
build-generated inline JSON-LD block. The site has no user-generated content, no
query-parameter reflection, and loads no third-party scripts, so the practical
XSS surface is minimal — but this is the one header worth hardening later, by
emitting per-page hashes or moving to a host that can inject a nonce.

## Verified against the PRD

The automated suite enforces, per route:

- One booking destination across the built site, with per-placement UTM tags (FR2)
- No console errors or warnings (NFR3)
- Zero serious/critical axe violations, WCAG 2.2 AA tags (NFR5)
- One `<h1>` and a `<main>` landmark per page (NFR5)
- No horizontal scroll at 360 / 390 / 768 / 1024 / 1280 / 1440 / 1920 (NFR1)
- The hero CTA above the fold at 360×640 (FR7)
- Mobile menu focus trap, Escape-to-close, focus returned to the trigger (NFR5)
- No dead or `#` internal links (FR3)
- The blog index renders an honest empty state rather than 404ing (FR18)
- The proof section renders nothing while the collection is empty (FR12)

## Open decisions blocking launch

Carried from PRD §18. These are **not** resolvable in code:

| # | Decision | Blocks |
|---|---|---|
| D1 | Real Calendly URL | `BOOKING_URL` — currently a placeholder handle |
| D2 | ~~Production domain~~ | Resolved — live at `www.tryentitle.com` on Vercel; `SITE_URL` updated |
| D3 | Logo/wordmark SVG | `Logo.vue` is a typographic placeholder |
| D4 | Legal review | All four legal pages are unreviewed scaffolds (see below) |
| D6 | Analytics tool | Nothing is instrumented yet; a cookieless tool avoids a consent banner |
| D7 | Newsletter capture | Not built (FR19 is `Could`) |
| D8 | Contact addresses | Placeholders in `src/lib/constants.ts` |

### Legal pages are gated

`src/content/legal/*.md` are **structural scaffolds, not legal text**. Each is
`reviewed: false`, which makes its page render a visible draft warning, sets
`noindex`, and keeps it out of the sitemap. After counsel (or a licensed
template) supplies real content, set `reviewed: true` in the frontmatter to
release the page. Do not flip that flag to make a warning disappear.
