// "Ulat" page: benta vs gastos for this week / month / year, compared with the same
// stretch of the previous period, plus top-selling items and biggest expenses.
// shortcut: adds up raw entry rows in the browser (same code for MySQL and demo mode);
// fine for a store's tens of thousands of rows, move the SUM/GROUP BY into SQL if it gets slow.

const LOCALE = lang === 'en' ? 'en-PH' : 'fil-PH';
const SERIES = [
  { key: 'benta', color: '#0E7A55' }, // categorical slot 1 (blue)
  { key: 'gastos', color: '#C8442B' }, // categorical slot 2 (orange)
];
const report = document.getElementById('report');
const message = document.getElementById('message');
let lastBuckets = null;

const ymd = d => d.toLocaleDateString('en-CA'); // YYYY-MM-DD, local time

// Current period and the same number of days at the start of the previous one.
function periodRange(kind) {
  const now = new Date();
  const y = now.getFullYear(), m = now.getMonth(), d = now.getDate();
  const tomorrow = new Date(y, m, d + 1);
  let from, prevFrom, prevTo;
  if (kind === 'week') {
    from = new Date(y, m, d - 6);
    prevFrom = new Date(y, m, d - 13);
    prevTo = from;
  } else if (kind === 'month') {
    from = new Date(y, m, 1);
    prevFrom = new Date(y, m - 1, 1);
    prevTo = new Date(y, m - 1, d + 1);
  } else {
    from = new Date(y, 0, 1);
    prevFrom = new Date(y - 1, 0, 1);
    prevTo = new Date(y - 1, m, d + 1);
  }
  if (prevTo > from) prevTo = from; // e.g. Mar 31 vs a 28-day February
  return { from, to: tomorrow, prevFrom, prevTo, group: kind === 'year' ? 'month' : 'day' };
}

function sumBy(rows, type) {
  return rows.filter(r => r.type === type).reduce((s, r) => s + Number(r.centavos), 0);
}

// One bucket per day (week/month) or per month (year), from `from` up to today.
function makeBuckets(rows, range) {
  const buckets = [];
  const byKey = {};
  for (let d = new Date(range.from); d < range.to;) {
    const key = range.group === 'day' ? ymd(d) : ymd(d).slice(0, 7);
    const bucket = { key, date: new Date(d), benta: 0, gastos: 0 };
    buckets.push(bucket);
    byKey[key] = bucket;
    if (range.group === 'day') d.setDate(d.getDate() + 1);
    else d.setMonth(d.getMonth() + 1);
  }
  for (const r of rows) {
    const bucket = byKey[r.created_at.slice(0, range.group === 'day' ? 10 : 7)];
    if (bucket) bucket[r.type] += Number(r.centavos);
  }
  return buckets;
}

function topItems(rows, type) {
  const totals = {};
  for (const r of rows.filter(r => r.type === type)) {
    totals[r.item] = totals[r.item] || { item: r.item, qty: 0, centavos: 0 };
    totals[r.item].qty += Number(r.qty);
    totals[r.item].centavos += Number(r.centavos);
  }
  return Object.values(totals).sort((a, b) => b.centavos - a.centavos).slice(0, 5);
}

// Benta minus puhunan, only for items that match a product with a cost.
function profitEstimate(rows, products) {
  const cost = {};
  for (const p of products) if (p.cost != null) cost[p.name] = Number(p.cost);
  const matched = rows.filter(r => r.type === 'benta' && r.item in cost);
  if (!matched.length) return null;
  return matched.reduce((s, r) => s + Number(r.centavos) - cost[r.item] * Number(r.qty), 0);
}

function bucketLabel(bucket, group) {
  return bucket.date.toLocaleDateString(LOCALE, group === 'day' ? { month: 'short', day: 'numeric' } : { month: 'short' });
}

// ---- Chart: two 2px lines on one peso axis, crosshair tooltip, keyboard arrows ----

function niceStep(raw) {
  const pow = 10 ** Math.floor(Math.log10(raw));
  return [1, 2, 2.5, 5, 10].map(s => s * pow).find(s => s >= raw);
}

