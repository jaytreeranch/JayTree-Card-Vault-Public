# JayTree Card Vault PUBLIC v0.9.14 ? mobile browse filter reset and state
Date: 2026-11-07, America/Chicago
Public repository: jaytreeranch/JayTree-Card-Vault-Public
Source branch: feature/public-mobile-browse-reset-v0914-20261107
Parent public main: c65560b29475ea15e6561a14e43d6a054ff58d4c
Public page: https://cards.jaytreebooks.com/#collection
Host: JT-GE78 authorized JayTree Local Control tunnel, hostname_test returned JT-GE78. JT-GE75 also hostname_test verified. Read project AGENTS.md, current public status and public v0.9.13 handoff, private coordination START_HERE and Development Continuity Policy.

## Goal and implemented behavior
Previous v0.9.13 added Low-data browsing for slow connections, but the public collection has many sport, year, review, set, owner estimate, feature and set-finder controls. A narrow-screen user had to clear each field individually. This release adds a small browse-state summary and a Clear all filters control immediately beneath the collection toolbar.

The number of customized controls counts card search, sport, review, year, exact catalog set, set-finder query, active feature checkboxes, Open to offers, non-default gallery sort, and non-default set order. It does NOT count Low-data view, which is a visitor's image preference rather than a collection filter. When clear is clicked, restore search/sport/year/review/set/set-finder empty, offers/features unchecked and gallery sort Name A-Z and set-finder sort Newest, then recompute sourced-set selector choices and gallery state. The existing 1,006-card published catalog and 49 choice entries (including All sets) appear again. Preserve Low-data checkbox and status; do not force photo downloads or reset this preference. Clear button remains focusable when no controls customized by using aria-disabled and a no-op handler rather than the native disabled attribute. Status uses role=status, aria-live=polite and textContent, with a minimum 42px tap target.

This works with existing public set search/48-card paging, individual card deep links, inquiry builder, 27 sourced numbered want-list checklists, 21 unknown-denominator set groups and feature filters. It does not create any new identities, export records, override data approvals, set denominators, value estimates, paid calls, cookies, sessions or private endpoints.

## Scope
Public-only files: index.html, app.js, styles.css, 2 new regression test files, README, AGENTS.md, docs/START_HERE.md, docs/CURRENT_STATUS.md and this dated handoff. No changes to catalog.json, set-checklists.json, JPEG source assets, CNAME, public hosting/DNS, private authoritative LAN inventory/review/exporter/API or native Android scanner. Project manager aggregate remains manager-only and must not be edited here.

## Local QC and release requirements
- Initial 54/54 Node source tests PASS, including 4 new contracts for accessible clear/state, preserving Low-data, and no additional fetch/write endpoint.
- Real local headless Chrome at 320/390/1366 verified ten simultaneous customized controls, keyboard focus, one-click clearing all, 1,006 cards restored, 49 set choices and 48 initial gallery entries, with no gallery photos requested in preserved Save-Data mode. Normal non-SaveData browsing remains a photo-first gallery. PASS.
- Still run all earlier browser regression suites, syntax/staged whitespace, protected source and candidate SHA256 backup BEFORE release.
- Only fast-forward public main if exact remote baseline unchanged; first push isolated feature and verify full remote SHA; never force push. Require source GitHub Pages completed success, actual custom HTTPS JS/CSS/HTML/data Git byte parity, live Chrome 320/390/1366 browse reset/Low-data, private /api/cards and /owner/private HTTP 404.
- After source accepted, commit final docs status, verify remote main/feature SHA and final docs Pages/live byte match; save immutable LAN PUBLIC workstream receipts and detailed rollback stage log.
- Do not claim actual Android phone/cellular or real TalkBack/VoiceOver/NVDA testing from desktop Chrome emulation. GE78 and GE75 did not expose ADB executable at known paths for hardware access; that is not evidence a phone is offline.

## Protected rollback and next steps
Original/candidate source and SHA-256 receipts stored under \JT-DESKTOP\JayTreeFarm\CardVault\PublicShowcase\receipts\PUBLIC_V0914_BROWSE_RESET_20261107. On failure, create a new ordinary Git revert after checking concurrent main, never reset production or force-push.
1. Complete all local QC, guarded source and docs releases, GitHub Pages/live acceptance and final LAN receipts.
2. Coordinate optional smaller publisher-approved thumbnails only via LAN workstream's own approved export schema; keep public preview static and read-only.
3. Test real Android/cellular and formal screen readers when an authorized device becomes accessible; follow evidence before adding further mobile optimizations.

## Production source release QC ? VERIFIED
- Source commit ac105c24da83304a77a30efb069a41c7e53d2160 pushed to public main and feature/public-mobile-browse-reset-v0914-20261107; both GitHub remote refs exact SHA and local clean worktree independently confirmed. GitHub Pages source workflow completed SUCCESS.
- Ten live HTTPS files byte-for-byte identical to Git: index.html, app.js, styles.css, card-features.js, wantlist.js, wantlist.css, checklist-coverage.js, catalog.json, set-checklists.json and CNAME. Catalog, issued numbered checklists, photos and DNS unchanged.
- Chrome CDP testing ACTUAL https://cards.jaytreebooks.com/#collection at 320px/390px/1366px passed: reset ten customized browse controls, all 1,006 original catalog entries and 49 set options restored, keyboard focus on clear button preserved, Low-data retains zero initial gallery JPEG requests under simulated Save-Data, full original photo on demand and normal gallery when Save-Data false. All 12 browser suites and 54/54 Node tests PASS. Private /api/cards and /owner/private paths HTTP 404.
- Physical phone/cellular and actual screen reader still NOT tested; the existing GE78/GE75 ADB probes did not show an accessible device in known locations, not proof the phone is offline.
- Before source push protected original and candidate SHA-256 files on JayTree LAN under CardVault/PublicShowcase/receipts/PUBLIC_V0914_BROWSE_RESET_20261107. Final docs-only commit may change main SHA but not runtime, so check docs Pages and actual live docs byte parity separately.
