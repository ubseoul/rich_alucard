// F13 HOLISTIC BALANCE HARNESS — player policy model (INFRASTRUCTURE ONLY).
// A policy interface, not an assumption about optimal play. These are QA tools that exercise the accepted content
// from different angles; they are NOT canon player archetypes and they never write gameplay numbers. A policy may
// only choose from actions the catalogue marks executable/legal. Minigame and fight outcomes are SYNTHETIC (the
// real games are canvas-driven and cannot run headless); by default no synthetic rewards are injected, so the
// economy metrics only ever see rewards the accepted code grants.

// Intentional exits only. Bare `STAY` must NOT count as an exit: looping stays ("STAY LONGER" in A45, "STAY OUT HERE
// A WHILE", "STAY WITH HER", "STAY CALM…") would otherwise be picked by the cautious policies and walk the pilot
// step ceiling. Bounded safe-stay wording ("STAY HOME"/"STAY PUT"/"STAY HERE") remains a legitimate exit.
const EXIT = /LEAVE|BACK|NOT TODAY|^\s*NO\b|NAH|DECLINE|WALK AWAY|I'?M GOOD|THAT'?S ENOUGH|CANCEL|SKIP|REFUSE|DON'?T|GIVE IT BACK|NEVER MIND|BAIL|ABOUT FACE|GET OUT|STAY HOME|STAY PUT|STAY HERE/i;
const AGGRO = /FIGHT|ATTACK|PUSH|CHASE|TAKE IT|HIT|STRIKE|STEAL|GRAB|RISK|ALL IN|DO IT|RUN|HANDLE|COLLECT|HUSTLE/i;
const PROGRESS = /CONTINUE|KEEP|YES|ACCEPT|AGREE|MORE|GO|ENTER|INSIDE|TAKE THE|WORK|SHIFT|DELIVER|HANDLE|TALK|ASK/i;

const pick = (list, re, rng) => {
  const match = list.find(c => re.test(String(c.label ?? '')));
  return match || rng.pick(list);
};
const outcome = (env, winProbability, care = null) => {
  const win = env.rng.chance(winProbability);
  const result = { outcome: win ? 'win' : 'done', score: win ? 1 : 0, rewards: env.syntheticRewards ? { money: env.rng.int(200) } : {} };
  if (care) result.data = care;
  return result;
};
const escalate = (env, winProbability, spareProbability) => {
  if (env.rng.chance(winProbability)) return { outcome: 'win' };
  return { outcome: env.rng.chance(spareProbability) ? 'spared' : 'lose' };
};
const cands = actions => actions.filter(a => a.executable);
const affordable = (env, action, reserve = 0) => env.ctx.RALife.money() - action.cost >= reserve;

// Generic scorer driver: highest score above `threshold` wins, otherwise the policy goes to bed (null).
function chooseByScore(actions, env, score, threshold) {
  const list = cands(actions);
  let best = null;
  let bestScore = -Infinity;
  for (const action of list) {
    const value = score(action, env);
    if (value > bestScore) { best = action; bestScore = value; }
  }
  return bestScore > threshold ? best : null;
}

export const POLICIES = {
  conservative: makePolicy({
    id: 'conservative',
    label: 'CONSERVATIVE',
    description: 'Keeps a cash buffer, avoids risk and combat, banks rent, takes first-time low-risk routes.',
    score(action, env) {
      const money = env.ctx.RALife.money();
      if (action.kind === 'system:collect') return 6 + env.rng.next() * 0.4;
      if (action.kind === 'system:dragon') return 3 + env.rng.next() * 0.4;
      if (action.surface === 'store') return affordable(env, action, 120000) ? 1 + env.rng.next() * 0.4 : -5;
      let s = (action.firstTime ? 3 : 1) - action.risk * 1.5;
      if (action.lane === 'combat') s -= 3;
      return s + env.rng.next() * 0.4;
    },
    threshold: 0.5
  }),
  'spend-heavy': makePolicy({
    id: 'spend-heavy',
    label: 'SPEND-HEAVY',
    description: 'Converts cash into rooms, cars and property as soon as it can afford them; then plays routes.',
    score(action, env) {
      if (action.surface === 'store') return 8 + Math.min(4, action.cost / 200000) + env.rng.next() * 0.4;
      if (action.kind === 'system:collect') return 2;
      if (action.kind === 'system:dragon') return 2;
      return 3 + env.rng.next() * 0.4;
    },
    threshold: 1
  }),
  completionist: makePolicy({
    id: 'completionist',
    label: 'COMPLETIONIST',
    description: 'Pursues first-time content everywhere, then repeatables, then purchases; wants the walked outcomes.',
    completionist: true,
    score(action, env) {
      if (action.kind === 'system:collect') return 1 + env.rng.next() * 0.3;
      if (action.kind === 'system:dragon') return 1 + env.rng.next() * 0.3;
      if (action.surface === 'store') return affordable(env, action, 0) ? 2 + env.rng.next() * 0.3 : -10;
      // The morning's world-initiated beat is one-shot content; a completionist answers it first.
      if (action.kind === 'wake') return 12 + env.rng.next() * 0.4;
      return (action.firstTime ? 10 : 5) - action.risk * 0.2 + env.rng.next() * 0.4;
    },
    threshold: 1
  }),
  'low-risk': makePolicy({
    id: 'low-risk',
    label: 'LOW-RISK',
    description: 'Only risk-free routes and systems; never enters a fight or an unaffordable purchase.',
    score(action, env) {
      if (action.kind === 'system:collect') return 5 + env.rng.next() * 0.3;
      if (action.kind === 'system:dragon') return 4 + env.rng.next() * 0.3;
      if (action.surface === 'store') return affordable(env, action, 200000) ? 1 : -9;
      if (action.risk > 0) return -action.risk * 3;
      return (action.firstTime ? 6 : 4) + env.rng.next() * 0.3;
    },
    threshold: 0.5
  }),
  'high-risk': makePolicy({
    id: 'high-risk',
    label: 'HIGH-RISK',
    description: 'Seeks fights, combat lanes and high-heat routes; spends aggressively on the biggest purchases.',
    score(action, env) {
      if (action.kind === 'system:collect') return 1;
      if (action.kind === 'system:dragon') return 1;
      if (action.surface === 'store') return affordable(env, action, 0) ? 3 + action.cost / 200000 : -10;
      return 2 + action.risk * 2 + (action.lane === 'combat' ? 3 : 0) + env.rng.next() * 0.4;
    },
    threshold: 1
  }),
  randomized: makePolicy({
    id: 'randomized',
    label: 'RANDOMIZED (SEEDED)',
    description: 'Uniform choice over every legal action and every synthetic outcome; the divergence probe.',
    random: true,
    score(_action, env) { return env.rng.next(); },
    threshold: -Infinity
  })
};

