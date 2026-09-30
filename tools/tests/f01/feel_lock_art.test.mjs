// F01 THE PLAY — FEEL LOCK FROZEN ART integration (FL-A01..FL-A10). Deterministic, headless. Proves the runtime references exactly the frozen batch
// (assets/f01/feel_lock/FREEZE_RECORD.json — an exact copy of the record on art/f01-feel-lock-freeze @ 61a8a55): 54 PNGs present and byte-identical to the recorded SHA-256, every one either drawn or explicitly unwired,
// the FL-A01 compositor contract matches the real pixels and the CSS, and the SOURCE_REQUIRED gaps were NOT filled with invented art.
// The browser side (real pixels on screen, 404s, console errors, 360/390/430) is tools/tests/f01/play-sim/feel_gate.mjs + feel_lock_art_browser.mjs.
import assert from 'node:assert/strict';
import path from 'node:path';import {pathToFileURL} from 'node:url';import fs from 'node:fs';import zlib from 'node:zlib';import crypto from 'node:crypto';

// minimal 8-bit non-interlaced PNG reader (RGB / RGBA) — enough to count the transparent screen opening
function readPng(buf){
 assert.equal(buf.subarray(0,8).toString('hex'),'89504e470d0a1a0a','PNG signature');
 let o=8,w=0,h=0,ct=0,idat=[];
 while(o<buf.length){const n=buf.readUInt32BE(o),t=buf.toString('ascii',o+4,o+8),d=buf.subarray(o+8,o+8+n);
  if(t==='IHDR'){w=d.readUInt32BE(0);h=d.readUInt32BE(4);assert.equal(d[8],8,'8-bit');ct=d[9];assert.equal(d[12],0,'non-interlaced');}
  if(t==='IDAT')idat.push(d);o+=12+n;}
 const bpp=ct===6?4:3,raw=zlib.inflateSync(Buffer.concat(idat)),stride=w*bpp,px=Buffer.alloc(h*stride);
 for(let y=0;y<h;y++){const f=raw[y*(stride+1)],src=raw.subarray(y*(stride+1)+1,(y+1)*(stride+1)),dst=px.subarray(y*stride,(y+1)*stride),up=y?px.subarray((y-1)*stride,y*stride):Buffer.alloc(stride);
  for(let i=0;i<stride;i++){const a=i>=bpp?dst[i-bpp]:0,b=up[i],c=i>=bpp?up[i-bpp]:0;
   dst[i]=(src[i]+(f===0?0:f===1?a:f===2?b:f===3?((a+b)>>1):(()=>{const p=a+b-c,pa=Math.abs(p-a),pb=Math.abs(p-b),pc=Math.abs(p-c);return pa<=pb&&pa<=pc?a:pb<=pc?b:c;})()))&255;}}
 return {w,h,bpp,px};
}

