# KitaKlaro
The official repository for Team parZval in the PinaSiklab Hackathon (Track 3: MSMEs).

KitaKlaro is a voice- and typing-friendly "store notebook" PWA for sari-sari stores and Public Market stalls in Baguio City. It answers three questions:

1. **Sino may utang?** A private utang ledger. Utang and bayad are separate records; balance = utang − bayad. "Ipakita kay suki" shows a big, clean balance screen.
2. **Kumita ba ako?** Today's benta minus gastos, as one big number.
3. **Ano ubos na?** Products where stock ≤ low_at, or expiring within 7 days. A red count on the Imbentaryo link and a list in the sidebar show them on every page.

Stack: HTML + CSS + vanilla JS (PWA) + plain PHP 8 + MySQL. No frameworks, no npm, no build step.

## Setup

### 1. Requirements
- **WampServer** (PHP 8+, MySQL), running (green icon)
- **MySQL Workbench**

### 2. Create `.env`
Copy `.env.example` to `.env` in the project root (same folder as this README). Defaults:

```ini
DB_HOST="127.0.0.1"
DB_NAME="kitaklaro"
DB_USER="root"
DB_PASS=""
```

`.env` is outside `public/` so the virtual host never serves it, and it is in `.gitignore`. On the fallback URL (step 5), the root `.htaccess` blocks `.env`, `src/`, `database/` and `notes/`.

### 3. Create the database
In MySQL Workbench, open and run (⚡) `database/schema.sql`, then `database/seed.sql`.
Already had the database before products got prices and expiry? Run `database/migrate-001-product-prices.sql` once instead of re-running `schema.sql`.
`seed.sql` empties the tables first, so you can re-run it any time to reset the demo data.

### 4. Virtual host
1. Open http://localhost (the WAMP home page).
2. Under **Tools**, click **Add a Virtual Host**.
3. Name: `kitaklaro.localhost`
   Path: `C:/wamp64/www/hackathon-pinasiklab-parZval/public`
4. Click the WAMP tray icon → **Tools** → **Restart DNS**.
5. Open http://kitaklaro.localhost/

### 5. Fallback URL (no virtual host)
http://localhost/hackathon-pinasiklab-parZval/public/

All paths in the frontend are relative (`./`), so both URLs work.

### 6. Why `.localhost`?
Chrome only allows the **microphone** and the **service worker** on a "secure context": HTTPS, or `localhost` / `*.localhost`. A name like `kitaklaro.test` would block both.

### 7. Quick check
http://kitaklaro.localhost/api/utang.php should return JSON (a list of suki with balances).
If you see `{"error":"Server error"}`, check `.env` and that the SQL scripts ran.

## How it works

- Type or say things like `utang si Mang Tonyo 50 sardinas`, `nagbayad si Ate Joy 200`, `nabenta 3 kape 45`, `bumili ng mantika 120`.
- Every entry shows a **confirmation card** first ("Tama ✓" / "Ayusin"). Yellow fields are the ones the parser is unsure about.
- Money is stored as **integer centavos** (₱85.50 → 8550). Names are stored trimmed and lowercase.
- **Demo mode:** when the page is not on localhost (e.g. GitHub Pages), data is saved in the browser's localStorage and a "Demo mode" badge appears. On localhost it never falls back: if WAMP or MySQL is down you see an error, so you know the entry was NOT saved.
- **Inventory:** tap a product to edit its name, stock, low-stock warning (`low_at`), puhunan, price and expiry, or to delete it (asks first). Renaming does not rename old benta/gastos rows.
- **Parser tests:** `node public/js/parser.js`, or open the Home page and run `runParserTests()` in the browser console.
- **Service worker:** network first, so online you always get the newest files; offline the cached copy opens. Bump `CACHE` in `public/sw.js` only when you add or remove a file in its `FILES` list.
- **GitHub Pages:** copy everything in `public/` into `docs/`, then in the repo Settings → Pages pick the branch and the `/docs` folder.

## API

