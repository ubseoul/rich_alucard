import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {createHash} from 'node:crypto';
const GAMEPLAY="156eb8b27f1eff6b8957b4753a244a7cb53e3d39";
const PACK="d92cff1878bf544a83b7ec51585bc50c6ac77c336dc599019f362a4901d179d9";
const DIGEST="1ebe5a15acae1022ccbef9f1771721e6e3855176b30d251eb324f88b0c760ef5";
const hash=b=>createHash('sha256').update(b).digest('hex');
function assert(value,message){if(!value)throw Error(message);}
export function verifyApprovedPublication(root,{syntax=false}={}){
 root=path.resolve(root);
 const release=JSON.parse(fs.readFileSync(path.join(root,'PUBLIC-RELEASE.json'),'utf8'));
 assert(release.schema===1&&release.gameplayCommit===GAMEPLAY&&release.packSha256===PACK,'Unapproved compiled release identity');
 assert(hash(JSON.stringify(release.files))===DIGEST&&release.artifactDigest===DIGEST,'Unapproved compiled release manifest');
 const approved=new Set();
 for(const f of release.files){
  assert(typeof f.path==='string'&&!path.isAbsolute(f.path)&&!f.path.split('/').includes('..'),'Unsafe compiled file path');
  const filename=path.resolve(root,f.path);
  assert(filename.startsWith(root+path.sep),'Compiled file outside release root');
  const data=fs.readFileSync(filename);
  assert(data.length===f.bytes&&hash(data)===f.sha256,'Compiled artifact changed: '+f.path);
  if(syntax&&f.path.endsWith('.js'))new vm.Script(data.toString('utf8'),{filename:f.path});
  approved.add(f.path);
 }
 assert(approved.size===1820,'Unexpected compiled release file count');
 const pack=release.files.find(f=>f.path==='js/sealed/pack.js');
 assert(pack?.sha256===PACK,'Unapproved compiled pack');
 if(syntax){
  for(const f of release.files.filter(f=>f.path.endsWith('.html'))){
   const html=fs.readFileSync(path.join(root,f.path),'utf8');
   assert(!html.includes('__BUILD_ASSET_VERSION__'),'Unbuilt HTML: '+f.path);
   for(const m of html.matchAll(/<(?:script|link)\b[^>]*(?:src|href)=["']([^"'?#]+)(?:[?#][^"']*)?["']/gi)){
    const ref=m[1];if(/^(?:https?:|data:|\/\/|#)/i.test(ref))continue;
    const resolved=path.resolve(root,path.dirname(f.path),decodeURIComponent(ref));
    const relative=path.relative(root,resolved).split(path.sep).join('/');
    assert(approved.has(relative),'HTML dependency outside approved artifact: '+f.path+' -> '+ref);
   }
  }
 }
 return {release,approved};
}
export async function runCompiledRelease(root,action){
 const arg=n=>{const i=process.argv.indexOf(n);return i<0?null:process.argv[i+1];};
 if(action==='verify-deployment'){
  const base=(arg('--url')||'').replace(/\/$/,'');assert(base,'Deployment URL required');
  const attempts=Number(arg('--retries')||1);let last;
  const expected=verifyApprovedPublication(root).release;
  for(let attempt=1;attempt<=attempts;attempt++){
   try{
    for(const f of expected.files.filter(f=>['index.html','js/sealed/pack.js','build.json','GAME-RELEASE.json'].includes(f.path))){
     const r=await fetch(base+'/'+f.path+'?verify='+GAMEPLAY+'&attempt='+attempt,{cache:'no-store'});
     assert(r.ok,'HTTP '+r.status+' for '+f.path);const data=Buffer.from(await r.arrayBuffer());
     assert(hash(data)===f.sha256&&data.length===f.bytes,'Public file does not match approved release: '+f.path);
    }
    const r=await fetch(base+'/PUBLIC-RELEASE.json?verify='+GAMEPLAY,{cache:'no-store'});
    assert(r.ok,'Public release manifest unavailable');const publicRelease=await r.json();
    assert(publicRelease.gameplayCommit===GAMEPLAY&&publicRelease.artifactDigest===DIGEST,'Public release identity mismatch');
    const expectedCommit=arg('--commit');
    if(expectedCommit){
     const receipt=await fetch(base+'/PUBLIC-DEPLOYMENT.json?commit='+expectedCommit,{cache:'no-store'});
     assert(receipt.ok,'Public deployment receipt unavailable');
     const deployment=await receipt.json();
     assert(deployment.deploymentCommit===expectedCommit&&deployment.gameplayCommit===GAMEPLAY&&deployment.packSha256===PACK,'Public deployment commit mismatch');
    }
    console.log('PASS public compiled release '+GAMEPLAY+' pack '+PACK);return;
   }catch(error){last=error;if(attempt<attempts)await new Promise(resolve=>setTimeout(resolve,10000));}
  }throw last;
 }
 if(action==='verify-artifact'){
  verifyApprovedPublication(path.join(root,'dist'),{syntax:true});console.log('PASS immutable compiled dist artifact');return;
 }
 assert(action==='test'||action==='build','Unsupported compiled release action');
 const {release}=verifyApprovedPublication(root,{syntax:true});
 if(action==='test'){console.log('PASS compiled release: 1820 byte-identical files, JavaScript syntax, HTML dependency closure');return;}
 const output=path.resolve(root,'dist');assert(path.dirname(output)===path.resolve(root)&&path.basename(output)==='dist','Unsafe build directory');
 fs.rmSync(output,{recursive:true,force:true});fs.mkdirSync(output,{recursive:true});
 for(const f of release.files){const dest=path.join(output,f.path);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.copyFileSync(path.join(root,f.path),dest);}
 fs.copyFileSync(path.join(root,'PUBLIC-RELEASE.json'),path.join(output,'PUBLIC-RELEASE.json'));
 fs.writeFileSync(path.join(output,'.nojekyll'),'');
 fs.writeFileSync(path.join(output,'PUBLIC-DEPLOYMENT.json'),JSON.stringify({deploymentCommit:arg('--commit')||process.env.GITHUB_SHA||null,gameplayCommit:GAMEPLAY,artifactDigest:DIGEST,packSha256:PACK},null,2)+'\n');
 verifyApprovedPublication(output,{syntax:true});console.log('PASS copied exact approved compiled release to dist');
}