export async function test(root){
 const play=path.join(root,'assets','f01','play');
 const rec=JSON.parse(fs.readFileSync(path.join(root,'assets','f01','feel_lock','FREEZE_RECORD.json'),'utf8'));
 const contract=JSON.parse(fs.readFileSync(path.join(root,'assets','f01','feel_lock','FL-A01_COMPOSITOR_CONTRACT.json'),'utf8'));
 const FZ=await import(pathToFileURL(path.join(play,'feel-frozen.mjs')).href);
 let bad=0;const check=(c,m)=>{if(!c){bad++;console.error('FROZEN-ART VIOLATION: '+m);}assert(c,m);};

 // ---- 1 the freeze: 54 exact PNG byte streams
 check(rec.items.length===54&&rec.accepted_native_asset_count===54,'freeze record lists 54 PNGs');
 const byTicket={};for(const it of rec.items)byTicket[it.ticket]=(byTicket[it.ticket]||0)+1;
 check(JSON.stringify(byTicket)===JSON.stringify({'FL-A01':3,'FL-A02':2,'FL-A03':7,'FL-A04':2,'FL-A05':9,'FL-A06':15,'FL-A07':5,'FL-A08':4,'FL-A09':2,'FL-A10':5}),'freeze counts per ticket');
 const prod=new Set();
 for(const it of rec.items){
  const f=path.join(root,it.production_path);check(fs.existsSync(f),'frozen asset present: '+it.production_path);
  const b=fs.readFileSync(f);check(crypto.createHash('sha256').update(b).digest('hex')===it.sha256,'byte-identical to the freeze (SHA-256): '+it.production_path);
  const png=readPng(b);check(png.w===it.size[0]&&png.h===it.size[1],'frozen size kept: '+it.production_path);
  check(!prod.has(it.production_path),'no duplicate freeze entry');prod.add(it.production_path);}
 const supra=path.join(root,rec.existing_frozen_supra);
 check(crypto.createHash('sha256').update(fs.readFileSync(supra)).digest('hex')===rec.existing_frozen_supra_sha256,'existing frozen SUPRA sprite is byte-identical');

 // ---- 2 the runtime references exactly the frozen batch: every path resolves, nothing is referenced that is not frozen, nothing frozen is silently dropped
 const toRepo=p=>path.posix.normalize(path.posix.join('assets/f01/play',p));
 const drawn=FZ.frozenPaths().map(toRepo),unwired=FZ.UNWIRED.map(toRepo);
 check(new Set(drawn).size===drawn.length,'no frozen path is listed twice');
 for(const p of drawn)check(fs.existsSync(path.join(root,p)),'runtime path resolves (no 404): '+p);
 const all=new Set([...drawn,...unwired]);
 check([...all].sort().join('|')===[...prod].sort().join('|'),`runtime = drawn(${drawn.length}) + explicitly unwired(${unwired.length}) = the 54 frozen PNGs exactly`);
 check(unwired.length===2&&unwired.every(p=>/oba_de_gwinnett_visual_a_card|phone_bezel/.test(p)),'only the Oba Visual A judgment card and the redundant phone bezel are unwired');

 // ---- 3 nothing else in the runtime hard-codes a feel_lock path; no stray PNG beside the frozen set
 for(const f of fs.readdirSync(play).filter(f=>/\.(mjs|css|html)$/.test(f))){
  const src=fs.readFileSync(path.join(play,f),'utf8');
  if(f==='feel-frozen.mjs')continue;
  const hits=[...src.matchAll(/feel_lock\/FL-[^'"`)\s]+/g)].map(m=>m[0]);
  if(f==='feel.css')check(hits.length===1&&hits[0]==='feel_lock/FL-A09/chat_bubble_64x24.png'&&FZ.FL_ART.chat.bubble.endsWith(hits[0]),'feel.css references only the frozen FL-A09 bubble skin');
  else check(hits.length===0,`${f} does not hard-code feel_lock paths (${hits.join(',')})`);
 }
 const onDisk=[];const walk=d=>{for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);e.isDirectory()?walk(p):onDisk.push(path.relative(root,p).split(path.sep).join('/'));}};walk(path.join(root,'assets','f01','feel_lock'));
 const pngs=onDisk.filter(f=>f.endsWith('.png')),other=onDisk.filter(f=>!f.endsWith('.png')).sort();
 check(pngs.sort().join('|')===[...prod].sort().join('|'),'assets/f01/feel_lock holds exactly the 54 frozen PNGs (no extra, edited or derived images)');
 check(other.join('|')==='assets/f01/feel_lock/FL-A01_COMPOSITOR_CONTRACT.json|assets/f01/feel_lock/FREEZE_RECORD.json','the only other files are the freeze record and the FL-A01 compositor contract (exact copies)');

 // ---- 4 FL-A01 compositor contract vs the real pixels and the CSS
 check(contract.idle_layer==='FL-A01/hand_phone_idle_270x480.png'&&FZ.FL_ART.bed.idle.endsWith(contract.idle_layer),'idle layer is the contract idle layer');
 check(FZ.FL_ART.bed.thumb.endsWith(contract.thumb_typing_layer),'thumb overlay is the contract thumb layer');
 check(/reuse idle layer/.test(contract.jolt),'JOLT reuses the idle layer (code shake, no extra art)');
 const idle=readPng(fs.readFileSync(path.join(root,'assets/f01/feel_lock',contract.idle_layer)));
 const [dx0,dy0,dx1,dy1]=contract.dom_rectangle;let clear=0,inside=0,minX=1e9,minY=1e9,maxX=-1,maxY=-1;
 for(let y=0;y<idle.h;y++)for(let x=0;x<idle.w;x++){if(idle.px[(y*idle.w+x)*4+3]===0){
  // the transparent screen opening (the hand/phone art's own alpha edge around the figure is outside the phone body)
  if(x>=dx0&&x<dx1&&y>=dy0&&y<dy1){inside++;}}}
 for(let y=dy0;y<dy1;y++)for(let x=dx0;x<dx1;x++){const a=idle.px[(y*idle.w+x)*4+3];if(a!==0&&a!==255)check(false,'binary alpha inside the screen rectangle');if(a===0){clear++;minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);}}
 check(clear===contract.screen_transparent_pixels,`screen opening = ${contract.screen_transparent_pixels} transparent pixels (${clear})`);
 check(minX>=dx0&&maxX<dx1&&minY>=dy0&&maxY<dy1,'the opening lies inside the DOM rectangle');
 const css=fs.readFileSync(path.join(play,'feel.css'),'utf8');
 const ph=/\.phone\{[^}]*\}/.exec(css)[0];
 const n=k=>+new RegExp(k+':(\\d+)px').exec(ph)[1];
 check(n('left')===dx0&&n('top')===dy0&&n('width')===dx1-dx0&&n('height')===dy1-dy0,`live phone DOM = contract rectangle [${contract.dom_rectangle}] (${ph})`);
 check(!/transform|border:|box-shadow/.test(ph),'the live screen carries no border, shadow or rotation of its own (the frozen phone is the frame)');
 const base=readPng(fs.readFileSync(path.join(root,'assets/f01/feel_lock/FL-A01/bedroom_pov_base_270x480.png')));
 // the base is the approved DEEP-RED bed: red pixels dominate the frame (the hand + phone are part of the accepted base)
 let red=0;
 for(let i=0;i<base.px.length;i+=3){const r=base.px[i],g=base.px[i+1],b=base.px[i+2];if(r>=70&&g<=50&&b<=70&&r>=2.5*g)red++;}
 check(red/(base.w*base.h)>0.3,`FL-A01 base is the deep-red bed (${(100*red/(base.w*base.h)).toFixed(0)}% deep-red pixels)`);

 // ---- 5 placed where the freeze authorizes: generic template only, loot categories only for the five frozen pieces
 const cars=Object.keys(FZ.FL_ART.cars).concat(['SUPRA']);check(cars.sort().join()==='HOOPTIE,S2000,SUPRA,URUS','FL-A06 covers HOOPTIE / S2000 / URUS (+ the existing SUPRA)');
 for(const id of Object.keys(FZ.FL_ART.cars))check(['base','on','wrecked','impounded'].every(k=>FZ.FL_ART.cars[id][k]),`${id} has base + headlight + wrecked + impounded`);
 check(Object.keys(FZ.FL_ART.supra).sort().join()==='impounded,on,wrecked','SUPRA gets exactly the three additive overlays');
 check(Object.keys(FZ.FL_ART.exterior).sort().join()==='boba_backroom,car_wash_stickup,counting_house,dock_restock,quiet_lift,smack_crib,tupperware,vampire_dentist,vampire_gala','FL-A05: one exterior per offense job');
 await import(pathToFileURL(path.join(root,'tools','tests','f01','play-sim','driver.mjs')).href);   // publishes the F01 globals the play modules read
 const C=await import(pathToFileURL(path.join(root,'js','frag','F01','play','content.mjs')).href);
 const offenseIds=C.JOBS.filter(j=>!j.defense).map(j=>j.id).sort().join();check(offenseIds===Object.keys(FZ.FL_ART.exterior).sort().join(),'every offense job id has its frozen exterior; HOLD THE HOUSE keeps the castle');
 check(Object.keys(FZ.FL_ART.oga).sort().join()==='boarding,carried,standing,walking,wounded'&&Object.values(FZ.FL_ART.oga).every(p=>/generic_oga_/.test(p)),'FL-A07: only the GENERIC template states are wired');
 check(Object.keys(FZ.FL_ART.loot).sort().join()==='BLOOD_X,CASH,GUN,MOD,WEIRD','FL-A10: only BLOOD_X / CASH / GUN / MOD / WEIRD have frozen pieces');
 for(const cat of ['RECRUIT','STORY','DISTRICT'])check(!(cat in FZ.FL_ART.loot),`${cat} loot stays SOURCE_REQUIRED (no invented substitute)`);
 check(rec.not_frozen_source_required.some(t=>/FL-A07 named Oga/.test(t))&&rec.not_frozen_source_required.some(t=>/RECRUIT, STORY, DISTRICT/.test(t)),'freeze record names both SOURCE_REQUIRED gaps');
 check(Object.values(FZ.FL_ART.oga).every(p=>!/tunde|dre|half_pint|sunday_best|young_mazi|auntie_grit/.test(p)),'no named-Oga state sprite exists or is referenced');
 const art=fs.readFileSync(path.join(play,'feel-art.mjs'),'utf8');
 check(/hasSprite=o=>!!o&&o\.named===false/.test(art),'only un-named (generic) Ogas use the FL-A07 template');
 check(!/obaSilhouette|duffelSVG|richBed|richHand/.test(art+fs.readFileSync(path.join(play,'feel-scenes.mjs'),'utf8')),'the retired placeholders (Oba silhouette, SVG duffel, SVG bed / hand) are gone');
 check(!/E-blood_held/.test(fs.readFileSync(path.join(play,'feel-scenes.mjs'),'utf8')),'Blood X uses the frozen FL-A10 piece');
 check(bad===0,'frozen art integration violations: '+bad);
}
