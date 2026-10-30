'use client';

import { useEffect, useRef } from 'react';

type CountUpProps = {
  to: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
};

/**
 * Counts from 0 to `to` when it scrolls into view. The server renders the
 * final number, so it is correct with no JavaScript. It writes straight to the
 * DOM from requestAnimationFrame rather than through React state, so a count
 * costs no re-renders.
 */
export function CountUp({ to, decimals = 0, prefix = '', suffix = '', duration = 1100, className }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const fmt = (v: number) => `${prefix}${v.toFixed(decimals)}${suffix}`;

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Off screen: start from zero now, where nobody can see the jump.
    if (el.getBoundingClientRect().top > window.innerHeight) el.textContent = fmt(0);

    let raf = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const p = Math.min(1, (now - start) / duration);
          el.textContent = fmt(to * (1 - Math.pow(1 - p, 3)));
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    io.observe(el);

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [to, decimals, prefix, suffix, duration]);

  return (
    <span ref={ref} className={className}>
      {fmt(to)}
    </span>
  );
}
