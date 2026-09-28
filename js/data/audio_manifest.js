(function(){
  // RA AUDIO MANIFEST — schema 2.1 (see docs/RA_Sound_Deployment_Plan_HQ.md §2).
  //
  // This file is the SINGLE registration point for game audio. Scene/system code must call the engine by ID
  // (RAAudio.sfx('UI_TAP')) and never reference a file path directly.
  //
  // M1 (CORE FEEL: UI & Phone, Home & Castle) and M2 (COMBAT) slots are declared here from the approved plan.
  // `file` is intentionally null until HQ accepts the Finder delivery, processes it and encodes the runtime MP3s
  // into `assets/audio/sfx/<category>/` (§1 pipeline steps 2–5). No audio is invented and no missing asset is
  // requested at runtime: the engine only decodes entries with a truthy `file` + `registered:true`.
  //
  // To register an accepted sound, fill the row's `file` (and optional `variations`/`loopStart`/`loopEnd`) and set
  // `registered:true`, plus `license`/`credit` when required (§2.2 "no credit line, no ship").
  const BUS_DEFAULTS={MUSIC:.70,SFX:.90,UI:.60,VOICE:.80,AMBIENCE:.45};
  const SCHEMA='2.1';
  const categories={ui_phone:'ui_phone',home_castle:'home_castle',combat:'combat'};
  const clamp=(n,min,max)=>Math.min(max,Math.max(min,Number.isFinite(Number(n))?Number(n):min));
  const rows=[];
  function row(id,bus,type,category,extra={}){
    const entry={id,bus,type,gain:extra.gain??1,loopStart:extra.loopStart??null,loopEnd:extra.loopEnd??null,variations:[],pitchJitter:extra.pitchJitter??0,maxVoices:extra.maxVoices??3,priority:extra.priority??3,file:null,expectedPath:`assets/audio/sfx/${category}/${id}.mp3`,category,license:null,credit:null,registered:false};
    rows.push(entry);return entry;
  }
  const ui=(id,type='one-shot',extra={})=>row(id,'UI',type,'ui_phone',extra);
  const voice=(id,extra={})=>row(id,'VOICE','one-shot','ui_phone',extra);
  const music=(id,extra={})=>row(id,'MUSIC','one-shot','ui_phone',extra);
  const home=(id,type='one-shot',extra={})=>row(id,extra.bus||(id.startsWith('AMB_')?'AMBIENCE':'SFX'),type,'home_castle',extra);
  const combat=(id,type='one-shot',extra={})=>row(id,extra.bus||'SFX',type,'combat',extra);

  // ---- M1 — UI & PHONE ----
  ui('UI_TAP',{pitchJitter:.03,maxVoices:3,priority:2});
  ui('UI_MOVE',{pitchJitter:.03,maxVoices:2,priority:2});
  ui('UI_CONFIRM',{pitchJitter:.02,maxVoices:2,priority:3});
  ui('UI_BACK',{maxVoices:2,priority:2});
  ui('UI_ERROR',{maxVoices:2,priority:3});
  ui('UI_DIALOG_ADVANCE',{maxVoices:2,priority:1});
  voice('UI_TEXT_BLIP_RICH',{pitchJitter:.04,maxVoices:1,priority:1});
  voice('UI_TEXT_BLIP_NPC_LOW',{pitchJitter:.03,maxVoices:1,priority:1});
  voice('UI_TEXT_BLIP_NPC_MID',{pitchJitter:.03,maxVoices:1,priority:1});
  voice('UI_TEXT_BLIP_NPC_HIGH',{pitchJitter:.03,maxVoices:1,priority:1});
  voice('UI_TEXT_BLIP_GHOST',{pitchJitter:.05,maxVoices:1,priority:1});
  ui('PHONE_OPEN',{maxVoices:1,priority:4});
  ui('PHONE_CLOSE',{maxVoices:1,priority:4});
  ui('PHONE_APP_OPEN',{pitchJitter:.02,maxVoices:2,priority:3});
  ui('NOTIF_GENERIC',{pitchJitter:.02,maxVoices:4,priority:3});
  ui('NOTIF_TEXT',{pitchJitter:.02,maxVoices:4,priority:4});
  ui('NOTIF_VAMPGRAM',{pitchJitter:.02,maxVoices:4,priority:4});
  ui('NOTIF_INSTAHOE',{pitchJitter:.02,maxVoices:4,priority:4});
  ui('NOTIF_FAMILY',{pitchJitter:.02,maxVoices:4,priority:4});
  ui('NOTIF_STORM',{maxVoices:8,priority:5});
  ui('CASH_IN',{maxVoices:2,priority:3});
  ui('CASH_OUT',{maxVoices:2,priority:3});
  ui('APP_UNLOCK',{maxVoices:1,priority:5});
  ui('CONTACT_ADDED',{maxVoices:2,priority:4});
  ui('WHATWEON_UPDATE',{maxVoices:1,priority:3});
  ui('RADIO_SWITCH',{maxVoices:1,priority:3});
  ui('TRAVEL_WHOOSH',{maxVoices:1,priority:4});
  music('REWARD_STINGER',{maxVoices:1,priority:5,ducksMusic:true});
  ui('SAVE',{maxVoices:1,priority:2});

  // ---- M1 — HOME & CASTLE ----
  home('AMB_BEDROOM','loop',{maxVoices:1,priority:2});
  home('AMB_THRONE','loop',{maxVoices:1,priority:2});
  home('AMB_CASTLE_STREET','loop',{maxVoices:1,priority:2});
  home('BED_RUSTLE',{pitchJitter:.04,maxVoices:2});
  home('WAKE_STRETCH',{maxVoices:1});
  home('STEPS_STONE',{pitchJitter:.05,maxVoices:2});
  home('DOOR_CASTLE',{maxVoices:1});
  home('BAT_FLUTTER',{pitchJitter:.04,maxVoices:2});
  home('ROOM_BUILT',{maxVoices:1,priority:4});
  home('CAT_MEOW',{pitchJitter:.05,maxVoices:2});
  home('CAT_PURR','loop',{maxVoices:1});
  row('SNEEZE','VOICE','one-shot','home_castle',{maxVoices:1});
  home('KITCHEN_AMB','loop',{maxVoices:1});
  home('TV_ROOM','loop',{maxVoices:1});

  // ---- M2 — COMBAT ----
  combat('BATTLE_START',{maxVoices:1,priority:5});
  combat('TELEGRAPH',{maxVoices:2,priority:4});
  combat('HIT_LIGHT',{pitchJitter:.05,maxVoices:3,priority:3});
  combat('HIT_HEAVY',{pitchJitter:.03,maxVoices:3,priority:4});
  combat('MISS',{maxVoices:2,priority:2});
  combat('CRIT',{maxVoices:2,priority:4});
  combat('HEAL',{maxVoices:2,priority:3});
  combat('BUFF',{maxVoices:2,priority:3});
  combat('DEBUFF',{maxVoices:2,priority:3});
  combat('STUN',{maxVoices:2,priority:3});
  combat('KO',{maxVoices:1,priority:5});
  combat('VICTORY',{bus:'MUSIC',maxVoices:1,priority:5,ducksMusic:true});
  combat('DEFEAT',{bus:'MUSIC',maxVoices:1,priority:5,ducksMusic:true});
  combat('MOVE_BLOODBATH',{maxVoices:2,priority:4});
  combat('MOVE_BITE',{maxVoices:2,priority:4});
  combat('MOVE_OCTOPUS',{maxVoices:2,priority:4});
  combat('MOVE_REVENGE',{maxVoices:2,priority:4});
  combat('MOVE_ONEINCH',{maxVoices:2,priority:4});
  combat('ITEM_CAN',{maxVoices:2,priority:3});
  combat('ITEM_EAT',{maxVoices:2,priority:3});
  combat('ITEM_SLURP',{maxVoices:2,priority:3});
  combat('COMPANION_CALL',{maxVoices:2,priority:3});
  combat('GUNWEAVE',{maxVoices:2,priority:3});
  combat('GUN_LILOGA',{maxVoices:3,priority:4});
  combat('GUN_SHOTGUN',{maxVoices:2,priority:4});
  combat('GUN_SNIPER',{maxVoices:2,priority:4});
  combat('GUN_HOLYDRAKE',{maxVoices:2,priority:4});
  combat('GUN_RPG',{maxVoices:2,priority:4});
  combat('GUN_KRATOS',{maxVoices:2,priority:4});
  combat('MAGIC_HEX',{maxVoices:2,priority:3});
  combat('MAGIC_VEIL',{maxVoices:2,priority:3});
  combat('MAGIC_SEANCE',{maxVoices:2,priority:3});
  combat('MAGIC_RINGER',{maxVoices:2,priority:3});
  combat('EN_BRIEFCASE',{maxVoices:2,priority:3});
  combat('EN_SHOVE',{maxVoices:2,priority:3});
  combat('EN_BONES',{maxVoices:2,priority:3});
  combat('EN_SWORD',{maxVoices:2,priority:3});
  combat('EN_SHIELD',{maxVoices:2,priority:3});
  combat('EN_POOF',{maxVoices:2,priority:3});
  combat('EN_CHARGE','loop',{maxVoices:1,priority:3});
  row('EN_SCREAM','VOICE','one-shot','combat',{maxVoices:1,priority:4});
  combat('EN_LUNCHBOX',{maxVoices:2,priority:3});
  combat('EN_STAKE',{maxVoices:2,priority:3});
  combat('EN_CHEW','loop',{maxVoices:1,priority:3});
  combat('EN_LUTE',{maxVoices:2,priority:3});
  combat('EN_HOLY',{maxVoices:2,priority:3});
  row('EN_KIAI','VOICE','one-shot','combat',{maxVoices:1,priority:3});
  combat('EN_HOWL',{maxVoices:1,priority:4});

  // ---- world/life seams ---- (M1.5 wiring hooks for budget/life/relations/phone; slots are M1 UI rows)
  // Scene preload/bed declarations (§3.3 Preload by scene). Engine preloads on scene enter, releases on exit.
  const resident=['UI_TAP','UI_MOVE','UI_CONFIRM','UI_BACK','UI_ERROR','PHONE_OPEN','PHONE_CLOSE','PHONE_APP_OPEN','NOTIF_GENERIC'];
  const scenes={
    bedroom:{ambience:'AMB_BEDROOM',preload:['BED_RUSTLE','WAKE_STRETCH','CAT_MEOW']},
    throne:{ambience:'AMB_THRONE',preload:['DOOR_CASTLE','STEPS_STONE','BAT_FLUTTER']},
    battle:{ambience:null,preload:['BATTLE_START','TELEGRAPH','HIT_LIGHT','HIT_HEAVY','CRIT','KO','VICTORY','DEFEAT','MOVE_BLOODBATH','MOVE_BITE','MOVE_OCTOPUS','MOVE_REVENGE']},
    phone:{ambience:null,preload:['NOTIF_TEXT','NOTIF_VAMPGRAM','CASH_IN','CASH_OUT','APP_UNLOCK','SAVE']},
    castle:{ambience:'AMB_CASTLE_STREET',preload:['DOOR_CASTLE','ROOM_BUILT']}
  };

  const index=new Map(rows.map(entry=>[entry.id,entry]));
  function get(id){return index.get(id)||null}
  function list(){return rows.map(entry=>({...entry}))}
  function register(entry){
    if(!entry||!entry.id)return null;
    const existing=index.get(entry.id);
    const merged=existing?Object.assign(existing,entry):null;
    if(!merged){const fresh={...entry};index.set(fresh.id,fresh);rows.push(fresh);return fresh;}
    return merged;
  }
  window.RAAudioManifest={schema:SCHEMA,busDefaults:{...BUS_DEFAULTS},resident:[...resident],scenes:JSON.parse(JSON.stringify(scenes)),ids:rows.map(entry=>entry.id),get,has:id=>index.has(id),list,register};
})();
