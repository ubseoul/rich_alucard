// THE PLAY — FEEL LOCK placeholder art. Frozen art is untouched; anything new that production needs is an F12 asset ticket
// (docs/engineering/F01_FEEL_LOCK_ASSET_TICKETS.md). Everything here is CSS/SVG or an existing frozen sprite used as-is.
import {ASSETS,BTF} from './feel-core.mjs';

const PKG=BTF+'art_ship_014/package_e/E-gun-';
// weapon TYPE first (readable), in-world nickname second
export const GUN_VIEW={
 pistol:{type:'PISTOL',nick:'',img:PKG+'lil_oga-held.png'},
 lil_oga:{type:'PISTOL',nick:'Lil Oga',img:PKG+'lil_oga-held.png'},
 sapporo_shotgun:{type:'SHOTGUN',nick:'Sapporo Shotgun',img:PKG+'sapporo_shotgun-held.png'},
 chopstick_sniper:{type:'SNIPER',nick:'Chopstick Sniper',img:PKG+'chopstick_sniper-held.png'},
 mac_and_cheese:{type:'SPRAYER',nick:'Mac & Cheese',img:PKG+'holy_baby_drake-held.png'},
 auntie_slipper:{type:'SLIPPER',nick:"Auntie's Slipper",img:null,svg:`<svg viewBox="0 0 32 16"><path d="M3 11 Q3 5 12 5 L26 7 Q30 8 29 11 Q28 14 22 14 L6 14 Q3 14 3 11Z" fill="#c8475b" stroke="#120c1c" stroke-width="1.5"/><path d="M8 6 Q16 2 24 7" fill="none" stroke="#f0c9a0" stroke-width="2"/></svg>`},
 hands:{type:'BARE HANDS',nick:'',img:null,svg:`<svg viewBox="0 0 32 16"><rect x="6" y="4" width="8" height="8" rx="3" fill="#b9805a" stroke="#120c1c" stroke-width="1.4"/><rect x="18" y="4" width="8" height="8" rx="3" fill="#b9805a" stroke="#120c1c" stroke-width="1.4"/></svg>`}
};
export const gunView=g=>GUN_VIEW[g]||GUN_VIEW.pistol;
export const gunImg=(g,w=34,h=17)=>{const v=gunView(g);return v.img?`<img src="${v.img}" style="width:${w}px;height:${h}px;object-fit:contain">`:`<span style="display:inline-block;width:${w}px;height:${h}px">${v.svg}</span>`;};

// ---- cars (side view, facing LEFT as drawn; the scene flips them to drive right). The SUPRA is the frozen JDM sprite; the rest are placeholders.
const INK='#120c1c';
export const CAR_ART={
 SUPRA:{img:ASSETS+'jdm_imports/vehicles/supra_mk4_world.png',w:136,h:50},
 HOOPTIE:{w:136,h:50,svg:`<svg viewBox="0 0 136 50" shape-rendering="crispEdges"><rect x="6" y="22" width="124" height="16" rx="3" fill="#b79a63" stroke="${INK}" stroke-width="2"/><path d="M30 22 L42 8 H92 L106 22Z" fill="#a08650" stroke="${INK}" stroke-width="2"/><path d="M45 11 H63 V22 H35Z M67 11 H90 L101 22 H67Z" fill="#37d5e8" opacity=".8"/><rect x="2" y="26" width="6" height="7" fill="#fff7c2"/><rect x="128" y="26" width="6" height="6" fill="#ff3b4d"/><circle cx="60" cy="30" r="4" fill="#8a3a1a" opacity=".7"/><rect x="82" y="26" width="12" height="4" fill="#8a3a1a" opacity=".6"/><g fill="#0b0b12"><circle cx="32" cy="38" r="8"/><circle cx="106" cy="38" r="8"/></g><g fill="#777"><circle cx="32" cy="38" r="3.5"/><circle cx="106" cy="38" r="3.5"/></g></svg>`},
 S2000:{w:120,h:44,svg:`<svg viewBox="0 0 120 44" shape-rendering="crispEdges"><path d="M4 26 Q6 18 22 16 L44 12 L70 12 L96 18 Q116 20 116 28 L116 34 L4 34Z" fill="#e0284a" stroke="${INK}" stroke-width="2"/><path d="M46 14 L68 14 L84 19 L46 19Z" fill="#37d5e8" opacity=".85"/><rect x="2" y="24" width="6" height="5" fill="#fff7c2"/><rect x="112" y="26" width="5" height="5" fill="#ff3b4d"/><g fill="#0b0b12"><circle cx="28" cy="34" r="7.5"/><circle cx="92" cy="34" r="7.5"/></g><g fill="#c8ccdf"><circle cx="28" cy="34" r="3"/><circle cx="92" cy="34" r="3"/></g></svg>`},
 URUS:{w:150,h:54,svg:`<svg viewBox="0 0 150 54" shape-rendering="crispEdges"><path d="M4 30 Q4 20 16 18 L40 10 H102 L124 18 Q146 20 146 30 L146 40 L4 40Z" fill="#1e1a2e" stroke="${INK}" stroke-width="2"/><path d="M44 13 H70 V26 H36Z M74 13 H100 L118 26 H74Z" fill="#37d5e8" opacity=".8"/><rect x="2" y="28" width="7" height="6" fill="#fff7c2"/><rect x="141" y="28" width="7" height="6" fill="#ff3b4d"/><rect x="10" y="36" width="130" height="3" fill="#6a5acd"/><g fill="#0b0b12"><circle cx="34" cy="41" r="9.5"/><circle cx="116" cy="41" r="9.5"/></g><g fill="#777"><circle cx="34" cy="41" r="4"/><circle cx="116" cy="41" r="4"/></g></svg>`}
};
export const carHTML=id=>{const c=CAR_ART[id]||CAR_ART.HOOPTIE;return c.img?`<img src="${c.img}" style="width:${c.w}px;height:${c.h}px">`:c.svg;};
export const carSize=id=>{const c=CAR_ART[id]||CAR_ART.HOOPTIE;return {w:c.w,h:c.h};};

