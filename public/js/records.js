// Transaction ledger: four tabs, one data source from MySQL or the existing offline fallback.
(function () {
  const kinds = ['benta', 'utang', 'bayad', 'gastos'];
  const list = document.getElementById('records-list');
  const status = document.getElementById('records-status');
  const saved = document.getElementById('records-saved');
  const tabs = [...document.querySelectorAll('[data-tab]')];
  let rows = [];
  let active = new URLSearchParams(location.search).get('tab');
  if (!kinds.includes(active)) active = 'benta';
  const fmt = date => {
    const pad = v => String(v).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}`;
  };
  const escapeHtml = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  function render() {
    tabs.forEach(tab => {
      const current = tab.dataset.tab === active;
      tab.setAttribute('aria-selected', String(current));
      tab.tabIndex = current ? 0 : -1;
    });
    document.getElementById('records-tab-title').textContent = t('k_' + active);
    const matching = rows.filter(item => item.type === active);
    document.getElementById('records-count').textContent = matching.length + ' ' + t('record_count');
    const empty = document.getElementById('records-empty');
    empty.hidden = matching.length !== 0;
    empty.textContent = t('records_empty');
    list.replaceChildren(...matching.map(row => {
      const li = document.createElement('li');
      li.className = 'record-row';
      const isCashIn = row.type === 'benta' || row.type === 'bayad';
      const title = row.name ? row.name : row.item || t('k_' + active);
      const detail = row.name && row.item ? row.item : row.qty && !row.name ? row.qty + ' ' + t('units') : t('k_' + active);
      li.innerHTML = `<span class="record-symbol ${escapeHtml(row.type)}">${isCashIn ? '+' : '−'}</span>
        <div class="record-details"><strong>${escapeHtml(title)}</strong><span>${escapeHtml(detail)}</span><small>${escapeHtml(row.created_at)}</small></div>
        <strong class="record-amount ${isCashIn ? 'incoming' : 'outgoing'}">${isCashIn ? '+' : '−'}${peso(Number(row.centavos))}</strong>`;
      return li;
    }));
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      active = tab.dataset.tab;
      history.replaceState(null, '', './records.html?tab=' + active);
      render();
    });
    tab.addEventListener('keydown', event => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      const step = event.key === 'ArrowRight' ? 1 : -1;
      const next = (kinds.indexOf(active) + step + kinds.length) % kinds.length;
      tabs[next].click(); tabs[next].focus();
    });
  });

  try {
    const flash = sessionStorage.getItem('kk-record-saved');
    if (flash) {
      const stored = JSON.parse(flash);
      if (kinds.includes(stored.kind)) {
        active = stored.kind;
        saved.textContent = '✓ ' + t('saved') + ' ' + t('saved_in_records');
        saved.hidden = false;
      }
      sessionStorage.removeItem('kk-record-saved');
    }
  } catch (_) { sessionStorage.removeItem('kk-record-saved'); }

  const now = new Date();
  const from = new Date(2000, 0, 1);
  const to = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  status.textContent = t('loading_records');
  getRecords(fmt(from), fmt(to)).then(result => {
    rows = result;
    status.textContent = '';
    render();
  }).catch(error => {
    status.textContent = error.message || t('records_unavailable');
    status.classList.add('error');
    render();
  });
})();
