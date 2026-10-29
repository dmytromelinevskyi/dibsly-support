import { createContext, useContext, useState, useEffect, useCallback } from 'react';
const MotionContext = createContext({ reduced: false, toggle: () => {} });
export function MotionProvider({ children }) {
  const [reduced, setReduced] = useState(false),
    [system, setSystem] = useState(false);
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => {
      let saved = false;
      try {
        saved = localStorage.getItem('dibsly.motion.v2') === 'reduced';
      } catch {}
      setSystem(media.matches);
      setReduced(media.matches || saved);
    };
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle('reduce-motion', reduced);
  }, [reduced]);
  const toggle = useCallback(() => {
    if (system) return;
    setReduced((previous) => {
      const next = !previous;
      try {
        localStorage.setItem('dibsly.motion.v2', next ? 'reduced' : 'full');
      } catch {}
      return next;
    });
  }, [system]);
  return <MotionContext value={{ reduced, system, toggle }}>{children}</MotionContext>;
}
export const useMotion = () => useContext(MotionContext);
