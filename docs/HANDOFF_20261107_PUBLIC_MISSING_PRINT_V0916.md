# JayTree Card Vault PUBLIC v0.9.16 ? printable missing-card set sheets
Date: 2026-11-07 America/Chicago
Public repo: jaytreeranch/JayTree-Card-Vault-Public
Branch: feature/public-missing-print-v0916-20261107
Baseline main: dd5c009b08715edd69269051de7196d060e0e12a
Website: https://cards.jaytreebooks.com/#wantlist
Authorized host: JT-GE78 Local Control, hostname_test PASS; GE75 also hostname_test PASS. Read AGENTS.md, current handoff, coordination START_HERE and INTEGRATION_GATES. PUBLIC owns only static web presentation.

## Feature / safeguards
Adds Print matching missing cards to already vetted sourced-set missing-card modal next to v0.9.15 CSV. The current number/player/team filter selects ALL entries from existing approved set.missing_cards, never merely 40 currently shown. Dynamic print-only DOM renders title, sport, owned/total/missing issued-number counts, source description/HTTPS URL, set public share link, provisional-name caution, check-box-style Have? column, printed number, published player or Not independently named, published team or blank and explanation duplicate copies/same-number parallels do not increase completion. No guessed names, private per-copy serials/IDs, buyers, images, scripts from source, backend endpoint or inventory mutation.

Uses native window.print ONLY after visitor click. The print-only sheet is hidden on normal screen, print CSS whites out page and hides all ordinary web UI, shows the source-backed printable table and repeats headings for multi-page prints. afterprint and dialog close reset DOM and print mode; zero results disables print button. Native print dialog also lets visitor choose Save as PDF in browser, with no automatic download or unattended printing.

## QC / release gates
- Four new Node contract tests for sourced-data guard, full matching spots, browser-native print, provenance, print CSS and read-only privacy, PASS.
- Local Chrome 320/390/1366 PASS: native print gesture stub, print emulation computed CSS makes sheet visible and rest of modal hidden, source warning and public link, two Circle K missing unnamed spots, exact filtered #6 one row, all 785 Upper Deck spots despite only 40 screen rows, afterprint/close cleanup, zero horizontal overflow.
- Must run full 62 Node checks and 14 browser suites; protect original and candidate source SHA256 on LAN CardVault/PublicShowcase/receipts/PUBLIC_V0916_MISSING_PRINT_20261107; remote SHA-gated feature/main pushes without force. Verify GitHub Pages SUCCESS, ten live HTTPS files byte-identical source, actual live Chrome print media at phone/desktop widths, /api/cards and /owner/private 404. Docs-only final acceptance and immutable Coordination/Workstreams/PUBLIC receipts.
- Real physical printer or generated PDF output, Android cellular and actual screen-reader remain NOT TESTED; Chrome print-media emulation is not equivalent to those. Do not assert print pages physically printed.

## Scope
Public only index.html, wantlist.js, wantlist.css, Node and Chrome tests, AGENTS.md, README.md, docs. Do NOT change published catalog.json (1,006 cards), set-checklists.json (27 sourced and 21 unsourced, 6,513 missing), JPEG originals, CNAME/DNS, private LAN inventory/reviewer/one-way exporter, Android native app, manager aggregate, background jobs or credentials.

## Rollback and next steps
Rollback previous main dd5c009b08715edd69269051de7196d060e0e12a by new normal Git revert after checking concurrent changes, NEVER force push/reset. Protect LAN baseline and candidate SHA256 and stage logs before release.
1. Full legacy QC and guarded public source/docs GitHub Pages, live Chrome/private 404, LAN receipt.
2. When real hardware available, check real Android print/cellular, assistive-screen-reader and actual printer pagination.
3. Future changes to checklists/card names or optimized JPEG thumbnails require LAN exporter authorization and one-way approved integration, never PUBLIC edits to raw data.

## Pre-final live regression and repair
The first runtime release 07c6c21921b3ddcb2f3096b7736cc329faf682f9 completed GitHub Pages SUCCESS and passed 10/10 source byte parity. Its live print browser suite exposed an intermittent modal-close timing race: when switching quickly between sourced sets, the prior dialog close event could clear the new print sheet after it was created. This was not seen in the first local browser pass. The source handler is now guarded: it clears print DOM on a close event only if the dialog is actually closed, while afterprint still clears normally. Added explicit synthetic delayed close event while a newly opened set's 785-row print sheet is active, plus Node contract. Targeted local Chrome print/CSV/card-deep-link/offer suites PASS at 320/390/1366 and 62/62 Node PASS after fix. Corrective public source commit, Pages/live browser verification and final docs are pending at this update; never describe 07c6c21 alone as the final fully accepted print release.

## FINAL production corrective source acceptance
- Initial source 07c6c21921b3ddcb2f3096b7736cc329faf682f9 GitHub Pages SUCCESS, 10/10 live public bytes. Real Chrome live first exposed a modal-close timing race when switching sets; v0.9.16 corrective source d35dfb576f2827d5ee8c22c6da1a5acc3a914fe4 guards stale dialog close events. Exact remote public main and isolated feature SHA verified, Git worktree clean, GitHub Pages corrective workflow completed SUCCESS.
- AFTER correction full Node 62/62 and 14 real local Chrome suites PASS; actual production HTTPS Chrome 320/390/1366 confirmed public-source two missing Circle K cards, exact one #6, complete 785 Upper Deck print rows, published source, unnamed cautions, print-media CSS hiding other page sections, guarded simulated delayed close event, cleanup and no overflow. Browser print was intercepted deliberately for test automation; real printer/PDF document not generated or verified.
- All ten live static site HTML/JS/CSS/catalog/checklist/CNAME files exact Git bytes, actual /api/cards and /owner/private HTTP 404. Original 1,006 catalog cards, 27 sourced and 21 unsourced set groups, 6,513 public missing numbered spots, owner LAN/Android, card images and DNS untouched. Complete original/candidate/initial release/corrective source SHA256 backups at private LAN CardVault/PublicShowcase/receipts/PUBLIC_V0916_MISSING_PRINT_20261107.
- Final documentation-only commit and Pages/byte acceptance are separate release steps; do not claim until independently verified. Remaining: physical Android/cellular, genuine printer/PDF and real assistive screen reader test.
