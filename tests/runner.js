#!/usr/bin/env node
/**
 * RUNNER.JS — Heródoto Automated Test Runner
 *
 * Usage:
 *   node tests/runner.js              # run all tests
 *   node tests/runner.js data         # run tests matching "data"
 *   node tests/runner.js --list       # list test files without running
 *   node tests/runner.js --help       # show help
 *
 * Exit codes:
 *   0  — all tests passed
 *   1  — one or more tests failed
 *   2  — runner error (missing file, etc.)
 */

'use strict';

const fs     = require('fs');
const path   = require('path');

const c = {
  reset:  '\x1b[0m',
  bold:   '\x1b[1m',
  dim:    '\x1b[2m',
  red:    '\x1b[31m',
  green:  '\x1b[32m',
  yellow: '\x1b[33m',
  cyan:   '\x1b[36m',
  blue:   '\x1b[34m',
  gray:   '\x1b[90m',
};

const TESTS_DIR = __dirname;
const ASSERT    = require('./assert');

// ─── Helpers ─────────────────────────────────────────────────────────────────

function banner() {
  console.log(`\n${c.bold}${c.blue}╔══════════════════════════════════════════════════╗`);
  console.log(`║       HERÓDOTO — Automated Test Suite            ║`);
  console.log(`╚══════════════════════════════════════════════════╝${c.reset}`);
}

function discoverTests(filter) {
  return fs.readdirSync(TESTS_DIR)
    .filter(f => f.startsWith('test-') && f.endsWith('.js'))
    .filter(f => !filter || f.includes(filter))
    .sort()
    .map(f => path.join(TESTS_DIR, f));
}

function help() {
  console.log(`
${c.bold}Heródoto Test Runner${c.reset}

Usage:
  node tests/runner.js [filter] [options]

Arguments:
  filter        Run only test files whose name contains <filter>
                e.g. "data", "personagens", "questions"

Options:
  --list        List discovered test files without running
  --help, -h    Show this help

Examples:
  node tests/runner.js                    # Run all tests
  node tests/runner.js data               # Run test-data-integrity.js
  node tests/runner.js personagens        # Run test-personagens.js
  node tests/runner.js --list             # List all test files
`);
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) { help(); process.exit(0); }

  const filter   = args.find(a => !a.startsWith('--'));
  const listOnly = args.includes('--list');

  banner();

  const testFiles = discoverTests(filter);

  if (testFiles.length === 0) {
    console.log(`\n${c.yellow}No test files found${filter ? ` matching "${filter}"` : ''}.${c.reset}\n`);
    process.exit(2);
  }

  if (listOnly) {
    console.log(`\n${c.bold}Discovered ${testFiles.length} test file(s):${c.reset}`);
    testFiles.forEach(f => console.log(`  ${c.cyan}${path.basename(f)}${c.reset}`));
    console.log();
    process.exit(0);
  }

  console.log(`\n${c.dim}Running ${testFiles.length} test file(s)…${c.reset}`);
  if (filter) console.log(`${c.dim}Filter: "${filter}"${c.reset}`);

  const startTime = Date.now();

  // ── Run each test file ──────────────────────────────────────────────────
  for (const filePath of testFiles) {
    const name = path.basename(filePath);
    try {
      require(filePath);
    } catch (err) {
      console.log(`\n${c.red}${c.bold}ERROR loading ${name}:${c.reset}`);
      console.log(`  ${c.red}${err.message}${c.reset}`);
      if (err.stack) {
        err.stack.split('\n').slice(1, 4).forEach(l =>
          console.log(`  ${c.gray}${l.trim()}${c.reset}`)
        );
      }
    }
  }

  // ── Print summary ───────────────────────────────────────────────────────
  const allPassed = ASSERT.summary();
  const elapsed   = Date.now() - startTime;

  const results  = ASSERT.getResults();
  const passed   = results.filter(r => r.ok).length;
  const failed   = results.filter(r => !r.ok).length;
  const total    = results.length;

  // ── Per-file breakdown ──────────────────────────────────────────────────
  if (testFiles.length > 1) {
    console.log(`${c.bold}Per-file breakdown:${c.reset}`);

    // Reconstruct per-file stats from suite names embedded in results
    const fileOrder = testFiles.map(f => path.basename(f, '.js').replace('test-', ''));
    const bySuite   = {};
    for (const r of results) {
      const key = r.suite || 'unknown';
      if (!bySuite[key]) bySuite[key] = { pass: 0, fail: 0 };
      if (r.ok) bySuite[key].pass++; else bySuite[key].fail++;
    }
    for (const [suite, counts] of Object.entries(bySuite)) {
      const icon = counts.fail > 0 ? `${c.red}✗` : `${c.green}✓`;
      const info = counts.fail > 0
        ? `${c.red}${counts.fail} failed${c.reset}`
        : `${c.green}${counts.pass} passed${c.reset}`;
      console.log(`  ${icon}${c.reset} ${suite} — ${info}`);
    }
    console.log();
  }

  console.log(`${c.gray}Elapsed: ${elapsed}ms${c.reset}\n`);

  process.exit(allPassed ? 0 : 1);
}

main().catch(err => {
  console.error(`\n${c.red}Runner crashed: ${err.message}${c.reset}`);
  process.exit(2);
});
