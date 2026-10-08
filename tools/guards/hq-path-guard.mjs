#!/usr/bin/env node
/*
 * OL-019 H — PERMANENT HQ_ONLY / SEALED PATH GUARD
 *
 * Rejects public-repo paths that match protected-material patterns, and rejects a
 * `js/sealed/pack.js` slot containing anything but comments.
 *
 * This guard is enforcement, not detection of the historical leak (that was removed by the
 * OL-019 history rewrite). It fails CI / pre-push so the patterns can never re-enter.
 *
 * Usage:
 *   node tools/guards/hq-path-guard.mjs --tracked        # scan every git-tracked path (CI)
 *   node tools/guards/hq-path-guard.mjs --stdin          # scan newline-separated paths (hook)
 *   node tools/guards/hq-path-guard.mjs a/b.md c/d.md    # scan explicit paths
 *
 * Exit 0 = clean, 1 = violation(s).
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { verifyApprovedPublication } from '../verify-public-release.mjs';

// Explicit, justified exceptions ONLY. Everything else must be rejected.
// - js/sealed/pack.js  : the accepted empty overlay install slot (comments-only, enforced below).
// - js/systems/sealed.js : the accepted neutral sealed-hook runtime system (no sealed content).
// - js/if1/            : IF-1 loader / spine files (integration-spine owner surface).
export const ALLOWLIST_EXACT = [
  'js/sealed/pack.js',
  'js/systems/sealed.js',
];
export const ALLOWLIST_PREFIXES = [
  'js/if1/',
];

export const PATTERNS = [
  { id: 'HQ_ONLY', re: /hq_only/i, description: 'HQ-only material path' },
  { id: 'SEALED', re: /(^|[\/_.-])sealed([\/_.-]|$)/i, description: 'sealed-material path token' },
  { id: 'DO_NOT_OPEN', re: /do_not_open/i, description: 'do-not-open material path' },
];

export function normalize(p) {
  return String(p).replace(/\\/g, '/').replace(/^\.\//, '');
}

export function isAllowlisted(pathIn) {
  const p = normalize(pathIn);
  if (ALLOWLIST_EXACT.includes(p)) return true;
  return ALLOWLIST_PREFIXES.some((prefix) => p.startsWith(prefix));
}

/** Returns an array of {path, rule} violations for the given paths. */
export function scanPaths(paths) {
  const violations = [];
  for (const raw of paths) {
    const p = normalize(raw);
    if (!p) continue;
    if (isAllowlisted(p)) continue;
    for (const pat of PATTERNS) {
      if (pat.re.test(p)) {
        violations.push({ path: p, rule: pat.id });
        break;
      }
    }
  }
  return violations;
}

/** A pack slot is valid only when it contains comments / whitespace and no code or data. */
export function packIsCommentsOnly(source) {
  const stripped = String(source)
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/[^\n]*/g, '')
    .trim();
  return stripped.length === 0;
}

function gitTrackedPaths() {
  const out = execFileSync('git', ['ls-files'], { encoding: 'utf8' });
  return out.split('\n').map((s) => s.trim()).filter(Boolean);
}

function readStdin() {
  try {
    return readFileSync(0, 'utf8');
  } catch {
    return '';
  }
}

function main(argv) {
  const args = argv.filter((a) => !a.startsWith('--'));
  let paths;
  if (args.length) paths = args;
  else if (argv.includes('--stdin')) paths = readStdin().split(/\s+/);
  else paths = gitTrackedPaths();

  // Public approval applies only to the complete, hash-pinned compiled release.
  const approved = existsSync('PUBLIC-RELEASE.json') ? verifyApprovedPublication(process.cwd()).approved : new Set();
  const violations = scanPaths(paths).filter(v => !approved.has(v.path));

  const packPath = 'js/sealed/pack.js';
  if (existsSync(packPath)) {
    if (!packIsCommentsOnly(readFileSync(packPath, 'utf8')) && !approved.has(packPath)) {
      violations.push({ path: packPath, rule: 'PACK_NOT_COMMENTS_ONLY' });
    }
  }

  if (violations.length) {
    console.error('HQ_PATH_GUARD FAIL — protected-material paths present:');
    for (const v of violations) console.error(`  [${v.rule}] ${v.path}`);
    return 1;
  }
  console.log(`HQ_PATH_GUARD PASS — ${paths.length} path(s) scanned, 0 violations.`);
  return 0;
}

const isMain = process.argv[1] && process.argv[1].replace(/\\/g, '/').endsWith('tools/guards/hq-path-guard.mjs');
if (isMain) {
  process.exit(main(process.argv.slice(2)));
}