function makePolicy(spec) {
  const behavior = {
    conservative: { win: 0.45, spare: 0.5, choose: (list, rng) => pick(list, EXIT, rng) },
    'spend-heavy': { win: 0.6, spare: 0.5 },
    completionist: { win: 0.65, spare: 0.6, care: { walked: true, care: { feed: true, walk: true, joko: true } }, choose: (list, rng) => pick(list, PROGRESS, rng) },
    'low-risk': { win: 0.4, spare: 0.7, choose: (list, rng) => pick(list, EXIT, rng) },
    'high-risk': { win: 0.8, spare: 0.4, choose: (list, rng) => pick(list, AGGRO, rng) },
    randomized: {}
  }[spec.id] || {};

  return {
    id: spec.id,
    label: spec.label,
    description: spec.description,
    tags: { risk: spec.id === 'high-risk' ? 'high' : spec.id === 'low-risk' || spec.id === 'conservative' ? 'low' : 'medium', random: !!spec.random },

    // Choose one legal action, or null to end the night.
    chooseAction(_ctx, actions, env) {
      if (spec.random) {
        const list = cands(actions);
        return list.length ? env.rng.pick(list) : null;
      }
      return chooseByScore(actions, env, spec.score, spec.threshold);
    },

    // Adventure choice policy. `list` is already legal (locked choices removed by the engine).
    choose(_ctx, list, env) {
      if (!list.length) return null;
      if (behavior.choose) return behavior.choose(list, env.rng) || env.rng.pick(list);
      if (spec.random) return env.rng.pick(list);
      if (spec.id === 'high-risk') return pick(list, AGGRO, env.rng);
      if (spec.id === 'conservative' || spec.id === 'low-risk') return pick(list, EXIT, env.rng);
      return env.rng.pick(list);
    },

    // Synthetic minigame result. `env.syntheticRewards` is OFF by default (no fabricated economy).
    minigame(id, _params, env) {
      if (spec.random) return { outcome: env.rng.pick(['win', 'done', 'lose']), score: env.rng.int(40000), rewards: {} };
      if (spec.id === 'low-risk') return { outcome: 'done', score: 0, rewards: {} };
      // Care/minigame data is only authored for the care minigame; other minigames resolve on outcome alone.
      const care = id === 'hatch' ? (behavior.care || null) : null;
      return outcome(env, behavior.win ?? 0.5, care);
    },

    // Synthetic fight result.
    fight(_enemy, _params, env) {
      if (spec.random) return { outcome: env.rng.pick(['win', 'spared', 'lose']) };
      if (spec.id === 'low-risk') return { outcome: 'spared' };
      return escalate(env, behavior.win ?? 0.5, behavior.spare ?? 0.5);
    }
  };
}

export const POLICY_IDS = Object.keys(POLICIES);
export function getPolicy(id) {
  const policy = POLICIES[id];
  if (!policy) throw new Error(`unknown policy ${id} (have: ${POLICY_IDS.join(', ')})`);
  return policy;
}
export function describePolicies() {
  return POLICY_IDS.map(id => ({ id, label: POLICIES[id].label, description: POLICIES[id].description, tags: POLICIES[id].tags }));
}
export { pick, EXIT, AGGRO, PROGRESS };
