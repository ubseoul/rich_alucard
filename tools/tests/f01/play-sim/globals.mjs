// Publish the preserved F01 rng/data classic-script globals for the ESM play modules (env.mjs reads them).
import {Rng,D} from './load.mjs';
globalThis.RAShowdownRng=Rng;globalThis.RAShowdownData=D;
