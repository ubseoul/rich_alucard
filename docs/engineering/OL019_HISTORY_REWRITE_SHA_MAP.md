# OL-019 - PUBLIC HISTORY REWRITE: SHA MAP (hq_only containment)

Method: full-repository `git filter-repo --path art_department/ships/art_ship_003/hq_only --invert-paths` over all 44 public branches + 6 tags.
Freeze start (UTC): **2026-09-29T16:23:22Z**. Affected refs before: **44 branches + 6 tags = 50** (all contained the path in history). Affected refs after: **0**.

## Authoritative old -> new SHAs

| Old SHA | New SHA | Note |
|---|---|---|
| 974ea1c00ee6413f6f6c6a15f64209438e9e2e9d | aa53a02338242b77919152241a33dcd62090d15a | lineage base (BREAK I) |
| 249c5f720c475862b00a28d98c4f382071b95e31 | 66a999c486aecff09682f1e14372fde9afb64069 | F1 accepted (UL-L2) |
| 5c719f992a1f49d89bd45fa7d665f52ae6abba40 | 5f398e019eac1faad4a4ccdeb4790cc2e27af6a0 | NEW OGA M1-M6 |
| 54930b2d15841a4dd1694415ddb76b008bfda8b1 | add55ad77970c1a1f5a55930015bda3385e58bd9 | NEW OGA M7 |
| 3abc08cda52d851f159dbcc1f2978d4cf6e7a749 | fb3ff8a467cb4354922ebbbea681a1fd1a1f5f5a | F01 THE PLAY spec rev2 + sim |
| b7a05c0696734770e894cc8de9fee350bc645adb | c899d709953afc58494c0a4be82a7b34c8608af8 | F01 THE PLAY browser sandbox (Sonnet) |
| 101a394b5fa9c41ec089bc7022ee86ff43f5f31c | 5e4b3a31f96624f1e8dc87b4412a9b23fdc4bf79 | IF-1 v1.0 tag target (F00) |
| 60c7e43a24e4d16eaa5770d60881baaf19f0b19e | 1769bc543afcbd4e96c1f620e9de627404e3b81f | IF-1 v1.0-rc1 tag target |

New `main` tip: **b06fcfefa8b2d1f1a58a8ec6e9d0d1238f63c49e**  -  New `gh-pages` tip: **9dbaf0624ebd79a3f0d98357e890d0cacf9f43f6**

Complete mapping (every rewritten commit, 210 entries): `docs/engineering/OL019_HISTORY_REWRITE_COMMIT_MAP.txt`.

## Ref map (old tip -> new tip)

