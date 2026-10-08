(function(){
 'use strict';
 // F04 — PLAYMAKERS WAR ROOM — play_adapter.js  (replaces showdown_stub.js; OL-023)
 // The strategic side of THE PLAY seam. WAR ROOM answers "WHAT PLAY DO I WANT TO MAKE?"; F01 THE PLAY owns everything after that:
 // the phone offer, CREW / CAR, seating, the live feed, the return scene, every outcome surface. This file:
 //   buildRequest(jobCard)   the strategic PLAY request  (schema F04.play_request, versioned by F01's RAPlayContract)
 //   launch(jobCard)         persist -> RAShowdown.play.launch(request) -> consume(result)
 //   consume(result)         apply the canonical result record to WAR ROOM state, IDEMPOTENTLY (requestId)
 //   resume()                after a reload: re-issue the pending request (F01 answers a completed one from its record)
 // It duplicates no F01 simulation and no crew / car / seating UI. F01 never sees War Room state beyond the request.
 //
 // CASH / HEAT AUTHORITY for a PLAY-routed job: the PLAY's banked pot is the money (the return scene counts exactly that);
 // the PLAY's heat is the HEAT. F04's authored per-type cash / HEAT (Vol 7 §3.2) are NOT paid on top (no duplicate rewards);
 // F04 still applies the authored NON-cash effects on a win (SUPPLY, STREET REP, RIVAL PRESSURE) and pressure reset.
 // Reconciling the authored §3.2 cash/HEAT tables with PLAY payouts is F13 / owner work: see docs OWNER_REQUIRED.

 if (!window.RAFeatures?.get('F04.war_room')) return;

 const K = 'play';
 const rd = (path, dflt) => window.RAFrag.read('F04', path, dflt);
 const wr = (path, v) => window.RAFrag.patch('F04', path, v);
 const day = () => window.RALife.today().day;
 const money = () => Number(window.RAState.get().life?.resources?.money) || 0;

 // ── F04 job type -> F01 job (F04-owned table; F01 validates the id) ─────────────────────────────
 // F01 jobs are keyed by SHAPE (DROP, RE-UP, COLLECT, PROTECT, TAKE THE BLOCK, HOLD THE HOUSE, BIG PLAY, EXTRACT).
 // INTENTIONALLY KEPT (OL-043): BAIT retains the accepted provisional quiet_lift adapter;
 // authored BAIT scenario content is a D_QUEUE creator item for later BUILD-5 ingestion.
 // HAND BACK -> the BIG PLAY (counting_house) is likewise provisional. Change here, nowhere else.
 const PLAY_MAP = Object.freeze({
  DROP: ['tupperware', 'vampire_dentist'],
  RE_UP: ['dock_restock'],
  COLLECT: ['boba_backroom', 'quiet_lift'],
  PROTECT: ['vampire_gala'],
  BAIT: ['quiet_lift'],                       // INTENTIONALLY KEPT (OL-043), accepted provisional adapter
  TAKE_THE_BLOCK: ['car_wash_stickup', 'smack_crib'],
  EXTRACT: ['extract'],
  RETALIATION: ['hold_the_house'],
  HAND_BACK: ['counting_house']               // PROVISIONAL: SOURCE_REQUIRED
 });
 // Owned RALife car id -> F01 car id. Cars F01 has no stats for (S15, R34, Aventador, Ferrari, ...) are simply not offered
 // (SOURCE_REQUIRED, F03/F13 car words). F04 never mutates vehicle ownership.
 const CAR_MAP = Object.freeze({ toyota_supra_mk4_001: 'SUPRA', honda_s2000_pink: 'S2000', lambo_urus_oxblood: 'URUS' });

 const hashSeed = s => { let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0; return (h % 90000) + 1000; };
 const perkOf = key => (key.startsWith('play_') ? key.slice(5) : null);

 function f01JobFor(jobCard) {
  const key = jobCard.isHandBack ? 'HAND_BACK' : jobCard.type;
  const list = PLAY_MAP[key];
  if (!list) return null;
  const pick = (day() + String(jobCard.district || '').length) % list.length;
  return list[pick];
 }

 function rosterSnapshot() {
  return window.RACrew.list({ fragment: 'F04' })
   .filter(u => u.status !== 'GONE')
   .map(u => ({
    id: u.id,
    name: u.name,
    cls: u.class,
    status: u.status,
    bonds: { ...(u.bonds || {}) },
    perks: Object.keys(u.stories || {}).map(perkOf).filter(Boolean),
    human: u.meta?.human === true ? true : undefined
   }));
 }

 function garageSnapshot() {
  const map = {}; const owned = [];
   for (const c of window.RAVehicles.available()) {
   if (c.service?.tributed) continue;
   const f01 = CAR_MAP[c.id];
   if (!f01 || map[f01]) continue;
   map[f01] = c.id; owned.push(f01);
  }
  // RC2 (OL-063): the first PLAY is reachable on Day 2, before Rich owns a car F01 has stats for. The crew's own hooptie (F01 car
  // HOOPTIE, authored in F01 CARS) is the ride until he does. It maps to no RALife vehicle, so nothing is driven or mutated.
  if (!owned.includes('HOOPTIE')) owned.push('HOOPTIE');
  return { owned, map };
 }

 // ── the strategic PLAY request ──────────────────────────────────────────────────────────────────
 function buildRequest(jobCard) {
  if (!jobCard || !jobCard.routesToPlay) return { ok: false, code: 'NOT_A_PLAY', errors: ['this job does not send crew out'] };
  const f01JobId = f01JobFor(jobCard);
  if (!f01JobId) return { ok: false, code: 'NO_PLAY', errors: [`no PLAY for job type ${jobCard.type}`] };
  const seq = Number(rd(`${K}.seq`, 0)) + 1;
  const requestId = `f04:${day()}:${jobCard.id}#${seq}`;
  const garage = garageSnapshot();
  const job = { f01JobId, f04Type: jobCard.type, district: jobCard.district || null, districtLabel: jobCard.districtLabel || null, handBack: !!jobCard.isHandBack };
  if (f01JobId === 'extract') {
   const target = window.RACrew.get(jobCard.target);
   if (!target || target.status !== 'CAPTURED') return { ok: false, code: 'NO_CAPTIVE', errors: ['the captive is no longer held'] };
   const until = target.timers?.extract_window?.until;
   job.captive = { ids: [target.id], clock: Math.max(1, (until != null ? until - day() : 1) + 1) };
  }
  const request = {
   schema: window.RAPlayContract.REQUEST_SCHEMA,
   version: window.RAPlayContract.VERSION,
   requestId,
   seed: hashSeed(requestId),
   day: day(),
   job,
   roster: rosterSnapshot(),
   garage: { owned: garage.owned, encounter: ['HOOPTIE'] },
   bank: money(),
   heat: window.RAHeat.global(),
   rosterCap: 8,
   dayOneThreshold: window.RAWarRoomCrew.DAY_ONE_THRESHOLD
  };
  const iron=window.RAIronAndGrace?.playSnapshot?.(request.roster);
  if(iron)request.iron=iron;
  return { ok: true, request, carMap: garage.map, seq, jobMeta: { type: jobCard.type, district: jobCard.district || null, label: jobCard.label, isHandBack: !!jobCard.isHandBack, id: jobCard.id } };
 }

 // ── consume the canonical result (idempotent on requestId) ──────────────────────────────────────
 const safe = (errors, tag, fn) => { try { return fn(); } catch (e) { errors.push(`${tag}: ${e.message}`); console.error('F04 play consume', tag, e); return undefined; } };

 function debitClamped(amount, source) {
  const n = Math.min(Math.max(0, Math.round(amount)), money()); // banked money is never driven negative
  if (n > 0) window.RAMoneyLedger.debit(n, { source });
  return n;
 }

 function consume(result) {
  const pending = rd(`${K}.pending`, null);
  const consumed = rd(`${K}.consumed`, {});
  if (result && consumed[result.requestId]) { if (pending?.request.requestId === result.requestId) wr(`${K}.pending`, null);window.RARC3?.settlePlay?.(result,consumed[result.requestId]);return { ok: true, duplicate: true, summary: consumed[result.requestId] }; }
  if (!pending || !result || result.requestId !== pending.request.requestId) return { ok: false, code: 'NOT_PENDING' };
  const valid = window.RAPlayContract.validateResult(result);
  if (!valid.ok) { wr(`${K}.pending`, null); wr(`${K}.lastRefusal`, { day: day(), code: 'BAD_RESULT', reason: valid.errors.join('; ') }); return { ok: false, code: 'BAD_RESULT', errors: valid.errors }; }
  const errors = []; const { request, carMap, jobMeta } = pending; let creditedAmount = 0;

  if (result.status === 'REFUSED') {
   wr(`${K}.pending`, null);
   wr(`${K}.lastRefusal`, { day: day(), code: result.code, reason: result.reason });
   return { ok: true, refused: true, code: result.code, reason: result.reason };
  }

  // gain is credited BEFORE spent is debited: spent may be paid out of this very pot (F01 nets them against one bank)
  const summary = { day: day(), status: result.status, jobId: jobMeta.id, cashSpent: 0, cashGain: 0, win: false };

  if (result.status === 'COMPLETE') {
   safe(errors, 'F02 weapons', () => window.RAIronAndGrace?.consumePlay?.(result));
   const squadIds = result.crew.map(c => c.id);
   // 1. bonds first (F01 counts every PLAY as a co-run): before statuses change
   safe(errors, 'bonds', () => { for (let a = 0; a < squadIds.length; a++) for (let b = a + 1; b < squadIds.length; b++) if (window.RACrew.get(squadIds[a]) && window.RACrew.get(squadIds[b])) window.RAWarRoomCrew.recordJobTogether(squadIds[a], squadIds[b]); });
   // 2. crew statuses (F01 vocabulary -> RACrew)
   for (const c of result.crew) safe(errors, `crew:${c.id}`, () => {
    const u = window.RACrew.get(c.id); if (!u) throw new Error('unknown crew id (reported, not applied)'); if (u.status === 'GONE') return;
    if (c.after === 'READY') { if (u.status !== 'ACTIVE') window.RACrew.setStatus(c.id, 'ACTIVE', { reason: 'play' }); }
    else if (c.after === 'WOUNDED' || c.after === 'SHOT') window.RAWarRoomCrew.setRecovering(c.id, { days: c.away || 1, reason: 'play' });
    else if (c.after === 'CAPTURED') window.RAWarRoomCrew.setCaptured(c.id, { reason: 'play' });
    else if (c.after === 'GONE' || c.after === 'DEAD') window.RAWarRoomCrew.setGone(c.id, { reason: 'play' });
   });
   for (const id of result.rescued) safe(errors, `rescued:${id}`, () => { const u = window.RACrew.get(id); if (u && u.status === 'CAPTURED') { window.RACrew.setStatus(id, 'ACTIVE', { reason: 'extract' }); window.RAWarRoomCrew.addStory(id, 'play_rescued', 'got pulled out of that room'); } });
   // 3. story seeds
   const newStories = {};
   for (const s of result.storySeeds) safe(errors, `story:${s.who}`, () => { const line = String(s.perk).replace(/_/g, ' '); if (window.RAWarRoomCrew.addStory(s.who, `play_${s.perk}`, line)) (newStories[s.who] = newStories[s.who] || []).push({ key: `play_${s.perk}`, line }); });
   // 4. recruits (F04 owns the roster cap)
   const rejected = [];
   for (const r of result.recruits) safe(errors, `recruit:${r.id}`, () => { const out = window.RAWarRoomCrew.recruit({ id: r.id, name: r.name, cls: r.cls, source: 'play' }); if (!out.ok) rejected.push({ id: r.id, reason: out.reason }); });
   // 5. money (the PLAY's banked pot; nothing authored is added on top)
   safe(errors, 'gain', () => { const before=money(); if (result.cash.gain > 0) window.RAMoneyLedger.credit(result.cash.gain, { source: 'war_room:play' }); creditedAmount=Math.max(0,money()-before); });
   summary.cashSpent = safe(errors, 'spent', () => debitClamped(result.cash.spent || 0, 'war_room:play:spent')) || 0;
   // 6. HEAT (the PLAY's heat; F04's existing district + global-share distribution is unchanged)
   safe(errors, 'heat', () => {
    const d = result.heat.delta; if (!d) return;
    const dist = window.RAWarRoomDistricts.usable(jobMeta.district) ? jobMeta.district : null;
    if (dist) window.RAHeat.add(d, { district: dist, source: 'war_room:play' });
    const g = Math.round(Math.abs(d) * 0.3) * Math.sign(d);
    if (g) window.RAHeat.add(g, { source: 'war_room:play:global' });
   });
   // 7. authored NON-cash effects on a win + district pressure
   if (result.outcome.win) safe(errors, 'effects', () => {
    const typeDef = window.RAWarRoomJobs.JOB_TYPES[jobMeta.type];
    const fx = typeDef ? window.RAWarRoomJobs.resolveReward(typeDef, jobMeta.district, day()) : null;
    if (fx?.supplyDelta > 0) { wr('supply', Number(rd('supply', 0)) + fx.supplyDelta); window.RAWarRoomHeat?.recordSale?.(fx.supplyDelta); }
    if (fx?.effects?.includes('+STREET REP')) window.RASocial?.streetClout?.add?.(1);
    if (fx?.pressureDelta && jobMeta.district) wr(`districts.${jobMeta.district}.rivalPressure`, Math.max(0, window.RAWarRoomDistricts.pressure(jobMeta.district) + fx.pressureDelta));
    if (jobMeta.district) window.RAWarRoomDistricts.resetPressure(jobMeta.district);
   });
   // 8. the car drove
   safe(errors, 'car', () => { if (result.car.id && !result.car.lost && carMap?.[result.car.id]) window.RAVehicles.recordDrive(carMap[result.car.id], { by: 1 }); });
   // 9. a retaliation that was played is answered; HAND BACK closes the route whatever happened
   safe(errors, 'retaliation', () => { if (jobMeta.type === 'RETALIATION' && jobMeta.district) wr(`districts.${jobMeta.district}.retaliationPending`, false); });
   safe(errors, 'handback', () => { if (jobMeta.isHandBack || request.job.handBack) window.RAWarRoomJobs.resolveHandBack({ outcome: result.outcome.win ? 'victory' : 'defeat' }); });
   // 10. the strategic record: job log + report card (no PLAY numbers, no percentages)
   const cashNet = result.cash.gain - summary.cashSpent;
   safe(errors, 'log', () => {
    const log = rd('jobs.log', []);
    log.push({ day: day(), jobId: jobMeta.id, type: jobMeta.type, district: jobMeta.district, result: result.outcome.win ? 'success' : (result.crew.some(c => c.after === 'CAPTURED') ? 'captured' : 'failed'), ogas: squadIds, heatDelta: result.heat.delta, cashDelta: cashNet, supplyDelta: 0, pressureDelta: 0, newStories: Object.keys(newStories).length, via: 'play', requestId: result.requestId });
    if (log.length > 50) log.shift();
    wr('jobs.log', log);
   });
   safe(errors, 'report', () => window.RAWarRoomReportCard.record({ type: 'play', jobId: jobMeta.id, district: jobMeta.district, approach: null, success: !!result.outcome.win, cashDelta: cashNet, heatDelta: result.heat.delta, squadIds, newStories, loot: result.loot.length ? result.loot.map(l => l.name) : null, day: day() }));
   safe(errors, 'nights', () => wr('jobs.nightsSinceStart', Number(rd('jobs.nightsSinceStart', 0)) + 1));
   Object.assign(summary, { win: !!result.outcome.win, cashGain: result.cash.gain, heat: result.heat.delta, rejectedRecruits: rejected });
  }

  // B1: an unsettled offer/quit carries no host penalty.
  const c2 = rd(`${K}.consumed`, {});
  c2[result.requestId] = { ...summary, errors };
  const ids = Object.keys(c2); for (const k of ids.slice(0, Math.max(0, ids.length - 20))) delete c2[k];
  wr(`${K}.consumed`, c2);
  wr(`${K}.seq`, pending.seq);
  wr(`${K}.pending`, null);
  if(result.status==='COMPLETE')window.RARC3?.settlePlay?.(result,c2[result.requestId]);
  if(result.status==='COMPLETE')window.RARC3?.settleAttempt?.('warRoom',jobMeta.id,{outcome:result.outcome.win?'win':'lose'});
  if(creditedAmount>0&&window.document?.dispatchEvent&&typeof window.CustomEvent==='function')window.document.dispatchEvent(new window.CustomEvent('ra:play-cash-credited',{detail:{requestId:result.requestId,amount:creditedAmount,balance:money(),source:'war_room:play'}}));
  return { ok: true, summary: c2[result.requestId], errors };
 }

 // ── launch / resume ──────────────────────────────────────────────────────────────────────────────
 async function run(pending, opts) {
  const result = await window.RAShowdown.play.launch(pending.request, opts);
  return consume(result);
 }
 function unavailable() {
  if (!window.RAShowdown?.play) return { ok: false, code: 'F01_ABSENT', errors: ['THE PLAY (F01) is not loaded'] };
  if (!window.RAShowdown.enabled()) return { ok: false, code: 'FLAG_OFF', errors: ['F01.showdown_core is OFF'] };
  return null;
 }
 async function launch(jobCard, opts) {
  opts = opts || {};
  const off = unavailable(); if (off) return off;
  if (rd(`${K}.pending`, null)) return { ok: false, code: 'PLAY_PENDING', errors: ['a PLAY is already in progress: resume it'] };
  const built = buildRequest(jobCard); if (!built.ok) return built;
  if(window.RARC3&&!window.RARC3.attemptAllowed('warRoom',jobCard.id))return {ok:false,code:'RETRY_TOMORROW',errors:['One retry per job per day; return tomorrow.']};
  const pending = { request: built.request, carMap: built.carMap, jobMeta: built.jobMeta, seq: built.seq, startedDay: day() };
  wr(`${K}.pending`, pending);      // persisted BEFORE F01 is asked: a reload mid-PLAY cannot lose or duplicate it
  return run(pending, opts);
 }
 async function resume(opts) {
  const off = unavailable(); if (off) return off;
  const pending = rd(`${K}.pending`, null);
  if (!pending) return { ok: false, code: 'NOTHING_PENDING' };
  return run(pending, opts || {});
 }

 window.RAWarRoomPlay = Object.freeze({
  PLAY_MAP,
  CAR_MAP,
  buildRequest,
  launch,
  resume,
  consume,
  pending: () => rd(`${K}.pending`, null),
  lastRefusal: () => rd(`${K}.lastRefusal`, null),
  consumed: id => rd(`${K}.consumed`, {})[id] || null
 });
})();
