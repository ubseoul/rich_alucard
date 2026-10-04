// RC2 Build 2 static regression: modules registered, music shipped, lyric hotfix, every enemy move has attack FX.
import {readFileSync,existsSync} from 'node:fs';import path from 'node:path';
export async function test(root){
  const read=f=>readFileSync(path.join(root,f),'utf8');const assert=(c,m)=>{if(!c)throw new Error(m);};
  const manifest=read('js/loader/manifest.json'),index=read('index.html');
  for(const f of ['js/engine/hard_pixel.js','js/systems/music_library.js','js/systems/barks.js','js/systems/enemy_fx.js','js/systems/feel_sfx.js','js/systems/money_feel.js','js/systems/ambient_life.js','js/systems/scene_guard.js','js/systems/intro_polish.js','js/systems/phone_nudge.js','js/data/rc2_barks.js']){
    assert(existsSync(path.join(root,f)),`missing ${f}`);assert(manifest.includes(`"${f}"`),`${f} not in loader manifest`);assert(index.includes(`${f}?v=`),`${f} not in index.html`);}
  assert(index.includes('rc2_feel.css'),'rc2_feel.css not linked');
  for(const m of ['on_the_moon','almond_freestyle','ice_level_intro','in_montana','oxblood_remastered','playmakers'])assert(existsSync(path.join(root,`assets/audio/music/${m}.mp3`)),`missing song ${m}`);
  const game=read('game.js');const fn=game.slice(game.indexOf('function syncRichLyrics(){'),game.indexOf('syncRichLyrics();',game.indexOf('function syncRichLyrics(){')));
  assert(/classList\.remove\('on'\)/.test(fn)&&/return;/.test(fn)&&!/requestAnimationFrame/.test(fn),'syncRichLyrics must hide the bubble and return');
  const combat=read('js/data/btf/combat.js'),fx=read('js/systems/enemy_fx.js');
  const ids=[...combat.matchAll(/^  ([a-z_0-9]+):\{name:/gm)].map(m=>m[1]);assert(ids.length>=15,'enemy list not parsed');
  const tail=fx.slice(fx.indexOf('const MAP='));for(const id of ids)assert(tail.includes('  '+id+':{'),`enemy ${id} has no attack FX map`);
  const bedroom=read('js/scenes/bedroom.js');assert(/maxVisible:10/.test(bedroom)&&/tiny/.test(bedroom)&&/spawnPlane/.test(bedroom),'bedroom ambient (clouds/planes) missing');
  console.log(`PASS rc2 feel (11 modules registered, 6 songs shipped, lyric hotfix, ${ids.length} enemies with attack FX, ambient clouds/planes)`);
}
