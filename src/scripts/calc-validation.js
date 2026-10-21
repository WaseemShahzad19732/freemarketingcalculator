// Validate the active calculator mode before any arithmetic. Optional fields
// stay optional; zero is never treated as a missing value or a default.
const positive = new Set([
  'marketing-cost', 'ad-spend', 'cac-customers', 'cvr-visitors', 'rev-cvr',
  'cpm-imps', 'sp-imps', 'im-cpm', 'cpc-clicks', 'cpc-rate-c',
  'cpv-views', 'cpv-rate-c', 'em-cost', 'ma-platform',
  'ib-deal', 'ib-close', 'ib-mql-sql', 'ib-lead-mql', 'ib-visit-lead',
]);
const optional = new Set(['cac-arpu', 'cac-margin']);

export function validateCalculator(button) {
  const card = button.closest('.calc-card');
  if (!card) return true;
  const result = card.querySelector('.result-panel');
  let error = card.querySelector('[data-calc-error]');
  if (!error) {
    error = document.createElement('p');
    error.dataset.calcError = '';
    error.id = button.id + '-error';
    error.className = 'hint';
    error.setAttribute('role', 'alert');
    button.before(error);
    // Once inputs change, the previous answer no longer describes them.
    const clear = () => {
      result?.classList.remove('visible');
      error.textContent = '';
      card.querySelectorAll('[aria-invalid]').forEach(el => el.removeAttribute('aria-invalid'));
    };
    card.addEventListener('input', clear, true);
    card.addEventListener('change', clear, true);
    card.querySelectorAll('.mode-toggle button').forEach(el => el.addEventListener('click', clear, true));
  }
  const selects = [...card.querySelectorAll('select')]
    .filter(el => el.id !== 'channel-preset' && el.getClientRects().length > 0);
  const fields = [...card.querySelectorAll('input[type="number"]')]
    .filter(el => el.getClientRects().length > 0);
  const isMetrics = button.id === 'dm-calc-btn';
  let message = '';
  fields.forEach(field => {
    const blank = field.value.trim() === '';
    const value = Number(field.value);
    let reason = '';
    if (blank && (optional.has(field.id) || isMetrics) && !field.validity.badInput) {
      field.removeAttribute('aria-invalid');
      return;
    }
    const label = field.labels?.[0]?.textContent?.trim() || 'This field';
    if (blank || !Number.isFinite(value)) reason = 'enter a number';
    else if (Math.abs(value) > Number.MAX_SAFE_INTEGER) reason = 'enter a smaller number';
    else if (value !== 0 && Math.abs(value) < 1e-12) reason = 'enter zero or a value of at least 0.000000000001';
    else if (positive.has(field.id) && value <= 0) reason = 'enter a value greater than zero; this value is a divisor';
    else if (field.min !== '' && value < Number(field.min)) reason = 'enter at least ' + field.min;
    else if (field.max !== '' && value > Number(field.max)) reason = 'enter no more than ' + field.max;
    if (reason) {
      field.setAttribute('aria-invalid', 'true');
      if (!message) message = label + ': ' + reason + '.';
    } else field.removeAttribute('aria-invalid');
  });
  selects.forEach(field => {
    if (field.value === '') {
      field.setAttribute('aria-invalid', 'true');
      if (!message) message = (field.labels?.[0]?.textContent?.trim() || 'This field') + ': choose an option.';
    } else field.removeAttribute('aria-invalid');
  });
  if (isMetrics && fields.every(el => el.value.trim() === '')) message = 'Enter at least one campaign value to calculate the available metrics.';
  error.textContent = message;
  if (message) result?.classList.remove('visible');
  return !message;
}
