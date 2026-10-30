// Inventory page: every product, lowest stock first. Tap a product to edit its name,
// stock, low-stock warning, puhunan (cost), selling price and expiry, or delete it.
// Stock at or below low_at shows in red.

const list = document.getElementById('inventory-list');
const message = document.getElementById('message');

// The same fields for editing a product and adding a new one (p = null).
function productForm(p) {
  const form = document.createElement('form');
  form.className = 'confirm product-form';
  form.innerHTML = `
    <label><span>${t('f_name')}</span><input name="name" maxlength="60" required></label>
    <div class="product-fields">
      <label><span>${t('stock')}</span><input name="stock" type="number" min="0" max="100000" step="1" inputmode="numeric" required></label>
      <label><span>${t('low_at')}</span><input name="low_at" type="number" min="0" max="100000" step="1" inputmode="numeric" value="${p ? Number(p.low_at) : 3}" required></label>
      <label><span>${t('expires')}</span><input name="expires_on" type="date"></label>
      <label><span>${t('cost')} (₱)</span><input name="cost" type="number" min="0.01" max="100000" step="0.01" inputmode="decimal"></label>
      <label><span>${t('price')} (₱)</span><input name="price" type="number" min="0.01" max="100000" step="0.01" inputmode="decimal"></label>
    </div>
    <p class="form-warning" role="alert" hidden></p>
    <div class="row">
      <button class="btn" type="submit">${t('save')}</button>
      ${p ? `<button class="btn danger" type="button" data-action="delete">${t('delete')}</button>` : ''}
    </div>`;
  const f = form.elements;
  const warningBox = form.querySelector('.form-warning');
  const saveButton = form.querySelector('button[type="submit"]');
  const pesos = input => (input.value === '' ? null : Number(input.value));
  const centavos = value => (value === null ? null : Math.round(value * 100));
  if (p) {
    f.name.value = p.name;
    f.stock.value = p.stock;
    f.expires_on.value = p.expires_on || '';
    f.cost.value = p.cost == null ? '' : p.cost / 100;
    f.price.value = p.price == null ? '' : p.price / 100;
  }
  // A selling price below puhunan, or an expiry date in the past, can be legitimate
  // (clearance sale; recording stock that already expired), so they are allowed. But they
  // are also easy typos, so the first tap shows a warning and the second tap saves.
  // Only warns about values that changed, so editing just the stock of an expired item is quiet.
  function warnings() {
    const cost = centavos(pesos(f.cost));
    const price = centavos(pesos(f.price));
    const expires = f.expires_on.value || null;
    const priceChanged = !p || cost !== p.cost || price !== p.price;
    const expiryChanged = !p || expires !== (p.expires_on || null);
    const list = [];
    if (cost !== null && price !== null && price < cost && priceChanged) {
      list.push(t('warn_below_cost').replace('{loss}', peso(cost - price)));
    }
    if (expires && daysUntil(expires) < 0 && expiryChanged) list.push(t('warn_expired'));
    return list;
  }

  function clearWarning() {
    warningBox.hidden = true;
    delete form.dataset.confirmed;
    saveButton.textContent = t('save');
  }
  form.addEventListener('input', clearWarning); // any edit means the owner must look again

  form.addEventListener('submit', async event => {
    event.preventDefault();
    const found = warnings();
    if (found.length && !form.dataset.confirmed) {
      warningBox.textContent = found.join(' ');
      warningBox.hidden = false;
      saveButton.textContent = t('save_anyway');
      form.dataset.confirmed = '1';
      return;
    }
    saveButton.disabled = true; // a double tap must not save twice
    try {
      await saveProduct({
        id: p ? p.id : undefined,
        name: f.name.value,
        stock: Number(f.stock.value),
        low_at: Number(f.low_at.value),
        cost: pesos(f.cost),
        price: pesos(f.price),
        expires_on: f.expires_on.value || null,
      });
      message.textContent = t('saved');
      clearWarning();
      if (!p) form.reset();
      loadInventory();
    } catch (e) {
      message.textContent = e.message || t('error');
    } finally {
      saveButton.disabled = false;
    }
  });

  // confirm() is a real modal, so a stray double tap can't delete.
  form.querySelector('[data-action="delete"]')?.addEventListener('click', async () => {
    if (!confirm(t('confirm_delete').replace('{name}', p.name))) return;
    try {
      await deleteProduct(p.id);
      message.textContent = t('deleted');
      loadInventory();
    } catch (e) {
      message.textContent = e.message || t('error');
    }
  });
  return form;
}

function productRow(p) {
  const li = document.createElement('li');
  li.className = 'card product';
  li.innerHTML = `
    <details>
      <summary>
        <span class="name"></span>
        <b class="${p.stock <= p.low_at ? 'low' : ''}">${Number(p.stock)}</b>
        <small></small>
      </summary>
    </details>`;
  li.querySelector('.name').textContent = p.name; // textContent: never trust names as HTML

  const meta = li.querySelector('small');
  const parts = [];
  if (p.price != null) parts.push(`${t('price')} ${peso(p.price)}`);
  if (p.cost != null) parts.push(`${t('cost')} ${peso(p.cost)}`);
  meta.textContent = parts.join(' · ');
  if (p.expires_on) {
    const expiry = document.createElement('span');
    expiry.textContent = (parts.length ? ' · ' : '') + t('expires') + ': ' + expiryText(p.expires_on);
    expiry.classList.toggle('warn', daysUntil(p.expires_on) <= EXPIRY_WARN_DAYS);
    meta.appendChild(expiry);
  }

  li.querySelector('details').appendChild(productForm(p));
  return li;
}

async function loadInventory() {
  try {
    const products = (await getProducts()).sort((a, b) => a.stock - b.stock || a.name.localeCompare(b.name));
    list.replaceChildren(...products.map(productRow));
    renderAlerts(products); // nav.js: red badge + sidebar list
    if (!products.length) message.textContent = t('no_ubos');
  } catch (e) {
    message.textContent = e.message || t('error');
  }
}

document.getElementById('add-product').appendChild(productForm(null));
loadInventory();
