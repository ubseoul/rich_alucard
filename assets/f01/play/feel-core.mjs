// THE PLAY — FEEL LOCK (OL-023) presentation core: the 270x480 portrait stage, motion helpers, audio, shake, settings.
// Presentation only. Everything the player sees is derived from engine events (see feel-ui.mjs); nothing here knows a rule.
import {store} from './ui-core.mjs';

export const ASSETS='../../';                      // assets/f01/play/ -> assets/
export const BTF=ASSETS+'before_the_fame/';
export const SFXP=ASSETS+'audio/sfx/';
const Q=new URLSearchParams(location.search);

// ------------------------------------------------------------------------------------------------ settings (F01's own namespace)
export const settings={
 get(){const d={sound:true,moreTime:false,reduceMotion:!!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)};return {...d,...store.get('feel_settings',{})};},
 set(p){store.set('feel_settings',{...settings.get(),...p});applySettings();}
};
export function applySettings(){const s=settings.get();document.documentElement.classList.toggle('reduce',!!s.reduceMotion);muted=!s.sound;if(muted)duck(true);else duck(false);}
export const reduced=()=>!!settings.get().reduceMotion;
export const moreTime=()=>!!settings.get().moreTime;

// ------------------------------------------------------------------------------------------------ time
// ?speed=N runs the whole thing N times faster (tests). ?fast=x is the old sandbox switch (x = wait multiplier).
export const SPEED=+Q.get('speed')||(Q.get('fast')?1/(+Q.get('fast')||1):1);
export const sleep=ms=>new Promise(r=>setTimeout(r,Math.max(0,ms)/SPEED));

// ------------------------------------------------------------------------------------------------ stage
export const stage=document.getElementById('stage');
export const world=document.getElementById('world');
export const fadeEl=document.getElementById('fade');
export function fit(){
 const s=Math.min(innerWidth/270,innerHeight/480);
 stage.style.transform=`scale(${s})`;stage.style.left=(innerWidth-270*s)/2+'px';stage.style.top=(innerHeight-480*s)/2+'px';
 document.documentElement.style.setProperty('--u',s+'px');
}
addEventListener('resize',fit);fit();

export function el(cls,html,parent,css){
 const d=document.createElement('div');if(cls)d.className=cls;if(html!=null)d.innerHTML=html;if(css)Object.assign(d.style,css);(parent||world).appendChild(d);return d;
}
export const pos=(e,x,y,w,h)=>{e.style.left=x+'px';e.style.top=y+'px';if(w!=null)e.style.width=w+'px';if(h!=null)e.style.height=h+'px';return e;};
export function anim(e,kf,ms,o={}){
 const r=reduced();const a=e.animate(kf,{duration:Math.max(1,(r?ms*.4:ms)/SPEED),fill:'forwards',easing:'ease-in-out',...o});
 return a.finished.catch(()=>{});
}
export const fadeTo=(v,ms)=>anim(fadeEl,[{opacity:+getComputedStyle(fadeEl).opacity},{opacity:v}],ms,{easing:'linear'}).then(()=>{fadeEl.style.opacity=v;});
export const clear=()=>{world.innerHTML='';world.style.transform='';};
export function bg(name,filter){
 const i=document.createElement('img');i.className='bg';i.src=/^\.\.?\//.test(name)?name:BTF+'environments/'+name;if(filter)i.style.filter=filter;world.appendChild(i);return i;
}
export const BG={street:'street_night/street_night_270x480.png',room:'portobello_bedroom/portobello_beige_bedroom_270x480.png',museum:'castle_exterior/castle_exterior_night_270x480.png',castle:'castle_exterior/castle_exterior_night_270x480.png',garage:'garage/castle_garage_empty_270x480.png'};
export const wait=ms=>sleep(ms);

// ------------------------------------------------------------------------------------------------ physical feedback (never nauseating, always optional)
// LIGHT shake for ordinary hits and danger; STRONG shake for major danger. REDUCE MOTION replaces shake with a brief red pulse (no movement).
let shaking=0;
export function shake(level,target=world){
 if(!level)return;pulse(level);
 if(reduced())return;
 const a=level>=2?5:2,ms=level>=2?520:240;const n=level>=2?9:5;
 const kf=[];for(let i=0;i<=n;i++){const k=1-i/n;kf.push({transform:`translate(${(Math.random()*2-1)*a*k}px,${(Math.random()*2-1)*a*k}px) rotate(${(Math.random()*2-1)*(level>=2?.8:.3)*k}deg)`});}
 kf.push({transform:'none'});
 shaking++;target.animate(kf,{duration:ms/SPEED,easing:'linear'}).finished.catch(()=>{}).then(()=>{shaking--;});
 vibrate(level>=2?[60,40,90]:[35]);
}
export function pulse(level){
 const p=document.getElementById('pulse')||(()=>{const d=document.createElement('div');d.id='pulse';stage.appendChild(d);return d;})();
 p.animate([{opacity:level>=2?.55:.3},{opacity:0}],{duration:(level>=2?700:380)/SPEED,easing:'ease-out'});
}
const vibrate=p=>{try{if(!reduced()&&navigator.vibrate)navigator.vibrate(p);}catch(e){}};

