export class EmailInputError extends Error {
  constructor(message, field) { super(message); this.field = field; }
}

function count(value, label, field) {
  if (!['string', 'number'].includes(typeof value) || String(value).trim() === '') throw new EmailInputError(`${label}: enter a whole number, including zero where appropriate.`, field);
  const number = Number(value);
  if (!Number.isSafeInteger(number) || number < 0) throw new EmailInputError(`${label}: enter a non-negative whole number within the supported range.`, field);
  return number;
}

export function calculateEmailEngagement(values) {
  const delivered = count(values.delivered, 'Delivered emails', 'delivered');
  const opens = count(values.opens, 'Unique recipients with tracked opens', 'opens');
  const clicks = count(values.clicks, 'Unique recipients who clicked', 'clicks');
  if (opens > delivered) throw new EmailInputError('Unique open recipients cannot exceed delivered emails. Check that you used unique recipients rather than total opens.', 'opens');
  if (clicks > delivered) throw new EmailInputError('Unique click recipients cannot exceed delivered emails. Check that you used unique recipients rather than total link clicks.', 'clicks');
  const rate = (numerator, denominator) => denominator === 0 ? null : numerator / denominator * 100;
  return { delivered, opens, clicks, openRate: rate(opens, delivered), ctr: rate(clicks, delivered), ctor: rate(clicks, opens), trackingMismatch: clicks > opens };
}
