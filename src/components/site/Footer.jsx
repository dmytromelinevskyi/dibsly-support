// Dibsly's social accounts (owner, 2026-11-09: «сделать ссылки на соцсети»); icons are Tabler's outline brands (MIT).
const SOCIAL = [
  [
    'Instagram',
    'https://www.instagram.com/dibslyapp/',
    [
      'M4 8a4 4 0 0 1 4 -4h8a4 4 0 0 1 4 4v8a4 4 0 0 1 -4 4h-8a4 4 0 0 1 -4 -4l0 -8',
      'M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0',
      'M16.5 7.5v.01',
    ],
  ],
  [
    'Threads',
    'https://www.threads.com/@dibslyapp',
    [
      'M19 7.5c-1.333 -3 -3.667 -4.5 -7 -4.5c-5 0 -8 2.5 -8 9s3.5 9 8 9s7 -3 7 -5s-1 -5 -7 -5c-2.5 0 -3 1.25 -3 2.5c0 1.5 1 2.5 2.5 2.5c2.5 0 3.5 -1.5 3.5 -5s-2 -4 -3 -4s-1.833 .333 -2.5 1',
    ],
  ],
  [
    'TikTok',
    'https://www.tiktok.com/@dibslyapp',
    [
      'M21 7.917v4.034a9.948 9.948 0 0 1 -5 -1.951v4.5a6.5 6.5 0 1 1 -8 -6.326v4.326a2.5 2.5 0 1 0 4 2v-11.5h4.083a6.005 6.005 0 0 0 4.917 4.917',
    ],
  ],
  [
    'Facebook',
    'https://www.facebook.com/dibslyapp',
    ['M7 10v4h3v7h4v-7h3l1 -4h-4v-2a1 1 0 0 1 1 -1h3v-4h-3a5 5 0 0 0 -5 5v2h-3'],
  ],
];

export default function Footer({ lang = 'uk' }) {
  const uk = lang === 'uk';
  return (
    <footer className="site-footer">
      <div className="footer-wordmark" aria-label="Dibsly">
        Dibsly
        <span className="footer-period" aria-hidden="true">
          .<i data-journey-destination />
        </span>
      </div>
      <nav
        className="footer-social"
        aria-label={uk ? 'Dibsly у соцмережах' : 'Dibsly on social media'}
      >
        {SOCIAL.map(([name, href, paths]) => (
          <a
            key={name}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={name}
            title={name}
          >
            <svg
              viewBox="0 0 24 24"
              width="22"
              height="22"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              {paths.map((d) => (
                <path key={d} d={d} />
              ))}
            </svg>
          </a>
        ))}
      </nav>
      <div className="footer-bottom">
        <span>© 2026 Dibsly</span>
        <nav aria-label={uk ? 'Додаткові посилання' : 'More information'}>
          {[
            [uk ? 'features-uk.html' : 'features.html', uk ? 'Можливості' : 'Features'],
            [uk ? 'support-uk.html' : 'support.html', uk ? 'Підтримка' : 'Support'],
            [uk ? 'privacy-uk.html' : 'privacy.html', uk ? 'Конфіденційність' : 'Privacy'],
            [uk ? 'terms-uk.html' : 'terms.html', uk ? 'Умови' : 'Terms'],
          ].map(([href, label]) => (
            <a key={href} href={href}>
              {label}
            </a>
          ))}
        </nav>
        <a href="https://my.dibslyapp.com">my.dibslyapp.com ↗</a>
      </div>
    </footer>
  );
}
