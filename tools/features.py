"""Builds dibslyapp.com's «What Dibsly can do» pages (features-uk.html, features.html) from one list."""
import html, json, os, sys

sys.dont_write_bytecode = True
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pages import CSS, JS, footer, nav, newtab  # the header and the footer, one copy for every page (tools/pages.py)

ROOT = sys.argv[1]
L = {
    "uk": dict(page="features-uk.html",
               title="Що вміє Dibsly", h1="Усе, що вміє Dibsly",
               lead="Ідеї, на яких стоїть Dibsly, і кожна можливість коротко: з прикладом і з тим, де її знайти в застосунку.",
               free="Безкоштовно", pro="Premium", where="Де", guide="Інструкція", toc="Розділи", more_link="Докладніше",
               want="Хочу це", next="Що далі",
               next_intro="Що ми робимо зараз і що буде потім. Дат не обіцяємо: робимо, поки не стане добре. Натисни «Хочу це» на тому, що тобі потрібно найбільше, і ми знатимемо, з чого почати.",
               form=dict(title="Чого тобі не вистачає?", lead="Розкажи, а ми подумаємо, як зробити це круто.",
                         placeholder="Наприклад: хочу бачити, скільки за рік пішло на дітей", email="Пошта, якщо хочеш відповідь",
                         send="Надіслати", thanks="Дякую! Записали, команда подумає.",
                         failed="Не вийшло надіслати. Спробуй ще раз або напиши на dibslysupport@gmail.com.",
                         later="Забагато повідомлень за годину. Спробуй трохи пізніше.",
                         email_bad="Схоже, в пошті помилка. Перевір її або залиш поле порожнім.",
                         note="Текст і пошту бачить лише команда Dibsly.", privacy="Конфіденційність"),
               kicker="Можливості",
               store="Завантажити в App Store", more="Є питання? Напиши: ",
               help="help-uk.html", privacy="privacy-uk.html",
               desc="Що вміє Dibsly і навіщо: кармани, що таке дохід і витрата, рахунки, імпорт банків і Apple Pay, чат з Dibsly, аналітика, план, цілі, борги, кредити, ФОП, інвестиції, сайт і ChatGPT чи Claude."),
    "en": dict(page="features.html",
               title="What Dibsly can do", h1="Everything Dibsly can do",
               lead="The ideas Dibsly stands on, and every feature in short: with an example and where to find it in the app.",
               free="Free", pro="Premium", where="Where", guide="Guide", toc="Sections", more_link="More",
               want="I want this", next="What's next",
               next_intro="What we're building now and what comes later. No dates promised: we build until it's good. Tap “I want this” on what you need most, and we'll know where to start.",
               form=dict(title="What are you missing?", lead="Tell us, and we'll think about how to make it great.",
                         placeholder="For example: I want to see how much went on the kids this year", email="Your e-mail, if you'd like a reply",
                         send="Send", thanks="Thank you! It's written down, and the team will think it over.",
                         failed="Couldn't send it. Try again or write to dibslysupport@gmail.com.",
                         later="Too many messages this hour. Try again a bit later.",
                         email_bad="The e-mail looks wrong. Check it or leave the field empty.",
                         note="Only the Dibsly team sees the text and the e-mail.", privacy="Privacy"),
               kicker="Features",
               store="Download on the App Store", more="Questions? Write to ",
               help="help.html", privacy="privacy.html",
               desc="What Dibsly can do and why: pockets, what counts as income and spending, accounts, bank imports and Apple Pay, the chat with Dibsly, analytics, plan, goals, debts, credits, FOP, investments, the website and ChatGPT or Claude."),
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
  ("rates", "free",
   ("Курси валют і конвертер", "Курс НБУ поруч із «Під рукою» і конвертер між валютами: скільки це в гривнях чи доларах, видно одразу.", "Головна → «Під рукою»"),
   ("Exchange rates and a converter", "The NBU rate next to “On hand” and a converter between currencies: what it is in hryvnias or dollars, at a glance.", "Main → On hand"),
   None, None),
  ("undo", "free",
   ("Скасування після видалення", "Видалив випадково? «Скасувати» в повідомленні поверне операції, перекази, цілі й платежі.", None),
   ("Undo after deleting", "Deleted something by mistake? “Undo” in the message brings back operations, transfers, goals and payments.", None),
   None, None),
 ]),
 ("in", "Як гроші потрапляють у Dibsly", "How money gets into Dibsly", [
  ("banks", "free",
   ("monobank і виписки банків", "monobank напряму за токеном лише для читання. Виписки PrivatBank, UKRSIBBANK, KredoBank і monobank, і їхні виписки ФОП, у PDF, Excel чи CSV. Dibsly читає файл на телефоні, сам розкладає операції по категоріях і впізнає перекази між твоїми рахунками.", "Налаштування → Імпорт та експорт"),
   ("monobank and bank statements", "monobank directly with a read-only token. Statements from PrivatBank, UKRSIBBANK, KredoBank and monobank, their FOP statements too, as PDF, Excel or CSV. Dibsly reads the file on your phone, sorts operations into categories and spots transfers between your own accounts.", "Settings → Import & export"),
   ("phone", "banks"), "statements"),
  ("apple-pay", "free",
   ("Apple Pay записується сам", "Автоматизація в «Командах» передає кожну покупку Apple Pay у Dibsly. Вона чекає чернеткою з сумою, магазином і категорією: глянь і підтверди одним дотиком.", "Головна → Активність"),
   ("Apple Pay records itself", "A Shortcuts automation hands every Apple Pay purchase to Dibsly. It waits as a draft with the amount, the shop and the category: look and confirm with one tap.", "Main → Activity"),
   ("slides", [("main-a", None), ("main-b", "89.3,{dy}")]), "apple-pay"),
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
  ("any-bank", "free",
   ("Виписка будь-якого банку", "Виписку Revolut, Wise чи будь-якого іншого банку прочитає ШІ в Dibsly: ти побачиш операції й перекази між своїми рахунками й збережеш після перевірки. 3 виписки всього безкоштовно, до 25 на місяць з Premium.", "Налаштування → Імпорт та експорт → Виписка банку"),
   ("A statement from any bank", "A statement from Revolut, Wise or any other bank is read by the AI in Dibsly: you see the operations and the transfers between your accounts and save them once checked. 3 statements in all for free, up to 25 a month with Premium.", "Settings → Import & export → Bank statement"),
   ("convo", [("me", "Виписка Revolut.pdf", "Revolut statement.pdf"),
              ("ai", "48 операцій, з них 3 перекази між твоїми рахунками. Додати?", "48 operations, 3 of them transfers between your accounts. Add them?")]), "statements"),
  ("moving", "free",
   ("Переїзд з Monefy", "Експорт Monefy в CSV переноситься з категоріями й рахунками. Перед збереженням Dibsly покаже, що саме додасть.", "Налаштування → Імпорт та експорт"),
   ("Moving from Monefy", "A Monefy CSV export comes over with its categories and accounts. Before saving, Dibsly shows exactly what it will add.", "Settings → Import & export"),
   None, "moving"),
 ]),
 ("chat", "Чат з Dibsly", "Chat with Dibsly", [
  ("ask", "free",
   ("Питай про свої гроші", "«На що пішло найбільше?», «Скільки я витратив на таксі цього року?», «Як там мої цілі?»: Dibsly рахує на телефоні з твоїх даних і відповідає твоїми цифрами, з картками й графіками. Чат відкривається з будь-якої сторінки й знає, звідки ти питаєш. 20 питань на місяць безкоштовно, більше з Premium.", "кнопка Dibsly над «+» на Головній, помаранчевий язичок праворуч на інших сторінках"),
   ("Ask about your money", "“What did most of it go on?”, “How much did I spend on taxis this year?”, “How are my goals?”: Dibsly works it out on your phone from your data and answers in your own figures, with cards and charts. The chat opens from any page and knows where you ask from. 20 questions a month free, more with Premium.", "the Dibsly button above “+” on Main, the orange tab on the right on other pages"),
   ("phone", "chat"), "chat"),
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
 ("money", "Борги, кредити й ФОП", "Debts, credits and FOP", [
  ("debts", "free",
   ("Борги", "Хто винен тобі і кому ти: позики, поділ рахунку й чека, повернення покупки, термін у календарі. «Поділитися» надсилає посилання, друг приймає борг у своєму Dibsly, а «Нагадати» шле йому пуш. Позика й повернення не витрата й не дохід, а переказ між тобою й людиною.", "Головна → «Борги» або «+» → «Операція» → «Борг»"),
   ("Debts", "Who owes you and whom you owe: loans, split bills and receipts, returned purchases, a due date in the calendar. Share sends a link, your friend accepts the debt in their Dibsly, and Remind sends them a push. A loan or a payback is neither spending nor income: it is a transfer between you and the person.", "Main → Debts, or “+” → Operation → Debt"),
   ("frame", "f-debt"), "debts"),
  ("credits", "free",
   ("Кредити", "Кредит, іпотека, розстрочка й мікрозайм: скільки лишилося, наступний платіж у календарі з нагадуванням, переплата і скільки заощадить дострокове погашення. Ліміт кредитки окремо від своїх грошей: «Під рукою» показує лише твої.", "Налаштування → Функції → «Кредити», потім Головна → «Кредити»"),
   ("Credits", "Loans, a mortgage, instalments and microloans: what is left, the next payment in the calendar with a reminder, the overpayment and what an early repayment saves. A credit card's limit stays apart from your own money: “On hand” shows only yours.", "Settings → Features → Credits, then Main → Credits"),
   ("frame", "f-credits"), "credits"),
  ("fop", "free",
   ("ФОП 3 групи", "Кожен дохід за курсом НБУ на день зарахування, єдиний податок, військовий збір і ЄСВ по кварталах, скільки до сплати й до коли, строки в календарі з нагадуваннями й реквізити податкової, щоб скопіювати одним дотиком. І виплата від замовника: години, ставка й свої умови.", "Налаштування → Функції → ФОП"),
   ("FOP, 3rd group", "Every income at the NBU rate of the day it arrived, the single tax, the military levy and ESV by quarter, what is due and by when, the deadlines in the calendar with reminders and the tax service's payment details to copy in one tap. And your client's payout: hours, rate and your own conditions.", "Settings → Features → FOP"),
   ("frame", "c-fop"), "fop"),
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
# The ideas behind the features (owner, 2026-10-21: «не только що вміє, а еще и функционал, типо зачем нам нужны
# карманы»), checked against the app's code: section id, titles, intros, then
# idea: id, uk (h3, text, where), en (h3, text, where), example (static or live, ideas.js), visual, the feature it links to
IDEAS = ("ideas", "Як Dibsly думає про гроші", "How Dibsly thinks about money",
 "Головне правило Dibsly: не змішувати гроші, якими ти живеш щодня, з тим, що відкладаєш чи інвестуєш. На повсякденному "
 "балансі видно, як рухаються твої гроші, а заощадження й інвестиції лежать окремо: це не ті гроші, які треба щодня "
 "смикати. З цього правила виростає решта.",
 "Dibsly's main rule: don't mix the money you live on every day with what you put aside or invest. The everyday "
 "balance shows how your money moves, while savings and investments sit apart: that's not money you need to keep "
 "poking at. Everything else grows from this rule.", [
  ("idea-pockets",
   ("Навіщо три кармани", "Кожен рахунок лежить в одному кармані. «Під рукою»: картки й готівка на щодень. «Заощадження»: те, що відкладаєш. «Інвестиції»: брокерські рахунки. Велика цифра на Головній і доходи та витрати місяця рахуються тільки з «Під рукою». Тож відкладені 50 000 ₴ не підморгують тобі в п'ятницю ввечері, а місяць показує, як ти справді живеш.", "Налаштування → Рахунки → рахунок"),
   ("Why three pockets", "Every account sits in one pocket. On hand: cards and cash for every day. Savings: what you put aside. Investments: broker accounts. The big number on Main and the month's income and spending count only On hand. So the ₴50,000 you put aside doesn't wink at you on a Friday night, and the month shows how you really live.", "Settings → Accounts → an account"),
   ("pockets", [("Під рукою", "On hand", "18 400 ₴", "₴18,400", "на Головній", "on Main", True),
                ("Заощадження", "Savings", "50 000 ₴", "₴50,000", "окремо", "apart", False),
                ("Інвестиції", "Investments", "3 200 $", "$3,200", "окремо", "apart", False)]), ("phone", "accounts"), "all-accounts"),
  ("idea-income",
   ("Що таке дохід і витрата", "Дохід і витрата: гроші, що прийшли ззовні чи пішли назовні. Зарплата, подарунок, кава, оренда. Переказ між своїми рахунками й обмін валют нічого не змінюють: гроші переклалися з кишені в кишеню, і Dibsly сам впізнає такі перекази у виписках. Переказ у «Заощадження» теж не витрата: ти ці гроші не витратив, а відклав. Купівля й продаж акцій живуть в Інвестиціях, а дивіденди там рахуються доходом, податок і комісія брокера витратою.", None),
   ("What counts as income and spending", "Income and spending are money that came in from outside or went out. Salary, a gift, coffee, rent. A transfer between your own accounts or a currency exchange changes nothing: the money moved from one pocket to another, and Dibsly spots such transfers in statements by itself. A transfer to Savings isn't spending either: you didn't spend that money, you put it aside. Buying and selling shares live in Investments, where dividends count as income and the tax and the broker's fee as spending.", None),
   ("live-ledger", ({"hand": 18400, "income": 0, "spending": 0, "savings": 50000}, [
               ("Зарплата", "Salary", "+40 000 ₴", "+₴40,000", "дохід", "income", "in", {"hand": 40000, "income": 40000}),
               ("Кава", "Coffee", "−85 ₴", "−₴85", "витрата", "spending", "out", {"hand": -85, "spending": 85}),
               ("monobank → PrivatBank", "monobank → PrivatBank", "5 000 ₴", "₴5,000", "не рахується", "not counted", "same", {}),
               ("У «Заощадження»", "To Savings", "10 000 ₴", "₴10,000", "не витрата", "not spending", "same", {"hand": -10000, "savings": 10000}),
               ("Купівля акцій", "Buying shares", "500 $", "$500", "в Інвестиціях", "in Investments", "same", {})])), None, None),
  ("idea-balance",
   ("Рахунок на щодень, але не в загальній цифрі", "Буває рахунок, яким ти користуєшся, але не хочеш бачити в загальній цифрі: рахунок ФОП, куди платять клієнти, чи доларовий рахунок. Залиш його в «Під рукою» й вимкни «Враховувати в балансі». Його баланс зникне з великої цифри, а гроші, що приходять на нього, все одно будуть доходом місяця. Переказ з нього на твою картку чи продаж валюти доходом вдруге не стануть: це ті самі гроші.", "Налаштування → Рахунки → рахунок → «Враховувати в балансі»"),
   ("An everyday account outside the big number", "Some accounts you use but don't want in the total: a sole-trader account clients pay into, or a dollar account. Keep it in On hand and switch off “Count in balance”. Its balance leaves the big number, while money arriving on it is still the month's income. Moving it to your card or selling the currency won't count as income a second time: it's the same money.", "Settings → Accounts → an account → “Count in balance”"),
   ("live-switch", ({"hand": 18400, "income": 65000}, 25000, "Рахунок ФОП", "Sole-trader account")), ("phone", "accountEditor"), None),
  ("idea-salary-month",
   ("Місяць від зарплати до зарплати", "Якщо зарплата щоразу приходить в інший день, місяць з 1-го числа плутає: частина витрат до зарплати потрапляє не туди. Вибери «Із зарплати», і місяць триватиме від однієї зарплати до наступної. Затрималася зарплата: місяць просто йде далі, поки вона не прийде. Головна, Історія, Аналітика й план рахують однаково.", "Налаштування → Параметри → «Початок місяця»"),
   ("A month from payday to payday", "If your salary comes on a different day each time, a month from the 1st gets it wrong: part of the spending before payday lands in the wrong month. Choose “With the salary” and a month runs from one salary to the next. Salary late? The month just goes on until it comes. Main, History, Analytics and the plan all count the same way.", "Settings → Preferences → “Month starts on”"),
   None, ("phone", "salary"), None),
  ("idea-plan",
   ("План з того, що прийшло", "План починається з «Коштів на місяць»: скільки грошей у тебе на цей місяць, те, що під рукою, і зарплата, що прийшла. З них ти відкладаєш план заощаджень та інвестицій, а решту розкладаєш лімітами по категоріях. Так видно, скільки ще можна витратити до кінця місяця, а не тільки скільки вже пішло. Планування вмикається тут: Налаштування → Функції.", "Головна → План"),
   ("A plan from what came in", "A plan starts with “Monthly funds”: the money you have for this month, what's on hand and the salary that came. From it you set aside the savings and investment plan and spread the rest as limits across categories. So you see how much you can still spend this month, not only how much has gone. Planning is switched on here: Settings → Features.", "Main → Plan"),
   ("rows", [("Кошти на місяць", "Monthly funds", "52 000 ₴", "₴52,000", ""),
             ("На витрати (ліміти)", "For spending (limits)", "−30 000 ₴", "−₴30,000", ""),
             ("План заощаджень", "Savings plan", "−10 000 ₴", "−₴10,000", ""),
             ("Інвестиційний план", "Investment plan", "−5 000 ₴", "−₴5,000", ""),
             ("Ще вільно", "Still free", "7 000 ₴", "₴7,000", "total")]), None, "monthly-plan"),
  ("idea-drafts",
   ("Чому чернетки, а не все само", "Покупки з Apple Pay, сповіщення банків і чеки Dibsly ловить сам, але не записує одразу: вони чекають в «Активності». Баланс зміниться тільки після твого «Зберегти». Так нічого не потрапляє в облік за твоєю спиною, а дивну суму чи не ту категорію видно до того, як вони зіпсують місяць.", "Головна → Активність"),
   ("Why drafts and not all by itself", "Dibsly catches Apple Pay purchases, bank notifications and receipts by itself but doesn't record them at once: they wait in Activity. The balance changes only after you tap Save. So nothing gets into your books behind your back, and an odd amount or the wrong category shows before it spoils the month.", "Main → Activity"),
   ("steps", [("Apple Pay · Сільпо · 412 ₴", "Apple Pay · Silpo · ₴412"),
              ("Чернетка в «Активності»: Продукти?", "A draft in Activity: Groceries?"),
              ("«Зберегти»: баланс −412 ₴", "Save: balance −₴412")]), None, "apple-pay"),
  ("idea-brands",
   ("Бренд один раз, категорія назавжди", "Dibsly знає понад 400 брендів з логотипами. Вибери категорію для бренду один раз, і всі його покупки підуть туди. Купуєш у бренду різне, як-от в Епіцентрі то для дому, то подарунки? Просто зміни категорію в операції: Dibsly це запам'ятає й наступного разу запропонує обидві. А категорію, яку не хочеш бачити в аналітиці, можна приховати: вона зникне з підсумків Аналітики, і більше ніде.", "Налаштування → Бренди"),
   ("A brand once, its category for good", "Dibsly knows over 400 brands with their logos. Pick a category for a brand once and all its purchases go there. Buy different things from one brand, like Epicentr for the home one day and a gift the next? Just change the category on the operation: Dibsly remembers and next time offers both. And a category you don't want in your analytics can be hidden: it leaves the Analytics totals and nothing else.", "Settings → Brands"),
   ("rows", [("Сільпо → Продукти", "Silpo → Groceries", "23 покупки", "23 purchases", ""),
             ("Uklon → Таксі", "Uklon → Taxi", "14 поїздок", "14 rides", ""),
             ("ОККО → Авто", "OKKO → Car", "6 заправок", "6 fill-ups", ""),
             ("Епіцентр → Дім або Подарунки", "Epicentr → Home or Gifts", "обидві", "both", "")]), None, "brands"),
  ("idea-goals",
   ("Цілі на заощадженнях, а не на картці", "Ціль нічого не забирає з рахунків: вона показує, які з твоїх заощаджень та інвестицій працюють на неї. Гроші під рукою в цілях не беруть участі: щоб наблизитися до цілі, переказуєш гроші на її рахунок. Кілька цілей наповнюються по черзі: спершу запас, як-от подушка, далі в твоєму порядку. А Dibsly каже, в якому місяці дійдеш до кожної в такому темпі.", "Головна → Цілі"),
   ("Goals live on savings, not on your card", "A goal takes nothing off your accounts: it shows which of your savings and investments work for it. On hand money takes no part: to get closer, you move money to the goal's account. Several goals fill in turn: a reserve such as a cushion first, then in your order. And Dibsly tells you the month you reach each one at your pace.", "Main → Goals"),
   None, ("phone", "goals-full"), "goals"),
  ("idea-growth",
   ("Поповнення не прибуток", "Закинув 1 000 $ на брокерський рахунок, і портфель виріс на 1 000 $, але ти не заробив ані цента. Тому Dibsly показує ріст окремо від поповнень: скільки ти вклав і скільки заробили самі гроші, а дивіденди разом з утриманим податком. Так само рахується Капітал в Аналітиці.", "вкладка Інвестиції"),
   ("A deposit isn't profit", "You put $1,000 into your broker account and the portfolio grew by $1,000, but you didn't earn a cent. So Dibsly shows growth apart from deposits: how much you put in and how much the money earned by itself, with dividends and the tax withheld. Capital in Analytics counts the same way.", "the Investments tab"),
   ("live-growth", {"deposits": 10000, "value": 11200}), None, "portfolio"),
  ("idea-shared",
   ("Спільний рахунок на двох", "Спільним стає окремий рахунок, а не весь Dibsly: його бачите обоє, видно, хто скільки вніс і хто що витратив, а коли інший щось додає, приходить сповіщення. Твої особисті рахунки лишаються тільки твоїми. Вистачить Premium в одного з вас.", "Профіль → Спільний доступ"),
   ("A shared account for two", "You share one account, not your whole Dibsly: you both see it, who put in what and who spent what, and a notification comes when the other adds something. Your personal accounts stay yours alone. One Premium is enough for both of you.", "Profile → Sharing"),
   None, ("phone", "shared"), "shared"),
  ("idea-save",
   ("Нічого без твого «так»", "Чат з Dibsly, твій Claude чи ChatGPT спершу показують, що саме зміниться, і записують тільки після «Зберегти» чи твого «так». У чаті Dibsly зміну скасовує кнопка під карткою. Операції, виписки, угоди, категорії й рахунки, змінені через Claude чи ChatGPT, лежать у журналі ШІ на сайті, звідки їх можна скасувати.", None),
   ("Nothing without your yes", "The chat with Dibsly, your Claude or ChatGPT first show exactly what will change and write it only after Save or your yes. In the Dibsly chat a button under the card undoes the change. Operations, statements, trades, categories and accounts changed through Claude or ChatGPT are kept in the AI journal on the website, where they can be undone.", None),
   None, ("convo", [("me", "Перенеси поїздки Uber у Таксі", "Move my Uber rides to Taxi"),
                    ("ai", "12 операцій з «Транспорт» у «Таксі». Зберегти?", "12 operations from Transport to Taxi. Save?"),
                    ("me", "Зберегти", "Save"),
                    ("ai", "Готово. Передумаєш: «Скасувати» під карткою.", "Done. Changed your mind? Undo is under the card.")]), "changes"),
])

# «Що далі» (owner, 2026-10-21): the public roadmap without dates; ids are the server's ROADMAP_ITEMS
# (`Server/sync/src/siteFeedback.ts` in dibsly-ios). Column (uk, en), then items: id, uk title, en title, uk text, en text.
ROADMAP = [
 (("Робимо зараз", "Building now"), [
  ("web-brands", "Бренди на сайті", "Brands on the website",
   "Усі бренди з логотипами й категоріями, з пошуком.", "Every brand with its logo and category, with search."),
 ]),
 (("Далі", "Next"), [
  ("undo-plans", "Скасування для планів, календаря й цілей", "Undo for plans, the calendar and goals",
   "Як уже є для операцій: змінив через ШІ, передумав, скасував.", "As it already works for operations: changed through the AI, changed your mind, undone."),
  ("mono-one-tap", "monobank в один дотик", "monobank in one tap",
   "Підключення без токена, який треба копіювати руками.", "Connecting without a token copied by hand."),
 ]),
 (("Потім", "Later"), [
  ("ipad-mac", "iPad і Mac", "iPad and Mac", "", ""),
  ("android", "Android", "Android", "", ""),
 ]),
 (("Думаємо", "Thinking about"), [
  ("shared-plans", "Спільні плани на двох", "Shared plans for two", "", ""),
  ("brokers", "Брокерські рахунки напряму", "Broker accounts directly",
   "Interactive Brokers і Freedom без звітів вручну.", "Interactive Brokers and Freedom without reports by hand."),
  ("more-banks", "Більше банків", "More banks", "", ""),
  ("guess-brand", "«Вгадай бренд»", "“Guess the brand”", "Гра: впізнай бренд за логотипом.", "A game: tell the brand by its logo."),
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
        return (f'<div class="fvisual"><div class="phone"><div class="slides"><img class="on" src="v2/shots/{lang}-{data}.jpg" alt="{e(alt)}" '
                f'width="750" height="1631" loading="lazy"></div></div></div>')
    if kind == "frame":
        # One of the landing's own frames (v3/scenes), the same dark captures as the hero's phone.
        return (f'<div class="fvisual"><div class="phone"><div class="slides"><img class="on" src="v3/scenes/{lang}-{data}.jpg" alt="{e(alt)}" '
                f'width="750" height="1631" loading="lazy"></div></div></div>')
    if kind == "slides":
        # The first draft's ✓ on main-a (the landing's a-main: 359, 568 points; English 583, its «Activity» on two lines).
        dy = "65.0" if lang == "uk" else "66.7"
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


LIVE = {
    "uk": dict(hand="Під рукою", income="Дохід місяця", spending="Витрати місяця", savings="Заощадження",
               tap="Натисни на операції й дивись на цифри", count="Враховувати в балансі",
               deposits="Вклав", value="Портфель", growth="Заробили",
               deposit="Поповнити на 1 000 $", market="Ринок +5%", reset="Спочатку"),
    "en": dict(hand="On hand", income="Month's income", spending="Month's spending", savings="Savings",
               tap="Tap the operations and watch the numbers", count="Count in balance",
               deposits="Put in", value="Portfolio", growth="Earned",
               deposit="Top up $1,000", market="Market +5%", reset="Start over"),
}


def total(key, label, currency="₴"):
    return f'<div class="tot"><span>{e(label)}</span><b data-total="{key}" data-currency="{currency}"></b></div>'


def example(x, lang):
    if not x:
        return ""
    kind, rows = x
    uk = lang == "uk"
    w = LIVE[lang]
    if kind == "pockets":
        cells = "".join(f'<div class="pocket{" main" if main else ""}"><span>{e(a if uk else b)}</span><b>{e(c if uk else d)}</b>'
                        f'<i>{e(f if uk else g)}</i></div>' for a, b, c, d, f, g, main in rows)
        return f'<div class="iex pockets" aria-hidden="true">{cells}</div>'
    if kind == "live-ledger":
        start, items = rows
        cells = "".join(f'<button type="button" class="row {k}" aria-pressed="false" data-effect=\'{json.dumps(fx)}\'>'
                        f'<span>{e(a if uk else b)}</span><b>{e(c if uk else d)}</b><i>{e(f if uk else g)}</i></button>'
                        for a, b, c, d, f, g, k, fx in items)
        tots = "".join(total(key, w[key]) for key in ("hand", "income", "spending", "savings"))
        return (f'<div class="iex live live-ledger" data-start=\'{json.dumps(start)}\'><div class="tots">{tots}</div>'
                f'<p class="hint">{e(w["tap"])}</p><div class="ledger">{cells}</div></div>')
    if kind == "live-switch":
        start, amount, uk_name, en_name = rows
        money = f"{amount:,}".replace(",", "\u00a0") + "\u00a0₴" if uk else f"₴{amount:,}"
        return (f'<div class="iex live live-switch" data-start=\'{json.dumps(start)}\' data-account="{amount}">'
                f'<label class="switch-row"><span><b>{e(uk_name if uk else en_name)}</b><i>{e(money)}</i></span>'
                f'<span class="toggle"><input type="checkbox" checked><span aria-hidden="true"></span></span>'
                f'<em>{e(w["count"])}</em></label>'
                f'<div class="tots two">{total("hand", w["hand"])}{total("income", w["income"])}</div></div>')
    if kind == "live-growth":
        tots = "".join(total(key, w[key], "$") for key in ("deposits", "value", "growth"))
        buttons = "".join(f'<button type="button" class="chip" data-act="{act}">{e(w[act])}</button>' for act in ("deposit", "market", "reset"))
        return (f'<div class="iex live live-growth" data-start=\'{json.dumps(rows)}\'><div class="tots three">{tots}</div>'
                f'<div class="chips">{buttons}</div></div>')
    if kind == "rows":
        cells = "".join(f'<div class="row{" total" if flag else ""}"><span>{e(a if uk else b)}</span><b>{e(c if uk else d)}</b></div>'
                        for a, b, c, d, flag in rows)
        return f'<div class="iex sums" aria-hidden="true">{cells}</div>'
    if kind == "steps":
        cells = "".join(f'<li>{e(a if uk else b)}</li>' for a, b in rows)
        return f'<ol class="iex steps" aria-hidden="true">{cells}</ol>'
    raise ValueError(kind)


def ideas(lang):
    t = L[lang]
    sid, uk, en, intro_uk, intro_en, items = IDEAS
    cards = []
    for iid, ukf, enf, x, vis, link in items:
        h3, text, where = ukf if lang == "uk" else enf
        w = f'<p class="try"><b>{t["where"]}:</b> {e(where)}</p>' if where else ""
        a = f'<p class="fguide"><a href="#{link}">{t["more_link"]}</a></p>' if link else ""
        ex = example(x, lang)
        v = visual(vis, lang, h3) if vis else ""
        if v:
            body = f'<div class="ftext"><h3>{e(h3)}</h3><p class="desc">{e(text)}</p>{w}{a}{ex}</div>{v}'
        else:
            body = f'<div class="ftext"><h3>{e(h3)}</h3><p class="desc">{e(text)}</p>{w}{a}</div><div class="fvisual">{ex}</div>'
        cards.append(f'<article class="feature idea{"" if v else " exvis"} reveal" id="{iid}">{body}</article>')
    return (f'<section class="fsection" id="{sid}"><h2>{e(uk if lang == "uk" else en)}</h2>'
            f'<p class="intro">{e(intro_uk if lang == "uk" else intro_en)}</p>{"".join(cards)}</section>')


def roadmap(lang):
    uk = lang == "uk"
    t = L[lang]
    cols = []
    for (cuk, cen), items in ROADMAP:
        rows = "".join(f'<li><div><h4>{e(a if uk else b)}</h4>{f"<p>{e(c if uk else d)}</p>" if (c if uk else d) else ""}</div>'
                       f'<button type="button" class="want" data-item="{iid}" aria-pressed="false">'
                       f'{e(t["want"])} <b></b></button></li>' for iid, a, b, c, d in items)
        cols.append(f'<div class="rcol"><h3>{e(cuk if uk else cen)}</h3><ul>{rows}</ul></div>')
    f = t["form"]
    form = (f'<form class="missing-form" data-thanks="{e(f["thanks"])}" data-failed="{e(f["failed"])}" data-later="{e(f["later"])}" '
            f'data-email="{e(f["email_bad"])}" novalidate>'
            f'<h3>{e(f["title"])}</h3><p>{e(f["lead"])}</p>'
            f'<label class="sr" for="missing-text">{e(f["title"])}</label>'
            f'<textarea id="missing-text" name="text" rows="4" maxlength="2000" required placeholder="{e(f["placeholder"])}"></textarea>'
            f'<div class="form-row"><label class="sr" for="missing-email">{e(f["email"])}</label>'
            f'<input id="missing-email" name="email" type="email" autocomplete="email" placeholder="{e(f["email"])}">'
            f'<button class="button hot" type="submit">{e(f["send"])}</button></div>'
            f'<input class="trap" name="company" tabindex="-1" autocomplete="off" aria-hidden="true">'
            f'<p class="form-status" role="status"></p>'
            f'<p class="form-note">{e(f["note"])} <a href="{t["privacy"]}">{e(f["privacy"])}</a></p></form>')
    return (f'<section class="fsection" id="next"><h2>{e(t["next"])}</h2><p class="intro">{e(t["next_intro"])}</p>'
            f'<div class="rgrid">{"".join(cols)}</div>{form}</section>')


def build(lang):
    t = L[lang]
    toc, body = [f'<a href="#{IDEAS[0]}">{e(IDEAS[1] if lang == "uk" else IDEAS[2])}</a>'], [ideas(lang)]
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
    toc.append(f'<a href="#next">{e(t["next"])}</a>')
    body.append(roadmap(lang))
    links = "\n".join(f"                {x}" for x in toc)
    page = f'''<!doctype html>
<html lang="{lang}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
    <title>{e(t["title"])} · Dibsly</title>
    <meta name="description" content="{e(t["desc"])}">
    <meta name="theme-color" content="#0E0C0B">
    <link rel="canonical" href="https://dibslyapp.com/{t["page"]}">
    <link rel="alternate" hreflang="uk" href="https://dibslyapp.com/features-uk.html">
    <link rel="alternate" hreflang="en" href="https://dibslyapp.com/features.html">
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="Dibsly">
    <meta property="og:title" content="{e(t["title"])}">
    <meta property="og:description" content="{e(t["desc"])}">
    <meta property="og:url" content="https://dibslyapp.com/{t["page"]}">
    <meta property="og:image" content="https://dibslyapp.com/img/shots/{lang}-web.jpg">
    <meta name="twitter:card" content="summary_large_image">
    <link rel="icon" type="image/png" href="img/favicon.png">
    <link rel="apple-touch-icon" href="img/apple-touch-icon.png">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Geologica:wght@500;600;700;800&family=Manrope:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="v3/pages.css">
    <link rel="stylesheet" href="v3/features.css">
    {CSS}
</head>
<body>
{nav(lang, t["page"])}

    <main>
        <section class="page-hero fhero">
            <div class="wrap">
                <div>
                    <p class="kicker"><span class="dot"></span>{e(t["kicker"])}</p>
                    <h1>{e(t["h1"])}</h1>
                    <p class="lead">{e(t["lead"])}</p>
                </div>
                <div class="mascot" aria-hidden="true"><img src="img/dibsly-dark.png" alt="" width="404" height="386"></div>
            </div>
        </section>
        <div class="wrap with-toc">
            <nav class="toc" aria-label="{t["toc"]}">
{links}
            </nav>
            <div class="flist">
{chr(10).join(body)}
                <div class="fend">
                    <a class="button hot" href="https://apps.apple.com/app/id6765870838">{e(t["store"])}</a>
                    <p>{e(t["more"])}<a href="mailto:dibslysupport@gmail.com">dibslysupport@gmail.com</a></p>
                </div>
            </div>
        </div>
    </main>

{footer(lang, t["page"])}
    <script src="v3/pages.js" defer></script>
    <script src="v3/features.js" defer></script>
    <script src="v2/ideas.js" defer></script>
    {JS}
</body>
</html>
'''
    assert "—" not in page.replace("&#x27;", ""), "em dash"
    page = newtab(page)
    open(f"{ROOT}/{t['page']}", "w").write(page)
    print(t["page"], len(page))


for lang in ("uk", "en"):
    build(lang)
