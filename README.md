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
from the local portal (dev data, test names replaced on the page before the capture). Prices: $2.99 / $29.99 since
2026-10-20 (owner; App Store Connect changed the same night, before 1.0.1's submission). The terms name no figure.

**Landing 1.3 (2026-10-17, owner: «забыл про то, что раньше было», «блоки выровнены плохо», «вау-эффекты», «больше маскота»):**
Analytics as a sticky phone whose screen follows the text (Categories, Cash flow, Trends, Capital), Plan / Calendar /
Goals, voice in How it works, Money together's cards one height with the shares drawn; Dibsly animated with the app's
own Lottie files (`img/mascot/*-light|dark.json`, copied from `App/Dibsly/Resources/Mascot`, played by
`js/lottie_light.min.js`, lottie-web 5.12.2, MIT, licence in `js/`) only while on screen; the chat types itself and the
website's frame unfolds on scroll. `js/landing.js` holds all of it; “reduce motion” shows everything still. New scenes
`cashflow plan calendar voice receipt`.

**Landing 2.0 preview (2026-10-20, owner: «давай попробуем»; the page looked too much like midni.finance):**
`v2/index.html` (uk) and `v2/en.html`, `v2/v2.css`, `v2/v2.js`, at https://dibslyapp.com/v2/ (noindex) until the owner
approves it; then it replaces the landing. Built around Dibsly and the chat: the hero is a scripted conversation with
Dibsly on the demo figures (`window.DIBSLY_CHAT` in each page; no AI is asked), with his mood changing per answer
(Lottie: the landing's `img/mascot` plus `v2/mascot` copied from the app); three loops recorded in the app on the demo
ledger (`v2/media/{uk,en}-{drafts,analytics,invest}.mp4`, `simctl io recordVideo`, ffmpeg H.264 600 px) play while on
screen; the analytics labels light up with the video's time; light theme by default, dark on the toggle (kept in the
browser); reduced motion shows everything still. **Smoothed the same night (owner: «некоторые анимации слишком дерганые, а некоторые
наоборот слишком сильно тормозят»):** the loops re-cut at 60 fps with every frame of motion kept, still stretches
shortened to 1-1.9 s and the app's instant tab switches crossfaded (0.28 s); Dibsly's moods fetched once and drawn in
a new layer that fades over the old one (no blink), the «wait» pose dropped (lottie_light drew it with NaN
transforms); the chat answers sooner (0.65 s of «•••», faster typing); sections rise 16 px in 0.55 s. **Then no videos at all (owner's screen recording: the
drafts loop jumped — Main re-lays itself out after each save — the portfolio chart stuttered, and the tile shots were
blurry):** each phone is a stack of full-resolution screenshots from «Dibsly — Clean» (`v2/shots/{uk,en}-*.jpg`, 750
px wide; the plan, calendar and goals tiles cropped from 1206 px captures) that crossfade in 0.45 s while on screen;
a touch mark shows where the tap was before the screen changes (`data-tap` = x,y in %), and the analytics labels follow
the slide (`data-slide`).

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

**Ukrainian pages (2026-10-17, owner: «а укр версия?», «support тоже перевести»):** `privacy-uk.html` and
`terms-uk.html` are generated from `PRIVACY.uk.md` / `TERMS.uk.md` in the app repository (the English pages from
`PRIVACY.md` / `TERMS.md`; the English ones bind); `support-uk.html` is the support page in Ukrainian, `support.html`
updated for 1.1 (Premium: sync, the website, assistants, shared accounts). Every page has an EN / UK switch; the
Ukrainian landing links to the Ukrainian pages; the app opens the Ukrainian policy and support for Ukrainian and Russian.

**Guide (2026-10-17, owner: «хуярь страницу инструкций»):** `help-uk.html` and `help.html` — first steps, Apple Pay and
bank notifications through Shortcuts (the owner's Shortcuts screenshots in `img/help/`), statements and monobank,
investing, moving from Monefy, shared accounts, the website, ChatGPT and Claude, backups, Premium. Linked from the
landing's menu and help card, the support pages and the app's Help (“Guide on the website”).

