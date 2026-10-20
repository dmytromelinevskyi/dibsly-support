"""Builds dibslyapp.com's «What Dibsly can do» pages (features-uk.html, features.html) from one list."""
import html, sys

ROOT = sys.argv[1]
L = {
    "uk": dict(page="features-uk.html", other="features.html", other_lang="en", other_label="EN", home="./",
               title="Що вміє Dibsly", h1="Усе, що вміє Dibsly",
               lead="Кожна можливість коротко, з прикладом і з тим, де її знайти в застосунку.",
               free="Безкоштовно", pro="Premium", where="Де", guide="Інструкція", toc="Розділи",
               nav=[("index.html#ask", "Чат"), ("features-uk.html", "Можливості"), ("index.html#price", "Ціна"),
                    ("support-uk.html", "Підтримка")],
               store="Завантажити в App Store", more="Є питання? Напиши: ",
               foot=[("help-uk.html", "Інструкції"), ("support-uk.html", "Підтримка"), ("privacy-uk.html", "Конфіденційність"),
                     ("terms-uk.html", "Умови")], help="help-uk.html", privacy="privacy-uk.html",
               desc="Що вміє Dibsly: рахунки, імпорт банків і Apple Pay, чат з Dibsly, аналітика, план, цілі, інвестиції, сайт і ChatGPT чи Claude."),
    "en": dict(page="features.html", other="features-uk.html", other_lang="uk", other_label="UK", home="en.html",
               title="What Dibsly can do", h1="Everything Dibsly can do",
               lead="Every feature in short, with an example and where to find it in the app.",
               free="Free", pro="Premium", where="Where", guide="Guide", toc="Sections",
               nav=[("en.html#ask", "Chat"), ("features.html", "Features"), ("en.html#price", "Price"),
                    ("support.html", "Support")],
               store="Download on the App Store", more="Questions? Write to ",
               foot=[("help.html", "Guides"), ("support.html", "Support"), ("privacy.html", "Privacy"), ("terms.html", "Terms")],
               help="help.html", privacy="privacy.html",
               desc="What Dibsly can do: accounts, bank imports and Apple Pay, the chat with Dibsly, analytics, plan, goals, investments, the website and ChatGPT or Claude."),
}