| Ref | Old tip | New tip |
|---|---|---|
| refs/heads/art/art_department_refresh_2026 | 6f43494d028520d47cd07a02a6d4c1955349aaf7 | f4adbafd9c7e0f99f8df971358ecfbcf6a60b148 |
| refs/heads/art/art_ship_008 | c359092427711b0882fceaf096df65accb3a870b | 572a00d61764f9837be4744aa4f5aba44f037c5f |
| refs/heads/art/art_ship_009 | c55483b7d8e4005395b67a7c2aa37c219110772e | b6bec8afae2ce24cfb6aaa25cc5471ebe93393b5 |
| refs/heads/art/art_ship_010 | 1c96101213a996b2975c31029ef6e823f9ebc745 | 48f4379c56d0a83c0f157df87151b0c4d0f595d1 |
| refs/heads/art/art_ship_011 | c6a49410e558be34aa44703015556c00a4e592c9 | 2585a72e8d4bf8e27a53b7c6abd0c2dcf59364b6 |
| refs/heads/art/art_ship_012 | fcf094b30d5f8288f7727e5faf3f61fed8ff5016 | bf30054eba292bf02fce142bc6b87baf208f141b |
| refs/heads/art/art_ship_012_closeout | 920912ff3d006c33d9b002d2436b8e1b0ed83f72 | 44c8523ea50e2998ea6554f96c4b886904f59faf |
| refs/heads/art/art_ship_013 | 9d6f521bdfc404f03a5f5bba7c700860de1eb293 | 8b04966deef9225966564db569f6f79a556ce8c4 |
| refs/heads/art/art_ship_014 | f1ae59a3f342a30fc09a3c4659198795ef867178 | 074d0a5b3c2867fec311ce8facb37483a14547e5 |
| refs/heads/art/art_ship_015 | d73946c0399485f7d4a6329966368c06cb368d3e | d6a7863c9672cca44af0369492e093a8ed560bde |
| refs/heads/art/polish_preproduction_001 | d8c24b632ecdc134986b4f81ff5d3f3959609eea | 47c41ae1454ca47357f266d1affbb53c11092794 |
| refs/heads/claude/art-ship-008-integration | a16196e4fbc0c7530a00bdfe915fb9c9c7cd1826 | 245adb6d098a187e68f906c1c083ff4e771fcd75 |
| refs/heads/claude/art-ship-009-integration | 5af730a132c035f6f2f5afb20eef5149ca3f2761 | 51ee58ea4b0f2cf3a9e2643a912532a3f3288ad1 |
| refs/heads/claude/art-ship-010-integration | 8eab30dc790071ec8da98f65311e2b4676fabad0 | 7db7b783f6a003c23263a9e5ae9860edcfa3d46f |
| refs/heads/claude/eloquent-shannon-kc5qkn | c2a637bb2df8143f117cff1cecc8ca1cff6ba11e | dfcbea0283a64c2046fc8c3e9c2d07a17b7ee1b6 |
| refs/heads/claude/final-art-integration | 06d378846d98347715800624d76bf619df1465ac | 003b48128cacdcbb1e4f2802305c7a01d158c204 |
| refs/heads/claude/friendly-gauss-ml4iqn | 4d93dc9e3b6c58a0b7a9082b20a5409c16141406 | 236eacde4a31f7d27cc1668be84dad80584d6748 |
| refs/heads/claude/frozen-art-integration | c887f5d6d1a417384d906a361e2b52c0f3423e3c | 7510a8245ae9689a49418082d4924c8096716a8c |
| refs/heads/claude/giga-open-closure-001 | f1cb5780abd9f4e6807b05632ca26c5f5d2a067b | f611c476c13af07e46164eeb674ea3fcbc6ff6a2 |
| refs/heads/claude/hold-clearance-001 | a66170218375e52404715789dde48c23726a6044 | d1d3e65e9c6b027fbfb03227f938de726aea9928 |
| refs/heads/claude/open-art-life-integration-001 | 459f252eebc5cc4f3de87e0796ddec5d1b298e05 | 99322a1de096a1976a1a8b240adab8e52f2f9832 |
| refs/heads/claude/playtest-candidate-001 | 229e41a6b2ae391b68a306caee9c42333cf544ac | f8b94e3ed524824d7926d22cbfd55f04f3c45122 |
| refs/heads/claude/presentation-director | 1dde17914e70e2340ccc2719dbbffbd5bab2f2db | f046464ed65f0471120c1f5ec4246846c3fb41f5 |
| refs/heads/claude/ship015-integration-001 | 9ae8fd7f66ac98d6b76d251b1280206260236ee0 | 45947d1d72d470ca021aed1a1dcaeeb63382e427 |
| refs/heads/codex/open-micro-closure-001 | 627d85a2691e978e5b8e026070317d6365c6eb55 | f24f0b1227c9ba5f121aa69e3b7648ae573c9cfc |
| refs/heads/deepseek/break-i-giga-chassis-hardening-001 | 974ea1c00ee6413f6f6c6a15f64209438e9e2e9d | aa53a02338242b77919152241a33dcd62090d15a |
| refs/heads/deepseek/ul-l2-001 | 249c5f720c475862b00a28d98c4f382071b95e31 | 66a999c486aecff09682f1e14372fde9afb64069 |
| refs/heads/frag/audio-completion/001 | eee8e5f85c161b1355725777052402a5a8db7c3e | 9eb87323caa88252a98b931879d0712d4e235304 |
| refs/heads/frag/f13-balance-harness/001 | e80feae224b7a4457bd8862dbc312c39ffa210d1 | bd97d14a9d083a0bb0f0fd0e544e92f2b25eaccc |
| refs/heads/frag/f14-fcpb-qa-harness/001 | 5d00f80e3083fd3f022817f5d2b7c6ba92367cdb | 0c6837ba90e01712fb8e78384071d338af983491 |
| refs/heads/frag/iron-and-grace/001 | 3faadebf21b5c6bd0c300db5a53f754f1d105125 | 941af1d4c1bae8cedb829f87a6aa3a5100d48f86 |
| refs/heads/frag/new-oga-ladder-close/001 | 5b22f3fc822a263873e209911b22cbe191e98302 | 84141373f87364d6c9634d5c51981dfd66228284 |
| refs/heads/frag/playmakers-war-room/001 | 583ae5e00bfe2cd509580ead1e2e980535d3292c | de99634e1eb3a95fc82e21a1cb0ce1858e8f41ac |
| refs/heads/frag/rainmaker/make-it-rain-sandbox-001 | a22b254596476d052560c8839a177d41f1067448 | 5c87d773c8902c6ed05c583eeff28c900b198291 |
| refs/heads/frag/rainmaker/make-it-rain-sandbox-polish-001 | fabdfdc4f5361aa21631daed9d38c46b304480d5 | fd7b5f5ca9bb8baad93a3d0a6bee492d41a79397 |
| refs/heads/frag/showdown-core/001 | 4d93dc9e3b6c58a0b7a9082b20a5409c16141406 | 236eacde4a31f7d27cc1668be84dad80584d6748 |
| refs/heads/frag/showdown-core/play-sandbox-001 | b7a05c0696734770e894cc8de9fee350bc645adb | c899d709953afc58494c0a4be82a7b34c8608af8 |
| refs/heads/frag/showdown-core/play-spec-001 | 3abc08cda52d851f159dbcc1f2978d4cf6e7a749 | fb3ff8a467cb4354922ebbbea681a1fd1a1f5f5a |
| refs/heads/frag/the-trap/001 | 8a48f1ed32db0912ecc477d9119d3b8e0d104efc | 14b11c2cc0487f8723fad02d675b92e8843f96aa |
| refs/heads/gh-pages | def693593ed8ed7123576d7876a102d17ad788f7 | 9dbaf0624ebd79a3f0d98357e890d0cacf9f43f6 |
| refs/heads/hq-roadmap | 20747cc5a55cd0545f6a3945719b2f85406e57b8 | 07947443a5ccff62710846b63b3bad8fcda6618a |
| refs/heads/integration/ube-portal | 101a394b5fa9c41ec089bc7022ee86ff43f5f31c | 5e4b3a31f96624f1e8dc87b4412a9b23fdc4bf79 |
| refs/heads/main | 095e2c1d14b9e9a7ee944d448b2487fce432d46e | b06fcfefa8b2d1f1a58a8ec6e9d0d1238f63c49e |
| refs/heads/qa-harness-hardening-001 | a6fc4fd7eb425be4b918fcf4af939541ccf1f904 | d078838311fc0e591188dc997ccd636e2e60df83 |
| refs/tags/if1-v1.0 | 05f5cf8c99c33d6c41bada971970fde2425171ce | 140a688223db897b53ce35330ce71775cf317fda |
| refs/tags/if1-v1.0-rc1 | af5d37935856a3310622a8709d666049126e53f8 | 681fd8a26d133e33b3ab7e35553323c0653cafa1 |
| refs/tags/legacy/f1-accepted-249c5f7 | 249c5f720c475862b00a28d98c4f382071b95e31 | 66a999c486aecff09682f1e14372fde9afb64069 |
| refs/tags/legacy/lineage-base-974ea1c | 974ea1c00ee6413f6f6c6a15f64209438e9e2e9d | aa53a02338242b77919152241a33dcd62090d15a |
| refs/tags/legacy/new-oga-m1-m6-accepted-5c719f9 | 5c719f992a1f49d89bd45fa7d665f52ae6abba40 | 5f398e019eac1faad4a4ccdeb4790cc2e27af6a0 |
| refs/tags/legacy/new-oga-m7-accepted-54930b2 | 54930b2d15841a4dd1694415ddb76b008bfda8b1 | add55ad77970c1a1f5a55930015bda3385e58bd9 |

## Frozen assets

Frozen art is validated by **content hash, not historical commit SHA**. No frozen art was regenerated; the rewrite only pruned the `hq_only` path.

## Agent rule

Every agent MUST delete its existing clone and re-clone fresh from the rewritten repository. **Pushing any pre-rewrite branch is a P0 reintroduction.** Applies to Sonnet, DeepSeek, Google/Antigravity, Art Agent, and any Codex/worktree session.
