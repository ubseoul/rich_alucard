// F13 HOLISTIC BALANCE HARNESS — legal action catalogue + executor (INFRASTRUCTURE ONLY).
// Every action is a thin binding to an ACCEPTED service call. The catalogue never invents content: it asks the
// real route surfaces (tools/pilot/headless.mjs `offers`, which reads RAPlaces/RATemptations/RACastle/RADating…)
// and the real stores what exists right now. An action whose surface cannot be driven headlessly is reported as
// NON_DRIVEN instead of being faked. Policies only ever see executable, currently-legal actions.
const labelOf = choice => String(choice?.label ?? '').replace(/<[^>]+>/g, '');

// Structural risk read straight from the accepted adventure graph (no invented tuning).
export function routeRisk(ctx, adventureId) {
  const def = ctx.RAAdventures?.get?.(adventureId);
  if (!def) return 0;
  let fights = 0;
  let minigames = 0;
  for (const node of Object.values(def.nodes || {})) {
    if (node?.fight) fights += 1;
    if (node?.minigame) minigames += 1;
  }
  return fights * 2 + minigames + (def.lane === 'combat' ? 2 : 0);
}

function routeAction(ctx, { kind, key, adventure, vars = {}, label = null, source = null }) {
  const available = !!adventure && !!ctx.RAAdventures?.available?.(adventure);
  const def = adventure ? ctx.RAAdventures.get(adventure) : null;
  return {
    id: `${kind}:${key}`,
    kind,
    surface: kind,
    executable: available,
    reason: available ? null : (adventure ? 'adventure not available' : 'no adventure on this surface'),
    label,
    target: adventure || null,
    vars,
    lane: def?.lane || null,
    firstTime: adventure ? !ctx.RALife.done(adventure) : false,
    cost: 0,
    risk: adventure ? routeRisk(ctx, adventure) : 0,
    heat: 0,
    priority: kind === 'wake' ? 100 : 0,
    source
  };
}

function purchaseAction(id, kind, target, { label, cost, risk = 0, executable = true, reason = null }) {
  return { id, kind, surface: 'store', executable, reason, label, target, vars: {}, lane: null, firstTime: true, cost, risk, heat: 0, priority: 0, source: 'store' };
}

// Build the day's catalogue. `offers` is pilot `offers(ctx)`. `seen` collects every surfaced adventure/surface for
// reachability metrics. Read-only against the game.
export function buildCatalog(ctx, { offers, day, seen = null } = {}) {
  const actions = [];
  const push = action => { actions.push(action); if (seen) seen.surface(action); };

  // 1) The morning's world-initiated adventure (voice note / wake trigger). Highest priority.
  try {
    const wake = ctx.RAWakeTriggers?.pick?.();
    if (wake) {
      const action = routeAction(ctx, { kind: 'wake', key: wake, adventure: wake, source: 'wake' });
      action.priority = 100;
      push(action);
      if (seen) seen.adventure(wake, 'wake');
    }
  } catch { /* wake pick is tolerant by contract */ }

  // 2) Bedroom-night surfaces (wants, places, VampGPT lanes, castle rooms, dates, party lane, phone surfaces, shops).
  let list = [];
  try { list = offers(ctx) || []; } catch (error) { list = []; }
  for (const o of list) {
    if (o.adventure) {
      const action = routeAction(ctx, { kind: o.kind, key: o.key, adventure: o.adventure, vars: o.vars || {}, label: o.label || null, source: o.kind });
      push(action);
      if (seen) seen.adventure(o.adventure, o.kind);
    } else {
      push({
        id: `${o.kind}:${o.key}`,
        kind: o.kind,
        surface: 'non-driven',
        executable: false,
        reason: o.dead ? 'dead surface (starts nothing)' : 'surface has no adventure (go-handler / UI not driven headless)',
        label: o.label || null,
        target: null, vars: {}, lane: null, firstTime: false, cost: 0, risk: 0, heat: 0, priority: 0, source: o.kind
      });
    }
  }

  const money = ctx.RALife.money();
  const L = ctx.RALife.L();

  // 3) Castle rooms (accepted store).
  for (const room of ctx.RACastle?.ROOMS || []) {
    if (ctx.RALife.hasRoom(room.id)) continue;
    let needsOk = true;
    try { needsOk = !room.needs || room.needs(L) !== false; } catch { needsOk = false; }
    const affordable = money >= room.price;
    push(purchaseAction(`buy:room:${room.id}`, 'buy:room', room.id, {
      label: `BUILD ${room.label}`, cost: room.price, risk: 0,
      executable: needsOk && affordable,
      reason: !needsOk ? 'prerequisite not met' : !affordable ? 'insufficient cash' : null
    }));
  }

  // 4) Cars (accepted store; app-gated where the accepted phone lists them).
  for (const [key, car] of Object.entries(ctx.RACars?.CATALOG || {})) {
    if (ctx.RACars.owned(key)) continue;
    const repOk = !car.needsRep || ctx.RALife.rep() >= car.needsRep;
    const appOk = car.store === 'richboi' ? !!ctx.RALife.appUnlocked('richboi') : true;
    const affordable = money >= car.price;
    push(purchaseAction(`buy:car:${key}`, 'buy:car', key, {
      label: `BUY ${car.short}`, cost: car.price, risk: 0,
      executable: repOk && appOk && affordable,
      reason: !repOk ? 'reputation gate' : !appOk ? 'store app not unlocked' : !affordable ? 'insufficient cash' : null
    }));
  }

  // 5) Property (accepted RealMoneyRealEstate lane; Shannon gate + 30% down like the shipped button).
  if (ctx.RARealEstate?.shannonLane?.()) {
    for (const listing of ctx.RARealEstate.LISTINGS || []) {
      const owned = (L.life.ownership.properties || []).some(p => p.id === listing.id && p.ownershipStatus === 'owned');
      if (owned) continue;
      const down = Math.round(listing.price * 0.3);
      push(purchaseAction(`buy:property:${listing.id}`, 'buy:property', listing.id, {
        label: `SEE ${listing.label} (${listing.hood})`, cost: down, risk: 0,
        executable: money >= down,
        reason: money >= down ? null : 'insufficient cash for down payment'
      }));
    }
  }

  // 6) Rent collection (accepted service).
  const due = (L.life.ownership.properties || []).filter(p => p.ownershipStatus === 'owned' && (p.rentDue || 0) > 0);
  if (due.length) {
    push({ id: `system:collect-rent:${day}`, kind: 'system:collect', surface: 'system', executable: true, reason: null,
      label: 'COLLECT RENT', target: null, vars: {}, lane: null, firstTime: false, cost: 0, risk: 0, heat: 0, priority: 0, source: 'system' });
  }

  // 7) Dragon care (accepted HATCH reward path — same call tools/pilot/coverage-sim.mjs makes).
  const dragon = ctx.RALife.dragon?.();
  if (dragon) {
    push({ id: `system:dragon-care:${day}`, kind: 'system:dragon', surface: 'system', executable: true, reason: null,
      label: 'CARE FOR THE DRAGON', target: null, vars: {}, lane: null, firstTime: false, cost: 0, risk: 0, heat: 0, priority: 0, source: 'system' });
  }

  return actions;
}

