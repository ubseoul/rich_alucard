// F01 THE PLAY — BAILED canonical v1 (OL-020). The predicate, the exclusions and the outcome isolation.
import assert from 'node:assert/strict';
import path from 'node:path';import {pathToFileURL} from 'node:url';

export async function test(root){
  const dir=path.join(root,'tools','tests','f01','play-sim');
  const {runPlay,bailEligible}=await import(pathToFileURL(path.join(dir,'driver.mjs')).href);
  const {JOBS}=await import(pathToFileURL(path.join(dir,'content.mjs')).href);
  const o=(id,hp,extra={})=>({id,hp,maxhp:6,out:null,fled:false,rescued:false,...extra});
  const P=(over={},crew=[o('a',3),o('b',0)])=>({opts:{},job:{bigPlay:false,defense:false},crew,getawayStarted:false,...over});
  // ---- the predicate: every condition is necessary ----
  assert.equal(bailEligible(P()),true,'routine offense, 2 crew, exactly 1 able + 1 downed');
  assert.equal(bailEligible(P({job:{bigPlay:true}})),false,'never BIG PLAY');
  assert.equal(bailEligible(P({job:{defense:true}})),false,'never HOLD THE HOUSE');
  assert.equal(bailEligible(P({},[o('a',3)])),false,'crew at start >= 2');
  assert.equal(bailEligible(P({},[o('a',0),o('b',0)])),false,'0 able is a WASH, never BAILED');
  assert.equal(bailEligible(P({},[o('a',3),o('b',3),o('c',0)])),false,'2 able is not BAILED (exactly 1)');
  assert.equal(bailEligible(P({},[o('a',3),o('b',3)])),false,'nobody downed');
  assert.equal(bailEligible(P({},[o('a',3),o('b',0,{fled:true})])),false,'a runner is not a downed Oga');
  assert.equal(bailEligible(P({getawayStarted:true})),false,'never once GETAWAY has begun');
  assert.equal(bailEligible(P({},[o('a',3),o('b',0),o('c',0,{out:'DEAD'})])),false,'BAILED produces 0 deaths: nobody already dead');
  assert.equal(bailEligible(P({opts:{noBail:true}})),false,'sim ablation switch');
  // ---- outcomes over a matrix that includes BIG PLAY and HOLD THE HOUSE ----
  let plays=0,bailed=0;const byJob={};
  for(const job of JOBS)for(const pol of ['careful','greedy','naive','random'])for(let s=1;s<=12;s++){
    const rec=runPlay({seed:job.id.length*1000+s,job,policy:pol});plays++;
    if(!rec.bailed){assert.notEqual(rec.klass,'BAILED');continue;}
    bailed++;byJob[job.id]=(byJob[job.id]||0)+1;
    assert(!job.bigPlay&&!job.defense,`${job.id} must never BAIL`);
    assert(rec.crew.length>=2);
    assert.equal(rec.getaway,'BAILED','BAILED replaces the getaway');
    assert.equal(rec.klass,'BAILED');assert.equal(rec.win,false);
    assert.equal(rec.robbed,false,'BAILED never sets robbed');
    assert(!rec.losses.some(l=>l.kind==='ROBBED'),'no ROBBED loss entry');
    assert(rec.losses.some(l=>l.kind==='BAILED'),'BAILED has its own loss entry');
    assert.deepEqual(rec.pot,{cash:0,crates:[]},'the unbanked pot is lost');
    for(const [id,st] of Object.entries(rec.finalStatus))assert(['READY','WOUNDED'].includes(st),`${id} ${st}: 0 captures, 0 deaths`);
    assert(rec.crew.some(id=>rec.finalStatus[id]==='WOUNDED'),'the downed come home WOUNDED');
    assert.equal(rec.heatDelta,job.heat,'job base HEAT only');
    assert.notEqual(rec.temptation,'RETALIATION','BAILED never feeds retaliation');
    assert.equal(rec.morning.seeds.filter(x=>x.perk==='got_everybody_out').length,1,'GOT EVERYBODY OUT is created exactly once');
    assert.equal(rec.morning.seeds[0].who,rec.bailerId);
    assert(rec.report.some(l=>l.startsWith('BAILED — NOBODY LEFT BEHIND')),'exact headline');
  }
  assert(bailed>0,'the matrix exercised BAILED at least once');
  console.log(`PASS F01 BAILED v1 (predicate: 11 cases; ${plays} PLAYs incl. BIG PLAY + HOLD THE HOUSE, ${bailed} BAILED [${Object.entries(byJob).map(([k,v])=>k+' '+v).join(', ')}]: isolation, outcomes, headline, memory once)`);
}