# (section id, uk title, en title, [features])
# feature: id, kind (free/pro), uk (h3, text, where), en (h3, text, where), visual, guide anchor
S = [
 ("accounts", "Рахунки", "Accounts", [
  ("all-accounts", "free",
   ("Усі рахунки разом", "Картки різних банків, готівка, накопичення й брокерські рахунки в будь-яких валютах. Зверху «Під рукою»: скільки ти справді можеш витратити зараз, без накопичень та інвестицій.", "Головна"),
   ("All your accounts together", "Cards from different banks, cash, savings and brokerage accounts in any currency. On top, “On hand”: what you can really spend now, without savings and investments.", "Main"),
   ("phone", "main-a"), None),
  ("shared", "pro",
   ("Спільні рахунки", "Рахунок для пари чи сім'ї: видно внески кожного, приходить сповіщення, коли інший щось додає, є спільні цілі. Вистачить Premium в одного з вас.", None),
   ("Shared accounts", "An account for a couple or a family: who put in what, a notification when the other adds something, shared goals. One Premium is enough for both of you.", None),
   ("half", None), "shared"),
 ]),
 ("in", "Як гроші потрапляють у Dibsly", "How money gets into Dibsly", [
  ("banks", "free",
   ("monobank і виписки банків", "monobank напряму за токеном лише для читання. Виписки ПриватБанку, UKRSIBBANK, KredoBank і monobank у PDF, Excel чи CSV. Dibsly читає файл на телефоні, сам розкладає операції по категоріях і впізнає перекази між твоїми рахунками.", "Налаштування → Імпорт та експорт"),
   ("monobank and bank statements", "monobank directly with a read-only token. Statements from PrivatBank, UKRSIBBANK, KredoBank and monobank as PDF, Excel or CSV. Dibsly reads the file on your phone, sorts operations into categories and spots transfers between your own accounts.", "Settings → Import & export"),
   ("phone", "banks"), "statements"),
  ("apple-pay", "free",
   ("Apple Pay записується сам", "Автоматизація в «Командах» передає кожну покупку Apple Pay у Dibsly. Вона чекає чернеткою з сумою, магазином і категорією: глянь і підтверди одним дотиком.", "Головна → Активність"),
   ("Apple Pay records itself", "A Shortcuts automation hands every Apple Pay purchase to Dibsly. It waits as a draft with the amount, the shop and the category: look and confirm with one tap.", "Main → Activity"),
   ("slides", [("main-a", None), ("main-b", "89.6,{dy}")]), "apple-pay"),
  ("notifications", "pro",
   ("Сповіщення будь-якого банку", "На iOS 27 сповіщення банківського застосунку стають чернетками: ШІ читає з них суму, магазин і рахунок.", None),
   ("Notifications from any bank", "On iOS 27 your banking app's notifications become drafts: the AI reads the amount, the shop and the account from them.", None),
   ("phone", "drafts"), "bank-notifications"),
  ("voice", "free",
   ("Скажи голосом", "«Кава 85», «таксі 180 моно», «зарплата 40 000»: Dibsly сам розбере суму, категорію й рахунок. Складні фрази з Premium розбирає ШІ.", "«+» → Сказати"),
   ("Say it", "“Coffee 85”, “taxi 180 mono”, “salary 40,000”: Dibsly works out the amount, the category and the account. With Premium the AI handles the tricky phrases.", "“+” → Say it"),
   ("phone", "voice"), None),
  ("receipt", "free",
   ("Чек і поділ рахунку", "Сфотографуй чек: Dibsly прочитає позиції й розкладе їх по категоріях. Або поділи рахунок: відміть своє, а друзям надішли посилання, щоб кожен вибрав свої позиції. 10 чеків на місяць безкоштовно, до 300 з Premium.", "«+» → Чек"),
   ("Receipts and splitting a bill", "Snap a receipt and Dibsly reads the items and sorts them into categories. Or split the bill: tick your part and send friends a link so each picks theirs. 10 receipts a month free, up to 300 with Premium.", "“+” → Receipt"),
   ("phone", "receipt"), None),
  ("any-bank", "pro",
   ("Будь-який банк через твій ШІ", "Виписку Revolut, Wise чи будь-якого іншого банку дай своєму ChatGPT чи Claude: він прочитає її й запише в Dibsly після твого «так».", None),
   ("Any bank through your own AI", "Give a statement from Revolut, Wise or any other bank to your ChatGPT or Claude: it reads it and adds it to Dibsly once you say yes.", None),
   ("convo", [("me", "Ось виписка Revolut, запиши.", "Here is my Revolut statement, add it."),
              ("ai", "48 операцій, з них 3 перекази між твоїми рахунками. Записати?", "48 operations, 3 of them transfers between your accounts. Add them?")]), "assistants"),
  ("moving", "free",
   ("Переїзд з Monefy", "Експорт Monefy в CSV переноситься з категоріями й рахунками. Перед збереженням Dibsly покаже, що саме додасть.", "Налаштування → Імпорт та експорт"),
   ("Moving from Monefy", "A Monefy CSV export comes over with its categories and accounts. Before saving, Dibsly shows exactly what it will add.", "Settings → Import & export"),
   None, "moving"),
 ]),
 ("chat", "Чат з Dibsly", "Chat with Dibsly", [
  ("ask", "free",
   ("Питай про свої гроші", "«На що пішло найбільше?», «Скільки я витратив на таксі цього року?», «Як там мої цілі?»: Dibsly рахує на телефоні з твоїх даних і відповідає твоїми цифрами, з картками й графіками. 5 питань на місяць безкоштовно, більше з Premium.", "кнопка Dibsly над «+» на Головній"),
   ("Ask about your money", "“What did most of it go on?”, “How much did I spend on taxis this year?”, “How are my goals?”: Dibsly works it out on your phone from your data and answers in your own figures, with cards and charts. 5 questions a month free, more with Premium.", "the Dibsly button above “+” on Main"),
   ("phone", "chat"), None),
  ("changes", "free",
   ("Змінює тільки після «Зберегти»", "«Запиши каву 85», «перенеси поїздки Uber у Таксі», «перейменуй рахунок»: Dibsly покаже картку зі змінами, а запише лише після твого «Зберегти». Кожну зміну можна скасувати.", None),
   ("Changes only after Save", "“Add a coffee, 85”, “move my Uber rides to Taxi”, “rename the account”: Dibsly shows a card with the change and writes it only after you tap Save. Every change can be undone.", None),
   ("convo", [("me", "Запиши каву 85", "Add a coffee, 85"),
              ("ai", "Кава, 85 ₴, Кафе й ресторани. Зберегти?", "Coffee, ₴85, Cafés. Save it?")]), None),
  ("chat-import", "free",
   ("Виписка просто в чат", "Натисни скріпку й вибери файл виписки чи звіту брокера: Dibsly прочитає його на телефоні, без ШІ, і запропонує імпорт у потрібний рахунок.", "чат → скріпка"),
   ("A statement right in the chat", "Tap the paperclip and pick a statement or a broker report: Dibsly reads it on your phone, without the AI, and offers to import it into the right account.", "chat → paperclip"),
   None, None),
 ]),
 ("analytics", "Аналітика", "Analytics", [
  ("where", "free",
   ("Куди йдуть гроші", "Категорії: де найбільше і що вже понад план. Грошовий потік: витрати по днях і зарплата позначкою. Тренди: місяці року поруч. Капітал: накопичення й інвестиції за рік, окремо від поповнень.", "вкладка Аналітика"),
   ("Where the money goes", "Categories: where most of it goes and what is over plan. Cash flow: spending day by day with payday marked. Trends: the months side by side. Capital: savings and investments over the year, apart from deposits.", "the Analytics tab"),
   ("slides", [("an-1", "16.2,22.4"), ("an-2", "38.6,22.4"), ("an-3", "61.2,22.4"), ("an-4", "83.6,22.4")]), None),
  ("brands", "free",
   ("Бренди", "Понад 400 брендів з логотипами: Сільпо, ОККО, Uklon чи Ryanair Dibsly впізнає сам. Вибери категорію для бренду, і всі його покупки підуть туди.", None),
   ("Brands", "Over 400 brands with their logos: Dibsly recognises Silpo, OKKO, Uklon or Ryanair by itself. Pick a category for a brand and all its purchases go there.", None),
   ("phone", "brands"), "brands"),
 ]),
 ("plan", "План, календар і цілі", "Plan, calendar and goals", [
  ("monthly-plan", "free",
   ("План місяця", "Ліміти на категорії й скільки ще можна витратити до кінця місяця. Dibsly підсвітить категорії понад план і ті, що в зоні ризику.", "Головна → План"),
   ("Monthly plan", "Limits per category and how much is left to spend this month. Dibsly highlights the categories over plan and those at risk.", "Main → Plan"),
   ("crop", "plan"), None),
  ("calendar", "free",
   ("Календар платежів", "Оренда, підписки, кредити й зарплата в календарі. Dibsly скаже, скільки має бути на кожному рахунку до дня списання.", "Головна → Календар"),
   ("Bill calendar", "Rent, subscriptions, loans and salary on a calendar. Dibsly tells you how much each account needs before the day it is charged.", "Main → Calendar"),
   ("crop", "calendar"), None),
  ("goals", "free",
   ("Цілі", "Авто, квартира чи подушка. Накопичення й інвестиції йдуть у ціль, а Dibsly каже, в якому місяці ти її досягнеш у такому темпі.", "Головна → Цілі"),
   ("Goals", "A car, a flat or a safety cushion. Savings and investments count toward the goal, and Dibsly tells you the month you reach it at your pace.", "Main → Goals"),
   ("crop", "goals"), None),
 ]),
 ("investments", "Інвестиції", "Investments", [
  ("portfolio", "free",
   ("Портфель і дивіденди", "Звіти Interactive Brokers і Freedom Finance замість ручного введення. Історія вартості за місяць, рік чи весь час, дивіденди разом з утриманим податком і ріст окремо від поповнень, щоб депозит не виглядав прибутком.", "вкладка Інвестиції"),
   ("Portfolio and dividends", "Interactive Brokers and Freedom Finance reports instead of typing. Value history over a month, a year or all time, dividends with the tax withheld, and growth apart from deposits so a deposit never looks like profit.", "the Investments tab"),
   ("slides", [("inv-1", "16.6,44.5"), ("inv-2", "33.1,44.5"), ("inv-3", "66.2,44.5"), ("inv-4", "82.8,44.5")]), "investments"),
 ]),
 ("everywhere", "Скрізь", "Everywhere", [
  ("website", "pro",
   ("Сайт my.dibslyapp.com", "Ті самі дані на великому екрані: історія з пошуком, аналітика, план, календар і чернетки. Зміни одразу з'являються на телефоні.", None),
   ("my.dibslyapp.com", "The same data on a big screen: history with search, analytics, the plan, the calendar and drafts. Changes show up on your phone at once.", None),
   ("browser", None), "website"),
  ("assistants", "pro",
   ("Dibsly у твоєму ChatGPT чи Claude", "Підключи Dibsly як конектор: питай про гроші, імпортуй виписки й став цілі просто у своєму асистенті. Записує тільки після твого «так», а кожну зміну видно в журналі, звідки її можна скасувати.", None),
   ("Dibsly in your ChatGPT or Claude", "Connect Dibsly as a connector: ask about your money, import statements and set goals right in your assistant. Nothing is written until you say yes, and every change is in a journal where it can be undone.", None),
   ("convo", [("me", "Постав ціль: відпустка, 2 000 $ до липня.", "Set a goal: a holiday, $2,000 by July."),
              ("ai", "Готово, ціль «Відпустка». Відкладай 250 $ на місяць, і встигнеш.", "Done, the goal “Holiday”. Put aside $250 a month and you will make it.")]), "assistants"),
  ("sync", "pro",
   ("Акаунт і синхронізація", "Увійди через Apple, Google чи пошту, і дані будуть однакові на всіх твоїх iPhone і на сайті.", "Головна → профіль"),
   ("Account and sync", "Sign in with Apple, Google or e-mail and your data is the same on all your iPhones and on the website.", "Main → profile"),
   None, None),
  ("backups", "free",
   ("Резервні копії", "Зашифровані копії в твоєму iCloud Drive чи Google Drive. Новий iPhone чи перевстановлення: відновиш усе з копії.", "Налаштування → Резервна копія"),
   ("Backups", "Encrypted backups in your iCloud Drive or Google Drive. A new iPhone or a reinstall: restore everything from a backup.", "Settings → Backup"),
   None, "backup"),
 ]),
]
PRIVACY = ("privacy", "Приватність", "Privacy", [
  (("Без паролів від банку", "Dibsly не просить пароль і не може переказати гроші. Токен monobank дає доступ лише до виписки."),
   ("No bank passwords", "Dibsly never asks for a password and cannot move money. A monobank token only reads the statement.")),
  (("ШІ тільки з дозволом", "Перед першим використанням Dibsly покаже, що саме надсилає ШІ й кому. Без дозволу все інше працює, а змінити рішення можна в Налаштуваннях."),
   ("AI only with your permission", "Before first use Dibsly shows what it sends to the AI and to whom. Without permission everything else works, and you can change your mind in Settings.")),
  (("Без реклами", "Без реклами й рекламних трекерів. Без акаунта всі дані лежать лише на твоєму iPhone і в твоїх копіях."),
   ("No ads", "No ads and no ad trackers. Without an account all your data stays on your iPhone and in your own backups.")),
])

