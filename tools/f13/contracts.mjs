// F13 HOLISTIC BALANCE HARNESS — contracts derived from ACCEPTED SOURCE (INFRASTRUCTURE ONLY).
// Invariant bounds must come from the shipped source/contracts, never from invented caps. Each helper reads the
// accepted module surface that is actually loaded (function source text, tunable tables) so the bound tracks the
// code instead of duplicating a number here.
import { fingerprint, normalize } from './serialize.mjs';

// The legal rank values the accepted NEW OGA ladder can assign (rank:0 defaults live in state.js; completions
// declare rank:N in new_oga.js). Scanning the live function source keeps this honest if the ladder grows.
export function rankBounds(ctx) {
  const legal = new Set([0]);
  const source = [];
  for (const fn of Object.values(ctx.RANewOga || {})) {
    if (typeof fn !== 'function') continue;
    const text = String(fn);
    source.push(text);
    for (const m of text.matchAll(/\brank\s*:\s*(-?\d+)/g)) legal.add(Number(m[1]));
  }
  const list = [...legal].sort((a, b) => a - b);
  return { min: list[0] ?? 0, max: list.at(-1) ?? 0, legal: list, sourceScanned: source.length };
}

// Trust bounds are the sum of the authored one-time deltas in RANewOgaTunables.trust; the accepted ladder guards
// each of them once. This is a bound, not a target, and it is read from the tunable table, not hardcoded.
export function trustBounds(ctx) {
  const table = ctx.RANewOgaTunables?.trust || {};
  let min = 0;
  let max = 0;
  for (const value of Object.values(table)) {
    if (!Number.isFinite(Number(value))) continue;
    const n = Number(value);
    if (n < 0) min += n;
    else max += n;
  }
  return { min, max, thresholds: { ...(ctx.RANewOgaTunables?.trustThresholds || {}) }, entries: Object.keys(table).length };
}

// HEAT floors are PROVISIONAL per the accepted service (docs: SOURCE_REQUIRED). The harness only asserts the
// invariant the service itself declares: tiers strictly increase and the value floors at zero.
export function heatContract(ctx) {
  const describe = ctx.RAHeat?.describe?.() || { scale: [], floors: {}, provisional: true };
  const floors = describe.floors || {};
  const order = describe.scale || [];
  const increasing = order.every((tier, i) => i === 0 || Number(floors[order[i]]) > Number(floors[order[i - 1]]));
  return { order, floors, increasing, provisional: !!describe.provisional };
}

// Reusable once-only idempotency probe: run `invoke` twice and report whether the second run changed `select()`.
// Tests use it against the accepted once-only completions; the runtime invariant uses the guard flags instead.
export function probeOnceOnly(ctx, { invoke, select }) {
  const before = fingerprint(normalize(select(ctx)));
  invoke(ctx);
  const afterFirst = fingerprint(normalize(select(ctx)));
  invoke(ctx);
  const afterSecond = fingerprint(normalize(select(ctx)));
  return {
    firstChanged: before !== afterFirst,
    secondChanged: afterFirst !== afterSecond,
    stable: afterFirst === afterSecond
  };
}
