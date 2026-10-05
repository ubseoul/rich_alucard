// F14-A — PHONE PLACEMENT HOOK REGISTRY.
//
// Loads tools/f14/placements.json. The harness always installs ONE baseline validator (on-screen + tappable phone
// controls). Fragment validators are declarations that become AUTHORIZED when the fragment ships them; until then they
// are PENDING_FRAGMENT. This module only reports.
import {readFile} from 'node:fs/promises';
import path from 'node:path';

export async function loadPlacements(root){
  const file=path.join(root,'tools','f14','placements.json');
  let doc;try{doc=JSON.parse(await readFile(file,'utf8'));}catch(e){return {validators:[],problems:[`placements.json unreadable: ${e.message}`],authorized:[],pending:[]};}
  const validators=Array.isArray(doc.validators)?doc.validators:[];
  const problems=[];
  for(const v of validators){
    if(!v.id||!v.fragment||!v.status)problems.push(`invalid placement validator ${JSON.stringify(v.id)}`);
    if(!['AUTHORIZED','PENDING_FRAGMENT'].includes(v.status))problems.push(`${v.id}: bad status ${v.status}`);
  }
  return {validators,problems,authorized:validators.filter(v=>v.status==='AUTHORIZED'),pending:validators.filter(v=>v.status==='PENDING_FRAGMENT')};
}
