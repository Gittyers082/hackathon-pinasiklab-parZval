# KitaKlaro
The official repository for Team parZval in the PinaSiklab Hackathon (Track 3: MSMEs).

KitaKlaro is a voice- and typing-friendly "store notebook" PWA for sari-sari stores and Public Market stalls in Baguio City. It answers three questions:

1. **Sino may utang?** A private utang ledger. Utang and bayad are separate records; balance = utang − bayad. "Ipakita kay suki" shows a big, clean balance screen.
2. **Kumita ba ako?** Today's benta minus gastos, as one big number.
3. **Ano ubos na?** Products where stock ≤ low_at.

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

`.env` is outside `public/` so the browser can never download it, and it is in `.gitignore`.

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
- **Demo mode:** if the PHP API can't be reached, or the page is not on localhost (e.g. GitHub Pages), data is saved in the browser's localStorage and a "Demo mode" badge appears.
- **Parser tests:** `node public/js/parser.js`, or open the Home page and run `runParserTests()` in the browser console.
- **Service worker:** pages are cached for offline use. After changing HTML/CSS/JS, bump `CACHE` in `public/sw.js` (`kitaklaro-v2`, …) or tick "Update on reload" in DevTools → Application → Service Workers.

## API

| Endpoint | Method | What it does |
|---|---|---|
| `api/utang.php` | GET | everyone with balance > 0, biggest first |
| `api/utang.php?name=...` | GET | `{name, balance, history[]}` |
| `api/utang.php` | POST | `{name, amount, type:'utang'\|'bayad', item}` |
| `api/entries.php` | POST | `{type:'benta'\|'gastos', item, qty, amount}` (benta lowers, gastos raises the matching product's stock) |
| `api/entries.php?today=1` | GET | `{benta, gastos, kumita}` in centavos |
| `api/entries.php?from=YYYY-MM-DD&to=YYYY-MM-DD` | GET | entry rows with from ≤ created_at < to (used by the Ulat page) |
| `api/products.php` | GET | all products `{id, name, stock, low_at, cost, price, expires_on}` (cost/price in centavos or null) |
| `api/products.php?low=1` | GET | products where stock ≤ low_at |
| `api/products.php` | POST | `{name, stock, cost, price, expires_on}` saves a product (adds it if new); cost/price in pesos, expires_on `YYYY-MM-DD`, blank = `null` |

`amount` is sent in pesos (0 < amount ≤ 100,000); every response amount is in centavos.

## Team ownership

| Person | Owns |
|---|---|
| A | `src/`, `public/api/`, `database/` |
| B | HTML, `public/js/`, `manifest.json`, `sw.js` |
| C | `css/`, `labels.js`, `seed.sql`, `notes/` |
