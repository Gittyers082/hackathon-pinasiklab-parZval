# Our First Hackathon!
The official repository for Team parZval in the PinaSiklab Hackathon.

## Typography — read before judging the look

The stylesheet asks for **ITC Serif Gothic** (display) and **Helvetica Neue** (body).
Neither is bundled, because neither can be:

- Both are licensed commercial faces (Monotype / Linotype). Self-hosting either
  needs a purchased webfont licence; they are not on Google Fonts.
- Helvetica Neue ships with macOS and iOS. It is **not** on Windows or Android.
- ITC Serif Gothic ships with nothing by default.

So the stacks fall back, and on **Android — the entire target audience — both fall
back**. Measured on a clean Windows machine: display renders as Georgia, body as Arial.

To actually ship these faces, one of:

1. Buy the webfont licence, drop the `.woff2` files in `fonts/`, and add the
   `@font-face` rules back to `css/app.css`.
2. Substitute free faces with a similar feel and self-host them (what the previous
   build did with a 26 KB Bricolage Grotesque subset).
3. Keep the stacks as they are and accept Georgia + Arial on Android.

Whichever is chosen, any self-hosted face must include **₱ (U+20B1)**, which lives in
the `latin-ext` subset. Shipping only `latin` leaves every peso sign rendering from a
different font.
