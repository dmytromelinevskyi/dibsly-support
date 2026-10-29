/** Audited native frame boundaries. Each target is [center x, center y, width, height] in screen space. */
const b = (from, to, target, uk, en, descriptionUk, descriptionEn, options = {}) => ({
  from,
  to,
  target,
  control: { uk, en },
  description: { uk: descriptionUk, en: descriptionEn },
  ...options,
});
/** Something arrives by itself (a notification): no hand, the outline marks what came. */
const watch = { watch: true };
export const edits = {
  uk: {
    auto: [
      b(
        0,
        20,
        [0.5, 0.647, 0.94, 0.05],
        'Apple Pay',
        'Apple Pay',
        'Оплатив телефоном — Dibsly одразу кладе покупку в «Активність» і каже про це.',
        'You paid with your phone: Dibsly puts the purchase in Activity at once and tells you.',
        watch
      ),
      b(
        28,
        60,
        [0.5, 0.647, 0.94, 0.05],
        'Пуш monobank',
        'monobank push',
        'Прийшов пуш банку — ще одна покупка вже чекає.',
        'A bank push came in: one more purchase already waits.',
        watch
      ),
      b(
        64,
        100,
        [0.895, 0.709, 0.1, 0.05],
        'Галочка',
        'Confirm',
        'Один дотик — покупка в історії, а «Витрачено» вже більше.',
        'One tap: the purchase is in History and Spent has grown.'
      ),
    ],
    plus: [
      b(
        0,
        16,
        [0.866, 0.915, 0.14, 0.068],
        '+',
        '+',
        'Відкриваємо способи запису.',
        'Open the entry options.'
      ),
      b(
        16,
        29,
        [0.62, 0.694, 0.62, 0.065],
        'Операція',
        'Operation',
        'Відкривається форма витрати з калькулятором.',
        'The expense form opens with its calculator.'
      ),
      b(
        30,
        33,
        [0.325, 0.787, 0.16, 0.055],
        '8',
        '8',
        'Перший дотик вводить 8.',
        'The first tap enters 8.'
      ),
      b(
        33,
        41,
        [0.325, 0.728, 0.16, 0.055],
        '5',
        '5',
        'Другий дотик. Сума вже 85 ₴.',
        'One more tap. The amount is now 85.'
      ),
      b(
        41,
        53,
        [0.5, 0.232, 0.13, 0.064],
        'Категорія',
        'Category',
        'Відкривається список категорій.',
        'The category list opens.'
      ),
      b(
        53,
        65,
        [0.177, 0.313, 0.16, 0.105],
        'Кафе й ресторани',
        'Eating out',
        'Покупка отримує свою категорію.',
        'The purchase gets its category.'
      ),
      b(
        65,
        100,
        [0.5, 0.924, 0.9, 0.058],
        'Зберегти витрату',
        'Save expense',
        'Витрату записано. Гроші враховано в балансі.',
        'Expense saved. The balance now includes it.'
      ),
    ],
    ask: [
      b(
        0,
        20,
        [0.865, 0.844, 0.14, 0.066],
        'Dibsly',
        'Dibsly',
        'Чат відкриває відповідь та картку нової витрати.',
        'The chat opens its answer and a proposed expense.'
      ),
      b(
        92,
        133,
        [0.716, 0.614, 0.4, 0.06],
        'Зберегти',
        'Save',
        'Тільки цей дотик підтверджує зміну. Є можливість відмінити.',
        'This tap confirms the change. Undo remains available.'
      ),
    ],
    plan: [
      b(
        0,
        9,
        [0.871, 0.594, 0.12, 0.04],
        'План',
        'Plan',
        'Ліміт на кожну категорію: скільки витрачено й скільки можна ще. Перевитрати — червоним.',
        'A limit for each category: what was spent and what is left. Overspending in red.'
      ),
      b(9, 15, [0.092, 0.097, 0.1, 0.05], 'Назад', 'Back', 'Назад на Головну.', 'Back to Main.'),
      b(
        15,
        36,
        [0.876, 0.789, 0.12, 0.04],
        'Цілі',
        'Goals',
        'Кожна ціль показує, коли ти до неї дійдеш у такому темпі.',
        'Each goal shows when you get there at this pace.'
      ),
    ],
    invest: [
      b(
        0,
        12,
        [0.74, 0.806, 0.42, 0.066],
        'Дивіденди за рік',
        'Dividends this year',
        'Від портфеля переходимо до кожної виплати.',
        'Move from the portfolio to its individual payments.'
      ),
      b(
        12,
        25,
        [0.5, 0.392, 0.9, 0.066],
        'Дивіденд BIL',
        'Dividend BIL',
        'Видно рахунок, податок і комісію виплати.',
        'See the payment account, tax and fee.'
      ),
    ],
    money: [
      b(
        0,
        78,
        [0.5, 0.55, 0.9, 0.3],
        'Головна',
        'Main',
        'Борги й кредити — прямо на Головній.',
        'Debts and credits, right on Main.'
      ),
      b(
        78,
        98,
        [0.4, 0.628, 0.75, 0.05],
        'Саша',
        'Sasha',
        'Хто кому винен, до коли, історія — і «Нагадати» в один дотик. Саша бачить борг у своєму Dibsly.',
        'Who owes whom, by when, the history, and Remind in one tap. Sasha sees the debt in their own Dibsly.'
      ),
      b(98, 114, [0.092, 0.097, 0.1, 0.05], 'Назад', 'Back', 'Назад на Головну.', 'Back to Main.'),
      b(
        114,
        133,
        [0.861, 0.801, 0.1, 0.04],
        'Кредити',
        'Credits',
        'Скільки лишилося, наступний платіж і кредитки окремо від своїх грошей.',
        'What is left, the next payment, and credit cards apart from your own money.'
      ),
    ],
    fop: [
      b(
        139,
        146,
        [0.905, 0.167, 0.1, 0.042],
        'Наступний квартал',
        'Next quarter',
        'Змінюються квартал, податки та найближчі строки.',
        'The quarter, taxes and upcoming dates change together.'
      ),
    ],
    calendar: [
      b(
        0,
        18,
        [0.903, 0.173, 0.1, 0.05],
        'Наступний місяць',
        'Next month',
        'Листопад: оренда, кредит, підписки — усе на своїх днях.',
        'November: rent, a loan, subscriptions, each on its day.'
      ),
      b(
        18,
        33,
        [0.746, 0.097, 0.12, 0.05],
        'Списком',
        'As a list',
        'Ті самі платежі списком: що, коли й з якого рахунку.',
        'The same payments as a list: what, when and from which account.'
      ),
      b(
        33,
        47,
        [0.5, 0.907, 0.9, 0.06],
        'Оренда',
        'Rent',
        'Платіж: сума, рахунок, повторення й нагадування.',
        'A payment: amount, account, repeat and reminder.'
      ),
    ],
    analytics: [
      b(
        0,
        17,
        [0.398, 0.225, 0.2, 0.045],
        'Потік',
        'Flow',
        'Скільки прийшло й пішло — день за днем.',
        'What came in and went out, day by day.'
      ),
      b(
        17,
        32,
        [0.609, 0.225, 0.2, 0.045],
        'Тренди',
        'Trends',
        'Місяць за місяцем: скільки в середньому лишається від доходу.',
        'Month by month: how much of your income you keep on average.'
      ),
      b(
        32,
        50,
        [0.813, 0.225, 0.2, 0.045],
        'Капітал',
        'Capital',
        'Заощадження й інвестиції разом — як росте твій капітал.',
        'Savings and investments together: how your capital grows.'
      ),
    ],
    together: [
      b(
        0,
        15,
        [0.249, 0.372, 0.4, 0.08],
        'Заощадження',
        'Savings',
        'Спільні накопичення пари: твоя частина й Настина, і скільки вона додала цього місяця.',
        'A couple’s shared savings: your part and Nastya’s, and what she added this month.'
      ),
      b(
        15,
        65,
        [0.5, 0.55, 0.9, 0.3],
        'Рахунки',
        'Accounts',
        'Нижче — цілі, план і рахунки, на яких лежать гроші.',
        'Further down: the goals, the plan and the accounts that hold the money.'
      ),
      b(
        65,
        87,
        [0.754, 0.613, 0.2, 0.04],
        'Настя',
        'Nastya',
        'Тільки Настина частина — у спільній «Відпустці».',
        'Only Nastya’s part, in the shared holiday account.'
      ),
    ],
  },
  en: {
    auto: [
      b(
        0,
        22,
        [0.5, 0.667, 0.94, 0.05],
        'Apple Pay',
        'Apple Pay',
        'Оплатив телефоном — Dibsly одразу кладе покупку в «Активність» і каже про це.',
        'You paid with your phone: Dibsly puts the purchase in Activity at once and tells you.',
        watch
      ),
      b(
        27,
        60,
        [0.5, 0.667, 0.94, 0.05],
        'Пуш банку',
        'Revolut push',
        'Прийшов пуш банку — ще одна покупка вже чекає.',
        'A bank push came in: one more purchase already waits.',
        watch
      ),
      b(
        64,
        100,
        [0.89, 0.73, 0.1, 0.05],
        'Галочка',
        'Confirm',
        'Один дотик — покупка в історії, а «Витрачено» вже більше.',
        'One tap: the purchase is in History and Spent has grown.'
      ),
    ],
    plus: [
      b(
        0,
        17,
        [0.866, 0.915, 0.14, 0.068],
        '+',
        '+',
        'Відкриваємо запис.',
        'Open the entry options.'
      ),
      b(
        17,
        32,
        [0.62, 0.694, 0.62, 0.065],
        'Операція',
        'Operation',
        'Відкривається форма.',
        'The expense form opens with its calculator.'
      ),
      b(32, 37, [0.325, 0.787, 0.16, 0.055], '8', '8', 'Вводимо 8.', 'The first tap enters 8.'),
      b(
        37,
        44,
        [0.325, 0.728, 0.16, 0.055],
        '5',
        '5',
        'Вводимо 5.',
        'One more tap. The amount is now $85.'
      ),
      b(
        44,
        59,
        [0.5, 0.232, 0.13, 0.064],
        'Категорія',
        'Category',
        'Обираємо категорію.',
        'The category list opens.'
      ),
      b(
        59,
        72,
        [0.177, 0.313, 0.16, 0.105],
        'Кафе й ресторани',
        'Eating out',
        'Категорію обрано.',
        'The purchase gets its category.'
      ),
      b(
        72,
        107,
        [0.5, 0.924, 0.9, 0.058],
        'Зберегти витрату',
        'Save expense',
        'Витрату збережено.',
        'Expense saved. The balance now includes it.'
      ),
    ],
    ask: [
      b(
        0,
        15,
        [0.865, 0.844, 0.14, 0.066],
        'Dibsly',
        'Dibsly',
        'Відкриваємо чат.',
        'The chat opens its answer and a proposed expense.'
      ),
      b(
        88,
        130,
        [0.716, 0.638, 0.4, 0.06],
        'Зберегти',
        'Save',
        'Підтверджуємо витрату.',
        'This tap confirms the change. Undo remains available.'
      ),
    ],
    plan: [
      b(
        0,
        20,
        [0.883, 0.594, 0.1, 0.04],
        'План',
        'Plan',
        'Ліміт на кожну категорію: скільки витрачено й скільки можна ще. Перевитрати — червоним.',
        'A limit for each category: what was spent and what is left. Overspending in red.'
      ),
      b(20, 30, [0.092, 0.097, 0.1, 0.05], 'Назад', 'Back', 'Назад на Головну.', 'Back to Main.'),
      b(
        30,
        60,
        [0.883, 0.792, 0.1, 0.04],
        'Цілі',
        'Goals',
        'Кожна ціль показує, коли ти до неї дійдеш у такому темпі.',
        'Each goal shows when you get there at this pace.'
      ),
    ],
    invest: [
      b(
        0,
        17,
        [0.74, 0.806, 0.42, 0.066],
        'Дивіденди за рік',
        'Dividends this year',
        'Дивіденди.',
        'Move from the portfolio to its individual payments.'
      ),
      b(
        18,
        30,
        [0.5, 0.392, 0.9, 0.066],
        'Дивіденд BIL',
        'Dividend BIL',
        'Виплата.',
        'See the payment account, tax and fee.'
      ),
    ],
    money: [
      b(
        7,
        84,
        [0.5, 0.55, 0.9, 0.3],
        'Головна',
        'Main',
        'Борги й кредити — прямо на Головній.',
        'Debts and credits, right on Main.'
      ),
      b(
        84,
        104,
        [0.4, 0.682, 0.75, 0.05],
        'Саша',
        'Sasha',
        'Хто кому винен, до коли, історія — і «Нагадати» в один дотик. Саша бачить борг у своєму Dibsly.',
        'Who owes whom, by when, the history, and Remind in one tap. Sasha sees the debt in their own Dibsly.'
      ),
      b(104, 123, [0.092, 0.097, 0.1, 0.05], 'Назад', 'Back', 'Назад на Головну.', 'Back to Main.'),
      b(
        146,
        160,
        [0.4, 0.967, 0.75, 0.04],
        'Іпотека',
        'Mortgage',
        'Кредит: наступний платіж, скільки лишилося й переплата за весь строк.',
        'A loan: the next payment, what is left and the overpayment over the whole term.'
      ),
    ],
    fop: [
      b(
        14,
        24,
        [0.905, 0.167, 0.1, 0.042],
        'Наступний квартал',
        'Next quarter',
        'Квартал.',
        'The quarter, taxes and upcoming dates change together.'
      ),
    ],
    calendar: [
      b(
        0,
        16,
        [0.903, 0.173, 0.1, 0.05],
        'Наступний місяць',
        'Next month',
        'Листопад: оренда, кредит, підписки — усе на своїх днях.',
        'November: rent, a loan, subscriptions, each on its day.'
      ),
      b(
        16,
        34,
        [0.746, 0.097, 0.12, 0.05],
        'Списком',
        'As a list',
        'Ті самі платежі списком: що, коли й з якого рахунку.',
        'The same payments as a list: what, when and from which account.'
      ),
      b(
        34,
        50,
        [0.5, 0.897, 0.9, 0.06],
        'Оренда',
        'Rent',
        'Платіж: сума, рахунок, повторення й нагадування.',
        'A payment: amount, account, repeat and reminder.'
      ),
    ],
    analytics: [
      b(
        0,
        15,
        [0.433, 0.225, 0.18, 0.045],
        'Потік',
        'Flow',
        'Скільки прийшло й пішло — день за днем.',
        'What came in and went out, day by day.'
      ),
      b(
        15,
        32,
        [0.624, 0.225, 0.18, 0.045],
        'Тренди',
        'Trends',
        'Місяць за місяцем: скільки в середньому лишається від доходу.',
        'Month by month: how much of your income you keep on average.'
      ),
      b(
        32,
        51,
        [0.846, 0.225, 0.18, 0.045],
        'Капітал',
        'Capital',
        'Заощадження й інвестиції разом — як росте твій капітал.',
        'Savings and investments together: how your capital grows.'
      ),
    ],
    together: [
      b(
        0,
        16,
        [0.249, 0.372, 0.4, 0.08],
        'Заощадження',
        'Savings',
        'Спільні накопичення пари: твоя частина й Настина, і скільки вона додала цього місяця.',
        'A couple’s shared savings: your part and Nastya’s, and what she added this month.'
      ),
      b(
        16,
        67,
        [0.5, 0.55, 0.9, 0.3],
        'Рахунки',
        'Accounts',
        'Нижче — цілі, план і рахунки, на яких лежать гроші.',
        'Further down: the goals, the plan and the accounts that hold the money.'
      ),
      b(
        67,
        86,
        [0.813, 0.613, 0.2, 0.04],
        'Настя',
        'Nastya’s',
        'Тільки Настина частина — у спільній «Відпустці».',
        'Only Nastya’s part, in the shared holiday account.'
      ),
    ],
  },
};
