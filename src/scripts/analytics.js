// Only categorical UI context is sent. Never read calculator input values.
const started = new WeakSet();
const calculator = location.pathname.split('/').filter(Boolean).pop() || 'home';
const debug = new URLSearchParams(location.search).get('analytics_debug') === '1';
function track(name, extra = {}) {
  if (location.hostname !== 'freemarketingcalculator.com' || typeof window.gtag !== 'function') return;
  window.gtag('event', name, { calculator, ...extra, ...(debug ? { debug_mode: true } : {}) });
}
function start(card) {
  if (!card || started.has(card)) return;
  started.add(card);
  track('calculator_start');
}
for (const event of ['input', 'change']) {
  document.addEventListener(event, e => start(e.target.closest?.('.calc-card, .live-calc-card')), true);
}
document.addEventListener('click', e => {
  const button = e.target.closest?.('button.btn-calc');
  const card = button?.closest('.calc-card');
  if (card) {
    start(card);
    // A browser may flush microtasks between capture and target listeners.
    // Use the next task so the calculator's click handler has rendered first.
    setTimeout(() => {
      if (card.querySelector('[data-calc-error]')?.textContent.trim()) {
        track('calculator_validation_error');
      } else if (card.querySelector('.result-panel.visible')) {
        track('calculator_complete');
      }
    }, 0);
  }
  const link = e.target.closest?.('main a[href]');
  if (link) {
    const destination = new URL(link.getAttribute('href'), location.href);
    if (destination.origin === location.origin && /^\/[a-z-]+-calculator\/$/.test(destination.pathname)) {
      track('related_calculator_click', { destination: destination.pathname });
    }
    if (link.hasAttribute('download')) track('resource_download', { resource: destination.pathname });
  }
}, true);
// These events are emitted only after a successful action, from calc-utils.
document.addEventListener('calculator-share', () => track('calculator_share'));
document.addEventListener('calculator-print', () => track('calculator_print'));
