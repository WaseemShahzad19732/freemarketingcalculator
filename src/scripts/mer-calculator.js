import { calculateMER } from './mer-math.js';

const number = value => value !== 0 && Math.abs(value) < 1e-6 ? value.toExponential(4) : value.toLocaleString('en-US', { maximumFractionDigits: 6 });
const money = value => value > 0 && value < 0.01 ? '$' + number(value) : value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

for (const form of document.querySelectorAll('form[data-mer-calculator]')) {
  const panel = form.querySelector('.result-panel');
  const error = form.querySelector('[data-calc-error]');
  const scope = form.querySelector('#mer-scope');
  const period = form.querySelector('#mer-period');
  const set = (selector, value) => { form.querySelector(selector).textContent = value; };
  const clear = () => {
    panel.classList.remove('visible');
    error.textContent = '';
    form.querySelectorAll('[aria-invalid]').forEach(field => field.removeAttribute('aria-invalid'));
  };
  form.addEventListener('input', clear);
  form.addEventListener('change', clear);
  form.addEventListener('reset', clear);
  form.addEventListener('submit', event => {
    event.preventDefault();
    clear();
    try {
      const result = calculateMER(form.querySelector('#mer-revenue').value, form.querySelector('#mer-spend').value, scope.value);
      const marketing = result.scope === 'marketing';
      const scopeName = marketing ? 'total marketing cost' : 'advertising-only spend';
      set('[data-mer-label]', marketing ? 'MER · revenue / total marketing cost' : 'Blended ROAS · revenue / advertising spend');
      set('[data-mer-value]', number(result.ratio) + '×');
      set('[data-mer-formula]', `${money(result.revenue)} total business revenue ÷ ${money(result.spend)} ${scopeName} = ${number(result.ratio)}×.`);
      set('[data-mer-share]', result.spendShare === null ? 'Spend share of revenue: undefined because revenue is zero.' : `Inverse spend share: ${number(result.spendShare)}% of revenue.`);
      set('[data-mer-scope]', `Period: ${period.options[period.selectedIndex].text}. Both amounts must cover the same dates, business and currency. Cost scope: ${scopeName}.`);
      set('[data-mer-note]', marketing ? 'This is a blended revenue-to-cost ratio, not profit or proof of incremental marketing revenue. Compare only with the same convention and cost scope.' : 'This uses all business revenue, not ad-attributed revenue. It is different from platform ROAS and from revenue divided by total marketing cost.');
      panel.classList.add('visible');
    } catch (problem) {
      error.textContent = problem.message;
      const field = form.querySelector(`#mer-${problem.field || 'revenue'}`);
      field?.setAttribute('aria-invalid', 'true');
      field?.focus();
    }
  });
}
