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
