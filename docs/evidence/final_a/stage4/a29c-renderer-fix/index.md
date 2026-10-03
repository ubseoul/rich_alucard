# A29C first-ten-minute renderer blocker

The accepted-base first-ten-minute playtest stopped at A29C / roast after 40 inputs, with `function is not iterable`. The [before report](../before/report.json) retains that actual failure. The authored roast has two dialogue tuples followed by a callback-only entry that returns nothing; the scene tried to destructure that function as another dialogue tuple.

The adventure engine now resolves node-line factories, per-entry callbacks and function-valued tuple fields before the scene renders them. A callback returning nothing creates no dialogue wait. A36's existing branch-dependent text also resolves to its authored string. No adventure content, choice effects, outcomes, timing rules or combat rules were edited.

The focused automated regression uses the real authored A29C fork → roast: exactly two lines, roast completion, exiled fate, cleared active adventure and the existing return beat. It also checks both A36 text branches and its node-line factory.

Real Chrome reproduction at 390×844 uses a declared progressed save with A29 PT1 completed on Day 2 and A29B PT2 completed on Day 22. Normal CONTINUE → bedroom SLEEP → Day 23 MORNING selects A29C through the actual wake predicate. Ordinary controls traverse all four fight nodes with the existing RUN continuation, choose ROAST HIM OUT THE DOOR, show the two authored lines, complete the adventure and return to the bedroom. No developer mode, direct node jump or mocked fight result is used. This targeted fixture establishes the repaired route, not a fresh-career or ten-minute claim.

Evidence: [wake](390-wake.png), [Rich roast](390-roast-1.png), [narration](390-roast-2.png), [bedroom return](390-bedroom-return.png), [actual trace and assertions](metrics.json). Reproduce with `node tools/final_a/a29c-browser.mjs` using `RA_PLAYWRIGHT_PATH` and `RA_CHROMIUM_PATH`. The authored regression is auto-discovered at `tools/tests/final_a/adventure_lines.test.mjs`.
