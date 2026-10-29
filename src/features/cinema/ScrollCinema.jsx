import { useEffect, useRef, useState } from 'react';
import { useMotion } from '../motion/MotionProvider.jsx';
import { getChapters, heroCopy } from './story.js';
import { STORE_URL } from '../../components/site/Header.jsx';
import Icon from '../../components/site/Icon.jsx';
import NativeSequence from './NativeSequence.jsx';
import IPhoneFrame from '../../components/device/IPhoneFrame.jsx';
import '../../styles/cinema.css';
export default function ScrollCinema({ lang, routeCanvas, worldCanvas }) {
  const element = useRef(null),
    runtime = useRef(null),
    [status, setStatus] = useState('loading'),
    [active, setActive] = useState(-1);
  const { reduced } = useMotion(),
    copy = heroCopy[lang],
    chapters = getChapters(lang);
  useEffect(() => {
    if (reduced) {
      setStatus('static');
      return;
    }
    let cancelled = false;
    setStatus('loading');
    import('./runtime.js')
      .then(({ createCinema }) => {
        if (cancelled) return;
        runtime.current = createCinema({
          canvas: worldCanvas.current,
          routeCanvas: routeCanvas.current,
          element: element.current,
          lang,
          onReady: () => {
            if (!cancelled) setStatus('enhanced');
          },
          onUnsupported: () => {
            if (!cancelled) setStatus('static');
          },
          onChapter: setActive,
        });
      })
      .catch(() => {
        if (!cancelled) setStatus('static');
      });
    return () => {
      cancelled = true;
      runtime.current?.destroy();
      runtime.current = null;
    };
  }, [lang, reduced]);
  return (
    <div ref={element} className={`scroll-cinema is-${status}${reduced ? ' is-reduced' : ''}`}>
      <section className="cinema-hero" id="top">
        <div className="hero-content">
          <p className="eyebrow">
            <span />
            {copy.eyebrow}
          </p>
          <h1>
            {copy.title[0]}
            <br />
            <span>{copy.title[1]}</span>
          </h1>
          <p className="hero-description">{copy.lead}</p>
          <div className="hero-actions">
            <a className="cinema-button primary" href={STORE_URL}>
              <Icon name="apple" />
              {copy.download}
              <Icon name="external" />
            </a>
            <a className="cinema-text-link" href="https://my.dibslyapp.com">
              {copy.web}
              <Icon name="external" />
            </a>
          </div>
          <span className="hero-platforms">{copy.platforms}</span>
        </div>
        <div className="hero-fallback">
          <IPhoneFrame>
            <img
              src={`/assets/cinema/${lang}/main.webp`}
              width="750"
              height="1631"
              alt={lang === 'uk' ? 'Головна Dibsly' : 'Dibsly Main'}
            />
          </IPhoneFrame>
        </div>
        <div className="hero-bottom">
          <p className="hero-interaction">
            <span className="interaction-symbol">✳</span>
            {copy.interaction}
          </p>
          <a className="hero-scroll" href="#auto">
            {copy.scroll}
            <Icon name="down" />
          </a>
        </div>
        <div className="hero-signature" aria-hidden="true">
          Dibsly<span>.</span>
        </div>
      </section>
      <div className="cinema-chapters">
        {chapters.map((chapter, index) => (
          <section
            className="cinema-chapter"
            id={chapter.id}
            key={chapter.id}
            style={{
              '--film-scroll': `${Math.max(900, Math.round(chapter.film.duration * 60))}px`,
            }}
            data-chapter={chapter.id}
          >
            <div className="chapter-sticky">
              <article className="chapter-copy">
                <div className="chapter-heading">
                  <p className="chapter-eyebrow">
                    <span>{String(index + 1).padStart(2, '0')} / 09</span>
                    {chapter.label}
                  </p>
                  <h2>
                    {chapter.title[0]}
                    <br />
                    <span>{chapter.title[1]}</span>
                  </h2>
                  <p className="chapter-description">{chapter.description}</p>
                  <a
                    className="chapter-guide"
                    href={`${lang === 'uk' ? 'help-uk.html' : 'help.html'}#${chapter.guide}`}
                  >
                    {lang === 'uk' ? 'Як це працює' : 'How it works'}
                    <Icon name="external" />
                  </a>
                </div>
                <div className="chapter-caption">
                  <div className="cue-heading">
                    <span data-phase>{lang === 'uk' ? 'Знайди кнопку' : 'Find the control'}</span>
                    <span data-step>01 / {String(chapter.film.steps.length).padStart(2, '0')}</span>
                  </div>
                  <strong className="cue-control" data-control>
                    {chapter.film.steps[0].control}
                  </strong>
                  <p data-caption>{chapter.film.steps[0].description}</p>
                  <div className="film-progress">
                    <i />
                  </div>
                  <div className="film-controls">
                    <button type="button" data-play aria-pressed="false">
                      <Icon name="play" className="play-mark" />
                      <Icon name="pause" className="pause-mark" />
                      <span>{lang === 'uk' ? 'Дивитися' : 'Watch'}</span>
                    </button>
                    <span className="scroll-hint">
                      {lang === 'uk' ? 'або гортай повільно' : 'or scroll slowly'}
                    </span>
                    <button
                      type="button"
                      disabled
                      data-skip="-1"
                      aria-label={lang === 'uk' ? 'Попередня дія' : 'Previous action'}
                    >
                      <Icon name="previous" />
                    </button>
                    <button
                      type="button"
                      disabled={chapter.film.steps.length === 1}
                      data-skip="1"
                      aria-label={lang === 'uk' ? 'Наступна дія' : 'Next action'}
                    >
                      <Icon name="next" />
                    </button>
                  </div>
                </div>
              </article>
              <NativeSequence film={chapter.film} lang={lang} label={chapter.label} />
              <span className="chapter-word" aria-hidden="true">
                {chapter.word}
              </span>
            </div>
          </section>
        ))}
      </div>
      <nav
        className="cinema-rail"
        aria-label={lang === 'uk' ? 'Сцени демонстрації' : 'Demo chapters'}
      >
        <span className="rail-caption">
          {active >= 0
            ? chapters[active]?.label
            : lang === 'uk'
              ? 'Твій світ фінансів'
              : 'Your world of money'}
        </span>
        <div>
          {chapters.map((chapter, index) => (
            <a
              key={chapter.id}
              href={`#${chapter.id}`}
              aria-label={`${String(index + 1).padStart(2, '0')} · ${chapter.label}`}
              aria-current={active === index ? 'step' : undefined}
            >
              <span>{String(index + 1).padStart(2, '0')}</span>
              <i />
            </a>
          ))}
        </div>
        <span className="rail-energy" data-energy aria-hidden="true">
          00 / 24
        </span>
      </nav>
    </div>
  );
}
