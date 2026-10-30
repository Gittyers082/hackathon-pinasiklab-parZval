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
    <a href="./${p.href}"${p.href === page ? ' aria-current="page"' : ''}>${ICONS[p.icon]}<span data-label="${p.label}"></span></a>`).join('');

  document.body.insertAdjacentHTML('afterbegin', `
    <header class="topbar">
      <button id="menu-open" class="icon-btn" type="button" aria-controls="sidebar" aria-expanded="false" aria-label="Menu">${ICONS.menu}</button>
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
      <div class="sidebar-foot">
        <span class="badge demo-badge" data-label="demo" hidden></span>
        <select id="lang" aria-label="Wika / Language">
          <option value="tl">Tagalog</option>
          <option value="ilo">Ilocano</option>
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