// ------------------------------------------------------------------------------------------------ audio
// Existing library sounds only (assets/audio/sfx: ui_phone, combat, touge, home_castle, locations). No SEAL_* / BX stingers. Muted-safe and autoplay-safe.
export const audio={log:[]};
if(typeof window!=='undefined')window.__raFeelAudio=audio.log;
let muted=false,ducked=false,AC=null;const live=new Set();
const CACHE={};
export function unlock(){try{if(!AC){AC=new (window.AudioContext||window.webkitAudioContext)();}if(AC.state==='suspended')AC.resume();}catch(e){}}
function tone(f,d,type='sine',v=.05,slide){
 if(muted||ducked||!AC)return;
 try{const o=AC.createOscillator(),g=AC.createGain(),t=AC.currentTime;o.type=type;o.frequency.setValueAtTime(f,t);if(slide)o.frequency.exponentialRampToValueAtTime(slide,t+d);
  g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(AC.destination);o.start(t);o.stop(t+d+.02);}catch(e){}
}
export function play(path,{vol=.5,loop=false,rate=1}={}){
 audio.log.push(path.split('/').pop());if(audio.log.length>300)audio.log.shift();
 if(muted)return null;
 try{const a=new Audio(SFXP+path);a.volume=ducked?0:vol;a.loop=loop;a.playbackRate=rate;a._vol=vol;live.add(a);a.addEventListener('ended',()=>live.delete(a));a.play().catch(()=>{});return a;}catch(e){return null;}
}
export function stopAll(){for(const a of [...live]){try{a.pause();}catch(e){}live.delete(a);}}
// a SUDDEN SOUND DROP: everything goes quiet (the silence beat)
export function duck(on){ducked=!!on;for(const a of live){try{a.volume=on?0:(a._vol??.5);}catch(e){}}}
let ironAudio={};
export function bindGunAudio(iron){ironAudio=Object.fromEntries(Object.values(iron?.weapons||{}).filter(g=>g.audio).map(g=>[g.id,g.audio]));}
export const S={
 tap:()=>play('ui_phone/UI_TAP.mp3',{vol:.4}),
 confirm:()=>play('ui_phone/UI_CONFIRM.mp3',{vol:.5}),
 buzz:()=>{play('ui_phone/NOTIF_GENERIC.mp3',{vol:.6});tone(110,.22,'sawtooth',.08);},
 text:()=>play('ui_phone/NOTIF_TEXT.mp3',{vol:.45}),
 phoneOpen:()=>play('ui_phone/PHONE_OPEN.mp3',{vol:.5}),
 rich:()=>play('ui_phone/UI_TEXT_BLIP_RICH.mp3',{vol:.4}),
 tick:()=>tone(2000+Math.random()*300,.025,'square',.03),
 cashIn:()=>play('ui_phone/CASH_IN.mp3',{vol:.55}),
 stinger:()=>play('ui_phone/REWARD_STINGER.mp3',{vol:.55}),
 thud:()=>tone(120,.18,'sine',.22,40),
 heart:()=>{tone(55,.12,'sine',.28,35);setTimeout(()=>tone(50,.14,'sine',.2,32),170/SPEED);},
 gun:(g)=>ironAudio[g]?.startsWith('GN_')?play('iron_and_grace/'+ironAudio[g]+'.mp3',{vol:.22}):play('combat/'+(({sapporo_shotgun:'GUN_SHOTGUN',lil_oga:'GUN_LILOGA',chopstick_sniper:'GUN_SNIPER',the_rpg:'GUN_RPG'})[g]||'GUN_LILOGA')+'.mp3',{vol:.22}),
 hit:()=>play('combat/HIT_HEAVY.mp3',{vol:.25}),
 ko:()=>play('combat/KO.mp3',{vol:.3}),
 room:()=>play('home_castle/AMB_BEDROOM.mp3',{vol:.25,loop:true}),
 rustle:()=>play('home_castle/BED_RUSTLE.mp3',{vol:.35}),
 curb:()=>play('locations/AMB_CURB.mp3',{vol:.25,loop:true}),
 engine:(car,kind='idle',vol=.4)=>play('touge/'+(({SUPRA:'CAR_I6_TURBO',S2000:'CAR_4CYL_HIGHREV',URUS:'CAR_V8_SUV',HOOPTIE:'CAR_4CYL_HIGHREV'})[car]||'CAR_4CYL_HIGHREV')+'__'+kind+'.mp3',{vol}),
 squeal:()=>play('touge/TIRE_SQUEAL__start.mp3',{vol:.4}),
 door:()=>play('home_castle/DOOR_CASTLE.mp3',{vol:.35}),
 crateGlow:()=>play('touge/COMBO_UP.mp3',{vol:.35}),
 gasp:()=>play('combat/CROWD_GASP.mp3',{vol:.35})
};
