# Landing scenes (dibslyapp.com, v3)

The hero's phone on `index.html` shows real Dibsly screens (`v3/scenes/*.jpg`) and Main's long strip
(`v3/shots/<lang>-main-long.jpg`), all captured from a Debug simulator build of the app's demo ledger
(`ScreenshotShowcase`, `DIBSLY_SCREENSHOT_SCENE` / `DIBSLY_SCREENSHOT_LANGUAGE`). The scene timeline itself is in
`v3/v3.js` (`journey(screen)`: frames, fade / cut / push / sheet, `tap()` with the finger, `mark()`, banner, toast).

- `shoot.sh <scene> <uk|en> <out.png>` — fresh install on «Dibsly — Clean» (the only simulator that may be erased),
  dark mode, 9:41, one screenshot. Build first in the app repo:
  `xcodebuild -project Dibsly.xcodeproj -scheme Dibsly -destination 'generic/platform=iOS Simulator' -derivedDataPath DerivedData build`.
- Main's long strip: scroll Main on the simulator in steps, save `<prefix>-00.png`, `-01.png`…, then
  `python3 stitch.py <frames…>` prints the overlap shifts (`DS …`), and
  `BOT=2090 ./build_strip.sh <dir> <prefix> <full.jpg> <strip.jpg> <shifts…>` stacks them (BOT cuts above Dibsly's
  button, which the page draws live).
- JPEGs go to `v3/scenes/` / `v3/shots/`; deploy with `npx wrangler deploy`, then commit and push `main`.