| Endpoint | Method | What it does |
|---|---|---|
| `api/utang.php` | GET | everyone with balance > 0, biggest first |
| `api/utang.php?name=...` | GET | `{name, balance, history[]}` |
| `api/utang.php` | POST | `{name, amount, type:'utang'\|'bayad', item}` |
| `api/entries.php` | POST | `{type:'benta'\|'gastos', item, qty, amount, add_product?}` (benta lowers, gastos raises the matching product's stock; an unknown item is only added to the inventory when `add_product` is `true`) |
| `api/entries.php?today=1` | GET | `{benta, gastos, kumita}` in centavos |
| `api/entries.php?from=YYYY-MM-DD&to=YYYY-MM-DD` | GET | entry rows with from ≤ created_at < to (used by the Ulat page) |
| `api/products.php` | GET | all products `{id, name, stock, low_at, cost, price, expires_on}` (cost/price in centavos or null) |
| `api/products.php` | POST | `{id?, name, stock, low_at, cost, price, expires_on}`: with `id` edits that product (rename included, 409 if the name is taken); without `id` saves by name (adds it if new); `low_at` left out keeps the current value (new product: 3); cost/price in pesos, expires_on `YYYY-MM-DD`, blank = `null`. Price below cost and past expiry dates are accepted; the Inventory form asks the owner to confirm them |
| `api/products.php?id=...` | DELETE | removes the product (old entries stay) |

`amount` is sent in pesos (0 < amount ≤ 100,000); every response amount is in centavos.

## Team ownership

| Person | Owns |
|---|---|
| A | `src/`, `public/api/`, `database/` |
| B | HTML, `public/js/`, `manifest.json`, `sw.js` |
| C | `css/`, `labels.js`, `seed.sql`, `notes/` |


## Desktop UI + receipt showcase (October 31 integration)

- **Source of truth:** `public/` remains the existing PHP/MySQL + vanilla JavaScript app.
  This integration deliberately keeps the backend, parser, voice, stock, utang, and report APIs intact.
- **Desktop:** `public/css/desktop.css` applies the KitaKlaro cream/green/red design,
  240px sidebar (desktop viewport), and large cards/typography. It also responds to narrow screens.
- **Font:** Bricolage Grotesque and DM Sans are requested from Google Fonts, with system-font
  fallbacks when offline. No commercial font files are bundled.
- **New pages:** `/receipt.html` (camera + hardcoded pitch receipt) and `/kumpirmahin.html`
  (visual-only confirmation-queue example). The main Dashboard, Inventory, Utang, Ulat,
  and real entry confirmation flows still operate on the existing functions.
- **Receipt demo, IMPORTANT:** camera/photo capture and browser image contrast adjustment are real.
  The text shown after the scan **does NOT use OCR and is NOT extracted from the photo**.
  It always displays the fixed example from the supplied receipt, whatever photo was taken.
  A demo label appears on-screen. `Kunan ang Larawan` shows an animated loading state.
  If camera permissions fail, choose a local image file or `Gamitin ang sample receipt`.
  `I-save Bilang Gastos` writes one expense of ₱924.25 with the existing `addEntry()` API.
  Avoid tapping this twice across repeat demo scans if you do not want duplicate expenses.
- **Kumpirmahin:** sample design-only cards; approving them does not write to the database.
  The actual entry confirmation still happens on the Dashboard.
- **Ulat:** eBIR tax draft area is labeled future-feature wireframe, not a filing/calculator.
- **GitHub Pages:** the updated `docs/` mirrors the `public/` frontend for demo mode.
  The actual PHP backend lives in `public/api/`, never GitHub Pages.
- **Offline:** new UI, logo and sample receipt are cached by the updated service worker.
  Fonts can fall back to system fonts offline. Browser speech recognition often needs the internet.
  Camera access needs localhost or HTTPS plus permission.

### Apply to your existing Git clone

1. Check out your team's `dev` branch and pull the latest changes first.
2. Overlay the ZIP contents **without deleting other team files**. This copy does not include `.git`.
3. Review changes: `git status`, then `git diff`.
4. Test `/public/index.html` through WAMP or use the GitHub Pages demo `/docs/`.
5. `git add public docs README.md`, `git commit -m "feat: KitaKlaro desktop UI and receipt pitch demo"`, `git push origin dev`.

The change ZIP is additionally provided so you can merge only the edited files if needed.


## Desktop UI + receipt showcase (October 31 integration)

- **Source of truth:** `public/` remains the existing PHP/MySQL + vanilla JavaScript app.
  This integration deliberately keeps the backend, parser, voice, stock, utang, and report APIs intact.
- **Desktop:** `public/css/desktop.css` applies the KitaKlaro cream/green/red design,
  240px sidebar (desktop viewport), and large cards/typography. It also responds to narrow screens.
- **Font:** Bricolage Grotesque and DM Sans are requested from Google Fonts, with system-font
  fallbacks when offline. No commercial font files are bundled.
- **New pages:** `/receipt.html` (camera + hardcoded pitch receipt) and `/kumpirmahin.html`
  (visual-only confirmation-queue example). The main Dashboard, Inventory, Utang, Ulat,
  and real entry confirmation flows still operate on the existing functions.
- **Receipt demo, IMPORTANT:** camera/photo capture and browser image contrast adjustment are real.
  The text shown after the scan **does NOT use OCR and is NOT extracted from the photo**.
  It always displays the fixed example from the supplied receipt, whatever photo was taken.
  A demo label appears on-screen. `Kunan ang Larawan` shows an animated loading state.
  If camera permissions fail, choose a local image file or `Gamitin ang sample receipt`.
  `I-save Bilang Gastos` writes one expense of ₱924.25 with the existing `addEntry()` API.
  Avoid tapping this twice across repeat demo scans if you do not want duplicate expenses.
- **Kumpirmahin:** sample design-only cards; approving them does not write to the database.
  The actual entry confirmation still happens on the Dashboard.
- **Ulat:** eBIR tax draft area is labeled future-feature wireframe, not a filing/calculator.
- **GitHub Pages:** the updated `docs/` mirrors the `public/` frontend for demo mode.
  The actual PHP backend lives in `public/api/`, never GitHub Pages.
- **Offline:** new UI, logo and sample receipt are cached by the updated service worker.
  Fonts can fall back to system fonts offline. Browser speech recognition often needs the internet.
  Camera access needs localhost or HTTPS plus permission.

### Apply to your existing Git clone

1. Check out your team's `dev` branch and pull the latest changes first.
2. Overlay the ZIP contents **without deleting other team files**. This copy does not include `.git`.
3. Review changes: `git status`, then `git diff`.
4. Test `/public/index.html` through WAMP or use the GitHub Pages demo `/docs/`.
5. `git add public docs README.md`, `git commit -m "feat: KitaKlaro desktop UI and receipt pitch demo"`, `git push origin dev`.

The change ZIP is additionally provided so you can merge only the edited files if needed.
