// Home page: "Kumita ba ako?" number, mic, type box and the confirmation card.

const confirmForm = document.getElementById('confirm');
const fields = confirmForm.elements;
// NOTE: never write `fields.item` — `item` is a built-in method of form.elements,
// so it returns a function, not the <input name="item">. Use this instead:
const itemInput = fields.namedItem('item');
const message = document.getElementById('message');
const addProductBox = fields.namedItem('add_product');
const stockPreview = document.getElementById('stock-preview');
const addProductRow = document.getElementById('add-product-row');

// The inventory, kept here for the stock preview, the expiry reminder and the item suggestions.
let products = [];

function say(text, isError) {
  message.textContent = text;
  message.classList.toggle('error', Boolean(isError));
}

async function loadToday() {
  try {
    const today = await getToday();
    document.getElementById('kumita').textContent = peso(today.kumita);
    document.getElementById('kumita').classList.toggle('negative', today.kumita < 0);
    document.getElementById('benta').textContent = peso(today.benta);
    document.getElementById('gastos').textContent = peso(today.gastos);
  } catch (e) {
    say(e.message, true);
  }
  await loadProducts(); // a benta/gastos changes stock, so refresh the inventory too
  loadExpiry();
}

async function loadProducts() {
  try {
    products = await getProducts();
  } catch (e) {
    products = []; // loadToday already shows server errors in the message line.
  }
  renderAlerts(products); // nav.js: red badge + sidebar list
  // <datalist>: typing "sard" in the Item box suggests "sardinas", so names match the inventory.
  document.getElementById('product-names').replaceChildren(...products.map(p => {
    const option = document.createElement('option');
    option.value = p.name;
    return option;
  }));
  updateStockPreview();
}

function findProduct(name) {
  return products.find(p => p.name === clean(name)); // clean() is in api.js: trim + lowercase
}

// Shows what this benta/gastos will do to the inventory BEFORE the owner taps Tama:
//   matched   -> "Imbentaryo: sardinas 3 → 27"
//   unmatched -> "Wala sa Imbentaryo..." and, for a gastos, an opt-in "add as new product" box.
function updateStockPreview() {
  const kind = fields.kind.value;
  const item = clean(itemInput.value);
  const qty = Number(fields.qty.value) || 1;
  const touchesStock = (kind === 'benta' || kind === 'gastos') && item !== '';

  stockPreview.hidden = !touchesStock;
  stockPreview.classList.remove('warn');
  addProductRow.hidden = true;
  if (!touchesStock) {
    addProductBox.checked = false;
    return;
  }

  const product = findProduct(item);
  if (product) {
    const after = kind === 'benta' ? product.stock - qty : product.stock + qty;
    stockPreview.textContent = `${t('ubos_title')}: ${product.name} ${product.stock} → ${after}`;
    if (after < 0) {
      stockPreview.textContent += ` (${t('not_enough_stock')})`;
      stockPreview.classList.add('warn');
    }
    addProductBox.checked = false;
  } else {
    stockPreview.textContent = t('not_in_inventory');
    addProductRow.hidden = kind !== 'gastos'; // only a purchase can start a new product
    if (addProductRow.hidden) addProductBox.checked = false;
  }
}

// Auto total: benta/utang use the selling price, gastos the puhunan, from the Inventory.
const amountHint = document.getElementById('amount-hint');
let amountAuto = false; // true while the Halaga box holds our computed total, not the owner's own number

function unitPriceFor(kind, product) {
  if (!product) return null;
  if (kind === 'gastos') return product.cost ?? null;
  if (kind === 'benta' || kind === 'utang') return product.price ?? null;
  return null; // bayad pays off a balance, it has no item price
}

// Fills Halaga = unit price × qty and shows the math, e.g. "₱28.00 × 3 = ₱84.00 (presyo sa Imbentaryo)".
function updateAutoAmount() {
  const kind = fields.kind.value;
  const unit = unitPriceFor(kind, findProduct(itemInput.value));
  const qty = Number(fields.qty.value);
  const show = amountAuto && unit !== null && Number.isInteger(qty) && qty >= 1;
  amountHint.hidden = !show;
  if (!show) return;
  fields.amount.value = (Number(unit) * qty / 100).toFixed(2);
  fields.amount.classList.remove('weak');
  amountHint.textContent = `${peso(unit)} × ${qty} = ${peso(Number(unit) * qty)} (${t(kind === 'gastos' ? 'from_cost' : 'from_price')})`;
}

// Reminder card: items still in stock that expire within EXPIRY_WARN_DAYS (or already expired).
function loadExpiry() {
  const soon = products
    .filter(p => p.expires_on && p.stock > 0 && daysUntil(p.expires_on) <= EXPIRY_WARN_DAYS)
    .sort((a, b) => a.expires_on.localeCompare(b.expires_on));
  const list = document.getElementById('expiry-list');
  list.replaceChildren(...soon.map(p => {
    const li = document.createElement('li');
    const name = document.createElement('span');
    name.className = 'name';
    name.textContent = p.name;
    li.append(name, ` (${p.stock}): ${expiryText(p.expires_on)}`);
    return li;
  }));
  document.getElementById('expiry-alert').hidden = !soon.length;
}

