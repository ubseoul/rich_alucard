// F13 post-audit repair — policy exit heuristic regression.
// Bare "STAY" is not an exit; A45's looping "STAY LONGER" must never be chosen by the cautious policies, and the
// adventure's real exit ("GET OUT") must be selected deterministically.
import assert from 'node:assert/strict';
import { createRng, getPolicy, loadGame, pilotModule } from './_lib.mjs';
import { EXIT } from '../../f13/policies.mjs';

export async function test() {
  // 1. Wording: generic STAY is not an exit; bounded safe-stay wording and real exits still are.
  assert(!EXIT.test('STAY LONGER'), 'STAY LONGER must not be treated as an exit');
  assert(!EXIT.test('STAY OUT HERE A WHILE'), 'lingering STAY wording must not be an exit');
  assert(!EXIT.test('STAY WITH HER'), 'branching STAY wording must not be an exit');
  assert(!EXIT.test('STAY CALM. LET HER HIT YOU.'), 'combat STAY wording must not be an exit');
  for (const allowed of ['GET OUT', 'STAY HOME', 'STAY PUT', 'STAY HERE']) assert(EXIT.test(allowed), `bounded exit "${allowed}" must still match`);
  for (const exit of ['LEAVE', 'BACK OUT', 'NOT TODAY', 'NAH', 'DECLINE', 'WALK AWAY', "I'M GOOD", "THAT'S ENOUGH", 'CANCEL', 'SKIP', 'REFUSE', "DON'T", 'GIVE IT BACK', 'NEVER MIND', 'BAIL', 'ABOUT FACE']) {
    assert(EXIT.test(exit), `legitimate exit "${exit}" must still match`);
  }

  const ctx = await loadGame();
  const soak = ctx.RAAdventures.get('A45').nodes.soak.choices;
  assert(soak[0].label === 'STAY LONGER' && soak[1].label === 'GET OUT', 'A45 soak content changed');

  // 2. Unit: both cautious policies pick GET OUT at A45's soak node (never the loop).
  for (const id of ['conservative', 'low-risk']) {
    const policy = getPolicy(id);
    const chosen = policy.choose(ctx, soak, { rng: createRng(`${id}:a45-soak`) });
    assert.equal(chosen.label, 'GET OUT', `${id} must exit A45 rather than loop`);
  }

  // 3. Integration: A45 walks to an end under both cautious policies, selecting GET OUT and never STAY LONGER.
  const { drive } = await pilotModule();
  assert(ctx.RAAdventures.available('A45'), 'A45 must be available to walk');
  for (const id of ['conservative', 'low-risk']) {
    const policy = getPolicy(id);
    const rng = createRng(`a45:drive:${id}`);
    const picked = [];
    const choose = (list, meta) => { const choice = policy.choose(ctx, list, { ...meta, rng }); picked.push(String(choice.label)); return choice; };
    const result = drive(ctx, 'A45', { vars: {}, choose, from: 'test' });
    assert.equal(result.id, 'A45', `${id}: A45 must complete`);
    assert(!picked.some(label => /STAY LONGER/i.test(label)), `${id}: A45 loop was selected: ${picked.join(' → ')}`);
    assert(picked.includes('GET OUT'), `${id}: A45 must exit via GET OUT: ${picked.join(' → ')}`);
  }

  console.log('PASS f13 exits (STAY LONGER not an exit; conservative + low-risk exit A45 via GET OUT, no loop)');
}
