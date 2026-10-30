'use client';

import { AnimatePresence, m, useInView, useReducedMotion } from 'framer-motion';
import { Mic, WifiOff } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { peso } from '@/lib/format';

type Phase = 'listening' | 'parsed' | 'saved';

type Phrase = {
  words: string[];
  parsed: string[];
  label: string;
  amount: number;
  stockName: string;
  before: number;
  left: number;
  of: number;
};

// Phrases are taken from the product wireframes: how an owner actually talks
// while handing over goods, prices and all.
const PHRASES: Phrase[] = [
  {
    words: ['Dalawang', 'sardinas,', 'trenta', 'singko', 'isa'],
    parsed: ['2× Sardinas 155g', '₱35 isa'],
    label: '2× Sardinas 155g',
    amount: 70,
    stockName: 'Sardinas 155g',
    before: 15,
    left: 13,
    of: 24,
  },
  {
    words: ['Dalawang', 'Lucky', 'Me', 'at', 'isang', 'Coke', 'Mismo'],
    parsed: ['2× Lucky Me Pancit Canton', '1× Coke Mismo'],
    label: '2× Lucky Me, 1× Coke Mismo',
    amount: 63,
    stockName: 'Lucky Me Pancit Canton',
    before: 12,
    left: 10,
    of: 24,
  },
];

const BASE = 1350; // the day's takings before the first sale shown

