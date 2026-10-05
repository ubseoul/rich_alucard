// Pure logic test for DANCE FLOOR (RC2 B3). Run via npm test (tools/release.mjs loads every *-test.mjs here).
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert';

const __dirname=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(__dirname,'..','..');

export async function test(){
 const window={};
 const document={createElement:()=>({style:{},addEventListener(){},append(){},remove(){}}),head:{appendChild(){}},body:{classList:{add(){},remove(){}}},querySelector:()=>null};
 const sandbox={window,document,performance:{now:()=>Date.now()},requestAnimationFrame:()=>0,cancelAnimationFrame(){},console,localStorage:{getItem:()=>null,setItem(){}}};
 window.window=window;window.document=document;vm.createContext(sandbox);
 for(const file of ['js/engine/pixel.js','js/engine/minigames.js','js/minigames/juice.js','js/minigames/dance.js']){
  vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),sandbox,{filename:file});
 }
 const logic=window.RAMinigameLogic?.dance;
 assert.ok(logic,'RAMinigameLogic.dance must exist');
 const def=window.RAMinigames.get('dance');
 assert.ok(def,'dance must be registered');
 assert.ok(typeof def.rule==='string'&&def.rule.split(/[.!?]/).filter(Boolean).length===1,'dance has a one-sentence rule');
 assert.strictEqual(logic.MOVES.length,4,'four moves');
 assert.deepStrictEqual(Array.from(logic.MOVES,m=>m.id),['up','spin','shake','dip']);
 assert.ok(logic.MOVES.some(m=>m.label==='HANDS UP'),'HANDS UP is a move');

 // the chart: deterministic, ordered, gentle
 const a=logic.makeChart('seed-a'),b=logic.makeChart('seed-a'),c=logic.makeChart('seed-b');
 assert.deepStrictEqual(JSON.parse(JSON.stringify(a)),JSON.parse(JSON.stringify(b)),'same seed, same chart');
 assert.notDeepStrictEqual(JSON.parse(JSON.stringify(a)),JSON.parse(JSON.stringify(c)),'different seed, different chart');
 assert.strictEqual(a.length,logic.DEFAULTS.notes);
 for(let i=1;i<a.length;i++)assert.ok(a[i].t>=a[i-1].t+500,'notes are at least half a second apart (no jams)');
 assert.ok(a.slice(0,6).every(n=>n.lane<2),'the first six moves use only two lanes (easy to learn)');
 assert.ok(a.slice(0,14).every(n=>n.lane<3),'the first fourteen use at most three lanes');
 assert.ok(a.every(n=>n.lane>=0&&n.lane<4));
 for(let i=2;i<a.length;i++)assert.ok(!(a[i].lane===a[i-1].lane&&a[i].lane===a[i-2].lane&&a[i].lane===(a[i-3]||{}).lane),'never four of the same move in a row');
 const songSeconds=(a.at(-1).t+1400+logic.DEFAULTS.leadMs)/1000;
 assert.ok(songSeconds>=20&&songSeconds<=45,`a song is quick (${songSeconds.toFixed(1)}s)`);

 // judging windows are generous
 const cfg=logic.DEFAULTS;
 assert.strictEqual(logic.judge(0,cfg),'perfect');
 assert.strictEqual(logic.judge(-100,cfg),'perfect');
 assert.strictEqual(logic.judge(200,cfg),'good');
 assert.strictEqual(logic.judge(260,cfg),null);
 assert.ok(cfg.goodMs>=220&&cfg.perfectMs>=100,'windows are forgiving');

 // taps only pick a note that is in range and in that lane
 const notes=[{t:1000,lane:1,judged:null},{t:1000,lane:2,judged:null},{t:2000,lane:1,judged:null}];
 assert.strictEqual(logic.pickNote(notes,1,900,cfg),notes[0]);
 assert.strictEqual(logic.pickNote(notes,0,900,cfg),null,'wrong lane never hits');
 assert.strictEqual(logic.pickNote(notes,1,1500,cfg),null,'too early or late never hits');
 notes[0].judged='good';assert.strictEqual(logic.pickNote(notes,1,1000,cfg),null,'a judged note is gone');

 // mood + outcome + spray pay
 assert.ok(logic.moodDelta('perfect',cfg)>logic.moodDelta('good',cfg)&&logic.moodDelta('miss',cfg)<0);
 const win=logic.summarize({perfect:10,good:12,miss:8,mood:60},cfg,{spray:true});
 assert.strictEqual(win.outcome,'win');assert.strictEqual(win.money,10*cfg.payPerPerfect+12*cfg.payPerGood);
 const lose=logic.summarize({perfect:2,good:3,miss:25,mood:20},cfg,{spray:true});
 assert.strictEqual(lose.outcome,'lose');
 const left=logic.summarize({perfect:30,good:0,miss:0,mood:0},cfg);
 assert.strictEqual(left.outcome,'lose','the crowd that left is a loss even with a good score');
 assert.strictEqual(logic.summarize({perfect:30,good:0,miss:0,mood:90},cfg,{spray:false}).money,0,'no spray, no money');
 const huge=logic.summarize({perfect:9999,good:0,miss:0,mood:100},cfg,{spray:true});
 assert.strictEqual(huge.money,cfg.payCap,'spray is capped');
 assert.strictEqual(logic.config({bpm:'nope',notes:10}).bpm,cfg.bpm,'bad overrides fall back to defaults');
 assert.strictEqual(logic.config({notes:10}).notes,10);
 console.log('PASS dance (falling-moves chart, forgiving windows, lane-only hits, mood/outcome, capped spray pay, one-sentence rule)');
}
