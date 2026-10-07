// OL-050: preserve accepted F07 events and add the trigger-gated authored event.
import * as real from '../../frag/F07/play/feed_f07.mjs?build3-real';
export * from '../../frag/F07/play/feed_f07.mjs?build3-real';
export function createFeed(opts){
 const F=real.createFeed(opts),beat=F.beat;
 F.beat=function(evt,fx){
  const steps=beat.call(this,evt,fx),card=evt&&evt.card;
  if(!card||card.id!=='NO-S1')return steps;
  return [{t:'say',who:null,text:card.text,kind:'EVENT',shake:0,red:1,typing:0,interrupted:false,pause:1700,f07:true},...steps];
 };
 return F;
}
