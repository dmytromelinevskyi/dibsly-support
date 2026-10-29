import { useState, useEffect } from 'react';
import { useMotion } from '../../features/motion/MotionProvider.jsx';
import Icon from './Icon.jsx';
export const STORE_URL = 'https://apps.apple.com/app/id6765870838';
export default function Header({ lang = 'uk', route = 'index.html' }) {
  const uk = lang === 'uk',
    landing = route === 'index.html' || route === 'en.html',
    home = uk ? './' : 'en.html';
  const [open, setOpen] = useState(false);
  const { reduced, system, toggle } = useMotion();
  const other = landing
    ? uk
      ? 'en.html'
      : './'
    : uk
      ? route.replace('-uk.html', '.html')
      : route.replace('.html', '-uk.html');
  useEffect(() => {
    if (!open) return;
    const onKey = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, [open]);
  return (
    <>
      <a className="skip-link" href="#main">
        {uk ? 'До вмісту' : 'Skip to content'}
      </a>
      <header className="site-header">
        <a className="site-brand" href={landing ? '#top' : home} aria-label="Dibsly">
          <img src="assets/brand/apple-touch-icon.png" alt="" width="32" height="32" />
          <span>
            Dibsly<span className="brand-dot">.</span>
          </span>
        </a>
        <nav className="site-nav" aria-label={uk ? 'Головне меню' : 'Main navigation'}>
          <a href={`${landing ? '' : home}#auto`}>{uk ? 'Можливості' : 'Explore'}</a>
          <a href={`${landing ? '' : home}#price`}>{uk ? 'Ціна' : 'Pricing'}</a>
          <a href={uk ? 'help-uk.html' : 'help.html'}>{uk ? 'Допомога' : 'Guides'}</a>
        </nav>
        <div className="site-header-actions">
          <button
            type="button"
            className="icon-button motion-button"
            onClick={toggle}
            disabled={system}
            aria-pressed={reduced}
            aria-label={
              uk
                ? reduced
                  ? 'Увімкнути анімацію'
                  : 'Зменшити рух'
                : reduced
                  ? 'Enable motion'
                  : 'Reduce motion'
            }
            title={uk ? 'Анімація' : 'Motion'}
          >
            <Icon name="motion" />
          </button>
          <a
            className="site-language"
            href={other}
            hrefLang={uk ? 'en' : 'uk'}
            lang={uk ? 'en' : 'uk'}
          >
            {uk ? 'EN' : 'UK'}
          </a>
          <a className="store-link" href={STORE_URL}>
            <Icon name="apple" />
            <span>{uk ? 'Завантажити' : 'Get Dibsly'}</span>
            <Icon name="external" />
          </a>
          <button
            type="button"
            className="icon-button menu-button"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-controls="site-menu"
            aria-label={uk ? 'Меню' : 'Menu'}
          >
            <Icon name={open ? 'close' : 'menu'} />
          </button>
        </div>
      </header>
      {open ? (
        <nav className="site-menu" id="site-menu" aria-label={uk ? 'Розділи' : 'Sections'}>
          {[
            [`${home}#auto`, uk ? 'Можливості' : 'Explore'],
            [`${home}#price`, uk ? 'Ціна' : 'Pricing'],
            [uk ? 'features-uk.html' : 'features.html', uk ? 'Усі функції' : 'All features'],
            [uk ? 'help-uk.html' : 'help.html', uk ? 'Інструкції' : 'Guides'],
            ['https://my.dibslyapp.com', uk ? 'Вебверсія' : 'Web app'],
          ].map(([href, label], i) => (
            <a key={href} href={href} onClick={() => setOpen(false)}>
              <span>0{i + 1}</span>
              {label}
              <Icon name="external" />
            </a>
          ))}
          <button
            type="button"
            className="menu-motion"
            onClick={() => {
              toggle();
              setOpen(false);
            }}
            disabled={system}
            aria-pressed={reduced}
          >
            <Icon name="motion" />
            {uk
              ? reduced
                ? 'Увімкнути анімацію'
                : 'Зменшити рух'
              : reduced
                ? 'Enable motion'
                : 'Reduce motion'}
          </button>
        </nav>
      ) : null}
    </>
  );
}
