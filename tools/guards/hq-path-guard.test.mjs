#!/usr/bin/env node
/*
 * OL-019 H — tests for the permanent HQ_ONLY / SEALED path guard.
 * Run: node tools/guards/hq-path-guard.test.mjs   (exit 0 = all pass)
 */
import { scanPaths, packIsCommentsOnly, isAllowlisted } from './hq-path-guard.mjs';

let passed = 0;
let failed = 0;

function check(name, actual, expected) {
  const ok = actual === expected;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`);
  if (ok) passed += 1;
  else {
    failed += 1;
    console.error(`      expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

// 1. lowercase hq_only is rejected
check('1 lowercase hq_only rejected',
  scanPaths(['art_department/ships/art_ship_003/hq_only/GENERATION_LOG_HQ_ONLY.md']).length > 0, true);

// 2. uppercase HQ_ONLY is rejected
check('2 uppercase HQ_ONLY rejected',
  scanPaths(['docs/INTERNAL/HQ_ONLY_NOTES.md']).length > 0, true);

// 3. SEALED is rejected
check('3 SEALED rejected',
  scanPaths(['art_department/ships/SEALED/secret.png']).length > 0, true);

// 4. DO_NOT_OPEN is rejected
check('4 DO_NOT_OPEN rejected',
  scanPaths(['docs/DO_NOT_OPEN_package.md']).length > 0, true);

// 5. allowed IF-1 exception passes (matches SEALED pattern but is allow-listed)
const allowedIf1 = 'js/if1/loader/sealed-loader.js';
check('5 allowed IF-1 exception passes',
  isAllowlisted(allowedIf1) && scanPaths([allowedIf1]).length === 0, true);

// 6. js/sealed/pack.js with executable/data content fails
check('6 pack.js with executable/data content fails',
  packIsCommentsOnly("window.RASealed = { install(x){ return x; } };"), false);

// 7. comments-only js/sealed/pack.js passes
check('7 comments-only pack.js passes',
  packIsCommentsOnly('/* OL: empty sealed slot — no content in OPEN builds. */\n// nothing to install\n\n'), true);

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);
