import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateCLV, CLVError } from '../src/scripts/clv-math.js';

const base = { value: '100', frequency: '4', lifetime: '3', period: 'year', margin: '40', cac: '200' };

test('retail example separates revenue, contribution and acquisition', () => {
  const result = calculateCLV('contribution', base);
  assert.equal(result.expectedOrders, 12);
  assert.equal(result.revenue, 1200);
  assert.equal(result.contribution, 480);
  assert.equal(result.ratio, 2.4);
  assert.equal(result.afterCAC, 280);
});

test('monthly fractional frequency is not silently annualized or rounded', () => {
  const monthly = calculateCLV('revenue', { value: '100', frequency: '0.5', lifetime: '24', period: 'month' });
  assert.equal(monthly.revenue, 1200);
  assert.equal(monthly.expectedOrders, 12);
  assert.equal(monthly.contribution, null);
  const fractional = calculateCLV('revenue', { ...base, frequency: '0.5', lifetime: '1.5' });
  assert.equal(fractional.expectedOrders, 0.75);
  assert.equal(fractional.revenue, 75);
});

test('optional CAC blank is omitted; zero gives no ratio; negative balance is retained', () => {
  assert.equal(calculateCLV('contribution', { ...base, cac: '' }).afterCAC, null);
  const zero = calculateCLV('contribution', { ...base, cac: '0' });
  assert.equal(zero.ratio, null);
  assert.equal(zero.afterCAC, 480);
  assert.equal(calculateCLV('contribution', { ...base, cac: '600' }).afterCAC, -120);
  for (const invalid of [[], {}, Infinity, 'unknown']) {
    assert.throws(() => calculateCLV('contribution', { ...base, cac: invalid }), error => error instanceof CLVError && error.field === 'cac');
  }
});

test('zero value, zero frequency and zero margin are meaningful inputs', () => {
  assert.equal(calculateCLV('revenue', { ...base, value: '0' }).revenue, 0);
  assert.equal(calculateCLV('revenue', { ...base, frequency: '0' }).expectedOrders, 0);
  assert.equal(calculateCLV('contribution', { ...base, margin: '0' }).ratio, 0);
  assert.equal(calculateCLV('contribution', { ...base, margin: '100' }).contribution, 1200);
});

test('missing and non-finite fields are errors instead of inferred zeros', () => {
  for (const field of ['value', 'frequency', 'lifetime', 'margin']) {
    for (const invalid of ['', ' ', 'no', Infinity, NaN, {}, []]) {
      assert.throws(() => calculateCLV('contribution', { ...base, [field]: invalid }), error => error instanceof CLVError && error.field === field);
    }
  }
});

test('rejects impossible margins, negative values, zero lifetime and mixed modes/units', () => {
  for (const field of ['value', 'frequency', 'lifetime', 'margin', 'cac']) {
    assert.throws(() => calculateCLV('contribution', { ...base, [field]: '-1' }), CLVError);
  }
  assert.throws(() => calculateCLV('contribution', { ...base, margin: '100.1' }), /0 to 100/);
  assert.throws(() => calculateCLV('revenue', { ...base, lifetime: '0' }), /greater than zero/);
  assert.throws(() => calculateCLV('revenue', { ...base, period: 'week' }), /months or years/);
  assert.throws(() => calculateCLV('churn', base), /calculation mode/);
});

test('rejects unsafe products and extreme underflow rather than showing invented amounts', () => {
  assert.throws(() => calculateCLV('revenue', { ...base, value: Number.MAX_SAFE_INTEGER }), /supported range/);
  assert.throws(() => calculateCLV('revenue', { ...base, frequency: '1e-12', lifetime: '1e-12' }), /supported range/);
  assert.throws(() => calculateCLV('contribution', { ...base, cac: '1e-13' }), /supported range/);
});
