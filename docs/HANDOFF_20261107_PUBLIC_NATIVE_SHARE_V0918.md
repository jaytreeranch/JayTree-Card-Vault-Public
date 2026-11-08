# JayTree Card Vault PUBLIC v0.9.18 ? optional native Web Share
Date: 2026-11-07, America/Chicago
Repo: jaytreeranch/JayTree-Card-Vault-Public
Feature branch: feature/public-native-share-v0918-20261107
Baseline remote main: 508f489c6371efb740b7856ab40584a976a09e86
Public HTTPS: https://cards.jaytreebooks.com/#wantlist
Host: JT-GE78 JayTree Local Control hostname_test PASS. JT-GE75 hostname_test PASS. Read AGENTS.md, README, START_HERE, CURRENT_STATUS, prior v0.9.17 handoff, LAN access/GitHub policy, coordination START_HERE/INTEGRATION_GATES, and newest PUBLIC manager receipt. PUBLIC only owns public view code.

## Problem and new behavior
Existing public v0.9.17 copied a capped, source-backed 12-number preview with a vetted exact #want-filter= public link, public checklist source and provisional identity warning. For phones, manually copying into a messaging app is friction. Provide progressive native Share without changing privacy, checklist counts or existing Copy/CSV/Print/inquiry options.

A new 'Share N matching missing cards' button exists in sourced-set dialog. Hidden unless typeof navigator.share is function, disabled for zero vetted matches/unsafe query, following existing Copy button's active state. Handler synchronously invokes navigator.share({title:"JayTree Card Vault - "+title(s), text:shareMessage(s,matches,q)}) from visitor click without any awaited step before the call (browser activation). Same sourced current filter, capped first 12 numbered spots, honest remainder, HTTPS source, set-scoped filtered public link and provisional name warning. No photo, private copy ID, serial stamp or owner data, new URL route, API, storage, tracking or background action.

The browser/OS chooses the destination; the website does not choose recipients, post automatically or verify delivery. If browser resolves, status says app chosen controls sending; AbortError says menu closed/canceled; other errors suggest Copy. A shareGeneration captured before the native call prevents delayed completion/error from showing stale status if filter, set or dialog changed. Unsupported browsers retain Copy message and selectable manual fallback.

## Testing and release requirements
Four new source/security Node contracts PASS. New Chrome simulated-Web-Share at 320,390,1366 PASS: unsupported (button hidden and Copy available); mocked supported call gets exact #6 sourced filtered message with unnamed caution; success, cancel, other rejection, pending Promise settled after filter change, zero matches disabling, 785-match set 12-preview+773 remaining in under 2500 chars, no overflow. Chrome navigator.share is mocked; no physical Android Share target, message delivery or cellular access tested. Need full 70/70 Node and all 16 Chrome local suites before publishing.

Guarded public-only rollout: verify origin/main SHA and source baseline exact, then SHA256 baseline/candidate on LAN \JT-DESKTOP\JayTreeFarm\CardVault\PublicShowcase\receipts\PUBLIC_V0918_NATIVE_SHARE_20261107. Push isolated feature and remote-SHA verify, fast-forward main only when baseline unchanged, never force. Confirm GitHub Pages source SUCCESS, 10/10 live HTTPS static source bytes equal Git, live Chrome simulated Share under actual HTTPS 320/390/1366, private /api/cards and /owner/private HTTP 404. Then docs-only final Git commit, remote SHA and independent Pages/live docs byte parity, immutable Coordination/Workstreams/PUBLIC release and acceptance receipts.

## Boundaries and exact next three steps
Public only index.html, wantlist.js, new regression tests, AGENTS, README, START_HERE, CURRENT_STATUS, handoff. Do not modify catalog.json (1,006 published cards), set-checklists.json (27 sourced,21 unsourced,6,513 missing), JPEG assets, CNAME, DNS, private LAN database/review/one-way exporter, Android scanner, other workstreams' branches or manager aggregate. Real Android physical handset/cellular and screen reader untested; emulated viewport or mock Share does not certify these.
1. Complete full regression and LAN rollback, guarded source/docs release, live HTTPS and GitHub SHA verification, stage log/manager receipt.
2. When authorized physical Android Web Share/cellular available, test actual OS chooser and recipient apps/accessibility, without assuming delivery or editing the native Card Vault app.
3. New checklist sources, verified card names or thumbnails require LAN-owned one-way approved publisher, not public edits to source data. Rollback via NEW ordinary Git revert after checking concurrent main, never reset/force push.

## Production source release acceptance ? VERIFIED
- Runtime source 9cabf8797604632c9c7c25d63c6f0b4d3e338c02 committed and pushed to public main and isolated feature, both exact GitHub remote SHA verified and clean source worktree; GitHub Pages source workflow completed SUCCESS.
- Ten live custom HTTPS source/data assets byte-identical to Git: index.html, app.js, styles.css, card-features.js, wantlist.js, wantlist.css, checklist-coverage.js, catalog.json, set-checklists.json, CNAME. All approved data, original card images and DNS unchanged.
- Actual real production Chrome at 320,390,1366 validates simulated navigator.share supported/unsupported, precise #6 sourced filtered message passed to mocked provider, OS chooser cancellation/other rejection status, stale Promise resolve ignored after filter change, 785-match preview 12+773, copy fallback and no overflow. Private public /api/cards and /owner/private return 404.
- Full 70/70 Node contracts and all 16 local Chrome regression suites PASS. Production Share API mocked on desktop Chrome; this does not validate real OS chooser, Android handset/cellular, actual delivery or real screen-reader operation.
- SHA-256 protected baseline/candidate/released Git source and preserved rollback at private LAN CardVault/PublicShowcase/receipts/PUBLIC_V0918_NATIVE_SHARE_20261107. Final docs-only Git commit may advance main SHA after this runtime source; independently verify docs Pages and live docs bytes before marking docs complete.
