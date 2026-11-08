# JayTree Card Vault PUBLIC v0.9.15 ? sourced missing-card CSV
Date: 2026-11-07 America/Chicago
Repo: jaytreeranch/JayTree-Card-Vault-Public
Isolated branch: feature/public-wantlist-csv-v0915-20261107
Baseline public main: 00eb739885f70ed931557ce36bf33e905ed7ad32
Site: https://cards.jaytreebooks.com/#wantlist
Authorized machine: JT-GE78 JayTree Local Control, hostname_test PASS; GE75 hostname_test PASS. PUBLIC owns only website HTML/JS/CSS; LAN owner inventory and exporter, ANDROID owns scanner. Coordination START_HERE and INTEGRATION_GATES read.

## Feature
A visitor can open an approved sourced numbered set and click Download N matching missing cards (CSV). It exports the existing modal's current number/player/team filter across ALL matching missing printed numbers, not just the first 40 currently rendered. An exact #6 share-card deep link exports only number 6; an unmatched query disables the button. The report has Sport, Year, Brand, Set, Printed number, Published player reference, Published team reference, Public checklist source, Public missing card link and Identity caution columns. All fields originate from the approved public set-checklists.json and existing cardUrl/sourceValid logic. Names lacking independent approval remain blank with caution. Every row warns that published identity or variation might be provisional.

Browser Blob CSV uses UTF-8 BOM, CRLF, double-quoted and escaped cells. All control bytes and whitespace are normalized; strings beginning with =, +, - or @ are escaped with apostrophe to mitigate spreadsheet formula execution. The report downloads locally from a deliberate button click, never on load and without server upload, inventory write, scheduled task, tracking or third-party API. Temporary in-memory object URLs are revoked. No source photo or private per-copy identity/serial, user emails/addresses, financial data or confidential originals are exported.

## Scope, invariants and QC
Only public index.html, wantlist.js, wantlist.css, new source/browser tests, AGENTS, README, START_HERE, CURRENT_STATUS and this handoff. Do not edit catalog.json (1,006 published entries), set-checklists.json (27 sourced and 21 unsourced groups, 6,513 published missing printed spots), original JPEG, CNAME/DNS, private LAN database/reviewer/one-way exporter, Android app or manager aggregate. Public site remains view-only and fails closed for unknown/stale direct card links.

Initial four Node contracts PASS: button and sourced-data guard, complete filter without pagination cap, CSV spreadsheet-formula/quote/newline injection safety, no private writers. Local Chrome downloaded real CSV at 320,390,1366: 1985 Circle K two unknown names (#2/#6), filtered #6 one row, unmatched filter disables download, 1991 Upper Deck 785 missing rows despite 40 rendered, correct source/links and no horizontal overflow. Must run full 58/58 Node and 13 Chrome suites before release; protect original and candidate files SHA-256 on private LAN. Verify full remote feature SHA, no concurrent main updates, fast-forward main without force, GitHub Pages source SUCCESS, live HTTPS file byte parity, real live Chrome CSV and private edit-route 404. Commit final accepted docs and verify remote SHA and final docs-only Pages status independently. Save immutable manager PUBLIC workstream receipt, rollback and stage log.

## Limitations, rollback, exact next three
A CSV is not a live inventory snapshot; future LAN-approved exports may change the approved public source. CSV caution applies even when player name is present. Physical Android/cellular and real screen-reader acceptance still not tested; Chrome viewport emulation does not certify them. No buyer offer sent/paid/listing created.
Rollback baseline public main 00eb739885f70ed931557ce36bf33e905ed7ad32 with NEW ordinary Git revert only after checking concurrent main; never force push or reset. Protect originals and candidate source under \JT-DESKTOP\JayTreeFarm\CardVault\PublicShowcase\receipts\PUBLIC_V0915_MISSING_CSV_20261107.
1. Complete full local QC, protected backup, GitHub source/docs deployment and exact live CSV/browser acceptance.
2. Continue approved missing checklist data solely via LAN owner static export; public owner copies/serials must remain private.
3. Real Android/cellular and formal assistive-screen-reader validation when an authorized device is accessible; optional smaller thumbnails need LAN publisher contract.

## Production SOURCE release acceptance ? verified
- Runtime source 57543e4ba27074b00fb189704e3aa9774156aeee pushed and exact remote SHA verified on both public main and feature/public-wantlist-csv-v0915-20261107. GitHub Pages SOURCE completed SUCCESS.
- Ten actual live HTTPS HTML/JS/CSS/catalog/checklist/CNAME files byte-identical Git. 1,006 published cards, 27 sourced, 21 unsourced groups, original photos and DNS unchanged.
- Actual live Chrome 320/390/1366 downloaded genuine CSV files with 2 unnamed Circle K missing numbers, exact filtered #6 one row, and full 785 Upper Deck missing slots though only 40 DOM entries visible. Blank unverified names and provenance/caution validated. Private owner routes 404.
- All 58/58 Node contracts and 13 Chrome suites passed; protected source and rollback SHA256 archive on JayTree LAN CardVault/PublicShowcase/receipts/PUBLIC_V0915_MISSING_CSV_20261107.
- Public CSV represents the vetted static snapshot, not realtime private inventory. No email/GitHub inquiry submitted, actual Android hardware/cellular and real screenreader untested. Docs-only follow-up may advance Git main SHA; verify workflow and live docs bytes separately.
