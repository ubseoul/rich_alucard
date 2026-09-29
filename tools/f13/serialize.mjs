// F13 HOLISTIC BALANCE HARNESS — save serialization + deterministic fingerprints (INFRASTRUCTURE ONLY).
// Reuses the accepted save pipeline (RAState is the single authority). This module never rewrites a save shape;
// it only deep-clones, scrubs volatile wall-clock fields for comparison and hashes.
import { createHash } from 'node:crypto';
import { loadGame } from './game.mjs';

// Fields the accepted save writes from the wall clock (RAState.recordEvent stamps `at`, the recovery envelope
// stamps `savedAt`). They are not gameplay state and must be scrubbed before two runs can be compared.
const VOLATILE_KEYS = new Set(['at', 'savedAt']);
// `RARealEstate.collectAll` embeds Date.now() in its event id (accepted code); scrub the timestamp so the same
// deterministic life fingerprints identically.
const VOLATILE_ID = /^(rent-collected:\d+):\d+$/;

export function snapshot(ctx) {
  return JSON.parse(JSON.stringify(ctx.RAState.get()));
}

export function normalize(save) {
  return JSON.parse(
    JSON.stringify(save, (key, value) => {
      if (VOLATILE_KEYS.has(key)) return undefined;
      // The accepted world-events system stamps wall-clock eligibility/pending times (…At). They are not gameplay
      // state; drop any ISO-timestamp-valued key so two identical lives compare equal.
      if (/At$/.test(key) && typeof value === 'string' && /^\d{4}-\d\d-\d\dT/.test(value)) return undefined;
      if (typeof value === 'string') {
        let out = value;
        const m = VOLATILE_ID.exec(out);
        if (m) out = `${m[1]}:<ts>`;
        out = out.replace(/\b1[5-9]\d{11}\b/g, '<ms>');
        return out;
      }
      return value;
    })
  );
}

export function fingerprint(save) {
  return createHash('sha256').update(JSON.stringify(normalize(save))).digest('hex');
}

export function fingerprintCtx(ctx) {
  return fingerprint(snapshot(ctx));
}

// Resume from a captured save in a brand-new context (the save/reload continuation path). The returned context is
// a full production-order game at the same day, ready for more simulation.
export async function resume(save, { if1 = true, fragmentFlags = null } = {}) {
  return loadGame({ seedState: save, if1, fragmentFlags });
}
