// Home page: "Kumita ba ako?" number, mic, type box and the confirmation card.

const confirmForm = document.getElementById('confirm');
const fields = confirmForm.elements;
// NOTE: never write `fields.item` — `item` is a built-in method of form.elements,
// so it returns a function, not the <input name="item">. Use this instead:
const itemInput = fields.namedItem('item');
const message = document.getElementById('message');

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
}

// Fields are read-only until the owner taps "Ayusin".
function setEditable(editable) {
  for (const el of fields) {
    if (el.tagName === 'SELECT') el.disabled = !editable;
    else if (el.tagName === 'INPUT') el.readOnly = !editable;
  }
}

// Utang/bayad need a name; benta/gastos need a qty.
function showFieldsForKind() {
  const isUtang = fields.kind.value === 'utang' || fields.kind.value === 'bayad';
  confirmForm.querySelector('[data-for="name"]').hidden = !isUtang;
  confirmForm.querySelector('[data-for="qty"]').hidden = isUtang;
}

function showConfirm(parsed) {
  fields.kind.value = parsed.kind || '';
  fields.name.value = parsed.name;
  itemInput.value = parsed.item;
  fields.qty.value = parsed.qty;
  fields.amount.value = parsed.amount ?? '';
  for (const key of ['kind', 'name', 'item', 'amount']) {
    fields.namedItem(key).classList.toggle('weak', parsed.weak.includes(key));
  }
  showFieldsForKind();
  setEditable(parsed.needsConfirm); // unsure? open straight in edit mode
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

fields.kind.addEventListener('change', showFieldsForKind);

confirmForm.addEventListener('submit', async event => {
  event.preventDefault();
  const kind = fields.kind.value;
  const amount = Number(fields.amount.value);
  const qty = Number(fields.qty.value) || 1;
  if (!kind) return say(t('not_understood'), true);
  if (!(amount > 0 && amount <= 100000)) return say('Mali ang halaga', true);

  try {
    let result;
    if (kind === 'utang' || kind === 'bayad') {
      if (!fields.name.value.trim()) return say('Kulang ang pangalan', true);
      result = await addUtang({ name: fields.name.value, amount, type: kind, item: itemInput.value });
    } else {
      if (!itemInput.value.trim()) return say('Kulang ang item', true);
      result = await addEntry({ type: kind, item: itemInput.value, qty, amount });
    }
    confirmForm.hidden = true;
    document.getElementById('type-box').value = '';
    // Show the database row number so it's easy to find in Workbench.
    say(t('saved') + (result && result.id ? ' (#' + result.id + ')' : ''));
    loadToday();
  } catch (e) {
    say(e.message || t('error'), true);
  }
});

// Mic
const mic = document.getElementById('mic');
setupMicVisibility(mic);
mic.addEventListener('click', () => {
  mic.textContent = t('listening');
  mic.classList.add('listening');
  listenOnce(handleText, () => {
    mic.textContent = t('mic');
    mic.classList.remove('listening');
  }, code => {
    if (code !== 'no-speech' && code !== 'aborted') say(t('error') + ' (' + code + ')', true);
  });
});

loadToday();
