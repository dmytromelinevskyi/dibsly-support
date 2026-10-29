import { useState, useEffect, useRef } from 'react';
import IPhoneFrame from '../../components/device/IPhoneFrame.jsx';
import Icon from '../../components/site/Icon.jsx';
import '../../styles/gallery.css';
// What the steps above do not show (owner, 2026-10-29): «Гроші разом» came here from the steps; the chat, the
// portfolio, debts, credits and the FOP left (the steps show them).
const groups = [
  {
    id: 'daily',
    label: ['Щодня', 'Every day'],
    scenes: ['voice', 'receipt', 'drafts', 'premium', 'banks'],
  },
  {
    id: 'future',
    label: ['Плани', 'Looking ahead'],
    scenes: ['plan', 'goals', 'calendar', 'salary'],
  },
  {
    id: 'picture',
    label: ['Аналітика', 'The bigger picture'],
    scenes: ['analytics', 'cashflow', 'trends', 'capital'],
  },
  {
    id: 'accounts',
    label: ['Рахунки', 'Your accounts'],
    scenes: ['accounts', 'accountEditor', 'together'],
  },
];
const labels = {
  voice: ['Сказати. І записати.', 'Say it. Save it.'],
  receipt: ['Сфоткай чек. Розділи.', 'Snap the receipt. Split it.'],
  drafts: ['Перевірити. Підтвердити.', 'Review. Confirm.'],
  premium: ['Розкласти покупки з ШІ.', 'Let AI sort the purchases.'],
  banks: ['Твої банки поруч.', 'Your banks, together.'],
  plan: ['Місяць за твоїм планом.', 'A month on your terms.'],
  goals: ['Великі плани ближче.', 'Bigger plans, closer.'],
  calendar: ['Без забутих платежів.', 'No forgotten payments.'],
  salary: ['Від зарплати до зарплати.', 'From payday to payday.'],
  analytics: ['На що пішли гроші.', 'Where the money went.'],
  cashflow: ['Прийшло. Пішло. Залишилось.', 'In. Out. Left over.'],
  trends: ['Твої звички у цифрах.', 'Your habits in numbers.'],
  capital: ['Бачити свій капітал.', 'See your net worth.'],
  accounts: ['Кожним грошам своє місце.', 'A place for every penny.'],
  accountEditor: ['Баланс за твоїми правилами.', 'Balance, by your rules.'],
  together: ['Гроші разом.', 'Money together.'],
};
/** A screen of the gallery: Roma's captures, and «Гроші разом» the steps' own frame of shared savings. */
const screen = (lang, scene) =>
  scene === 'together'
    ? `/assets/journey/${lang}-i-savings.jpg`
    : `/assets/cinema/${lang}/screens/${scene}.webp`;
export default function FeatureGallery({ lang }) {
  const section = useRef(null);
  // The header turns cream while it is over this section.
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = section.current?.getBoundingClientRect();
      document.documentElement.dataset.headerTone =
        rect && rect.top <= 70 && rect.bottom > 70 ? 'light' : 'dark';
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    addEventListener('scroll', schedule, { passive: true });
    addEventListener('resize', schedule, { passive: true });
    update();
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener('scroll', schedule);
      removeEventListener('resize', schedule);
      delete document.documentElement.dataset.headerTone;
    };
  }, []);
  const [group, setGroup] = useState(0),
    [selected, setSelected] = useState('voice');
  const uk = lang === 'uk',
    column = uk ? 0 : 1,
    scenes = groups[group].scenes;
  const chooseGroup = (index) => {
    setGroup(index);
    setSelected(groups[index].scenes[0]);
  };
  return (
    <section ref={section} className="feature-gallery" id="closer" aria-labelledby="gallery-title">
      <div className="gallery-layout">
        <div className="gallery-intro">
          <p className="eyebrow">{uk ? 'Твій простір можливостей' : 'Your possibilities'}</p>
          <h2 id="gallery-title">
            <span>{uk ? 'Придивись' : 'Take a'}</span>
            <span className="hot">{uk ? 'ближче.' : 'closer look.'}</span>
          </h2>
          <p className="gallery-lead">
            {uk
              ? 'Обери те, що важливо тобі. Роздивись справжні екрани Dibsly у власному темпі.'
              : 'Choose what matters to you. Explore the real Dibsly screens at your own pace.'}
          </p>
        </div>
        <label className="gallery-select">
          <span>{uk ? 'Розділ' : 'Explore'}</span>
          <select
            value={group}
            onChange={(event) => chooseGroup(Number(event.target.value))}
            aria-label={uk ? 'Групи можливостей' : 'Feature groups'}
          >
            {groups.map((item, index) => (
              <option key={item.id} value={index}>
                {item.label[column]}
              </option>
            ))}
          </select>
        </label>
        <nav className="gallery-groups" aria-label={uk ? 'Групи можливостей' : 'Feature groups'}>
          {groups.map((item, index) => (
            <button
              type="button"
              key={item.id}
              onClick={() => chooseGroup(index)}
              aria-pressed={group === index}
            >
              {item.label[column]}
            </button>
          ))}
        </nav>
        <nav className="gallery-features" aria-label={uk ? 'Екрани застосунку' : 'App screens'}>
          {scenes.map((scene, index) => (
            <button
              key={scene}
              type="button"
              aria-pressed={selected === scene}
              onClick={() => setSelected(scene)}
            >
              <span>{String(index + 1).padStart(2, '0')}</span>
              {labels[scene][column]}
              <Icon name="arrow" />
            </button>
          ))}
        </nav>
        <div className="gallery-stage">
          <span className="gallery-stage-word" aria-hidden="true">
            {String(group + 1).padStart(2, '0')}
          </span>
          <IPhoneFrame className="gallery-device" data-journey-hole>
            <img
              key={selected}
              src={screen(lang, selected)}
              width="750"
              height="1631"
              alt={labels[selected][column]}
              loading="lazy"
              decoding="async"
            />
          </IPhoneFrame>
          <span className="gallery-screen-label" aria-live="polite">
            {labels[selected][column]}
          </span>
        </div>
        <a className="gallery-all" href={uk ? 'features-uk.html' : 'features.html'}>
          {uk ? 'Усі можливості та приклади' : 'All features and examples'}
          <Icon name="external" />
        </a>
      </div>
    </section>
  );
}
