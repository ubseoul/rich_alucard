(function(){
 'use strict';
 // F04 — PLAYMAKERS WAR ROOM — phone_app.js
 // Registers the WAR ROOM phone app with RAPhoneRegistry (IF-1 4D).
 // Invisible while F04.war_room is OFF — no phone surface is touched until the flag is on.
 // SOURCE: Vol 7 §3 (War Room UI), §7.4 (War Room table visual language).
 //
 // Browser UX: 360/390/430 mobile widths supported via class-based responsive layout.
 // The War Room app renders: BOARD (district map), JOBS (tonight's menu), CREW, REPORTS.

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
  const kindLabel = job.isShowdown ? '⚔ SHOWDOWN' : '🚗 RUN';
  const recs = (job.recommended || []).join(' / ');
  const showdownNote = job.isShowdown ? `<br><span class="phone-small">⚠ F01_INTEGRATION_PENDING</span>` : '';
  return `<div class="phone-card war-room-job">
<b>${esc(job.label)}</b> · ${esc(job.districtLabel)}
<br>${kindLabel} · SQUAD: ${job.squadSize}
${recs ? `<br>REC: ${esc(recs)}` : ''}
${showdownNote}
${btn('SELECT SQUAD', `do:warRoom:selectSquad:${i}`)}
</div>`;
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
   // Rich accepts The Offer
   window.RAFrag.patch('F04', 'offer.status', 'accepted');
   window.RAFrag.patch('F04', 'offer.acceptedOnDay', window.RALife.today().day);
   window.RAFrag.patch('F04', 'active', true);
   window.RAFrag.patch('F04', 'jobs.nightsSinceStart', 0);
   // Fire world reactions
   window.RAWarRoomVG.fireWorldReactions();
   window.RAWarRoomVG.postYoungPlaymaker();
   // Unlock the phone app with a badge
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
   // The hand-back Showdown is F01_INTEGRATION_PENDING
   // We show the pending state; when F01 resolves it calls RAWarRoomShowdown.receiveResolution
   api.refresh();
   return;
  }

  if (act === 'runJob') {
   // Simplified: in the real UI, the player selects squad/car/approach from the squad-select form.
   // Here we pick auto-defaults for the MVP (form parsing requires native DOM; handled by a future
   // bridge when the phone scene supports multi-input forms).
   const jobs = window.RAWarRoomJobs.buildNightMenu();
   const job = jobs[Number(arg)];
   if (!job) { api.refresh(); return; }

   const active = window.RAWarRoomCrew.activeOgas();
   const squadIds = active.slice(0, job.squadSize).map(o => o.id);
   const cars = window.RAVehicles.list();
   const carId = cars[0]?.id || null;
   const approach = 'LOUD';

   if (job.isShowdown) {
    // Showdown: build entry packet; tactical execution is F01_INTEGRATION_PENDING
    const packet = window.RAWarRoomShowdown.buildEntryPacket({ jobCard: job, squadIds, carId, approach });
    // Store the pending job for when F01 is ready
    window.RAFrag.patch('F04', 'showdown.pendingJob', { jobCard: job, packet });
    api.refresh();
    return;
   }

   // RUN job: execute beats (auto-player for MVP — real choices come from beat UI sub-view)
   const squad = squadIds.map(id => window.RACrew.get(id));
   const resolution = window.RAWarRoomJobs.executeRun({
    jobCard: job,
    squad,
    carId,
    approach,
    playerChoices: null // auto-choose first option for now
   });
   window.RAWarRoomJobs.applyRunResult(resolution);
   window.RAWarRoomReportCard.record(resolution);

   // Track nights in
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
