import { useEffect, useRef } from 'react';
import Prose from '../components/site/Prose.jsx';
import { attachToc } from '../components/site/toc.js';
import '../styles/pages.css';
import '../styles/features.css';
export default function DocumentPage({ data }) {
  const root = useRef(null);
  useEffect(() => attachToc(root.current), [data.route]);
  return (
    <main id="main" className="document-page" ref={root}>
      <Prose nodes={data.main.children} lang={data.lang} />
    </main>
  );
}
