## Public v0.9.11 inquiry builder PRE-RELEASE development checkpoint (2026-11-07)
- New native on-page modal for I have this card in global search and per-set missing rows. Optional variant, price, public HTTPS photo link, notes plus condition. Owner-context exact set/card number. Prepares email draft or GitHub issue form with matching public field IDs, but never sends automatically.
- GitHub issue requires explicit public-warning consent before outgoing link activates. Optional photo URL must be HTTPS, must not embed credentials and must not use private IP/localhost/.local/.lan/.internal. Fields reset on close, no storage/API.
- Existing direct issue href still serves as non-JavaScript fallback. Issue template gains optional variation, asking-price, photo-url identifiers. Published public catalog/checklists, photos, private LAN, Android, values and DNS unchanged.
- Fixed intermittent older checklist coverage missed-event bug: move checklist-coverage.js before data-loader app.js and wantlist.js, all defer. Static test protects subscription order.
- Initial 43/43 Node tests and real Chrome 320/390/1366 form/HTTPS validation/consent/email/GitHub prefill/nested dialog PASS. Full legacy and Pages verification still required.
- Isolated feature/public-offer-inquiry-builder-v0911-20261107 based on bef6554140d1c2e5ad7929b0564c8a045299c720. Handoff docs/HANDOFF_20261107_PUBLIC_CARD_INQUIRY_V0911.md.

## Public v0.9.10 sourced set completion priorities ? pre-release checkpoint 2026-11-07
- New closest-to-complete three-card highlight from only the independently sourced 27 complete numbered checklists. Current leading set 1985 Topps Circle K 31/33, 2 missing, 94%; next Chain Reaction 8 missing, My House! 9 missing. No invented denominators for the 21 unsourced set groups.
- Added remaining-count filter 1?2 (one set), 3?10 (two sets), 11+ (24 sets), and highest-completion sort. Underlying existing search, sport and verified-name filters, shared card link and modal kept.
- All counts derive from published unique issued numbered spots only, not physical duplicate cards, serial numbers, parallels or quantities. No new data fetch, LAN database, publisher, Android, public catalog.json/set-checklists.json, images or DNS edits.
- FINAL SOURCE LIVE: 38/38 Node PASS; all legacy browser suites (card links, global search, fractions, finder, mobile, coverage, card filter) PASS. Source 0a4537ed72002402afeadc5dcd3e061b10eff5d5 remote feature+main SHA verified, GitHub Pages SUCCESS, eight live HTTPS source/data files exact Git byte parity. Actual Chrome 320/390/1366 live top-three set priority, count filters 1/2/24, highest percent, existing direct missing set modal and no overflow PASS; private edit routes HTTP 404. Physical Android/cellular and screen-reader audit UNTESTED.
- Source branch feature/public-set-priorities-v0910-20261107, baseline public main 0ae81ba5b3869a7c61c748862d47591bc6c948fe; handoff docs/HANDOFF_20261107_PUBLIC_SET_PRIORITIES_V0910.md.

## Public v0.9.9 individual missing-card link development (2026-11-07)
- Added read-only shareable link to one missing numbered card, not to an owner physical copy: #want-card=encoded JSON array of [sport,year,brand,set,printed_number]. Copy buttons in across-all-sets search and each set's missing rows; existing email/GitHub inquiries now prefill the specific card URL instead of set-only link.
- Cold-loading a valid card URL opens the proper sourced set and prefilters the numbered list to its single exact printed number; stale/unknown/malformed numbers fail closed. Legacy #want-set links unaffected. Clipboard permission failure shows a selectable manual link, never a false copy success.
- No published card or checklist data, names, identity approvals, estimates, photos, private copy IDs, LAN API, Android scanner, private publisher or DNS changed. All 1,006 catalog entries, 27 sourced lists, 21 unsourced groups retained.
- FINAL SOURCE LIVE: 34/34 Node tests and all existing public Chrome suites PASS (fractions, finder, feature, coverage, global search, mobile). Source 77d4cf8647344600ec39103021b5bf936ab8feb4 deployed on GitHub Pages SUCCESS, remote main and feature SHA verified; eight live HTML/JS/CSS/catalog/checklists/CNAME bytes exact Git match. Real LIVE Chrome 320/390/1366 opening cold card-specific links, bad/stale links, legacy set links, clipboard allowed/denied, offer deep links PASS; private /api/cards and /owner/private routes HTTP 404. Physical Android17/cellular and screen-reader review NOT tested.
- Isolated worktree feature/public-share-missing-card-v099-20261107 from public main d5e45a412cb7a75f56b7f82971b8e07c5a50d056. Latest handoff: docs/HANDOFF_20261107_PUBLIC_MISSING_CARD_LINKS_V099.md.

