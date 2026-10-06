# Bounded blind-player copy follow-up

Parent request 2026-10-06, assembled candidate 9e59603. No reward/choice predicates changed.

M1 motivation now says: Rich came to Los Angeles for music. He wants his music to pay his way. VampGPT has another idea. This remains true at $68,000; it claims aspiration rather than present scarcity.

SWITCH THE BAG sub: Requires Kiki friendship: COOL or closer. She keeps Smallie talking.
Actual rule: L.level('kiki') >= 2; relations LEVELS index 2 is COOL (20), with CLOSE and RIDE-OR-DIE higher. No relationship score disclosed.
GRAB AND GO sub: Requires a car for the getaway.
Actual rule unchanged: life.ownership.cars.length > 0. Existing predicate does not filter sold records; that is a separate semantic edge case, not silently fixed here.

Coordinator-owned shared patch proposal:
- rc3.js non-A08 semantic replacement for exact VampGPT noodle phrase: oga. you came here for music.
- Keep the later semantic replacement cash first. what you do with it is your business. This is an offer, not a claim of poverty.
- rc3.js restCopy completed unpaid: Story done. $22,000 game progression bonus settles tonight. Sleep advances one day. (Format live actual amount, not hardcoded $22,000.) Completed paid: Story done. Today's progression bonus is already settled. Sleep advances one day.
- restCopy unfinished: Rest advances one day. No progression bonus tonight; unfinished work stays available. Saved checkpoints and purchases stay yours.
- money_feel.js rc3:story sourceLabel: GAME PROGRESSION BONUS.
- next() completed-story rest sub: Story done. A game progression bonus may settle when you sleep. Stay out if you want.

Rule evidence: rc3.CASH_FLOOR=28000; claimCash amount=max(0,28000-earnedIncome), only story+action&&!paid; tracks gross money increases separately from spending and has unique day receipt. No payer is recorded. Calling this wages, royalty, Gbenga pay or music income invents provenance. Honest systemic wording cannot restore urgency lost to the existing bonus; whether to retune the floor is a separate user/coordinator economy decision. No change to values/conditions/history/schema in this follow-up.

This document supersedes prior S_HANDOFF first pitch narration only; all protected Rich/VampGPT source tuples remain unchanged in S source. Coordinator must retain semantic matching and the preserved brother line.
