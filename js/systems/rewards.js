(function(){
 // Applies minigame/adventure reward bundles to the life record in one place.
 function apply(result,{adventure=null}={}){
  const r=result?.rewards||{};if(!r||typeof r!=='object')return;
  if(r.money)RALife.addMoney(r.money);
  if(r.followers)RALife.addFollowers(r.followers);
  if(r.clout)RALife.addPoints('clout',r.clout);
  if(r.rep)RALife.addPoints('rep',r.rep);
  for(const [id,n] of Object.entries(r.items||{}))RALife.addItem(id,n);
  for(const [id,n] of Object.entries(r.consumed||{}))RALife.addItem(id,-n);
  for(const [flag,v] of Object.entries(r.flags||{}))RALife.setFlag(flag,v);
  for(const m of r.memories||[])RALife.remember({text:m,lane:result.minigame||adventure,type:'minigame'});
  if(r.hooks?.length){const music={...RAState.get().life.creativeLife.music};music.hooks=[...(music.hooks||[]),...r.hooks.map(h=>({...h,day:RALife.today().day}))];RAState.patch('life.creativeLife.music',music);}
  if(r.parts&&result.data?.car)window.RACars?.installParts?.(result.data.car,r.parts);
  if(r.dragonActions?.length)window.RADragon?.applyActions?.(r.dragonActions);
  if(r.hpLost)RALife.setFlag('hpBruise',(Number(RALife.flag('hpBruise'))||0)+r.hpLost);
  if(r.lessons?.length){const seen=new Set(RALife.flag('garageLessons')||[]);r.lessons.forEach(l=>seen.add(l));RALife.setFlag('garageLessons',[...seen]);}
 }
 window.RALifeRewards={apply};
})();
