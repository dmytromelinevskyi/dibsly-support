# Verification — causal video and responsive motion revision

- Production build prerenders all 13 public routes.
- Integrity check passes for local links, guide anchors, 1,380 original native frames, 18 edited films and public-output boundaries.
- 16 tests pass: causal phase order and visible targets, mobile fitting, continuous travel through chapter changes, Ramka direction reversal, serialized video seeks and displayed-time consistency, receipt math/decoding, routes and Worker behavior.
- Formatting and Git whitespace checks pass.
- Media audit checked 96 held before/after states in the actual encoded MP4s against native WebPs. Worst mean RGB difference at thumbnail size: 3.06/255. Every film duration matches its manifest within 0.12 seconds. This checks source/timing integrity, not a frame-rate guarantee.
- All nine scenes opened in the production browser on both Ukrainian and English routes: correct film, ready video, enhanced animation, no horizontal overflow and no console errors.
- Animated layout checked at 320×568, 375×667, 390×844, 768×1024, 844×390, 960×720 and 1280×720. Headings and captions fit their reserved areas. Short landscape remains animated.
- Gallery bounds checked at 320×568, 375×667, 390×844, 768×1024, 844×390, 1280×720 and 1440×900. Device and footer fit a fully aligned section. The five-feature group and FOP selection work in the native mobile section picker; images load.
- Direct chapter links work in production. A paused first video frame uploads immediately instead of waiting for another decoded frame.
- The visible Press state was verified and captured at 1.633 seconds: hand on the actual confirmation control, target outline and pulse, matching external control/phase label.
- Reverse scroll returned to exactly 1,123 px and the same decoded frame time, 1.633333 s, in the confirmation scene.
- Watch and Pause were verified with ordinary pointer clicks; next-action navigation selects the correct native state and control label.
- Reduced motion disposes the video/renderer and exposes all nine manual sequences; restoring full motion creates one video again. No console errors.
- Feedback, roadmap, external downloads and publishing actions were not submitted.

Browser checks use Chromium in the in-app browser. Native source recordings came from the real Dibsly app in iOS Simulator. Physical-device Safari performance was not measured; no claim of universal 60 fps is made.

Actual browser screenshots are saved in `.qa/final-*.png`. Original recordings and PNGs remain in `.qa/capture-sources/`; all QA material is excluded from deployment. Nothing was pushed or published.

## Stable display, reactive world and liquid footer revision

- Replaced the live video texture and chapter dimming with a latched canvas display. Complete source frames blend over 420 ms; seeking and loading keep the last valid frame.
- Regression coverage includes empty-frame filtering, stale source callbacks, late paused callbacks, metadata-only seek readiness, reverse chapter entry and a clamped endpoint that must not issue endless seeks. Total: 21 passing tests.
- A 24-sample browser screenshot stress pass crossed a chapter boundary repeatedly in both directions. All phone crops retained meaningful image variation (minimum channel deviation 34.3/255); no blank phone crop or console error was observed. This is a sampled browser check, not a universal frame-rate claim.
- The phone follows a quintic arc with banking and cursor tilt. The ribbon moves independently and its scrim blends continuously across the center. Cursor checks changed the measured phone position smoothly by about 16 px between opposite sides.
- Actual decoded Press changed the assembly counter from 0 to 1. Screen-space touch coordinates feed ring waves and particle flight. Replaying a press repeats its wave while keeping already assembled particles.
- All 24 bands assemble a persistent D below the narrative. The route ends at the measured footer period. At the final desktop scroll, canvas head (903.24, 572.78) matched the DOM destination center (903.2383, 572.7773). Canvas width now matches CSS client width to prevent a double-dot offset from the scrollbar.
- Enhanced mobile layout checked at 320×568, 390×844 and 844×390, plus 960×720. Titles, captions and the now-visible progress rail fit; no horizontal overflow or console errors.
- New proof files: `.qa/final-wave.png`, `.qa/final-liquid-footer.png`, `.qa/final-mobile-reactive.png`, `.qa/final-mobile-footer.png`; worst-case sampled phone crop: `.qa/motion-stress-lowest.png`.

- All 18 localized scene sources were rechecked with the latched display: each published a valid native frame in enhanced mode. No renderer or hydration errors were observed.
- Initial canvas reveal now waits for a valid image and appears at full brightness; it does not fade the phone through a dark intermediate state.

- On 390×844, the final canvas head (279.66, 669.85) matches the footer period (279.6563, 669.8516), with all 24 particle portions assembled. The motion toggle disposes the video/world, exposes nine manual sequences, and restores one video without errors.
