#!/usr/bin/env node
// Static server over the repo root for the BUILD-1 stage review (Windows-safe launcher for the play-sim server).
//   node tools/build1/preview-server.mjs [port]   ->   http://localhost:8200/index.html?dev=1&ff=F06.rainmaker,F15.velvet_rotation
import {serve} from '../tests/f01/play-sim/serve-play.mjs';
const port=+process.argv[2]||8200;
await serve(port);
console.log(`BUILD-1 preview: http://localhost:${port}/index.html?dev=1&ff=F06.rainmaker,F15.velvet_rotation`);
