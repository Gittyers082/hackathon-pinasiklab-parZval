// Home overview: all figures come from the same API as Reports/Stock/Records.
(function () {
  const stockBox = document.getElementById('stock-glance');
  const recentBox = document.getElementById('recent-entries');
  const message = document.getElementById('message');
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const stamp = date => {
    const pad = value => String(value).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}`;
  };

  async function refresh() {
    let errors = [];
    try {
      const today = await getToday();
      const net = document.getElementById('kumita');
      net.textContent = peso(Number(today.kumita));
      net.classList.toggle('negative', Number(today.kumita) < 0);
      document.getElementById('benta').textContent = peso(Number(today.benta));
      document.getElementById('gastos').textContent = peso(Number(today.gastos));
    } catch (error) {
      errors.push(error.message);
      document.getElementById('kumita').textContent = '—';
      document.getElementById('benta').textContent = '—';
      document.getElementById('gastos').textContent = '—';
    }

    try {
      const products = await getProducts();
      renderAlerts(products);
      const urgent = products.filter(x => Number(x.stock) <= Number(x.low_at))
        .sort((a,b) => Number(a.stock) - Number(b.stock)).slice(0,4);
      stockBox.innerHTML = urgent.length ? urgent.map(x => `<a class="stock-item" href="./ubos.html"><span class="stock-item-name">${esc(x.name)}</span><span class="stock-count">${Number(x.stock)} ${t('stock_left')}</span></a>`).join('') : `<p class="empty-note">${t('stock_ok')}</p>`;
      const expiring = products.filter(p => p.expires_on && p.stock > 0 && daysUntil(p.expires_on) <= EXPIRY_WARN_DAYS)
        .sort((a,b) => a.expires_on.localeCompare(b.expires_on));
      const list = document.getElementById('expiry-list');
      list.replaceChildren(...expiring.map(p => {
        const li = document.createElement('li');
        li.textContent = p.name + ' — ' + expiryText(p.expires_on);
        return li;
      }));
      document.getElementById('expiry-alert').hidden = !expiring.length;
    } catch (error) {
      errors.push(error.message);
      stockBox.textContent = t('stock_unavailable');
    }

    try {
      const start = stamp(new Date());
      const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
      const rows = await getEntries(start, stamp(tomorrow));
      const items = rows.slice(-4).reverse();
      recentBox.innerHTML = items.length ? items.map(x => {
        const kind = x.type === 'benta' ? 'benta' : 'gastos';
        return `<div class="recent-row"><span class="recent-symbol ${kind}">${kind === 'benta' ? '↗' : '↘'}</span><span class="recent-details"><strong>${esc(x.item)}</strong><small>${t('k_' + kind)} · ${Number(x.qty)||1} ${t('units')}</small></span><strong class="recent-amount ${kind}">${kind === 'benta' ? '+' : '−'}${peso(Number(x.centavos))}</strong></div>`;
      }).join('') : `<p class="empty-note">${t('recent_empty')}</p>`;
    } catch (error) {
      errors.push(error.message);
      recentBox.textContent = t('records_unavailable');
    }
    message.textContent = errors.length ? [...new Set(errors)].join(' · ') : '';
    message.classList.toggle('error', Boolean(errors.length));
  }
  refresh();
  window.addEventListener('kk:entry-saved', refresh);
})();
