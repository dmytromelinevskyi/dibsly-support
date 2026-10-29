import IPhoneFrame from '../../components/device/IPhoneFrame.jsx';
import { useState } from 'react';
import { capturePath } from './capture-path.js';
export default function ScreenshotDeck({ shots: inputShots, lang }) {
  const shots = inputShots.filter(
    (shot, index) =>
      inputShots.findIndex((other) => capturePath(other.src) === capturePath(shot.src)) === index
  );
  const [index, setIndex] = useState(0);
  const uk = lang === 'uk';
  return (
    <div className="reference-demo">
      <IPhoneFrame className="reference-device">
        <img
          className="on"
          src={capturePath(shots[index].src)}
          alt={shots[index].alt || ''}
          width="750"
          height="1631"
          loading="lazy"
        />
      </IPhoneFrame>
      {shots.length > 1 ? (
        <div className="reference-controls">
          <button
            type="button"
            onClick={() => setIndex(Math.max(0, index - 1))}
            disabled={!index}
            aria-label={uk ? 'Попередній екран' : 'Previous screen'}
          >
            ←
          </button>
          <span>
            {index + 1} / {shots.length}
          </span>
          <button
            type="button"
            onClick={() => setIndex(Math.min(shots.length - 1, index + 1))}
            disabled={index === shots.length - 1}
            aria-label={uk ? 'Наступний екран' : 'Next screen'}
          >
            →
          </button>
        </div>
      ) : null}
    </div>
  );
}
