import { calculateCLV } from './clv-math.js';

const number = value => value !== 0 && Math.abs(value) < 1e-6 ? value.toExponential(4) : value.toLocaleString('en-US', { maximumFractionDigits: 6 });
const money = value => Math.abs(value) < 0.01 && value !== 0 ? '$' + number(value) : value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

for (const form of document.querySelectorAll('form[data-clv-tool]')) {
  const input = field => form.querySelector(`[data-clv-input="${field}"]`);
  const panel = form.querySelector('.result-panel');
  const error = form.querySelector('[data-calc-error]');
  const fields = form.querySelector('[data-contribution-fields]');
  const set = (selector, text) => { form.querySelector(selector).textContent = text; };
  const clear = () => {
    panel.classList.remove('visible');
    error.textContent = '';
    form.querySelectorAll('[aria-invalid]').forEach(element => element.removeAttribute('aria-invalid'));
  };
  const sync = () => {
    fields.hidden = input('mode').value !== 'contribution';
    fields.querySelectorAll('input').forEach(element => { element.disabled = fields.hidden; });
    const unit = input('period').value === 'month' ? 'month' : 'year';
    set('[data-frequency-label]', `Average purchases per customer per ${unit}`);
    set('[data-lifetime-label]', `Expected active customer lifetime (${unit}s)`);
    clear();
  };
  form.addEventListener('input', clear);
  form.addEventListener('change', sync);
  form.addEventListener('reset', () => { setTimeout(sync, 0); });
  sync();
  form.addEventListener('submit', event => {
    event.preventDefault(); clear();
    try {
      const values = Object.fromEntries([...form.querySelectorAll('[data-clv-input]')].map(element => [element.dataset.clvInput, element.value]));
      const result = calculateCLV(values.mode, values);
      const contribution = values.mode === 'contribution';
      set('[data-clv-label]', contribution ? 'Contribution CLV before acquisition' : 'Revenue CLV');
      set('[data-clv-value]', money(contribution ? result.contribution : result.revenue));
      set('[data-clv-formula]', `${money(result.orderValue)} per order × ${number(result.frequency)} orders per ${result.period} × ${number(result.lifetime)} ${result.period}s = ${money(result.revenue)} revenue CLV.`);
      set('[data-clv-details]', contribution ? `${money(result.revenue)} revenue × (${number(result.margin)} ÷ 100) = ${money(result.contribution)} contribution before acquisition. Expected lifetime orders: ${number(result.expectedOrders)}.` : `Expected lifetime orders: ${number(result.expectedOrders)}. Revenue has not had variable costs or acquisition costs deducted.`);
      set('[data-clv-cac-result]', result.cac === null ? '' : `At ${money(result.cac)} CAC: contribution CLV:CAC ${result.ratio === null ? 'is undefined because CAC is zero' : '= ' + number(result.ratio) + ':1'}. Contribution less CAC = ${money(result.afterCAC)} before uncounted costs.`);
      panel.classList.add('visible');
    } catch (problem) {
      error.textContent = problem.message;
      const element = input(problem.field || 'value') || input('value');
      element.setAttribute('aria-invalid', 'true'); element.focus();
    }
  });
}
