import { useEffect, useRef } from 'react';
import content from '../../content/journey.json';
import { STORE_URL } from '../../components/site/Header.jsx';
import IPhoneFrame from '../../components/device/IPhoneFrame.jsx';
import { useMotion } from '../motion/MotionProvider.jsx';
import '../../styles/journey.css';
/** The frames the six steps' scenes show (main's journey() in journey-engine.js names them). Owner, 2026-10-29: the
 * investments before the FOP, «Гроші разом» after it, «Олдскул» in the gallery. */
const used = new Set([
  'a-d0',
  'a-d1',
  'a-d2',
  'a-d2-saved',
  'c-chat-top',
  'c-chat',
  'c-chat-saved',
  'c-invest',
  'i-savings',
  'i-savings-accounts',
  'f-main-money',
  'f-debt',
  'f-credits',
  'c-fop',
]);
const asset = (name) => `/assets/journey/${name}`;
/** A title's words, each its own span, so the engine raises them without touching React's nodes. */
// Each word rises inside its own mask: on a phone a title's line wraps, and a word hidden under a line's mask showed in
// the row below it (owner, 2026-10-29: «В одному» stood alone before the hero came in).
function Words({ text }) {
  return text.split(/(\s+)/).map((part, index) =>
    /^\s+$/.test(part) ? (
      part
    ) : part ? (
      <span className="word-mask" key={index}>
        <span className="word">{part}</span>
      </span>
    ) : null
  );
}
function Title({ as: Tag, className, lines }) {
  return (
    <Tag className={className}>
      {lines.map((line, index) => (
        <span key={index} className={`line${line.tone ? ` ${line.tone}` : ''}`}>
          <Words text={line.text} />
        </span>
      ))}
    </Tag>
  );
}
const tabIcons = [
  <svg key="main" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 3.2L2.6 11.3l1.3 1.5 1.6-1.4V20h5v-5h3v5h5v-8.6l1.6 1.4 1.3-1.5z" />
  </svg>,
  <svg key="history" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="5" y="3" width="14" height="18" rx="2.5" />
    <path d="M8.5 8h7M8.5 12h7M8.5 16h4" />
  </svg>,
  <svg key="analytics" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 3v9l6.4 6.4M12 12H3.2" />
  </svg>,
];
/**
 * The landing's hero and steps as on dibslyapp.com 3.0 (owner, 2026-10-29: «просто взять со самого dibslyapp все
 * анимации»): the hero's phone stays and shows the app step by step — the app's own frames, a finger's taps, the
 * notifications, a highlight and a toast drawn over them — in Roma's frame, without the tilt.
 */
