// HACKATHON PITCH SHOWCASE — camera/photo is real; OCR output is deliberately hardcoded.
// Do not present the transcription as live OCR. No OCR network dependency is used.
(function () {
  const $ = id => document.getElementById(id);
  const video = $('receipt-video');
  const state = $('camera-state');
  const msg = $('receipt-message');
  const streamBtn = $('open-camera');
  const shutter = $('take-photo');
  const closeBtn = $('close-camera');
  const overlay = $('scanning-overlay');
  const results = $('receipt-results');
  const sampleTotal = $('receipt-guide-total');
  const file = $('receipt-file');
  let stream = null;
  let busy = false;

  // No sample receipt output is visible until a real capture or uploaded photo
  // has gone through the loading step. Previous results clear on a new attempt.
  function hidePreviousResult() {
    results.hidden = true;
    sampleTotal.hidden = true;
    $('receipt-image-original').removeAttribute('src');
    $('receipt-image-enhanced').removeAttribute('src');
    $('receipt-save-message').textContent = '';
  }
  hidePreviousResult();

  function stopCamera() {
    if (stream) stream.getTracks().forEach(t => t.stop());
    stream = null;
    video.srcObject = null;
    video.hidden = true;
    $('camera-guides').hidden = true;
    shutter.hidden = true;
    closeBtn.hidden = true;
    streamBtn.hidden = false;
    $('scan-placeholder').hidden = false;
    if (!busy) state.textContent = t('receipt_ready');
  }

  streamBtn.addEventListener('click', async () => {
    if (busy) return;
    hidePreviousResult();
    msg.textContent = '';
    if (!navigator.mediaDevices?.getUserMedia) {
      msg.textContent = t('receipt_camera_missing');
      return;
    }
    streamBtn.disabled = true;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 960 } } });
      video.srcObject = stream;
      video.hidden = false;
      $('scan-placeholder').hidden = true;
      $('camera-guides').hidden = false;
      await video.play();
      streamBtn.hidden = true;
      shutter.hidden = false;
      closeBtn.hidden = false;
      state.textContent = t('receipt_camera_open');
    } catch (err) {
      stopCamera();
      msg.textContent = t('receipt_camera_failed') + ' (' + (err.name || 'permission error') + ')';
    } finally { streamBtn.disabled = false; }
  });

  closeBtn.addEventListener('click', stopCamera);
  window.addEventListener('pagehide', stopCamera);

  function renderEnhanced(source) {
    const width = Math.min(1300, source.naturalWidth || source.videoWidth || source.width || 850);
    const nativeW = source.naturalWidth || source.videoWidth || source.width || width;
    const nativeH = source.naturalHeight || source.videoHeight || source.height || 1100;
    if (!nativeW || !nativeH) throw new Error(t('receipt_no_image'));
    const height = Math.max(1, Math.round(nativeH * width / nativeW));
    const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
    const ctx = canvas.getContext('2d', { willReadFrequently: false });
    if (!ctx) throw new Error(t('receipt_canvas_failed'));
    ctx.drawImage(source, 0, 0, width, height);
    $('receipt-image-original').src = canvas.toDataURL('image/jpeg', 0.9);
    // Actual image enhancement is performed on the current camera shot / uploaded image.
    ctx.filter = 'grayscale(1) contrast(1.9) brightness(1.18)';
    ctx.drawImage(source, 0, 0, width, height);
    ctx.filter = 'none';
    $('receipt-image-enhanced').src = canvas.toDataURL('image/jpeg', 0.91);
  }

  async function finishDemo(source) {
    if (busy) return;
    busy = true;
    hidePreviousResult();
    msg.textContent = '';
    overlay.hidden = false;
    state.textContent = t('receipt_loading');
    try {
      renderEnhanced(source);
      await new Promise(resolve => setTimeout(resolve, 1500));
      // Deliberate fixed transcription: not derived from source.
      results.hidden = false;
      sampleTotal.hidden = false;
      state.textContent = t('receipt_result_ready');
      $('receipt-save').disabled = false;
      $('receipt-save').textContent = t('receipt_save');
      $('receipt-save-message').textContent = '';
      results.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (err) {
      msg.textContent = err.message || t('receipt_process_failed');
      state.textContent = t('error');
    } finally { overlay.hidden = true; busy = false; }
  }

  shutter.addEventListener('click', async () => {
    if (!stream || !video.videoWidth) { msg.textContent = t('receipt_camera_wait'); return; }
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth; canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    stopCamera();
    await finishDemo(canvas);
  });

  async function imageFromUrl(url) {
    const image = new Image();
    image.decoding = 'async';
    image.src = url;
    await image.decode();
    return image;
  }
  file.addEventListener('change', async () => {
    const chosen = file.files?.[0];
    if (!chosen) return;
    if (!chosen.type.startsWith('image/')) { msg.textContent = t('receipt_invalid_file'); return; }
    stopCamera();
    const url = URL.createObjectURL(chosen);
    try { await finishDemo(await imageFromUrl(url)); }
    catch (err) { msg.textContent = t('receipt_file_failed') + ' ' + err.message; }
    finally { URL.revokeObjectURL(url); file.value = ''; }
  });
  $('receipt-retake').addEventListener('click', () => {
    hidePreviousResult(); state.textContent = t('receipt_ready');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  $('receipt-copy').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText($('receipt-transcription').textContent);
      $('receipt-save-message').textContent = t('receipt_copy_success');
    } catch (e) { $('receipt-save-message').textContent = t('receipt_copy_failed'); }
  });
  $('receipt-save').addEventListener('click', async () => {
    const button = $('receipt-save');
    button.disabled = true;
    $('receipt-save-message').textContent = t('receipt_saving');
    try {
      // One expense, not nine inventory changes. All non-scanner APIs are unchanged.
      const response = await addEntry({ type: 'gastos', item: 'grocery receipt', qty: 1, amount: 924.25 });
      button.textContent = t('receipt_saved_button');
      $('receipt-save-message').textContent = t('receipt_saved');
    } catch (err) {
      button.disabled = false;
      $('receipt-save-message').textContent = t('receipt_save_failed') + ' ' + (err.message || t('error'));
    }
  });
})();
