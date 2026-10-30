// Inventory page: every product, lowest stock first. Tap a product to edit its
// stock, puhunan (cost), selling price and expiry. Stock at or below low_at shows in red.

const list = document.getElementById('inventory-list');
const message = document.getElementById('message');

// The same fields for editing a product and adding a new one (with a name box).
function productForm(p) {
  const form = document.createElement('form');
  form.className = 'confirm product-form';
  form.innerHTML = `
    ${p ? '' : `<label><span>${t('f_name')}</span><input name="name" maxlength="60" required></label>`}
    <div class="product-fields">
      <label><span>${t('stock')}</span><input name="stock" type="number" min="0" max="100000" step="1" inputmode="numeric" required></label>
      <label><span>${t('expires')}</span><input name="expires_on" type="date"></label>
      <label><span>${t('cost')} (₱)</span><input name="cost" type="number" min="0.01" max="100000" step="0.01" inputmode="decimal"></label>
      <label><span>${t('price')} (₱)</span><input name="price" type="number" min="0.01" max="100000" step="0.01" inputmode="decimal"></label>
    </div>
    <button class="btn" type="submit">${t('save')}</button>`;
  const f = form.elements;
  if (p) {
    f.stock.value = p.stock;
    f.expires_on.value = p.expires_on || '';
    f.cost.value = p.cost == null ? '' : p.cost / 100;
    f.price.value = p.price == null ? '' : p.price / 100;
  }
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const pesos = input => (input.value === '' ? null : Number(input.value));
    try {
      await saveProduct({
        name: p ? p.name : f.name.value,
        stock: Number(f.stock.value),
        cost: pesos(f.cost),
        price: pesos(f.price),
        expires_on: f.expires_on.value || null,
      });
      message.textContent = t('saved');
      if (!p) form.reset();
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
    if (!products.length) message.textContent = t('no_ubos');
  } catch (e) {
    message.textContent = e.message || t('error');
  }
}

document.getElementById('add-product').appendChild(productForm(null));
loadInventory();
