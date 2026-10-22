import { calculateEmailEngagement } from './email-engagement-math.js';

for (const form of document.querySelectorAll('form[data-email-engagement]')) {
  const panel = form.querySelector('.result-panel');
  const error = form.querySelector('[data-calc-error]');
  const put = (selector, value) => { form.querySelector(selector).textContent = value; };
  const clear = () => { panel.classList.remove('visible'); error.textContent = ''; form.querySelectorAll('[aria-invalid]').forEach(input => input.removeAttribute('aria-invalid')); };
  const number = value => value.toLocaleString('en-US');
  const percent = value => value === null ? 'Undefined' : (value > 0 && value < 0.0001 ? value.toExponential(3) : value.toLocaleString('en-US', { maximumFractionDigits: 4 })) + '%';
  form.addEventListener('input', clear);
  form.addEventListener('reset', clear);
  form.addEventListener('submit', event => {
    event.preventDefault(); clear();
    try {
      const result = calculateEmailEngagement(Object.fromEntries(['delivered', 'opens', 'clicks'].map(key => [key, form.querySelector(`[data-email-input="${key}"]`).value])));
      put('[data-email-ctor]', percent(result.ctor));
      put('[data-email-open]', percent(result.openRate));
      put('[data-email-ctr]', percent(result.ctr));
      put('[data-email-formula]', `${number(result.clicks)} unique click recipients ÷ ${number(result.opens)} tracked open recipients × 100` + (result.ctor === null ? ': undefined because there are no tracked opens.' : ` = ${percent(result.ctor)} CTOR.`));
      put('[data-email-note]', result.delivered === 0 ? 'There are no delivered emails. Open rate and email CTR also have zero denominators and are undefined, rather than 0%.' : result.trackingMismatch ? 'Clicks exceed tracked opens. The counts may use different tracking or filtering rules; CTOR is not a reliable comparison here. Do not replace missing opens with invented values.' : 'Use matching unique-recipient counts from one campaign, reporting period and bot-filtering setting. These rates describe recorded engagement, rather than sales or profit.');
      panel.classList.add('visible');
    } catch (problem) {
      error.textContent = problem.message;
      const input = form.querySelector(`[data-email-input="${problem.field || 'delivered'}"]`);
      input?.setAttribute('aria-invalid', 'true'); input?.focus();
    }
  });
}
