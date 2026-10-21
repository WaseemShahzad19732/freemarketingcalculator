// Pure arithmetic shared by the new tools. Empty values never become zero.
export class CalculationError extends Error {
  constructor(message, field) {
    super(message);
    this.name = 'CalculationError';
    this.field = field;
  }
}

function read(value, label, field, { positive = false, integer = false } = {}) {
  if ((typeof value !== 'string' && typeof value !== 'number') || String(value).trim() === '') {
    throw new CalculationError(`${label}: enter a number.`, field);
  }
  const number = Number(value);
  if (!Number.isFinite(number) || Math.abs(number) > Number.MAX_SAFE_INTEGER) {
    throw new CalculationError(`${label}: enter a finite number no larger than ${Number.MAX_SAFE_INTEGER}.`, field);
  }
  if (number < 0 || (positive && number === 0)) {
    throw new CalculationError(`${label}: enter ${positive ? 'a value greater than zero' : 'zero or a positive value'}.`, field);
  }
  if (number !== 0 && number < 1e-12) {
    throw new CalculationError(`${label}: use a value of at least 0.000000000001.`, field);
  }
  if (integer && !Number.isSafeInteger(number)) {
    throw new CalculationError(`${label}: enter a whole number.`, field);
  }
  return number;
}

function checked(value) {
  if (!Number.isFinite(value) || Math.abs(value) > Number.MAX_SAFE_INTEGER || (value !== 0 && Math.abs(value) < 1e-12)) {
    throw new CalculationError('This result is outside the supported range. Use less extreme amounts or rates.');
  }
  return value;
}

function whole(value, round) {
  // Don't lose/gain an outcome because 0.3 / 0.1 is 2.9999999999999996.
  // Cap the tolerance so large amounts cannot erase meaningful fractions.
  const nearest = Math.round(value);
  const tolerance = Number.EPSILON * 4 * Math.min(Math.abs(value), 1e6);
  return round(Math.abs(value - nearest) <= tolerance ? nearest : value);
}

export function calculateCTR(mode, a, b) {
  if (mode === 'rate') {
    const clicks = read(a, 'Clicks', 'a', { integer: true });
    const impressions = read(b, 'Impressions', 'b', { positive: true, integer: true });
    return { value: checked(clicks / impressions * 100), raw: checked(clicks / impressions * 100), a: clicks, b: impressions };
  }
  if (mode === 'clicks') {
    const impressions = read(a, 'Impressions', 'a', { positive: true, integer: true });
    const rate = read(b, 'CTR (%)', 'b');
    const raw = checked(impressions * (rate / 100));
    return { value: raw, raw, a: impressions, b: rate };
  }
  if (mode === 'impressions') {
    const clicks = read(a, 'Target clicks', 'a', { positive: true, integer: true });
    const rate = read(b, 'CTR (%)', 'b', { positive: true });
    const raw = checked(clicks / (rate / 100));
    return { value: checked(whole(raw, Math.ceil)), raw, a: clicks, b: rate };
  }
  throw new CalculationError('Choose a calculation mode.');
}

export function calculateUnitCost(mode, a, b) {
  if (mode === 'cost') {
    const spend = read(a, 'Campaign cost ($)', 'a');
    // Attributed conversions can be fractional. Leads are validated separately
    // by the CPL form; don't silently round attribution-model conversions.
    const count = read(b, 'Recorded outcomes', 'b', { positive: true });
    const raw = checked(spend / count);
    return { value: raw, raw, a: spend, b: count };
  }
  if (mode === 'budget') {
    const rate = read(a, 'Target cost per outcome ($)', 'a');
    const count = read(b, 'Target outcomes', 'b', { integer: true });
    const raw = checked(rate * count);
    return { value: raw, raw, a: rate, b: count };
  }
  if (mode === 'count') {
    const budget = read(a, 'Budget ($)', 'a');
    const rate = read(b, 'Assumed cost per outcome ($)', 'b', { positive: true });
    const raw = checked(budget / rate);
    return { value: whole(raw, Math.floor), raw, a: budget, b: rate };
  }
  throw new CalculationError('Choose a calculation mode.');
}

export function calculateCPL(mode, a, b) {
  if (mode === 'cost') read(b, 'Recorded leads', 'b', { positive: true, integer: true });
  return calculateUnitCost(mode, a, b);
}

export function calculateBreakEven(mode, values) {
  let margin, revenue = null, costs = null;
  if (mode === 'margin') {
    margin = read(values.margin, 'Contribution margin (%)', 'margin');
    if (margin > 100) throw new CalculationError('Contribution margin cannot exceed 100% when non-ad costs are non-negative.', 'margin');
    margin /= 100;
  } else if (mode === 'costs') {
    revenue = read(values.revenue, 'Net revenue per order ($)', 'revenue', { positive: true });
    costs = ['goods', 'shipping', 'fees', 'other'].reduce((total, field) => total + read(values[field], `${({ goods: 'Product cost', shipping: 'Shipping subsidy', fees: 'Payment and marketplace fees', other: 'Other non-ad variable costs' })[field]} ($)`, field), 0);
    checked(costs);
    margin = (revenue - costs) / revenue;
  } else throw new CalculationError('Choose a calculation mode.');
  if (margin <= 0) throw new CalculationError('There is no finite break-even ROAS at zero or negative contribution margin. Net revenue must exceed the included non-ad costs.', mode === 'margin' ? 'margin' : 'revenue');
  const roas = checked(1 / margin);
  return { roas, percent: checked(roas * 100), marginPercent: checked(margin * 100), revenue, costs, adAllowance: revenue === null ? null : checked(revenue - costs) };
}
