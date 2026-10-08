// OL-050: authored sealed event cards use the existing EVENT feed bubble.
import * as real from '../../frag/F01/play/feed.mjs?build3-real';
export * from '../../frag/F01/play/feed.mjs?build3-real';
export const authoredEvent=(evt,steps)=>{
 const card=evt&&evt.card,id=card&&card.id;
 if(!id||!(/^(P2-(?:wrong|chewer|bait-)|P4-(?:coffe|cover)|P5-)/.test(id)))return steps;
 return [{t:'say',who:null,text:card.text,kind:'EVENT',shake:0,red:1,typing:0,interrupted:false,pause:1700},...steps];
};
export function createFeed(opts){const F=real.createFeed(opts),beat=F.beat;F.beat=function(evt,fx){return authoredEvent(evt,beat.call(this,evt,fx));};return F;}
