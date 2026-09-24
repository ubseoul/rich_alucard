(function(){
 // GO SOMEWHERE destinations + VampGPT MAKE MONEY / MEET PEOPLE lanes (Octopus Brain as UI: 2–3 ways to pursue a want).
 // A place resolves to an adventure (first-time night or repeatable system form) or a custom go(api) handler.
 const places=new Map();const lanes={money:[],people:[]};
 function define(list){for(const p of list)places.set(p.id,{order:50,...p});}
 function defineLane(lane,list){lanes[lane].push(...list);}
 const ok=(fn,L)=>{try{return fn?fn(L)!==false:true}catch(e){return false}};
 function resolve(p){const L=RALife.L();if(typeof p.adventure==='function')return p.adventure(L);return p.adventure||null;}
 function visible(){const L=RALife.L();return [...places.values()].filter(p=>!p.hidden&&ok(p.when,L)&&(p.go||(resolve(p)&&RAAdventures.available(resolve(p))))).sort((a,b)=>a.order-b.order).map(p=>({id:p.id,label:typeof p.label==='function'?p.label(L):p.label,sub:typeof p.sub==='function'?p.sub(L):p.sub}));}
 async function go(id,api=window.RAPhone?.api){
  const p=places.get(id)||lanes.money.concat(lanes.people).find(x=>x.id===id);if(!p)return false;
  if(p.go)return p.go(api,RALife.L());
  const adv=resolve(p);if(!adv||!RAAdventures.available(adv))return false;
  if(api?.begin)return api.begin(adv);return RAAdventureScene.begin(adv,{from:'place'});
 }
 function lane(name){const L=RALife.L();return lanes[name].filter(o=>ok(o.when,L)&&(o.go||!o.adventure||RAAdventures.available(typeof o.adventure==='function'?o.adventure(L):o.adventure))).slice(0,4).map(o=>({label:typeof o.label==='function'?o.label(L):o.label,sub:typeof o.sub==='function'?o.sub(L):o.sub,octopus:!!o.octopus,go:o.id}));}
 function laneGo(){}
 const intros={money:'money is the easy part. you got a budget. but ok:',people:'people is the move. here go some:'};
 window.RAPlaces={define,visible,go,get:id=>places.get(id)||null,all:()=>[...places.values()]};
 window.RAVampGPT={defineLane,lane,laneIntro:name=>intros[name],laneGo};
})();
