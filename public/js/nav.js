const ICON = path => `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${path}</svg>`;
const ICONS = {
  home: ICON('<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M10 21v-6h4v6"/>'),
  benta: ICON('<path d="M3 6h18l-2 12H5L3 6z"/><path d="M8 10h8M8 14h6"/>'),
  ubos: ICON('<path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5z"/><path d="M3 7.5 12 12l9-4.5M12 12v9"/>'),
  utang: ICON('<path d="M5 3h12a2 2 0 0 1 2 2v16H7a2 2 0 0 1-2-2z"/><path d="M5 19a2 2 0 0 1 2-2h12"/><path d="M9 7h6M9 11h4"/>'),
  ulat: ICON('<path d="M4 20h16"/><path d="M7 16v-5M12 16V6M17 16v-8"/>'),
};

const PAGES = [
  { href: 'index.html', icon: 'home', label: 'nav_home' },
  { href: 'benta.html', icon: 'benta', label: 'nav_entry' },
  { href: 'records.html', icon: 'utang', label: 'nav_records' },
  { href: 'ubos.html', icon: 'ubos', label: 'nav_ubos' },
  { href: 'ulat.html', icon: 'ulat', label: 'nav_ulat' },
];

(function buildShell() {
  const page = location.pathname.split('/').pop() || 'index.html';
  const links = PAGES.map(p => {
    const current = p.href === page ? ' aria-current="page"' : '';
    const badge = p.icon === 'ubos' ? '<span class="count-badge" hidden></span>' : '';
    return `<a href="./${p.href}"${current}>${ICONS[p.icon]}<span data-label="${p.label}"></span>${badge}</a>`;
  }).join('');

  const mobileLinks = PAGES.map(p => {
    const current = p.href === page ? ' aria-current="page"' : '';
    return `<a href="./${p.href}"${current}>${ICONS[p.icon]}<span data-label="${p.label}"></span></a>`;
  }).join('');

  document.body.insertAdjacentHTML('afterbegin', `
    <header class="topbar">
      <div class="topbar-spacer"></div>
      <a class="topbar-home" href="./index.html" aria-label="KitaKlaro home">
        <img src="./assets/kitaklaro-logo.png" class="topbar-logo" alt="KitaKlaro">
      </a>
      <label class="lang-pill" for="lang-mobile">
        <span class="lang-pill-label" data-label="language"></span>
        <select id="lang-mobile" aria-label="Wika / Language">
          <option value="tl">TL</option>
          <option value="en">EN</option>
        </select>
      </label>
    </header>

    <aside id="sidebar" class="sidebar" aria-label="KitaKlaro navigation">
      <div class="sidebar-head">
        <a class="logo-link" href="./index.html" aria-label="KitaKlaro Dashboard">
          <img src="./assets/kitaklaro-logo.png" alt="KitaKlaro" class="sidebar-logo">
        </a>
      </div>
      <p class="sidebar-section-name">MENU</p>
      <nav class="side-nav">${links}</nav>
      <details id="side-alerts" class="side-alerts" hidden>
        <summary><span data-label="alerts_title"></span></summary>
        <div data-list="low"><h3 data-label="low_title"></h3><ul></ul></div>
        <div data-list="expiry"><h3 data-label="expiry_title"></h3><ul></ul></div>
      </details>
      <div class="sidebar-foot">
        <label class="lang-block" for="lang">
          <span class="lang-block-label" data-label="language"></span>
          <select id="lang" aria-label="Wika / Language">
            <option value="tl">Tagalog</option>
            <option value="en">English</option>
          </select>
        </label>

      </div>
    </aside>

    <nav class="bottom-nav" aria-label="Mobile navigation">
      ${mobileLinks}
    </nav>
  `);
})();

function renderAlerts(products) {
  const low = products.filter(p => p.stock > 0 && p.stock <= 3).sort((a, b) => a.stock - b.stock);
  const expiry = products
    .filter(p => p.expires_on && p.stock > 0 && daysUntil(p.expires_on) <= EXPIRY_WARN_DAYS)
    .sort((a, b) => a.expires_on.localeCompare(b.expires_on));

  const total = low.length + expiry.length;
  const badge = document.querySelector('.count-badge');
  if (badge) {
    badge.hidden = total === 0;
    badge.textContent = total;
  }

  const details = document.getElementById('side-alerts');
  if (!details) return;
  details.hidden = total === 0;

  const writeList = (bucket, items, makeText) => {
    const root = details.querySelector(`[data-list="${bucket}"]`);
    if (!root) return;
    const ul = root.querySelector('ul');
    root.hidden = !items.length;
    ul.replaceChildren(...items.map(item => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = './ubos.html';
      a.textContent = makeText(item);
      li.appendChild(a);
      return li;
    }));
  };

  writeList('low', low, p => `${p.name} — ${t('left_n', { n: p.stock })}`);
  writeList('expiry', expiry, p => `${p.name} — ${expiryText(p.expires_on)}`);
}

document.addEventListener('DOMContentLoaded', () => {
  const desktopPicker = document.getElementById('lang');
  const mobilePicker = document.getElementById('lang-mobile');
  const syncPickers = value => {
    if (desktopPicker) desktopPicker.value = value;
    if (mobilePicker) mobilePicker.value = value;
  };
  syncPickers(localStorage.getItem('kk-lang') || 'tl');
  [desktopPicker, mobilePicker].forEach(picker => {
    if (!picker) return;
    picker.addEventListener('change', () => {
      localStorage.setItem('kk-lang', picker.value);
      syncPickers(picker.value);
      location.reload();
    });
  });
});
