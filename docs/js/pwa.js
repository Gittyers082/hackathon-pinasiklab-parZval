/* PWA installation */
(() => {
  let promptEvent = null;
  let registrationError = '';
  let panel;
  let dialog;
  const installed = () => window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  const english = localStorage.getItem('kk-lang') === 'en';
  const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    promptEvent = event;
  });
  window.addEventListener('appinstalled', () => {
    promptEvent = null;
    if (panel) panel.hidden = true;
    if (dialog && dialog.open) dialog.close();
  });
  window.matchMedia('(display-mode: standalone)').addEventListener('change', () => {
    if (panel) panel.hidden = installed();
  });
  document.addEventListener('DOMContentLoaded', () => {
    if ('serviceWorker' in navigator && window.isSecureContext) {
      navigator.serviceWorker.register('./sw.js', { updateViaCache: 'none' }).catch(error => {
        registrationError = english ? 'App files could not be prepared. Reload while connected.' : 'Hindi maihanda ang app. I-reload habang may koneksyon.';
        console.error('KitaKlaro service worker registration failed:', error);
      });
    }
    const main = document.querySelector('main');
    if (!main) return;
    panel = document.createElement('section');
    panel.className = 'pwa-panel';
    panel.hidden = installed();
    panel.innerHTML = `<div><strong>${english ? 'KitaKlaro on your phone' : 'KitaKlaro sa iyong phone'}</strong><p>${english ? 'Add KitaKlaro to your home screen.' : 'Ilagay ang KitaKlaro sa iyong home screen.'}</p></div><button type="button" class="pwa-install">Install KitaKlaro</button>`;
    main.prepend(panel);
    dialog = document.createElement('dialog');
    dialog.className = 'pwa-dialog';
    dialog.setAttribute('aria-labelledby', 'pwa-dialog-title');
    dialog.innerHTML = '<h2 id="pwa-dialog-title">Install KitaKlaro</h2><p class="pwa-help"></p><form method="dialog"><button class="pwa-install">OK</button></form>';
    document.body.append(dialog);
    panel.querySelector('button').addEventListener('click', async () => {
      if (promptEvent) {
        const event = promptEvent;
        promptEvent = null;
        try {
          await event.prompt();
          const result = await event.userChoice;
          if (result.outcome === 'accepted') panel.hidden = true;
          return;
        } catch (error) { console.error('KitaKlaro install prompt failed:', error); }
      }
      let help;
      if (!window.isSecureContext) {
        help = english ? 'Open the HTTPS link from your laptop, then install. An HTTP IP address cannot install this app.' : 'Buksan ang HTTPS link mula sa laptop bago mag-install. Hindi puwede ang HTTP IP address.';
      } else if (ios) {
        help = english ? 'Open this link in Safari. Tap Share, then Add to Home Screen. Enable Open as Web App if shown, then tap Add.' : 'Buksan ang link sa Safari. Pindutin ang Share, tapos Add to Home Screen. I-on ang Open as Web App kung mayroon, tapos Add.';
      } else {
        help = english ? 'In Chrome or Edge, open the browser menu and choose Install app or Add to Home screen. If unavailable, reload this page and try again. If already installed, open KitaKlaro from your home screen.' : 'Sa Chrome o Edge, buksan ang menu at piliin ang Install app o Add to Home screen. Kung wala, i-reload at subukan muli. Kung naka-install na, buksan ang KitaKlaro sa home screen.';
      }
      dialog.querySelector('.pwa-help').textContent = registrationError || help;
      dialog.showModal();
    });
    const offline = document.createElement('p');
    offline.className = 'pwa-offline';
    offline.setAttribute('role', 'status');
    offline.textContent = english ? 'Offline. Connect to load records or save changes.' : 'Offline. Kumonekta para makita ang mga tala o mag-save.';
    main.prepend(offline);
    const updateConnection = () => { offline.hidden = navigator.onLine; };
    window.addEventListener('online', updateConnection);
    window.addEventListener('offline', updateConnection);
    updateConnection();
  });
})();
