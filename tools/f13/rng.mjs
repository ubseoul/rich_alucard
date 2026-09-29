// F13 HOLISTIC BALANCE HARNESS — deterministic RNG (INFRASTRUCTURE ONLY).
// The game owns its own randomness (RAPixel.rng, seeded by day). This PRNG is HARNESS-ONLY: it decides policy
// choices and synthetic minigame/fight outcomes. It is never installed into the game and never changes gameplay
// numbers. Same seed + same policy + same code => byte-identical run (see serialize.mjs).
const U32 = 0xffffffff;

// FNV-1a over the textual seed, so "42", 42 and "run-a" all map to a stable 32-bit stream id.
export function hashSeed(seed) {
  if (typeof seed === 'number' && Number.isFinite(seed)) return (Math.trunc(seed) >>> 0) || 1;
  const text = String(seed ?? '');
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) || 1;
}

// mulberry32: small, fast, well-distributed, fully deterministic across Node versions.
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export class Rng {
  constructor(seed) {
    this.seed = seed;
    this.stream = hashSeed(seed);
    this._next = mulberry32(this.stream);
    this.calls = 0;
  }
  next() {
    this.calls += 1;
    return this._next();
  }
  int(n) {
    const bound = Math.max(1, Math.floor(Number(n) || 1));
    return Math.floor(this.next() * bound) % bound;
  }
  pick(list) {
    return list[this.int(list.length)];
  }
  chance(p) {
    return this.next() < Number(p);
  }
  // A named substream: same parent seed + label always yields the same child sequence, independent of parent draws.
  fork(label) {
    return new Rng(`${this.seed}#${label}`);
  }
  // Advance the stream n draws (used to restore a saved position).
  advance(n) {
    for (let i = 0; i < (Number(n) || 0); i++) this.next();
    return this;
  }
  state() {
    return { seed: this.seed, stream: this.stream, calls: this.calls };
  }
  static from(state) {
    const rng = new Rng(state?.seed ?? 1);
    return rng.advance(Number(state?.calls) || 0);
  }
}

export const createRng = seed => new Rng(seed);
export { U32 };
