import Prose from '../components/site/Prose.jsx';
import '../styles/pages.css';
import '../styles/features.css';
export default function DocumentPage({ data }) {
  return (
    <main id="main" className="document-page">
      <Prose nodes={data.main.children} lang={data.lang} />
    </main>
  );
}
