'use client';

import { m, useReducedMotion } from 'framer-motion';
import { Camera, Hand, Mic } from 'lucide-react';
import type { ReactNode } from 'react';
import { Reveal } from './Reveal';

const SPRING = { type: 'spring', stiffness: 260, damping: 20 } as const;

type CardProps = {
  tilt: number;
  className: string;
  children: ReactNode;
};

/** Sits a degree or two off-square, and snaps straight when you reach for it. */
function Card({ tilt, className, children }: CardProps) {
  const reduce = useReducedMotion();
  return (
    <m.article
      initial={{ rotate: tilt }}
      whileHover={reduce ? undefined : { rotate: 0, y: -8 }}
      whileTap={reduce ? undefined : { scale: 0.985 }}
      transition={SPRING}
      className={`rounded-panel p-6 sm:p-8 ${className}`}
    >
      {children}
    </m.article>
  );
}

const VOICE_LINES = [
  { said: 'Dalawang sardinas, trenta singko isa.', amount: '+₱70.00' },
  { said: 'Bayad sa Meralco, limang daan.', amount: '−₱500.00' },
  { said: 'Isang Bear Brand, kinse.', amount: '+₱15.00' },
];

const RECEIPT = [
  { name: '1 Box Alaska Evaporada (48 lata)', amount: '₱1,440.00' },
  { name: 'Golden Fiesta Cooking Oil 1L', amount: '₱480.00' },
  { name: 'Silver Swan Toyo 1L', amount: '₱190.00', check: true },
];

const TILES = [
  { name: 'Lucky Me', price: '₱19.00' },
  { name: 'Bear Brand', price: '₱15.00' },
  { name: 'Kopiko', price: '₱9.00' },
  { name: 'Itlog', price: '₱9.50' },
];

const BARS = [34, 58, 86, 48, 100, 66, 40, 78, 52, 92, 44, 70];

export function Ways() {
  return (
    <div className="grid gap-5 lg:grid-cols-12 lg:gap-6">
      <Reveal className="lg:col-span-7 lg:row-span-2">
        <Card tilt={-1.4} className="flex h-full flex-col justify-between gap-10 bg-gold text-gold-ink">
          <div>
            <h3 className="flex items-center gap-3 font-display text-display-lg font-extrabold">
              Boses
              <Mic className="h-9 w-9" aria-hidden="true" />
            </h3>
            <p className="mt-4 max-w-[34ch] text-lead">
              Magsalita habang nagbibigay ng paninda. Kasama na ang presyo, kahit Taglish.
            </p>
          </div>

          <ul className="space-y-4">
            {VOICE_LINES.map((line) => (
              <li key={line.said} className="flex items-baseline justify-between gap-4 text-lg font-medium">
                <span>&ldquo;{line.said}&rdquo;</span>
                <span className="whitespace-nowrap font-bold tabular-nums">{line.amount}</span>
              </li>
            ))}
          </ul>

          <div className="flex h-10 items-end gap-1.5" aria-hidden="true">
            {BARS.map((h, i) => (
              <span
                key={i}
                className="w-2 origin-bottom rounded-full bg-gold-ink motion-safe:animate-wave"
                style={{
                  height: `${h}%`,
                  animationDelay: `${i * 80}ms`,
                  animationDuration: `${760 + (i % 4) * 140}ms`,
                }}
              />
            ))}
          </div>
        </Card>
      </Reveal>

      <Reveal className="lg:col-span-5" delay={0.08}>
        <Card tilt={1.2} className="h-full bg-periwinkle text-cream">
          <h3 className="flex items-center gap-3 font-display text-display-md font-extrabold">
            Resibo
            <Camera className="h-7 w-7" aria-hidden="true" />
          </h3>
          <p className="mt-3 max-w-[36ch]">
            Kunan ng litrato. Binabasa ang bawat linya, at ikaw ang magkukumpirma bago i-save.
          </p>

          <div className="mt-5 rounded-card bg-paper p-4 text-ink">
            <ul className="space-y-2.5 text-sm">
              {RECEIPT.map((row) => (
                <li key={row.name} className="flex items-baseline justify-between gap-3">
                  <span>
                    {row.name}
                    {row.check && (
                      <span className="ml-2 inline-block whitespace-nowrap rounded-full bg-gold px-2 py-0.5 text-sm font-semibold text-gold-ink">
                        Paki-check
                      </span>
                    )}
                  </span>
                  <span className="whitespace-nowrap font-semibold tabular-nums">{row.amount}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 flex items-baseline justify-between gap-3 font-bold">
              <span>Kabuuang gastos</span>
              <span className="tabular-nums">&#8369;2,110.00</span>
            </p>
          </div>
        </Card>
      </Reveal>

      <Reveal className="lg:col-span-5" delay={0.16}>
        <Card tilt={-0.8} className="h-full bg-ink text-cream">
          <h3 className="flex items-center gap-3 font-display text-display-md font-extrabold">
            Tap
            <Hand className="h-7 w-7" aria-hidden="true" />
          </h3>
          <p className="mt-3 max-w-[36ch]">
            Kapag maingay ang paligid o tulog ang bata, pindutin lang ang paninda.
          </p>
          <div className="mt-5 grid grid-cols-2 gap-2.5">
            {TILES.map((tile) => (
              <div key={tile.name} className="rounded-card bg-cream/10 p-3">
                <p className="text-sm">{tile.name}</p>
                <p className="mt-1 font-bold tabular-nums">{tile.price}</p>
              </div>
            ))}
          </div>
        </Card>
      </Reveal>
    </div>
  );
}
