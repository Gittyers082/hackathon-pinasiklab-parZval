'use client';

import { m, useReducedMotion } from 'framer-motion';
import { Delete } from 'lucide-react';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'] as const;

type PinPadProps = {
  onDigit: (digit: string) => void;
  onDelete: () => void;
  disabled?: boolean;
};

/**
 * Big, evenly spaced keys: 64px targets for a thumb, a short haptic tick where
 * the phone supports it, and no soft keyboard sliding up over the form.
 */
export function PinPad({ onDigit, onDelete, disabled = false }: PinPadProps) {
  const reduce = useReducedMotion();

  const press = (action: () => void) => () => {
    if (disabled) return;
    navigator.vibrate?.(8);
    action();
  };

  return (
    <div className="grid grid-cols-3 gap-3" role="group" aria-label="Mga numero para sa PIN">
      {KEYS.map((key, i) =>
        key === '' ? (
          <span key={`gap-${i}`} aria-hidden="true" />
        ) : (
          <m.button
            key={key}
            type="button"
            disabled={disabled}
            whileTap={reduce ? undefined : { scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 500, damping: 28 }}
            onClick={press(key === 'del' ? onDelete : () => onDigit(key))}
            aria-label={key === 'del' ? 'Burahin ang huling numero' : key}
            className="flex h-16 items-center justify-center rounded-full bg-sunk text-2xl font-semibold tabular-nums transition-colors duration-100 active:bg-gold disabled:opacity-50"
          >
            {key === 'del' ? <Delete className="h-6 w-6" aria-hidden="true" /> : key}
          </m.button>
        ),
      )}
    </div>
  );
}
