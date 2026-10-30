import { peso } from '@/lib/format';
import { Reveal } from './Reveal';

type Row = { item: string; label: string; amount: number; strong?: boolean; final?: boolean };

// Figures are from the product wireframe (Q3, 8% flat income tax option).
// They close: 316,000 + 632,000 = 948,000; less 250,000 = 698,000;
// at 8% = 55,840; less 36,880 already paid = 18,960 payable.
const ROWS: Row[] = [
  { item: '47', label: 'Benta ngayong kwarter', amount: 316000 },
  { item: '50', label: 'Benta ng mga nakaraang kwarter', amount: 632000 },
  { item: '51', label: 'Kabuuang benta hanggang ngayon', amount: 948000, strong: true },
  { item: '52', label: 'Exemption na pinapayagan', amount: -250000 },
  { item: '53', label: 'Kitang pagbabatayan ng buwis', amount: 698000, strong: true },
  { item: '54', label: 'Buwis na dapat bayaran (8%)', amount: 55840 },
  { item: '59', label: 'Naibayad na sa mga nakaraang kwarter', amount: -36880 },
  { item: '61', label: 'Babayaran ngayon', amount: 18960, final: true },
];

const money = (n: number) => (n < 0 ? '−' : '') + peso(Math.abs(n));

export function TaxDraft() {
  return (
    <section id="buwis" aria-labelledby="buwis-title" className="bg-ink text-cream">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16 lg:py-24">
        <div>
          <Reveal>
            <h2 id="buwis-title" className="font-display text-display-lg font-extrabold">
              Hindi hula ang buwis.
            </h2>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="mt-5 max-w-[44ch] text-lead text-cream/90">
              Habang nagtatala ka, nabubuo na ang draft ng BIR Form 1701Q. Ikaw pa rin ang
              magfa-file sa eBIRForms. Ang pinagkaiba, hawak mo na ang mga numero.
            </p>
          </Reveal>
          <Reveal delay={0.14}>
            <p className="mt-5 max-w-[44ch] text-cream/75">
              Ang huli o maling pag-file ay may surcharge na hanggang 25%, dagdag ang 2% na interes
              kada buwan.
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.1}>
          <div data-ui className="rounded-panel bg-cream p-5 text-ink sm:p-7">
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="font-display text-display-md font-extrabold">Draft ng 1701Q</h3>
              <p className="text-sm font-semibold text-ink-muted">Q3 &middot; 8% flat</p>
            </div>

            <div className="mt-4">
              {ROWS.map((row, i) => (
                <Reveal key={row.item} delay={i * 0.05} y={12}>
                  <div
                    className={`flex items-baseline justify-between gap-4 py-2.5 ${
                      row.final ? 'mt-2 rounded-card bg-gold px-3 py-3.5 text-gold-ink' : ''
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-semibold ${row.final ? 'text-gold-ink' : 'text-ink-muted'}`}>
                        Item {row.item}
                      </p>
                      <p className={`text-base ${row.strong || row.final ? 'font-bold' : ''}`}>{row.label}</p>
                    </div>
                    <span
                      className={`whitespace-nowrap tabular-nums ${
                        row.strong || row.final ? 'font-bold' : 'font-semibold'
                      }`}
                    >
                      {money(row.amount)}
                    </span>
                  </div>
                </Reveal>
              ))}
            </div>

            <p className="mt-4 text-sm text-ink-muted">
              Draft lang ito. Hindi ito pag-file, at hindi ito kapalit ng accountant.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
