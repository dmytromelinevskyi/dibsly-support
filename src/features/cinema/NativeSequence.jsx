import { useState } from 'react';
import Icon from '../../components/site/Icon.jsx';
import IPhoneFrame from '../../components/device/IPhoneFrame.jsx';
export default function NativeSequence({ film, lang, label }) {
  const [index, setIndex] = useState(0),
    step = film.steps[index];
  return (
    <figure className="native-sequence">
      <IPhoneFrame>
        <img
          src={step.after}
          width="640"
          height="1392"
          alt={label}
          loading="lazy"
          decoding="async"
        />
      </IPhoneFrame>
      <figcaption>
        <strong>{step.control}</strong>
        <p aria-live="polite">{step.description}</p>
        <div className="native-controls">
          <button
            type="button"
            onClick={() => setIndex(Math.max(0, index - 1))}
            disabled={!index}
            aria-label={lang === 'uk' ? 'Попередня дія' : 'Previous action'}
          >
            <Icon name="previous" />
          </button>
          <span>
            {index + 1} / {film.steps.length}
          </span>
          <button
            type="button"
            onClick={() => setIndex(Math.min(film.steps.length - 1, index + 1))}
            disabled={index === film.steps.length - 1}
            aria-label={lang === 'uk' ? 'Наступна дія' : 'Next action'}
          >
            <Icon name="next" />
          </button>
        </div>
      </figcaption>
    </figure>
  );
}
