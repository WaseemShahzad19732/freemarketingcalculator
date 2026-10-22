import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateMER, MERInputError } from '../src/scripts/mer-math.js';

test('MER and its inverse reconcile the declared full-cost example', () => {
  const result = calculateMER('120000', '30000', 'marketing');
  assert.equal(result.ratio, 4);
  assert.equal(result.spendShare, 25);
  assert.equal(result.scope, 'marketing');
});

test('advertising-only scope remains explicit and uses all business revenue', () => {
  const result = calculateMER(120000, 20000, 'advertising');
  assert.equal(result.ratio, 6);
  assert.ok(Math.abs(result.spendShare - 100 / 6) < 1e-12);
  assert.equal(result.scope, 'advertising');
});

test('zero revenue is valid but its inverse spend share is undefined', () => {
  const result = calculateMER(0, 5000);
  assert.equal(result.ratio, 0);
  assert.equal(result.spendShare, null);
});

test('zero spend is rejected with the denominator field, including zero over zero', () => {
  for (const revenue of [0, 100]) {
    assert.throws(() => calculateMER(revenue, 0), error => error instanceof MERInputError && error.field === 'spend');
  }
});

test('blank, negative, nonfinite and unsupported input types cannot become valid amounts', () => {
  for (const invalid of ['', '   ', -1, 'NaN', Infinity, 'Infinity', NaN, null, undefined, true, {}, Number.MAX_SAFE_INTEGER + 1, 1e-13]) {
    assert.throws(() => calculateMER(invalid, 100), MERInputError);
    assert.throws(() => calculateMER(100, invalid), MERInputError);
  }
});

test('decimal inputs work while extreme ratios and an unknown scope fail explicitly', () => {
  assert.equal(calculateMER(1.5, 0.3).ratio, 5);
  assert.throws(() => calculateMER(Number.MAX_SAFE_INTEGER, 0.001), MERInputError);
  assert.throws(() => calculateMER(1e-12, Number.MAX_SAFE_INTEGER), MERInputError);
  assert.throws(() => calculateMER(100, 20, 'all'), error => error.field === 'scope');
});
