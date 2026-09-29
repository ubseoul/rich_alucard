// F13 HOLISTIC BALANCE HARNESS — headless game loader (INFRASTRUCTURE ONLY).
// Reuses the accepted BTF loader (tools/btf-test.mjs) at the production load order with IF-1 spliced in and every
// fragment flag OFF. No game logic is reimplemented here: we only load, apply declared fragment flags and hand back
// the real service surface.
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const url = rel => pathToFileURL(path.join(root, rel)).href;

let _btf = null;
let _pilot = null;

export async function btfModule() {
  _btf = _btf || (await import(url('tools/btf-test.mjs')));
  return _btf;
}

export async function pilotModule() {
  _pilot = _pilot || (await import(url('tools/pilot/headless.mjs')));
  return _pilot;
}

// Load a fresh headless context. `seedState` is a full save object (or null for a fresh life). `fragmentFlags`
// are DEV session overrides applied through the real RAFeatures registry; only REGISTERED ids are set.
export async function loadGame({ seedState = null, if1 = true, fragmentFlags = null } = {}) {
  const { loadBtf } = await btfModule();
  const ctx = await loadBtf(root, { seedState, if1 });
  if (fragmentFlags && ctx.RAFeatures) {
    for (const [id, on] of Object.entries(fragmentFlags)) {
      if (ctx.RAFeatures.get(id)) ctx.RAFeatures.set(id, !!on);
    }
  }
  return ctx;
}
