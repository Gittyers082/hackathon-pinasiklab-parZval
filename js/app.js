/* KitaKlaro — app screens.
   No framework, no build step, no storage: the state below lives in memory
   for the length of the session. Reloading restores the seeded day, which
   is what a demo wants. Swap SEED for a real source later.          */
(function () {
  'use strict';

  // ---------------------------------------------------------------- data

  var PRODUCTS = [
    { id: 'p1',  name: 'Lucky Me Pancit Canton', unit: 'piraso', price: 19,  cost: 15.5, qty: 3,  min: 10 },
    { id: 'p2',  name: 'Datu Puti Suka 350ml',   unit: 'bote',   price: 28,  cost: 22,   qty: 2,  min: 6  },
    { id: 'p3',  name: 'Bear Brand 33g',         unit: 'sachet', price: 15,  cost: 11.5, qty: 24, min: 12 },
    { id: 'p4',  name: 'Kopiko Brown 3-in-1',    unit: 'sachet', price: 9,   cost: 6.8,  qty: 58, min: 24 },
    { id: 'p5',  name: 'Great Taste White',      unit: 'sachet', price: 9,   cost: 6.6,  qty: 142,min: 24 },
    { id: 'p6',  name: 'Tide Bar 55g',           unit: 'piraso', price: 14,  cost: 10.5, qty: 31, min: 12 },
    { id: 'p7',  name: 'Palmolive Shampoo',      unit: 'sachet', price: 8,   cost: 5.9,  qty: 47, min: 24 },
    { id: 'p8',  name: 'Skyflakes Singles',      unit: 'piraso', price: 10,  cost: 7.5,  qty: 19, min: 12 },
    { id: 'p9',  name: 'Coke Mismo 300ml',       unit: 'bote',   price: 25,  cost: 19,   qty: 12, min: 12 },
    { id: 'p10', name: 'Itlog',                  unit: 'piraso', price: 9.5, cost: 7.2,  qty: 40, min: 12 },
    { id: 'p11', name: 'Bigas (per kilo)',       unit: 'kilo',   price: 55,  cost: 47,   qty: 26, min: 10 },
    { id: 'p12', name: 'Sardinas 155g',          unit: 'lata',   price: 23,  cost: 18,   qty: 15, min: 12 }
  ];

  var SALES = [
    { id: 's1', time: '10:42', via: 'boses',  items: [['p1', 2]], paid: true },
    { id: 's2', time: '09:58', via: 'tap',    items: [['p5', 4], ['p3', 1]], paid: true },
    { id: 's3', time: '09:12', via: 'tap',    items: [['p11', 2]], paid: true },
    { id: 's4', time: '08:30', via: 'kamera', items: [['p3', 1]], paid: true },
    { id: 's5', time: '08:05', via: 'tap',    items: [['p9', 2], ['p8', 3]], paid: false, who: 'Mang Ruben' }
  ];

  // A store at this volume rings up dozens of small sales a day. The feed
  // only ever shows the last handful, so the rest of the day is carried as
  // one aggregate rather than 33 rows nobody scrolls through.
  var EARLIER = { benta: 3556, puhunan: 2698, count: 33 };

  var EXPENSES = [
    { id: 'e1', time: '09:15', label: 'Meralco partial load', amount: 500 },
    { id: 'e2', time: '07:40', label: 'Puhunan — delivery ni Aling Siony', amount: 1930.75 }
  ];

  var UTANG = [
    { id: 'u1', who: 'Mang Ruben',    since: '28 Okt', balance: 120,   items: 'Coke Mismo x2, Skyflakes x3' },
    { id: 'u2', who: 'Ate Marites',   since: '26 Okt', balance: 385.5, items: 'Bigas 3 kilo, sardinas x4' },
    { id: 'u3', who: 'Kuya Jun',      since: '29 Okt', balance: 64,    items: 'Kopiko x4, Tide bar x2' },
    { id: 'u4', who: 'Nanay Charing', since: '21 Okt', balance: 940,   items: 'Linggo-linggong grocery' }
  ];

  // Six weeks of daily takings, for the report. Last value is today.
  var WEEKLY = [3120, 2980, 3540, 3310, 3380, 3850];
  var DAYS = ['Lun', 'Mar', 'Mié', 'Huw', 'Bié', 'Sab'];

  var cart = [];   // [{ id, qty }]

  // ------------------------------------------------------------- helpers

  function $(sel) { return document.querySelector(sel); }
  function peso(n) {
    return '₱' + n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  function product(id) {
    for (var i = 0; i < PRODUCTS.length; i++) if (PRODUCTS[i].id === id) return PRODUCTS[i];
    return null;
  }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function saleTotal(sale) {
    return sale.items.reduce(function (sum, line) {
      var p = product(line[0]);
      return sum + (p ? p.price * line[1] : 0);
    }, 0);
  }
  function saleCost(sale) {
    return sale.items.reduce(function (sum, line) {
      var p = product(line[0]);
      return sum + (p ? p.cost * line[1] : 0);
    }, 0);
  }
  function totals() {
    var benta = EARLIER.benta, puhunan = EARLIER.puhunan;
    SALES.forEach(function (s) { benta += saleTotal(s); puhunan += saleCost(s); });
    var gastos = EXPENSES.reduce(function (a, e) { return a + e.amount; }, 0);
    return {
      benta: benta,
      gastos: gastos,
      // What the owner means by "kita ngayong araw": cash in minus cash out
      // today. Margin after cost of goods is a separate figure, on the Ulat.
      kita: benta - gastos,
      tubo: benta - puhunan,
      count: EARLIER.count + SALES.length
    };
  }
  function stockState(p) {
    if (p.qty <= p.min * 0.34) return 'out';
    if (p.qty <= p.min) return 'low';
    return 'ok';
  }

  var toastTimer;
  function toast(msg) {
    var el = $('#toast');
    el.textContent = msg;
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.hidden = true; }, 2600);
  }

  // ------------------------------------------------------------- headers

  function netChipHtml() {
    var off = !navigator.onLine;
    return '<span class="chip ' + (off ? 'chip--offline' : 'chip--live') + '" id="net-chip">' +
      (off ? 'Offline' : 'Naka-online') + '</span>';
  }

  // Plain header for the working screens; the gold field is reserved for
  // the home screen, so it keeps its weight.
  function headerPlain(title, sub) {
    return '<header class="appbar">' +
      '<div class="appbar__top"><p class="mark">Kita<b>Klaro</b></p>' + netChipHtml() + '</div>' +
      '<div class="appbar__store"><h1>' + esc(title) + '</h1><p>' + esc(sub) + '</p></div>' +
      '</header>';
  }

  function greeting() {
    var h = new Date().getHours();
    if (h < 11) return 'Magandang umaga';
    if (h < 18) return 'Magandang hapon';
    return 'Magandang gabi';
  }

  // ------------------------------------------------------------- screens

  function screenKita() {
    var t = totals();
    var yesterday = WEEKLY[WEEKLY.length - 2];
    var delta = Math.round(((t.benta - yesterday) / yesterday) * 100);
    var low = PRODUCTS.filter(function (p) { return stockState(p) !== 'ok'; });

    var feed = SALES.map(function (s) {
      var names = s.items.map(function (l) {
        var p = product(l[0]);
        return l[1] + '× ' + (p ? p.name : '?');
      }).join(', ');
      return {
        time: s.time, name: s.paid ? names : 'Utang — ' + s.who,
        meta: s.time + ' · ' + s.via, amount: saleTotal(s), kind: s.paid ? 'in' : 'utang'
      };
    }).concat(EXPENSES.map(function (e) {
      return { time: e.time, name: e.label, meta: e.time + ' · gastos', amount: -e.amount, kind: 'out' };
    })).sort(function (a, b) { return a.time < b.time ? 1 : -1; });

    return '' +
      '<div class="field-head">' +
        '<div class="field-head__top"><p class="mark">Kita<b>Klaro</b></p>' + netChipHtml() + '</div>' +
        '<p class="field-head__hello">' + greeting() + ',</p>' +
        '<h1 class="field-head__greet">Aling Nena’s Tindahan</h1>' +
        '<section class="lead">' +
          '<p class="lead__label">Kita ngayong araw</p>' +
          '<p class="lead__value amt">' + peso(t.kita).replace(/\.(\d\d)$/, '<span style="font-size:60%">.$1</span>') + '</p>' +
          '<p class="lead__delta"><b class="' + (delta >= 0 ? 'up' : 'down') + '">' +
            (delta >= 0 ? '▲ ' : '▼ ') + Math.abs(delta) + '%</b> kaysa kahapon · ' +
            t.count + ' benta</p>' +
        '</section>' +
        '<dl class="figures">' +
          '<div><dt>Benta</dt><dd class="amt">' + peso(t.benta) + '</dd></div>' +
          '<div><dt>Gastos</dt><dd class="amt">' + peso(t.gastos) + '</dd></div>' +
        '</dl>' +
      '</div>' +
      '<nav class="quick" aria-label="Mabilisang gawain">' +
        '<button class="quick__item quick__item--go" type="button" data-act="voice">' +
          '<span class="quick__icon"><svg viewBox="0 0 24 24" aria-hidden="true">' +
          '<path d="M12 3a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3z"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg></span>' +
          'Magsalita</button>' +
        '<a class="quick__item" href="#benta"><span class="quick__icon"><svg viewBox="0 0 24 24" aria-hidden="true">' +
          '<path d="M3 6h18l-2 12H5L3 6zm4 0a5 5 0 0 1 10 0"/></svg></span>Benta</a>' +
        '<a class="quick__item" href="#stock"><span class="quick__icon"><svg viewBox="0 0 24 24" aria-hidden="true">' +
          '<path d="M4 7h16v13H4zM4 7l2-3h12l2 3M9 11h6"/></svg></span>Stock</a>' +
        '<a class="quick__item" href="#utang"><span class="quick__icon"><svg viewBox="0 0 24 24" aria-hidden="true">' +
          '<path d="M3 7h18v10H3zM3 11h18M7 15h4"/></svg></span>Utang</a>' +
      '</nav>' +
      (low.length ? (
        '<section class="section">' +
          '<div class="section__head"><h2>Paubos na</h2><a href="#stock">Buong stock</a></div>' +
          '<ul class="rows">' + low.map(function (p) {
            return '<li class="row state state--' + stockState(p) + '">' +
              '<span class="row__main"><span class="row__name">' + esc(p.name) + '</span>' +
              '<span class="row__meta">Min. ' + p.min + ' ' + p.unit + '</span></span>' +
              '<span class="row__amt"><span class="state__tag">' + p.qty + ' ' + p.unit + '</span></span></li>';
          }).join('') + '</ul>' +
        '</section>'
      ) : '') +
      '<section class="section">' +
        '<div class="section__head"><h2>Listahan ngayong araw</h2><a href="#ulat">Buong ulat</a></div>' +
        '<ul class="rows">' + feed.map(function (f) {
          var cls = f.kind === 'in' ? 'up' : (f.kind === 'utang' ? 'is-utang' : '');
          var sign = f.amount < 0 ? '−' : (f.kind === 'in' ? '+' : '');
          return '<li class="row"><span class="row__main">' +
            '<span class="row__name">' + esc(f.name) + '</span>' +
            '<span class="row__meta">' + esc(f.meta) + '</span></span>' +
            '<span class="row__amt amt ' + cls + '">' + sign + peso(Math.abs(f.amount)) + '</span></li>';
        }).join('') + '</ul>' +
      '</section>';
  }

  function screenBenta() {
    return '' +
      headerPlain('Bagong benta', 'Pindutin ang nabenta') +
      '<p class="hint pad">Pindutin ang paninda. Bawas agad sa stock kapag tapos.</p>' +
      '<div class="grid" id="product-grid">' +
        PRODUCTS.map(function (p) {
          var st = stockState(p);
          return '<button class="tile' + (p.qty === 0 ? ' tile--empty' : '') + '" type="button" ' +
            'data-act="add" data-id="' + p.id + '"' + (p.qty === 0 ? ' disabled' : '') + '>' +
            '<span class="tile__name">' + esc(p.name) + '</span>' +
            '<span class="tile__price amt">' + peso(p.price) + '</span>' +
            '<span class="tile__stock' + (st !== 'ok' ? ' tile__stock--' + st : '') + '">' +
              p.qty + ' ' + p.unit + '</span>' +
          '</button>';
        }).join('') +
      '</div>';
  }

  function screenStock() {
    var sorted = PRODUCTS.slice().sort(function (a, b) {
      var order = { out: 0, low: 1, ok: 2 };
      return order[stockState(a)] - order[stockState(b)];
    });
    return '' +
      headerPlain('Stock', PRODUCTS.length + ' paninda') +
      '<p class="hint pad">Bawas agad kapag may benta. I-adjust kung may bagong delivery.</p>' +
      '<ul class="rows">' + sorted.map(function (p) {
        var st = stockState(p);
        return '<li class="row state' + (st !== 'ok' ? ' state--' + st : '') + '">' +
          '<span class="row__main"><span class="row__name">' + esc(p.name) + '</span>' +
          '<span class="row__meta">' + peso(p.price) + ' · min. ' + p.min + ' ' + p.unit +
            (st === 'out' ? ' · kritikal' : (st === 'low' ? ' · paubos' : '')) + '</span></span>' +
          '<span class="stepper">' +
            '<button class="stepper__btn" type="button" data-act="dec" data-id="' + p.id + '" aria-label="Bawasan ang ' + esc(p.name) + '">−</button>' +
            '<output class="stepper__n amt">' + p.qty + '</output>' +
            '<button class="stepper__btn" type="button" data-act="inc" data-id="' + p.id + '" aria-label="Dagdagan ang ' + esc(p.name) + '">+</button>' +
          '</span></li>';
      }).join('') + '</ul>';
  }

  function screenUtang() {
    var total = UTANG.reduce(function (a, u) { return a + u.balance; }, 0);
    return '' +
      headerPlain('Utang', 'Listahan ng suki') +
      '<section class="lead">' +
        '<p class="lead__label">Kabuuang nakalista</p>' +
        '<p class="lead__value amt is-utang">' + peso(total) + '</p>' +
        '<p class="lead__delta muted">' + UTANG.length + ' suki</p>' +
      '</section>' +
      '<ul class="rows">' + UTANG.map(function (u) {
        return '<li class="row"><span class="row__main">' +
          '<span class="row__name">' + esc(u.who) + '</span>' +
          '<span class="row__meta">Mula ' + esc(u.since) + ' · ' + esc(u.items) + '</span></span>' +
          '<span class="row__trail">' +
            '<span class="row__amt amt is-utang">' + peso(u.balance) + '</span>' +
            '<button class="btn btn--mini" type="button" data-act="bayad" data-id="' + u.id + '">Bayad</button>' +
          '</span></li>';
      }).join('') + '</ul>' +
      '<p class="hint pad">Walang interes, walang parusa — talaan lang kung sino ang may utang.</p>';
  }

  function screenUlat() {
    var t = totals();
    var top = PRODUCTS.slice().sort(function (a, b) { return (b.min - b.qty) - (a.min - a.qty); }).slice(0, 4);
    var max = Math.max.apply(null, WEEKLY);

    return '' +
      headerPlain('Ulat', 'Benta, tubo at buwis') +
      '<div class="segmented" role="group" aria-label="Panahon">' +
        '<button class="segmented__opt is-on" type="button">Linggo</button>' +
        '<button class="segmented__opt" type="button">Buwan</button>' +
        '<button class="segmented__opt" type="button">Kwarter</button>' +
      '</div>' +
      '<section class="lead">' +
        '<p class="lead__label">Benta ngayong linggo</p>' +
        '<p class="lead__value amt">' + peso(WEEKLY.reduce(function (a, b) { return a + b; }, 0)) + '</p>' +
        '<p class="lead__delta muted">Tubo pagkatapos ng puhunan: <b class="up">' +
          peso(t.tubo * 6) + '</b> (tantiya)</p>' +
      '</section>' +
      '<div class="bars" aria-hidden="true">' +
        WEEKLY.map(function (v, i) {
          var h = Math.round((v / max) * 100);
          return '<div class="bars__col">' +
            '<div class="bars__track">' +
              '<div class="bars__bar' + (i === WEEKLY.length - 1 ? ' bars__bar--now' : '') + '" style="height:' + h + '%"></div>' +
            '</div>' +
            '<span class="bars__label">' + DAYS[i] + '</span></div>';
        }).join('') +
      '</div>' +
      '<section class="section">' +
        '<div class="section__head"><h2>Mabilis maubos</h2></div>' +
        '<ul class="rows">' + top.map(function (p) {
          return '<li class="row"><span class="row__main">' +
            '<span class="row__name">' + esc(p.name) + '</span>' +
            '<span class="row__meta">' + p.qty + ' ' + p.unit + ' natitira · min. ' + p.min + '</span></span>' +
            '<span class="row__amt amt">' + peso(p.price - p.cost) + '<span class="row__unit"> / ' + p.unit + '</span></span></li>';
        }).join('') + '</ul>' +
      '</section>' +
      '<section class="section">' +
        '<div class="section__head"><h2>Para sa BIR at lender</h2></div>' +
        '<div class="pad" style="display:grid;gap:var(--sp-2)">' +
          '<button class="btn btn--block" type="button" data-act="export">I-export ang buod (CSV)</button>' +
          '<button class="btn btn--block" type="button" data-act="export">1701Q draft — Q4 2025</button>' +
          '<p class="hint">Buod lang ang ginagawa nito. Ang pag-file ay nasa iyo pa rin.</p>' +
        '</div>' +
      '</section>';
  }

  // -------------------------------------------------------------- router

  var SCREENS = {
    kita:  { title: 'Aling Nena’s Tindahan', sub: 'Trancoville · Huwebes, 30 Okt', render: screenKita },
    benta: { title: 'Bagong benta', sub: 'Pindutin ang nabenta', render: screenBenta },
    stock: { title: 'Stock', sub: PRODUCTS.length + ' paninda', render: screenStock },
    utang: { title: 'Utang', sub: 'Listahan ng suki', render: screenUtang },
    ulat:  { title: 'Ulat', sub: 'Benta, tubo at buwis', render: screenUlat }
  };

  function current() {
    var key = (location.hash || '#kita').slice(1);
    return SCREENS[key] ? key : 'kita';
  }

  function render() {
    var key = current();
    var screen = SCREENS[key];

    document.title = (key === 'kita' ? 'KitaKlaro' : screen.title + ' — KitaKlaro');
    $('#view').innerHTML = screen.render();   // each screen draws its own header

    var tabs = document.querySelectorAll('.tab');
    for (var i = 0; i < tabs.length; i++) {
      var on = tabs[i].getAttribute('data-tab') === key;
      if (on) tabs[i].setAttribute('aria-current', 'page');
      else tabs[i].removeAttribute('aria-current');
    }

    $('#cart').hidden = !(key === 'benta' && cart.length);
    document.body.classList.toggle('has-cart', key === 'benta' && cart.length > 0);
    window.scrollTo(0, 0);
  }

  // ---------------------------------------------------------------- cart

  function cartTotal() {
    return cart.reduce(function (sum, line) {
      var p = product(line.id);
      return sum + (p ? p.price * line.qty : 0);
    }, 0);
  }

  function paintCart() {
    var count = cart.reduce(function (a, l) { return a + l.qty; }, 0);
    $('#cart-count').textContent = count + (count === 1 ? ' item' : ' items');
    $('#cart-total').textContent = peso(cartTotal());
    $('#cart-lines').innerHTML = cart.map(function (l) {
      var p = product(l.id);
      return '<li><span>' + l.qty + '× ' + esc(p.name) + '</span>' +
        '<span class="amt">' + peso(p.price * l.qty) + '</span></li>';
    }).join('');
    $('#cart').hidden = cart.length === 0;
    document.body.classList.toggle('has-cart', cart.length > 0);
  }

  function addToCart(id) {
    var p = product(id);
    if (!p || p.qty === 0) return;
    var line = null;
    for (var i = 0; i < cart.length; i++) if (cart[i].id === id) line = cart[i];
    if (line) {
      if (line.qty >= p.qty) { toast('Wala nang stock na ' + p.name); return; }
      line.qty++;
    } else {
      cart.push({ id: id, qty: 1 });
    }
    paintCart();
  }

  function closeSale(paid) {
    if (!cart.length) return;
    var items = cart.map(function (l) { return [l.id, l.qty]; });
    cart.forEach(function (l) {
      var p = product(l.id);
      p.qty = Math.max(0, p.qty - l.qty);          // the auto-deduct the kwaderno cannot do
    });
    var now = new Date();
    var stamp = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
    var sale = { id: 's' + Date.now(), time: stamp, via: 'tap', items: items, paid: paid };
    if (!paid) { sale.who = 'Bagong suki'; UTANG.unshift({
      id: 'u' + Date.now(), who: 'Bagong suki', since: 'Ngayon',
      balance: cartTotal(), items: items.length + ' klase ng paninda'
    }); }
    SALES.unshift(sale);
    toast(paid ? 'Naitala: ' + peso(cartTotal()) : 'Nailista sa utang');
    cart = [];
    paintCart();
    render();
  }

  // -------------------------------------------------------------- events

  document.addEventListener('click', function (ev) {
    var el = ev.target.closest('[data-act]');
    if (!el) return;
    var act = el.getAttribute('data-act');
    var id = el.getAttribute('data-id');

    if (act === 'add') { addToCart(id); return; }

    if (act === 'inc' || act === 'dec') {
      var p = product(id);
      p.qty = Math.max(0, p.qty + (act === 'inc' ? 1 : -1));
      render();
      return;
    }

    if (act === 'bayad') {
      for (var i = 0; i < UTANG.length; i++) {
        if (UTANG[i].id === id) { toast(UTANG[i].who + ' — bayad na'); UTANG.splice(i, 1); break; }
      }
      render();
      return;
    }

    if (act === 'voice') { toast('Demo lang ang boses sa ngayon — gamitin muna ang Benta'); return; }
    if (act === 'export') { toast('Demo lang ang export sa ngayon'); return; }
  });

  $('#cart-paid').addEventListener('click', function () { closeSale(true); });
  $('#cart-utang').addEventListener('click', function () { closeSale(false); });
  $('#cart-clear').addEventListener('click', function () { cart = []; paintCart(); });
  $('#cart-summary').addEventListener('click', function () {
    var lines = $('#cart-lines');
    lines.hidden = !lines.hidden;
    this.setAttribute('aria-expanded', String(!lines.hidden));
  });

  // The chip is drawn inside each screen's header, so a connection change
  // just repaints the current screen.
  window.addEventListener('online', render);
  window.addEventListener('offline', render);
  window.addEventListener('hashchange', render);

  render();

  // Registered after first paint so it never competes with the screen.
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function () {
        /* file:// or an unsupported browser — the app still works, just online */
      });
    });
  }
})();
