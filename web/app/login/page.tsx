import type { Metadata } from 'next';
import { LoginFlow } from '@/components/LoginFlow';
import { Logo } from '@/components/Logo';
import { Photo } from '@/components/Photo';
import { asset } from '@/lib/assets';

export const metadata: Metadata = { title: 'Mag-login' };

export default function LoginPage() {
  return (
    <main id="main" className="grid min-h-screen min-h-dvh grid-rows-[auto_1fr] lg:grid-cols-[1.05fr_1fr] lg:grid-rows-none" /* taste-skill-ignore: min-h-screen is the fallback for Chrome < 108, which lacks dvh */>
      {/* Brand field. On a phone it is a slim band; the form is the point. */}
      <aside className="flex flex-col justify-between gap-12 bg-oxblood px-4 py-5 text-cream sm:px-8 lg:px-12 lg:py-10">
        <a href={asset('/')} aria-label="KitaKlaro, pangunahing pahina" className="inline-flex w-fit">
          <Logo tone="dark" />
        </a>

        <div className="hidden lg:block">
          {/* The kwaderno's ruled lines drawing themselves, the last one a gold step. */}
          <div aria-hidden="true" className="mb-10 space-y-3">
            <span className="block h-3.5 w-3/4 origin-left rounded-full bg-cream motion-safe:animate-bar" />
            <span className="block h-3.5 w-1/2 origin-left rounded-full bg-cream motion-safe:animate-bar [animation-delay:150ms]" />
            <span className="block h-3.5 w-2/3 origin-left rounded-full bg-gold motion-safe:animate-bar [animation-delay:300ms]" />
          </div>

          <p className="max-w-[14ch] font-display text-display-xl font-extrabold motion-safe:animate-rise-in [animation-delay:200ms]">
            Hindi na hula ang kita mo.
          </p>
          <p className="mt-5 max-w-[34ch] text-lead text-cream/90">
            Naka-save sa phone. Magsi-sync pag may data.
          </p>
        </div>

        <figure className="hidden lg:block">
          <Photo
            name="counter"
            sizes="(min-width: 1024px) 44vw, 0px"
            className="h-52 w-full rounded-card object-cover"
          />
          <figcaption className="mt-2 max-w-[56ch] text-sm text-cream/75">
            Larawan: Aerous, CC BY-SA 4.0, mula sa Wikimedia Commons. Binago ang laki at format.
          </figcaption>
        </figure>
      </aside>

      <section className="flex items-start justify-center px-4 py-10 sm:px-6 lg:items-center lg:justify-end lg:px-12 lg:py-12">
        <LoginFlow />
      </section>
    </main>
  );
}
