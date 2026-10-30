# React application architecture

React 19 and Vite provide route-level loading and prerender all 13 public routes. The Worker (`server/worker.js`)
handles domain routing, short receipt links and API forwarding; it is not bundled into browser code.

**The landing** (`pages/LandingPage.jsx`) renders `features/journey/JourneyLanding.jsx`: the hero, the scroll steps from
`content/journey.json`, then the gallery (`features/reference/FeatureGallery.jsx`) and the details (price, FAQ). Its
engine (`journey-engine.js`) loads GSAP, ScrollTrigger and — above 1080 px — Lenis, plays the hero's entrance, ties each
step's scene to its caption, moves the phone between the sides (`sides.js`) and starts the three.js particle field
(`field.js`, pixel ratio capped at 1.5 on phones, 2 on desktop). Up to 1080 px the steps snap one screen at a time
(`html.snap-steps`).

**The journey line** (above 1080 px only): `journey-driver.js` measures the hero kicker's dot, the hero copy's left
edge and bottom and the footer's period, and draws on scroll or resize until the head has caught up.
`journey-path.js` builds the document-space path: from the dot down the gutter left of the words into a wave, then to
the period; every point lies below the one before, so the head follows the scroll. `journey-line.js` paints the
visible part, cuts holes where the phones are, draws the head in Dibsly's orange and merges it into the period with a
liquid neck and a landing bounce. Canvas sizes use the page's client width, without the scroll bar.

Reduced motion shows the steps without animation and no line. Structured documents, feedback, roadmap controls and the
receipt model keep their behaviour and URLs.
