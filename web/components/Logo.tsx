type LogoProps = {
  /** `dark` is for the oxblood field: cream "Kita", gold "Klaro". */
  tone?: 'light' | 'dark';
  className?: string;
};

/**
 * The wordmark with the kwaderno mark: two ruled lines and a gold step that
 * rises, the notebook turning into a ledger. Drawn here, not a letter in a
 * square.
 */
export function Logo({ tone = 'light', className = '' }: LogoProps) {
  const dark = tone === 'dark';
  return (
    <span
      className={`inline-flex items-center gap-2 font-display text-lg font-extrabold tracking-tight ${className}`}
    >
      <svg viewBox="0 0 512 512" className="h-7 w-7 shrink-0" aria-hidden="true" focusable="false">
        <rect width="512" height="512" rx="104" fill={dark ? '#FBF7EF' : '#5A1216'} />
        <g stroke={dark ? '#5A1216' : '#F4EFE1'} strokeWidth="34" strokeLinecap="round" fill="none">
          <path d="M150 346h212" />
          <path d="M150 268h212" />
        </g>
        <path
          d="M150 190h74l56-62 58 62h74"
          stroke={dark ? '#C97F07' : '#FDC33C'}
          strokeWidth="34"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
      <span className={dark ? 'text-cream' : 'text-ink'}>
        Kita<span className={dark ? 'text-gold' : 'text-oxblood'}>Klaro</span>
      </span>
    </span>
  );
}
