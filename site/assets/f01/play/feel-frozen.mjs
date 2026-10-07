// THE PLAY — FEEL LOCK frozen-art path table (FL-A01..A10). Pure data, no DOM: the headless test (tools/tests/f01/feel_lock_art.test.mjs) imports it and checks
// it against assets/f01/feel_lock/FREEZE_RECORD.json. Frozen PNGs are referenced byte-for-byte: never copied, recoloured, cropped or re-encoded.
const ASSETS='../../';                              // assets/f01/play/ -> assets/ (same base as feel-core.mjs)
// One table; nothing else in the PLAY hard-codes a feel_lock path: every frozen PNG is either referenced here or named in UNWIRED.
export const FL=ASSETS+'f01/feel_lock/';
const fl=(t,f)=>FL+t+'/'+f;
export const FL_ART={
 bed:{base:fl('FL-A01','bedroom_pov_base_270x480.png'),idle:fl('FL-A01','hand_phone_idle_270x480.png'),thumb:fl('FL-A01','thumb_typing_overlay_270x480.png')},
 base:{home:fl('FL-A02','base_return_270x480.png'),empty:fl('FL-A02','base_return_empty_270x480.png')},
 cash:Object.fromEntries([['small',1],['medium',2],['large',3]].map(([n,t])=>[t,{closed:fl('FL-A03',`cash_${n}_closed_128x96.png`),open:fl('FL-A03',`cash_${n}_open_128x96.png`)}])),
 counting:fl('FL-A03','rich_counting_hands_128x96.png'),
 oba:{native:fl('FL-A04','oba_de_gwinnett_visual_a_native_80x96.png')},
 exterior:Object.fromEntries(['boba_backroom','car_wash_stickup','counting_house','dock_restock','quiet_lift','smack_crib','tupperware','vampire_dentist','vampire_gala'].map(id=>[id,fl('FL-A05',id+'_exterior_270x480.png')])),
 oga:Object.fromEntries(['walking','boarding','standing','wounded','carried'].map(k=>[k,fl('FL-A07',`generic_oga_${k}_80x96.png`)])),
 weapon:{pistol:fl('FL-A08','pistol_24x24.png'),sprayer:fl('FL-A08','sprayer_24x24.png'),slipper:fl('FL-A08','slipper_24x24.png'),hands:fl('FL-A08','bare_hands_24x24.png')},
 cars:{HOOPTIE:{base:'hooptie_left',on:'hooptie_headlight_on',wrecked:'hooptie_wrecked',impounded:'hooptie_impounded'},S2000:{base:'s2000_left',on:'s2000_headlight_on',wrecked:'s2000_wrecked',impounded:'s2000_impounded'},URUS:{base:'urus_left',on:'urus_headlight_on',wrecked:'urus_wrecked',impounded:'urus_impounded'}},
 supra:{on:'supra_headlight_on_overlay',wrecked:'supra_wrecked_overlay',impounded:'supra_impounded_overlay'},
 chat:{bubble:fl('FL-A09','chat_bubble_64x24.png')},
 loot:{BLOOD_X:fl('FL-A10','blood_x_48x48.png'),CASH:fl('FL-A10','cash_48x48.png'),GUN:fl('FL-A10','gun_48x48.png'),MOD:fl('FL-A10','mod_48x48.png'),WEIRD:fl('FL-A10','weird_48x48.png')}
};
// frozen + authorized, deliberately NOT drawn by the runtime (no authorized placement): the Oba Visual A identity CARD is Ube's judgment sheet, and the
// FL-A09 bezel duplicates the phone already inside FL-A01's hand+phone layer.
export const UNWIRED=[fl('FL-A04','oba_de_gwinnett_visual_a_card_270x480.png'),fl('FL-A09','phone_bezel_270x480.png')];

// FL-A06 files: the three side-view cars are full images per state; the SUPRA (existing frozen sprite, unchanged) gets three additive overlays.
export const carPng=(id,state)=>FL+'FL-A06/'+FL_ART.cars[id][state]+'_136x50.png';
export const supraOverlay=state=>FL+'FL-A06/'+FL_ART.supra[state]+'_136x50.png';
// every frozen path the runtime draws (flat) — used by the headless test and the browser 404 sweep
export function frozenPaths(){
 const out=[],walk=v=>{if(typeof v==='string')out.push(v);else if(v&&typeof v==='object')Object.values(v).forEach(walk);};
 walk(FL_ART.bed);walk(FL_ART.base);walk(FL_ART.cash);out.push(FL_ART.counting);walk(FL_ART.oba);walk(FL_ART.exterior);walk(FL_ART.oga);walk(FL_ART.weapon);walk(FL_ART.chat);walk(FL_ART.loot);
 for(const id of Object.keys(FL_ART.cars))for(const st of Object.keys(FL_ART.cars[id]))out.push(carPng(id,st));
 for(const st of Object.keys(FL_ART.supra))out.push(supraOverlay(st));
 return out;
}
export {ASSETS};
