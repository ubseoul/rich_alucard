// F13 harness — machine-readable output schema and human summary.
import assert from 'node:assert/strict';
import { humanSummary, simulate, summaryRow, toJSON, toSeriesCSV, toSummaryCSV } from './_lib.mjs';

export async function test() {
  const run = await simulate({ seed: 9, policy: 'conservative', days: 4, captureState: true });

  const json = toJSON([run]);
  assert.equal(json.schema, 'f13.report/1');
  assert.equal(json.runs.length, 1);
  const round = JSON.parse(JSON.stringify(json));
  assert.equal(round.runs[0].seed, '9');
  assert(round.runs[0].metrics.cash.series.length === 4, 'cash series has one point per sampled day');

  const summary = summaryRow(run);
  for (const key of ['seed', 'policy', 'days', 'moneyFinal', 'minCash', 'maxCash', 'heatMax', 'rank', 'trust', 'completions', 'invariantFailures', 'fingerprint']) {
    assert(key in summary, `summary row missing ${key}`);
  }

  const csv = toSummaryCSV([run]);
  const csvLines = csv.trim().split('\n');
  assert.equal(csvLines.length, 2, 'summary CSV has a header + one row');
  assert(csvLines[0].includes('fingerprint'));

  const series = toSeriesCSV([run]);
  const seriesLines = series.trim().split('\n');
  assert.equal(seriesLines.length, run.days + 1, 'series CSV has a header + one row per day');
  assert(seriesLines[0].includes('heatTier'));

  const human = humanSummary(run);
  assert(human.includes('seed=') && human.includes('policy='));
  assert(/invariant failures/.test(human));
  assert(/crew: NOT_AVAILABLE/.test(human), 'human summary reports missing fragments');

  console.log('PASS f13 output (JSON schema, summary + series CSV, human summary with invariants and missing-fragment reporting)');
}
