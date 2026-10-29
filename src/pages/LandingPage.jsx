import { useRef } from 'react';
import ScrollCinema from '../features/cinema/ScrollCinema.jsx';
import Prose from '../components/site/Prose.jsx';
import FeatureGallery from '../features/reference/FeatureGallery.jsx';
import '../styles/landing-react.css';
export default function LandingPage({ data }) {
  const routeCanvas = useRef(null),
    worldCanvas = useRef(null);
  return (
    <main id="main" className="landing-react">
      <div className="cinema-world" aria-hidden="true">
        <canvas ref={worldCanvas} />
      </div>
      <canvas ref={routeCanvas} className="journey-line" aria-hidden="true" />
      <ScrollCinema lang={data.lang} routeCanvas={routeCanvas} worldCanvas={worldCanvas} />
      <FeatureGallery lang={data.lang} />
      <div className="landing-details">
        <Prose nodes={data.sections} lang={data.lang} />
      </div>
    </main>
  );
}