export default function JourneyLanding({ lang }) {
  const root = useRef(null),
    { reduced } = useMotion(),
    data = content[lang],
    steps = data.steps;
  useEffect(() => {
    let stop = null,
      cancelled = false;
    import('./journey-engine.js')
      .then(({ startJourney }) => startJourney(root.current, { lang, reduced }))
      .then((cleanup) => {
        if (cancelled) cleanup();
        else stop = cleanup;
      })
      // No engine (a network error): the page is simply there, as with «reduce motion».
      .catch(() => document.documentElement.classList.add('no-motion'));
    return () => {
      cancelled = true;
      stop?.();
    };
  }, [lang, reduced]);
  return (
    <div ref={root} className="v3">
      <nav className="rail" aria-label={data.railLabel}>
        <ol>
          <li data-for="top">
            <a href="#top" aria-label={data.railTop}>
              00
            </a>
          </li>
          {steps.map((step) => (
            <li key={step.id} data-for={step.id}>
              <a href={`#${step.id}`} aria-label={step.kicker}>
                {step.kicker.slice(0, 2)}
              </a>
            </li>
          ))}
        </ol>
      </nav>
      <div className="journey wrap">
        <div className="journey-stage">
          <div className="stage-sticky">
            <div className="phone-lift">
              <div className="phone-magnet">
                <IPhoneFrame className="hero-phone">
                  <div className="screen" data-tabs={data.tabs}>
                    <div className="live">
                      <img
                        className="screen-long"
                        src={asset(`${lang}-main-empty.jpg`)}
                        alt={data.stripAlt}
                        width="750"
                        height="3249"
                        fetchPriority="high"
                      />
                      <div className="ios-top" aria-hidden="true">
                        <img
                          className="ios-head"
                          src={asset(`${lang}-main-head.jpg`)}
                          alt=""
                          width="750"
                          height="221"
                        />
                      </div>
                      <i className="ios-home" aria-hidden="true" />
                      <div className="ios-tabbar" aria-hidden="true">
                        <div className="ios-pill">
                          {data.tabLabels.map((label, index) => (
                            <span key={label} className={`ios-tab${index ? '' : ' on'}`}>
                              {tabIcons[index]}
                              {label}
                            </span>
                          ))}
                        </div>
                        <img
                          className="ios-dibsly"
                          src={asset('dibsly-button.png')}
                          alt=""
                          width="184"
                          height="184"
                        />
                        <span className="ios-plus">
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.4"
                            strokeLinecap="round"
                          >
                            <path d="M12 5v14M5 12h14" />
                          </svg>
                        </span>
                      </div>
                    </div>
                    <div className="frames" aria-hidden="true">
                      <div className="sheet-dim" />
                      <img
                        className="push-bar"
                        src={asset(`${lang}-a-d0.jpg`)}
                        alt=""
                        width="750"
                        height="1631"
                      />
                      {data.frames
                        .filter((frame) => used.has(frame.name))
                        .map((frame) => (
                          <img
                            key={frame.name}
                            className="frame"
                            data-frame={frame.name}
                            src={asset(`${lang}-${frame.name}.jpg`)}
                            alt={frame.alt}
                            width="750"
                            height="1631"
                            decoding="async"
                            fetchPriority="low"
                          />
                        ))}
                    </div>
                    <div className="fx" aria-hidden="true">
                      <div className="banner">
                        <img
                          src="/assets/brand/apple-touch-icon.png"
                          alt=""
                          width="38"
                          height="38"
                        />
                        <div>
                          <b>
                            {data.fx.banner[0]} <span>{data.fx.banner[1]}</span>
                          </b>
                          <p>{data.fx.banner[2]}</p>
                          <p className="dim-line">{data.fx.banner[3]}</p>
                        </div>
                      </div>
                      <div className="bank">
                        <i className="bank-icon">
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.7"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M3.5 9.5L12 4.5l8.5 5M5.5 10.5v7M10 10.5v7M14 10.5v7M18.5 10.5v7M3.5 20h17" />
                          </svg>
                        </i>
                        <div>
                          <b>
                            {data.fx.bank[0]} <span>{data.fx.bank[1]}</span>
                          </b>
                          <p>{data.fx.bank[2]}</p>
                        </div>
                      </div>
                      <div className="hl" />
                      <div className="tap" />
                      <div className="touch">
                        <svg viewBox="0 0 86 107">
                          <path d="M28 56L28 16C28 5 42 5 42 16L42 43C45 35 55 36 56 45C63 39 71 43 71 52C80 48 84 55 82 65L78 85C76 99 55 103 44 94L17 68C8 57 18 49 28 61Z" />
                        </svg>
                      </div>
                      <div
                        className="app-toast"
                        data-auto={data.fx.toast.auto}
                        data-plus={data.fx.toast.plus}
                      >
                        <img src="/assets/brand/dibsly-dark.png" alt="" width="40" height="38" />
                        <div>
                          <b>{data.fx.toast.title}</b>
                          <span>{data.fx.toast.line}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </IPhoneFrame>
              </div>
            </div>
            {/* Phones and tablets: the steps' words under the phone, in the same stuck block, so they are always
                right under it whatever Safari's bars do (owner, 2026-10-29); the steps' own words are for wide
                screens and screen readers. */}
            <div className="stage-captions" aria-hidden="true">
              {steps.map((step) => (
                <div key={step.id} className="stage-caption" data-for={step.id}>
                  <p className="kicker">{step.kicker}</p>
                  <p className="caption-title">
                    {step.title.map((line, index) => (
                      <span key={index} className={`line${line.tone ? ` ${line.tone}` : ''}`}>
                        {line.text}
                      </span>
                    ))}
                  </p>
                  <p className="caption-lead">{step.lead}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <section className="hero" id="top" data-section data-scene="hero">
          <div className="hero-copy">
            <p className="kicker">
              <span className="dot" />
              {data.hero.kicker}
            </p>
            <Title as="h1" className="hero-title" lines={data.hero.title} />
            <p className="lead fade-up">{data.hero.lead}</p>
            <div className="actions fade-up">
              <a className="button light" href={STORE_URL} target="_blank" rel="noopener">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M16.4 12.6c0-2.4 2-3.6 2.1-3.7-1.1-1.7-2.9-1.9-3.5-1.9-1.5-.2-2.9.9-3.7.9-.8 0-1.9-.9-3.2-.8-1.6 0-3.1 1-4 2.4-1.7 3-.4 7.4 1.2 9.8.8 1.2 1.8 2.5 3 2.4 1.2 0 1.7-.8 3.1-.8 1.5 0 1.9.8 3.2.8 1.3 0 2.1-1.2 2.9-2.4.9-1.4 1.3-2.7 1.3-2.8 0 0-2.4-1-2.4-3.9zM14 5.5c.7-.8 1.1-1.9 1-3-1 0-2.1.7-2.8 1.5-.6.7-1.2 1.8-1 2.9 1.1.1 2.1-.6 2.8-1.4z" />
                </svg>
                {data.hero.download}
              </a>
              <a
                className="button ghost"
                href="https://my.dibslyapp.com"
                target="_blank"
                rel="noopener"
              >
                {data.hero.web} <span aria-hidden="true">→</span>
              </a>
            </div>
            <ul className="platforms fade-up" aria-label={data.hero.platformsLabel}>
              {data.hero.platforms.map((item) => (
                <li key={item.text} className={item.soon ? 'soon' : undefined}>
                  {item.text}
                </li>
              ))}
            </ul>
          </div>
        </section>
        {steps.map((step, index) => (
          <section
            key={step.id}
            className="step"
            id={step.id}
            data-section
            data-scene={step.id}
            // The hero's phone is on the right; step 01 flies it to the left, then in turn (owner, 2026-10-29).
            data-side={index % 2 ? 'right' : 'left'}
            style={{ '--row': index + 2 }}
          >
            <div className="step-copy">
              <p className="kicker">{step.kicker}</p>
              <Title as="h2" className="title" lines={step.title} />
              <p className="lead reveal">{step.lead}</p>
              {step.note && <p className="note reveal">{step.note}</p>}
              {step.tags && (
                <ul className="step-tags reveal">
                  {step.tags.map((tag) => (
                    <li key={tag}>{tag}</li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        ))}
        <div className="journey-end" style={{ '--row': steps.length + 2 }} aria-hidden="true" />
        <a className="scroll-hint" href={`#${steps[0].id}`}>
          <span>{data.scroll}</span>
          <i />
        </a>
      </div>
    </div>
  );
}