e = html.escape


def visual(v, lang, alt):
    if not v:
        return ""
    kind, data = v
    if kind == "phone":
        return f'<div class="fvisual"><div class="phone"><img src="v2/shots/{lang}-{data}.jpg" alt="{e(alt)}" width="750" height="1631" loading="lazy"></div></div>'
    if kind == "slides":
        dy = "68.9" if lang == "uk" else "71.1"
        imgs = []
        for k, (name, tap) in enumerate(data):
            cls = ' class="on"' if k == 0 else ""
            t = f' data-tap="{tap.format(dy=dy)}"' if tap else ""
            imgs.append(f'<img{cls}{t} src="v2/shots/{lang}-{name}.jpg" alt="{e(alt) if k == 0 else ""}" width="750" height="1631" loading="lazy">')
        return ('<div class="fvisual"><div class="phone"><div class="slides" data-hold="1700">' + "".join(imgs) +
                '<span class="tap" aria-hidden="true"></span></div></div></div>')
    if kind == "crop":
        h = {"plan": 780, "calendar": 1365, "goals": 1725}[data]
        return f'<div class="fvisual wide"><div class="fcrop"><img src="v2/shots/{lang}-{data}.jpg" alt="{e(alt)}" width="1206" height="{h}" loading="lazy"></div></div>'
    if kind == "browser":
        return (f'<div class="fvisual wide"><figure class="browser"><div class="browser-bar" aria-hidden="true"><span></span><span></span><span></span>'
                f'<p>my.dibslyapp.com</p></div><img src="img/shots/{lang}-web.jpg" alt="{e(alt)}" width="1440" height="900" loading="lazy"></figure></div>')
    if kind == "convo":
        lines = "".join(f'<p class="{who}">{e(uk if lang == "uk" else en)}</p>' for who, uk, en in data)
        return f'<div class="fvisual"><div class="convo" aria-hidden="true">{lines}</div></div>'
    if kind == "half":
        a, b = ("О", "Д") if lang == "uk" else ("O", "D")
        s = "10 700 ₴" if lang == "uk" else "₴10,700"
        return (f'<div class="fvisual"><div class="halfcard" aria-hidden="true"><p class="big">50 / 50</p><div class="half">'
                f'<div><span class="who">{a}</span><i></i>{s}</div><div><span class="who">{b}</span><i></i>{s}</div></div></div></div>')
    raise ValueError(kind)


