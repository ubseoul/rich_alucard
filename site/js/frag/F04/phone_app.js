(function(){
 'use strict';
 // F04 — PLAYMAKERS WAR ROOM — phone_app.js
 // Registers the WAR ROOM phone app with RAPhoneRegistry (IF-1 4D).
 // Invisible while F04.war_room is OFF — no phone surface is touched until the flag is on.
 // SOURCE: Vol 7 §3 (War Room UI), §7.4 (War Room table visual language).
 //
 // Browser UX: 360/390/430 mobile widths supported via class-based responsive layout.
 // The War Room app renders: BOARD (district map), JOBS (tonight's menu), CREW, REPORTS, HAND BACK.

 const FLAG = 'F04.war_room';
 const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 const btn = (label, action, cls = '') =>
  `<button type="button" class="phone-button ${cls}" data-phone-action="${esc(action)}">${label}</button>`;

 // ── Sub-view renderers ────────────────────────────────────────────────────

 function renderBoard() {
  if(window.RARC3)return renderJobs();
  const active = window.RAFrag.read('F04', 'active', false);
  if (!active) return renderOffer();
  const districts = (window.RAWarRoomDistricts?.activeIds?.() || []).map(id => {
   const d = window.RADistricts.get(id);
   const pressure = window.RAWarRoomDistricts.pressure(id);
   const heatSnap = window.RAHeat.snapshot().districts[id] || { value: 0, tier: 'COOL' };
   const controlLabel = !d ? '—'
    : d.state === 'CONTROLLED' && d.holder === 'rich' ? '🔴 RICH'
    : d.state === 'CONTROLLED' && d.holder === 'rival' ? '🟢 OPEN MOUTH GANG'
    : '⬜ CONTESTED';
   const pressureBars = '▰'.repeat(Math.min(pressure, 5)) + '▱'.repeat(Math.max(0, 5 - pressure));
   return `<div class="phone-card war-room-district">
<b>${esc(d?.label || id)}</b>
<br>${controlLabel}
<br>HEAT: ${esc(heatSnap.tier)} · PRESSURE: ${pressureBars}
<br>DEMAND: ${window.RAWarRoomDistricts.demand(id)}
</div>`;
  }).join('');

  const vampPressure = window.RAWarRoomHeat?.vampirePressure?.() ?? 50;
  const heat = window.RAHeat.snapshot();
  return `<h1>WAR ROOM</h1>
<p class="phone-small">GLOBAL HEAT: ${heat.global.tier} · VAMPIRE PRESSURE: ${vampPressure}</p>
${districts}
${btn('TONIGHT\'S JOBS', 'app:warRoom:jobs')}
${btn('CREW', 'app:warRoom:crew')}
${btn('REPORT CARDS', 'app:warRoom:reports')}
${btn('HAND BACK', 'app:warRoom:handback', 'phone-button-danger')}`;
 }

 function renderOffer() {
  const offer = window.RAFrag.read('F04', 'offer', {});
  if (offer.status === 'unavailable') {
   return `<h1>WAR ROOM</h1><p class="phone-small">nothing yet.</p>`;
  }
  if (offer.status === 'declined_final') {
   return `<h1>WAR ROOM</h1><p class="phone-small">the card is somewhere in the castle.</p>`;
  }
  if (offer.status === 'closed_fame') {
   return `<h1>WAR ROOM</h1><p class="phone-small">the map is still on the table.</p>`;
  }
  // available or declined_once + second offer day reached
  return `<h1>WAR ROOM</h1>
<div class="phone-card">
<b>MISTER DECEMBER</b><br>
${offer.status === 'available' ? 'A black car is outside.' : 'He\'s back.'}
</div>
${btn('I\'M IN.', 'do:warRoom:accept')}
${window.RARC3?'':btn('NAH.', 'do:warRoom:decline')}`;
 }

 function renderJobs() {
  const active = window.RAFrag.read('F04', 'active', false);
  if(window.RARC3&&!active)return `${renderOffer()}${btn('RAMEN SHIFT','do:warRoom:ramen')}`;
  if (!active) return `<h1>JOBS</h1><p class="phone-small">not in the game.</p>`;

  const jobs = window.RAWarRoomJobs.buildNightMenu();
  if(window.RARC3)return `<h1>PICK A JOB</h1>${!window.RAFrag.read('F04','jobLog',[]).some(j=>j.via==='play')?`<p class="phone-speaker">RICH</p><p>${esc(window.RAWriting.voice(5))}</p>`:''}${jobs.map((job,i)=>job.routesToPlay?`<div class="phone-card"><b>${esc(job.label)}</b>${btn('PICK CREW → GO',`do:warRoom:play:${i}`)}</div>`:'').join('')}${btn('RAMEN SHIFT','do:warRoom:ramen')}`;
  const slots = window.RAFrag.read('F04', 'jobs.slotsPerNight', 1);
  const nightsIn = window.RAFrag.read('F04', 'jobs.nightsSinceStart', 0);
  if (!jobs.length) return `<h1>JOBS</h1><p class="phone-small">quiet tonight.</p>`;

  const P = window.RAWarRoomPlay;
  const pend = P?.pending();
  const refusal = P?.lastRefusal();
  const pendLine = pend ? `<div class="phone-card"><b>A PLAY IS ON.</b><br>${esc(pend.jobMeta?.label || '')}
${btn('RESUME', 'do:warRoom:resume')}</div>` : '';
  const refuseLine = !pend && refusal && refusal.day === window.RALife.today().day ? `<p class="phone-small">not tonight: ${esc(String(refusal.reason || refusal.code).toLowerCase())}.</p>` : '';

  const mods = window.RAWarRoomJobs.nightModifiers();
  const modLine = mods.length ? `<p class="phone-small">TONIGHT: ${mods.map(m => esc(m.label)).join(' · ')}</p>` : '';

  return `<h1>TONIGHT'S JOBS</h1>
${pendLine}${refuseLine}
${modLine}
<p class="phone-small">SLOTS: ${slots} · NIGHT ${nightsIn}</p>
${jobs.map((job, i) => renderJobCard(job, i)).join('')}
${btn('← BACK', 'app:warRoom')}`;
 }

 function renderJobCard(job, i) {
  if (job.type === 'LAY_LOW') {
   return `<div class="phone-card war-room-job">
<b>${esc(job.label)}</b>
<br>💤 NO SQUAD · COST: $10,000 · HEAT: −15
${btn('LAY LOW TONIGHT', `do:warRoom:runJob:${i}`)}
</div>`;
  }
  // WAR ROOM answers "what play do I want to make?". Crew, car, danger and money are THE PLAY's (F01) — nothing about them here.
  const recs = (job.recommended || []).join(' / ');
  const fx = strategicEffectLine(job);
  return `<div class="phone-card war-room-job">
<b>${esc(job.label)}</b> · ${esc(job.districtLabel)}
${fx ? `<br>${esc(fx)}` : ''}
${recs ? `<br>REC: ${esc(recs)}` : ''}
${btn('MAKE THIS PLAY', `do:warRoom:play:${i}`)}
</div>`;
 }

 // Only the authored strategic (non-cash) consequences are shown; cash and HEAT come from the PLAY itself.
 function strategicEffectLine(job) {
  const r = job.authoredReward;
  if (!r) return '';
  switch (r.type) {
   case 'supply_range':    return `WIN: +${r.min}–${r.max} SUPPLY`;
   case 'cash_and_rep':    return 'WIN: STREET REP';
   case 'pressure_reduce': return `WIN: RIVAL PRESSURE ${r.pressureDelta}`;
   default:                return '';
  }
 }

 function renderCrew() {
  const all = window.RAWarRoomCrew.allOgas();
  if (!all.length) return `<h1>CREW</h1><p class="phone-small">no one yet.</p>`;

  return `<h1>CREW</h1>
${all.map(oga => {
   const statusEmoji = { ACTIVE: '●', DOWNED: '⬇', CAPTURED: '⛓', GONE: '🖤' }[oga.status] || '?';
   const storyCount = Object.keys(oga.stories || {}).length;
   const storyLines = Object.entries(oga.stories || {}).map(([k,v]) =>
    `<br><span class="phone-small">· ${esc(typeof v === 'string' ? v : k)}</span>`).join('');
   const mourning = Object.keys(oga.stories || {}).some(k => k.startsWith('mourning_'));
   return `<div class="phone-card war-room-oga ${oga.status === 'GONE' ? 'oga-gone' : ''}">
<b>${statusEmoji} ${esc(oga.name)}</b> <span class="phone-small">${esc(oga.class)}</span>
${mourning ? '<br><span class="phone-small">grieving (−10 aim)</span>' : ''}
${storyCount ? `<br><span class="phone-small">STORIES (${storyCount}):</span>${storyLines}` : ''}
</div>`;
  }).join('')}
${btn('← BACK', 'app:warRoom')}`;
 }

 function renderReports() {
  const cards = window.RAWarRoomReportCard?.recent(5) || [];
  if (!cards.length) return `<h1>REPORT CARDS</h1><p class="phone-small">no jobs yet.</p>`;
  return `<h1>REPORT CARDS</h1>
${cards.map(c => window.RAWarRoomReportCard.markup(c)).join('')}
${btn('← BACK', 'app:warRoom')}`;
 }

 function renderHandBack() {
  const hb = window.RAFrag.read('F04', 'handBack', {});
  if (hb.resolved) return `<h1>HAND BACK</h1><p class="phone-small">it's done.</p>${btn('← BACK','app:warRoom')}`;
  if (hb.pending) return `<h1>HAND BACK</h1><p class="phone-small">the last play is set. finish it.</p>${window.RAWarRoomPlay?.pending() ? btn('RESUME', 'do:warRoom:resume') : btn('MAKE THE LAST PLAY', 'do:warRoom:handBackPlay', 'phone-button-danger')}${btn('← BACK','app:warRoom')}`;
  return `<h1>HAND BACK THE BLOCKS</h1>
<div class="phone-card">
<b>RETURN TO DECEMBER.</b><br>
You keep everything. One last job.
</div>
${btn('HAND BACK', 'do:warRoom:handBack', 'phone-button-danger')}
${btn('NOT YET', 'app:warRoom')}`;
 }

 // ── Nightly SLOTS (F13): the board spends the SLOTS it shows. A full night answers on the board's existing refusal line. ──
 function slotOpen(job) {
  const can = window.RAWarRoomJobs.canRunTonight(job);
  if (can.ok) return true;
  window.RAFrag.patch('F04', 'play.lastRefusal', { day: window.RALife.today().day, code: 'NO_SLOT', reason: 'no slots left' });
  return false;
 }

 // ── Action handler ────────────────────────────────────────────────────────
 function onAction(act, arg, api) {
  if(window.RARC3&&act==='ramen')return api.begin(window.RAAdventures.isDone('A08')?'SLURP':'A08');
  if(window.RARC3&&!['accept','play','resume','ramen'].includes(act))return false;
  if (act === 'accept') {
   window.RAFrag.patch('F04', 'offer.status', 'accepted');
   window.RAFrag.patch('F04', 'offer.acceptedOnDay', window.RALife.today().day);
   window.RAFrag.patch('F04', 'active', true);
   window.RAFrag.patch('F04', 'jobs.nightsSinceStart', 0);
   // RC2 (OL-063): the offer opens on Day 2, so tonight's SLOTS are set now, not at the next WAKE (a Day-2 accept gets its real board)
   window.RAFrag.patch('F04', 'jobs.slotsPerNight', window.RAWarRoomCrew.slotsPerNight());
   window.RAWarRoomVG.fireWorldReactions();
   window.RAWarRoomVG.postYoungPlaymaker();
   window.RAPhoneRegistry.unlock('warRoom', { badge: true });
   api.refresh();
   return;
  }

  if (act === 'decline') {
   const offer = window.RAFrag.read('F04', 'offer', {});
   const status = offer.status === 'available' && offer.secondOfferDay == null
    ? 'declined_once'
    : 'declined_final';
   window.RAFrag.patch('F04', 'offer.status', status);
   window.RAFrag.patch('F04', 'offer.declinedOnDay', window.RALife.today().day);
   api.refresh();
   return;
  }

  if (act === 'handBack' || act === 'handBackPlay') {
   const J = window.RAWarRoomJobs;
   const started = act === 'handBack' ? J.initiateHandBack() : { ok: window.RAFrag.read('F04', 'handBack', {}).pending, job: J.buildHandBackJob() };
   if (!started.ok) { api.refresh(); return; }
   // the last play is made by THE PLAY like any other; the route closes when its result is consumed
   return Promise.resolve(window.RAWarRoomPlay.launch(started.job)).then(() => api.refresh(), () => api.refresh());
  }

  if (act === 'runJob') {
   // LAY LOW is the only job the War Room resolves itself (no squad, no car, no PLAY).
   const job = window.RAWarRoomJobs.buildNightMenu()[Number(arg)];
   if (!job || job.type !== 'LAY_LOW') { api.refresh(); return; }
   if (!slotOpen(job)) { api.refresh(); return; }
   const resolution = window.RAWarRoomJobs.executeRun({ jobCard: job });
   window.RAWarRoomJobs.applyRunResult(resolution);
   window.RAWarRoomReportCard.record(resolution);
   window.RAFrag.patch('F04', 'jobs.nightsSinceStart', window.RAFrag.read('F04', 'jobs.nightsSinceStart', 0) + 1);
   api.refresh();
   return;
  }

  // Every job that sends crew out: hand off to F01 THE PLAY (phone -> crew / car -> play -> return), then consume its result.
  if (act === 'play' || act === 'resume') {
   const P = window.RAWarRoomPlay;
   const job = act === 'play' ? window.RAWarRoomJobs.buildNightMenu()[Number(arg)] : null;
   if (act === 'play' && !job) { api.refresh(); return; }
   if (act === 'play' && !slotOpen(job)) { api.refresh(); return; }
   const started = act === 'play' ? P.launch(job) : P.resume();
   return Promise.resolve(started).then(() => api.refresh(), () => api.refresh());
  }

  api.refresh();
 }

 // ── Main render ───────────────────────────────────────────────────────────
 function render(sub) {
  if (!window.RAFeatures.enabled(FLAG)) return '';
  if(window.RARC3)return renderJobs();

  if (!sub || sub === 'board') return renderBoard();
  if (sub === 'jobs') return renderJobs();
  if (sub === 'crew') return renderCrew();
  if (sub === 'reports') return renderReports();
  if (sub === 'handback') return renderHandBack();
  return renderBoard();
 }

 // ── Register with RAPhoneRegistry ─────────────────────────────────────────
 window.RAPhoneRegistry.declare('F04', {
  id: 'warRoom',
  flag: FLAG,
  label: 'WAR ROOM',
  section: 'now',
  order: 50,
  render,
  onAction
 });
})();
