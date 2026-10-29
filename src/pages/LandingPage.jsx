import { useEffect, useRef } from 'react';
import JourneyLanding from '../features/journey/JourneyLanding.jsx';
import { attachJourney } from '../features/journey/journey-driver.js';
import { useMotion } from '../features/motion/MotionProvider.jsx';
import Prose from '../components/site/Prose.jsx';
import FeatureGallery from '../features/reference/FeatureGallery.jsx';
import '../styles/landing-react.css';
export default function LandingPage({ data }) {
  const routeCanvas = useRef(null),
    { reduced } = useMotion();
  useEffect(() => {
    if (reduced || !routeCanvas.current) return;
    const journey = attachJourney(routeCanvas.current);
    return () => journey.destroy();
  }, [reduced]);
  return (
    <main id="main" className="landing-react">
      <canvas ref={routeCanvas} className="journey-line" aria-hidden="true" />
      <JourneyLanding lang={data.lang} />
      <FeatureGallery lang={data.lang} />
      <div className="landing-details">
        <Prose nodes={data.sections} lang={data.lang} />
      </div>
    </main>
  );
}
