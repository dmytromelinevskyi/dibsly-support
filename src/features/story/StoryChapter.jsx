import { useEffect, useRef, useState } from 'react';
import { createFilmView } from './film-view.js';
import IPhoneFrame from '../../components/device/IPhoneFrame.jsx';
import NativeSequence from '../cinema/NativeSequence.jsx';
import Icon from '../../components/site/Icon.jsx';
const phaseLabels = {
  uk: {
    tap: {
      focus: 'Знайди кнопку',
      press: 'Натискаємо',
      transition: 'Відкривається',
      result: 'Результат',
    },
    watch: { focus: 'Чекаємо', press: 'Приходить', transition: 'Приходить', result: 'Уже тут' },
  },
  en: {
    tap: { focus: 'Find the control', press: 'Tap', transition: 'Opening', result: 'The result' },
    watch: { focus: 'Waiting', press: 'Arriving', transition: 'Arriving', result: 'Already here' },
  },
};
const pad = (value) => String(value).padStart(2, '0');
/** The hand of the cues: the fingertip sits at the transform's origin (41% across, 5% down). */
function Hand() {
  return (
    <svg className="cue-hand" data-cue-hand viewBox="0 0 86 107" aria-hidden="true">
      <path d="M28 56L28 16C28 5 42 5 42 16L42 43C45 35 55 36 56 45C63 39 71 43 71 52C80 48 84 55 82 65L78 85C76 99 55 103 44 94L17 68C8 57 18 49 28 61Z" />
    </svg>
  );
}
export default function StoryChapter({ chapter, index, total, lang, reduced, side }) {
  const root = useRef(null),
    glass = useRef(null),
    video = useRef(null),
    view = useRef(null),
    [cue, setCue] = useState({
      step: 0,
      phase: 'focus',
      watch: Boolean(chapter.film.steps[0].watch),
    }),
    [playing, setPlaying] = useState(false);
  const uk = lang === 'uk',
    film = chapter.film,
    step = film.steps[cue.step];
  useEffect(() => {
    if (reduced) return;
    view.current = createFilmView({
      video: video.current,
      glass: glass.current,
      root: root.current,
      film,
      onStep: (step, phase, watch) => setCue({ step, phase, watch }),
      onPlaying: setPlaying,
    });
    return () => {
      view.current?.destroy();
      view.current = null;
    };
  }, [film, reduced]);
  return (
    <section
      ref={root}
      className="story-chapter"
      id={chapter.id}
      data-side={side}
      data-chapter={chapter.id}
    >
      <div className="story-copy">
        <p className="story-kicker">
          <span>{pad(index + 1)}</span> · {chapter.label}
        </p>
        <h2 className="story-title">
          <span>{chapter.title[0]}</span>
          <span className="hot">{chapter.title[1]}</span>
        </h2>
        <p className="story-lead">{chapter.description}</p>
        <a className="story-guide" href={`${uk ? 'help-uk.html' : 'help.html'}#${chapter.guide}`}>
          {uk ? 'Як це працює' : 'How it works'}
          <Icon name="external" />
        </a>
        {!reduced && (
          <div className="story-caption" data-phase={cue.phase}>
            <div className="caption-heading">
              <span className="caption-phase">
                {phaseLabels[lang][cue.watch ? 'watch' : 'tap'][cue.phase]}
              </span>
              <span className="caption-step">
                {pad(cue.step + 1)} / {pad(film.steps.length)}
              </span>
            </div>
            <strong className="caption-control">{step.control}</strong>
            <p className="caption-text" aria-live="polite">
              {step.description}
            </p>
            <div className="caption-progress">
              <i data-cue-progress />
            </div>
            <div className="caption-controls">
              <button
                type="button"
                className="caption-play"
                aria-pressed={playing}
                onClick={() => (playing ? view.current?.hold() : view.current?.play())}
              >
                <Icon name={playing ? 'pause' : 'play'} />
                <span>{playing ? (uk ? 'Пауза' : 'Pause') : uk ? 'Дивитися' : 'Watch'}</span>
              </button>
              <button
                type="button"
                disabled={cue.step === 0}
                onClick={() => view.current?.seek(cue.step - 1)}
                aria-label={uk ? 'Попередня дія' : 'Previous action'}
              >
                <Icon name="previous" />
              </button>
              <button
                type="button"
                disabled={cue.step === film.steps.length - 1}
                onClick={() => view.current?.seek(cue.step + 1)}
                aria-label={uk ? 'Наступна дія' : 'Next action'}
              >
                <Icon name="next" />
              </button>
              <span className="caption-count">
                {pad(index + 1)} / {pad(total)}
              </span>
            </div>
          </div>
        )}
      </div>
      <div className="story-device">
        {reduced ? (
          <NativeSequence film={film} lang={lang} label={chapter.label} />
        ) : (
          <IPhoneFrame className="story-phone" data-journey-hole>
            <div ref={glass} className="story-screen">
              <video
                ref={video}
                className="story-film"
                poster={'/' + film.poster}
                preload="none"
                muted
                playsInline
                loop
                disableRemotePlayback
                aria-label={chapter.label}
              />
              <div className="story-cue" aria-hidden="true">
                <i className="cue-outline" data-cue-outline />
                <i className="cue-ring" data-cue-ring />
                <Hand />
              </div>
            </div>
          </IPhoneFrame>
        )}
      </div>
    </section>
  );
}
