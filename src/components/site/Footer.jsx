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
