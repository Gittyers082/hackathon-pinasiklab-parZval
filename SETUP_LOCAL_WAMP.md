# KitaKlaro — local WAMP database setup

If Home or the receipt Save button says **Could not connect to database**, that means the MySQL API returned an error. It does **not** mean the amount is ₱0.00 or that the receipt was saved.

The source ZIP does not contain `.env` because it is ignored by Git. Do this on your own PC inside `C:\wamp64\www\hackathon-pinasiklab-parZval`:

1. Copy `.env.example` to a new file named **`.env`** (make sure Windows hasn't named it `.env.txt`). Use the provided defaults if your WAMP MySQL user is `root` with a blank password. If your WAMP login uses different credentials, update `.env` accordingly.
2. Start WAMP and verify MySQL is running.
3. In phpMyAdmin, import `database/schema.sql`. **Do not import `seed.sql` if you already have records**: it TRUNCATEs the `utang`, `entries`, and `products` tables. Only import `seed.sql` if you knowingly want demo data and can afford to erase existing rows.
4. Open `http://kitaklaro.localhost/api/entries.php?today=1`. You should receive JSON like `{"benta":0,"gastos":0,"kumita":0}` (values depend on your actual records). If you see `{"error":"Server error"}`, check the Apache/PHP error log to identify the cause. Common causes include missing `.env`, invalid DB credentials, wrong `DB_NAME`, or missing tables.
5. Reload `http://kitaklaro.localhost/` and make a small test entry, then check **Mga Tala / Records** and **Home**. Never treat an API error as a successful save.

This file is safe to commit: no real DB secrets are included. Keep `.env` out of Git.

**Receipt demo:** results and the sample total are hidden until the camera shutter or image upload completes and the progress screen finishes. The transcription is still intentionally predetermined for the pitch, not live OCR. The enhanced preview is generated from the *actual* captured/uploaded picture, so aim your camera at the provided receipt rather than a person or other object.
