// UI text in Tagalog (default), Ilocano and English. The choice is saved in localStorage.
// In HTML: <span data-label="key"></span>, or data-label-ph="key" for input placeholders.

const LABELS = {
  tl: {
    kumita_title: 'Kumita ba ako?', today: 'Ngayong araw', benta: 'Benta', gastos: 'Gastos',
    mic: 'Pindutin at magsalita', listening: 'Nakikinig…', type_ph: 'Hal: utang si Mang Tonyo 50 sardinas',
    add: 'Ilagay', confirm_title: 'Tama ba ito?', tama: 'Tama', ayusin: 'Ayusin',
    f_kind: 'Uri', f_name: 'Pangalan', f_item: 'Item', f_qty: 'Ilan', f_amount: 'Halaga (₱)',
    k_utang: 'Utang', k_bayad: 'Bayad', k_benta: 'Benta', k_gastos: 'Gastos',
    saved: 'Na-save!', not_understood: 'Hindi ko naintindihan. Ayusin ang mga dilaw.',
    nav_home: 'Home', nav_utang: 'Utang', nav_ubos: 'Imbentaryo',
    utang_title: 'Sino may utang?', show_suki: 'Ipakita kay suki', close: 'Isara',
    balance: 'Utang', no_utang: 'Walang may utang.', history: 'Listahan',
    ubos_title: 'Imbentaryo', stock: 'Natitira', save: 'I-save', no_ubos: 'Wala pang produkto.',
    demo: 'Demo mode', error: 'May mali. Subukan ulit.',
    cost: 'Puhunan', price: 'Presyo', expires: 'Expiry', add_product: '+ Dagdag produkto',
    expired: 'Expired na', expires_today: 'Mag-e-expire ngayon', days_left: '{n} araw na lang',
    expiry_title: 'Malapit nang mag-expire', see_inventory: 'Tingnan sa Imbentaryo',
    nav_ulat: 'Ulat', ulat_title: 'Ulat ng benta', p_week: '7 araw', p_month: 'Buwan', p_year: 'Taon',
    kumita_period: 'Kumita', profit_est: 'Tubo sa paninda (tantiya)',
    profit_note: 'Benta bawas puhunan, para lang sa mga produktong may puhunan.',
    chart_title: 'Benta at gastos', chart_keys: 'Gamitin ang ← → para makita ang bawat araw.',
    show_table: 'Ipakita bilang talaan', top_benta: 'Pinakamabenta', top_gastos: 'Pinakamalaking gastos',
    no_data: 'Wala pang tala sa panahong ito.', date: 'Petsa', pcs: 'pcs',
    vs_week: 'kumpara sa naunang 7 araw', vs_month: 'kumpara sa parehong araw noong nakaraang buwan',
    vs_year: 'kumpara sa parehong panahon noong nakaraang taon',
  },
  // TODO: verify with native Ilocano speaker
  ilo: {
    kumita_title: 'Nagganansiaak kadi?', today: 'Ita nga aldaw', benta: 'Lako', gastos: 'Gastos',
    mic: 'Pindutem ken agsaoka', listening: 'Dumdumngeg…', type_ph: 'Kas: utang ni Manang Lita 75 kape',
    add: 'Ikabil', confirm_title: 'Husto kadi daytoy?', tama: 'Husto', ayusin: 'Simpaen',
    f_kind: 'Kita', f_name: 'Nagan', f_item: 'Banag', f_qty: 'Mano', f_amount: 'Bayad (₱)',
    k_utang: 'Utang', k_bayad: 'Bayad', k_benta: 'Lako', k_gastos: 'Gastos',
    saved: 'Naidulin!', not_understood: 'Saanko a naawatan. Simpaen dagiti duyaw.',
    nav_home: 'Home', nav_utang: 'Utang', nav_ubos: 'Imbentario',
    utang_title: 'Siasino ti adda utangna?', show_suki: 'Ipakita ken suki', close: 'Iserra',
    balance: 'Utang', no_utang: 'Awan ti adda utangna.', history: 'Listaan',
    ubos_title: 'Imbentario', stock: 'Nabati', save: 'Idulin', no_ubos: 'Awan pay ti produkto.',
    demo: 'Demo mode', error: 'Adda biddut. Padasem manen.',
    cost: 'Puonan', price: 'Presio', expires: 'Expiry', add_product: '+ Inayon ti produkto',
    expired: 'Nag-expire en', expires_today: 'Ag-expire ita nga aldaw', days_left: '{n} nga aldaw laengen',
    expiry_title: 'Asidegen nga ag-expire', see_inventory: 'Kitaen iti Imbentario',
    nav_ulat: 'Report', ulat_title: 'Report ti lako', p_week: '7 nga aldaw', p_month: 'Bulan', p_year: 'Tawen',
    kumita_period: 'Ganansia', profit_est: 'Ganansia iti lako (pattapatta)',
    profit_note: 'Lako mainus ti puonan, para kadagiti produkto nga addaan puonan.',
    chart_title: 'Lako ken gastos', chart_keys: 'Usaren ti ← → tapno makita ti tunggal aldaw.',
    show_table: 'Ipakita kas tabla', top_benta: 'Kalakuan', top_gastos: 'Kadakkelan a gastos',
    no_data: 'Awan pay ti listaan iti daytoy a panawen.', date: 'Petsa', pcs: 'pcs',
    vs_week: 'no idilig iti napalabas a 7 nga aldaw', vs_month: 'no idilig iti isu met laeng nga aldaw idi napalabas a bulan',
    vs_year: 'no idilig iti isu met laeng a panawen idi napalabas a tawen',
  },
  en: {
    kumita_title: 'Did I make money?', today: 'Today', benta: 'Sales', gastos: 'Expenses',
    mic: 'Tap and speak', listening: 'Listening…', type_ph: 'E.g. utang si Mang Tonyo 50 sardinas',
    add: 'Add', confirm_title: 'Is this right?', tama: 'Correct', ayusin: 'Fix',
    f_kind: 'Type', f_name: 'Name', f_item: 'Item', f_qty: 'Qty', f_amount: 'Amount (₱)',
    k_utang: 'Credit', k_bayad: 'Payment', k_benta: 'Sale', k_gastos: 'Expense',
    saved: 'Saved!', not_understood: "I didn't get that. Fix the yellow fields.",
    nav_home: 'Home', nav_utang: 'Credit', nav_ubos: 'Inventory',
    utang_title: 'Who owes me?', show_suki: 'Show to customer', close: 'Close',
    balance: 'Owes', no_utang: 'Nobody owes you.', history: 'History',
    ubos_title: 'Inventory', stock: 'Left', save: 'Save', no_ubos: 'No products yet.',
    demo: 'Demo mode', error: 'Something went wrong. Try again.',
    cost: 'Cost', price: 'Selling price', expires: 'Expiry date', add_product: '+ Add product',
    expired: 'Expired', expires_today: 'Expires today', days_left: '{n} days left',
    expiry_title: 'Expiring soon', see_inventory: 'See inventory',
    nav_ulat: 'Reports', ulat_title: 'Sales report', p_week: '7 days', p_month: 'Month', p_year: 'Year',
    kumita_period: 'Profit', profit_est: 'Profit on goods (estimate)',
    profit_note: 'Sales minus cost, only for products that have a cost set.',
    chart_title: 'Sales and expenses', chart_keys: 'Use ← → to step through each day.',
    show_table: 'Show as table', top_benta: 'Top sellers', top_gastos: 'Biggest expenses',
    no_data: 'No records for this period yet.', date: 'Date', pcs: 'pcs',
    vs_week: 'vs the 7 days before', vs_month: 'vs the same days last month', vs_year: 'vs the same period last year',
  },
};

