# Dibsly Support

Public support, privacy and terms pages for Dibsly for iOS, and the split-the-bill page friends open from a shared receipt.

- Support: <https://dmytromelinevskyi.github.io/dibsly-support/>
- Privacy Policy: <https://dmytromelinevskyi.github.io/dibsly-support/privacy.html>
- Terms of Use: <https://dmytromelinevskyi.github.io/dibsly-support/terms.html>

`privacy.html` and `terms.html` carry the text of `PRIVACY.md` and `TERMS.md` in the Dibsly app repository; change
those first and keep the pages word for word in step. `styles.css` serves the support, privacy and terms pages;
`split.html` has its own inline styles. `img/` holds the app icon and Dibsly (the idle pose, light and dark). `img/split-card.png` (1200×630) is the card messengers show under a split
link (`og:image` in `split.html`); the bill stays in the link's `#` part.

## Sample statement

`samples/monobank-sample.csv` — a monobank CSV statement with invented data (no real person, card or bank
account), for App Review to try statement import and “Sort with AI”.

## App config

`app-config.json` — read by Dibsly when it comes to the front. `minimumVersion` is the oldest version that still
works: a lower installed version shows a required “Update” window without Close. Keep it `0.0`; raise it only when old
versions break (for example after a change of the AI relay), and lower it back once fixed.
