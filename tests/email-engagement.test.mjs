import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateEmailEngagement as calculate, EmailInputError } from '../src/scripts/email-engagement-math.js';

test('one campaign produces three different recipient-based rates', () => {
  const result = calculate({delivered:'50000',opens:'20000',clicks:'1250'});
  assert.equal(result.openRate,40); assert.equal(result.ctr,2.5); assert.equal(result.ctor,6.25); assert.equal(result.trackingMismatch,false);
});
test('zero numerators are valid; zero denominators remain undefined', () => {
  const none = calculate({delivered:0,opens:0,clicks:0});
  assert.equal(none.openRate,null); assert.equal(none.ctr,null); assert.equal(none.ctor,null);
  const noOpens = calculate({delivered:100,opens:0,clicks:0});
  assert.equal(noOpens.openRate,0); assert.equal(noOpens.ctr,0); assert.equal(noOpens.ctor,null);
});
test('inconsistent tracked opens are flagged without inventing open counts', () => {
  const result = calculate({delivered:100,opens:5,clicks:10});
  assert.equal(result.ctor,200); assert.equal(result.trackingMismatch,true);
  const missing = calculate({delivered:100,opens:0,clicks:10});
  assert.equal(missing.ctor,null); assert.equal(missing.trackingMismatch,true); assert.equal(missing.ctr,10);
});
test('blank, fractional, negative, nonfinite and repeated-event counts are rejected', () => {
  for (const value of ['', ' ', 0.5, -1, Infinity, NaN, Number.MAX_SAFE_INTEGER+1]) {
    assert.throws(() => calculate({delivered:100,opens:value,clicks:0}), EmailInputError);
  }
  assert.throws(() => calculate({delivered:100,opens:101,clicks:0}), /unique recipients rather than total opens/);
  assert.throws(() => calculate({delivered:100,opens:50,clicks:101}), /unique recipients rather than total link clicks/);
});
