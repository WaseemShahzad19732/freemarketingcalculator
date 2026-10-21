import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateCTR, calculateUnitCost, calculateCPL, calculateBreakEven } from '../src/scripts/campaign-math.js';

test('the published campaign gives 0.9% CTR and $55.56 CPA before display rounding', () => {
  assert.ok(Math.abs(calculateCTR('rate', 4500, 500000).value - 0.9) < 1e-12);
  assert.equal(calculateUnitCost('cost', 5000, 90).value, 500 / 9);
});
test('CTR reverse modes recover the original campaign and retain expected fractional clicks', () => {
  assert.equal(calculateCTR('clicks', 10000, 2.5).value, 250);
  assert.equal(calculateCTR('impressions', 200, 2.5).value, 8000);
  assert.equal(calculateCTR('clicks', 1000, 1.25).value, 12.5);
  assert.equal(calculateCTR('impressions', 100, 3).value, 3334);
  assert.equal(calculateCTR('impressions', 7, 0.7).value, 1000);
});
test('zero clicks is valid, zero impressions and inverse zero rates are undefined', () => {
  assert.equal(calculateCTR('rate', 0, 1000).value, 0);
  assert.equal(calculateCTR('clicks', 1000, 0).value, 0);
  assert.throws(() => calculateCTR('rate', 0, 0));
  assert.throws(() => calculateCTR('impressions', 100, 0));
  assert.equal(calculateCTR('rate', 3, 2).value, 150);
});
test('cost, budget and outcome modes agree at a constant unit cost', () => {
  assert.equal(calculateCPL('cost', 3600, 120).value, 30);
  assert.equal(calculateCPL('budget', 30, 200).value, 6000);
  assert.equal(calculateCPL('count', 6000, 30).value, 200);
  assert.equal(calculateCPL('count', 5000, 30).value, 166);
  assert.equal(calculateUnitCost('budget', 40, 200).value, 8000);
  assert.equal(calculateUnitCost('count', 0.3, 0.1).value, 3);
  assert.equal(calculateUnitCost('count', 0.299, 0.1).value, 2);
});
test('observed CPA preserves attribution fractions; recorded CPL requires whole leads', () => {
  assert.equal(calculateUnitCost('cost', 450, 1.5).value, 300);
  assert.throws(() => calculateCPL('cost', 450, 1.5));
  assert.throws(() => calculateUnitCost('budget', 40, 1.5));
});
test('zero costs and budgets stay zero without fabricating rates for zero outcomes', () => {
  assert.equal(calculateUnitCost('cost', 0, 90).value, 0);
  assert.equal(calculateCPL('cost', 0, 120).value, 0);
  assert.equal(calculateUnitCost('budget', 0, 200).value, 0);
  assert.equal(calculateUnitCost('count', 0, 40).value, 0);
  for (const fn of [calculateUnitCost, calculateCPL]) {
    assert.throws(() => fn('cost', 500, 0));
    assert.throws(() => fn('cost', 0, 0));
    assert.throws(() => fn('count', 1000, 0));
  }
});
test('the published per-order model and direct margin produce the same break-even ratio', () => {
  const cost = calculateBreakEven('costs', { revenue: 100, goods: 40, shipping: 10, fees: 5, other: 5 });
  const margin = calculateBreakEven('margin', { margin: 40 });
  assert.equal(cost.roas, 2.5);
  assert.equal(cost.roas, margin.roas);
  assert.equal(cost.percent, 250);
  assert.equal(cost.marginPercent, 40);
  assert.equal(cost.adAllowance, 40);
  assert.equal(cost.revenue - cost.costs - cost.adAllowance, 0);
});
test('adding omitted shipping costs increases the break-even threshold', () => {
  const costs = { revenue: 100, goods: 40, shipping: 10, fees: 5, other: 5 };
  const before = calculateBreakEven('costs', costs);
  const after = calculateBreakEven('costs', { ...costs, shipping: 20 });
  assert.ok(after.roas > before.roas);
  assert.equal(after.marginPercent, 30);
  assert.equal(calculateBreakEven('margin', { margin: 100 }).roas, 1);
});
test('zero and negative contribution margins have no finite break-even ratio', () => {
  for (const margin of [0, -20, 101]) assert.throws(() => calculateBreakEven('margin', { margin }));
  for (const goods of [100, 110]) assert.throws(() => calculateBreakEven('costs', { revenue: 100, goods, shipping: 0, fees: 0, other: 0 }));
});
test('missing, negative, non-finite and unsupported magnitudes cannot yield a fabricated result', () => {
  for (const value of ['', ' ', null, undefined, NaN, Infinity, '5foo', -1, Number.MAX_SAFE_INTEGER + 1, 1e-15]) {
    assert.throws(() => calculateUnitCost('cost', value, 10));
    assert.throws(() => calculateCTR('rate', 10, value));
  }
  assert.throws(() => calculateBreakEven('costs', { revenue: 100, goods: 40, shipping: '', fees: 5, other: 5 }));
  assert.throws(() => calculateUnitCost('count', Number.MAX_SAFE_INTEGER, 1e-12));
  assert.throws(() => calculateCTR('clicks', 1.5, 2));
  assert.throws(() => calculateCTR('unknown', 1, 2));
});
