# JayTree Card Vault Public v0.9.8 ? global missing-card search
Date: 2026-11-07 America/Chicago
Public repo: jaytreeranch/JayTree-Card-Vault-Public
Isolated feature branch: feature/public-global-missing-search-20261107
Parent production main SHA: cc049ddd5ca48b086abad6515bf36063468401c3
Public URL: https://cards.jaytreebooks.com/#wantlist
Host: JT-GE78 verified via authorized Local Control hostname_test.

## Scope
Owner requested continuing PUBLIC website enhancements while the LAN and Android developers remain separate. Prior page lists 27 sourced numbered checklists with 6,513 missing printed spots and 21 unsourced groups, but visitors need to open every set to find a player or number. Added a global client-side search above the sourced lists using ONLY the validated already-fetched set-checklists.json. Player, team, number, sport, year, brand, set terms are searchable and case insensitive; #number denotes exact printed checklist number, not a physical serial stamp or substring. Empty or one-character queries do not display all records.

Shows results in 40-row pages. View in set opens the existing modal and applies exact #number match. Safe owner-directed GitHub issue and email inquiry links remain; visitor cannot write inventory, approve cards or sell items. Existing sport and verified-name filters also apply; cards whose player name is not independently known show number/set, not fabricated names. Public inventory is static snapshot, NOT realtime GE78 LAN data.

## Ownership and privacy
Changed ONLY public index.html, wantlist.js, wantlist.css and safe tests/docs. No new API, fetch, SQLite, JSON, original photo, value estimate, serial stamp, LAN publisher, Android package, authentication, DNS/CNAME or Cloudflare edit. Public visitor issue/email is suggestion only. Preserve unique printed checklist slots, not duplicate copies, same-number parallels, or physical-copy serial numbers. Coordination/Workstreams/PUBLIC is write-scope for status receipts; no edits to manager-only aggregate register.

## Quality gates
- Full Node source tests 30/30 PASS; four new global search contracts.
- Real Chrome CDP local 320/390/1366: 2 missing Brock Bowers, 20 exact #6 slots, Williams 61 paged 40 plus 21, sport filter, owner links, modal exact-card filter, 27 sourced/21 unsourced and no horizontal overflow PASS.
- Rerun previous Chrome checks and source syntax, stage diff check; protect baseline with sha256 on LAN before publication.
- Publish safe source on isolated feature branch only, verify exact GitHub SHA; fast-forward main ONLY if unchanged and reverify SHA; Pages must show SUCCESS, live assets exact Git bytes, actual Chrome live interactions and private endpoints still 404.
- Physical Android 17/cellular and authenticated third-party GitHub offer submission NOT tested in desktop Chrome emulation.
- Rollback with NEW ordinary Git revert after checking concurrent changes, NEVER force-push. LAN original source snapshots and rollback hashes under CardVault/PublicShowcase/receipts.

## Next three actions
1. Finish QC, publication and remote/LAN verified GitHub+Pages+Chrome handoff.
2. LAN independently validates checklist source candidates; future approved static JSON export must preserve public site code and strict publication approval.
3. Complete physical Android/cellular public browser and keyboard/screen-reader accessibility acceptance when hardware access permits.

## VERIFIED live source release (after production acceptance)
- Source GitHub main and feature branch at 49c9343d62d23ed6db3024ccbb6adfadd7b75d4f; exact remote SHA verified, GitHub Pages deploy completed SUCCESS.
- Actual custom-domain HTTPS eight files byte-identical committed Git: index.html, wantlist.js, wantlist.css, app.js, checklist-coverage.js, catalog.json, set-checklists.json, CNAME; approved data remains unchanged.
- Real headless Chrome against LIVE https://cards.jaytreebooks.com/#wantlist at 320,390,1366px PASS: sourced/unsourced lists, Bowers two, exact #6 twenty, Williams 61 paginated, sport filter, owner issue/email, View-in-set exact numbered modal and no horizontal overflow.
- First live browser test failed ONLY because it checked 21 coverage cards immediately after the 27 independently fetched sourced tiles; corrected browser test to WAIT for both async requests. Corrected test PASS against both live site and local preview; no application change required.
- Live public paths /api/cards and /owner/private HTTP 404. All 30 Node tests and previous Chrome fraction/set finder/coverage/mobile/feature tests PASS.
- Real Android17 hardware/cellular and signed-in GitHub issue submission NOT tested.
- Protected base source and source release hashes at \JT-DESKTOP\JayTreeFarm\CardVault\PublicShowcase\receipts\PUBLIC_V098_GLOBAL_MISSING_SEARCH_20261107. This follow-up documentation/test commit is not an additional UI feature.