def build(lang):
    t = L[lang]
    toc, body = [], []
    for sid, uk, en, features in S + [PRIVACY]:
        title = uk if lang == "uk" else en
        toc.append(f'<a href="#{sid}">{e(title)}</a>')
        if sid == "privacy":
            cards = "".join(f'<article class="pcard reveal"><h3>{e(x[0])}</h3><p>{e(x[1])}</p></article>'
                            for x in ((u if lang == "uk" else n) for u, n in features))
            body.append(f'<section class="fsection" id="{sid}"><h2>{e(title)}</h2><div class="pgrid">{cards}</div>'
                        f'<p class="pmore"><a href="{t["privacy"]}">{"Політика конфіденційності" if lang == "uk" else "Privacy policy"}</a></p></section>')
            continue
        items = []
        for fid, kind, ukf, enf, vis, guide in features:
            h3, text, where = ukf if lang == "uk" else enf
            v = visual(vis, lang, h3)
            cls = "feature reveal" + (" textonly" if not v else "") + (" widevis" if v and 'class="fvisual wide"' in v else "")
            tag = f'<p class="kind{" pro" if kind == "pro" else ""}">{t["pro"] if kind == "pro" else t["free"]}</p>'
            w = f'<p class="try"><b>{t["where"]}:</b> {e(where)}</p>' if where else ""
            g = f'<p class="fguide"><a href="{t["help"]}#{guide}">{t["guide"]}</a></p>' if guide else ""
            items.append(f'<article class="{cls}" id="{fid}"><div class="ftext">{tag}<h3>{e(h3)}</h3><p class="desc">{e(text)}</p>{w}{g}</div>{v}</article>')
        body.append(f'<section class="fsection" id="{sid}"><h2>{e(title)}</h2>' + "".join(items) + "</section>")
    nav = "".join(f'<a href="{h}">{e(x)}</a>' for h, x in t["nav"])
    foot = "".join(f'<a href="{h}">{e(x)}</a>' for h, x in t["foot"])
    page = f'''<!doctype html>
<html lang="{lang}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{e(t["title"])} · Dibsly</title>
    <meta name="description" content="{e(t["desc"])}">
    <meta name="theme-color" content="#F7F3EE">
    <meta property="og:title" content="{e(t["title"])}">
    <meta property="og:description" content="{e(t["desc"])}">
    <meta property="og:image" content="https://dibslyapp.com/img/shots/{lang}-web.jpg">
    <link rel="alternate" hreflang="uk" href="https://dibslyapp.com/features-uk.html">
    <link rel="alternate" hreflang="en" href="https://dibslyapp.com/features.html">
    <link rel="icon" type="image/png" href="img/favicon.png">
    <link rel="apple-touch-icon" href="img/apple-touch-icon.png">
    <link rel="stylesheet" href="v2/v2.css">
    <link rel="stylesheet" href="v2/features.css">
    <script>
        document.documentElement.classList.add("js");
        try {{ if (localStorage.getItem("dibsly.site.theme") === "dark") document.documentElement.dataset.theme = "dark"; }} catch (error) {{}}
    </script>
</head>
<body>
    <header class="nav">
        <div class="wrap">
            <a class="brand" href="{t["home"]}"><img src="img/apple-touch-icon.png" alt="" width="30" height="30">Dibsly</a>
            <nav class="nav-links" aria-label="{t["toc"]}">{nav}</nav>
            <a class="lang" href="{t["other"]}" hreflang="{t["other_lang"]}" onclick="try {{ localStorage.setItem('dibsly.site.lang', '{t["other_lang"]}'); }} catch (error) {{}}">{t["other_label"]}</a>
            <button class="theme" type="button" aria-label="{"Темна чи світла тема" if lang == "uk" else "Dark or light theme"}">◐</button>
            <a class="button primary small" href="https://apps.apple.com/app/id6765870838">App Store</a>
        </div>
    </header>
    <main>
        <section class="fhero">
            <div class="wrap">
                <div>
                    <h1>{e(t["h1"])}</h1>
                    <p class="lead">{e(t["lead"])}</p>
                </div>
                <div class="mascot" data-play="hello" data-then="idle" aria-hidden="true">
                    <picture class="mascot-still"><img class="light-only" src="img/dibsly.png" alt="" width="404" height="386"><img class="dark-only" src="img/dibsly-dark.png" alt="" width="404" height="386"></picture>
                    <div class="mascot-stage"></div>
                </div>
            </div>
        </section>
        <div class="wrap fgrid">
            <nav class="toc" aria-label="{t["toc"]}">{"".join(toc)}</nav>
            <div class="flist">
{chr(10).join(body)}
                <div class="fend">
                    <a class="button primary" href="https://apps.apple.com/app/id6765870838">{e(t["store"])}</a>
                    <p>{e(t["more"])}<a href="mailto:dibslysupport@gmail.com">dibslysupport@gmail.com</a></p>
                </div>
            </div>
        </div>
    </main>
    <footer>
        <div class="wrap">
            <nav aria-label="Links">{foot}<a href="https://my.dibslyapp.com">my.dibslyapp.com</a></nav>
            <p>© 2026 Dibsly</p>
        </div>
    </footer>
    <script>
        window.DIBSLY_ASSETS = "v2/";
        window.DIBSLY_IMAGES = "img/";
    </script>
    <script src="js/lottie_light.min.js" defer></script>
    <script src="v2/v2.js" defer></script>
</body>
</html>
'''
    assert "—" not in page.replace("&#x27;", ""), "em dash"
    open(f"{ROOT}/{t['page']}", "w").write(page)
    print(t["page"], len(page))


for lang in ("uk", "en"):
    build(lang)
