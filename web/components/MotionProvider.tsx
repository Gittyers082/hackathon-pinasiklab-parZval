'use client';

import { LazyMotion } from 'framer-motion';
import type { ReactNode } from 'react';

// LazyMotion with an async feature bundle keeps Framer Motion's weight off
// the critical path, and `strict` makes any accidental use of the full
// `motion` component (which would pull the whole library back in) an error.
const loadFeatures = () => import('./motion-features').then((mod) => mod.default);

export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      {children}
    </LazyMotion>
  );
}
