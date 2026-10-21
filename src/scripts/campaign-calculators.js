import { calculateCTR, calculateUnitCost, calculateCPL, calculateBreakEven } from './campaign-math.js';

const number = value => value !== 0 && Math.abs(value) < 1e-6 ? value.toExponential(4) : value.toLocaleString('en-US', { maximumFractionDigits: 6 });
const money = value => value < 0.01 && value > 0 ? '$' + number(value) : value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
const percent = value => number(value) + '%';

for (const form of document.querySelectorAll('form[data-campaign-tool]')) {
  const kind = form.dataset.campaignTool;
  const select = form.querySelector('[data-mode]');
  const panel = form.querySelector('.result-panel');
  const error = form.querySelector('[data-calc-error]');
  const groups = [...form.querySelectorAll('[data-input-group]')];
  const active = () => groups.find(group => group.dataset.inputGroup === select.value);
  const set = (selector, text) => { form.querySelector(selector).textContent = text; };
  const clear = () => {
    panel.classList.remove('visible');
    error.textContent = '';
    form.querySelectorAll('[aria-invalid]').forEach(input => input.removeAttribute('aria-invalid'));
  };
  const changeMode = () => {
    groups.forEach(group => {
      group.hidden = group.dataset.inputGroup !== select.value;
      group.querySelectorAll('input').forEach(input => { input.disabled = group.hidden; });
    });
    clear();
  };
  select.addEventListener('change', changeMode);
  form.addEventListener('input', clear);
  form.addEventListener('reset', () => { setTimeout(changeMode, 0); });
  changeMode();

  form.addEventListener('submit', event => {
    event.preventDefault();
    clear();
    const mode = select.value;
    const group = active();
    try {
      if (kind === 'breakEven') {
        const inputs = Object.fromEntries([...group.querySelectorAll('input')].map(input => [input.dataset.input, input.value]));
        const result = calculateBreakEven(mode, inputs);
        set('[data-result-value]', number(result.roas) + '×');
        set('[data-result-formula]', `1 ÷ (${number(result.marginPercent)} ÷ 100) = ${number(result.roas)}× (${percent(result.percent)}).`);
        set('[data-result-details]', `Contribution margin before ads: ${percent(result.marginPercent)}.` + (result.adAllowance === null ? '' : ` Amount available for ads per order: ${money(result.adAllowance)}.`));
        set('[data-result-note]', 'This covers advertising and only the non-ad costs included in your margin. Uncounted fixed costs, changes in order value and attribution differences can change business profit. Displayed ratios are rounded.');
      } else {
        const a = group.querySelector('[data-input="a"]').value;
        const b = group.querySelector('[data-input="b"]').value;
        const result = kind === 'ctr' ? calculateCTR(mode, a, b) : kind === 'cpl' ? calculateCPL(mode, a, b) : calculateUnitCost(mode, a, b);
        const label = kind === 'cpl' ? 'CPL' : 'CPA';
        const unit = kind === 'cpl' ? 'leads' : 'conversions';
        if (kind === 'ctr') {
          if (mode === 'rate') {
            set('[data-result-label]', 'Click-through rate (CTR)');
            set('[data-result-value]', percent(result.value));
            set('[data-result-formula]', `${number(result.a)} clicks ÷ ${number(result.b)} impressions × 100 = ${percent(result.value)}.`);
            set('[data-result-note]', 'CTR measures clicks per impression. It does not measure conversions or profit. Compare matching campaigns, dates and click definitions.');
          } else if (mode === 'clicks') {
            set('[data-result-label]', 'Expected clicks');
            set('[data-result-value]', number(result.value));
            set('[data-result-formula]', `${number(result.a)} impressions × (${number(result.b)} ÷ 100) = ${number(result.value)} expected clicks.`);
            set('[data-result-note]', 'This is an expected count at a constant assumed CTR, so a fractional result is possible. Actual clicks vary.');
          } else {
            set('[data-result-label]', 'Estimated impressions');
            set('[data-result-value]', number(result.value));
            set('[data-result-formula]', `${number(result.a)} target clicks ÷ (${number(result.b)} ÷ 100) = ${number(result.raw)} modeled impressions.`);
            set('[data-result-note]', 'Rounded up to a whole impression for planning. This assumes the CTR remains constant and does not guarantee the click target.');
          }
        } else if (mode === 'cost') {
          set('[data-result-label]', `Cost per ${kind === 'cpl' ? 'lead (CPL)' : 'action / acquisition (CPA)'}`);
          set('[data-result-value]', money(result.value));
          set('[data-result-formula]', `${money(result.a)} ÷ ${number(result.b)} ${unit} = ${money(result.value)} per ${kind === 'cpl' ? 'lead' : 'conversion'}.`);
          set('[data-result-note]', kind === 'cpl' ? 'This prices the leads you counted. Lead quality, close rate and customer value are separate; it is not customer acquisition cost.' : 'This prices the conversion action you counted. It equals CAC only if the outcome is a new customer and the cost scope matches.');
        } else if (mode === 'budget') {
          set('[data-result-label]', 'Modeled budget required');
          set('[data-result-value]', money(result.value));
          set('[data-result-formula]', `${money(result.a)} target ${label} × ${number(result.b)} target ${unit} = ${money(result.value)}.`);
          set('[data-result-note]', 'Assumes a constant average cost and the same cost scope. This is a planning calculation, not an ad-platform bid recommendation or a guaranteed result.');
        } else {
          set('[data-result-label]', `Modeled ${unit} (whole)`);
          set('[data-result-value]', number(result.value));
          set('[data-result-formula]', `${money(result.a)} budget ÷ ${money(result.b)} assumed ${label} = ${number(result.raw)} modeled ${unit}.`);
          set('[data-result-note]', 'Rounded down to stay within the budget at the stated constant cost. Real campaign costs and outcomes vary.');
        }
      }
      panel.classList.add('visible');
    } catch (problem) {
      error.textContent = problem.message;
      const input = group.querySelector(`[data-input="${problem.field || 'a'}"]`) || group.querySelector('input');
      input?.setAttribute('aria-invalid', 'true');
      input?.focus();
    }
  });
}
