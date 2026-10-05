#!/usr/bin/env node
// F13 before/after: paired persona distributions from two run.mjs outputs.
//   node tools/tests/f13/compare.mjs tools/tests/f13/out/baseline.json tools/tests/f13/out/after.json [> out/compare.txt]
import {readFile} from 'node:fs/promises';
const [a,b]=await Promise.all(process.argv.slice(2,4).map(async f=>JSON.parse(await readFile(f,'utf8'))));
const k=n=>Math.abs(n)>=1e6?(n/1e6).toFixed(2)+'M':Math.abs(n)>=1e3?Math.round(n/1e3)+'K':String(Math.round(n*10)/10);
const D=d=>`${k(d.p10)}/${k(d.p50)}/${k(d.p90)}`;
const rows=[
 ['final cash (p10/p50/p90)',s=>D(s.final)],['lowest cash in the life',s=>D(s.minMoney)],['cash on day 23',s=>D(s.money.d23)],
 ['War Room income',s=>D(s.warIn)],['PLAYs run',s=>D(s.plays)],['most PLAYs in one night',s=>s.maxPlaysPerNight],['PLAY win %',s=>s.winRate+'%'],
 ['War Room dead (NO_CAR) lives',s=>s.noCar?`${s.noCar.lives}/${s.n}`:'-'],['EXTRACT crashes (lives)',s=>s.extractCrash?`${s.extractCrash.lives}/${s.n}`:'-'],['last night with a PLAY',s=>s.lastPlayNight?D(s.lastPlayNight):'-'],
 ['LAY LOWs / avg HEAT drop',s=>`${s.layLow.n} / ${s.layLow.avgDrop}`],
 ['trap income',s=>D(s.trapIn)],['trap spend (houses+base+upgrades)',s=>D(s.trapOut)],['trap net',s=>D(s.trapNet)],['cooks per house-night',s=>s.cooksPerHouseNight],
 ['cases sold',s=>D(s.casesSold)],['ingredients spent',s=>D(s.ingredients)],['upgrades spent',s=>D(s.upgrades)],['trap level',s=>D(s.level)],['day of Level 2',s=>D(s.l2Day)],
 ['lives with a raid',s=>`${s.raids.withRaid}/${s.n}`],['first raid day',s=>D(s.raids.firstRaidDay)],['raids answered (mean)',s=>s.raids.answered],['raid pending-days (mean)',s=>s.raids.pendingDays],
 ['stash cases lost / unbanked lost (mean)',s=>`${s.raids.stashLost} / ${k(s.raids.unbankedLost)}`],['HOLD net cash (mean)',s=>k(s.raids.holdNet)],
 ['peak HEAT',s=>D(s.heatPeak)],['Ogas GONE (mean)',s=>s.crew.gone],['Ogas active at end (mean)',s=>s.crew.activeEnd],['RAINMAKER spent (mean)',s=>k(s.rainSpent)],
 ['invariant violations',s=>s.invariants],['softlocks',s=>s.softlock],['UI errors',s=>s.errors??0]
];
const out=[`F13 before/after — ${a.label} (${a.seeds}x${a.days}d, mode ${a.mode||'api'}) vs ${b.label} (${b.seeds}x${b.days}d, mode ${b.mode||'api'})`,''];
for(const p of Object.keys(a.summary)){const x=a.summary[p],y=b.summary[p];if(!y)continue;
 out.push(`## ${p}`);out.push('| metric | before | after |');out.push('|---|---|---|');
 for(const [name,f] of rows)out.push(`| ${name} | ${f(x)} | ${f(y)} |`);out.push('');}
console.log(out.join('\n'));
