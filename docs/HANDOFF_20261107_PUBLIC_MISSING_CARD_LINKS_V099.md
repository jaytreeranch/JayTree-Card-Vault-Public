# JayTree Card Vault Public v0.9.9 ? individual missing-card share links
Date: November 7, 2026 (America/Chicago).
Repository: jaytreeranch/JayTree-Card-Vault-Public.
Source branch: feature/public-share-missing-card-v099-20261107.
Baseline remote public main: d5e45a412cb7a75f56b7f82971b8e07c5a50d056.
Website: https://cards.jaytreebooks.com/#wantlist.
Host: JT-GE78, connected using JayTree Local Control with successful hostname_test. GE75 hostname_test PASS. Shared coordination charter acknowledged; only PUBLIC website owned.

## Feature
Prior public v0.9.8 searches all 6,513 published missing numbered spots across 27 sourced checklists, but shared links could address only whole sets, not an exact missing card. This release adds a Copy card link button in both cross-set search results and each set's missing-number rows. It uses an exact scoped five-string JSON tuple [sport,year,brand,set,printed_number] in the URL fragment #want-card=. The four-part set key is the exact one used by the approved published want-list; the fifth element is the printed checklist number, NOT a private copy ID, grade, serial stamp or a guessed player.

Opening the URL in a new browser tab validates tuple length/type, matches a sourced published set key and requires the card's exact printed number to exist in the set's already-approved missing_cards array. If valid, it opens the existing modal, shows a Shared missing card line, filters to exactly that printed number, and preserves the existing provisional identity/parallel caveats. Malformed/tampered/obsolete links fail closed without any inventory modifications or a false missing card. Legacy #want-set and existing gallery #card links continue working.

Existing email and public GitHub missing-card issue links now carry the card-specific URL while retaining the same owner-managed inquiry fields. Clipboard success displays a confirmation; blocked clipboard opens a focused selectable read-only input. All text nodes use textContent and strict self-only CSP remains. No added network fetch, analytics, paid API, server endpoint, auth, third-party JavaScript or buyer account.

## Safe scope
Changes restricted to public wantlist.js, wantlist.css, tests and documentation. No private LAN database, API, Card Vault review statuses, originals, serial editor or publisher; no Android app/QA package; no public catalog.json, set-checklists.json, images, estimates, CSS navigation/index page structure, DNS or hosting settings changed. Published snapshot remains 1,006 records, 48 groups (27 sourced, 21 unknown).

## QA and release gate
- New 4 Node link-contract tests, 34/34 full Node suite PASS in initial local QC. Real Chrome local 320/390/1366 link sharing, copy success, actual full fresh-page link, exact card modal, malformed/stale fail closed, legacy set link, clipboard denied manual fallback PASS. Existing global missing-card and feature/set-mobile tests require full rerun pre-release.
- Save SHA-256 baseline and candidate to protected LAN release folder. Commit safe code/tests/docs to own public feature branch, verify exact GitHub remote SHA. Fast-forward main only after verifying no other public worker changed it; no force push.
- After push: verify GitHub Pages SOURCE build success; live HTTPS JS/CSS/JSON bytes match Git, real Chrome LIVE direct copied card URL/filters/fallback at 320/390/1366, private routes HTTP 404; then add verified final handoff/receipt and push docs-only checkpoint.
- No real physical Android 17 browser/cellular or formal screen-reader audit performed. No authenticated external GitHub issue submission tested.
- Rollback uses new normal Git revert after checking concurrent main; never reset production or force-push.

## Next 3 actions
1. Complete full regression and live Pages/browser acceptance and publish accurate release/handoff SHA/rollback receipt under LAN PublicShowcase and manager Workstreams/PUBLIC.
2. LAN workstream independently approves additional complete numbered checklists and owner data only through its own one-way exporter; new public v0.9.9 links must survive future approved source-data refreshes, and unissued/stale links must fail closed.
3. Test the public want-list/share on real Android/cellular and assistive technologies; address actual findings without touching Android scanner code.

## Verified source release ? production acceptance
- Public source commit 77d4cf8647344600ec39103021b5bf936ab8feb4 pushed to public main and isolated feature branch; GitHub remote SHAs both independently verified. GitHub Pages SOURCE workflow completed SUCCESS.
- Exact custom HTTPS byte parity against Git (8/8): index.html, wantlist.js, wantlist.css, app.js, checklist-coverage.js, catalog.json, set-checklists.json and CNAME. No new data export or code from other workstreams.
- Real headless Chrome against LIVE https://cards.jaytreebooks.com/#wantlist at widths 320, 390, 1366: 2 Brock Bowers missing rows, link copy and prefilled inquiry, fresh-document navigation into exactly one missing #6/11, rejected tampered/nonexistent/malformed URL, older #want-set link, blocked Clipboard fallback with selected manual input, existing search/DOM, no overflow: PASS.
- All 34/34 Node tests and previous public browser feature/set-finder/set-completion/coverage/global search/mobile suites PASS locally. Private routes /api/cards and /owner/private still HTTP 404.
- Source release rollback protected in \JT-DESKTOP\JayTreeFarm\CardVault\PublicShowcase\receipts\PUBLIC_V099_CARD_DEEPLINKS_20261107; archive contains original/candidate source, exact SHA-256 manifests and release stage log.
- Actual physical Android 17 device/cellular and screen-reader assessment remain UNTESTED. Authenticated third-party GitHub issue submission also remains untested; links were inspected, not externally submitted.
- This documentation follow-up is not a second application change. It may advance public Git SHA after the released runtime, so check GitHub Pages success for the final documentation checkpoint independently.