/** Tweens a peso figure by writing to the DOM directly: no re-render per frame. */
function AnimatedPeso({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  // The text React renders never changes, so React never overwrites the tween.
  const initial = useRef(value).current;
  const shown = useRef(value);

  useEffect(() => {
    const el = ref.current;
    if (!el || shown.current === value) return;
    const from = shown.current;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / 700);
      shown.current = from + (value - from) * (1 - Math.pow(1 - p, 3));
      el.textContent = peso(shown.current);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return <span ref={ref}>{peso(initial)}</span>;
}

const WAVE_HEIGHTS = [38, 62, 90, 54, 100, 70, 44, 84, 58, 96, 48, 72, 40];

export function VoiceDemo() {
  const frame = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const inView = useInView(frame, { amount: 0.4 });
  const live = inView && !reduce;

  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>('saved'); // the poster: one finished sale
  const [heard, setHeard] = useState(PHRASES[0].words.length);
  const [total, setTotal] = useState(BASE + PHRASES[0].amount);
  const [epoch, setEpoch] = useState(0);
  const next = useRef(1); // the poster already showed phrase 0

  useEffect(() => {
    if (!live) return;
    let dead = false;
    const timers: number[] = [];
    const sleep = (ms: number) =>
      new Promise<void>((resolve) => {
        timers.push(window.setTimeout(resolve, ms));
      });

    (async () => {
      await sleep(2200);
      while (!dead) {
        const n = next.current++;
        const k = n % PHRASES.length;
        const phrase = PHRASES[k];

        if (k === 0) {
          // Back to the first sale: restart the day's total without animating down.
          setEpoch((e) => e + 1);
          setTotal(BASE);
        }
        setIdx(k);
        setHeard(0);
        setPhase('listening');
        await sleep(600);

        for (let w = 1; w <= phrase.words.length; w++) {
          if (dead) return;
          setHeard(w);
          await sleep(300);
        }
        await sleep(350);
        if (dead) return;

        setPhase('parsed');
        await sleep(1100);
        if (dead) return;

        setPhase('saved');
        setTotal((t) => t + phrase.amount);
        await sleep(3000);
      }
    })();

    return () => {
      dead = true;
      timers.forEach(clearTimeout);
    };
  }, [live]);

  const phrase = PHRASES[idx];
  const pctBefore = (phrase.before / phrase.of) * 100;
  const pctNow = (phrase.left / phrase.of) * 100;

  return (
    <div
      ref={frame}
      role="img"
      aria-label="Halimbawa ng app: sinabi ang dalawang sardinas, trenta singko isa. Naitala ang pitumpung piso at bumaba ang stock ng sardinas."
      className="mx-auto w-full max-w-[19rem] select-none"
    >
      <div className="flex min-h-[33rem] flex-col overflow-hidden rounded-[2.25rem] border-[9px] border-ink bg-ground text-ink">
        <div className="px-4 pb-4 pt-6">
          <p className="font-display text-[2.5rem] font-extrabold leading-none tracking-tight text-oxblood tabular-nums">
            <AnimatedPeso key={epoch} value={total} />
          </p>
          <div className="mt-1.5 flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-ink-muted">Kita ngayong araw</p>
            <span className="inline-flex items-center gap-1 rounded-full bg-gold px-2 py-0.5 text-sm font-semibold text-gold-ink">
              <WifiOff className="h-3 w-3" aria-hidden="true" />
              Offline
            </span>
          </div>
        </div>

        <div className="relative mx-3 h-[14rem] overflow-hidden rounded-card bg-paper">
          <AnimatePresence mode="wait" initial={false}>
            {phase === 'listening' && (
              <m.div
                key="listening"
                className="absolute inset-0 flex flex-col justify-between p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <p className="text-sm font-semibold text-ink-muted">Nakikinig&hellip;</p>
                <div className="flex h-12 items-center justify-center gap-1" aria-hidden="true">
                  {WAVE_HEIGHTS.map((h, i) => (
                    <span
                      key={i}
                      className="w-1.5 origin-center rounded-full bg-oxblood motion-safe:animate-wave"
                      style={{
                        height: `${h}%`,
                        animationDelay: `${i * 70}ms`,
                        animationDuration: `${700 + (i % 4) * 120}ms`,
                      }}
                    />
                  ))}
                </div>
                <p className="min-h-[2.75rem] text-base font-medium leading-snug">
                  &ldquo;{phrase.words.slice(0, heard).join(' ')}
                  <span className="motion-safe:animate-caret">|</span>&rdquo;
                </p>
              </m.div>
            )}

            {phase === 'parsed' && (
              <m.div
                key={`parsed-${idx}`}
                className="absolute inset-0 flex flex-col justify-center gap-3 p-4"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-sm font-semibold text-ink-muted">Naintindihan ko</p>
                <div className="flex flex-wrap gap-2">
                  {phrase.parsed.map((chip, i) => (
                    <m.span
                      key={chip}
                      className="rounded-full bg-periwinkle-soft px-3 py-1.5 text-sm font-semibold text-periwinkle"
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 + i * 0.12, type: 'spring', stiffness: 380, damping: 22 }}
                    >
                      {chip}
                    </m.span>
                  ))}
                </div>
                <p className="text-sm text-ink-muted">Kinukumpirma&hellip;</p>
              </m.div>
            )}

            {phase === 'saved' && (
              <m.div
                key={`saved-${idx}`}
                className="absolute inset-0 flex flex-col justify-between p-4"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold leading-snug">{phrase.label}</p>
                    <p className="mt-0.5 text-sm text-ink-muted">Naitala ngayon &middot; boses</p>
                  </div>
                  <p className="whitespace-nowrap text-base font-bold text-leaf tabular-nums">
                    +{peso(phrase.amount)}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-ink-muted">
                    {phrase.stockName}: {phrase.left} na lang
                  </p>
                  <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-sunk">
                    <m.span
                      className="block h-full rounded-full bg-oxblood"
                      initial={{ width: `${pctBefore}%` }}
                      animate={{ width: `${pctNow}%` }}
                      transition={{ delay: 0.35, duration: 0.7, ease: [0.2, 0.7, 0.2, 1] }}
                    />
                  </div>
                </div>
              </m.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-auto flex justify-center py-6">
          <span className="relative inline-flex h-16 w-16 items-center justify-center">
            {phase === 'listening' && (
              <span
                aria-hidden="true"
                className="absolute inset-0 rounded-full bg-oxblood motion-safe:animate-ring"
              />
            )}
            <span
              className={`relative flex h-16 w-16 items-center justify-center rounded-full text-cream transition-colors duration-300 ${
                phase === 'listening' ? 'bg-oxblood' : 'bg-ink'
              }`}
            >
              <Mic className="h-7 w-7" aria-hidden="true" />
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
