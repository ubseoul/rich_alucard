(function (global) {
 'use strict';
 // Additive, data-driven encounter UI. Parent owns story, saves, retry resets and rewards.
 // Mechanical state is committed before presentation. Each contact has a persisted cursor.
 const VERSION = 1;
 const clone = value => JSON.parse(JSON.stringify(value));
 const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
 const number = (value, fallback) => Number.isFinite(Number(value)) ? Number(value) : fallback;
 const positive = (value, fallback) => Math.max(1, Math.round(number(value, fallback)));
 const DEFAULT_ASSETS = Object.freeze({
  playerIdle: 'assets/rich_standing_right.png', playerHit: 'assets/rich_standing_right.png',
  grandma: 'assets/build4/p_d/fl_a07_auntie_grit_standing_80x96.png',
  cockroach: 'assets/f15/characters/spirit_of_uncle_bunmi_444x222.png',
  chancla: 'assets/f01/feel_lock/FL-A08/slipper_24x24.png',
  launcher: 'assets/before_the_fame/art_ship_014/package_e/E-gun-the_rpg-held.png',
  crackFrames: [1, 2, 3].map(i => `assets/revenge_target_crack_0${i}.png`)
 });
 function normalize(input = {}) {
  const enemy = input.encounter || input.enemy || {}, type = input.type || input.kind || 'grandma';
  if (!['grandma', 'cockroach'].includes(type)) throw new Error('Unsupported encounter type');
  const player = input.player || {}, registry = global.RACombatData?.MOVES || {};
  let equipped = player.moves;
  if (!equipped) {
   try { equipped = global.RACombat2Rules?.loadout?.().moves; } catch (_) {}
   equipped = equipped || ['blood', 'octopus', 'bite', 'revenge'];
  }
  const defaults = { blood: { label: 'BLOOD BATH', base: 26, pp: 8 }, octopus: { label: 'OCTOPUS BRAIN', base: 18, pp: 8 }, bite: { label: 'VAMPIRE BITE', base: 24, pp: 8, heal: 18 }, revenge: { label: 'REVENGE', base: 0, pp: 8 } };
  const moves = equipped.slice(0, 4).map((spec, i) => {
   const id = typeof spec === 'string' ? spec : spec.id || `move${i}`;
   const src = typeof spec === 'string' ? registry[id] || defaults[id] || {} : spec;
   return { id, label: src.label || src.name || id.toUpperCase(), base: Math.max(0, number(src.base ?? src.damage, 18)), pp: positive(src.pp, 8), heal: Math.max(0, number(src.heal, 0)), effect: clone(src.effect || {}), assets: clone(src.assets || {}) };
  });
  if (!moves.length) throw new Error('Encounter needs at least one player move');
  const enemyMoves = type === 'grandma' ? {
   chancla: { label: 'LA CHANCLA', dmg: 22 }, rpg: { label: 'RPG', dmg: 42 }, recover: { label: 'RECOVERY', dmg: 0 }
  } : { antenna: { label: 'ANTENNA THING', dmg: 8 }, scuttle: { label: 'SCUTTLE', dmg: 12 }, stare: { label: 'THE STARE', dmg: 0 }, flies: { label: 'FLIES', dmg: 18 } };
  for (const [id, move] of Object.entries(enemy.moves || {})) enemyMoves[id] = { ...enemyMoves[id], ...move };
  const assets = { ...DEFAULT_ASSETS, ...input.assets };
  const enemyAssets = { idle: assets[type], ...enemy.assets };
  return {
   type, id: String(input.encounterId || enemy.id || `bloodx-${type}`), seed: String(input.seed || 'bloodx'), attemptId: input.attemptId,
   player: { name: player.name || 'RICH ALUCARD', maxHp: positive(player.maxHp ?? player.maxHP ?? player.hp, 100), hp: positive(player.hp ?? player.maxHp ?? player.maxHP, 100), moves },
   enemy: { name: enemy.name || 'OPPONENT', hp: positive(enemy.hp, type === 'grandma' ? 168 : 104), moves: enemyMoves, assets: enemyAssets, prototypeArt: enemyAssets.prototype ?? (type === 'grandma' && enemyAssets.idle === DEFAULT_ASSETS.grandma), dialogue: enemy.dialogue || {}, pattern: enemy.pattern || (type === 'cockroach' ? ['antenna', 'scuttle', 'stare', 'flies'] : null) },
   assets, labels: input.labels || {}, timingScale: clamp(number(input.timingScale, 1), .01, 5), reducedMotion: input.reducedMotion ?? global.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
   save: input.saveProgress || input.save || (async () => {}), signal: input.signal
  };
 }
 function intent(state, config) {
  let id;
  if (state.type === 'grandma') id = state.phase === 1 ? 'chancla' : ['rpg', 'recover', 'chancla'][state.enemyStep % 3];
  else id = config.enemy.pattern[state.enemyStep % config.enemy.pattern.length];
  const move = config.enemy.moves[id] || { label: id.toUpperCase(), dmg: 0 };
  return { id, ...clone(move), dmg: Math.max(0, Math.round(number(move.dmg ?? move.damage, 0))) };
 }
 function create(config) {
  return {
   version: VERSION, encounterId: config.id, type: config.type, seed: config.seed,
   attemptId: config.attemptId || `${config.id}:${config.seed}`, turn: 1, actionSerial: 0,
   phase: 1, enemyStep: 0, playerHp: Math.min(config.player.hp, config.player.maxHp), playerMax: config.player.maxHp,
   enemyHp: config.enemy.hp, enemyMax: config.enemy.hp, revenge: 0, shield: 0, weaken: 0, dot: [], stun: 0,
   pp: Object.fromEntries(config.player.moves.map(move => [move.id, move.pp])), landedHits: 0,
   status: 'ready', outcome: null, delivered: false, deliveredOutcome: null, pending: null,
   shown: { player: Math.min(config.player.hp, config.player.maxHp), enemy: config.enemy.hp }, contacts: []
  };
 }
 function restore(raw, config) {
  if (!raw) return create(config);
  if (raw.version !== VERSION || raw.encounterId !== config.id || raw.type !== config.type) throw new Error('Encounter snapshot does not match this encounter');
  const state = clone(raw);
  if (!state.pp || !state.attemptId || !Number.isFinite(state.playerHp) || !Number.isFinite(state.enemyHp)) throw new Error('Invalid encounter snapshot');
  return state;
 }
 function act(raw, action, config) {
  const state = clone(raw);
  if (state.status !== 'ready' || state.outcome) return state;
  const move = action.type === 'move' && config.player.moves.find(m => m.id === action.id);
  if (action.type !== 'guard' && (!move || state.pp[move.id] <= 0)) return state;
  const announced = intent(state, config), events = [], serial = ++state.actionSerial;
  const add = (kind, data = {}) => events.push({ kind, ...data, hp: { player: state.playerHp, enemy: state.enemyHp } });
  function damage(target, amount, fx, source) {
   amount = Math.max(0, Math.round(amount));
   const key = target === 'enemy' ? 'enemyHp' : 'playerHp', actual = Math.min(state[key], amount);
   state[key] -= actual;
   if (target === 'player') state.revenge += actual;
   if (target === 'enemy' && actual > 0 && source === 'player') state.landedHits++;
   add('contact', { target, amount: actual, fx, source, contactId: `${state.attemptId}:${serial}:${events.length}` });
   return actual;
  }
  const guard = action.type === 'guard';
  if (guard) add('guard');
  else {
   state.pp[move.id]--;
   add('player', { move: move.id, label: move.label });
   let amount = move.id === 'revenge' ? state.revenge : move.base;
   if (move.id === 'revenge') state.revenge = 0;
   if (amount > 0) damage('enemy', amount, move.id, 'player');
   if (move.heal && state.playerHp < state.playerMax) { const healed = Math.min(move.heal, state.playerMax - state.playerHp); state.playerHp += healed; add('heal', { amount: healed }); }
   const effect = move.effect || {};
   if (effect.block) state.shield += Number(effect.block);
   if (effect.weaken) state.weaken = positive(effect.turns, 3);
   if (effect.dot) state.dot.push({ amount: Math.max(0, Number(effect.dot)), turns: positive(effect.turns, 3) });
   if (effect.stun) state.stun = Math.max(state.stun, Number(effect.stun));
  }
  if (state.type === 'grandma' && state.phase === 1 && state.landedHits > 0) {
   state.phase = 2; state.enemyStep = 0; add('phase', { phase: 2 });
  }
  for (const dot of state.dot) { if (state.enemyHp > 0) damage('enemy', dot.amount, 'seance', 'effect'); dot.turns--; }
  state.dot = state.dot.filter(dot => dot.turns > 0);
  if (state.enemyHp <= 0) { state.outcome = 'win'; add('end', { outcome: 'win' }); }
  else {
   add('enemy', { move: announced.id, label: announced.label });
   let amount = announced.dmg;
   if (state.stun > 0) { state.stun--; amount = 0; add('blocked', { reason: 'stun' }); }
   else if (amount > 0 && state.shield > 0) { state.shield--; amount = 0; add('blocked', { reason: 'shield' }); }
   else if (amount > 0) {
    if (guard) amount *= .25;
    if (state.weaken > 0) amount *= .75;
   }
   if (amount > 0) damage('player', amount, announced.id, 'enemy');
   else if (announced.id === 'recover') add('recovery');
   if (state.weaken > 0) state.weaken--;
   // A phase change never replaces the move the player was already shown.
   if (!(state.type === 'grandma' && announced.id === 'chancla' && state.enemyStep === 0 && events.some(e => e.kind === 'phase'))) state.enemyStep++;
   if (state.playerHp <= 0) { state.outcome = 'lose'; add('end', { outcome: 'lose' }); }
  }
  state.turn++;
  state.status = 'presenting';
  state.pending = { events, cursor: 0 };
  return state;
 }
 function acknowledge(raw) {
  const state = clone(raw), pending = state.pending, event = pending?.events[pending.cursor];
  if (!event) return state;
  if (event.kind === 'contact' && !state.contacts.includes(event.contactId)) state.contacts.push(event.contactId);
  state.shown = clone(event.hp);
  pending.cursor++;
  return state;
 }
 function completePresentation(raw) {
  const state = clone(raw);
  if (state.pending && state.pending.cursor < state.pending.events.length) return state;
  state.pending = null; state.status = state.outcome ? 'results' : 'ready';
  state.shown = { player: state.playerHp, enemy: state.enemyHp };
  return state;
 }
 const CSS = `
 .bx-encounter{position:relative!important;inset:auto!important;width:100%;min-height:480px;height:100%;overflow:hidden;background:#17131e;color:#f6efd9;font:8px/1.35 var(--font-system,monospace);box-sizing:border-box;isolation:isolate;touch-action:manipulation}
 .bx-encounter *{box-sizing:border-box}.bx-encounter .bx-world{position:absolute;inset:0 0 44%;overflow:hidden;background:linear-gradient(#242032,#393044 76%,#29222d 76%)}
 .bx-encounter .bx-background{width:100%;height:100%;object-fit:cover;object-position:50% 100%;position:absolute;inset:0;image-rendering:pixelated;opacity:1}
 .bx-encounter .bx-actor{position:absolute;bottom:12%;width:27%;height:40%;object-fit:contain;image-rendering:pixelated;pointer-events:none}.bx-encounter .bx-rich{left:9%}.bx-encounter .bx-enemy{right:7%}.bx-encounter[data-type=cockroach] .bx-enemy{width:39%;height:36%;right:3%;bottom:11%}
 .bx-encounter .bx-hud{position:absolute;top:8px;left:8px;right:8px;display:grid;grid-template-columns:1fr 1fr;gap:10px;z-index:4;font-size:8px;line-height:1.3}
 .bx-encounter .bx-hp{padding:7px;background:#17131eee;border:1px solid #d6af62;min-width:0}.bx-encounter .bx-hp b{display:block;overflow-wrap:anywhere}.bx-encounter .bx-hp i{display:block;height:7px;background:#4b374e;margin:5px 0}.bx-encounter .bx-hp em{display:block;height:100%;background:#ae2446;transition:width .16s linear}.bx-encounter .bx-hp strong{font-weight:normal}
 .bx-encounter .bx-telegraph{position:absolute;top:30%;left:4%;right:4%;padding:6px;background:#17131ef2;border:2px solid #d6af62;z-index:5;text-align:center;white-space:pre-line;font-size:8px;line-height:1.35}
 .bx-encounter .bx-panel{position:absolute;bottom:0;left:0;right:0;height:44%;overflow:auto;background:#17131e;padding:8px;border-top:2px solid #d6af62;z-index:7}.bx-encounter .bx-log{font-size:8px;line-height:1.35;min-height:3.2em;white-space:pre-line;margin-bottom:6px;overflow-wrap:anywhere}
 .bx-encounter .bx-menu{display:grid;grid-template-columns:1fr 1fr;gap:6px}.bx-encounter button{font:8px/1.35 var(--font-system,monospace);min-height:44px;padding:6px;border:2px solid #c6ae84;background:#f6efd9;color:#17131e;cursor:pointer;touch-action:manipulation;overflow-wrap:anywhere}.bx-encounter button:focus-visible{outline:3px solid #72b58a;outline-offset:2px}.bx-encounter button:disabled{opacity:.4;cursor:default}.bx-encounter button small{display:block;font-size:6px}.bx-encounter .bx-secondary{background:#302338;color:#f6efd9}.bx-encounter .bx-help{font-size:6px;line-height:1.35;color:#d6af62;margin-top:6px}.bx-encounter .bx-fx{position:absolute;inset:0;z-index:6;pointer-events:none;image-rendering:pixelated}.bx-encounter .bx-prop{position:absolute;pointer-events:none;image-rendering:pixelated;object-fit:contain;z-index:5}.bx-encounter .bx-contact{filter:brightness(1.8)}
 .bx-encounter .bx-number{position:absolute;z-index:7;color:#f6efd9;font-size:22px;left:20%;top:55%;text-shadow:2px 2px #17131e}.bx-encounter .bx-number.enemy{left:72%}.bx-encounter .bx-shake{animation:bx-shake .18s steps(3,end)}@keyframes bx-shake{33%{translate:3px -2px}66%{translate:-3px 1px}}
 .bx-encounter .bx-prototype{position:absolute;bottom:3%;left:4%;right:4%;color:#d6af62;font-size:9px;text-align:center;z-index:5}.bx-encounter .bx-error{color:#ffadbb}.bx-encounter.bx-reduced .bx-hp em{transition:none}.bx-encounter.bx-reduced .bx-shake{animation:none}
 @media(max-height:550px){.bx-encounter .bx-panel{padding:6px}}
 @media(prefers-reduced-motion:reduce){.bx-encounter .bx-shake{animation:none}.bx-encounter .bx-hp em{transition:none}}
 `;
 let active = null;
 function mount(input = {}) {
  let config, state;
  try {
   config = normalize(input);
   config.attemptId = config.attemptId || global.crypto?.randomUUID?.() || `${config.id}:${Date.now()}:${Math.random().toString(36).slice(2)}`;
   state = restore(input.state || input.snapshot, config);
  } catch (error) { return Promise.resolve({ outcome: 'error', error: error.message, state: input.state || input.snapshot || null }); }
  const result = (outcome, replayed = false) => ({ outcome, state: clone(state), snapshot: clone(state), encounterId: config.id, attemptId: state.attemptId, turns: state.turn - 1, replayed });
  if (state.delivered) return Promise.resolve(result(state.deliveredOutcome || state.outcome, true));
  if (config.signal?.aborted) return Promise.resolve(result('interrupted'));
  active?.dispose();
  const host = input.root || global.document?.querySelector('#screen');
  if (!host) return Promise.resolve({ ...result('error'), error: 'No encounter host' });
  const doc = host.ownerDocument, root = doc.createElement('section');
  root.className = `bx-encounter${config.reducedMotion ? ' bx-reduced' : ''}`; root.dataset.type = config.type;
  root.setAttribute('aria-label', config.enemy.name); root.tabIndex = -1;
  root.innerHTML = `<style>${CSS}</style><div class="bx-world"><img class="bx-background" alt="" hidden><img class="bx-actor bx-rich c2-rich" alt=""><img class="bx-actor bx-enemy c2-enemy" alt=""><div class="bx-hud"><div class="bx-hp bx-player-hp"><b></b><i><em></em></i><strong></strong></div><div class="bx-hp bx-enemy-hp"><b></b><i><em></em></i><strong></strong></div></div><div class="bx-telegraph"></div></div><div class="bx-panel"><div class="bx-log" role="status" aria-live="polite"></div><div class="bx-menu"></div><div class="bx-help"></div></div>`;
  const $ = selector => root.querySelector(selector), world = $('.bx-world'), rich = $('.bx-rich'), enemy = $('.bx-enemy');
  rich.src = config.assets.playerIdle; enemy.src = config.enemy.assets.idle;
  if (config.assets.background) { $('.bx-background').src = config.assets.background; $('.bx-background').hidden = false; }
  $('.bx-player-hp b').textContent = config.player.name; $('.bx-enemy-hp b').textContent = config.enemy.name;
  $('.bx-help').textContent = config.labels.controls || `1–4 moves · G guard · Esc quit. Guard cuts the next hit by 75%.${config.type === 'grandma' ? ' RPG leaves a recovery turn.' : ''}`;
  if (config.enemy.prototypeArt) { const badge = doc.createElement('div'); badge.className = 'bx-prototype'; badge.textContent = config.labels.prototypeArt || 'PROTOTYPE ACTOR ART'; world.append(badge); }
  host.append(root); root.focus({ preventScroll: true });
  let resolve, closed = false, closing = false, busy = true, saveQueue = Promise.resolve(), effectOwner = 0, committedState = clone(state), touchPress = null, suppressTouchClick = null, currentEnemyMove = null;
  const timers = new Map(), effects = new Set();
  // Use the shipped combat recordings; never queue a locked/muted cue for later playback.
  const moveSound = id => global.RACombatPixelFX?.MOVES?.[id]?.sound || ({ blood: 'MOVE_BLOODBATH', bite: 'MOVE_BITE', octopus: 'MOVE_OCTOPUS', revenge: 'MOVE_REVENGE' })[id];
  const audioIds = ['BATTLE_START', 'TELEGRAPH', 'HIT_LIGHT', 'HIT_HEAVY', 'KO', 'VICTORY', 'DEFEAT', 'GUN_RPG', 'BUFF', 'HEAL', 'EN_SHIELD', ...config.player.moves.map(move => moveSound(move.id))].filter(id => id && global.RAAudioManifest?.get?.(id)?.registered);
  global.RAAudio?.preloadScene?.([...new Set(audioIds)])?.catch?.(() => {});
  async function sound(id) {
   const audio = global.RAAudio, owner = effectOwner;
   const live = () => !closed && !closing && root.isConnected && owner === effectOwner && audio?.isUnlocked?.() && !audio.settings?.().muted;
   if (!id || !live()) return false;
   try { await audio.preload(id); return live() ? audio.sfx(id) : false; } catch (_) { return false; }
  }
  const warmImages = [];
  const warm = value => { if (typeof value === 'string' && /\.png(?:[?#].*)?$/i.test(value)) { const image = new global.Image(); image.src = value; warmImages.push(image); } else if (value && typeof value === 'object') Object.values(value).forEach(warm); };
  warm(config.assets); warm(config.enemy.assets); warm(global.RAArtRegistry?.combatMoves);
  const promise = new Promise(done => { resolve = done; });
  function persist(reason) {
   const checkpoint = clone(state);
   saveQueue = saveQueue.then(async () => { const saved = await config.save(checkpoint, { reason, encounterId: config.id, attemptId: checkpoint.attemptId }); if (saved === false || saved?.ok === false) throw new Error('Encounter save was rejected'); committedState = clone(checkpoint); });
   return saveQueue;
  }
  function wait(ms) { if (closed || closing) return Promise.resolve(); return new Promise(done => { const id = global.setTimeout(() => { timers.delete(id); done(); }, ms * config.timingScale); timers.set(id, done); }); }
  function cleanupFX(resetActors = true) { effectOwner++; for (const node of effects) node.remove(); effects.clear(); rich.classList.remove('bx-contact'); enemy.classList.remove('bx-contact'); world.classList.remove('bx-shake'); if (resetActors) { rich.src = config.assets.playerIdle; enemy.src = config.enemy.assets.idle; } }
  function cleanup() {
   if (closed) return; closed = true; cleanupFX();
   for (const [id, done] of timers) { global.clearTimeout(id); done(); } timers.clear();
   root.removeEventListener('click', click); root.removeEventListener('pointerdown', touchDown); root.removeEventListener('pointermove', touchMove); root.removeEventListener('pointerup', touchUp); root.removeEventListener('pointercancel', touchCancel); touchPress = null; suppressTouchClick = null; warmImages.length = 0; global.removeEventListener('keydown', key);
   doc.removeEventListener('visibilitychange', visibility); config.signal?.removeEventListener('abort', abort);
   root.dispatchEvent(new Event('c2:close')); root.remove(); if (active?.root === root) active = null;
  }
  async function fail(error) { if (closed) return; state = clone(committedState); const out = { ...result('error'), error: error?.message || 'Encounter save failed' }; cleanup(); resolve(out); }
  async function settle(outcome) {
   if (closed || closing) return; closing = true; busy = true;
   if (outcome !== 'interrupted' && outcome !== 'quit') { state.delivered = true; state.deliveredOutcome = outcome; state.status = 'complete'; }
   try { await persist(outcome === 'interrupted' ? 'interrupt' : outcome === 'quit' ? 'quit' : 'deliver'); if (closed) return; const out = result(outcome); cleanup(); resolve(out); } catch (error) { fail(error); }
  }
  const abort = () => settle('interrupted');
  function visibility() { if (doc.hidden) cleanupFX(); }
  function hud() {
   for (const [role, hp, max] of [['player', state.shown.player, state.playerMax], ['enemy', state.shown.enemy, state.enemyMax]]) {
    $(`.bx-${role}-hp em`).style.width = `${Math.max(0, hp / max * 100)}%`; $(`.bx-${role}-hp strong`).textContent = `${hp}/${max}`;
   }
   root.dataset.phase = String(state.phase); root.dataset.status = state.status; root.dataset.turn = String(state.turn); root.dataset.landedHits = String(state.landedHits);
   const next = intent(state, config), detail = next.telegraph || (next.dmg > 0 ? `${next.label} · ${next.dmg} DAMAGE` : `${next.label} · OPENING`);
   $('.bx-telegraph').textContent = state.outcome ? '' : `${config.labels.next || 'NEXT'}: ${detail}`;
   $('.bx-telegraph').hidden = !!state.outcome;
  }
  function button(text, action, secondary = false, disabled = false, detail = '') {
   const el = doc.createElement('button'); el.type = 'button'; el.dataset.bxAction = action; el.className = secondary ? 'bx-secondary' : ''; el.disabled = disabled; el.append(doc.createTextNode(text));
   if (detail) { const small = doc.createElement('small'); small.textContent = detail; el.append(small); }
   $('.bx-menu').append(el);
  }
  function menu() {
   $('.bx-menu').replaceChildren(); hud();
   if (state.status === 'results') {
    if (state.outcome === 'win' && config.enemy.assets.defeated) enemy.src = config.enemy.assets.defeated;
    $('.bx-log').textContent = config.enemy.dialogue[state.outcome] || (state.outcome === 'win' ? config.labels.win || 'VICTORY' : config.labels.lose || 'DEFEAT');
    if (state.outcome === 'win') button(config.labels.continue || 'CONTINUE', 'continue');
    else { button(config.labels.retry || 'RETRY', 'retry'); button(config.labels.leave || 'LEAVE', 'leave', true); }
    return;
   }
   if (busy) { button(config.labels.quit || 'QUIT', 'quit', true); return; }
   config.player.moves.forEach((move, index) => button(`${index + 1} · ${move.label}`, `move:${move.id}`, false, state.pp[move.id] <= 0, `${state.pp[move.id]}/${move.pp} PP${move.id === 'revenge' ? ` · ${state.revenge} STORED` : move.base ? ` · ${move.base} DAMAGE` : ''}`));
   button(config.labels.guard || 'G · GUARD', 'guard', true, false, config.labels.guardDetail || '75% LESS DAMAGE'); button(config.labels.quit || 'QUIT', 'quit', true);
  }
  function prop(src, x, y, w, h) {
   const img = doc.createElement('img'); img.className = 'bx-prop'; img.alt = ''; img.src = src;
   Object.assign(img.style, { left: `${x / 270 * 100}%`, top: `${y / 300 * 100}%`, width: `${w / 270 * 100}%`, height: `${h / 300 * 100}%` }); world.append(img); effects.add(img); return img;
  }
  const fxCell = config.assets.fxCell || [64, 64], fxAnchor = config.assets.fxAnchor || [fxCell[0] / 2, fxCell[1] / 2];
  function authoredProp(src, x, y) { return prop(src, x - fxAnchor[0], y - fxAnchor[1], fxCell[0], fxCell[1]); }
  function placeAuthored(node, x, y) { node.style.left = `${(x - fxAnchor[0]) / 270 * 100}%`; node.style.top = `${(y - fxAnchor[1]) / 300 * 100}%`; }
  function actorPoint(actor, px = 40, py = 55) { const box = actor.getBoundingClientRect(), area = world.getBoundingClientRect(), w = actor.naturalWidth || 80, h = actor.naturalHeight || 96, scale = Math.min(box.width / w, box.height / h); return { x: (box.left - area.left + (box.width - w * scale) / 2 + px * scale) / area.width * 270, y: (box.top - area.top + (box.height - h * scale) / 2 + py * scale) / area.height * 300 }; }
  async function frames(draw, count, ms) {
   const owner = effectOwner;
   if (config.reducedMotion) { draw(count - 1); await wait(Math.min(ms, 150)); return; }
   for (let frame = 0; frame < count; frame++) { if (closed || closing || owner !== effectOwner) return; draw(frame); await wait(ms / count); }
  }
  function fxCanvas() {
   const canvas = doc.createElement('canvas'); canvas.className = 'bx-fx'; canvas.width = 270; canvas.height = 300; canvas.style.width = '100%'; canvas.style.height = '100%'; world.append(canvas); effects.add(canvas); const context = canvas.getContext('2d'); context.imageSmoothingEnabled = false; return { canvas, context };
  }
  function pixel(context, x, y, w, h, color) { context.fillStyle = color; context.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); }
  function burst(context, x, y, frame, color = '#d6af62') { for (let i = 0; i < 8; i++) { const angle = i * Math.PI / 4, radius = 7 + frame * 4; pixel(context, x + Math.cos(angle) * radius, y + Math.sin(angle) * radius, 4, 4, color); } }
  async function enemyAttack(id) {
   const poses = config.enemy.assets.moves?.[id] || (config.type === 'cockroach' ? Object.fromEntries(['prepare', 'action', 'contact', 'recovery'].map(role => [role, `assets/rc4/combat_candidates_v3/bunmi-${id}-${role}.png`])) : {});
   currentEnemyMove = id;
   enemy.src = poses.prepare || config.enemy.assets.telegraph || config.enemy.assets.idle;
   if (id === 'rpg') {
    if (poses.aim) { await wait(230); enemy.src = poses.aim; }
    $('.bx-log').textContent = config.enemy.dialogue.prayer || config.enemy.moves.rpg?.prayer || config.enemy.moves.rpg?.telegraph || config.enemy.moves.rpg.label;
    await wait(clamp(500 + $('.bx-log').textContent.length * 30, 1100, 5500)); if (closing || closed) return;
    if (!poses.action) prop(config.assets.launcher, 177, 158, 52, 32);
   } else await wait(240);
   if (closed || closing) return;
   if (id === 'rpg') await sound('GUN_RPG');
   enemy.src = poses.action || config.enemy.assets.attack || config.enemy.assets.idle;
   const from = actorPoint(enemy, 15, 50), to = actorPoint(rich);
   if (id === 'chancla') {
    const authored = config.assets.chanclaFrames?.length > 0;
    const slippers = Array.from({ length: 7 }, () => authored ? authoredProp(config.assets.chanclaFrames[0], from.x, from.y) : prop(config.assets.chancla, from.x, from.y, 24, 24));
    const context = authored ? null : fxCanvas().context;
    await frames(frame => {
     context?.clearRect(0, 0, 270, 300);
     enemy.src = frame < 5 ? poses.action || enemy.src : poses.contact || poses.action || enemy.src;
     slippers.forEach((slipper, i) => { const p = clamp((frame - i * .55) / 5, 0, 1), x = from.x + (to.x - from.x) * p, y = from.y + (to.y - from.y) * p + Math.sin(p * Math.PI) * (-38 + i * 10); slipper.src = config.assets.chanclaFrames?.[frame % config.assets.chanclaFrames.length] || config.assets.chancla; if (authored) { placeAuthored(slipper, x, y); slipper.style.opacity = frame < i * .55 ? '0' : '1'; } else { slipper.style.left = `${x / 270 * 100}%`; slipper.style.top = `${y / 300 * 100}%`; slipper.style.rotate = `${frame * 45 + i * 18}deg`; } if (context && frame >= 6) burst(context, to.x, to.y, frame - 5); });
    }, 9, 680);
   } else if (id === 'rpg') {
    const missileFrames = config.assets.missileFrames || (config.assets.missile ? [config.assets.missile] : null);
    if (missileFrames?.length) {
     const smoke = config.assets.smoke ? Array.from({ length: 9 }, () => authoredProp(config.assets.smoke, from.x, from.y)) : [];
     const missiles = Array.from({ length: 3 }, () => authoredProp(missileFrames[0], from.x, from.y));
     await frames(frame => {
      enemy.src = frame < 9 ? poses.action || enemy.src : poses.contact || poses.action || enemy.src;
      missiles.forEach((missile, i) => {
       const p = clamp((frame - i * 2) / 6, 0, 1), x = from.x + (to.x - from.x) * p, y = from.y + (to.y - from.y) * p + i * 8;
       missile.src = missileFrames[frame % missileFrames.length]; placeAuthored(missile, x, y); missile.style.opacity = frame < i * 2 ? '0' : '1';
       for (let trail = 0; trail < 3; trail++) { const cloud = smoke[i * 3 + trail]; if (!cloud) continue; placeAuthored(cloud, x + 17 + trail * 13, y); cloud.style.opacity = frame < i * 2 ? '0' : String(.8 - trail * .2); }
      });
     }, 12, 900);
    } else {
     const { context } = fxCanvas();
     await frames(frame => {
      context.clearRect(0, 0, 270, 300);
      for (let missile = 0; missile < 3; missile++) {
       const p = clamp((frame - missile * 2) / 6, 0, 1), x = from.x + (to.x - from.x) * p, y = from.y + (to.y - from.y) * p + missile * 8;
       for (let trail = 0; trail < 5; trail++) pixel(context, x + 9 + trail * 7, y - 2 + (trail % 2) * 3, 6 + trail, 5 + trail, trail % 2 ? '#675e68' : '#8b7e85');
       pixel(context, x - 10, y - 3, 17, 7, '#17131e'); pixel(context, x - 8, y - 2, 13, 5, '#72b58a'); pixel(context, x - 12, y - 1, 4, 3, '#d6af62');
       if (p >= 1) burst(context, to.x, y, frame % 4, '#f6efd9');
      }
     }, 12, 900);
    }
   } else if (config.type === 'cockroach') {
    await frames(frame => { enemy.src = frame < 2 ? poses.prepare : frame < 5 ? poses.action : frame < 7 ? poses.contact : poses.recovery; if (id === 'scuttle') enemy.style.translate = config.reducedMotion ? '' : `${frame < 6 ? -(frame * 3) : 0}% 0`; if (id === 'flies') enemy.style.translate = config.reducedMotion ? '' : `0 ${frame < 6 ? -(frame * 5) : 0}%`; }, 9, 700);
    enemy.style.translate = '';
   } else await wait(250);
   enemy.src = poses.contact || config.enemy.assets.attack || config.enemy.assets.idle;
  }
  async function playerAttack(id) {
   const move = config.player.moves.find(m => m.id === id), art = move?.assets && Object.keys(move.assets).length ? move.assets : global.RAArtRegistry?.combatMoves?.[id];
   if (config.assets.playerAttack) rich.src = config.assets.playerAttack;
   if (id === 'blood' && art?.rear?.length) {
    const rear = prop(art.rear[0], 0, -60, 270, 362); await frames(frame => { rear.src = art.rear[Math.min(art.rear.length - 1, Math.floor(frame / 2))]; }, 6, 400);
    if (art.foreground) prop(art.foreground, 0, -60, 270, 362);
    if (art.overlay?.length) prop(art.overlay[art.overlay.length - 1], 150, 140, 96, 96);
   } else if (id === 'bite' && art?.upper) {
    prop(art.upper, 0, 0, 270, 300); prop(art.lower, 0, 0, 270, 300); await wait(300); cleanupFX(); if (art.snap) prop(art.snap, 0, 0, 270, 300);
   } else if (id === 'octopus' && art?.frames) {
    const octopus = prop(art.frames[0], 0, 0, 270, 300); await frames(frame => { octopus.src = art.frames[frame % art.frames.length]; }, 4, 420);
   } else {
    const { context } = fxCanvas(); await frames(frame => { context.clearRect(0, 0, 270, 300); burst(context, 207, 179, frame, id === 'revenge' ? '#ae2446' : '#d6af62'); }, 5, 320);
   }
  }
  async function contact(event) {
   if (event.amount > 0) await sound(event.hp[event.target] <= 0 ? 'KO' : event.amount >= 30 ? 'HIT_HEAVY' : 'HIT_LIGHT');
   const target = event.target === 'enemy' ? enemy : rich;
   if (event.target === 'enemy' && config.enemy.assets.hit) enemy.src = config.enemy.assets.hit;
   if (event.target === 'player' && config.assets.playerHit) rich.src = config.assets.playerHit;
   target.classList.add('bx-contact'); if (!config.reducedMotion) world.classList.add('bx-shake');
   const num = doc.createElement('b'); num.className = `bx-number ${event.target}`; num.textContent = `−${event.amount}`; world.append(num); effects.add(num);
   const at = actorPoint(target); num.style.left = `${at.x / 270 * 100}%`; num.style.top = `${(at.y - 18) / 300 * 100}%`;
   if (event.target === 'player' && event.fx === 'chancla' && config.assets.chanclaImpact) authoredProp(config.assets.chanclaImpact, at.x, at.y);
   if (event.target === 'player' && event.fx === 'rpg' && config.assets.impact) authoredProp(config.assets.impact, at.x, at.y);
   if (event.fx === 'rpg' && !config.reducedMotion) {
    const crackFrames = config.assets.crack ? [config.assets.crack] : config.assets.crackFrames;
    const cracks = prop(crackFrames[0], 0, 0, 270, 300); await frames(frame => { cracks.src = crackFrames[Math.min(crackFrames.length - 1, frame)]; cracks.style.opacity = String(1 - frame * .25); }, 3, 300);
   } else await wait(160);
   hud(); if (event.target === 'player') { const recovery = config.enemy.assets.moves?.[currentEnemyMove || event.fx]?.recovery; if (recovery) enemy.src = recovery; } await wait(config.reducedMotion ? 100 : 220); cleanupFX();
  }
  async function play() {
   busy = true; menu();
   while (state.pending && state.pending.cursor < state.pending.events.length && !closed && !closing) {
    const event = clone(state.pending.events[state.pending.cursor]);
    // Commit the cursor BEFORE its visual contact. A reload resumes the next event.
    state = acknowledge(state); await persist(`event:${event.kind}`); if (closed || closing) return;
    if (event.kind === 'player') { $('.bx-log').textContent = event.label; await sound(moveSound(event.move)); if (!closed && !closing) await playerAttack(event.move); }
    else if (event.kind === 'enemy') { $('.bx-log').textContent = event.label; $('.bx-telegraph').textContent = `${config.labels.attacking || 'ATTACK'}: ${event.label}`; $('.bx-telegraph').hidden = false; if (config.enemy.moves[event.move]?.dmg > 0) await sound('TELEGRAPH'); if (!closed && !closing) await enemyAttack(event.move); }
    else if (event.kind === 'contact') { $('.bx-log').textContent = `${event.target === 'player' ? config.player.name : config.enemy.name} −${event.amount} HP`; await contact(event); }
    else if (event.kind === 'phase') { $('.bx-log').textContent = config.enemy.dialogue.phase2 || config.labels.phase2 || 'PHASE 2'; await wait(750); }
    else if (event.kind === 'guard') { $('.bx-log').textContent = config.labels.guarding || 'GUARD UP'; await sound('BUFF'); await wait(250); }
    else if (event.kind === 'heal') { $('.bx-log').textContent = `+${event.amount} HP`; hud(); await sound('HEAL'); await wait(240); }
    else if (event.kind === 'blocked') { $('.bx-log').textContent = config.labels.blocked || 'BLOCKED'; await sound('EN_SHIELD'); await wait(200); }
    else if (event.kind === 'recovery') { $('.bx-log').textContent = config.enemy.moves.recover?.telegraph || config.labels.recovery || 'RECOVERY · ATTACK OPENING'; await wait(300); }
    else if (event.kind === 'end') { await sound(event.outcome === 'win' ? 'VICTORY' : 'DEFEAT'); await wait(180); }
    cleanupFX(event.kind !== 'enemy' && event.kind !== 'player');
   }
   if (closed || closing) return;
   state = completePresentation(state); await persist('ready'); if (closed || closing) return;
   busy = false; menu();
  }
  async function action(type, id) {
   if (busy || closing || closed || state.status !== 'ready') return;
   const next = act(state, { type, id }, config); if (next.actionSerial === state.actionSerial) return;
   busy = true; state = next; menu();
   try { await persist('action'); if (!closed && !closing) await play(); } catch (error) { fail(error); }
  }
  function choose(value) {
   if (closed || closing) return;
   if (value === 'quit') return settle('quit');
   if (state.status === 'results' && !busy) { if (value === 'continue') settle(state.outcome); if (value === 'retry') settle('retry'); if (value === 'leave') settle('lose'); return; }
   if (value === 'guard') return action('guard'); if (value.startsWith('move:')) action('move', value.slice(5));
  }
  function click(event) { const button = event.target.closest('[data-bx-action]'); if (!button || !root.contains(button) || button.disabled) return; if (suppressTouchClick && Date.now() < suppressTouchClick.until && (event.pointerType === 'touch' || event.sourceCapabilities?.firesTouchEvents || (!event.pointerType && event.detail > 0))) { event.preventDefault(); return; } choose(button.dataset.bxAction); }
  function touchDown(event) { suppressTouchClick = null; if (event.pointerType !== 'touch') return; const button = event.target.closest('[data-bx-action]'); touchPress = button && root.contains(button) && !button.disabled ? { id: event.pointerId, button, x: event.clientX, y: event.clientY, moved: false } : null; }
  function touchMove(event) { if (touchPress?.id === event.pointerId && Math.hypot(event.clientX - touchPress.x, event.clientY - touchPress.y) > 12) touchPress.moved = true; }
  function touchCancel() { touchPress = null; }
  function touchUp(event) { const press = touchPress; touchPress = null; if (!press || press.id !== event.pointerId || press.moved || Math.hypot(event.clientX - press.x, event.clientY - press.y) > 12 || press.button !== event.target.closest('[data-bx-action]') || !root.contains(press.button) || press.button.disabled) return; const action = press.button.dataset.bxAction; if (['quit', 'continue', 'retry', 'leave'].includes(action)) return; event.preventDefault(); suppressTouchClick = { action, until: Date.now() + 450 }; choose(action); }
  function key(event) {
   if (event.repeat || closed || closing || event.ctrlKey || event.metaKey || event.altKey || /^(INPUT|TEXTAREA|SELECT)$/.test(event.target?.tagName)) return;
   if (event.key === 'Escape') { event.preventDefault(); choose('quit'); }
   else if (event.key.toLowerCase() === 'g') { event.preventDefault(); choose('guard'); }
   else if (/^[1-4]$/.test(event.key) && state.status === 'ready') { event.preventDefault(); const move = config.player.moves[Number(event.key) - 1]; if (move) choose(`move:${move.id}`); }
  }
  root.addEventListener('click', click); root.addEventListener('pointerdown', touchDown); root.addEventListener('pointermove', touchMove); root.addEventListener('pointerup', touchUp); root.addEventListener('pointercancel', touchCancel); global.addEventListener('keydown', key); doc.addEventListener('visibilitychange', visibility); config.signal?.addEventListener('abort', abort, { once: true });
  active = { root, state: () => clone(state), dispose: abort };
  $('.bx-log').textContent = config.enemy.dialogue.intro || config.labels.intro || 'Choose a move. Read the next attack.'; hud(); menu();
  (async () => { try { await persist('mount'); if (closed || closing) return; if (!input.state && !input.snapshot) await sound('BATTLE_START'); if (closed || closing) return; if (state.pending) await play(); else { busy = false; menu(); } } catch (error) { fail(error); } })();
  if (config.signal?.aborted) abort();
  return promise;
 }
 global.RABloodXEncounters = Object.freeze({ mount, active: () => active, dispose: () => active?.dispose(), defaults: DEFAULT_ASSETS, rules: Object.freeze({ normalize, create, restore, intent, act, acknowledge, completePresentation, VERSION }) });
})(typeof window !== 'undefined' ? window : globalThis);
