(function(){
 'use strict';
 // F04 — PLAYMAKERS WAR ROOM — vampgram.js
 // Registers the @whosrunla VampGram account and the authored one-time world reactions.
 // SOURCE: Vol 7 §7.3 (Report Card: "@whosrunninLA"), §2 (The Offer world reactions).
 //
 // CANON GUARDS:
 //   - Do not author post text beyond authored lines; placeholder text is clearly marked.
 //   - Owner-controlled phone surfaces are not touched.
 //   - The family thread is untouched (Mom still asks if he ate — the contrast is the point).

 if (!window.RAFeatures?.get('F04.war_room')) return;

 // Register the anonymous underworld VampGram account (Vol 7 §7.3).
 window.RAVampGramAPI.registerAccount({
  handle: 'whosrunla',
  fragment: 'F04',
  flag: 'F04.war_room',
  displayName: '@whosrunninLA',
  avatar: null, // no avatar art key — anonymous account
  meta: { role: 'underground reporter' }
 });

 // ── One-time world reactions (Vol 7 §2) ─────────────────────────────────
 // Fired once when the route is accepted. Non-VampGram reactions use existing systems.
 // What they say is sealed (HQ writes December's lines; Ube may overwrite Rich's line).
 // We fire only the authored hooks; we do not author the lines themselves.

 function fireWorldReactions() {
  const reactions = window.RAFrag.read('F04', 'reactions', {});

  // Officer Nodd stops nodding and starts staring.
  if (!reactions.officerNoddStaring) {
   window.RAFrag.patch('F04', 'reactions.officerNoddStaring', true);
   window.RAState.patch('life.world.flags.noddStaring', true);
  }

  // Nneka's next conversation goes quiet (flag for the adventure system to pick up).
  if (!reactions.nnekaSilent) {
   window.RAFrag.patch('F04', 'reactions.nnekaSilent', true);
   window.RAFrag.patch('F04', 'reactions.nnekaSilentPending', true);
  }

  // Bllad33's next hookah night has one line about it.
  if (!reactions.bllad33HookahLine) {
   window.RAFrag.patch('F04', 'reactions.bllad33HookahLine', true);
   window.RAFrag.patch('F04', 'reactions.bllad33HookahPending', true);
  }

  // VampGram: tone about Rich shifts from "cute baby vamp" to "who is he working with"
  if (!reactions.vampgramToneShifted) {
   window.RAFrag.patch('F04', 'reactions.vampgramToneShifted', true);
   // Post from the underground account (no authored text — owner supplies)
   window.RAVampGramAPI.post('whosrunla', {
    id: 'war_room:tone_shift:1',
    text: '…who is he working with.', // PLACEHOLDER — owner may overwrite
    likes: 0
   });
  }
 }

 // ── Report Card post (Vol 7 §7.3) ───────────────────────────────────────
 // Called by report_card.js after each job resolution.
 // "Styled as a VampGram post from @whosrunninLA"
 function postReportCard({ jobId, district, success, cashDelta, heatDelta, crewStatus, newStories }) {
  if (!window.RAFeatures.enabled('F04.war_room')) return false;
  // Deduplicate by jobId
  const posted = window.RAFrag.read('F04', 'vgPosts', {});
  const key = `report:${jobId}`;
  if (posted[key]) return false;

  const text = success
   ? `${district.replace(/_/g,' ').toUpperCase()} — clean run. +\$${cashDelta?.toLocaleString?.() || '?'}` // PLACEHOLDER photo caption format
   : `${district.replace(/_/g,' ').toUpperCase()} — rough night.`; // bad-night format (Vol 7 §7.3)

  const comments = [];
  if (!success) {
   comments.push({ handle: 'vamp_commentor_1', text: 'damn.' }); // Vol 7 §7.3: "one comment that just says 'damn.'"
  }

  const result = window.RAVampGramAPI.post('whosrunla', {
   id: key,
   text,
   likes: success ? Math.floor(Math.random() * 20) + 5 : 0,
   comments
  });

  if (result) {
   const next = { ...posted, [key]: true };
   window.RAFrag.patch('F04', 'vgPosts', next);
  }
  return result;
 }

 // ── YOUNG PLAYMAKER VampGram tone (Vol 7 §2, §0) ──────────────────────
 // "VampGram starts calling him YOUNG PLAYMAKER" — this is the world-reaction post.
 function postYoungPlaymaker() {
  if (!window.RAFeatures.enabled('F04.war_room')) return false;
  const posted = window.RAFrag.read('F04', 'vgPosts', {});
  const key = 'war_room:young_playmaker';
  if (posted[key]) return false;

  const result = window.RAVampGramAPI.post('whosrunla', {
   id: key,
   text: 'YOUNG PLAYMAKER.', // Vol 7 §2 — the title
   likes: 84
  });
  if (result) {
   window.RAFrag.patch('F04', 'vgPosts', { ...window.RAFrag.read('F04', 'vgPosts', {}), [key]: true });
  }
  return result;
 }

 window.RAWarRoomVG = Object.freeze({
  fireWorldReactions,
  postReportCard,
  postYoungPlaymaker
 });
})();