function renderChart(buckets, group) {
  const chart = document.getElementById('chart');
  const W = Math.max(chart.clientWidth, 280), H = 220;
  const m = { l: 52, r: 14, t: 12, b: 28 };
  const plotW = W - m.l - m.r, plotH = H - m.t - m.b;
  const n = buckets.length;
  const peak = Math.max(1, ...buckets.flatMap(b => [b.benta, b.gastos]));
  const step = niceStep(peak / 4);
  const max = step * 4;
  const compact = max >= 1000000; // ₱10,000+ -> ₱10K, one style per axis
  const tick = v => '₱' + (compact ? (v / 100000).toLocaleString('en-PH') + 'K' : (v / 100).toLocaleString('en-PH'));
  const x = i => m.l + (n === 1 ? plotW / 2 : (i * plotW) / (n - 1));
  const y = v => m.t + plotH - (v / max) * plotH;

  let svg = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" tabindex="0" role="img" aria-label="${t('chart_title')}. ${t('chart_keys')}">`;
  for (let i = 0; i <= 4; i++) {
    const v = step * i;
    svg += `<line x1="${m.l}" x2="${W - m.r}" y1="${y(v)}" y2="${y(v)}" stroke="${i ? '#e1e0d9' : '#c3c2b7'}" stroke-width="1"/>`;
    svg += `<text x="${m.l - 6}" y="${y(v) + 4}" text-anchor="end" class="axis">${tick(v)}</text>`;
  }
  const every = Math.ceil(n / 6);
  buckets.forEach((b, i) => {
    // Every `every`-th label plus the last one, skipping a regular label that would crowd the last.
    if ((i % every === 0 && n - 1 - i >= every) || i === n - 1) {
      svg += `<text x="${x(i)}" y="${H - 8}" text-anchor="${i === n - 1 && n > 1 ? 'end' : 'middle'}" class="axis">${bucketLabel(b, group)}</text>`;
    }
  });
  for (const s of SERIES) {
    const d = buckets.map((b, i) => `${i ? 'L' : 'M'}${x(i)},${y(b[s.key])}`).join('');
    svg += `<path d="${d}" fill="none" stroke="${s.color}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>`;
    svg += `<circle cx="${x(n - 1)}" cy="${y(buckets[n - 1][s.key])}" r="4" fill="${s.color}" stroke="#fff" stroke-width="2"/>`;
  }
  svg += `<line class="crosshair" y1="${m.t}" y2="${m.t + plotH}" stroke="#898781" stroke-width="1" visibility="hidden"/>`;
  for (const s of SERIES) svg += `<circle class="hover-dot" data-key="${s.key}" r="4" fill="${s.color}" stroke="#fff" stroke-width="2" visibility="hidden"/>`;
  svg += `<rect class="hit" x="${m.l - 10}" y="0" width="${plotW + 20}" height="${H}" fill="transparent"/></svg>`;
  chart.innerHTML = svg + '<div class="tooltip" hidden></div>';

  const el = chart.querySelector('svg');
  const tooltip = chart.querySelector('.tooltip');
  const crosshair = chart.querySelector('.crosshair');
  let current = n - 1;

  function show(i) {
    current = Math.min(Math.max(i, 0), n - 1);
    const b = buckets[current];
    crosshair.setAttribute('x1', x(current));
    crosshair.setAttribute('x2', x(current));
    crosshair.setAttribute('visibility', 'visible');
    chart.querySelectorAll('.hover-dot').forEach(dot => {
      dot.setAttribute('cx', x(current));
      dot.setAttribute('cy', y(b[dot.dataset.key]));
      dot.setAttribute('visibility', 'visible');
    });
    const title = document.createElement('div');
    title.className = 'tooltip-title';
    title.textContent = bucketLabel(b, group);
    const rows = SERIES.map(s => {
      const row = document.createElement('div');
      row.className = 'tooltip-row';
      const key = document.createElement('span');
      key.className = 'key ' + s.key;
      const value = document.createElement('strong');
      value.textContent = peso(b[s.key]);
      const name = document.createElement('span');
      name.textContent = t(s.key);
      row.append(key, value, name);
      return row;
    });
    tooltip.replaceChildren(title, ...rows);
    tooltip.hidden = false;
    const left = x(current) + 12;
    tooltip.style.left = (left + tooltip.offsetWidth > W ? x(current) - 12 - tooltip.offsetWidth : left) + 'px';
  }
  function hide() {
    tooltip.hidden = true;
    crosshair.setAttribute('visibility', 'hidden');
    chart.querySelectorAll('.hover-dot').forEach(dot => dot.setAttribute('visibility', 'hidden'));
  }

  el.addEventListener('pointermove', event => {
    const px = event.clientX - el.getBoundingClientRect().left;
    show(n === 1 ? 0 : Math.round(((px - m.l) / plotW) * (n - 1)));
  });
  el.addEventListener('pointerleave', hide);
  el.addEventListener('focus', () => show(current));
  el.addEventListener('blur', hide);
  el.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') show(current - 1);
    else if (event.key === 'ArrowRight') show(current + 1);
    else return;
    event.preventDefault();
  });
}

