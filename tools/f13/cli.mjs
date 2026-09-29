#!/usr/bin/env node
// F13 HOLISTIC BALANCE HARNESS — CLI (INFRASTRUCTURE ONLY).
//   node tools/f13/cli.mjs --seeds 1,2,3 --policies conservative,randomized --days 60
//                          --out report.json --csv summary.csv --series series.csv
//                          --seed-flows ogunsRave,supra,property --quiet --no-gate
// Exit code: 0 unless an INVARIANT fails (a harness/accepted-state correctness problem), then 1 unless --no-gate.
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { simulateBatch } from './run.mjs';
import { describePolicies } from './policies.mjs';
import { humanReport, summaryRow, toJSON, toSeriesCSV, toSummaryCSV } from './report.mjs';

const args = process.argv.slice(2);
const has = flag => args.includes(flag);
const arg = (name, fallback) => {
  const i = args.indexOf(name);
  return i >= 0 && i + 1 < args.length ? args[i + 1] : fallback;
};
const list = (name, fallback) => arg(name, fallback).split(',').map(s => s.trim()).filter(Boolean);

export async function main(argv = args) {
  const seeds = list('--seeds', '1').map(s => (/^\d+$/.test(s) ? Number(s) : s));
  const policies = list('--policies', 'conservative');
  const days = Number(arg('--days', '60'));
  const start = arg('--start', 'post-prologue');
  const maxActionsPerDay = Number(arg('--max-actions', '4'));
  const seedFlows = list('--seed-flows', '');
  const syntheticRewards = has('--synthetic-rewards');
  const quiet = has('--quiet');
  const includeActions = has('--include-actions');

  const runs = await simulateBatch({ seeds, policies, days, start, maxActionsPerDay, seedFlows, syntheticRewards, captureState: has('--capture-state') });

  const out = arg('--out', null);
  if (out) await writeFile(out, `${JSON.stringify(toJSON(runs, { includeActions }), null, 1)}\n`);
  const csv = arg('--csv', null);
  if (csv) await writeFile(csv, `${toSummaryCSV(runs)}\n`);
  const series = arg('--series', null);
  if (series) await writeFile(series, `${toSeriesCSV(runs)}\n`);

  if (!quiet) {
    console.log(humanReport(runs));
    console.log('');
    console.table ? console.table(runs.map(summaryRow)) : null;
  }

  const failed = runs.filter(r => r.invariants.failures.length);
  if (failed.length) {
    for (const run of failed) console.error(`INVARIANT FAILURES seed=${run.seed} policy=${run.policy}: ${run.invariants.failures.map(f => f.id).join(', ')}`);
    if (!has('--no-gate')) process.exitCode = 1;
  }
  return { runs, failed };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { runs, failed } = await main();
  if (!args.includes('--quiet')) console.log(`\n${runs.length} run(s), ${failed.length} with invariant failures.`);
}
