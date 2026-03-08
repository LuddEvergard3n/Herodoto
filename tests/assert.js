/**
 * ASSERT.JS — Heródoto Test Assertion Library
 * Lightweight, zero-dependency assertions with rich terminal output.
 */

'use strict';

const c = {
  reset:  '\x1b[0m',
  bold:   '\x1b[1m',
  dim:    '\x1b[2m',
  red:    '\x1b[31m',
  green:  '\x1b[32m',
  yellow: '\x1b[33m',
  cyan:   '\x1b[36m',
  white:  '\x1b[37m',
  gray:   '\x1b[90m',
};

class AssertionError extends Error {
  constructor(msg, actual, expected) {
    super(msg);
    this.name = 'AssertionError';
    this.actual   = actual;
    this.expected = expected;
  }
}

// ─── Suite context ───────────────────────────────────────────────────────────

let _suite   = null;
let _results = [];   // { suite, label, ok, err, duration }

function suite(name, fn) {
  _suite = name;
  console.log(`\n${c.bold}${c.cyan}▸ ${name}${c.reset}`);
  fn();
  _suite = null;
}

function it(label, fn) {
  const t0 = Date.now();
  try {
    fn();
    const ms = Date.now() - t0;
    _results.push({ suite: _suite, label, ok: true, ms });
    process.stdout.write(`  ${c.green}✓${c.reset} ${c.dim}${label}${c.reset}\n`);
  } catch (err) {
    const ms = Date.now() - t0;
    _results.push({ suite: _suite, label, ok: false, err, ms });
    process.stdout.write(`  ${c.red}✗${c.reset} ${c.bold}${label}${c.reset}\n`);
    if (err.message) {
      const lines = err.message.split('\n');
      lines.forEach(l => process.stdout.write(`      ${c.red}${l}${c.reset}\n`));
    }
    if (err.actual !== undefined && err.expected !== undefined) {
      process.stdout.write(`      ${c.gray}actual  :${c.reset} ${JSON.stringify(err.actual)}\n`);
      process.stdout.write(`      ${c.gray}expected:${c.reset} ${JSON.stringify(err.expected)}\n`);
    }
  }
}

// ─── Assertions ──────────────────────────────────────────────────────────────

function ok(value, msg = 'Expected truthy value') {
  if (!value) throw new AssertionError(msg, value, true);
}

function equal(actual, expected, msg) {
  if (actual !== expected)
    throw new AssertionError(msg || `${actual} !== ${expected}`, actual, expected);
}

function notEqual(actual, expected, msg) {
  if (actual === expected)
    throw new AssertionError(msg || `Expected values to differ: ${actual}`, actual, expected);
}

function deepEqual(actual, expected, msg) {
  const as = JSON.stringify(actual), es = JSON.stringify(expected);
  if (as !== es) throw new AssertionError(msg || 'Deep equality failed', actual, expected);
}

function includes(arr, value, msg) {
  if (!arr.includes(value))
    throw new AssertionError(msg || `Array does not include "${value}"`, arr, value);
}

function notIncludes(arr, value, msg) {
  if (arr.includes(value))
    throw new AssertionError(msg || `Array should not include "${value}"`, arr, value);
}

function matches(str, regex, msg) {
  if (!regex.test(str))
    throw new AssertionError(msg || `"${str}" does not match ${regex}`, str, regex.toString());
}

function lessThan(a, b, msg) {
  if (!(a < b)) throw new AssertionError(msg || `${a} is not < ${b}`, a, b);
}

function greaterThan(a, b, msg) {
  if (!(a > b)) throw new AssertionError(msg || `${a} is not > ${b}`, a, b);
}

function throws(fn, msg = 'Expected function to throw') {
  let threw = false;
  try { fn(); } catch { threw = true; }
  if (!threw) throw new AssertionError(msg);
}

function arrayUnique(arr, keyFn, msg) {
  const seen = new Map();
  const dupes = [];
  for (const item of arr) {
    const k = keyFn ? keyFn(item) : item;
    if (seen.has(k)) dupes.push(k);
    else seen.set(k, true);
  }
  if (dupes.length > 0)
    throw new AssertionError(
      msg || `Duplicate values found:\n    ${[...new Set(dupes)].slice(0,10).join('\n    ')}`,
      dupes.length, 0
    );
}

function hasFields(obj, fields, context = '') {
  const missing = fields.filter(f => obj[f] === undefined || obj[f] === null || obj[f] === '');
  if (missing.length > 0)
    throw new AssertionError(
      `Missing or empty fields [${missing.join(', ')}]${context ? ' in ' + context : ''}`,
      missing, []
    );
}

function inSet(value, set, msg) {
  if (!set.has(value))
    throw new AssertionError(
      msg || `"${value}" is not in allowed set {${[...set].join(', ')}}`,
      value, [...set]
    );
}

// ─── Summary ─────────────────────────────────────────────────────────────────

function summary() {
  const pass = _results.filter(r => r.ok).length;
  const fail = _results.filter(r => !r.ok).length;
  const total = _results.length;

  console.log(`\n${'─'.repeat(60)}`);
  console.log(`${c.bold}Results: ${pass}/${total} passed${c.reset}`);

  if (fail > 0) {
    console.log(`\n${c.red}${c.bold}Failed tests:${c.reset}`);
    _results.filter(r => !r.ok).forEach(r => {
      console.log(`  ${c.red}✗${c.reset} [${r.suite}] ${r.label}`);
    });
  }

  const totalMs = _results.reduce((s, r) => s + r.ms, 0);
  console.log(`\n${c.gray}Total time: ${totalMs}ms${c.reset}`);

  if (fail > 0) {
    console.log(`\n${c.red}${c.bold}✗ ${fail} test(s) FAILED${c.reset}\n`);
    return false;
  } else {
    console.log(`\n${c.green}${c.bold}✓ All tests passed${c.reset}\n`);
    return true;
  }
}

function getResults() { return _results; }

module.exports = {
  suite, it, summary, getResults,
  ok, equal, notEqual, deepEqual,
  includes, notIncludes, matches,
  lessThan, greaterThan, throws,
  arrayUnique, hasFields, inSet,
};
