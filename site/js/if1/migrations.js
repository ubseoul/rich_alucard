(function(){
 'use strict';
 // RAMigrations — IF-1 (4B). Integration-owned migration architecture.
 //   * Fragments SUBMIT modules ({id,fragment,migrate(save)->save}) — they never pick a version number.
 //   * The integration owner ASSIGNS numbers in js/if1/migration_ledger.js (deterministic, contiguous from base+1).
 //   * js/engine/state.js asks this registry for the schema target version, the extra steps and namespace defaults.
 //   * Migrations are ADDITIVE: they may add/fill fields, never remove or rewrite accepted ones (contract-tested).
 //   * Per-fragment save namespace: save.frag.<FRAGMENT> (lazy; absent until a fragment writes). A fragment declares
 //     its namespace defaults with RAMigrations.namespace(); defaults are filled additively wherever the namespace exists.
 const ledger=window.RAMigrationLedger||{base:16,assigned:{}};
 const submissions=new Map(),namespaces=new Map();
 const clone=v=>JSON.parse(JSON.stringify(v));
 const isObject=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
 function submit(mod){
  if(!mod||typeof mod.id!=='string'||typeof mod.fragment!=='string'||typeof mod.migrate!=='function')throw new Error('RAMigrations.submit: {id,fragment,migrate} required');
  if('version' in mod||'to' in mod||'from' in mod)throw new Error(`RAMigrations.submit(${mod.id}): fragments may not claim a version number — the integration owner assigns it in migration_ledger.js`);
  if(!mod.id.startsWith(`${mod.fragment}.`))throw new Error(`RAMigrations.submit: id ${mod.id} must start with ${mod.fragment}.`);
  if(submissions.has(mod.id))throw new Error(`RAMigrations.submit: duplicate module ${mod.id}`);
  submissions.set(mod.id,Object.freeze({id:mod.id,fragment:mod.fragment,migrate:mod.migrate,note:String(mod.note||'')}));
 }
 function namespace(fragment,defaults={}){
  if(typeof fragment!=='string'||!fragment)throw new Error('RAMigrations.namespace: fragment id required');
  if(!isObject(defaults))throw new Error('RAMigrations.namespace: defaults must be an object');
  namespaces.set(fragment,clone(defaults));
 }
 const versions=()=>Object.keys(ledger.assigned||{}).map(Number).sort((a,b)=>a-b);
 function validate(){
  const problems=[],list=versions();
  list.forEach((v,i)=>{if(v!==ledger.base+1+i)problems.push(`ledger is not contiguous from ${ledger.base+1}: found ${v}`);});
  for(const v of list){const entry=ledger.assigned[v];if(!entry?.id||!submissions.has(entry.id))problems.push(`ledger v${v} names module ${entry?.id} that was never submitted`);else if(entry.fragment&&submissions.get(entry.id).fragment!==entry.fragment)problems.push(`ledger v${v} fragment mismatch`);}
  const assignedIds=new Set(list.map(v=>ledger.assigned[v]?.id));
  for(const id of submissions.keys())if(!assignedIds.has(id))problems.push(`submitted module ${id} has no version assigned by the integration owner`);
  return problems;
 }
 // Target schema version = last assigned ledger version (or the base). Throws on an inconsistent ledger so a bad
 // integration fails loudly at load instead of silently skipping a migration.
 function target(){
  const list=versions();if(!list.length)return ledger.base;
  const problems=validate().filter(p=>!p.startsWith('submitted module'));
  if(problems.length)throw new Error(`RAMigrations ledger invalid: ${problems.join('; ')}`);
  return list.at(-1);
 }
 // {fromVersion: step(save)->save} for state.js. Each step deep-clones its input and stamps the new version.
 function steps(){
  const out={};
  for(const v of versions()){const mod=submissions.get(ledger.assigned[v].id);if(!mod)continue;
   out[v-1]=saved=>{const next=mod.migrate(clone(saved));if(!isObject(next))throw new Error(`migration ${mod.id} returned a non-object`);next.version=v;return next;};}
  return out;
 }
 // Additive namespace normalization used by state.normalizeRecord: fills missing default keys where save.frag.<ns> exists.
 function fill(base,defaults){for(const key of Object.keys(defaults)){if(base[key]===undefined)base[key]=clone(defaults[key]);else if(isObject(base[key])&&isObject(defaults[key]))fill(base[key],defaults[key]);}return base;}
 function normalize(record){
  if(!isObject(record.frag)){if(record.frag!==undefined)record.frag={};return record;}
  for(const [ns,defaults] of namespaces)if(isObject(record.frag[ns]))fill(record.frag[ns],defaults);
  return record;
 }
 window.RAMigrations={base:ledger.base,submit,namespace,target,steps,normalize,validate,namespaceDefaults:fragment=>clone(namespaces.get(fragment)||{}),hasNamespace:fragment=>namespaces.has(fragment),submissions:()=>[...submissions.values()].map(m=>({id:m.id,fragment:m.fragment,note:m.note})),ledger:()=>({base:ledger.base,assigned:clone(ledger.assigned)})};
})();
