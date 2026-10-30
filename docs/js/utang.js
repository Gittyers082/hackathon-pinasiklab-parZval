// Utang page: list of suki with a balance, and the "Ipakita kay suki" screen.

const list = document.getElementById('utang-list');
const sukiScreen = document.getElementById('suki-screen');
const message = document.getElementById('message');

async function loadList() {
  try {
    const rows = await getUtangList();
    list.innerHTML = '';
    if (!rows.length) message.textContent = t('no_utang');
    for (const row of rows) {
      const li = document.createElement('li');
      const button = document.createElement('button');
      button.className = 'list-row';
      button.type = 'button';
      button.innerHTML = '<span class="name"></span><b></b><small></small>';
      button.querySelector('.name').textContent = row.name; // textContent: never trust names as HTML
      button.querySelector('b').textContent = peso(row.balance);
      button.querySelector('small').textContent = t('show_suki') + ' ›';
      button.addEventListener('click', () => openSuki(row.name));
      li.appendChild(button);
      list.appendChild(li);
    }
  } catch (e) {
    message.textContent = e.message || t('error');
  }
}

async function openSuki(name) {
  try {
    const suki = await getSuki(name);
    document.getElementById('suki-name').textContent = suki.name;
    document.getElementById('suki-balance').textContent = peso(suki.balance);
    const history = document.getElementById('suki-history');
    history.innerHTML = '';
    for (const h of suki.history) {
      const li = document.createElement('li');
      const sign = h.type === 'utang' ? '+' : '−';
      li.className = h.type;
      li.textContent = `${h.created_at.slice(0, 10)}  ${t('k_' + h.type)} ${h.item}  ${sign}${peso(h.centavos)}`;
      history.appendChild(li);
    }
    sukiScreen.hidden = false;
  } catch (e) {
    message.textContent = e.message || t('error');
  }
}

document.getElementById('suki-close').addEventListener('click', () => { sukiScreen.hidden = true; });

loadList();