// ---- cash. Bag scale lives in world.mjs (pure, F13-tunable): SMALL = 1 duffel · MEDIUM = 2-3 bags · LARGE = a visibly stacked haul.
export {BAG_TIERS,bagTier,bagCount} from '../../../js/frag/F01/play/world.mjs';
export function duffelSVG(open){
 return `<svg viewBox="0 0 40 26"><ellipse cx="20" cy="24.5" rx="17" ry="2" fill="#0007"/>${open?'<rect x="8" y="2" width="9" height="6" fill="#6fd07d" stroke="#2c7a3a" transform="rotate(-8 12 5)"/><rect x="20" y="0" width="10" height="6" fill="#6fd07d" stroke="#2c7a3a" transform="rotate(10 25 3)"/>':''}<path d="M12 8 Q20 -4 28 8" fill="none" stroke="#222" stroke-width="2.4"/><rect x="3" y="7" width="34" height="16" rx="7" fill="#1f2d24" stroke="#0b120e" stroke-width="1.5"/><path d="M6 12 H34" stroke="#3a4a40" stroke-width="1.5"/><rect x="17" y="10" width="6" height="5" rx="1" fill="#c9a227"/><text x="20" y="20.5" font-size="7" text-anchor="middle" fill="#6fd07d" font-family="monospace" font-weight="700">$</text></svg>`;
}

// ---- OBA DE GWINNETT — placeholder silhouette ONLY. His look goes through F12 Visual A + Ube; nothing here is his design.
export const obaSilhouette=(w=60,h=110)=>`<svg viewBox="0 0 60 110" width="${w}" height="${h}" aria-label="silhouette placeholder"><path d="M30 6 L44 18 L36 20 L36 30 Q44 34 46 52 L50 104 L36 104 L34 70 L30 104 L26 70 L24 104 L10 104 L14 52 Q16 34 24 30 L24 20 L16 18Z" fill="#05050a" stroke="#3a1230" stroke-width="1.5"/><circle cx="27" cy="26" r="1.6" fill="#ff2a3d"/><circle cx="33" cy="26" r="1.6" fill="#ff2a3d"/></svg>`;

// ---- Rich in bed (POV, hand + phone). PLACEHOLDER: an asset ticket (F12) replaces it with pixel art. Skin tone matches Rich's face plate.
export const RICH_SKIN='#7a5638';
export const richBed=()=>`<svg class="bedpov" viewBox="0 0 270 480" preserveAspectRatio="none" aria-hidden="true">
 <defs><linearGradient id="blk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a0710"/><stop offset="1" stop-color="#12030a"/></linearGradient></defs>
 <path d="M0 430 Q60 396 135 404 Q210 396 270 428 L270 480 L0 480Z" fill="url(#blk)"/>
 <path d="M0 448 Q70 424 135 432 Q200 424 270 446" fill="none" stroke="#5a0a1c" stroke-width="2" opacity=".7"/>
 <ellipse cx="18" cy="60" rx="34" ry="60" fill="#2a0810" opacity=".9"/><ellipse cx="256" cy="52" rx="30" ry="52" fill="#2a0810" opacity=".9"/>
</svg>`;
export const richHand=()=>`<svg class="handpov" viewBox="0 0 270 480" preserveAspectRatio="none" aria-hidden="true">
 <path d="M218 480 Q226 420 224 372 L250 372 Q262 420 270 480Z" fill="#14141e" stroke="#000" stroke-width="1.5"/>
 <path d="M222 372 Q224 340 232 318 L248 322 Q250 350 250 372Z" fill="${RICH_SKIN}" stroke="#000" stroke-width="1.5"/>
 <rect x="228" y="292" width="10" height="34" rx="5" fill="${RICH_SKIN}" stroke="#000" stroke-width="1.4"/>
 <rect x="238" y="286" width="10" height="38" rx="5" fill="${RICH_SKIN}" stroke="#000" stroke-width="1.4"/>
 <rect x="248" y="292" width="10" height="34" rx="5" fill="${RICH_SKIN}" stroke="#000" stroke-width="1.4"/>
 <rect x="30" y="330" width="12" height="30" rx="6" fill="${RICH_SKIN}" stroke="#000" stroke-width="1.4" transform="rotate(-10 36 345)"/>
 <path d="M28 372 Q40 350 66 366 L60 384 Q40 388 28 372Z" fill="${RICH_SKIN}" stroke="#000" stroke-width="1.4" opacity=".0"/>
</svg>`;