// Fields are read-only until the owner taps "Ayusin".
function setEditable(editable) {
  for (const el of fields) {
    if (el.tagName === 'SELECT') el.disabled = !editable;
    else if (el.tagName === 'INPUT' && el.type !== 'checkbox') el.readOnly = !editable; // the box always stays tickable
  }
}

// Utang/bayad need a name; everything but bayad has a qty (an utang qty feeds the auto total).
function showFieldsForKind() {
  const isUtang = fields.kind.value === 'utang' || fields.kind.value === 'bayad';
  confirmForm.querySelector('[data-for="name"]').hidden = !isUtang;
  confirmForm.querySelector('[data-for="qty"]').hidden = fields.kind.value === 'bayad';
}

function showConfirm(parsed) {
  fields.kind.value = parsed.kind || '';
  fields.name.value = parsed.name;
  itemInput.value = parsed.item;
  fields.qty.value = parsed.qty;
  fields.amount.value = parsed.amount ?? '';

  // "benta 3 sardinas": the parser reads a lone 3 as ₱3. For a priced product, a single small
  // number below one piece's price is really the qty (₱3 for sardinas at ₱28 makes no sense).
  const unit = unitPriceFor(parsed.kind, findProduct(parsed.item));
  if (unit !== null && parsed.numberCount === 1 && Number.isInteger(parsed.amount)
      && parsed.amount <= 10 && parsed.amount * 100 < unit) {
    fields.qty.value = parsed.amount;
    fields.amount.value = '';
  }
  amountAuto = fields.amount.value === '' && unit !== null;
  const weak = amountAuto ? parsed.weak.filter(k => k !== 'amount') : parsed.weak;

  for (const key of ['kind', 'name', 'item', 'amount']) {
    fields.namedItem(key).classList.toggle('weak', weak.includes(key));
  }
  addProductBox.checked = false;
  showFieldsForKind();
  updateStockPreview();
  updateAutoAmount();
  setEditable(amountAuto ? weak.length > 0 : parsed.needsConfirm); // unsure? open straight in edit mode
  say(parsed.kind ? '' : t('not_understood'), !parsed.kind);
  confirmForm.hidden = false;
  confirmForm.scrollIntoView({ behavior: 'smooth' });
}

function handleText(text) {
  if (!text.trim()) return;
  document.getElementById('type-box').value = text;
  showConfirm(parseTaglish(text));
}

document.getElementById('type-form').addEventListener('submit', event => {
  event.preventDefault();
  handleText(document.getElementById('type-box').value);
});

document.getElementById('ayusin').addEventListener('click', () => {
  setEditable(true);
  fields.kind.focus();
});

fields.kind.addEventListener('change', () => { showFieldsForKind(); updateStockPreview(); updateAutoAmount(); });
itemInput.addEventListener('input', () => { updateStockPreview(); updateAutoAmount(); });
fields.qty.addEventListener('input', () => { updateStockPreview(); updateAutoAmount(); });
// Typing your own amount wins; clearing the box hands it back to the auto total.
fields.amount.addEventListener('input', () => {
  amountAuto = fields.amount.value === '';
  updateAutoAmount();
});

confirmForm.addEventListener('submit', async event => {
  event.preventDefault();
  const kind = fields.kind.value;
  const amount = Number(fields.amount.value);
  const qty = fields.qty.value === '' ? 1 : Number(fields.qty.value); // blank means 1; 0 or 2.5 is an error
  if (!kind) return say(t('not_understood'), true);
  if (!(amount > 0 && amount <= 100000)) return say('Mali ang halaga', true);

  const tama = confirmForm.querySelector('button[type="submit"]');
  tama.disabled = true; // a double tap must not save the entry twice
  try {
    let result;
    if (kind === 'utang' || kind === 'bayad') {
      if (!fields.name.value.trim()) return say('Kulang ang pangalan', true);
      // The utang table has no qty column, so keep it in the item text: "3 sardinas".
      const item = kind === 'utang' && Number.isInteger(qty) && qty > 1 && itemInput.value.trim()
        ? `${qty} ${itemInput.value.trim()}` : itemInput.value;
      result = await addUtang({ name: fields.name.value, amount, type: kind, item });
    } else {
      if (!itemInput.value.trim()) return say('Kulang ang item', true);
      if (!Number.isInteger(qty) || qty < 1 || qty > 10000) return say('Mali ang dami', true);
      const addProduct = kind === 'gastos' && addProductBox.checked && !findProduct(itemInput.value);
      result = await addEntry({ type: kind, item: itemInput.value, qty, amount, addProduct });
    }
    confirmForm.hidden = true;
    addProductBox.checked = false;
    document.getElementById('type-box').value = '';
    // Show the database row number so it's easy to find in Workbench.
    say(t('saved') + (result && result.id ? ' (#' + result.id + ')' : ''));
    loadToday();
  } catch (e) {
    say(e.message || t('error'), true);
  } finally {
    tama.disabled = false;
  }
});

// Mic
const mic = document.getElementById('mic');
setupMicVisibility(mic);
const micLabel = mic.querySelector('span');
mic.addEventListener('click', () => {
  micLabel.textContent = t('listening');
  mic.classList.add('listening');
  listenOnce(handleText, () => {
    micLabel.textContent = t('mic');
    mic.classList.remove('listening');
  }, code => {
    if (code !== 'no-speech' && code !== 'aborted') say(t('error') + ' (' + code + ')', true);
  });
});

loadToday();
