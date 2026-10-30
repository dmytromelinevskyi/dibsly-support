# Dibsly — public web app

React 19 + Vite application for dibslyapp.com: the landing, features, guides, support, policies and shared receipts,
in Ukrainian and English. Public `*.html` routes and the Cloudflare endpoints are preserved.

## Run locally

Node.js 22.12+ is required.

```sh
npm ci
npm run dev       # http://127.0.0.1:4174/
npm run build     # prerender all 13 routes into dist/
npm run preview   # serve the production build
npm test
npm run check     # after build: routes, links, images and output boundaries
```

## Application structure

```text
src/
  app/                 route loading, React hydration, server rendering, app shell
  pages/               LandingPage, DocumentPage, SplitPage
  components/          shared header, footer, icons, iPhone frame, semantic content renderer
  features/
    journey/           the landing's scroll steps (JourneyLanding), its GSAP/Lenis engine, the phone's sides and the
                       three.js particle field
    motion/            the journey line from the hero kicker's dot to the footer's period, its path and easing
    reference/         the «Take a closer look» gallery, screenshot decks, feedback and roadmap controls
    receipts/          the shared receipt view, its amount/share model and translations
  content/
    journey.json       the landing's steps, uk and en
    landing/           hero, pricing, the website block and FAQ, uk and en
    documents/         features, guides, support, privacy, terms and split, without page chrome
    routes.json        public route manifest
  styles/              tokens and feature/page styles
public/assets/
  journey/             the steps' app frames
  cinema/{uk,en}/screens/  the gallery's and the features page's app screens
  screenshots/         App Store and website captures
  brand/, mascot/, help/, vendor/
content/legal/         the policies' Markdown (the app's PRIVACY*/TERMS*)
content/landing-frames/  source frames of the steps
scripts/
  build.mjs            Vite client build + React prerender
  check.mjs            generated site integrity checks
  content/             features and policies content generation
  capture/             the app's debug showcase on a simulator (showcase.py, launch.py)
server/worker.js       domain routing, shared receipt lookup and API proxy
```

## Editing

- Landing steps: `src/content/journey.json`; hero, prices and FAQ: `src/content/landing/{uk,en}.json`.
- Guides and support: `src/content/documents/`.
- Features: `scripts/content/features.py`, then `npm run generate:features`.
- Policies: edit `content/legal/app-1.0.2/*.md` (and copy them to the app repository's `PRIVACY*.md` / `TERMS*.md`),
  then `npm run generate:legal`.
- Shared iPhone hardware: `src/components/device/IPhoneFrame.jsx`, `src/styles/device.css`; design tokens:
  `src/styles/tokens.css`.

Generated JSON is structured React content, not HTML. Never edit `dist/`.

## Motion

Above 1080 px the landing scrolls with Lenis; GSAP's ScrollTrigger drives the steps, and the phone jumps between the
sides (`sides.js`). A canvas line starts at the hero kicker's dot, comes down left of the words into a wave behind the
phones and lands on the footer's period (`journey-path.js`, `journey-line.js`). Up to 1080 px the page is one column
with snapping steps and no line. Reduced motion shows the steps without animation.

The former cinema landing (Three.js studio, native films) was removed on 2026-10-30; it lives in Git history.

## Publishing

Cloudflare builds and serves `dist/` with `wrangler.toml` (`npx wrangler deploy`, wrangler from the Dibsly repository's
`Server/sync`); the Worker is in `server/`.