// Execute one catalogue action through accepted services only. Returns {ok, changed, nightEnded, abandoned, error}.
export function executeAction(ctx, action, env) {
  const base = { ok: false, changed: false, nightEnded: false, abandoned: false, error: null };
  try {
    switch (action.kind) {
      case 'wake':
      case 'want':
      case 'place':
      case 'castle':
      case 'date':
      case 'party-lane':
      case 'phone:touge':
      case 'phone:realestate':
      case 'lane:money':
      case 'lane:people': {
        if (!action.target || !ctx.RAAdventures.available(action.target)) return { ...base, error: 'target unavailable at execution' };
        const { drive, driveChain } = env.pilot;
        const rng = env.rng;
        const choose = (choices, meta) => env.policy.choose(ctx, choices, { ...meta, action, rng });
        // Synthesized outcomes draw from the live run stream so repeated visits to a node can resolve differently
        // (still fully deterministic for a given seed).
        const minigame = (id, params) => env.policy.minigame(id, params, { ctx, action, rng });
        const fight = (enemy, params) => env.policy.fight(enemy, params, { ctx, action, rng });
        const result = drive(ctx, action.target, { vars: action.vars, choose, minigame, fight, from: action.kind });
        const chain = driveChain(ctx, result, { choose, minigame, fight });
        const abandoned = chain.some(r => r?.abandoned);
        const nightEnded = chain.some(r => !!r?.nightEnder);
        // A chain that hit the hard depth cap is reported as a failure, never a silent success.
        const chainError = chain.find(r => r && r.chainError) || chain.chainError || null;
        if (ctx.RAAdventures.active()) ctx.RAAdventures.abandon();
        return {
          ...base, ok: !chainError, changed: true, abandoned, nightEnded,
          error: chainError ? chainError.message : null,
          chainError: chainError || null,
          results: chain.map(r => r && { id: r.id, outcome: r.outcome || null, abandoned: !!r.abandoned, nightEnder: !!r.nightEnder, chain: r.chain || null, chainError: r.chainError || null })
        };
      }
      case 'buy:room': {
        const ok = ctx.RACastle.buy(action.target); return { ...base, ok, changed: ok, error: ok ? null : 'buys failed' };
      }
      case 'buy:car': {
        const ok = ctx.RACars.buy(action.target); return { ...base, ok, changed: ok, error: ok ? null : 'buy failed' };
      }
      case 'buy:property': {
        const ok = ctx.RARealEstate.buy(action.target, { down: true }); return { ...base, ok, changed: ok, error: ok ? null : 'buy failed' };
      }
      case 'system:collect': {
        const collected = ctx.RARealEstate.collectAll(); return { ...base, ok: true, changed: collected > 0, detail: { collected } };
      }
      case 'system:dragon': {
        const dragon = ctx.RALife.dragon();
        if (!dragon) return { ...base, error: 'no dragon' };
        const foods = ctx.RALife.count('fish_common') ? 'fish_common' : 'treats';
        const actions = dragon.stage === 'egg' ? [{ type: 'keepWarm' }] : [{ type: 'feed', food: foods }, { type: 'play' }];
        ctx.RALifeRewards.apply({ rewards: { dragonActions: actions } });
        return { ...base, ok: true, changed: true, detail: { actions } };
      }
      default:
        return { ...base, error: `unknown action kind ${action.kind}` };
    }
  } catch (error) {
    try { ctx.RAAdventures.abandon?.(); } catch { /* ignore */ }
    return { ...base, error: String(error?.message || error).slice(0, 300) };
  }
}

export { labelOf };
