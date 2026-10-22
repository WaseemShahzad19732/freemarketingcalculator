// Finite-lifetime planning model. Frequency and lifetime must use the same period.
export class CLVError extends Error {
  constructor(message, field) { super(message); this.name = 'CLVError'; this.field = field; }
}

function read(value, label, field, positive = false) {
  if ((typeof value !== 'string' && typeof value !== 'number') || String(value).trim() === '') {
    throw new CLVError(`${label}: enter a number.`, field);
  }
  const number = Number(value);
  if (!Number.isFinite(number) || Math.abs(number) > Number.MAX_SAFE_INTEGER || (number !== 0 && Math.abs(number) < 1e-12)) {
    throw new CLVError(`${label}: enter a finite number within the supported range.`, field);
  }
  if (number < 0 || (positive && number === 0)) {
    throw new CLVError(`${label}: enter ${positive ? 'a value greater than zero' : 'zero or a positive value'}.`, field);
  }
  return number;
}

function checked(value) {
  if (!Number.isFinite(value) || Math.abs(value) > Number.MAX_SAFE_INTEGER || (value !== 0 && Math.abs(value) < 1e-12)) {
    throw new CLVError('This result is outside the supported range. Use less extreme amounts or durations.', 'value');
  }
  return value;
}

export function calculateCLV(mode, values) {
  if (!['revenue', 'contribution'].includes(mode)) throw new CLVError('Choose a calculation mode.', 'mode');
  if (!['year', 'month'].includes(values.period)) throw new CLVError('Choose months or years.', 'period');
  const orderValue = read(values.value, 'Average order value', 'value');
  const frequency = read(values.frequency, 'Purchase frequency', 'frequency');
  const lifetime = read(values.lifetime, 'Customer lifetime', 'lifetime', true);
  const expectedOrders = checked(frequency * lifetime);
  const revenuePerPeriod = checked(orderValue * frequency);
  const revenue = checked(revenuePerPeriod * lifetime);
  const result = { orderValue, frequency, lifetime, period: values.period, expectedOrders, revenuePerPeriod, revenue, contribution: null, margin: null, cac: null, ratio: null, afterCAC: null };
  if (mode === 'contribution') {
    const margin = read(values.margin, 'Contribution margin (%)', 'margin');
    if (margin > 100) throw new CLVError('Contribution margin (%): enter a value from 0 to 100.', 'margin');
    result.margin = margin;
    result.contribution = checked(revenue * (margin / 100));
    if (values.cac !== undefined && values.cac !== null && !(typeof values.cac === 'string' && values.cac.trim() === '')) {
      result.cac = read(values.cac, 'Customer acquisition cost', 'cac');
      result.afterCAC = checked(result.contribution - result.cac);
      result.ratio = result.cac === 0 ? null : checked(result.contribution / result.cac);
    }
  }
  return result;
}
