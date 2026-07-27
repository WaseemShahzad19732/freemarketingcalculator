/**
 * calc-utils.js — Reusable client calculation utilities & visual UI helpers
 */

/** Format currency USD */
export function formatUSD(n) {
  if (isNaN(n) || n === null) return '$0';
  return (n < 0 ? '-$' : '$') + Math.abs(Math.round(n)).toLocaleString();
}

/** Format percentage */
export function formatPercent(n, decimals = 1) {
  if (isNaN(n) || n === null) return '0%';
  return n.toFixed(decimals) + '%';
}

/** Toast notification alert */
export function showToast(message, duration = 3000) {
  let toastEl = document.getElementById('toast-root');
  if (!toastEl) {
    toastEl = document.createElement('div');
    toastEl.id = 'toast-root';
    toastEl.className = 'toast-notification';
    document.body.appendChild(toastEl);
  }
  toastEl.textContent = message;
  toastEl.classList.add('is-visible');
  setTimeout(() => {
    toastEl.classList.remove('is-visible');
  }, duration);
}

/** Synchronize range slider with numeric input */
export function setupSliderSync(inputId, sliderId, onUpdate) {
  const inputEl  = document.getElementById(inputId);
  const sliderEl = document.getElementById(sliderId);
  if (!inputEl || !sliderEl) return;

  function handleInput(val) {
    sliderEl.value = val;
    if (onUpdate) onUpdate(val);
  }

  function handleSlider(val) {
    inputEl.value = val;
    if (onUpdate) onUpdate(val);
  }

  inputEl.addEventListener('input', (e) => handleInput(e.target.value));
  sliderEl.addEventListener('input', (e) => handleSlider(e.target.value));
}

/** Animate numeric text content smoothly */
export function animateCounter(el, endVal, duration = 400, prefix = '', suffix = '') {
  if (!el) return;
  const startVal = parseFloat(el.textContent.replace(/[^0-9.-]+/g, '')) || 0;
  const startTime = performance.now();

  function update(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
    const easeProgress = 1 - Math.pow(1 - progress, 3);
    const currentVal = startVal + (endVal - startVal) * easeProgress;
    el.textContent = `${prefix}${currentVal.toFixed(1)}${suffix}`;

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

/** Copy current URL with updated query params to clipboard & show toast */
export function copyShareableURL(paramsObj) {
  const url = new URL(window.location.href);
  Object.keys(paramsObj).forEach(key => {
    if (paramsObj[key] !== undefined && paramsObj[key] !== '') {
      url.searchParams.set(key, paramsObj[key]);
    }
  });
  window.history.replaceState({}, '', url.toString());

  navigator.clipboard.writeText(url.toString()).then(() => {
    showToast('🔗 Calculation link copied to clipboard!');
  }).catch(() => {
    showToast('🔗 Link updated in browser address bar!');
  });
}

/** Parse query params on load and set input values */
export function parseURLParams(inputMap) {
  const urlParams = new URLSearchParams(window.location.search);
  let loaded = false;
  Object.keys(inputMap).forEach(paramName => {
    const val = urlParams.get(paramName);
    if (val !== null && inputMap[paramName]) {
      inputMap[paramName].value = val;
      const slider = document.getElementById(`${inputMap[paramName].id}-slider`);
      if (slider) slider.value = val;
      loaded = true;
    }
  });
  return loaded;
}

/** Print calculator report page */
export function printReport() {
  window.print();
}