function renderTable(buckets, group) {
  const table = document.getElementById('chart-table');
  const head = document.createElement('tr');
  for (const key of ['date', 'benta', 'gastos', 'kumita_period']) {
    const th = document.createElement('th');
    th.textContent = t(key);
    head.appendChild(th);
  }
  const rows = buckets.map(b => {
    const tr = document.createElement('tr');
    for (const text of [bucketLabel(b, group), peso(b.benta), peso(b.gastos), peso(b.benta - b.gastos)]) {
      const td = document.createElement('td');
      td.textContent = text;
      tr.appendChild(td);
    }
    return tr;
  });
  table.replaceChildren(head, ...rows);
}

function renderTop(id, items, color) {
  const list = document.getElementById(id);
  if (!items.length) {
    const li = document.createElement('li');
    li.className = 'muted';
    li.textContent = t('no_data');
    list.replaceChildren(li);
    return;
  }
  const top = items[0].centavos;
  list.replaceChildren(...items.map(it => {
    const li = document.createElement('li');
    const name = document.createElement('span');
    name.className = 'name';
    name.textContent = it.item; // textContent: never trust names as HTML
    const value = document.createElement('span');
    value.className = 'value';
    value.textContent = `${peso(it.centavos)} · ${it.qty} ${t('pcs')}`;
    const track = document.createElement('div');
    track.className = 'bar';
    const fill = document.createElement('div');
    fill.style.width = Math.max((it.centavos / top) * 100, 1) + '%';
    fill.style.background = color;
    track.appendChild(fill);
    li.append(name, value, track);
    return li;
  }));
}

async function loadReport(kind) {
  localStorage.setItem('kk-period', kind);
  document.querySelectorAll('[data-period]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.period === kind)));
  report.classList.add('loading'); // keep the old numbers on screen while loading
  const range = periodRange(kind);
  try {
    const [rows, products] = await Promise.all([getEntries(ymd(range.prevFrom), ymd(range.to)), getProducts()]);
    const current = rows.filter(r => r.created_at >= ymd(range.from));
    const previous = rows.filter(r => r.created_at < ymd(range.prevTo));

    const benta = sumBy(current, 'benta');
    const gastos = sumBy(current, 'gastos');
    const net = benta - gastos;
    const diff = net - (sumBy(previous, 'benta') - sumBy(previous, 'gastos'));
    const last = new Date(range.to);
    last.setDate(last.getDate() - 1);
    const fmt = { month: 'short', day: 'numeric', year: 'numeric' };
    document.getElementById('range').textContent = `${range.from.toLocaleDateString(LOCALE, fmt)} – ${last.toLocaleDateString(LOCALE, fmt)}`;
    document.getElementById('net').textContent = peso(net);
    document.getElementById('net').classList.toggle('negative', net < 0);
    const delta = document.getElementById('delta');
    delta.textContent = `${diff >= 0 ? '+' : '−'}${peso(Math.abs(diff))} ${t('vs_' + kind)}`;
    delta.className = 'delta ' + (diff >= 0 ? 'up' : 'down');
    document.getElementById('t-benta').textContent = peso(benta);
    document.getElementById('t-gastos').textContent = peso(gastos);
    const profit = profitEstimate(current, products);
    document.getElementById('t-profit').textContent = profit === null ? '—' : peso(profit);

    lastBuckets = { buckets: makeBuckets(current, range), group: range.group };
    renderChart(lastBuckets.buckets, lastBuckets.group);
    renderTable(lastBuckets.buckets, lastBuckets.group);
    renderTop('top-benta', topItems(current, 'benta'), SERIES[0].color);
    renderTop('top-gastos', topItems(current, 'gastos'), SERIES[1].color);
    message.textContent = current.length ? '' : t('no_data');
    message.classList.remove('error');
  } catch (e) {
    message.textContent = e.message || t('error');
    message.classList.add('error');
  } finally {
    report.classList.remove('loading');
  }
}

document.querySelectorAll('[data-period]').forEach(button => {
  button.addEventListener('click', () => loadReport(button.dataset.period));
});
window.addEventListener('resize', () => { if (lastBuckets) renderChart(lastBuckets.buckets, lastBuckets.group); });

loadReport(['week', 'month', 'year'].includes(localStorage.getItem('kk-period')) ? localStorage.getItem('kk-period') : 'month');
