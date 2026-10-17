# Dibsly Support

Public pages for Dibsly: the landing page, support, privacy and terms, and the split-the-bill page friends open from a
shared receipt.

**The landing page (1.0, 2026-10-17, owner: «лендинг уже можешь ебануть версию 1.0, задеплоить, на ее основе правки»):**
`index.html` (Ukrainian) and `en.html` (English), styled by `landing.css`; the App Store screenshots in `img/shots/`
(made from the app's showcase data by `make screenshots`). A first visit from a browser that speaks neither Ukrainian
nor Russian goes to `en.html`; the UK / EN switch is kept in the browser. The former support page is `support.html`
(its “no account, no server” lines updated for 1.1); privacy and terms link to it.

**Landing 1.1 (2026-10-17, owner: «нам надо на лендинге показать наш функционал, а также почему выбрать именно нас»):**
rebuilt after a look at the Ukrainian trackers. Order: hero (all your money in one place), what it works with (banks,
cards, brokers, Monefy), why Dibsly (not only monobank, investments, mostly free, data stays yours, together, moving
from Monefy), how it works in three steps, investing, together, the website, moving from Monefy, Free / Premium,
questions. No competitor is named except Monefy, the one Dibsly imports from.

**Landing 1.2 (2026-10-17, owner, block by block: «надо продавать подписку»):** Premium gets its own section (the
website in a browser frame, ChatGPT / Claude with a sample conversation, shared accounts, bank notifications) right
after How it works; paid features carry a small Premium tag; Interactive Brokers before Freedom Finance; Monefy only in
Free and one question; new 1.1 screenshots (Main, Analytics, Trends, Capital, Goals, Investments, a draft) from
`scripts/screenshots/capture.sh` scenes `main analytics trends capital goals invest drafts`, and `img/shots/*-web.jpg`
from the local portal (dev data, test names replaced on the page before the capture). Prices stay $1.99 / $19.99 until
App Store Connect changes them.

Since 2026-10-10 the same files are also served at **<https://dibslyapp.com>** by the Cloudflare Worker `dibsly-site`
(`worker.js`, `wrangler.toml`; deploy with `npx wrangler deploy` on the owner's word), which also opens short split
links `dibslyapp.com/s/<code>`: the bill is kept 30 days by Dibsly's server (`dibsly-sync`, service binding) and put
into `split.html`. GitHub Pages keeps serving older links.

**Two policies while 1.0 is in review (owner, 2026-10-12):** GitHub Pages serves `main` — the policy 1.0 links to —
and stays as it is. dibslyapp.com, which 1.1 links to, is deployed from the branch `dibslyapp-1.1` (the 1.1 policy:
AI assistants, the account's language). Merge the branch into `main` once 1.1 is out.

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
