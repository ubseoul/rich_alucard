import path from 'node:path';import {fileURLToPath,pathToFileURL} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..','..');
const f=process.argv[2];
try{const m=await import(pathToFileURL(path.join(root,f)).href);await m.test(root);}catch(e){console.log('FAIL',e.message);console.log(String(e.stack).split('\n').slice(0,6).join('\n'));process.exit(1);}
