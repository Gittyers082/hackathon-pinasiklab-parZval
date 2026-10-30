import { ArrowRight } from 'lucide-react';
import { CountUp } from '@/components/CountUp';
import { Nav } from '@/components/Nav';
import { ParallaxPhoto } from '@/components/ParallaxPhoto';
import { Photo } from '@/components/Photo';
import { Reveal } from '@/components/Reveal';
import { TaxDraft } from '@/components/TaxDraft';
import { VoiceDemo } from '@/components/VoiceDemo';
import { Ways } from '@/components/Ways';
import { asset } from '@/lib/assets';

const AUDIENCE = [
  {
    who: 'Ang may-ari',
    what: 'Alam mo agad kung magkano ang natitira sa drawer at kung ano ang bibilhin bukas. Hindi na hula sa dulo ng araw.',
  },
  {
    who: 'Ang lender',
    what: 'May tuloy-tuloy na talaan ng benta at tubo na mababasa ng MFI o bangko kapag nag-apply ka ng puhunan.',
  },
  {
    who: 'Ang BIR',
    what: 'Malinis na buod kada kwarter, handa bago ang deadline. Wala nang gabi-gabing pagbabalanse ng gulong notebook.',
  },
];

export default function LandingPage() {
  return (
    <>
      <Nav />

      <main id="main">
        {/* ------------------------------------------------------------ hero */}
        <section className="overflow-hidden bg-oxblood text-cream">
          <div className="mx-auto grid max-w-6xl gap-12 px-4 pt-12 sm:px-6 lg:grid-cols-[1.3fr_0.7fr] lg:items-end lg:gap-10 lg:pt-20">
            <div className="pb-2 lg:pb-24">
              <h1 className="font-display text-display-xl font-extrabold">
                <span className="block motion-safe:animate-rise-in">Sabihin mo lang.</span>
                <span className="block text-gold motion-safe:animate-rise-in [animation-delay:140ms]">
                  Klaro na.
                </span>
              </h1>

              <p className="mt-6 max-w-[40ch] text-lead text-cream/90 motion-safe:animate-rise-in [animation-delay:260ms]">
                Boses o litrato ng resibo ang pambukas ng talaan. Kusang bumababa ang stock, at
                nabubuo ang ulat na tanggap ng BIR at ng lender.
              </p>

              <div className="mt-8 flex flex-wrap gap-3 motion-safe:animate-rise-in [animation-delay:380ms]">
                <a href={asset('/login/')}
                  className="group inline-flex min-h-12 items-center gap-2 rounded-full bg-cream px-6 font-semibold text-oxblood transition-transform duration-150 hover:-translate-y-0.5 active:scale-95"
                >
                  Gumawa ng tindahan
                  <ArrowRight
                    className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </a>
                <a
                  href="#paano"
                  className="inline-flex min-h-12 items-center rounded-full border-2 border-cream/45 px-6 font-semibold text-cream transition-transform duration-150 hover:-translate-y-0.5 active:scale-95"
                >
                  Paano gumagana
                </a>
              </div>

              <p className="mt-6 text-sm text-cream/75 motion-safe:animate-rise-in [animation-delay:480ms]">
                Gumagana kahit walang internet. Para sa sari-sari store sa Baguio.
              </p>
            </div>

            <div className="pb-12 motion-safe:animate-rise-in [animation-delay:300ms] lg:pb-16">
              <VoiceDemo />
            </div>
          </div>
        </section>

        {/* --------------------------------------------------------- problem */}
        <section aria-labelledby="problema" className="relative bg-ground">
          <ParallaxPhoto
            name="owner"
            sizes="100vw"
            className="h-[24rem] sm:h-[32rem]"
          />

          <div className="relative z-10 mx-auto -mt-24 max-w-6xl px-4 pb-16 sm:-mt-32 sm:px-6 lg:pb-24">
            <div className="rounded-panel bg-paper p-6 sm:p-12">
              <Reveal>
                <h2 id="problema" className="max-w-[20ch] font-display text-display-lg font-extrabold">
                  Walang sagot ang kwaderno.
                </h2>
              </Reveal>
              <Reveal delay={0.08}>
                <p className="mt-5 max-w-[58ch] text-lead">
                  Naisusulat lang nito ang nangyari na. Hindi nito mababawasan ang stock, hindi ka
                  nito babalaan bago maubos ang mabenta, at hindi ito tatanggapin ng bangko. Tuwing
                  rush hour, ang pagsusulat ang unang nakakalimutan, at doon nasisira ang buong
                  talaan.
                </p>
              </Reveal>

              <dl className="mt-10 grid gap-8 sm:grid-cols-2">
                <Reveal delay={0.1}>
                  <div className="flex flex-col-reverse gap-2">
                    <dt className="max-w-[34ch] text-ink-muted">
                      ng kabuuang pautang ng bangko ang napupunta sa MSME.
                    </dt>
                    <dd className="font-display text-display-lg font-extrabold text-oxblood">
                      <CountUp to={4.6} decimals={1} suffix="%" />
                    </dd>
                  </div>
                </Reveal>
                <Reveal delay={0.18}>
                  <div className="flex flex-col-reverse gap-2">
                    <dt className="max-w-[34ch] text-ink-muted">
                      na surcharge, dagdag ang 2% na interes kada buwan, kapag mali o huli ang
                      pag-file ng buwis.
                    </dt>
                    <dd className="font-display text-display-lg font-extrabold text-oxblood">
                      hanggang <CountUp to={25} suffix="%" />
                    </dd>
                  </div>
                </Reveal>
              </dl>
              <p className="mt-8 text-sm text-ink-muted">
                Mula sa problem definition worksheet ng Team parZval.
              </p>
            </div>
          </div>
        </section>

        {/* ----------------------------------------------------- three ways */}
        <section id="paano" aria-labelledby="paano-title" className="bg-ground pb-16 lg:pb-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <Reveal>
              <h2 id="paano-title" className="max-w-[20ch] font-display text-display-lg font-extrabold">
                Tatlong paraan para itala ang benta.
              </h2>
            </Reveal>
            <div className="mt-10">
              <Ways />
            </div>
          </div>
        </section>

        {/* --------------------------------------------------------- tax draft */}
        <TaxDraft />

        {/* ---------------------------------------------------------- audience */}
        <section id="para-kanino" aria-labelledby="para-kanino-title" className="bg-ground">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-16 lg:py-24">
            <Reveal>
              <figure>
                <Photo
                  name="market"
                  sizes="(min-width: 1024px) 560px, 100vw"
                  className="aspect-[4/3] w-full rounded-panel object-cover"
                />
                <figcaption className="mt-3 text-sm text-ink-muted">
                  Baguio City Public Market. Libo-libong maliliit na puwesto, iisa ang problema sa
                  talaan.
                </figcaption>
              </figure>
            </Reveal>

            <div>
              <Reveal>
                <h2
                  id="para-kanino-title"
                  className="max-w-[16ch] font-display text-display-lg font-extrabold"
                >
                  Isang talaan, tatlong nagbabasa.
                </h2>
              </Reveal>
              <dl className="mt-8 space-y-7">
                {AUDIENCE.map((row, i) => (
                  <Reveal key={row.who} delay={i * 0.08}>
                    <div>
                      <dt className="font-display text-display-md font-extrabold text-oxblood">
                        {row.who}
                      </dt>
                      <dd className="mt-2 max-w-[44ch]">{row.what}</dd>
                    </div>
                  </Reveal>
                ))}
              </dl>
            </div>
          </div>
        </section>

        {/* ----------------------------------------------------------- closing */}
        <section aria-labelledby="simula" className="bg-ground">
          <Photo
            name="counter"
            sizes="100vw"
            className="h-64 w-full object-cover sm:h-80"
          />
          <div className="bg-oxblood text-cream">
            <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6 lg:py-24">
              <Reveal>
                <h2 id="simula" className="mx-auto max-w-[14ch] font-display text-display-xl font-extrabold">
                  Simulan ngayong gabi.
                </h2>
              </Reveal>
              <Reveal delay={0.1}>
                <p className="mx-auto mt-5 max-w-[40ch] text-lead text-cream/90">
                  Bago ang bukas na rush, handa na ang talaan mo.
                </p>
                <a href={asset('/login/')}
                  className="group mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-cream px-7 font-semibold text-oxblood transition-transform duration-150 hover:-translate-y-0.5 active:scale-95"
                >
                  Gumawa ng tindahan
                  <ArrowRight
                    className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </a>
              </Reveal>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-paper">
        <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-ink-muted sm:px-6">
          <div className="flex flex-wrap justify-between gap-3">
            <p>KitaKlaro &middot; Team parZval &middot; PinaSiklab Hackathon</p>
            <p>Track 3: Economic Expansion &middot; SDG 8</p>
          </div>
          <p className="mt-4 max-w-[68ch] leading-relaxed">
            Mga larawan, binago ang laki at format: &ldquo;Sari-Sari Store Samal Davao&rdquo; ni
            Burgermac, CC BY 2.0; &ldquo;Baguio City Public Market, Feb 2025&rdquo; ni Ralff Nestor
            Nacor, CC BY-SA 4.0; &ldquo;Cat on a sari-sari store&rdquo; ni Aerous, CC BY-SA 4.0.
            Lahat ay mula sa Wikimedia Commons.
          </p>
        </div>
      </footer>
    </>
  );
}
