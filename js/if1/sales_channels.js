(function(){
 'use strict';
 // RASalesChannels — IF-1 (4L). Shared sales-channel registry for later systems (TRAP; RAINMAKER / BING).
 // REGISTRY ONLY: no TRAP or RAINMAKER economy lives here and no price, margin or rate is defined. The two channels are
 // RESERVED at load; the owning fragment CLAIMS its channel and supplies its own economy. All money movement goes through
 // RAMoneyLedger with the source tag "<channel>:<kind>" so channel income/expense can be analysed by family later.
 const channels=new Map();
 const RESERVED=[{id:'trap',fragment:'F05',label:'TRAP'},{id:'rainmaker',fragment:'F06',label:'RAINMAKER',aliases:['bing']}];
 for(const r of RESERVED)channels.set(r.id,{...r,reserved:true,claimed:false,flag:`${r.fragment}.${r.id==='rainmaker'?'rainmaker':'trap'}`,meta:{}});
 const clone=v=>JSON.parse(JSON.stringify(v));
 const idOf=id=>{const key=String(id||'').toLowerCase();if(channels.has(key))return key;for(const c of channels.values())if(c.aliases?.includes(key))return c.id;return null;};
 // register(spec): a NEW channel. claim(id,spec): the owning fragment activates a RESERVED channel.
 function register({id,fragment,label,flag=null,meta={}}){
  if(!/^[a-z][a-z0-9_]*$/.test(id||''))throw new Error('RASalesChannels.register: id must be lower_snake');
  if(channels.has(id))throw new Error(`RASalesChannels.register: ${id} already exists`);
  if(!fragment)throw new Error(`RASalesChannels.register(${id}): fragment required`);
  if(flag&&!window.RAFeatures?.get(flag))throw new Error(`RASalesChannels.register(${id}): flag ${flag} is not registered`);
  channels.set(id,{id,fragment,label:label||id,flag,meta:clone(meta),reserved:false,claimed:true});return id;
 }
 function claim(id,{fragment,label=null,meta={}}){
  const key=idOf(id),c=channels.get(key);
  if(!c||!c.reserved)throw new Error(`RASalesChannels.claim: ${id} is not a reserved channel`);
  if(c.claimed)throw new Error(`RASalesChannels.claim: ${key} already claimed`);
  if(fragment!==c.fragment)throw new Error(`RASalesChannels.claim: ${key} is reserved for ${c.fragment}, not ${fragment}`);
  channels.set(key,{...c,label:label||c.label,meta:clone(meta),claimed:true});return key;
 }
 const get=id=>{const c=channels.get(idOf(id));return c?clone(c):null;};
 const list=()=>[...channels.values()].map(clone);
 const enabled=id=>{const c=channels.get(idOf(id));return !!c&&c.claimed&&(!c.flag||!!window.RAFeatures?.enabled(c.flag));};
 // record(channel,{amount,kind,memo}): amount>0 income, <0 expense. Tagged "<channel>:<kind>" in the money ledger.
 function record(id,{amount,kind='sale',memo=null}){
  const key=idOf(id);if(!key||!enabled(key))return {ok:false,reason:'channel-not-enabled'};
  const n=Math.round(Number(amount));if(!Number.isFinite(n)||n===0)return {ok:false,reason:'no-amount'};
  const source=`${key}:${kind}`;
  if(n>0){window.RAMoneyLedger.credit(n,{source,memo});return {ok:true,source};}
  return {ok:window.RAMoneyLedger.debit(-n,{source,memo}),source};
 }
 window.RASalesChannels={register,claim,get,list,enabled,record,resolve:idOf};
})();
