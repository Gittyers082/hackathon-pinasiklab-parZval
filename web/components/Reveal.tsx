'use client';

import { m, useInView, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState, type ReactNode } from 'react';

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
};

/**
 * Rises into place the first time it scrolls into view.
 *
 * Only for content BELOW the fold. The server renders it fully visible, and
 * it is hidden only after the client mounts and finds it off screen, so a slow
 * or failed script never leaves a blank section behind. Above-the-fold
 * entrances use the CSS `animate-rise-in` utility instead, which needs no
 * JavaScript at all.
 */
export function Reveal({ children, className, delay = 0, y = 22 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const inView = useInView(ref, { once: true, margin: '0px 0px -12% 0px' });
  const [armed, setArmed] = useState(false);

  useEffect(() => setArmed(true), []);

  const hidden = armed && !inView && !reduce;

  return (
    <m.div
      ref={ref}
      className={className}
      initial={false}
      animate={hidden ? { opacity: 0, y } : { opacity: 1, y: 0 }}
      transition={hidden ? { duration: 0 } : { duration: 0.6, delay, ease: [0.2, 0.7, 0.2, 1] }}
    >
      {children}
    </m.div>
  );
}
