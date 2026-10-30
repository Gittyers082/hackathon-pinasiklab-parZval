// The ONLY file that calls fetch().
// Amounts going in are pesos (85.5); amounts coming back are centavos (8550).
// Demo mode: if the server can't be reached, or we're not on localhost (e.g. GitHub Pages),
// the same data shapes are read/written in localStorage instead.

const IS_LOCAL = /^(localhost|127\.0\.0\.1|.+\.localhost)$/.test(location.hostname);
let demoMode = !IS_LOCAL;

function showDemoBadge() {
  const badge = document.getElementById('demo-badge');
  if (badge) badge.hidden = false;
}
document.addEventListener('DOMContentLoaded', () => { if (demoMode) showDemoBadge(); });

// Calls the PHP API.
// On localhost (WAMP) we NEVER fall back to demo mode: if the server or database fails,
// the error is shown on screen so we know the entry was NOT saved to MySQL.
// Demo mode (localStorage) is only used when the app runs off localhost, e.g. GitHub Pages.
async function call(path, options, demoFn) {
  if (demoMode) return demoFn();

  let res;
  try {
    res = await fetch('./api/' + path, options);
  } catch (e) {
    throw new Error('Hindi maabot ang server. Naka-on ba ang WAMP?'); // server unreachable
  }

  const raw = await res.text();
  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    // PHP printed an error page instead of JSON. Show it in the Console (F12) for debugging.
    console.error('API ' + path + ' did not return JSON:\n', raw);
    throw new Error('Server error: tingnan ang Console (F12)');
  }
  if (!res.ok) throw new Error(data.error || 'Server error');
  return data;
}

function post(body) {
  return { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) };
}

// ---- Public functions used by the pages ----

function addUtang({ name, amount, type, item }) {
  return call('utang.php', post({ name, amount, type, item }), () => {
    const db = demoLoad();
    db.utang.push({ name: clean(name), type, centavos: Math.round(amount * 100), item: clean(item), created_at: now() });
    demoSave(db);
    return { ok: true };
  });
}

function getUtangList() {
  return call('utang.php', undefined, () => {
    const totals = {};
    for (const u of demoLoad().utang) {
      totals[u.name] = (totals[u.name] || 0) + (u.type === 'utang' ? u.centavos : -u.centavos);
    }
    return Object.entries(totals)
      .filter(([, balance]) => balance > 0)
      .map(([name, balance]) => ({ name, balance }))
      .sort((a, b) => b.balance - a.balance);
  });
}

function getSuki(name) {
  return call('utang.php?name=' + encodeURIComponent(name), undefined, () => {
    const history = demoLoad().utang.filter(u => u.name === clean(name)).reverse();
    const balance = history.reduce((sum, u) => sum + (u.type === 'utang' ? u.centavos : -u.centavos), 0);
    return { name: clean(name), balance, history };
  });
}

function addEntry({ type, item, qty, amount }) {
  return call('entries.php', post({ type, item, qty, amount }), () => {
    const db = demoLoad();
    db.entries.push({ type, item: clean(item), qty, centavos: Math.round(amount * 100), created_at: now() });
    const product = db.products.find(p => p.name === clean(item));
    if (type === 'benta' && product) product.stock = Math.max(product.stock - qty, 0);
    demoSave(db);
    return { ok: true };
  });
}

function getToday() {
  return call('entries.php?today=1', undefined, () => {
    const today = now().slice(0, 10);
    const sum = type => demoLoad().entries
      .filter(e => e.type === type && e.created_at.startsWith(today))
      .reduce((total, e) => total + e.centavos, 0);
    const benta = sum('benta');
    const gastos = sum('gastos');
    return { benta, gastos, kumita: benta - gastos };
  });
}

function getProducts() {
  return call('products.php', undefined, () => demoLoad().products);
}

function getLowStock() {
  return call('products.php?low=1', undefined, () =>
    demoLoad().products.filter(p => p.stock <= p.low_at).sort((a, b) => a.stock - b.stock));
}

function setStock(name, stock) {
  return call('products.php', post({ name, stock }), () => {
    const db = demoLoad();
    const product = db.products.find(p => p.name === clean(name));
    if (product) product.stock = stock;
    else db.products.push({ id: db.products.length + 1, name: clean(name), stock, low_at: 3 });
    demoSave(db);
    return { ok: true };
  });
}

// ---- Demo-mode storage ----

function clean(text) {
  return String(text || '').trim().replace(/\s+/g, ' ').toLowerCase();
}

// Local time as "YYYY-MM-DD HH:MM:SS", same format as MySQL DATETIME.
function now() {
  const d = new Date();
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function demoLoad() {
  const saved = localStorage.getItem('kk-demo');
  if (saved) return JSON.parse(saved);
  const today = now();
  const db = {
    utang: [
      { name: 'aling rosing', type: 'utang', centavos: 5000, item: 'sardinas', created_at: today },
      { name: 'aling rosing', type: 'bayad', centavos: 2000, item: '', created_at: today },
      { name: 'mang tonyo', type: 'utang', centavos: 12000, item: 'bigas', created_at: today },
      { name: 'ate cel', type: 'utang', centavos: 2200, item: 'shampoo', created_at: today },
    ],
    entries: [
      { type: 'benta', item: 'sardinas', qty: 2, centavos: 5000, created_at: today },
      { type: 'benta', item: 'kape 3-in-1', qty: 5, centavos: 4000, created_at: today },
      { type: 'gastos', item: 'yelo', qty: 1, centavos: 6000, created_at: today },
    ],
    products: [
      { id: 1, name: 'sardinas', stock: 24, low_at: 6 },
      { id: 2, name: 'mantika', stock: 3, low_at: 3 },
      { id: 3, name: 'suka', stock: 1, low_at: 3 },
      { id: 4, name: 'yelo', stock: 0, low_at: 5 },
      { id: 5, name: 'kape 3-in-1', stock: 40, low_at: 10 },
    ],
  };
  demoSave(db);
  return db;
}

function demoSave(db) {
  localStorage.setItem('kk-demo', JSON.stringify(db));
}
