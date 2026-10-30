'use client';

import { AnimatePresence, m, useReducedMotion } from 'framer-motion';
import { ArrowRight, ChevronLeft } from 'lucide-react';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { APP_HOME, AUTH_MESSAGES, signIn } from '@/lib/auth';
import { formatPH, isValidPH, maskPH, normalizePH } from '@/lib/phone';
import { PinPad } from './PinPad';

type Step = 'phone' | 'pin' | 'done';
type Status = 'idle' | 'checking' | 'error';

const PIN_LENGTH = 6;

export function LoginFlow() {
  const reduce = useReducedMotion();
  const phoneId = useId();
  const hintId = useId();

  const [step, setStep] = useState<Step>('phone');
  const [digits, setDigits] = useState('');
  const [pin, setPin] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');
  const [touched, setTouched] = useState(false);

  const heading = useRef<HTMLHeadingElement>(null);
  const mounted = useRef(false);

  const phoneOk = isValidPH(digits);
  const showPhoneError = touched && !phoneOk;

  // Move focus to the new step's heading so a screen reader announces it, but
  // not on first load, where it would yank the page down to the form.
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    heading.current?.focus();
  }, [step]);

  const addDigit = useCallback(
    (d: string) => {
      if (status === 'checking') return;
      setStatus('idle');
      setMessage('');
      setPin((p) => (p.length >= PIN_LENGTH ? p : p + d));
    },
    [status],
  );

  const removeDigit = useCallback(() => {
    if (status === 'checking') return;
    setStatus('idle');
    setMessage('');
    setPin((p) => p.slice(0, -1));
  }, [status]);

  // Hardware keyboards (desktop, or a phone with one) type straight into the pad.
  useEffect(() => {
    if (step !== 'pin') return;
    const onKey = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      if (/^\d$/.test(event.key)) addDigit(event.key);
      else if (event.key === 'Backspace') removeDigit();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [step, addDigit, removeDigit]);

  // The sixth digit submits; there is no button to find.
  useEffect(() => {
    if (step !== 'pin' || pin.length !== PIN_LENGTH) return;
    let alive = true;
    setStatus('checking');
    setMessage('Sinusuri…');

    signIn(digits, pin)
      .then((result) => {
        if (!alive) return;
        if (result.ok) {
          setStep('done');
        } else {
          setStatus('error');
          setMessage(AUTH_MESSAGES[result.reason]);
          setPin('');
        }
      })
      .catch(() => {
        if (!alive) return;
        setStatus('error');
        setMessage(AUTH_MESSAGES.network);
        setPin('');
      });

    return () => {
      alive = false;
    };
  }, [pin, step, digits]);

  const submitPhone = (event: React.FormEvent) => {
    event.preventDefault();
    setTouched(true);
    if (phoneOk) setStep('pin');
  };

  const back = () => {
    setPin('');
    setStatus('idle');
    setMessage('');
    setStep('phone');
  };

  const slide = reduce ? 0 : 28;

  return (
    <div className="w-full max-w-sm lg:max-w-md">
      <AnimatePresence mode="wait" initial={false}>
        {step === 'phone' && (
          <m.form
            key="phone"
            onSubmit={submitPhone}
            noValidate
            initial={{ opacity: 0, x: slide }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -slide }}
            transition={{ duration: 0.25, ease: [0.2, 0.7, 0.2, 1] }}
          >
            <h1
              ref={heading}
              tabIndex={-1}
              className="font-display text-display-lg font-extrabold outline-none motion-safe:animate-rise-in"
            >
              Pumasok sa tindahan.
            </h1>
            <p className="mt-3 text-lg text-ink-muted motion-safe:animate-rise-in [animation-delay:80ms]">
              Gamitin ang numerong ginamit mo sa pag-register.
            </p>

            <div className="mt-8 motion-safe:animate-rise-in [animation-delay:160ms]">
              <label htmlFor={phoneId} className="block text-base font-semibold">
                Numero ng cellphone
              </label>
              <div
                className={`mt-2 flex min-h-14 items-center rounded-card border-2 bg-paper transition-colors focus-within:border-oxblood ${
                  showPhoneError ? 'border-vermilion' : 'border-ink/15'
                }`}
              >
                <span className="pl-4 pr-2 text-lg font-semibold text-ink-muted">+63</span>
                <input
                  id={phoneId}
                  name="phone"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  placeholder="917 123 4567"
                  value={formatPH(digits)}
                  onChange={(e) => setDigits(normalizePH(e.target.value))}
                  onBlur={() => digits && setTouched(true)}
                  aria-invalid={showPhoneError}
                  aria-describedby={hintId}
                  className="min-h-14 w-full bg-transparent pr-4 text-lg tabular-nums outline-none placeholder:text-ink/35"
                />
              </div>
              <p
                id={hintId}
                role={showPhoneError ? 'alert' : undefined}
                className={`mt-2 text-base ${showPhoneError ? 'text-vermilion' : 'text-ink-muted'}`}
              >
                {showPhoneError
                  ? 'Sampung numero ang kailangan, nagsisimula sa 9.'
                  : 'Halimbawa: 0917 123 4567'}
              </p>
            </div>

            <m.button
              type="submit"
              whileTap={reduce ? undefined : { scale: 0.97 }}
              className="mt-8 flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-ink text-lg font-semibold text-cream motion-safe:animate-rise-in [animation-delay:240ms]"
            >
              Tuloy
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </m.button>

            <p className="mt-6 text-center text-base text-ink-muted motion-safe:animate-rise-in [animation-delay:320ms]">
              Wala pang tindahan?{' '}
              <a href="#gumawa" className="font-semibold text-oxblood underline underline-offset-4">
                Gumawa ng bago
              </a>
            </p>
            <p className="mt-3 text-center text-base">
              <a href={APP_HOME} className="font-semibold text-ink underline underline-offset-4">
                Subukan muna ang demo
              </a>
            </p>
          </m.form>
        )}

        {step === 'pin' && (
          <m.div
            key="pin"
            initial={{ opacity: 0, x: slide }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -slide }}
            transition={{ duration: 0.25, ease: [0.2, 0.7, 0.2, 1] }}
          >
            <button
              type="button"
              onClick={back}
              className="-ml-2 inline-flex min-h-11 items-center gap-1 rounded-full px-2 text-base font-semibold text-ink-muted"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              Palitan ang numero
            </button>

            <h1
              ref={heading}
              tabIndex={-1}
              className="mt-2 font-display text-display-lg font-extrabold outline-none"
            >
              Ilagay ang PIN.
            </h1>
            <p className="mt-3 text-ink-muted tabular-nums">{maskPH(digits)}</p>

            <m.div
              className="mt-8 flex justify-center gap-4"
              role="img"
              aria-label={`${pin.length} sa ${PIN_LENGTH} na numero ang naipasok`}
              animate={status === 'error' && !reduce ? { x: [0, -10, 10, -8, 8, -4, 4, 0] } : { x: 0 }}
              transition={{ duration: 0.45 }}
            >
              {Array.from({ length: PIN_LENGTH }, (_, i) => (
                <m.span
                  key={i}
                  initial={false}
                  animate={{ scale: i < pin.length ? 1 : 0.72 }}
                  transition={{ type: 'spring', stiffness: 420, damping: 22 }}
                  className={`h-4 w-4 rounded-full ${
                    status === 'error' ? 'bg-vermilion' : i < pin.length ? 'bg-oxblood' : 'bg-ink/20'
                  }`}
                />
              ))}
            </m.div>

            <p
              role="status"
              aria-live="polite"
              className={`mt-4 min-h-6 text-center text-base ${
                status === 'error' ? 'font-semibold text-vermilion' : 'text-ink-muted'
              }`}
            >
              {message}
            </p>

            <div className="mt-4">
              <PinPad onDigit={addDigit} onDelete={removeDigit} disabled={status === 'checking'} />
            </div>

            <p className="mt-6 text-center text-base">
              <a href="#sms" className="font-semibold text-oxblood underline underline-offset-4">
                Nakalimutan ang PIN? Magpadala ng code sa SMS
              </a>
            </p>
          </m.div>
        )}

        {step === 'done' && (
          <m.div
            key="done"
            initial={{ opacity: 0, y: reduce ? 0 : 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.2, 0.7, 0.2, 1] }}
            className="text-center"
          >
            <svg viewBox="0 0 96 96" className="mx-auto h-24 w-24" aria-hidden="true">
              <circle cx="48" cy="48" r="44" fill="#FDC33C" />
              <m.path
                d="M28 50l13 13 27-30"
                fill="none"
                stroke="#2A1D06"
                strokeWidth="9"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: reduce ? 1 : 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.2, duration: 0.5, ease: 'easeOut' }}
              />
            </svg>

            <h1
              ref={heading}
              tabIndex={-1}
              className="mt-6 font-display text-display-lg font-extrabold outline-none"
            >
              Nakapasok ka na.
            </h1>
            <p className="mt-3 text-ink-muted tabular-nums">{maskPH(digits)}</p>

            <a
              href={APP_HOME}
              className="mt-8 flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-ink text-lg font-semibold text-cream transition-transform duration-150 active:scale-95"
            >
              Buksan ang tindahan
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </a>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
