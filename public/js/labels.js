// UI text in Tagalog (default), Ilocano and English. The choice is saved in localStorage.
// In HTML: <span data-label="key"></span>, or data-label-ph="key" for input placeholders.

const LABELS = {
  tl: {
    kumita_title: 'Kumita ba ako?', today: 'Ngayong araw', benta: 'Benta', gastos: 'Gastos',
    mic: '🎤 Pindutin at magsalita', listening: 'Nakikinig…', type_ph: 'Hal: utang si Mang Tonyo 50 sardinas',
    add: 'Ilagay', confirm_title: 'Tama ba ito?', tama: 'Tama ✓', ayusin: 'Ayusin',
    f_kind: 'Uri', f_name: 'Pangalan', f_item: 'Item', f_qty: 'Ilan', f_amount: 'Halaga (₱)',
    k_utang: 'Utang', k_bayad: 'Bayad', k_benta: 'Benta', k_gastos: 'Gastos',
    saved: 'Na-save!', not_understood: 'Hindi ko naintindihan. Ayusin ang mga dilaw.',
    nav_home: 'Home', nav_utang: 'Utang', nav_ubos: 'Ubos na',
    utang_title: 'Sino may utang?', show_suki: 'Ipakita kay suki', close: 'Isara',
    balance: 'Utang', no_utang: 'Walang may utang. 🎉', history: 'Listahan',
    ubos_title: 'Ano ubos na?', stock: 'Natitira', save: 'I-save', no_ubos: 'Wala pang ubos. 👍',
    demo: 'Demo mode', error: 'May mali. Subukan ulit.',
  },
  // TODO: verify with native Ilocano speaker
  ilo: {
    kumita_title: 'Nagganansiaak kadi?', today: 'Ita nga aldaw', benta: 'Lako', gastos: 'Gastos',
    mic: '🎤 Pindutem ken agsaoka', listening: 'Dumdumngeg…', type_ph: 'Kas: utang ni Manang Lita 75 kape',
    add: 'Ikabil', confirm_title: 'Husto kadi daytoy?', tama: 'Husto ✓', ayusin: 'Simpaen',
    f_kind: 'Kita', f_name: 'Nagan', f_item: 'Banag', f_qty: 'Mano', f_amount: 'Bayad (₱)',
    k_utang: 'Utang', k_bayad: 'Bayad', k_benta: 'Lako', k_gastos: 'Gastos',
    saved: 'Naidulin!', not_understood: 'Saanko a naawatan. Simpaen dagiti duyaw.',
    nav_home: 'Home', nav_utang: 'Utang', nav_ubos: 'Naibus',
    utang_title: 'Siasino ti adda utangna?', show_suki: 'Ipakita ken suki', close: 'Iserra',
    balance: 'Utang', no_utang: 'Awan ti adda utangna. 🎉', history: 'Listaan',
    ubos_title: 'Ania ti naibus?', stock: 'Nabati', save: 'Idulin', no_ubos: 'Awan pay ti naibus. 👍',
    demo: 'Demo mode', error: 'Adda biddut. Padasem manen.',
  },
  en: {
    kumita_title: 'Did I make money?', today: 'Today', benta: 'Sales', gastos: 'Expenses',
    mic: '🎤 Tap and speak', listening: 'Listening…', type_ph: 'E.g. utang si Mang Tonyo 50 sardinas',
    add: 'Add', confirm_title: 'Is this right?', tama: 'Correct ✓', ayusin: 'Fix',
    f_kind: 'Type', f_name: 'Name', f_item: 'Item', f_qty: 'Qty', f_amount: 'Amount (₱)',
    k_utang: 'Credit', k_bayad: 'Payment', k_benta: 'Sale', k_gastos: 'Expense',
    saved: 'Saved!', not_understood: "I didn't get that. Fix the yellow fields.",
    nav_home: 'Home', nav_utang: 'Credit', nav_ubos: 'Low stock',
    utang_title: 'Who owes me?', show_suki: 'Show to customer', close: 'Close',
    balance: 'Owes', no_utang: 'Nobody owes you. 🎉', history: 'History',
    ubos_title: 'What is running out?', stock: 'Left', save: 'Save', no_ubos: 'Nothing is low. 👍',
    demo: 'Demo mode', error: 'Something went wrong. Try again.',
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
