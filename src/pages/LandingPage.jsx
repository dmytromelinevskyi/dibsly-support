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
  // The line with its dot runs on wide screens only (owner, 2026-10-29: «уберем вот эту точку через все экраны с моб
  // версии»); up to 1080 px the page is one column and the line is not drawn.
  useEffect(() => {
    if (reduced || !routeCanvas.current) return;
    const wide = matchMedia('(min-width: 1081px)');
    let journey = null;
    // The line starts at the hero kicker's dot (owner, 2026-10-30: «линию прям с точки в заголовке начинать»).
    const sync = () => {
      if (wide.matches && !journey) journey = attachJourney(routeCanvas.current);
      else if (!wide.matches && journey) {
        journey.destroy();
        journey = null;
      }
    };
    sync();
    wide.addEventListener('change', sync);
    return () => {
      wide.removeEventListener('change', sync);
      journey?.destroy();
    };
  }, [reduced]);
  return (
    <main id="main" className="landing-react">
      <canvas className="field" aria-hidden="true" />
      <canvas ref={routeCanvas} className="journey-line" aria-hidden="true" />
      <JourneyLanding lang={data.lang} />
      <FeatureGallery lang={data.lang} />
      <div className="landing-details">
        <Prose nodes={data.sections} lang={data.lang} />
      </div>
    </main>
  );
}
