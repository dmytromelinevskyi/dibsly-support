import { createContext, useContext } from 'react';
/**
 * The site's motion switch is gone (owner, 2026-10-29: «режим ноу моушен — кривой… давай вообще его уберем»): the
 * landing always plays; `reduced` stays for the code that asks, always false.
 */
const MotionContext = createContext({ reduced: false, system: false, toggle: () => {} });
export function MotionProvider({ children }) {
  return children;
}
export const useMotion = () => useContext(MotionContext);
