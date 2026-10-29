import { useEffect, useRef } from 'react';
import { attachNav } from './nav-menu.js';
import '../../styles/nav.css';
export const STORE_URL = 'https://apps.apple.com/app/id6765870838';
const chevron = (
  <svg viewBox="0 0 10 10" aria-hidden="true">
    <path
      d="M1.5 3.5 5 7l3.5-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
/**
 * dibslyapp.com's header (main's 3.0 nav, owner, 2026-10-29: «не хватает бургера как на старой версии + доп пунктов
 * меню»): the dark pill with «Можливості ▾», «Допомога ▾», «Ціна», «Питання», the language, «Увійти» and «Завантажити»;
 * under 900 px a burger opens it all as a sheet. The site's motion switch is gone (owner: «режим ноу моушен… уберем»).
 */
export default function Header({ lang = 'uk', route = 'index.html' }) {
  const root = useRef(null),
    uk = lang === 'uk',
    landing = route === 'index.html' || route === 'en.html',
    home = uk ? './' : 'en.html',
    at = (anchor) => `${landing ? '' : home}#${anchor}`,
    other = landing
      ? uk
        ? 'en.html'
        : './'
      : uk
        ? route.replace('-uk.html', '.html')
        : route.replace('.html', '-uk.html'),
    page = (name) => (uk ? `${name}-uk.html` : `${name}.html`),
    current = (href) => (href === route ? 'page' : undefined);
  const features = [
      [at('auto'), uk ? 'Як це працює' : 'How it works'],
      [page('features'), uk ? 'Усі можливості' : 'All features'],
      [at('everywhere'), uk ? 'Портал і ШІ' : 'Website & AI'],
    ],
    help = [
      [page('help'), uk ? 'Інструкції' : 'Guide'],
      [page('support'), uk ? 'Підтримка' : 'Support'],
      [page('privacy'), uk ? 'Конфіденційність' : 'Privacy'],
      [page('terms'), uk ? 'Умови' : 'Terms'],
    ],
    links = [
      [at('price'), uk ? 'Ціна' : 'Pricing'],
      [at('faq'), uk ? 'Питання' : 'FAQ'],
    ],
    rememberLanguage = () => {
      try {
        localStorage.setItem('dibsly.site.lang', uk ? 'en' : 'uk');
      } catch {}
    },
    brand = (
      <a className="brand" href={landing ? '#top' : home}>
        <img src="/assets/brand/apple-touch-icon.png" alt="" width="28" height="28" />
        <span>
          Dibsly<span className="brand-dot">.</span>
        </span>
      </a>
    ),
    language = (wide) => (
      <a
        className="lang"
        href={other}
        hrefLang={uk ? 'en' : 'uk'}
        lang={uk ? 'en' : 'uk'}
        aria-label={wide ? undefined : uk ? 'English' : 'Українська'}
        onClick={rememberLanguage}
      >
        {wide ? (uk ? 'English' : 'Українська') : uk ? 'EN' : 'УКР'}
      </a>
    ),
    pills = (
      <>
        <a className="pill ghost" href="https://my.dibslyapp.com" target="_blank" rel="noopener">
          {uk ? 'Увійти' : 'Sign in'}
        </a>
        <a className="pill hot" href={STORE_URL} target="_blank" rel="noopener">
          {uk ? 'Завантажити' : 'Download'}
        </a>
      </>
    );
  useEffect(() => attachNav(root.current), [lang, route]);
  return (
    <div ref={root}>
      <a className="skip-link" href="#main">
        {uk ? 'До вмісту' : 'Skip to content'}
      </a>
      <header className="nav">
        <nav className="nav-pill" aria-label={uk ? 'Головне меню' : 'Main menu'}>
          {brand}
          <ul className="nav-menu">
            {[
              ['features', uk ? 'Можливості' : 'Features', features],
              ['help', uk ? 'Допомога' : 'Help', help],
            ].map(([id, label, items]) => (
              <li className="nav-group" key={id}>
                <button
                  className="nav-top"
                  type="button"
                  aria-expanded="false"
                  aria-controls={`nav-${id}-${lang}`}
                >
                  <span>{label}</span>
                  {chevron}
                </button>
                <div className="nav-drop" id={`nav-${id}-${lang}`}>
                  {items.map(([href, text]) => (
                    <a key={href} href={href} aria-current={current(href)}>
                      {text}
                    </a>
                  ))}
                </div>
              </li>
            ))}
            {links.map(([href, text]) => (
              <li key={href}>
                <a className="nav-top" href={href}>
                  {text}
                </a>
              </li>
            ))}
          </ul>
          <div className="nav-actions">
            {language(false)}
            {pills}
            <button
              className="nav-burger"
              type="button"
              aria-expanded="false"
              aria-controls={`nav-sheet-${lang}`}
              aria-label={uk ? 'Відкрити меню' : 'Open menu'}
            >
              <svg viewBox="0 0 18 18" aria-hidden="true">
                <path
                  d="M2 5.5h14M2 12.5h14"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </nav>
      </header>
      <div
        className="nav-sheet"
        id={`nav-sheet-${lang}`}
        role="dialog"
        aria-modal="true"
        aria-label={uk ? 'Меню' : 'Menu'}
        data-lenis-prevent
        hidden
      >
        <div className="nav-sheet-top">
          {brand}
          <button
            className="nav-close"
            type="button"
            aria-label={uk ? 'Закрити меню' : 'Close menu'}
          >
            <svg viewBox="0 0 18 18" aria-hidden="true">
              <path
                d="M4 4l10 10M14 4 4 14"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
        <nav className="nav-sheet-body" aria-label={uk ? 'Головне меню' : 'Main menu'}>
          {[
            [uk ? 'Можливості' : 'Features', features],
            [uk ? 'Допомога' : 'Help', help],
            [null, links],
          ].map(([title, items], index) => (
            <div className="nav-sheet-group" key={index}>
              {title && <p>{title}</p>}
              {items.map(([href, text]) => (
                <a key={href} href={href} aria-current={current(href)}>
                  {text}
                </a>
              ))}
            </div>
          ))}
        </nav>
        <div className="nav-sheet-foot">
          {language(true)}
          {pills}
        </div>
      </div>
    </div>
  );
}
