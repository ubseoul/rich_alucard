// F13 HOLISTIC BALANCE HARNESS — machine-readable + human output (INFRASTRUCTURE ONLY).
// JSON is the canonical artifact; CSV views are for spreadsheets. No output claims a balance verdict.

export function toJSON(runs, { includeActions = false } = {}) {
  const list = Array.isArray(runs) ? runs : [runs];
  return {
    schema: 'f13.report/1',
    harness: 'F13-A holistic balance simulation harness',
    note: 'INFRASTRUCTURE ONLY. No balance verdict, no economy tuning.',
    runs: list.map(run => includeActions ? run : stripHeavy(run))
  };
}

function stripHeavy(run) {
  const { metrics, ...rest } = run;
  const { actions, ...metricRest } = metrics || {};
  return { ...rest, metrics: metricRest };
}

export function summaryRow(run) {
  const m = run.metrics;
  return {
    seed: run.seed,
    policy: run.policy,
    days: run.days,
    endDay: run.endDay,
    moneyFinal: m.cash.final,
    netWorthFinal: m.cash.netWorthFinal,
    minCash: m.cash.min,
    minCashDay: m.cash.minDay,
    maxCash: m.cash.max,
    maxCashDay: m.cash.maxDay,
    bankruptcy: m.bankruptcy.everNonPositive,
    heatMax: m.heat.max?.value ?? 0,
    heatMaxTier: m.heat.max?.tier ?? 'COOL',
    rank: m.progression.rank,
    trust: m.progression.trust,
    streetClout: m.progression.streetClout,
    incomeTotal: m.income.totalIn,
    expenseTotal: m.expense.totalOut,
    completions: m.missions.completed.length,
    peopleMet: m.relationships.met,
    cars: m.assets.cars.length,
    guns: m.assets.guns.length,
    rooms: m.assets.rooms.length,
    properties: m.assets.properties.length,
    failures: m.failures.count,
    softlocks: m.failures.softlocks.length,
    longestStallDays: m.activity.stalls.longest,
    notDrivenSurfaces: m.unreachable.surfacesNotDriven.length,
    adventureNeverSurfaced: m.unreachable.adventures.length,
    ledgerSaturated: m.ledger.saturated,
    invariantFailures: run.invariants.failures.length,
    fingerprint: run.fingerprint
  };
}

const CSV = value => {
  const text = value === null || value === undefined ? '' : String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};
export function toCSV(rows, columns = null) {
  if (!rows.length) return '';
  const keys = columns || Object.keys(rows[0]);
  return [keys.join(','), ...rows.map(row => keys.map(k => CSV(row[k])).join(','))].join('\n');
}

export function toSummaryCSV(runs) {
  const list = Array.isArray(runs) ? runs : [runs];
  return toCSV(list.map(summaryRow));
}

// Long-format per-day series: one row per run per sampled day.
export function toSeriesCSV(runs) {
  const list = Array.isArray(runs) ? runs : [runs];
  const rows = [];
  for (const run of list) {
    const series = run.metrics.cash.series;
    for (const point of series) {
      const heat = run.metrics.heat.series.find(h => h.day === point.day) || {};
      const prog = run.metrics.progression.series.find(p => p.day === point.day) || {};
      rows.push({
        seed: run.seed, policy: run.policy, day: point.day,
        money: point.money, netWorth: point.netWorth,
        heat: heat.value ?? '', heatTier: heat.tier ?? '',
        rank: prog.rank ?? '', trust: prog.trust ?? '', gangClout: prog.gangClout ?? ''
      });
    }
  }
  return toCSV(rows);
}

export function humanSummary(run) {
  const m = run.metrics;
  const lines = [];
  lines.push(`RUN seed=${run.seed} policy=${run.policy} (${run.policyLabel})`);
  lines.push(`  days simulated: ${run.days} (day ${run.startDay} → ${run.endDay})`);
  lines.push(`  routes surfaced: ${m.missions.surfaced.length} · completed: ${m.missions.completed.length} · never surfaced: ${m.unreachable.adventures.length}`);
  lines.push(`  economy: final ${fmt(m.cash.final)} · net worth ${fmt(m.cash.netWorthFinal)} · min ${fmt(m.cash.min)} (day ${m.cash.minDay}) · max ${fmt(m.cash.max)} (day ${m.cash.maxDay})`);
  lines.push(`  income ${fmt(m.income.totalIn)} / expense ${fmt(m.expense.totalOut)} · bankruptcy points: ${m.bankruptcy.nonPositive.length}`);
  const topIncome = topEntries(m.income.byFamily).slice(0, 4).map(([k, v]) => `${k}:${fmt(v)}`).join(' ');
  const topExpense = topEntries(m.expense.bySource).slice(0, 4).map(([k, v]) => `${k}:${fmt(v)}`).join(' ');
  lines.push(`  top income families: ${topIncome || 'none'}`);
  lines.push(`  top expense sources: ${topExpense || 'none'}`);
  lines.push(`  HEAT max ${m.heat.max?.value ?? 0} (${m.heat.max?.tier ?? 'COOL'}) · tier changes ${m.heat.tierChanges.length}`);
  lines.push(`  progression: rank ${m.progression.rank}${m.progression.rankTitle ? ` (${m.progression.rankTitle})` : ''} · trust ${m.progression.trust} · clout ${m.progression.streetClout} · newOga ${m.progression.newOgaStatus}`);
  lines.push(`  relationships: ${m.relationships.met} met · assets: cars ${m.assets.cars.length}, guns ${m.assets.guns.length}, rooms ${m.assets.rooms.length}, properties ${m.assets.properties.length}`);
  lines.push(`  crew: ${m.crew.status}${m.crew.reason ? ` (${m.crew.reason})` : ''}`);
  lines.push(`  progression stalls: longest ${m.activity.stalls.longest} days${m.activity.stalls.start ? ` (from day ${m.activity.stalls.start})` : ''} · failures ${m.failures.count} · softlocks ${m.failures.softlocks.length}`);
  if (m.failures.repeated.length) lines.push(`  repeated failure loops: ${m.failures.repeated.map(r => `${r.target}×${r.attempts}`).join(', ')}`);
  if (m.duplicates.onceOnly.length) lines.push(`  DUPLICATE once-only payouts: ${m.duplicates.onceOnly.map(d => d.source).join(', ')}`);
  if (m.suspicious.length) lines.push(`  suspicious money: ${m.suspicious.map(s => s.code).join(', ')}`);
  lines.push(`  invariant failures: ${run.invariants.failures.length ? run.invariants.failures.map(f => f.id).join(', ') : 'none'} (${run.invariants.checked} checked)`);
  lines.push(`  fingerprint: ${run.fingerprint}`);
  return lines.join('\n');
}

export function humanReport(runs) {
  const list = Array.isArray(runs) ? runs : [runs];
  const lines = [humanSummary(list[0])];
  for (const run of list.slice(1)) lines.push('', humanSummary(run));
  return lines.join('\n');
}

const fmt = value => `$${new Intl.NumberFormat('en-US').format(Math.round(Number(value) || 0))}`;
const topEntries = obj => Object.entries(obj || {}).sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]));
