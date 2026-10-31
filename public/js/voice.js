// Small wrapper around the Web Speech API (Chrome/Edge on Android and desktop).
// Speech recognition in Chrome needs internet, so we also hide the mic when offline.

const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;

function voiceAvailable() {
  return Boolean(SpeechRec) && navigator.onLine;
}

// Hides `micButton` whenever voice can't be used. The text box always stays.
function setupMicVisibility(micButton) {
  const update = () => { micButton.hidden = !voiceAvailable(); };
  update();
  window.addEventListener('online', update);
  window.addEventListener('offline', update);
}

// Listens once. Calls onText(transcript) on success, onError(code) on failure
// (e.g. 'not-allowed' = mic blocked, 'network' = no internet), onEnd() when listening stops.
function listenOnce(onText, onEnd, onError) {
  const rec = new SpeechRec();
  rec.lang = (typeof lang !== 'undefined' && lang === 'en') ? 'en-PH' : 'fil-PH';
  rec.interimResults = false;
  rec.maxAlternatives = 1;
  rec.onresult = event => onText(event.results[0][0].transcript);
  rec.onerror = event => onError(event.error);
  rec.onend = onEnd;
  rec.start();
  return rec;
}
