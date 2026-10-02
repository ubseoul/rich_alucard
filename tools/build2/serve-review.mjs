import {serve} from '../tests/f05/_browser-lib.mjs';
const server=await serve();
console.log(`Review: http://127.0.0.1:${server.address().port}/tools/build2/review.html`);
