# Party Foundation — engineering review

System decision: **HQ PASS / UBE FUN PASS** for ENGINEERING 01: Party Foundation.
Branch checkpoint: **READY FOR INTEGRATION REVIEW**. Merge, push and deployment remain unauthorized.

Ube's playtest response: “i thought it was funny actually i liked the concept”. HQ accepts equipped Party Behavior → Party Situation → distinct social reaction/result, mechanically meaningful TWO STEP / HEAD NOD / TOO COOL TO DANCE choices, readable reactions, lightweight data-driven extensibility, and attending as a distinct Rich activity. This acceptance does not canonize or freeze the temporary situations, writing, geometric crowd or prototype visuals.

Authority: the supplied first engineering slice Production Card, marked AUTHORIZED FOR PRODUCTION. This authorizes a DEV attending-party mechanic prototype only. It does not authorize deployment or the next milestone. Existing foundation/canon/art contracts remain frozen.

## Play

Build with `npm run build`, serve `dist/`, open the normal game with `?dev=1`, then choose **PARTY FOUNDATION (NEW TAB)**. Alternatively open `party-dev.html?dev=1` on that same local server.

Choose ENTER PARTY, equip TWO STEP, HEAD NOD or TOO COOL TO DANCE, then SHOW THEM. The room reacts. Take an opening if offered, choose another behavior to retry the same situation, or press NEXT. RESET clears the prototype session. LEAVE or Escape ends it; close the tab to return to the original game. Reload also starts clean.

## Implementation and boundary

- `js/data/party.js`: three approved behavior concepts, three explicitly DEV/PLACEHOLDER situations, nine authored behavior/situation resolutions and three optional openings. All test writing, hints, responses and situation mechanics are temporary, non-canon.
- `js/systems/party.js`: small session API (`equip`, `resolve`, `takeOpening`, `next`, `reset`, `leave`, `snapshot`). Definitions and runtime state remain separate. No score, currencies, progress, history, contacts or persistent consequences.
- `js/scenes/party.js` and `party.css`: readable crowd arrangements/reactions, optional opening follow-through and brief stepped presentation. Existing Rich standing art is reused unchanged. Crowd blocks and floor geometry are placeholders, not production art. Reduced-motion preference is honored.
- `party-dev.html`: independent DEV page. It loads no production state, people, world-event or gameplay startup modules. It reuses `RAScenes.createScope` for disposable listeners and `RAStageLayout.actorRect` for anchor math without calling scene transitions. The 270×480 shell scales as a unit; room-local contact is (125,132), source anchor (40,88), source size 80×96, scale 1. No existing production Stage Contract changes.
- `index.html` and `js/systems/devtools.js`: one DEV entry button and a new-tab handler with `noopener`. Original game remains in its own tab. Prototype does not pause or control original-tab music.
- `tools/release.mjs`: includes the DEV page in the existing artifact and applies the same generated asset version. Existing release identity, production page and deployment workflows remain intact.
- `tools/party-test.mjs`: deterministic session tests, included in `npm test`.
- `tools/party-browser-test.mjs`: repeatable browser QA and native/phone screenshot capture. Requires Playwright with Edge (or set `RA_BROWSER_CHANNEL`); optionally set `RA_PLAYWRIGHT_PATH` to its installed package directory. Arguments: local artifact URL, evidence directory, optional unchanged-baseline URL for smoke comparison.

## Verification

- Integration isolation audit: normal `index.html` loads no party data/system/scene scripts; the only production entry is a hidden DEV-panel button whose handler also checks that DEV is enabled. Direct prototype entry requires `?dev=1`. No normal phone, opportunity, scene or world-event route points to the prototype. The prototype cannot write a production scene ID because it never calls `RAScenes.go` and does not load `RAState`. All situations carry DEV/PLACEHOLDER classification, the data file explicitly limits canon to the behavior concepts, and the page visibly labels the entire room DEV / PLACEHOLDER.

- Deterministic gate: 33 JavaScript syntax checks plus existing foundation checks; all nine party resolutions, three openings, invalid/duplicate actions, equipment switching, reset, repeat and leave.
- Local build and artifact identity verification succeed. No remote push/deploy performed.
- Browser: all nine resolutions and three openings exercised through visible controls; repeated leave/re-entry, Escape, reset, reload and DEV gating checked. Screenshots inspected at native 270×480 and captured at 390×844. No browser runtime errors.
- Production paths: fresh START → bedroom → phone → close, plus representative existing ownership-save loading through normal START. Normal play hides the new DEV button.
- Save isolation: all localStorage keys/values remain byte-identical through prototype use. Browser QA also throws on any attempted prototype storage mutation. No schema or migration changes; no production progression code edits.
- Existing browser smoke: fresh save 37/37. On the progressed ownership fixture, `incoming world event foundation` fails on both this implementation and the unchanged baseline `8a6e8ee6ebb865141a3615d8260a7da8396c5aaa`; all other checks pass. That old test assumes its event starts ineligible even when the fixture already supplies the prerequisite. It is recorded, not changed under this card.

## Limits / HQ decisions

This is a deterministic three-situation loop with one equipped behavior at a time, minimal temporary text, geometric crowd reactions and no new audio/art. It does not establish the final party structure, balancing, narrative or progression. DEV gating is a testing affordance, not a secrecy/security boundary.

HQ and Ube have accepted the concept. No further placeholder content, mechanics, progression or polish is authorized. Recommend integration at HQ's controlled checkpoint, retaining the DEV-only boundary and the documented baseline smoke limitation. No merge, push or deployment has been performed. Actual story implementation and subsequent milestones remain unauthorized.
