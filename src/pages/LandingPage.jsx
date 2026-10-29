import { useRef } from 'react';
import StoryLanding from '../features/story/StoryLanding.jsx';
import Prose from '../components/site/Prose.jsx';
import FeatureGallery from '../features/reference/FeatureGallery.jsx';
import '../styles/landing-react.css';
export default function LandingPage({ data }) {
  const routeCanvas = useRef(null);
  return (
    <main id="main" className="landing-react">
      <canvas ref={routeCanvas} className="journey-line" aria-hidden="true" />
      <StoryLanding lang={data.lang} routeCanvas={routeCanvas} />
      <FeatureGallery lang={data.lang} />
      <div className="landing-details">
        <Prose nodes={data.sections} lang={data.lang} />
      </div>
    </main>
  );
}
