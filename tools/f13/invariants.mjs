// F13 HOLISTIC BALANCE HARNESS — reusable invariant checks (INFRASTRUCTURE ONLY).
// Bounds come from contracts.mjs (accepted source), not invented caps. Each check is a pure read of the loaded
// context plus the run bookkeeping; none of them mutate state.
import { heatContract, rankBounds, trustBounds } from './contracts.mjs';

export function makeInvariants(ctx, run = {}) {
  const rank = rankBounds(ctx);
  const trust = trustBounds(ctx);
  const heat = heatContract(ctx);
  const save = ctx.RAState.get();
  const life = save.life;
  const fragNamespaces = save.frag && typeof save.frag === 'object' ? Object.keys(save.frag).sort() : [];
  const allowNamespaces = ['if1', ...(run.integratedFragments || [])];
  const newOga = life.newOga || {};

  const checks = [
    {
      id: 'money-finite',
      description: 'cash is always a finite number',
      check: () => {
        const money = ctx.RALife.money();
        return { ok: Number.isFinite(money), detail: { money } };
      }
    },
    {
      id: 'rank-legal',
      description: `rank is an integer inside the source-derived ladder ${JSON.stringify(rank.legal)}`,
      check: () => {
        const value = Number(newOga.rank) || 0;
        const ok = Number.isInteger(value) && value >= rank.min && value <= rank.max;
        return { ok, detail: { rank: value, bounds: rank } };
      }
    },
    {
      id: 'trust-bounds',
      description: `trust stays within the sum of authored deltas [${trust.min}, ${trust.max}]`,
      check: () => {
        const value = Number(newOga.trust) || 0;
        return { ok: Number.isFinite(value) && value >= trust.min && value <= trust.max, detail: { trust: value, bounds: trust } };
      }
    },
    {
      id: 'heat-contract',
      description: 'HEAT is finite and non-negative; tier floors strictly increase',
      check: () => {
        const value = ctx.RAHeat?.global?.() ?? (Number(newOga.heat) || 0);
        return { ok: Number.isFinite(value) && value >= 0 && heat.increasing, detail: { value, contract: heat } };
      }
    },
    {
      id: 'new-oga-guards',
      description: 'once-only NEW OGA reward guards are mutually consistent',
      check: () => {
        const problems = [];
        if (newOga.m1Rewarded && !newOga.m1Route) problems.push('m1Rewarded without m1Route');
        if (newOga.m3Rewarded && newOga.m3Outcome !== 'complete') problems.push('m3Rewarded without complete outcome');
        if (newOga.m4Rewarded && newOga.m4Outcome !== 'walk_in') problems.push('m4Rewarded without walk_in outcome');
        if (newOga.alternativeCompleted && !newOga.alternativeRewarded) problems.push('alternativeCompleted without reward');
        if (newOga.rank4Granted && !(newOga.m5Completed && newOga.m6Completed)) problems.push('rank4Granted before M5+M6');
        if (newOga.m7Completed && !newOga.m7ConsequencesApplied) problems.push('m7Completed without consequences flag');
        if (newOga.senatorCommands && newOga.senatorLost) problems.push('senatorCommands with senatorLost');
        return { ok: problems.length === 0, detail: { problems } };
      }
    },
    {
      id: 'terminal-gone',
      description: 'a GONE crew unit never becomes anything else (history is ordered)',
      check: () => {
        const problems = [];
        for (const unit of ctx.RACrew?.list?.() || []) {
          let gone = false;
          for (const step of unit.history || []) {
            if (gone && step.status !== 'GONE') { problems.push(`${unit.id} left GONE at day ${step.day}`); break; }
            if (step.status === 'GONE') gone = true;
          }
        }
        return { ok: problems.length === 0, detail: { problems } };
      }
    },
    {
      id: 'unavailable-content-not-selected',
      description: 'no executed action was illegal at selection time; no fragment surface ran while its flag was OFF',
      check: () => {
        const bad = (run.executedActions || []).filter(a => !a.legalAtSelection);
        const flagged = (run.executedActions || []).filter(a => a.flag && a.flagOn === false);
        return { ok: bad.length === 0 && flagged.length === 0, detail: { bad: bad.map(a => a.id), flagged: flagged.map(a => a.id) } };
      }
    },
    {
      id: 'no-infinite-action-loop',
      description: 'a day never exceeds the harness daily action cap (this checks only the harness per-day cap; internal adventure loops are bounded separately by the drive() step ceiling, the driveChain chain-depth guard, and the repeated-failure metrics)',
      check: () => ({ ok: (run.maxActionsObserved || 0) <= (run.maxActionsPerDay || 0), detail: { observed: run.maxActionsObserved, cap: run.maxActionsPerDay } })
    },
    {
      id: 'no-duplicate-once-only-payout',
      description: 'no NEW OGA once-only payout was recorded more than once',
      check: () => {
        const dupes = run.metrics?.duplicates?.onceOnly || [];
        return { ok: dupes.length === 0, detail: { dupes } };
      }
    },
    {
      id: 'history-ids-unique',
      description: 'event history has no duplicate ids (the accepted recordEvent contract)',
      check: () => {
        const dupes = run.metrics?.duplicates?.historyIds || [];
        return { ok: dupes.length === 0, detail: { dupes } };
      }
    },
    {
      id: 'feature-off-no-fragment-progression',
      description: 'with every fragment flag OFF there is no per-fragment save namespace',
      check: () => {
        if (!run.allFragmentsOff) return { ok: true, detail: { skipped: 'a fragment flag was force-enabled by configuration' } };
        const unexpected = fragNamespaces.filter(ns => ns !== 'if1');
        return { ok: unexpected.length === 0, detail: { namespaces: fragNamespaces, unexpected } };
      }
    },
    {
      id: 'save-namespace-allowlist',
      description: 'only known namespaces (if1 + integrated fragments) exist in the save',
      check: () => {
        const unexpected = fragNamespaces.filter(ns => !allowNamespaces.includes(ns));
        return { ok: unexpected.length === 0, detail: { namespaces: fragNamespaces, allowNamespaces, unexpected } };
      }
    },
    {
      id: 'ledger-conservation',
      description: 'the accepted money ledger reconciles: sum(net deltas) equals cash change',
      check: () => {
        if (!ctx.RAMoneyLedger || run.initialMoney == null) return { ok: true, detail: { skipped: 'ledger unavailable' } };
        const totals = ctx.RAMoneyLedger.totals();
        const net = Object.values(totals).reduce((sum, t) => sum + (Number(t.net) || 0), 0);
        const actual = ctx.RALife.money() - run.initialMoney;
        return { ok: net === actual, detail: { ledgerNet: net, cashChange: actual } };
      }
    }
  ];

  return checks;
}

export function runInvariants(ctx, run = {}) {
  const checks = makeInvariants(ctx, run);
  const failures = [];
  for (const check of checks) {
    try {
      const result = check.check();
      if (result && result.ok === false) failures.push({ id: check.id, description: check.description, detail: result.detail });
    } catch (error) {
      failures.push({ id: check.id, description: check.description, error: String(error?.message || error) });
    }
  }
  return { checked: checks.length, failures };
}
