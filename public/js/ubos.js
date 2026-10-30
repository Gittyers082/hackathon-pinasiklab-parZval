// Inventory page: every product, lowest stock first, with a quick restock box.
// Stock at or below low_at shows in red.

const list = document.getElementById('inventory-list');
const message = document.getElementById('message');

async function loadInventory() {
  try {
    const products = (await getProducts()).sort((a, b) => a.stock - b.stock || a.name.localeCompare(b.name));
    list.innerHTML = '';
    message.textContent = products.length ? '' : t('no_ubos');
    for (const p of products) {
      const li = document.createElement('li');
      li.innerHTML = `
        <form class="list-row restock">
          <span class="name"></span>
          <small>${t('stock')}: <b class="${p.stock <= p.low_at ? 'low' : ''}">${Number(p.stock)}</b></small>
          <input name="stock" type="number" min="0" step="1" inputmode="numeric" required aria-label="${t('stock')}">
          <button class="btn" type="submit">${t('save')}</button>
        </form>`;
      li.querySelector('.name').textContent = p.name; // textContent: never trust names as HTML
      li.querySelector('form').addEventListener('submit', async event => {
        event.preventDefault();
        try {
          await setStock(p.name, Number(event.target.elements.stock.value));
          message.textContent = t('saved');
          loadInventory();
        } catch (e) {
          message.textContent = e.message || t('error');
        }
      });
      list.appendChild(li);
    }
  } catch (e) {
    message.textContent = e.message || t('error');
  }
}

loadInventory();
