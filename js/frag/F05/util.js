(function(){
 'use strict';
 // F05 - THE TRAP - util.js
 // Small shared helpers and the ONE place the fragment decides whether it is on.
 //
 // FEATURE FLAG (FCPB convergence). ONE identity: the IF-1 reserved flag `F05.trap` (features.js, phone_registry.js,
 // sales_channels.js, contract-v1.0.json). The standalone branch's second flag `F05.the_trap` and its master->reserved
 // mirror are retired: nothing mirrors, nothing can drift. Everything the fragment does is gated on `on()`.
 window.RAF05=window.RAF05||{};
 const R=window.RAF05;

 R.MASTER='F05.trap';
 R.RESERVED='F05.trap';   // kept as an alias of MASTER for callers that named the reserved slot
 R.on=()=>{const F=window.RAFeatures;if(!F)return false;return !!F.enabled(R.MASTER);};
 R.mirror=()=>{};          // retired no-op (single flag identity)

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

 // `F05.trap` is registered DARK by IF-1 (RESERVED list); only the integration owner may promote it in js/if1/flag_defaults.js.
 // A defensive registration covers a harness that loads F05 without the reserved list.
 if(window.RAFeatures&&!window.RAFeatures.get(R.MASTER)){
  window.RAFeatures.register({id:R.MASTER,fragment:'F05',description:'THE_TRAP: traphouse, Blood X production and COUNT THE MONEY'});
 }
})();
