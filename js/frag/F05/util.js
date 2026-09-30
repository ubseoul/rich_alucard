(function(){
 'use strict';
 // F05 - THE TRAP - util.js
 // Small shared helpers and the ONE place the fragment decides whether it is on.
 //
 // FEATURE FLAG. The frozen IF-1 spine reserves `F05.trap` (features.js, phone_registry.js, sales_channels.js).
 // This task's brief names the master flag `F05.the_trap`. To satisfy both without touching IF-1:
 //   * `F05.the_trap` is registered here (dark) and is the fragment's master flag.
 //   * when it is ON the fragment mirrors it onto the reserved `F05.trap` so the frozen consumers (phone app slot,
 //     reserved sales channel) light up together. When it is OFF the reserved flag is cleared back to its owner
 //     default, so the reserved consumers stay exactly as the IF-1 contract shipped them.
 // `on()` is true if EITHER flag is enabled (so an auditor driving the reserved flag also works). Everything the
 // fragment does is gated on `on()`, and IF-1 registrations additionally carry a flag so toggling OFF stops behavior.
 window.RAF05=window.RAF05||{};
 const R=window.RAF05;

 R.MASTER='F05.the_trap';
 R.RESERVED='F05.trap';
 function mirror(value){
  const F=window.RAFeatures;if(!F||!F.get(R.RESERVED))return;
  if(value){if(!F.enabled(R.RESERVED))F.set(R.RESERVED,true);}
  else{F.clear(R.RESERVED);}
 }
 R.on=()=>{const F=window.RAFeatures;if(!F)return false;return !!F.enabled(R.MASTER)||!!F.enabled(R.RESERVED);};
 R.mirror=mirror;

 const U=R.util={
  clamp:(v,a,b)=>Math.max(a,Math.min(b,v)),
  num:v=>{const n=Number(v);return Number.isFinite(n)?n:0;},
  int:v=>Math.trunc(R.util.num(v)),
  day:()=>{try{return window.RALife.today().day;}catch(e){return 0;}},
  esc:s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])),
  clone:v=>JSON.parse(JSON.stringify(v==null?null:v)),
  fmt:n=>'$'+new Intl.NumberFormat('en-US').format(Math.round(R.util.num(n))),
  // A short stable key for the highest-quality batches of a grade. Deterministic for tests.
  byQuality:(a,b)=>(R.util.num(b.quality)-R.util.num(a.quality))||(String(a.id)<String(b.id)?-1:1)
 };

 // Flag registration happens at load (RAFeatures is loaded before every fragment). The master flag is registered
 // dark; only the integration owner may promote it in js/if1/flag_defaults.js.
 if(window.RAFeatures&&!window.RAFeatures.get(R.MASTER)){
  window.RAFeatures.register({id:R.MASTER,fragment:'F05',description:'THE_TRAP: traphouse, Blood X production and COUNT THE MONEY'});
 }
})();
