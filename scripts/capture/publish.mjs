import { readFile, writeFile, readdir, mkdir } from 'node:fs/promises';
import sharp from 'sharp';
import { captions } from './captions.mjs';
const raw = process.env.DIBSLY_CAPTURE_DIR || '.qa/capture-sources';
const outcomes = {
  auto: [
    'Готово. Покупка в історії, а баланс уже оновився.',
    'Done. The purchase is in History and the balance has updated.',
  ],
  plus: [
    'Витрату збережено. Усе зійшлося — можна займатися своїм.',
    'Expense saved. Everything adds up. Back to your day.',
  ],
  ask: [
    'Збережено після твого підтвердження. Зміни можна відмінити.',
    'Saved after your confirmation. You can undo the change.',
  ],
  plan: [
    'Бюджет на місяць і цілі з датою — в одному місці.',
    'A budget for the month and goals with a date, in one place.',
  ],
  invest: [
    'Усі подробиці виплати поруч: рахунок, податок і комісія.',
    'All the payment details together: account, tax and fee.',
  ],
  money: [
    'Борги по людях і кредити з наступним платежем — на одному екрані.',
    'Debts by person and credits with the next payment, on one screen.',
  ],
  fop: [
    'Квартал змінився — доходи, податки та строки теж.',
    'A different quarter. Its income, taxes and deadlines, together.',
  ],
  calendar: [
    'Видно наперед, що й коли спишеться — і з якого рахунку.',
    'You see ahead what is charged and when, and from which account.',
  ],
  analytics: [
    'Чотири погляди на ті самі гроші — від сьогодні до цілого року.',
    'Four views of the same money, from today to the whole year.',
  ],
  together: [
    'Видно внесок кожного. Вистачить Premium в одного.',
    'Everyone’s part in view. One Premium is enough.',
  ],
};
const captures = {
  schema: 2,
  source: 'native-ios-1.0.2',
  sourceCommit: '5c497b974511d7ee9a37378f14711e219b8a7be6',
  recorded: '2026-10-29',
  languages: {},
};
for (const lang of ['uk', 'en']) {
  captures.languages[lang] = JSON.parse(await readFile(`content/captures/${lang}-sequences.json`));
  for (const [id, sequence] of Object.entries(captures.languages[lang]))
    if (outcomes[id]) {
      if (captions[lang][id].length !== sequence.actions.length)
        throw Error(`Caption count: ${lang}/${id}`);
      sequence.actions.forEach((action, index) => {
        action.text = captions[lang][id][index];
      });
      const original = sequence.frames.length;
      sequence.frames.push(...Array(14).fill(sequence.frames.at(-1)));
      for (const action of sequence.actions)
        action.at *= Math.max(1, original - 1) / (sequence.frames.length - 1);
      sequence.actions.push({
        at: (original + 4) / (sequence.frames.length - 1),
        frame: sequence.frames.length - 1,
        text: outcomes[id][lang === 'uk' ? 0 : 1],
      });
    }
  const folder = `public/assets/cinema/${lang}/screens`;
  await mkdir(folder, { recursive: true });
  // The screen library keeps its published images when this machine has no showcase captures.
  for (const file of await readdir(`${raw}/${lang}/showcase`).catch(() => []))
    if (file.endsWith('.png')) {
      await sharp(`${raw}/${lang}/showcase/${file}`)
        .resize(750)
        .webp({ quality: 85, effort: 4 })
        .toFile(`${folder}/${file.replace('.png', '.webp')}`);
    }
  await sharp(`public/${captures.languages[lang].invest.frames.at(-1)}`)
    .resize(750)
    .webp({ quality: 85 })
    .toFile(`${folder}/dividend.webp`);
}
await writeFile('src/content/captures.json', JSON.stringify(captures, null, 2) + '\n');
console.log('Published native sequences and screen library.');
