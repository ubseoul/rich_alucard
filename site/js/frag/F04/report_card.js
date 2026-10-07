(function(){
 'use strict';
 // F04 — PLAYMAKERS WAR ROOM — report_card.js
 // Builds and stores the Report Card after each job.
 // SOURCE: Vol 7 §7.3.
 // Format: VampGram post from @whosrunninLA — photo crop, caption, comments, tally.
 // "Bad nights look bad: grainy photo, a black ribbon emoji, one comment that just says 'damn.'"

 if (!window.RAFeatures?.get('F04.war_room')) return;

 const MAX_CARDS = 20; // keep last 20

 // Builds a report card object from a job resolution.
 function build(resolution) {
  if (!resolution) return null;
  const success = resolution.success || false;
  const gone = (resolution.squadIds || []).filter(id => {
   const u = window.RACrew.get(id);
   return u && u.status === 'GONE';
  });
  const downed = (resolution.squadIds || []).filter(id => {
   const u = window.RACrew.get(id);
   return u && u.status === 'DOWNED';
  });
  const captured = (resolution.squadIds || []).filter(id => {
   const u = window.RACrew.get(id);
   return u && u.status === 'CAPTURED';
  });

  const stories = [];
  for (const [ogaId, storyList] of Object.entries(resolution.newStories || {})) {
   const oga = window.RACrew.get(ogaId);
   for (const s of storyList) {
    stories.push({ oga: oga?.name || ogaId, key: s.key, line: s.line });
   }
  }

  const card = {
   id: `report_${resolution.jobId || resolution.day}`,
   day: resolution.day || window.RALife.today().day,
   district: resolution.district,
   districtLabel: (window.RADistricts.get(resolution.district))?.label || resolution.district,
   type: resolution.type,
   approach: resolution.approach,
   success,
   // Tally (Vol 7 §7.3): CASH / SUPPLY / HEAT / STREET REP / CREW STATUS / NEW STORIES / LOOT
   tally: {
    cash: resolution.cashDelta || 0,
    heat: resolution.heatDelta || 0,
    crewStatus: {
     active: (resolution.squadIds || []).filter(id => {
      const u = window.RACrew.get(id); return u && u.status === 'ACTIVE';
     }).length,
     downed: downed.length,
     captured: captured.length,
     gone: gone.length
    },
    newStories: stories.length,
    loot: resolution.loot || null
   },
   // Visual style (Vol 7 §7.3)
   style: success ? 'clean' : 'rough',
   grainyPhoto: !success,
   blackRibbon: gone.length > 0,
   // Comments (VampGram post style)
   comments: buildComments({ success, gone }),
   // Squad detail
   squad: (resolution.squadIds || []).map(id => {
    const u = window.RACrew.get(id);
    return u ? { id, name: u.name, status: u.status, class: u.class } : { id, status: 'unknown' };
   }),
   newStories: stories
  };

  return card;
 }

 function buildComments({ success, gone }) {
  const comments = [];
  if (!success) {
   comments.push({ handle: 'vamp_commentor_1', text: 'damn.' }); // Vol 7 §7.3
  }
  if (gone.length > 0) {
   gone.forEach(id => {
    const u = window.RACrew.get(id);
    if (u) comments.push({ handle: 'vamp_commentor_2', text: `🖤` });
   });
  }
  return comments;
 }

 // Save a report card and fire VampGram post.
 function record(resolution) {
  const card = build(resolution);
  if (!card) return null;

  const cards = window.RAFrag.read('F04', 'reportCards', []);
  cards.push(card);
  if (cards.length > MAX_CARDS) cards.shift();
  window.RAFrag.patch('F04', 'reportCards', cards);

  // VampGram post
  window.RAWarRoomVG?.postReportCard?.({
   jobId: card.id,
   district: card.district,
   success: card.success,
   cashDelta: card.tally.cash,
   heatDelta: card.tally.heat,
   crewStatus: card.tally.crewStatus
  });

  return card;
 }

 // Return the last N report cards.
 function recent(n = 5) {
  const cards = window.RAFrag.read('F04', 'reportCards', []);
  return cards.slice(-n).reverse();
 }

 // Mark-up for the phone app (compact card view).
 function markup(card) {
  if (!card) return '';
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const ribbonEmoji = card.blackRibbon ? ' 🖤' : '';
  const styleClass = card.style === 'rough' ? 'report-card rough' : 'report-card clean';
  const tally = card.tally;
  return `<div class="${styleClass}">
<p class="phone-speaker">@whosrunninLA${ribbonEmoji}</p>
<b>${esc(card.districtLabel)} — DAY ${card.day}</b>
<br>${card.success ? '✓ CLEAN RUN' : '✗ ROUGH NIGHT'}
<br>CASH: ${tally.cash >= 0 ? '+' : ''}$${esc(tally.cash.toLocaleString())}
HEAT: ${tally.heat >= 0 ? '+' : ''}${tally.heat}
<br>CREW: ${tally.crewStatus.active} active${tally.crewStatus.downed ? `, ${tally.crewStatus.downed} downed` : ''}${tally.crewStatus.captured ? `, ${tally.crewStatus.captured} CAPTURED` : ''}${tally.crewStatus.gone ? `, ${tally.crewStatus.gone} GONE` : ''}
${tally.newStories ? `<br>NEW STORIES: ${tally.newStories}` : ''}
${card.comments.map(c => `<br><span class="phone-small">@${esc(c.handle)} · ${esc(c.text)}</span>`).join('')}
${card.newStories.map(s => `<br><span class="phone-small">${esc(s.oga)}: <i>${esc(s.line)}</i></span>`).join('')}
</div>`;
 }

 window.RAWarRoomReportCard = Object.freeze({ build, record, recent, markup });
})();
