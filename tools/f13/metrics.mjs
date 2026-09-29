// F13 HOLISTIC BALANCE HARNESS — metrics collector (INFRASTRUCTURE ONLY).
// Emits the economy/progression series and derived findings the F13 balance pass will read. It observes the real
// save and the real RAMoneyLedger; it never changes an amount, a probability or a threshold. Cash over time is
// sampled daily; income/expense source attribution comes from the accepted ledger totals.
import { STATUS } from './adapters.mjs';

const KNOWN_FAMILIES = new Set(['new_oga', 'trap', 'war_room', 'rainmaker', 'adventure', 'untagged']);

export function createMetrics(meta = {}) {
  const days = [];
  const actions = [];
  const surfaces = new Map();
  const adventures = new Map();
  const failures = [];
  const softlocks = [];

  function seeAction(action, day) {
    const key = action.id;
    const row = surfaces.get(key) || { id: key, kind: action.kind, surface: action.surface, executable: !!action.executable, reason: action.reason || null, label: action.label || null, firstDay: day, count: 0 };
    row.count += 1;
    if (action.executable) row.executable = true;
    surfaces.set(key, row);
  }
  function seeAdventure(id, kind, day) {
    const row = adventures.get(id) || { id, firstDay: day, kinds: {} };
    row.kinds[kind] = (row.kinds[kind] || 0) + 1;
    adventures.set(id, row);
  }
  function recordAction({ day, action, result }) {
    actions.push({
      day,
      id: action.id,
      kind: action.kind,
      target: action.target,
      label: action.label || null,
      ok: !!result?.ok,
      changed: !!result?.changed,
      abandoned: !!result?.abandoned,
      nightEnded: !!result?.nightEnded,
      error: result?.error || null,
      results: result?.results || null
    });
    if (result?.error) failures.push({ day, id: action.id, target: action.target, error: result.error });
    if (result?.abandoned) failures.push({ day, id: action.id, target: action.target, error: 'abandoned (no legal choices)' });
  }
  function sample(ctx, day) {
    const life = ctx.RAState.get().life;
    if (ctx.RAAdventures.active()) softlocks.push({ day, id: ctx.RAAdventures.active().id });
    days.push({
      day,
      money: ctx.RALife.money(),
      netWorth: ctx.RALife.netWorth(),
      followers: Number(life.resources.followers) || 0,
      heat: ctx.RAHeat?.global?.() ?? (Number(life.newOga?.heat) || 0),
      heatTier: ctx.RAHeat?.tierFor?.(ctx.RAHeat.global()) ?? null,
      rank: Number(life.newOga?.rank) || 0,
      trust: Number(life.newOga?.trust) || 0,
      gangClout: Number(life.newOga?.gangClout) || 0,
      clout: life.resources.clout,
      rep: life.resources.vampireReputation,
      known: ctx.RARelations?.known?.().length || 0,
      cars: (life.ownership.cars || []).length,
      guns: (life.ownership.guns || []).length,
      rooms: (life.ownership.castleRooms || []).length,
      properties: (life.ownership.properties || []).filter(p => p.ownershipStatus === 'owned').length,
      props: (life.ownership.props || []).length,
      items: Object.keys(life.ownership.items || {}).length
    });
  }

  function finish(ctx, extras = {}) {
    const life = ctx.RAState.get().life;
    const ledger = ctx.RAMoneyLedger;
    const totals = ledger?.totals?.() || {};
    const byFamily = ledger?.byFamily?.() || {};
    const entries = ledger?.entries?.() || [];

    const money = days.map(d => d.money);
    const min = money.length ? Math.min(...money) : ctx.RALife.money();
    const max = money.length ? Math.max(...money) : ctx.RALife.money();
    const minDay = days.find(d => d.money === min)?.day ?? null;
    const maxDay = days.find(d => d.money === max)?.day ?? null;
    const nonPositive = days.filter(d => d.money <= 0).map(d => ({ day: d.day, money: d.money }));

    const heatSeries = days.map(d => ({ day: d.day, value: d.heat, tier: d.heatTier }));
    const heatMax = heatSeries.length ? heatSeries.reduce((a, b) => (b.value >= a.value ? b : a)) : null;

    // Income / expense attribution (accepted ledger, all-time totals survive the in-memory entry cap).
    const income = { bySource: {}, byFamily: {}, totalIn: 0 };
    const expense = { bySource: {}, byFamily: {}, totalOut: 0 };
    for (const [source, t] of Object.entries(totals)) {
      const family = ledger.familyOf(source);
      if (t.in) { income.bySource[source] = t.in; income.byFamily[family] = (income.byFamily[family] || 0) + t.in; income.totalIn += t.in; }
      if (t.out) { expense.bySource[source] = t.out; expense.byFamily[family] = (expense.byFamily[family] || 0) + t.out; expense.totalOut += t.out; }
    }

    const suspicious = [];
    if (totals.untagged?.in > 0) suspicious.push({ code: 'UNTAGGED_INCOME', amount: totals.untagged.in, note: 'money entered without a ledger source tag' });
    for (const [source, t] of Object.entries(totals)) {
      const family = ledger.familyOf(source);
      if (!KNOWN_FAMILIES.has(family) && family !== source.split(':')[0]) suspicious.push({ code: 'UNKNOWN_FAMILY', source, family, net: t.net });
    }
    const duplicatePayouts = [];
    for (const [source, t] of Object.entries(totals)) {
      if (/^new_oga:/.test(source) && t.count > 1) duplicatePayouts.push({ source, count: t.count, note: 'once-only NEW OGA reward recorded more than once' });
    }

    const records = life.adventures.records || {};
    const completed = Object.entries(records).filter(([, r]) => r?.status === 'completed' || (r?.count || 0) > 0);
    const history = life.history || [];
    const completionEvents = history.filter(e => e.type === 'adventure_completed').map(e => ({ id: e.adventureId, outcome: e.outcome, day: e.day }));
    const firstCompletionDay = completionEvents.length ? Math.min(...completionEvents.map(e => e.day ?? Infinity)) : null;

    const known = ctx.RARelations?.known?.() || [];
    const byLevel = {};
    for (const person of known) byLevel[person.level ?? 0] = (byLevel[person.level ?? 0] || 0) + 1;

    const attempted = actions.filter(a => a.target);
    const failuresByTarget = {};
    for (const f of failures) if (f.target) (failuresByTarget[f.target] = failuresByTarget[f.target] || []).push(f);
    const repeatedFailures = Object.entries(failuresByTarget)
      .filter(([, list]) => list.length >= 3 && !records[list[0].target]?.count)
      .map(([target, list]) => ({ target, attempts: list.length, days: list.map(f => f.day) }));

    // Progression stalls: consecutive days with no changed action (completion, purchase, reward).
    const progressDays = new Set(actions.filter(a => a.changed).map(a => a.day));
    let stall = 0;
    let longestStall = 0;
    let stallStart = null;
    let longestStart = null;
    for (const d of days) {
      if (progressDays.has(d.day)) { stall = 0; stallStart = null; continue; }
      if (!stall) stallStart = d.day;
      stall += 1;
      if (stall > longestStall) { longestStall = stall; longestStart = stallStart; }
    }

    const allAdventures = (ctx.RAAdventures?.all?.() || []).map(a => a.id);
    const surfaced = new Set(adventures.keys());
    const neverSurfaced = allAdventures.filter(id => !surfaced.has(id));
    const notDriven = [...surfaces.values()].filter(s => !s.executable).map(s => ({ id: s.id, kind: s.kind, reason: s.reason, count: s.count }));

    const crew = extras.adapters?.content?.crew || { status: STATUS.NOT_AVAILABLE };

    return {
      schema: 'f13.metrics/1',
      meta: { ...meta, sampledDays: days.length },
      cash: { series: days.map(d => ({ day: d.day, money: d.money, netWorth: d.netWorth })), min, minDay, max, maxDay, final: ctx.RALife.money(), netWorthFinal: ctx.RALife.netWorth() },
      income,
      expense,
      bankruptcy: { nonPositive, everNonPositive: nonPositive.length > 0, minCash: min },
      heat: { series: heatSeries, max: heatMax, tierChanges: tierChanges(heatSeries) },
      progression: {
        series: days.map(d => ({ day: d.day, rank: d.rank, trust: d.trust, gangClout: d.gangClout, clout: d.clout, rep: d.rep })),
        rank: Number(life.newOga?.rank) || 0, rankTitle: life.newOga?.title || null,
        trust: Number(life.newOga?.trust) || 0, gangClout: Number(life.newOga?.gangClout) || 0,
        streetClout: life.resources.clout, streetCloutPoints: Number(life.resources.cloutPoints) || 0,
        reputation: life.resources.vampireReputation, tendency: { ...(life.tendencies || {}) },
        newOgaStatus: life.newOga?.status || null, missions: missionLedger(life.newOga || {})
      },
      missions: {
        records: Object.fromEntries(Object.entries(records).map(([id, r]) => [id, { status: r?.status || null, count: r?.count || 0, completedDay: r?.completedDay ?? null, outcome: r?.outcome ?? null }])),
        completed: completed.map(([id]) => id).sort(),
        surfaced: [...surfaced].sort(),
        notSurfaced: neverSurfaced,
        completionEvents
      },
      relationships: { met: known.length, byLevel, people: known.map(p => ({ id: p.id, level: p.level, levelId: p.levelId, points: p.points })) },
      inventory: { items: { ...(life.ownership.items || {}) }, props: [...(life.ownership.props || [])], followers: Number(life.resources.followers) || 0 },
      assets: {
        cars: (life.ownership.cars || []).map(c => ({ id: c.id, short: c.short || c.model || null })),
        guns: (life.ownership.guns || []).map(g => ({ id: g.id })),
        rooms: (life.ownership.castleRooms || []).map(r => ({ id: r.id, price: r.price })),
        properties: (life.ownership.properties || []).filter(p => p.ownershipStatus === 'owned').map(p => ({ id: p.id, weeklyRent: p.weeklyRent || 0, rentDue: p.rentDue || 0 }))
      },
      crew,
      failures: { count: failures.length, errors: failures.filter(f => !/abandoned/.test(f.error)), abandoned: failures.filter(f => /abandoned/.test(f.error)).length, repeated: repeatedFailures, softlocks },
      unreachable: { adventures: neverSurfaced, surfacesNotDriven: notDriven },
      duplicates: { onceOnly: duplicatePayouts, historyIds: duplicateHistoryIds(history) },
      suspicious,
      ledger: {
        saturated: entries.length >= 500,
        entries: entries.length,
        sources: Object.keys(totals).sort(),
        byFamily
      },
      duration: { days: days.length, endDay: ctx.RALife.today().day, firstCompletionDay, milestones: milestones(life) },
      activity: { actions: actions.length, changed: actions.filter(a => a.changed).length, stalls: { longest: longestStall, start: longestStart } },
      actions
    };
  }

  return { seeAction, seeAdventure, recordAction, sample, finish };
}

