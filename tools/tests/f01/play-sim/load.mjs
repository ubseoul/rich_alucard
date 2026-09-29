import {readFileSync} from 'node:fs'; import path from 'node:path'; import vm from 'node:vm'; import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..','..','..','..');
const ctx={console};ctx.window=ctx;vm.createContext(ctx);
for(const f of ['rng','data'])vm.runInContext(readFileSync(path.join(root,'js','frag','F01',f+'.js'),'utf8'),ctx,{filename:f});
export const Rng=ctx.RAShowdownRng,D=ctx.RAShowdownData;
export const stream=(seed,key)=>{const r=Rng.create(`${seed}|${key}`);return {r,next:()=>Rng.next(r),int:(a,b)=>Rng.int(r,a,b),pick:arr=>arr[Rng.int(r,0,arr.length-1)],chance:p=>Rng.next(r)<p};};
export {root};
