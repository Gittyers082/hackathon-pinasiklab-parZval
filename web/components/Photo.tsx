import { asset } from '@/lib/assets';

export type PhotoName = 'owner' | 'market' | 'counter';

// Credits for all three are in the footer of the landing page (and beside the
// photo on the login page). Alt text says what is in the frame.
const ALT: Record<PhotoName, string> = {
  owner:
    'May-ari ng sari-sari store sa likod ng counter. Nakasabit sa itaas ang mga sachet ng shampoo at sabon; nasa harap ang gulay at itlog.',
  market:
    'Loob ng Baguio City Public Market. Magkakapatong na trapal sa kisame at hanay ng mga puwesto sa ibaba.',
  counter:
    'Bintana ng sari-sari store na may rehas. Nakahilera sa likod ang mga de-lata at sachet, at may sulat-kamay na karatulang PURE ICE FOR SALE.',
};

type PhotoProps = {
  name: PhotoName;
  className?: string;
  sizes?: string;
  priority?: boolean;
};

/** Two pre-sized WebP files, so a phone downloads ~80 KB and a desktop ~190 KB. */
export function Photo({ name, className = '', sizes = '100vw', priority = false }: PhotoProps) {
  const small = asset(`/assets/${name}-800.webp`);
  const large = asset(`/assets/${name}-1400.webp`);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={small}
      srcSet={`${small} 800w, ${large} 1400w`}
      sizes={sizes}
      width={1400}
      height={1050}
      alt={ALT[name]}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      className={className}
    />
  );
}
