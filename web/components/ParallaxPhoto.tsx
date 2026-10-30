'use client';

import { m, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Photo, type PhotoName } from './Photo';

type ParallaxPhotoProps = {
  name: PhotoName;
  className?: string;
  sizes?: string;
};

/**
 * A photograph that drifts slowly against the scroll. The image is taller than
 * its frame so the drift never shows an edge, and it moves with `transform`
 * only, so it never forces a layout.
 */
export function ParallaxPhoto({ name, className = '', sizes }: ParallaxPhotoProps) {
  const frame = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: frame, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['-7%', '7%']);

  return (
    <div ref={frame} className={`relative overflow-hidden bg-sunk ${className}`}>
      <m.div
        style={reduce ? undefined : { y }}
        className="absolute inset-x-0 -top-[9%] h-[118%] will-change-transform"
      >
        <Photo name={name} sizes={sizes} className="h-full w-full object-cover" />
      </m.div>
    </div>
  );
}
