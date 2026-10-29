# Native animation and feature audit — 2026-10-29

## Sources

The visual direction follows [Lusion About](https://lusion.co/about): a spatial field, large typography and a continuous scroll narrative. The UI in the phone comes from Dibsly, not a redraw of an imaginary app.

Captured Dibsly iOS 1.0.2 from base commit `5c497b974511d7ee9a37378f14711e219b8a7be6`, using Xcode 26.5 and a dedicated iPhone 17 Pro simulator on iOS 26.5. Its name is **Dibsly Landing Capture**. The original iOS checkout and existing devices were untouched. A temporary clone needed a mechanical decomposition of a large SwiftUI expression for the compiler; the app behaviour and layout were preserved.

The app's own debug showcase seeded fictitious transactions, accounts, budgets, goals and local assistant cards. The Ukrainian ledger uses Ukrainian banks and UAH; the English ledger was recreated separately with Revolut, Chase, Wells Fargo and USD. English FOP intentionally uses the Ukrainian ledger because FOP is a Ukrainian feature. The status bar is 09:41, full battery, dark appearance. The source recorder contains debug touches; the site adds a larger, precisely positioned hand and target outline for clarity.

There are **18 recorded feature paths**, **44 full native showcase screens**, and **1,380 unique published narrative frames**, including the two hero posters. `content/captures/` preserves provenance, native timing and action captions. The original 18 recordings, 44 source PNGs and event files are preserved locally in `.qa/capture-sources/` (ignored by Git and excluded from the public build). Optimized WebP frames and screen-library images live in `public/assets/cinema/`.

Capture helpers: `scripts/capture/launch.py`, `record.py`, `showcase.py`. They target only the task-owned disposable simulator. It is now shut down. `process.mjs` extracts native frames at 24 fps, drops inactive duplicates and keeps complete ending states. `publish.mjs` generates the public manifest and screen library. Set `DIBSLY_CAPTURE_DIR` to use a different source archive.

## Nine stories

| Story | Trigger and intermediate action | Result shown |
|---|---|---|
| Automatic recording | Main → confirm the pending Silpo/Lidl purchase | Purchase removed from pending Activity; account balance and month update; saved confirmation |
| Quick entry | Orange plus → Operation → 85 → category picker → Eating out → Save | Native keypad, category list, account preview, then saved expense and updated balance |
| Ask Dibsly | Dibsly button → seeded local conversation → confirm the proposed coffee expense | Real tool card, saved state and Undo; changes require confirmation |
| Plan | Main's plan → Eating out → use actual spending → Save | Native budget editor, new limit and recalculated remaining budget |
| Investments | Portfolio → dividends → a BIL dividend | Real portfolio total, dividend history, broker account, withheld tax and fee fields |
| Debts | Debt list → Sasha → Paid back → receiving account | The agreement, previous repayments, repayment form and account selection; no repayment is claimed before Save |
| FOP | Open Q3 detail → next quarter | Income, tax, declaration figures and deadlines change together |
| Analytics | Visible Analytics overview → Groceries → View transactions | Category share, limit and the exact filtered purchases behind the total |
| Together | Shared holiday account → settings → back | Both contributions, participant, sharing rules and the common transaction history |

The source app's demo portfolio currently has no historical-price series. The narrative therefore shows its actual dividend workflow rather than a fabricated chart. Chat answers and proposals are seeded locally by Dibsly's own tools; recording the demo makes no AI request. Native FOP views can show the app's missing-NBU-rate notice for a demo income; it is retained as part of the actual app state.

## Final motion implementation

The original frame-flipping playback and particle field were replaced. Eighteen H.264 films are authored from the original continuous recordings. `content/cinema/edits.mjs` records the visible native trigger, normalized target rectangle and exact source-frame range for every action. `scripts/capture/build-films.mjs` keeps the original frames within transitions, removes idle recording gaps and adds explicit holds. Each beat uses 1.4 s focus, 0.45 s press, native motion at 1/1.3 speed and 1.5 s result. All films have a final 1.1 s hold, 30 fps, six-frame keyframes and fast-start metadata.

Invisible/offscreen triggers are excluded: FOP starts on the actual quarter detail; Analytics starts on its actual overview. The Plan editor now holds the unchanged limit before highlighting Use; the new limit appears only after that press. The English Together recording requires accurate output seeking because its sparse input keyframes can return no frames; the builder retries that way and rejects empty native intervals.

The scene uses one video texture, one physical iPhone and a large shaded metal ribbon. A white hand approaches the outlined native target, pulses at the press and disappears during the transition. External control name, step and phase follow the displayed video time. Stories have Watch/Pause and previous/next action controls. Complete native images blend at chapter boundaries; screen dimming and the live video texture were removed. Phone travel uses quintic easing, a lifted arc, banking and cursor tilt.

The ribbon moves continuously and its shape, parallax and light respond to the pointer. Actual presses emit pooled ring waves and assemble a persistent particle D. The route ends in the measured footer period through a fluid merge. A scrim behind the phone protects text contrast; mobile lowers its contrast further. A fine continuous route is drawn across the whole document. Wheel damping comes from Ramka, with no second camera lag. Native touch remains native.

Animation is enabled at all viewport sizes. Portrait phone fitting uses the measured free area between title and caption. Short landscape uses a side-by-side composition. Only reduced motion or an unavailable renderer/video activates the manual sequence. The gallery is one persistent iPhone with grouped feature choices and a native section picker on mobile. No horizontal scroller or screenshot modal remains.

The 18 movies and 44 native showcase screens are portable production assets. The original frame manifest and WebPs remain available for reproducible edits. The local MP4/PNG source archive remains outside deployment.
