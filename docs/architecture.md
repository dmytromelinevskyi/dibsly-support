# React application architecture

React 19 and Vite 8 provide route-level loading and prerender all 13 public routes. Three.js is loaded only for the cinematic landing. The existing Worker still handles domain routing, short receipts and API forwarding; it is not bundled into browser code.

`ScrollCinema` owns semantic chapters, controls and fallback markup. Its lazy runtime owns one orthographic scene, physical phone, studio ribbon, lights and screen texture. React updates only at chapter changes. Continuous motion updates transforms and uniforms directly.

`film-player.js` owns one muted inline video and a generation counter for source changes. It publishes only complete decoded frames. A new chapter starts at its scroll-corresponding time, including reverse entry; stale callbacks cannot publish into a different source. Seeks are serialized and native touch remains native.

`screen-presenter.js` latches the last meaningful decoded image into a persistent canvas texture. Loading, seeking and empty native loader frames never clear that canvas. A source change freezes the outgoing canvas and blends to the incoming source over 420 ms; ordinary frames do not restart the blend. Captions and the hand use committed frame time. This replaces the live VideoTexture and deliberate screen dimming that caused visible flashing.

`film-timeline.js` supplies a quintic travel curve with zero velocity and acceleration at both ends. The phone follows a lifted arc with banking, depth and restrained cursor tilt. The ribbon's scrim changes continuously as the phone crosses the center; it never switches sides in one frame.

`reaction-field.js` assigns one permanent particle band to each native action. Presses launch from the transformed phone-screen point, emit rings, brighten the caption and assemble a sculptural D. The formation remains through gallery, pricing, FAQ and footer. Points use one GPU draw; wave meshes are pooled. Desktop renders ambient motion continuously; mobile drops idle ambient rendering to 30 Hz while interaction and video remain responsive. Background tabs suspend the loop.

`journey-path.js` builds a document-space path ending at the measured footer period. `journey-line.js` paints only visible segments and merges the moving head into that destination through a fluid connecting shape. Canvas dimensions use CSS client width, including correct scrollbar handling. Resize and font readiness remeasure the destination.

`scroll-driver.js` adapts Ramka's analytic critically damped wheel controller. Direction reversal cancels forward velocity. Native touch, keyboard, scrollbar and nested controls take over immediately. The document position is also the scene position, avoiding camera lag behind content.

Mobile fitting uses actual heading and caption heights. Short landscape layouts keep animation and place text beside the phone. No viewport width or height automatically disables animation. Reduced motion, unavailable video and WebGL failure provide manual native screenshots. One shared DOM iPhone frame serves the gallery and fallback.

The fixed WebGL world lives outside the narrative stacking context so the assembled background continues through the page. Only the demonstration phone leaves when its narrative ends. Ambient motion stops in hidden tabs; reduced motion provides the static sequence instead.

All GPU resources, video callbacks, event listeners and observers are disposed. Pixel ratio is capped at 1.35 on mobile and 1.6 on desktop. There is no decoded bitmap LRU or second scroll library. Particle positions animate in the vertex shader.

The gallery has one persistent device, a selected native image and deliberate transitions. All controls fit the viewport; there is no modal or nested horizontal scroller. Structured document content, feedback, roadmap controls and the isolated receipt model retain their existing behavior and URLs.