function tierChanges(series) {
  const out = [];
  for (let i = 1; i < series.length; i++) if (series[i].tier && series[i].tier !== series[i - 1].tier) out.push({ day: series[i].day, from: series[i - 1].tier, to: series[i].tier });
  return out;
}
function duplicateHistoryIds(history) {
  const seen = new Set();
  const dupes = [];
  for (const entry of history) {
    if (!entry?.id) continue;
    if (seen.has(entry.id)) dupes.push(entry.id);
    seen.add(entry.id);
  }
  return [...new Set(dupes)];
}
function missionLedger(newOga) {
  const out = {};
  for (const [key, value] of Object.entries(newOga)) if (/^m\d/.test(key)) out[key] = value;
  return out;
}
function milestones(life) {
  return {
    m1Rewarded: !!life.newOga?.m1Rewarded,
    m3Rewarded: !!life.newOga?.m3Rewarded,
    m4Rewarded: !!life.newOga?.m4Rewarded,
    m5Completed: !!life.newOga?.m5Completed,
    m6Completed: !!life.newOga?.m6Completed,
    rank4Granted: !!life.newOga?.rank4Granted,
    m7Completed: !!life.newOga?.m7Completed,
    businessCard: !!life.newOga?.businessCard,
    lastMissionDay: Number(life.newOga?.lastMissionDay) || 0,
    clockStarted: !!life.clock?.started,
    prologueDone: !!life.world?.flags?.prologueDone
  };
}
