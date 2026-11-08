# JayTree Card Vault PUBLIC v0.9.19 ? shareable collection gallery views
Date: 2026-11-07 America/Chicago
Public repository: jaytreeranch/JayTree-Card-Vault-Public
Feature branch: feature/public-gallery-links-v0919-20261107
Public main source baseline: cfa7a374cf0a7f317431cf21e9fc8c8c908acf95
Site: https://cards.jaytreebooks.com/#collection
Authorized machine JT-GE78: JayTree Local Control hostname_test PASS; JT-GE75 hostname_test PASS. Read public AGENTS, START_HERE, CURRENT_STATUS, v0.9.18 handoff, standing tunnel/GitHub policy, CardVault/Coordination START_HERE and INTEGRATION_GATES. PUBLIC owns only public static HTML/CSS/JS and tests.

## Goal
Public collection readers can already share one card, full sourced set, one missing card or an exact filtered missing list. Sharing a public gallery search (e.g. Football, year 2025, rookie-tagged) previously required explaining every filter. Provide an accessible, one-click shareable URL that preserves the current read-only published gallery view. No new hosting, database, private export, API, personal link tracking, images or LAN work.

## Implementation and safety
New Copy link to this view beside Clear all filters, with explanatory help, aria-live status and readonly, focusable/selectable manual-copy field on clipboard denial. Default unfiltered view -> #collection; customized view -> #browse=encoded array with schema jt.public.browse.v1 and public search, sport, review, year, selected set JSON key, set finder search, set-list order, gallery sort, offers boolean, public feature flag array. All fields are existing public UI filters. Strict hash <=2400 characters and query/finder <=100 characters, no control chars, known option values and known current set key; feature options must exist, be enabled, unique. Invalid, old-schema, unknown or oversized links are ignored without altering existing gallery. After catalog/options load, valid hash restores public controls and recomputes gallery. In-session hashchange also restores. Background async checklist updates do not erase shared-view feedback; visitor changes clear obsolete manual link/copy confirmation. Async clipboard completions ignore stale filters. Low-data photo preference remains personal and is deliberately excluded.

All card data still comes from the existing static public catalog. No new fetch, server write, visitor tracking, storage, profile, original image modification, per-copy serial number, owner valuation approval, payment, eBay or Android work. The public gallery's 1,006 published entries, 27 sourced numbered and 21 unsourced set groups and 6,513 missing vetted numbered slots remain unchanged. Unknown totals and tentative names remain labeled, never guessed.

## QC, release and scope
4 new Node tests initially PASS: accessible copy/status/manual fallback, exact filter restoration without Low-data preference, strict fail-closed validation, stale async guard and no added fetch/API. Real Chrome local 320/390/1366 initially PASS: default collection URL, public filter/search/rookie/sort share, reload same result, advanced known Circle K set selection plus offers/review/set sorter, clipboard success and manual focus+selection, stale async completion, multiple invalid/stale/disabled feature filters, in-page hashchange and no mobile overflow. One discovered issue in real Chrome: late checklist readiness erased the restored-view status; fixed by clearing share feedback on user-driven set-finder/set-sort events rather than generic refreshSetOptionLabels() (which runs when checklist data arrives). Tests rerun PASS.

Release gates: run full 74/74 Node tests and all 17 local Chrome browser suites, syntax + staged diff checks, SHA-256 baseline/candidate backups in private JayTree LAN under CardVault/PublicShowcase/receipts/PUBLIC_V0919_GALLERY_LINKS_20261107. Only push isolated feature and confirm exact remote SHA; publish main with guarded fast-forward only if unchanged, no force. Verify GitHub Pages source completed SUCCESS, all ten live HTTPS public assets byte-identical to Git, actual live Chrome 320/390/1366 deep link and clipboard behavior, public private /api/cards and /owner/private HTTP 404. Then docs-only acceptance commit and Pages/live docs byte-match, immutable PUBLIC coordination receipt.

Scope only index.html, styles.css, app.js, new browser/source tests, AGENTS, README, START_HERE, CURRENT_STATUS, handoff. DO NOT edit source catalog.json, set-checklists.json, front card JPEGs, CNAME, DNS, LAN inventory/reviewer/approved exporter, Android native scanner or cross-workstream manager aggregate. Keep original copies and SHA-256 rollback protected; rollback by NEW ordinary Git revert only after checking concurrent public main.

## Limitations and exact next three
This tests real desktop Chrome with mobile-size emulation, not an actual Android 17 phone or cellular conditions. Source data and names may remain provisional; a shared link does not grant editing or transmit private records. Formal NVDA/TalkBack/VoiceOver acceptance pending. No external message auto-sent.
1. Complete all local regressions, backup, guarded feature/main/docs GitHub pushes, real HTTPS and Pages verification, immutable PUBLIC manager receipt.
2. Real Android/cellular and assistive technology UX on approved handset when accessible, including gallery link copy, low-data and Share menu.
3. For optimized photo thumbnails/new sourced checklists use an approved one-way LAN publisher integration request; PUBLIC cannot modify private card data or unapproved photos.
