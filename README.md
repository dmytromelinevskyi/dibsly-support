# Dibsly — public web app

React 19 + Vite application for the Dibsly iOS landing, feature reference, guides, support, policies and shared receipts. Ukrainian and English. Existing public `*.html` routes and Cloudflare endpoints are preserved.

## Run locally

Node.js 22.12+ is required.

```sh
npm ci
npm run dev       # http://127.0.0.1:4174/
npm run build     # prerender all 13 routes into dist/
npm run preview   # serve the production build
npm test
npm run check     # after build: routes, links, captures and output boundaries
```

## Application structure

```text
src/
  app/                 route loading, React hydration, server rendering, app shell
  pages/               LandingPage, DocumentPage, SplitPage
  components/site/     shared header, footer, icons, semantic content renderer
  features/
    cinema/            scroll timeline, Three.js phone/studio, native video player and causal timeline
    motion/            Ramka scroll damping, document journey line, motion preference
    reference/         native screen library, examples, feedback and roadmap controls
    receipts/          React receipt view, isolated amount/share model and translations
  content/
    films.json         edited native films, exact targets and action timing
    captures.json      original native extraction manifest
    landing/           localized portal, pricing and FAQ content
    documents/         structured guide/reference/policy content, without page chrome
    routes.json        public route manifest
  styles/              shared tokens and feature/page styles
public/assets/
  cinema/{uk,en}/      native motion frames, main poster and full screen library
  brand/               icons and identity
  screenshots/web/     web portal captures
  help/                guide assets
content/captures/      capture provenance, original frame timing
content/cinema/        audited film edits and button coordinates
content/legal/         versioned policy Markdown sources from the iOS app
scripts/
  build.mjs            Vite client build + React prerender
  check.mjs            generated site integrity checks
  capture/             simulator recording, extraction and publication
  content/             reference/policy content generation
server/worker.js       existing domain routing, shared receipt lookup and API proxy
```

The browser loads route content separately. Three.js is imported only on the landing when motion is enabled. React owns structure and controls; one animation loop updates the scene without React state updates per frame. The app interface uses native video, committed into a stable canvas texture only when a complete frame is available. A separate screen-space hand makes each target and press explicit.

## Editing

- Story copy: `src/features/cinema/story.js`.
- Causal beats and native frame ranges: `content/cinema/edits.mjs`.
- Rebuild films: `node scripts/capture/build-films.mjs` (requires the original local recordings). Pass `en/together` to rebuild one scene.
- Timeline, mobile fitting and continuous device travel: `src/features/cinema/film-timeline.js`.
- Serialized video decoding: `src/features/cinema/film-player.js`.
- Shared iPhone hardware: `src/components/device/IPhoneFrame.jsx` and `src/styles/device.css`.
- Shared design: `src/styles/tokens.css`, `site.css`.
- Landing pricing/FAQ: `src/content/landing/{uk,en}.json`.
- Guides/support: corresponding structured files in `src/content/documents/`.
- Feature list: `scripts/content/features.py`, then `npm run generate:features`.
- Policies: copy approved app Markdown into `content/legal/app-1.0.2/`, then `npm run generate:legal`.

The content generators produce structured React content, not application HTML pages. Never edit `dist/`.

## Motion and native sources

Nine stories work with scroll in both directions and a Watch/Pause control. Each action has 1.4 seconds to approach its exact target, a 0.45-second visible press, the actual native transition slowed by 1.3, and 1.5 seconds to read its result. Captions and the hand follow displayed film time. Fast scroll has bounded catch-up, with only the latest seek requested; one video is decoded at a time.

Phone travel begins a full viewport before the next chapter. A blend between complete frames covers source changes without dimming the display. A large satin-metal ribbon moves independently and responds to pointer parallax and light. Native presses emit waves and assemble a particle D that persists through the rest of the page. The document-space journey line ends by merging into the actual dot in the footer wordmark. Wheel smoothing uses Ramka's analytic damping; native touch, keyboard and scrollbar control remain available. The scene has no second camera lag.

Animation stays enabled on small phones and landscape layouts. Only an explicit/system reduced-motion preference or unavailable WebGL/video uses manual native screenshots. The gallery uses one persistent iPhone, visible feature choices and a compact native section picker on mobile; it has no nested horizontal scroller or full-screen dialog.

The background remains animated below the narrative. Hidden tabs stop rendering; idle ambient motion on mobile is limited to 30 Hz. Device resolution is capped. The original 18 recordings and PNGs are preserved locally in `.qa/capture-sources/` and ignored by Git. Production films, fallback frames and the screen library live in `public/assets/cinema/`.

See [capture provenance and chapter audit](docs/animation-audit.md), [architecture](docs/architecture.md) and [verification](docs/verification.md).

## Publishing

Cloudflare builds and serves `dist/` using `wrangler.toml`; the Worker remains in `server/`. The GitHub Pages workflow builds the same output. Repository Pages must use GitHub Actions as its source. No deployment is required for local development.
