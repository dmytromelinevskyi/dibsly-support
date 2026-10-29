import { useEffect } from 'react';
import { MotionProvider } from '../features/motion/MotionProvider.jsx';
import Header from '../components/site/Header.jsx';
import Footer from '../components/site/Footer.jsx';
import '../styles/site.css';
export default function App({ Component, data }) {
  useEffect(() => {
    if (!location.hash) return;
    try {
      document
        .getElementById(decodeURIComponent(location.hash.slice(1)))
        ?.scrollIntoView({ behavior: 'instant' });
    } catch {}
  }, [data.route]);
  if (data.route === 'split.html')
    return (
      <MotionProvider>
        <Component data={data} />
      </MotionProvider>
    );
  return (
    <MotionProvider>
      <Header lang={data.lang} route={data.route} />
      <Component data={data} />
      <Footer lang={data.lang} />
    </MotionProvider>
  );
}
