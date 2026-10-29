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

## English frames (`en.html`)

`en.html` plays the same timeline on `v3/scenes/en-*.jpg` and `v3/shots/en-main-long.jpg` (the strip is there; the
13 frames are still to be shot with `shoot.sh <scene> en`): `en-a-main`, `en-a-after`, `en-b-plus`, `en-b-form`,
`en-b-8`, `en-b-85`, `en-b-cats`, `en-b-after`, `en-c-chat`, `en-c-plan`, `en-c-goals`, `en-c-invest`, `en-c-fop`
(750 × 1631, like the Ukrainian ones). The taps and highlights in `v3/v3.js` are the same points for both languages, so
the English screens need the same layout. What the page draws over them in English: the banner
«Lidl · −$42.13 from Chase» (the first purchase in Activity on the English strip), «+» → 8, 5 → «Cafés», and the toast
«Expense saved · Cafés · −$85»; change those lines in `en.html` if the frames show something else.

## The steps and their frames (2026-10-29, task 13; task 16 took History out)

01 «Записується саме» (`a-main`, `a-after`), 02 «+» (`b-*`), 03 the chat (`c-chat-top` rises as a sheet, scrolls to
`c-chat`), 04 analytics (`d-analytics`, `d-cashflow`, `d-trends`, `d-capital`), 05 the calendar (`h-calendar`,
`h-calendar-list`, the `h-payment` sheet), 06 plan and goals (`c-plan`, `c-goals`), 07 money together (`i-savings`,
scrolling to `i-savings-accounts`), 08 debts and credits (Main's strip, then `f-main-money`, `f-debt`, back,
`f-credits`), 09 investments (`c-invest`), 10 FOP (`c-fop`). A scroll between two captures of one screen moves by the
distance between them (measured on the frames); what sits elsewhere on the English frames is in `spot` in `v3/v3.js`
(the rest is the same for both).
