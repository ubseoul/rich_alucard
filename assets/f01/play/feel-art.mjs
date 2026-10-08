// THE PLAY — FEEL LOCK art. FL-A01..A10 are the FROZEN F01 batch (assets/f01/feel_lock/FREEZE_RECORD.json, 54 exact PNGs under
// assets/f01/feel_lock/). They are referenced byte-for-byte: never copied, recoloured, cropped or re-encoded. Anything the freeze does NOT
// cover is tracked separately: the approved P-D family supplies named-Oga states and RECRUIT / STORY / DISTRICT symbolic tokens.
import {PD_ART} from './pd-art.mjs';
import {ASSETS,BTF} from './feel-core.mjs';
import {FL,FL_ART,UNWIRED,carPng,supraOverlay,frozenPaths} from './feel-frozen.mjs';
export {FL,FL_ART,UNWIRED,frozenPaths};
// Player-feedback return: code-authored pixel alley, independent of frozen castle base art.
export const RETURN_BASE={home:'../../../assets/player_feedback/play-return-alley.svg',empty:'../../../assets/player_feedback/play-return-alley.svg'};

const PKG=BTF+'art_ship_014/package_e/E-gun-';
// weapon TYPE first (readable), in-world nickname second. PISTOL / SPRAYER / SLIPPER / BARE HANDS are the frozen FL-A08 24x24 icons (sq = square icon, drawn at integer scale).
export const GUN_VIEW={
 pistol:{type:'PISTOL',nick:'',img:FL_ART.weapon.pistol,sq:true},
 lil_oga:{type:'PISTOL',nick:'Lil Oga',img:PKG+'lil_oga-held.png'},
 sapporo_shotgun:{type:'SHOTGUN',nick:'Sapporo Shotgun',img:PKG+'sapporo_shotgun-held.png'},
 chopstick_sniper:{type:'SNIPER',nick:'Chopstick Sniper',img:PKG+'chopstick_sniper-held.png'},
 mac_and_cheese:{type:'SPRAYER',nick:'Mac & Cheese',img:FL_ART.weapon.sprayer,sq:true},
 auntie_slipper:{type:'SLIPPER',nick:"Auntie's Slipper",img:FL_ART.weapon.slipper,sq:true},
 hands:{type:'BARE HANDS',nick:'',img:FL_ART.weapon.hands,sq:true}
};
let ironViews={};
export function bindGunViews(iron){ironViews=Object.fromEntries(Object.values(iron?.weapons||{}).map(g=>[g.id,{...(GUN_VIEW[g.id]||GUN_VIEW.pistol),...(g.held?{img:'../../../'+g.held,sq:false}:{}),type:g.type,nick:g.label,audio:g.audio}]));}
export const gunView=g=>ironViews[g]||GUN_VIEW[g]||GUN_VIEW.pistol;
// wide sprites fit (w,h); square 24x24 icons draw at the largest integer scale that fits the slot height (1x in the 13px crew slot)
export const gunImg=(g,w=34,h=17)=>{const v=gunView(g);if(v.sq){const k=Math.max(1,Math.floor(h/13)),s=24*k;return `<img src="${v.img}" style="width:${s}px;height:${s}px">`;}return `<img src="${v.img}" style="width:${w}px;height:${h}px;object-fit:contain">`;};

// ---- cars (side view, facing LEFT as drawn; the scene flips them to drive right). HOOPTIE / S2000 / URUS are the frozen FL-A06 side views; the SUPRA is the
// existing frozen JDM sprite + three frozen additive overlays. Every car carries its headlight-on / wrecked / impounded state art.
const carArt=id=>({img:carPng(id,'base'),w:136,h:50,lights:{img:carPng(id,'on'),swap:true},wrecked:{img:carPng(id,'wrecked'),swap:true},impounded:{img:carPng(id,'impounded'),swap:true}});
export const CAR_ART={
 SUPRA:{img:ASSETS+'jdm_imports/vehicles/supra_mk4_world.png',w:136,h:50,lights:{img:supraOverlay('on')},wrecked:{img:supraOverlay('wrecked')},impounded:{img:supraOverlay('impounded')}},
 HOOPTIE:carArt('HOOPTIE'),S2000:carArt('S2000'),URUS:carArt('URUS')
};
const carOf=id=>CAR_ART[id]||CAR_ART.HOOPTIE;
// a car is its base + its headlight layer (`.car.on` shows it; a swap layer replaces the base, an overlay layer sits on top). state: 'wrecked' | 'impounded' draws that state instead.
export const carHTML=(id,state)=>{
 const c=carOf(id),s=state&&c[state];
 if(s)return s.swap?`<img class="c-base" src="${s.img}" alt="">`:`<img class="c-base" src="${c.img}" alt=""><img class="c-ovl" src="${s.img}" alt="">`;
 return `<img class="c-base" src="${c.img}" alt=""><img class="c-on${c.lights.swap?' swap':''}" src="${c.lights.img}" alt="">`;
};
export const carSize=id=>{const c=carOf(id);return {w:c.w,h:c.h};};

// ---- cash. Bag scale lives in world.mjs (pure, F13-tunable): SMALL = 1 duffel · MEDIUM = 2-3 bags · LARGE = a visibly stacked haul. FL-A03 paints each tier as one haul.
export {BAG_TIERS,bagTier,bagCount} from '../../../js/frag/F01/play/world.mjs';
export const cashHaul=(tier,open)=>{const t=FL_ART.cash[tier]||FL_ART.cash[1];return open?t.open:t.closed;};

// ---- OBA DE GWINNETT — the frozen FL-A04 native sprite (80x96), drawn at 2x. The Visual A identity CARD is Ube's judgment sheet and is not a runtime asset.
export const obaSprite=()=>`<img src="${FL_ART.oba.native}" width="160" height="192" alt="" aria-label="Oba de Gwinnett">`;

// ---- Full-body Ogas: the original generic template plus the six separately approved P-D state families.
export const OGA_POSES=Object.keys(FL_ART.oga);
export const ogaSprite=(pose,id=null)=>PD_ART.ogas[id]?.[pose]||PD_ART.ogas[id]?.standing||FL_ART.oga[pose]||FL_ART.oga.standing;
export const hasSprite=o=>!!o&&(o.named===false||!!PD_ART.ogas[o.id]);
export const ogaContact=(pose,id)=>PD_ART.ogas[id]?88:({boarding:78,carried:68}[pose]||88);

// ---- Rich in bed (POV, hand + phone) — FL-A01. base = the red bed; idle = forearm/hand/phone with a binary-alpha screen opening (live chat shows through);
// thumb = the additive typing overlay. JOLT is code shake of the rig (phone DOM + idle + thumb); the base never moves.
export const bedBase=()=>`<img class="bg bedpov" src="${FL_ART.bed.base}" alt="" aria-hidden="true">`;
export const handIdle=()=>`<img class="handpov" src="${FL_ART.bed.idle}" alt="" aria-hidden="true">`;
export const thumbOverlay=()=>`<img class="thumbpov" src="${FL_ART.bed.thumb}" alt="" aria-hidden="true">`;
export const loot=cat=>FL_ART.loot[cat]||PD_ART.tokens[cat]||null;