## Public v0.9.8 global missing search development checkpoint (2026-11-07)
- Cross-set search of existing 6,513 missing numbered slots across 27 sourced lists. Published 2,168 slots without verified player name remain searchable by printed number/set; names are never guessed. Separate 21 unsourced groups unchanged.
- Text search player, team, year, set or number, exact #number, 40-row pagination, owner inquiry options and View-in-set modal with exact numbered filter. Sport/verified names controls reused. No new HTTP requests/private API or database writes.
- Final 30/30 Node PASS; prior Chrome fraction/coverage/finder/mobile/features PASS. Source 49c9343d62d23ed6db3024ccbb6adfadd7b75d4f remote main and isolated feature SHA verified, GitHub Pages SUCCESS, eight live HTML/JS/CSS/data/CNAME files byte-match Git, real LIVE Chrome 320/390/1366 player/# exact/pagination/view-in-set PASS; private LAN edit routes HTTP 404. One first live test needed a wait for independently loaded catalog and checklist groups; corrected test passed locally and live. Physical Android/cellular still UNTESTED.
- No edits to catalog.json, set-checklists.json, private LAN, Android native scanner, private exporter, original photos, DNS or CNAME.
- Branch feature/public-global-missing-search-20261107 parent cc049ddd5ca48b086abad6515bf36063468401c3; handoff docs/HANDOFF_20261107_PUBLIC_GLOBAL_MISSING_SEARCH_V098.md.

## Public v0.9.7 checklist coverage LIVE and VERIFIED (2026-11-07)
- Published snapshot: 1,006 card entries, 48 exact (sport/year/brand/set) groups, 27 sourced complete numbered checklists and 21 awaiting reliable denominators.
- New collapsed visitor browser displays 21 unsourced groups: unique printed numbers recorded, total UNKNOWN, entry count, provisional-review caveats and suggestion links. No guessing missing counts or parallel/duplicate inflation.
- New public GitHub issue template checklist-source.yml and email draft allow voluntary reference suggestions only; private LAN reviews sources and owns all approved export changes.
- New script only reads existing public events; no extra public fetch, private API, personal data, Android build or LAN database mutation. Published catalog.json, set-checklists.json, photos and DNS unchanged.
- Final QC 26/26 Node tests; old Chrome set completion, set finder, feature filters, mobile and new 320/390/1366 coverage browser PASS. Source release b633e7cfda77fd319c01d02f5c5e88bc1df6f7c8 remote main+feature SHA verified, Pages completed SUCCESS, eight live static files exact Git byte parity, actual Chrome live 320/390/1366 acceptance PASS; private edit routes 404. Physical Android/cellular and real authenticated GitHub issue submission not performed.
- Separate LAN integration candidate request: Coordination/Requests/20261107_PUBLIC_to_LAN_checklist_sources_batch1.md.
- Handoff docs/HANDOFF_20261107_PUBLIC_CHECKLIST_COVERAGE_V097.md; source branch feature/public-unsourced-checklist-coverage-20261107 parent 4c931e656bbb1b39b1ba4865b6ec9418a40e7a53.

## Public v0.9.6 ? mobile accessibility QC (2026-11-07)
- Public site audit identified 320px physical viewport rendering as 337px CSS layout viewport due to header NAV extension to x=337. Header logo ended at x=152 and the rightmost nav link ended at 337.
- Minimal mobile-only fix: under 350px wrap site header into two rows; nav links stay visible at all inspected sizes. Up to 490px links use >=32px vertical targets; mobile missing-card offer/email actions >=34px.
- Chrome local preview checks PASS: 320/360/390/768/1366 all have exact viewport/scroll width and visible header nav; 320px missing-card dialog fits, Close button receives focus, visible offer/email link heights at least 34px. Existing set finder and fractions preserved.
- Changes: styles.css plus new tests/public_mobile_narrow_browser_smoke.py only at runtime; no public card data, checklist, images or private files touched.
- LIVE public source release f12002652798c5216d3ea2e0a42f8a53de9533ad on main and isolated feature branch, exact remote SHA verified; Pages deployment completed SUCCESS. Live custom HTTPS source bytes matched Git, Chrome responsive 320/360/390/768/1366 all PASS; modal focus and offer touch targets PASS. Physical Android 17/cellular remains UNTESTED.
- Latest handoff: docs/HANDOFF_20261107_PUBLIC_MOBILE_NAV_V096.md.

