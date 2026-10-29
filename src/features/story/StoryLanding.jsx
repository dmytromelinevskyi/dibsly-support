import { useEffect, useRef, useState } from 'react';
import { useMotion } from '../motion/MotionProvider.jsx';
import { getChapters, heroCopy, landingChapterIds } from '../cinema/story.js';
import { STORE_URL } from '../../components/site/Header.jsx';
import Icon from '../../components/site/Icon.jsx';
import IPhoneFrame from '../../components/device/IPhoneFrame.jsx';
import StoryChapter from './StoryChapter.jsx';
import { attachJourney } from './journey-driver.js';
import '../../styles/story.css';
/**
 * The light landing (owner, 2026-10-29): Roma's frame and phone, no 3D world. Each chapter's phone stands still,
 * left and right in turn, and plays its film while it is on the screen; the line with its dot runs through the page.
 */
export default function StoryLanding({ lang, routeCanvas }) {
  const element = useRef(null),
    [active, setActive] = useState(-1);
  const { reduced } = useMotion(),
    copy = heroCopy[lang],
    chapters = getChapters(lang, landingChapterIds),
    uk = lang === 'uk';
  useEffect(() => {
    if (reduced || !routeCanvas.current) return;
    const journey = attachJourney(routeCanvas.current);
    return () => journey.destroy();
  }, [reduced]);
  useEffect(() => {
    const sections = [...element.current.querySelectorAll('[data-chapter]')],
      seen = new Map();
    // A chapter is current while it crosses the middle of the window.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) seen.set(entry.target, entry.isIntersecting);
        setActive(sections.findIndex((section) => seen.get(section)));
      },
      { rootMargin: '-50% 0px -50% 0px' }
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [lang]);
  return (
    <div ref={element} className={`story${reduced ? ' is-reduced' : ''}`}>
      <section className="story-hero" id="top">
        <div className="story-hero-copy">
          <p className="story-kicker">
            <span className="kicker-dot" />
            {copy.eyebrow}
          </p>
          <h1 className="story-hero-title">
            <span>{copy.title[0]}</span>
            <span className="hot">{copy.title[1]}</span>
          </h1>
          <p className="story-hero-lead">{copy.lead}</p>
          <div className="story-actions">
            <a className="story-button light" href={STORE_URL}>
              <Icon name="apple" />
              {copy.download}
            </a>
            <a className="story-button ghost" href="https://my.dibslyapp.com">
              {copy.web}
              <Icon name="external" />
            </a>
          </div>
          <p className="story-platforms">{copy.platforms}</p>
        </div>
        <div className="story-device">
          <IPhoneFrame className="story-phone" data-journey-hole>
            <img
              src={`/assets/cinema/${lang}/main.webp`}
              width="750"
              height="1631"
              alt={uk ? 'Головна Dibsly' : 'Dibsly Main'}
              fetchPriority="high"
            />
          </IPhoneFrame>
        </div>
        <a className="story-scroll" href={`#${chapters[0].id}`}>
          {copy.scroll}
          <Icon name="down" />
        </a>
      </section>
      {chapters.map((chapter, index) => (
        <StoryChapter
          key={chapter.id}
          chapter={chapter}
          index={index}
          total={chapters.length}
          lang={lang}
          reduced={reduced}
          side={index % 2 ? 'right' : 'left'}
        />
      ))}
      <nav
        className="story-rail"
        data-visible={active >= 0}
        aria-label={uk ? 'Кроки сторінки' : 'Page steps'}
      >
        {chapters.map((chapter, index) => (
          <a
            key={chapter.id}
            href={`#${chapter.id}`}
            aria-label={`${String(index + 1).padStart(2, '0')} · ${chapter.label}`}
            aria-current={active === index ? 'step' : undefined}
          >
            {String(index + 1).padStart(2, '0')}
          </a>
        ))}
      </nav>
    </div>
  );
}
