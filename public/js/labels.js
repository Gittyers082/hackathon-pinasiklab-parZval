// UI text in Tagalog (default) and English. The choice is saved in localStorage.
// In HTML: <span data-label="key"></span>, or data-label-ph="key" for input placeholders.

const LABELS = {
  tl: {
    kumita_title: "Kumita ba ako?",
    today: "Ngayong araw",
    benta: "Benta",
    gastos: "Gastos",
    mic: "Pindutin at magsalita",
    listening: "Nakikinig…",
    type_ph: "Hal: utang si Mang Tonyo 50 sardinas",
    add: "Ilagay",
    confirm_title: "Tama ba ito?",
    tama: "Tama",
    ayusin: "Ayusin",
    f_kind: "Uri",
    f_name: "Pangalan",
    f_item: "Item",
    f_qty: "Ilan",
    f_amount: "Halaga (₱)",
    k_utang: "Utang",
    k_bayad: "Bayad",
    k_benta: "Benta",
    k_gastos: "Gastos",
    saved: "Na-save!",
    not_understood: "Hindi ko naintindihan. Ayusin ang mga dilaw.",
    nav_home: "Home",
    nav_utang: "Utang",
    nav_ubos: "Imbentaryo",
    utang_title: "Sino may utang?",
    show_suki: "Ipakita kay suki",
    close: "Isara",
    balance: "Utang",
    no_utang: "Walang may utang.",
    history: "Listahan",
    ubos_title: "Imbentaryo",
    stock: "Natitira",
    save: "I-save",
    no_ubos: "Wala pang produkto.",
    demo: "Demo mode",
    error: "May mali. Subukan ulit.",
    cost: "Puhunan",
    price: "Presyo",
    expires: "Expiry",
    add_product: "+ Dagdag produkto",
    expired: "Expired na",
    expires_today: "Mag-e-expire ngayon",
    days_left: "{n} araw na lang",
    expiry_title: "Malapit nang mag-expire",
    see_inventory: "Tingnan sa Imbentaryo",
    from_price: "presyo sa Imbentaryo",
    from_cost: "puhunan sa Imbentaryo",
    nav_ulat: "Ulat",
    ulat_title: "Ulat ng benta",
    p_week: "7 araw",
    p_month: "Buwan",
    p_year: "Taon",
    kumita_period: "Kumita",
    profit_est: "Tubo sa paninda (tantiya)",
    profit_note:
      "Benta bawas puhunan, para lang sa mga produktong may puhunan.",
    chart_title: "Benta at gastos",
    chart_keys: "Gamitin ang ← → para makita ang bawat araw.",
    show_table: "Ipakita bilang talaan",
    top_benta: "Pinakamabenta",
    top_gastos: "Pinakamalaking gastos",
    no_data: "Wala pang tala sa panahong ito.",
    date: "Petsa",
    pcs: "pcs",
    vs_week: "kumpara sa naunang 7 araw",
    vs_month: "kumpara sa parehong araw noong nakaraang buwan",
    vs_year: "kumpara sa parehong panahon noong nakaraang taon",
    not_in_inventory: "Wala sa Imbentaryo, kaya hindi magbabago ang stock.",
    add_to_inv: "Idagdag sa Imbentaryo bilang bagong produkto",
    not_enough_stock: "kulang ang stock",
    warn_below_cost:
      "Mas mababa ang presyo kaysa puhunan (lugi ng {loss} bawat isa).",
    warn_expired: "Lumipas na ang expiry date.",
    save_anyway: "I-save pa rin",
    alerts_title: "Babala sa Imbentaryo",
    low_title: "Malapit nang maubos",
    left_n: "{n} na lang",
    low_at: "Babala kapag ≤",
    delete: "Burahin",
    deleted: "Nabura.",
    confirm_delete:
      'Burahin ang "{name}" sa Imbentaryo? Hindi na ito maibabalik.',
  },
  en: {
    kumita_title: "Did I make money?",
    today: "Today",
    benta: "Sales",
    gastos: "Expenses",
    mic: "Tap and speak",
    listening: "Listening…",
    type_ph: "E.g. utang si Mang Tonyo 50 sardinas",
    add: "Add",
    confirm_title: "Is this right?",
    tama: "Correct",
    ayusin: "Fix",
    f_kind: "Type",
    f_name: "Name",
    f_item: "Item",
    f_qty: "Qty",
    f_amount: "Amount (₱)",
    k_utang: "Credit",
    k_bayad: "Payment",
    k_benta: "Sale",
    k_gastos: "Expense",
    saved: "Saved!",
    not_understood: "I didn't get that. Fix the yellow fields.",
    nav_home: "Home",
    nav_utang: "Credit",
    nav_ubos: "Inventory",
    utang_title: "Who owes me?",
    show_suki: "Show to customer",
    close: "Close",
    balance: "Owes",
    no_utang: "Nobody owes you.",
    history: "History",
    ubos_title: "Inventory",
    stock: "Left",
    save: "Save",
    no_ubos: "No products yet.",
    demo: "Demo mode",
    error: "Something went wrong. Try again.",
    cost: "Cost",
    price: "Selling price",
    expires: "Expiry date",
    add_product: "+ Add product",
    expired: "Expired",
    expires_today: "Expires today",
    days_left: "{n} days left",
    expiry_title: "Expiring soon",
    see_inventory: "See inventory",
    from_price: "selling price from Inventory",
    from_cost: "cost from Inventory",
    nav_ulat: "Reports",
    ulat_title: "Sales report",
    p_week: "7 days",
    p_month: "Month",
    p_year: "Year",
    kumita_period: "Profit",
    profit_est: "Profit on goods (estimate)",
    profit_note: "Sales minus cost, only for products that have a cost set.",
    chart_title: "Sales and expenses",
    chart_keys: "Use ← → to step through each day.",
    show_table: "Show as table",
    top_benta: "Top sellers",
    top_gastos: "Biggest expenses",
    no_data: "No records for this period yet.",
    date: "Date",
    pcs: "pcs",
    vs_week: "vs the 7 days before",
    vs_month: "vs the same days last month",
    vs_year: "vs the same period last year",
    not_in_inventory: "Not in Inventory, so stock won't change.",
    add_to_inv: "Add to Inventory as a new product",
    not_enough_stock: "not enough stock",
    warn_below_cost: "Selling price is below cost (a loss of {loss} each).",
    warn_expired: "This expiry date has already passed.",
    save_anyway: "Save anyway",
    alerts_title: "Inventory alerts",
    low_title: "Running low",
    left_n: "{n} left",
    low_at: "Warn at or below",
    delete: "Delete",
    deleted: "Deleted.",
    confirm_delete: 'Delete "{name}" from Inventory? This cannot be undone.',
  },
};

