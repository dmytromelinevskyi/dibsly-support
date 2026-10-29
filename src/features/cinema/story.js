import films from '../../content/films.json';
const localized = (uk, en) => ({ uk, en });
export const chapterDefinitions = [
  {
    id: 'auto',
    length: 220,
    word: localized('БЕЗ ЗУСИЛЬ', 'EFFORTLESS'),
    title: localized(['Покупка.', 'Вже під контролем.'], ['Paid.', 'Already in sight.']),
    description: localized(
      'Оплати звично. Dibsly збере покупку в «Активності», а ти лише підтвердиш.',
      'Pay as usual. Dibsly brings the purchase into Activity. You just confirm.'
    ),
    label: localized('Записується саме', 'Effortless tracking'),
    motif: 0,
    pose: [1.9, 0.1, 0.02, -0.07, -0.11, 0.02],
  },
  {
    id: 'plus',
    length: 330,
    word: localized('ПРОСТО', 'SIMPLY'),
    title: localized(
      ['Кілька дотиків.', 'І все сходиться.'],
      ['A few taps.', 'Everything adds up.']
    ),
    description: localized(
      'Плюс, сума, категорія. Готівка та маленькі щоденні покупки теж на своєму місці.',
      'Plus, amount, category. Cash and the little everyday purchases have a place, too.'
    ),
    label: localized('Швидкий запис', 'Quick entry'),
    motif: 1,
    pose: [1.85, 0.08, 0.14, 0.04, 0.1, -0.025],
  },
  {
    id: 'ask',
    length: 250,
    word: localized('ЗРОЗУМІЛО', 'CLARITY'),
    title: localized(['Можна просто', 'запитати.'], ['Just ask.', 'Dibsly understands.']),
    description: localized(
      'Що з грошима? На що пішло найбільше? Відповідь твоїми цифрами. Будь-яка зміна лише після твого «Зберегти».',
      'How is my money doing? Where did most of it go? Answers in your own figures. Changes only after your Save.'
    ),
    label: localized('Чат із Dibsly', 'Ask Dibsly'),
    motif: 2,
    pose: [1.85, 0.06, 0.17, -0.03, -0.08, 0.015],
  },
  {
    id: 'plan',
    length: 280,
    word: localized('ПОПЕРЕДУ', 'FORWARD'),
    title: localized(
      ['Сьогодні спокійніше.', 'Мрія ближче.'],
      ['A calmer today.', 'A closer tomorrow.']
    ),
    description: localized(
      'Ліміти на місяць і цілі, до яких хочеться йти. Видно, що залишилось і коли ти дістанешся.',
      'Monthly limits and goals worth moving towards. Know what is left and when you could get there.'
    ),
    label: localized('План і цілі', 'Plan and goals'),
    motif: 3,
    pose: [1.9, 0.1, 0.06, 0.04, 0.08, -0.02],
  },
  {
    id: 'invest',
    length: 230,
    word: localized('ЗРОСТАННЯ', 'GROWTH'),
    title: localized(
      ['Гроші працюють.', 'Ти бачиш результат.'],
      ['Money at work.', 'Progress in view.']
    ),
    description: localized(
      'Портфель, дивіденди й ріст поруч із повсякденними фінансами. Поповнення окремо від прибутку.',
      'Your portfolio, dividends and growth beside everyday finances. Deposits stay separate from returns.'
    ),
    label: localized('Інвестиції', 'Investments'),
    motif: 4,
    pose: [1.85, 0.06, 0.02, -0.04, -0.1, 0.025],
  },
  {
    id: 'money',
    length: 260,
    word: localized('БАЛАНС', 'BALANCE'),
    title: localized(['Хто кому.', 'Скільки й коли.'], ['Who owes whom.', 'And when.']),
    description: localized(
      'Борги, повернення, кредитні платежі. Усі домовленості й наступні дати видно в одному місці.',
      'Debts, repayments and upcoming loan payments. Every agreement and its next date, together.'
    ),
    label: localized('Борги та кредити', 'Debts and loans'),
    motif: 5,
    pose: [1.9, 0.07, 0.1, 0.04, 0.1, -0.025],
  },
  {
    id: 'fop',
    length: 220,
    word: localized('СВОЯ СПРАВА', 'YOUR BUSINESS'),
    title: localized(
      ['Особисте окремо.', 'Справа під контролем.'],
      ['Personal, separate.', 'Business, in order.']
    ),
    description: localized(
      'Кишеня ФОП: доходи, податки та найближчі строки. Без окремої таблиці для кожного кварталу.',
      'A dedicated FOP pocket: income, taxes and upcoming deadlines. No separate spreadsheet for every quarter.'
    ),
    label: localized('ФОП', 'Sole trader'),
    motif: 6,
    pose: [1.8, 0.1, 0.13, -0.04, -0.08, 0.015],
  },
  {
    id: 'analytics',
    length: 350,
    word: localized('КАРТИНА', 'PERSPECTIVE'),
    title: localized(
      ['Побачити ціле.', 'Зрозуміти деталі.'],
      ['See the whole.', 'Understand the detail.']
    ),
    description: localized(
      'Категорії, потік, тренди та капітал. Від загальної картини до конкретної покупки й наступного платежу.',
      'Categories, cash flow, trends and capital. From the bigger picture to a purchase or an upcoming payment.'
    ),
    label: localized('Аналітика й календар', 'Analytics and calendar'),
    motif: 7,
    pose: [1.85, 0.08, 0.06, 0.04, 0.06, -0.015],
  },
  {
    id: 'together',
    length: 220,
    word: localized('РАЗОМ', 'TOGETHER'),
    title: localized(['Спільні плани.', 'Спільна ясність.'], ['Shared plans.', 'Shared clarity.']),
    description: localized(
      'Рахунок для пари чи сім’ї. Видно внесок кожного, спільні витрати й цілі. Достатньо Premium в одного.',
      'An account for a couple or family. See each contribution, shared spending and goals. One Premium is enough.'
    ),
    label: localized('Гроші разом', 'Money together'),
    motif: 8,
    pose: [1.8, 0.08, 0.08, -0.03, -0.06, 0.01],
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
  analytics: 'calendar',
  together: 'shared',
};
export function getChapters(lang) {
  return chapterDefinitions.map((chapter) => ({
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
    eyebrow: 'Особисті фінанси. По-твоєму.',
    title: ['Усі твої гроші.', 'Один твій світ.'],
    lead: 'Банки, готівка, інвестиції й великі плани. Коли все поруч, із грошима спокійніше.',
    download: 'Спробувати безкоштовно',
    web: 'Відкрити вебверсію',
    scroll: 'Гортай. Побачиш кожен крок.',
    interaction: 'Проведи курсором. Відчуй свій ритм.',
    platforms: 'iPhone · Браузер',
  },
  en: {
    eyebrow: 'Personal finance. On your terms.',
    title: ['All your money.', 'A world of your own.'],
    lead: 'Banks, cash, investments and bigger plans. When everything is together, money feels a little calmer.',
    download: 'Start for free',
    web: 'Open the web app',
    scroll: 'Scroll. See every step.',
    interaction: 'Move your cursor. Find your rhythm.',
    platforms: 'iPhone · Web',
  },
};
