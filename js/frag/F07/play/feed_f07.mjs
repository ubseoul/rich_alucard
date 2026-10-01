// F07 — wrapper of F01's LIVE FEED for F07's own PLAY page ONLY (assets/f07/play/index.html maps F01's feed.mjs to this module with an import
// map; F01's page and files are untouched). It re-exports F01's feed unchanged and wraps createFeed so that the F07-owned Phase 1 events
// (AUNTIES, CANOPY POLE) ALWAYS produce their narration step when the beat occurs: F01's feed shows a card line only if it wins a small per-stage
// budget, which would let essential gameplay feedback disappear. Every other beat's steps are returned exactly as F01 produced them.
import * as real from '../../F01/play/feed.mjs?f07-real';
import {EVENT_NARRATION} from './owambe.mjs';
export * from '../../F01/play/feed.mjs?f07-real';
export function createFeed(opts){
 const F=real.createFeed(opts);const beat=F.beat;
 F.beat=function(evt,fx){
  const steps=beat.call(this,evt,fx);
  const text=evt&&evt.card&&EVENT_NARRATION[evt.card.id];
  if(!text)return steps;
  const crew=(evt.snap&&evt.snap.crew)||[],who=(crew.find(c=>c.state==='UP')||crew[0]||{}).id||null;
  // an EVENT bubble (uppercase system narration), outside the feed budget; the card's own hazard (aim / cause) is the engine's, unchanged
  return [{t:'say',who,text,kind:'EVENT',shake:0,red:1,typing:0,interrupted:false,pause:1700,f07:true},...steps];
 };
 return F;
}