## Public v0.9.5 candidate ? set picker search/sort (2026-11-07)
- New native set dropdown helpers: search sport/year/brand/set; sort newest, fewest missing, highest completion percent or A-Z. Existing selected set and gallery card filter remain unchanged by searching or sorting; unknown-total sets follow sourced lists in completion sorts.
- Existing 48 catalog set groups, 27 sourced checklists and 21 unknown totals are preserved. Source catalog, photos, owner approval and static data are unchanged.
- Released source commit 2946dec4a19628732bcd16b6e87c3a69dcf0cc68 on public main and feature branch, remote SHAs verified. Based on 5efc70bb49c9e5e5d57989ecde8038c44f9dfc42.
- Node 22/22 PASS; existing Chrome set completion and new Chrome set finder PASS locally AND live. GitHub Pages source workflow SUCCESS; 7/7 live HTML/JS/CSS/data files exactly equal committed bytes. Physical Android/cellular checks remain open.
- Dated handoff: docs/HANDOFF_20261107_PUBLIC_SET_FINDER_V095.md.

## 2026-11-07 v0.9.4 public set completion dropdown
Current handoff: docs/HANDOFF_20261107_PUBLIC_SET_FRACTIONS_V094.md.
- Public catalog: 1,006 records across 48 cataloged set groups; 27 groups have sourced numbered checklists; 21 lack full totals.
- Example: 2025 Panini Absolute - Base Set (Panini / Football): 245 catalog records, 138 unique issued-number spots owned, 200 total, 62 missing. Dropdown must show 138/200, not 245/200.
- 1985 Topps Circle K: 32 records represent 31/33 numbered spots, two missing; unissued #31 is not a missing card.
- Public-only UI update: sourced fraction FIRST in select labels; otherwise unique numbered entries / total unknown; selected-set summary includes missing-card link and explains duplicate rows; feature filters remain intact.
- Source branch feature/public-set-completion-labels-20261107 from public main 32233b68f62cceedb845db0481ffe72c69afc8b0.
- Delivered source SHA 4ed1606505934c4f5d2f0bc0dbcbe7ccb82815c4 verified on GitHub public main and feature; Pages workflow completed SUCCESS; 7/7 live public source/data files match committed bytes; 10/10 live Chrome DOM checks PASS, sample photo 200 and private routes 404. Node 22/22 and 3 Chrome completion scenarios PASS. Physical Android/cellular acceptance remains not performed.

## 2026-11-07 public serial projection follow-up (v0.9.3 candidate)
Current: docs/HANDOFF_20261107_PUBLIC_SERIAL_SCHEMA_QC_V093.md. Copy-stamp projection must be owner-approved in the private LAN; malformed or partially invalid published serials now suppress all copy stamps pending review. Physical-copy editor tracked in private repo issue #15. Public main remains read-only and LAN review stays separate.

# Public Card Vault - current status
Updated: November 7, 2026.

LIVE v0.9.2 production: https://cards.jaytreebooks.com/ HTTPS PASS, feature source commit ee66a5c86fe4f859c6b5f5523f803d289dc9e67f. Previous rollback baseline main SHA: 63e7d1cd52e841d8083ea1e8e1eeb96ab131aeeb.
Snapshot: 1,006 cards; 503 Verified, 503 Needs review; 27 sourced numbered sets, 23 fully named lists and 6,513 missing spots. Public may lag private LAN reviews.

LIVE v0.9.2 (verified in GitHub Pages and real Chrome):
- Six combinable feature checkboxes: parallels, serial-numbered edition, autograph, patch, memorabilia, rookie; OR among selected features, AND with other gallery filters.
- Feature counts, disabled unavailable categories, clear button, and published feature chips on cards.
- Missing-set deep-link copy with fallback; checklist count/number validation; displayed snapshot date.
- Tests: 17 Node PASS, 7 headless Chrome DOM PASS, Chrome CDP interaction PASS.
- No private LAN, database, catalog/photo snapshot, DNS or host edits.

Remote main verified at source release ee66a5c86fe4f859c6b5f5523f803d289dc9e67f. GitHub Pages build completed SUCCESS. 8/8 live files matched committed bytes, real Chrome live DOM 8/8, sample image 200, private routes 404. Later docs-only acceptance revisions may advance main without changing runtime assets; consult latest release receipt.

Next:
1. Push and remote-verify safe public code/tests/docs.
2. Publish only if origin/main unchanged; trusted HTTPS/site smoke and rollback.
3. Integrate only owner-approved feature metadata from the private publisher later. A printed edition /325 is not the exact per-copy serial stamp.

- Future approved per-copy serial stamps can display in card details; absent or invalid stamp data is not guessed, and the public gallery has no serial editor.
