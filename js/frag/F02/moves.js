(function(){
 'use strict';
 // OL-045 integration: Vol 3 §1.3 specifies bedroom phone MOVES, four slots, canon moves never deleted.
 // Registers DARK with the existing F02 flag; no save writes or phone change while OFF.
 const canon=['blood','octopus','bite','revenge'],D=()=>window.RACombatData.MOVES;
 const combat=()=>window.RAState.get().life.combat;
 const known=()=>[...new Set([...canon,...combat().learnedMoves||[]])].filter(id=>D()[id]);
 const atHome=()=>window.RAScenes?.current?.()==='bedroom'&&!window.RACombat2?.active?.();
 const btn=(text,act)=>`<button type="button" class="phone-button" data-phone-action="${act}">${text}</button>`;
 function equip(slot,id){
  if(!atHome()||!Number.isInteger(slot)||slot<0||slot>=4||!known().includes(id))return false;
  const eq=[...combat().equippedMoves].slice(0,4),other=eq.indexOf(id);
  if(other>=0)[eq[slot],eq[other]]=[eq[other],eq[slot]];else eq[slot]=id;
  window.RAState.patch('life.combat.equippedMoves',eq);return true;
 }
 window.RAPhoneRegistry.declare('F02',{id:'moves',label:'MOVES',section:'life',flag:'F02.iron_and_grace',
  render(sub){
   if(!atHome())return '<h1>MOVES</h1><p class="phone-small">SWAP AT HOME.</p>';
   const slot=Number(sub),eq=combat().equippedMoves;
   if(sub!==undefined&&sub!==''&&Number.isInteger(slot)&&slot>=0&&slot<4)return `<h1>MOVES · SLOT ${slot+1}</h1>${known().map(id=>btn(D()[id].label,`do:moves:equip:${slot}|${id}`)).join('')}`;
   return `<h1>MOVES</h1>${eq.map((id,i)=>btn(`${i+1}. ${D()[id]?.label||id}`,`app:moves:${i}`)).join('')}`;
  },onAction(act,arg,api){if(act==='equip'){const [slot,id]=arg.split('|');if(equip(Number(slot),id))api.refresh();}}
 });
 function unlock(){if(window.RAIronFlags.core()&&atHome())window.RAPhoneRegistry.unlock('moves');}
 document.addEventListener('ra:scene',unlock);window.RAFeatures.onChange(unlock);
 window.RAIronMoves={known,equip,atHome,unlock};
})();
