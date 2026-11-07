## LATEST public v0.9.7 ? unsourced set browser (2026-11-07)
Read docs/HANDOFF_20261107_PUBLIC_CHECKLIST_COVERAGE_V097.md. Public want-list offers a collapsed, searchable checklist-needed section for 21 groups without approved denominators. GitHub issue or email source suggestions only; no public inventory edits or inferred completion percentages. Public data and all approved card images unchanged. Isolated public branch feature/public-unsourced-checklist-coverage-20261107 from 4c931e656bbb1b39b1ba4865b6ec9418a40e7a53. SOURCE LIVE VERIFIED: b633e7cfda77fd319c01d02f5c5e88bc1df6f7c8 on public main and feature; GitHub Pages SUCCESS, live assets 8/8 match Git, actual Chrome 320/390/1366 coverage browser PASS, private edit routes 404. New data and original assets are unchanged.

## v0.9.6 responsive navigation and touch targets (2026-11-07)
Read docs/HANDOFF_20261107_PUBLIC_MOBILE_NAV_V096.md for the latest milestone.
This public-only release fixes header nav overflow at 320px with a wrapped second row and adds accessible small-screen navigation/offer-link hit areas. No private LAN or catalog changes. Chrome local preview test covers 320,360,390,768,1366 and 320px missing-card modal and focus. Source branch feature/public-mobile-nav-qc-20261107 based on main 752af9d1a7aa72dcfc2bbc71678afa7e9526cbdd. Source commit f12002652798c5216d3ea2e0a42f8a53de9533ad is deployed and verified live: Pages SUCCESS, custom-domain asset byte parity, real Chrome 320/360/390/768/1366 responsive and missing-card modal PASS. Future docs-only commits may advance main; see handoff and LAN receipt.

## Latest public site v0.9.5: searchable/sortable native set picker
Read docs/HANDOFF_20261107_PUBLIC_SET_FINDER_V095.md before editing.
Branch: feature/public-set-picker-search-sort-20261107; baseline main SHA 5efc70bb49c9e5e5d57989ecde8038c44f9dfc42. Set finder adds a text search, year/closest/completion/A?Z sorting and missing-card link to the existing 48-set selector. No public catalog or checklist changes and no private LAN edits. Source release 2946dec4a19628732bcd16b6e87c3a69dcf0cc68 is LIVE: Pages SUCCESS, 7/7 asset byte parity and real Chrome live search/sort PASS. Future docs-only commits may advance main; see dated handoff and LAN receipt.

## LATEST 2026-11-07 public v0.9.4 - set fractions in collection dropdown
Read docs/HANDOFF_20261107_PUBLIC_SET_FRACTIONS_V094.md first. Public set selector matches fully qualified sport/year/brand/set to the sourced numbered want-list and shows owned distinct issued spots / total as the leading label (e.g. 138/200 for Panini Absolute). Sourced completion also appears in selected-set summary, with missing-card deep link. Unsourced sets explicitly say 'total unknown.' Real Chrome tests include 27 sourced and 21 unsourced groups, failure fallback and async race. PUBLIC LIVE source release 4ed1606505934c4f5d2f0bc0dbcbe7ccb82815c4: GitHub Pages SUCCESS, 7/7 live source/data files exact Git byte parity and 10/10 live Chrome DOM checks. Public-only change; private LAN unchanged. See newest handoff and LAN receipt.

## 2026-11-07 public serial projection follow-up (v0.9.3 candidate)
Current: docs/HANDOFF_20261107_PUBLIC_SERIAL_SCHEMA_QC_V093.md. Copy-stamp projection must be owner-approved in the private LAN; malformed or partially invalid published serials now suppress all copy stamps pending review. Physical-copy editor tracked in private repo issue #15. Public main remains read-only and LAN review stays separate.

# Public Card Vault - START HERE
Updated November 7, 2026.

Live URL: https://cards.jaytreebooks.com/
Repo: jaytreeranch/JayTree-Card-Vault-Public; production branch main.

LIVE RELEASE v0.9.2 (source SHA ee66a5c86fe4f859c6b5f5523f803d289dc9e67f, GitHub Pages SUCCESS and live browser checked). Latest handoff: docs/HANDOFF_20261107_PUBLIC_MULTI_FEATURE_QC_V092.md.
Development branch: feature/public-wantlist-qc-20261107.

Read AGENTS.md and docs/CURRENT_STATUS.md before edits. Static gallery uses index.html, app.js, card-features.js, wantlist.js, styles.css, wantlist.css, catalog.json and set-checklists.json. Published snapshot: 1,006 cards (503 Verified, 503 Needs review), 27 sourced numbered checklists. The private LAN vault is authoritative and is being developed in a separate chat.

Tests: node --test tests/*.cjs. Optional Chrome interaction QC: python tests/public_browser_interaction_smoke.py on GE78 with Chrome and websocket-client.
