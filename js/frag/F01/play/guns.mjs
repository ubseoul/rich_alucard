// BUILD-2: per-request F02 stats, shared by the browser and headless PLAY.
// Legacy GUNS remain untouched. Missing F02 => the exact accepted weapon path.
import * as C from './content.mjs';
export function weapon(P,id){
 const legacy=C.GUNS[id]||C.GUNS.pistol;
 const g=P.iron?.weapons?.[id],st=g?.stats;
 if(!st)return legacy;
 let dmg,hits=st.hits||1;
 const m=/^(\d+)\s*[x×]\s*(\d+)$/i.exec(String(st.damage));
 const range=/^(\d+)\s*[-–]\s*(\d+)$/.exec(String(st.damage));
 if(m){dmg=[+m[1],+m[1]];hits=+m[2];}
 else if(range)dmg=[+range[1],+range[2]];
 else if(Number.isFinite(+st.damage))dmg=[+st.damage,+st.damage];
 if(!dmg)return legacy;
 return {...legacy,name:g.label,dmg,hits,lane:st.range==='long'?'BACK':st.range==='close'?'FRONT':legacy.lane,mods:st.mods||[],bonuses:st.bonuses||{},
  condition:id==='blueberry_blaster'?'mazdaMajestic':null,audio:g.audio,
  distinctTargets:id==='sapporo_shotgun'};
}
export const known=(P,id)=>!!C.GUNS[id]||!!P.iron?.weapons?.[id];