let lang = localStorage.getItem("kk-lang") || "tl";
if (!LABELS[lang]) lang = "tl";

function t(key) {
  return LABELS[lang][key] || LABELS.tl[key] || key;
}

// 8550 -> "₱85.50"
function peso(centavos) {
  return (
    "₱" +
    (centavos / 100).toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

const EXPIRY_WARN_DAYS = 7; // Home warns about items expiring within this many days

// 'YYYY-MM-DD' -> days from today (negative = already expired).
function daysUntil(date) {
  const [y, m, d] = date.split("-").map(Number);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((new Date(y, m - 1, d) - today) / 86400000);
}

// "Expired na", "3 araw na lang", or the date itself when it's still far off.
function expiryText(date) {
  const days = daysUntil(date);
  if (days < 0) return t("expired");
  if (days === 0) return t("expires_today");
  return days <= EXPIRY_WARN_DAYS ? t("days_left").replace("{n}", days) : date;
}

function applyLabels() {
  document.documentElement.lang = lang === "en" ? "en" : "fil";
  document.querySelectorAll("[data-label]").forEach((el) => {
    el.textContent = t(el.dataset.label);
  });
  document.querySelectorAll("[data-label-ph]").forEach((el) => {
    el.placeholder = t(el.dataset.labelPh);
  });
  const picker = document.getElementById("lang");
  if (picker) {
    picker.value = lang;
    picker.onchange = () => {
      localStorage.setItem("kk-lang", picker.value);
      location.reload();
    };
  }
}

document.addEventListener("DOMContentLoaded", applyLabels);
