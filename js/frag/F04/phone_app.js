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
  const active = window.RAFrag.read('F04', 'active', false);
  if (!active) return renderOffer();
  const districts = (window.RAWarRoomDistricts?.IDS || []).map(id => {
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
${btn('NAH.', 'do:warRoom:decline')}`;
 }

 function renderJobs() {
  const active = window.RAFrag.read('F04', 'active', false);
  if (!active) return `<h1>JOBS</h1><p class="phone-small">not in the game.</p>`;

  const jobs = window.RAWarRoomJobs.buildNightMenu();
  const slots = window.RAFrag.read('F04', 'jobs.slotsPerNight', 1);
  const nightsIn = window.RAFrag.read('F04', 'jobs.nightsSinceStart', 0);
  if (!jobs.length) return `<h1>JOBS</h1><p class="phone-small">quiet tonight.</p>`;

  const mods = window.RAWarRoomJobs.nightModifiers();
  const modLine = mods.length ? `<p class="phone-small">TONIGHT: ${mods.map(m => esc(m.label)).join(' · ')}</p>` : '';

  return `<h1>TONIGHT'S JOBS</h1>
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
  const kindLabel = job.isShowdown ? '⚔ SHOWDOWN' : '🚗 RUN';
  const recs = (job.recommended || []).join(' / ');
  const showdownNote = job.isShowdown ? `<br><span class="phone-small">⚠ F01_INTEGRATION_PENDING</span>` : '';
  const rewardLine = job.authoredReward ? formatRewardLine(job) : '';
  const heatLine = job.authoredHeat ? `HEAT: +${job.authoredHeat}` : '';
  return `<div class="phone-card war-room-job">
<b>${esc(job.label)}</b> · ${esc(job.districtLabel)}
<br>${kindLabel} · SQUAD: ${job.squadSize}
${rewardLine ? `<br>${esc(rewardLine)}` : ''}${heatLine ? ` · ${esc(heatLine)}` : ''}
${recs ? `<br>REC: ${esc(recs)}` : ''}
${showdownNote}
${btn('SELECT SQUAD', `do:warRoom:selectSquad:${i}`)}
</div>`;
 }

 function formatRewardLine(job) {
  const r = job.authoredReward;
  if (!r) return '';
  switch (r.type) {
   case 'cash_range':     return `REWARD: $${(r.min/1000)}K–$${(r.max/1000)}K`;
   case 'supply_range':   return `REWARD: +${r.min}–${r.max} SUPPLY`;
   case 'cash_and_rep':   return `REWARD: $${(r.cash/1000)}K + STREET REP`;
   case 'pressure_reduce':return `REWARD: RIVAL PRESSURE ${r.pressureDelta}`;
   default:               return '';
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
  if (hb.pending) return `<h1>HAND BACK</h1><p class="phone-small">the job is set. waiting on the showdown (F01_INTEGRATION_PENDING).</p>${btn('← BACK','app:warRoom')}`;
  return `<h1>HAND BACK THE BLOCKS</h1>
<div class="phone-card">
<b>RETURN TO DECEMBER.</b><br>
You keep everything. One last job.
</div>
${btn('HAND BACK', 'do:warRoom:handBack', 'phone-button-danger')}
${btn('NOT YET', 'app:warRoom')}`;
 }

 function renderSquadSelect(jobIndex) {
  const jobs = window.RAWarRoomJobs.buildNightMenu();
  const job = jobs[Number(jobIndex)];
  if (!job) return `<h1>SELECT SQUAD</h1><p class="phone-small">job not found.</p>${btn('← BACK','app:warRoom:jobs')}`;

  const active = window.RAWarRoomCrew.activeOgas();
  const cars = window.RAVehicles.list().filter(c => !c.service?.tributed);

  return `<h1>SELECT SQUAD</h1>
<b>${esc(job.label)}</b> · ${esc(job.districtLabel)}
<p class="phone-small">SQUAD SIZE: ${job.squadSize}</p>
${active.map(o => `<label class="phone-label">
<input type="checkbox" name="oga" value="${esc(o.id)}"> ${esc(o.name)} (${esc(o.class)})
</label>`).join('')}
<p class="phone-small">CAR:</p>
${cars.map(c => `<label class="phone-label">
<input type="radio" name="car" value="${esc(c.id)}"> ${esc(c.model || c.id)}
</label>`).join('')}
<p class="phone-small">APPROACH:</p>
${['QUIET','LOUD','OCTOPUS_BRAIN'].map(a => `<label class="phone-label">
<input type="radio" name="approach" value="${esc(a)}" ${a==='LOUD'?'checked':''}> ${a}
</label>`).join('')}
${btn(`RUN THE JOB`, `do:warRoom:runJob:${jobIndex}`)}
${btn('← BACK', 'app:warRoom:jobs')}`;
 }

 // ── Action handler ────────────────────────────────────────────────────────
 function onAction(act, arg, api) {
  if (act === 'accept') {
   window.RAFrag.patch('F04', 'offer.status', 'accepted');
   window.RAFrag.patch('F04', 'offer.acceptedOnDay', window.RALife.today().day);
   window.RAFrag.patch('F04', 'active', true);
   window.RAFrag.patch('F04', 'jobs.nightsSinceStart', 0);
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

  if (act === 'handBack') {
   const result = window.RAWarRoomJobs.initiateHandBack();
   if (!result.ok) {
    api.refresh();
    return;
   }
   api.refresh();
   return;
  }

  if (act === 'runJob') {
   const jobs = window.RAWarRoomJobs.buildNightMenu();
   const job = jobs[Number(arg)];
   if (!job) { api.refresh(); return; }

   // LAY LOW: no squad, no car, immediate resolution (Vol 7 §3.2: squad 0)
   if (job.type === 'LAY_LOW') {
    const resolution = window.RAWarRoomJobs.executeRun({
     jobCard: job,
     squad: [],
     carId: null,
     approach: 'LAY_LOW',
     playerChoices: null
    });
    window.RAWarRoomJobs.applyRunResult(resolution);
    window.RAWarRoomReportCard.record(resolution);
    const nights = window.RAFrag.read('F04', 'jobs.nightsSinceStart', 0);
    window.RAFrag.patch('F04', 'jobs.nightsSinceStart', nights + 1);
    api.refresh();
    return;
   }

   const active = window.RAWarRoomCrew.activeOgas();
   const squadIds = active.slice(0, job.squadSize).map(o => o.id);
   const cars = window.RAVehicles.list();
   const carId = cars[0]?.id || null;
   const approach = 'LOUD';

   if (job.isShowdown) {
    const packet = window.RAWarRoomShowdown.buildEntryPacket({ jobCard: job, squadIds, carId, approach });
    window.RAFrag.patch('F04', 'showdown.pendingJob', { jobCard: job, packet });
    api.refresh();
    return;
   }

   // RUN job: execute beats
   const squad = squadIds.map(id => window.RACrew.get(id));
   const resolution = window.RAWarRoomJobs.executeRun({
    jobCard: job,
    squad,
    carId,
    approach,
    playerChoices: null
   });
   window.RAWarRoomJobs.applyRunResult(resolution);
   window.RAWarRoomReportCard.record(resolution);

   const nights = window.RAFrag.read('F04', 'jobs.nightsSinceStart', 0);
   window.RAFrag.patch('F04', 'jobs.nightsSinceStart', nights + 1);

   api.refresh();
   return;
  }

  api.refresh();
 }

 // ── Main render ───────────────────────────────────────────────────────────
 function render(sub) {
  if (!window.RAFeatures.enabled(FLAG)) return '';

  if (!sub || sub === 'board') return renderBoard();
  if (sub === 'jobs') return renderJobs();
  if (sub === 'crew') return renderCrew();
  if (sub === 'reports') return renderReports();
  if (sub === 'handback') return renderHandBack();
  if (sub?.startsWith('squad:')) return renderSquadSelect(sub.slice(6));
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
