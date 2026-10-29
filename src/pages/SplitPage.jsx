import { useEffect, useState } from 'react';
import { STORE_URL } from '../components/site/Header.jsx';
import ReceiptView from '../features/receipts/ReceiptView.jsx';
import { receiptStrings } from '../features/receipts/strings.js';
import { decodeReceipt } from '../features/receipts/model.js';
import '../styles/split.css';
export default function SplitPage() {
  const [state, setState] = useState({ lang: 'en', receipt: null, error: '' });
  useEffect(() => {
    const detected = navigator.language.slice(0, 2),
      lang = receiptStrings[detected] ? detected : 'en',
      t = receiptStrings[lang];
    document.documentElement.lang = lang;
    document.title = t.title;
    let cancelled = false,
      generation = 0;
    function load() {
      const current = ++generation,
        fragment = window.DIBSLY_SPLIT || location.hash.slice(1);
      const error = window.DIBSLY_SPLIT_EXPIRED
        ? t.expired
        : !fragment
          ? t.broken
          : typeof DecompressionStream === 'undefined'
            ? t.old
            : '';
      if (error) {
        setState({ lang, receipt: null, error });
        return;
      }
      setState({ lang, receipt: null, error: '' });
      decodeReceipt(fragment)
        .then((receipt) => {
          if (!cancelled && current === generation) setState({ lang, receipt, error: '' });
        })
        .catch(() => {
          if (!cancelled && current === generation)
            setState({ lang, receipt: null, error: t.broken });
        });
    }
    load();
    addEventListener('hashchange', load);
    return () => {
      cancelled = true;
      removeEventListener('hashchange', load);
    };
  }, []);
  return (
    <>
      <header className="top">
        <a className="brand" href="./">
          <img src="assets/brand/apple-touch-icon.png" alt="" width="28" height="28" />
          Dibsly
        </a>
        <a className="get" href={STORE_URL}>
          App Store
        </a>
      </header>
      <main id="app">
        {state.receipt ? (
          <ReceiptView receipt={state.receipt} t={receiptStrings[state.lang]} lang={state.lang} />
        ) : (
          <p className="error" role="status">
            {state.error || '…'}
          </p>
        )}
      </main>
    </>
  );
}
