import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const source = readFileSync(new URL('../src/scripts/analytics.js', import.meta.url), 'utf8');
function harness(hostname = 'freemarketingcalculator.com') {
  const listeners = {}, calls = [], microtasks = [];
  const state = { error: '', visible: false };
  const card = { querySelector: selector => selector === '[data-calc-error]' ? { textContent: state.error } : state.visible ? {} : null };
  const button = { closest: () => card };
  // Throw if tracking ever tries to inspect a user's raw numeric value.
  const input = { get value() { throw Error('Do not read private inputs'); }, closest: () => card };
  const context = {
    location: { hostname, pathname: '/cpc-calculator/', search: '?spend=123456789&analytics_debug=1', href: `https://${hostname}/cpc-calculator/?spend=123456789` , origin: `https://${hostname}` },
    window: { gtag: (...args) => calls.push(args) }, URL, URLSearchParams, WeakSet,
    queueMicrotask: fn => microtasks.push(fn),
    document: { addEventListener: (name, fn) => { listeners[name] = fn; } },
  };
  vm.runInNewContext(source, context);
  return { calls, state, card, input, listeners,
    calculate() { listeners.click({ target: { closest: selector => selector === 'button.btn-calc' ? button : null } }); },
    flush() { while (microtasks.length) microtasks.shift()(); },
  };
}

test('one start per calculator, with a completion only after a valid rendered result', () => {
  const h = harness();
  h.listeners.input({ target: h.input });
  h.listeners.change({ target: h.input });
  h.calculate();
  assert.equal(h.calls.length, 1, 'capture listener must wait for the calculator handler');
  h.state.visible = true;
  h.flush();
  assert.deepEqual(h.calls.map(c => c[1]), ['calculator_start', 'calculator_complete']);
});

test('invalid calculation is an error, never a completion, even if an old result exists', () => {
  const h = harness();
  h.calculate();
  h.state.error = 'Enter a value greater than zero';
  h.state.visible = true;
  h.flush();
  assert.deepEqual(h.calls.map(c => c[1]), ['calculator_start', 'calculator_validation_error']);
});

test('analytics contains categorical context only, never input values or URL query data', () => {
  const h = harness();
  h.listeners.input({ target: h.input });
  h.state.visible = true;
  h.calculate(); h.flush();
  for (const call of h.calls) assert.deepEqual(Object.keys(call[2]).sort(), ['calculator', 'debug_mode']);
  assert.ok(!JSON.stringify(h.calls).includes('123456789'));
});

test('localhost and preview hosts send no analytics events', () => {
  for (const host of ['127.0.0.1', 'localhost', 'preview.pages.dev']) {
    const h = harness(host); h.state.visible = true; h.calculate(); h.flush();
    h.listeners['calculator-share'](); h.listeners['calculator-print']();
    assert.equal(h.calls.length, 0);
  }
});

test('share and print are tracked after the successful utility action', () => {
  const h = harness();
  h.listeners['calculator-share'](); h.listeners['calculator-print']();
  assert.deepEqual(h.calls.map(c => c[1]), ['calculator_share', 'calculator_print']);
});

test('GA configuration strips query strings and fragments before the first page view', () => {
  const base = readFileSync(new URL('../src/layouts/Base.astro', import.meta.url), 'utf8');
  const inline = base.match(/<script is:inline>([\s\S]*?)<\/script>/)[1];
  const calls = [], handlers = {}, scripts = [];
  const win = { addEventListener: (name, fn) => { handlers[name] = fn; }, requestIdleCallback: fn => fn() };
  const context = { location: { hostname: 'freemarketingcalculator.com', href: 'https://freemarketingcalculator.com/roas-calculator/?rev=999999#calculator', search: '?rev=999999' },
    window: win, URL, URLSearchParams, Date, setTimeout,
    document: { referrer: 'https://example.com/ref?secret=test', createElement: () => ({}), head: { appendChild: node => scripts.push(node) } },
  };
  vm.runInNewContext(inline, context);
  for (const entry of win.dataLayer) calls.push(Array.from(entry));
  const config = calls.find(c => c[0] === 'config')[2];
  assert.equal(config.page_location, 'https://freemarketingcalculator.com/roas-calculator/');
  assert.equal(config.page_referrer, 'https://example.com/ref');
  assert.equal(scripts.length, 0, 'third-party script is absent before load');
  handlers.load();
  assert.equal(scripts.length, 1);
  assert.equal(scripts[0].src, 'https://www.googletagmanager.com/gtag/js?id=G-HRKELF4XYB');
});
