// MER here uses revenue / spend. Some dashboards use its inverse; never infer the convention from the acronym.
export class MERInputError extends Error {
  constructor(message, field) {
    super(message);
    this.name = 'MERInputError';
    this.field = field;
  }
}

function read(value, label, field, positive = false) {
  if ((typeof value !== 'string' && typeof value !== 'number') || String(value).trim() === '') {
    throw new MERInputError(`${label}: enter a number.`, field);
  }
  const number = Number(value);
  if (!Number.isFinite(number) || Math.abs(number) > Number.MAX_SAFE_INTEGER) {
    throw new MERInputError(`${label}: enter a finite number no larger than ${Number.MAX_SAFE_INTEGER}.`, field);
  }
  if (number < 0 || (positive && number === 0)) {
    throw new MERInputError(`${label}: enter ${positive ? 'a value greater than zero' : 'zero or a positive value'}.`, field);
  }
  if (number !== 0 && number < 1e-12) {
    throw new MERInputError(`${label}: use a value of at least 0.000000000001.`, field);
  }
  return number;
}

function checked(value) {
  if (!Number.isFinite(value) || Math.abs(value) > Number.MAX_SAFE_INTEGER || (value !== 0 && Math.abs(value) < 1e-12)) {
    throw new MERInputError('This result is outside the supported range. Use less extreme revenue or spend.');
  }
  return value;
}

export function calculateMER(revenueInput, spendInput, scope = 'marketing') {
  if (!['marketing', 'advertising'].includes(scope)) {
    throw new MERInputError('Choose total marketing cost or advertising-only spend.', 'scope');
  }
  const revenue = read(revenueInput, 'Total business revenue', 'revenue');
  const spend = read(spendInput, 'Matching spend', 'spend', true);
  const ratio = checked(revenue / spend);
  // With zero revenue, a cost share of revenue is undefined rather than zero or infinity.
  const spendShare = revenue === 0 ? null : checked(spend / revenue * 100);
  return { revenue, spend, scope, ratio, spendShare };
}
