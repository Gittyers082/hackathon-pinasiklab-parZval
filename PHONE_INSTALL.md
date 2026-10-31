# Install KitaKlaro on your phone

1. Extract this folder. Keep your existing database and .env settings.
2. Start WAMP and wait for its green icon.
3. Double-click START_PHONE_SERVER.bat. Leave the window open.
4. On your laptop, open http://127.0.0.1:8080. Confirm your records load.
5. Install Cloudflare Tunnel once. In PowerShell run:

   winget install --id Cloudflare.cloudflared --exact

   Close and reopen the terminal after installation. If winget is unavailable,
   download cloudflared for Windows from https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/downloads/
   and save it beside these launchers as cloudflared.exe.

6. Double-click START_PHONE_LINK.bat. Copy the HTTPS address ending in trycloudflare.com.
7. Open that exact address on your phone with internet access.
8. Android: use Chrome and tap Install KitaKlaro, then confirm Install.
   If the browser prompt is unavailable, use Chrome's menu > Add to home screen > Install.
9. iPhone: open in Safari > Share > Add to Home Screen > Add.
   Leave Open as Web App enabled if it appears.
10. Launch KitaKlaro from its home screen icon. It opens in its own app window.

Keep WAMP, both launcher windows, the laptop, and internet access running for records and saving.
The app pages can open offline after the first successful visit. Reading current MySQL records
and saving changes still require the laptop connection; offline changes are not queued.

The temporary HTTPS address can change when the tunnel restarts. Keep it running for your
presentation. If the address changes, install from the new address again.
Anyone with the link can access this app and its records; this project has no account login.
Close the link window when finished.

## If installation is unavailable

- Open the HTTPS link in Chrome or Safari itself, rather than a Messenger/Facebook browser.
- Open /icons/icon-192.png and /icons/icon-512.png at that same address. Both must show images.
- On the laptop, inspect Application > Manifest and Service Workers at http://127.0.0.1:8080.
  A worker should become activated after loading. Reload once if needed.
- For this check, turn off DevTools' Offline and Bypass for network options.
- Screenshot warnings in Manifest affect the richer preview only.
- If the page reports a database error, check .env and WAMP; installation does not create MySQL.
- This launcher serves public/ directly and avoids Apache virtual-host and inherited access rules.
  Use the public app for MySQL. The docs/ folder is the separate static GitHub Pages copy.

Reference: https://developers.cloudflare.com/tunnel/get-started/quick-tunnels/
