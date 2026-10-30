import films from '../../content/films.json';
const localized = (uk, en) => ({ uk, en });
export const chapterDefinitions = [
  {
    id: 'auto',
    length: 220,
    word: localized('БЕЗ ЗУСИЛЬ', 'EFFORTLESS'),
    title: localized(['Заплатив.', 'Уже записано.'], ['Paid.', 'Already recorded.']),
    description: localized(
      'Оплатив Apple Pay чи прийшов пуш банку — покупка вже чекає в «Активності». Один дотик, і вона в історії та балансі.',
      'Paid with Apple Pay or got a bank’s push: the purchase already waits in Activity. One tap and it’s in History and the balance.'
    ),
    label: localized('Записується саме', 'Records itself'),
    motif: 0,
    pose: [1.9, 0.1, 0.02, -0.07, -0.11, 0.02],
  },
  {
    id: 'plus',
    length: 330,
    word: localized('ПРОСТО', 'SIMPLY'),
    title: localized(['Олдскул?', 'Тисни «+».'], ['Old school?', 'Tap “+”.']),
    description: localized(
      'Витрата, дохід, переказ чи борг — вручну за три дотики. Або скажи: «кава 85».',
      'Spending, income, a transfer or a debt: by hand in three taps. Or just say “coffee 5”.'
    ),
    label: localized('Додати самому', 'Add it yourself'),
    motif: 1,
    pose: [1.85, 0.08, 0.14, 0.04, 0.1, -0.025],
  },
  {
    id: 'ask',
    length: 250,
    word: localized('ЗРОЗУМІЛО', 'CLARITY'),
    title: localized(['Запитай.', 'Він знає.'], ['Ask.', 'He knows.']),
    description: localized(
      'Відповідає твоїми цифрами й змінює щось тільки після «Зберегти». Про налаштування — без ліміту, про гроші — 20 питань на місяць безкоштовно.',
      'Answers in your own figures and changes nothing until you tap Save. Questions about settings: no limit. About money: 20 a month free.'
    ),
    label: localized('Чат з Dibsly', 'Chat with Dibsly'),
    motif: 2,
    pose: [1.85, 0.06, 0.17, -0.03, -0.08, 0.015],
  },
  {
    id: 'analytics',
    length: 350,
    word: localized('КАРТИНА', 'PERSPECTIVE'),
    title: localized(['Куди йдуть', 'гроші.'], ['Where the money', 'goes.']),
    description: localized(
      'Категорії, потік, тренди й капітал — чотири погляди на твої гроші.',
      'Categories, flow, trends and capital: four views of your money.'
    ),
    label: localized('Аналітика', 'Analytics'),
    motif: 7,
    pose: [1.85, 0.08, 0.06, 0.04, 0.06, -0.015],
  },
  {
    id: 'calendar',
    length: 240,
    word: localized('НАПЕРЕД', 'AHEAD'),
    title: localized(['Що спишеться', 'далі.'], ['What’s charged', 'next.']),
    description: localized(
      'Оренда, підписки, кредити — місяцем або списком. Нагадає заздалегідь.',
      'Rent, subscriptions, loans: as a month or a list. A reminder ahead of time.'
    ),
    label: localized('Календар', 'Calendar'),
    motif: 9,
    pose: [1.85, 0.07, 0.12, -0.03, -0.09, 0.02],
  },
  {
    id: 'plan',
    length: 280,
    word: localized('ПОПЕРЕДУ', 'FORWARD'),
    title: localized(
      ['Бюджет на місяць.', 'Цілі з датою.'],
      ['A budget for the month.', 'Goals with a date.']
    ),
    description: localized(
      'Ліміт на кожну категорію й скільки можна ще. Перевитрати — червоним. Ціль показує, коли дійдеш.',
      'A limit for each category and what’s left. Overspending in red. A goal shows when you get there.'
    ),
    label: localized('План і цілі', 'Plan and goals'),
    motif: 3,
    pose: [1.9, 0.1, 0.06, 0.04, 0.08, -0.02],
  },
  {
    id: 'together',
    length: 220,
    word: localized('РАЗОМ', 'TOGETHER'),
    title: localized(['Гроші', 'разом.'], ['Money', 'together.']),
    description: localized(
      'Спільні накопичення й цілі для пари чи сімʼї: видно внесок кожного. Вистачить Premium в одного.',
      'Shared savings and goals for a couple or a family: everyone’s part in view. One Premium is enough.'
    ),
    label: localized('Гроші разом · Premium', 'Money together · Premium'),
    motif: 8,
    pose: [1.8, 0.08, 0.08, -0.03, -0.06, 0.01],
  },
  {
    id: 'money',
    length: 260,
    word: localized('БАЛАНС', 'BALANCE'),
    title: localized(['Хто кому винен.', 'І нагадування.'], ['Who owes whom.', 'And reminders.']),
    description: localized(
      'Позики, повернення, рахунок у кафе — по людях, нагадати в один дотик. Кредити: наступний платіж і переплата.',
      'Loans, paybacks, the café bill: by person, a reminder in one tap. Credits: the next payment and the overpayment.'
    ),
    label: localized('Борги й кредити', 'Debts and credits'),
    motif: 5,
    pose: [1.9, 0.07, 0.1, 0.04, 0.1, -0.025],
  },
  {
    id: 'invest',
    length: 230,
    word: localized('ЗРОСТАННЯ', 'GROWTH'),
    title: localized(
      ['Портфель.', 'Поруч з витратами.'],
      ['Your portfolio.', 'Next to your spending.']
    ),
    description: localized(
      'Звіти Interactive Brokers і Freedom Finance замість ручного введення. Дивіденди разом з утриманим податком, ріст окремо від поповнень. Безкоштовно.',
      'Interactive Brokers and Freedom Finance reports instead of typing. Dividends with the tax withheld, growth apart from deposits. Free.'
    ),
    label: localized('Інвестиції', 'Investments'),
    motif: 4,
    pose: [1.85, 0.06, 0.02, -0.04, -0.1, 0.025],
  },
  {
    id: 'fop',
    length: 220,
    word: localized('СВОЯ СПРАВА', 'YOUR BUSINESS'),
    title: localized(
      ['ФОП окремою кишенею.', 'Податки вже пораховані.'],
      ['Your FOP in its own pocket.', 'Taxes already worked out.']
    ),
    description: localized(
      'Єдиний податок, ЄСВ і військовий збір рахуються самі. Строки, декларації й нагадування.',
      'Single tax, ESV and military levy work themselves out. Deadlines, returns and reminders.'
    ),
    label: localized('ФОП', 'Sole traders (FOP)'),
    motif: 6,
    pose: [1.8, 0.1, 0.13, -0.04, -0.08, 0.015],
  },
];
const guideAnchors = {
  auto: 'apple-pay',
  plus: 'entry',
  ask: 'chat',
  plan: 'plan',
  invest: 'investments',
  money: 'debts',
  fop: 'fop',
  analytics: 'start',
  calendar: 'calendar',
  together: 'shared',
};
/** The landing shows six chapters (owner, 2026-10-29); analytics, calendar, plan and investments are in the gallery. */
export const landingChapterIds = ['auto', 'plus', 'ask', 'together', 'money', 'fop'];
export function getChapters(lang, ids) {
  const definitions = ids
    ? ids.map((id) => chapterDefinitions.find((chapter) => chapter.id === id))
    : chapterDefinitions;
  return definitions.map((chapter) => ({
    ...chapter,
    title: chapter.title[lang],
    word: chapter.word[lang],
    description: chapter.description[lang],
    label: chapter.label[lang],
    film: films.languages[lang][chapter.id],
    guide: guideAnchors[chapter.id],
  }));
}
export const heroCopy = {
  uk: {
    eyebrow: 'Особисті фінанси · iPhone і браузер',
    title: ['Усі гроші.', 'В одному місці.'],
    lead: 'Картки всіх банків, готівка, накопичення, інвестиції, ФОП, борги й кредити. Dibsly сам записує витрати й відповідає на питання про гроші твоїми цифрами.',
    download: 'Завантажити в App Store',
    web: 'Відкрити в браузері',
    scroll: 'Гортай. Побачиш кожен крок.',
    interaction: 'Проведи курсором. Відчуй свій ритм.',
    platforms: 'iPhone · Браузер · iPad і Mac — скоро',
  },
  en: {
    eyebrow: 'Personal finance · iPhone and the web',
    title: ['All your money.', 'In one place.'],
    lead: 'Cards from every bank, cash, savings, investments, your FOP, debts and credits. Dibsly records your spending and answers your money questions in your own figures.',
    download: 'Download on the App Store',
    web: 'Open in a browser',
    scroll: 'Scroll. See every step.',
    interaction: 'Move your cursor. Find your rhythm.',
    platforms: 'iPhone · Browser · iPad and Mac — soon',
  },
};