let lang = localStorage.getItem('kk-lang') || 'tl';
if (!LABELS[lang]) lang = 'tl';

function t(key) {
  return LABELS[lang][key] || LABELS.tl[key] || key;
}

// 8550 -> "₱85.50"
function peso(centavos) {
  return '₱' + (centavos / 100).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const EXPIRY_WARN_DAYS = 7; // Home warns about items expiring within this many days

// 'YYYY-MM-DD' -> days from today (negative = already expired).
function daysUntil(date) {
  const [y, m, d] = date.split('-').map(Number);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((new Date(y, m - 1, d) - today) / 86400000);
}

// "Expired na", "3 araw na lang", or the date itself when it's still far off.
function expiryText(date) {
  const days = daysUntil(date);
  if (days < 0) return t('expired');
  if (days === 0) return t('expires_today');
  return days <= EXPIRY_WARN_DAYS ? t('days_left').replace('{n}', days) : date;
}

function applyLabels() {
  document.documentElement.lang = lang === 'ilo' ? 'ilo' : lang === 'en' ? 'en' : 'fil';
  document.querySelectorAll('[data-label]').forEach(el => { el.textContent = t(el.dataset.label); });
  document.querySelectorAll('[data-label-ph]').forEach(el => { el.placeholder = t(el.dataset.labelPh); });
  const picker = document.getElementById('lang');
  if (picker) {
    picker.value = lang;
    picker.onchange = () => { localStorage.setItem('kk-lang', picker.value); location.reload(); };
  }
}

document.addEventListener('DOMContentLoaded', applyLabels);
