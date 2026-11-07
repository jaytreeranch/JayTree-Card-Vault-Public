# JayTree Card Vault Public v0.9.4 - set dropdown completion fractions
Date: 2026-11-07, America/Chicago.
Repo: jaytreeranch/JayTree-Card-Vault-Public (public static GitHub Pages).
Isolated branch: feature/public-set-completion-labels-20261107.
Starting public-main SHA: 32233b68f62cceedb845db0481ffe72c69afc8b0.
Active website: https://cards.jaytreebooks.com/

## Owner request and behavior
The Collection / All cataloged sets dropdown incorrectly showed catalog entry counts such as '245 cards.' Replace that count with UNIQUE OWNED printed numbered-set spots / sourced issued checklist total, with fraction first so it remains visible in long native selects.
- 2025 Panini Absolute - Base Set (Football / Panini): 245 public catalog entries, 138 distinct numbered spots, 200 sourced total, 62 missing -> dropdown 138/200 owned (69%). Do NOT show 245/200.
- 2025 Donruss Optic - Base Set (Football / Donruss): 101/200 (51%) from 115 catalog entries.
- 1985 Topps Circle K - Base Set: 31/33 from 32 catalog entries, 2 missing, unissued number #31 excluded.
- For 21 groups without a complete sourced numbered checklist: display distinct numbers with 'total unknown'; NEVER infer a denominator from physical quantity, entries, parallels or a similarly named set.
- Selection summary shows sourced unique count, missing count, percentage, entry count, provisional-review caveat and direct missing-card link when applicable.

## Architecture
- Use published set-checklists.json already validated by wantlist.js, dispatch a one-time read-only CustomEvent to app.js. No additional API calls, no private state or read/write endpoint.
- Key all matches on EXACT [sport, year, brand, set] to avoid cross-brand collisions, e.g. a Donruss cataloged group with a Panini-looking set title must not inherit the Panini checklist.
- On missing/corrupt checklist data the gallery remains usable with owned unique numerator and 'total unknown.' Both loading orders are tested.
- Public-only HTML/JS/CSS changes; no publication of private copy stamp, unpublished images, database, owner notes, credentials or valuations.
- Private source publisher templates may need a separate coordinated update before a future approved snapshot refresh; do not touch the concurrent private LAN development branch.

## QC performed before publication
- Node native tests: 22/22 PASS including five focused set-count/cross-brand tests.
- Existing Chrome CDP feature/serial smoke: PASS.
- New Chrome CDP completion scenarios: PASS normal loaded data, PASS checklist unavailable graceful degradation, PASS delayed catalog/checklist race.
- JS node --check both app.js and wantlist.js PASS; git diff --check PASS.
- Earlier live baseline: 1,006 published cards, 503 Verified, 503 Needs review; 27 sourced/23 with named lists, 6,513 missing spots; this is the static snapshot, not live private review status.
- Public source v0.9.4 deployment VERIFIED: source feature commit 4ed1606505934c4f5d2f0bc0dbcbe7ccb82815c4, pushed to both feature and main with exact remote SHA verification. GitHub Pages workflow completed SUCCESS. On https://cards.jaytreebooks.com/ all 7 inspected live static assets equal Git committed bytes: index.html, app.js, wantlist.js, styles.css, card-features.js, catalog.json, set-checklists.json. Live Chrome: 10/10 DOM checks PASS including 138/200, 101/200, 31/33, 27 sourced, 21 unknown, 1,006 cards and 48 set groups; sample card photo 200 and private routes 404.

## Rollback and next 3 actions
Preserve public starting SHA 32233b68f62cceedb845db0481ffe72c69afc8b0. Before deployment back up affected public source and hash original catalog/set-checklists unchanged to JayTree LAN. If rollback needed, use NEW Git revert commit, no force-push; review any concurrent public changes first.
1. Commit safe public source/tests/docs to isolated branch, push, verify remote SHA.
2. Fast-forward public main only when its baseline has not changed; verify GitHub Pages build, public HTTPS asset bytes, Chrome set dropdown and private paths.
3. Tell private publisher development to port the public source template changes so a future static export does not regress the new set fractions. Physical Android/cellular browser acceptance remains not verified.

## Release caveats and continuity
- Physical Android 17 / cellular end-to-end inspection was not performed.
- Published 1,006-card snapshot and checklist totals are not a new live count from the authoritative GE78 LAN Vault.
- Private owner approval and exact serialized-card entry remain separate; this release does not change data or pricing.
- The PRIVATE one-way GitHub static publisher template should incorporate these public display changes before the next approved gallery rebuild. Coordinate with the separate private LAN development chat; do not overwrite it from here.
- Source-only rollback parent remains 32233b68f62cceedb845db0481ffe72c69afc8b0. Use new Git revert commits only, after checking concurrent public work.
