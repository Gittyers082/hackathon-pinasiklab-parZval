// Shared app shell: sidebar nav (left on desktop, slide-out drawer on mobile).
// Load it as the FIRST thing in <body> so the shell is there before the page paints.
// Text is filled in by labels.js (data-label), so this must run before DOMContentLoaded.

const ICON = path => `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${path}</svg>`;
const ICONS = {
  home: ICON('<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M10 21v-6h4v6"/>'),
  utang: ICON('<path d="M5 3h12a2 2 0 0 1 2 2v16H7a2 2 0 0 1-2-2z"/><path d="M5 19a2 2 0 0 1 2-2h12"/><path d="M9 7h6M9 11h4"/>'),
  ubos: ICON('<path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5z"/><path d="M3 7.5 12 12l9-4.5M12 12v9"/>'),
  ulat: ICON('<path d="M4 20h16"/><path d="M7 16v-5M12 16V6M17 16v-8"/>'),
  menu: ICON('<path d="M4 6h16M4 12h16M4 18h16"/>'),
  close: ICON('<path d="M6 6l12 12M18 6 6 18"/>'),
};
const PAGES = [
  { href: 'index.html', icon: 'home', label: 'nav_home' },
  { href: 'utang.html', icon: 'utang', label: 'nav_utang' },
  { href: 'ubos.html', icon: 'ubos', label: 'nav_ubos' },
  { href: 'ulat.html', icon: 'ulat', label: 'nav_ulat' },
];

(function buildShell() {
  const page = location.pathname.split('/').pop() || 'index.html';
  const links = PAGES.map(p => `
    <a href="./${p.href}"${p.href === page ? ' aria-current="page"' : ''}>${ICONS[p.icon]}<span data-label="${p.label}"></span>${p.icon === 'ubos' ? '<span class="count-badge" hidden></span>' : ''}</a>`).join('');

  document.body.insertAdjacentHTML('afterbegin', `
    <header class="topbar">
      <button id="menu-open" class="icon-btn" type="button" aria-controls="sidebar" aria-expanded="false" aria-label="Menu">${ICONS.menu}<span class="dot" hidden></span></button>
      <span class="brand">KitaKlaro</span>
      <span class="badge demo-badge" data-label="demo" hidden></span>
    </header>
    <div id="scrim" class="scrim" hidden></div>
    <aside id="sidebar" class="sidebar" aria-label="KitaKlaro">
      <div class="sidebar-head">
        <span class="brand">KitaKlaro</span>
        <button id="menu-close" class="icon-btn" type="button" aria-label="Close menu">${ICONS.close}</button>
      </div>
      <nav class="side-nav">${links}</nav>
      <details id="side-alerts" class="side-alerts" hidden>
        <summary><span data-label="alerts_title"></span></summary>
        <div data-list="low"><h3 data-label="low_title"></h3><ul></ul></div>
        <div data-list="expiry"><h3 data-label="expiry_title"></h3><ul></ul></div>
      </details>
      <div class="sidebar-foot">
        <span class="badge demo-badge" data-label="demo" hidden></span>
        <select id="lang" aria-label="Wika / Language">
          <option value="tl">Tagalog</option>
          <option value="en">English</option>
        </select>
      </div>
    </aside>`);

  const sidebar = document.getElementById('sidebar');
  const scrim = document.getElementById('scrim');
  const openButton = document.getElementById('menu-open');

  function setOpen(open) {
    sidebar.classList.toggle('open', open);
    scrim.hidden = !open;
    openButton.setAttribute('aria-expanded', String(open));
    // Keep keyboard focus inside the open drawer.
    for (const el of document.querySelectorAll('main, .topbar')) el.inert = open;
    if (open) sidebar.querySelector('a').focus();
    else if (sidebar.contains(document.activeElement)) openButton.focus();
  }

  openButton.addEventListener('click', () => setOpen(true));
  document.getElementById('menu-close').addEventListener('click', () => setOpen(false));
  scrim.addEventListener('click', () => setOpen(false));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && sidebar.classList.contains('open')) setOpen(false);
  });
})();

// Red count on the Inventory link (and a dot on the mobile menu button), plus the sidebar list
// of what is running low (stock <= low_at) or expiring within EXPIRY_WARN_DAYS.
// Home and Inventory call this again after every change to stock.
function renderAlerts(products) {
  const low = products.filter(p => p.stock <= p.low_at).sort((a, b) => a.stock - b.stock);
  const expiring = products
    .filter(p => p.expires_on && p.stock > 0 && daysUntil(p.expires_on) <= EXPIRY_WARN_DAYS)
    .sort((a, b) => a.expires_on.localeCompare(b.expires_on));
  const count = new Set([...low, ...expiring].map(p => p.name)).size;

  const badge = document.querySelector('.side-nav .count-badge');
  badge.textContent = count;
  badge.hidden = !count;
  document.querySelector('#menu-open .dot').hidden = !count;
  document.getElementById('side-alerts').hidden = !count;

  const fill = (key, items, text) => {
    const box = document.querySelector(`#side-alerts [data-list="${key}"]`);
    box.hidden = !items.length;
    box.querySelector('ul').replaceChildren(...items.map(p => {
      const a = document.createElement('a');
      a.href = './ubos.html';
      const name = document.createElement('span');
      name.className = 'name';
      name.textContent = p.name; // textContent: never trust names as HTML
      a.append(name, document.createElement('br'), text(p));
      const li = document.createElement('li');
      li.appendChild(a);
      return li;
    }));
  };
  fill('low', low, p => t('left_n').replace('{n}', p.stock));
  fill('expiry', expiring, p => expiryText(p.expires_on));
}

document.addEventListener('DOMContentLoaded', () => {
  getProducts().then(renderAlerts).catch(() => {}); // the page itself shows server errors
});
