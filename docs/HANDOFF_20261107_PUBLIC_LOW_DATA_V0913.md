# JayTree Card Vault PUBLIC v0.9.13 ? low-data visitor gallery
Date: 2026-11-07 America/Chicago
Public repo: jaytreeranch/JayTree-Card-Vault-Public
Isolated branch: feature/public-low-data-view-v0913-20261107
Baseline public main: 851fbc1ffc851348335ecf9be9f02d4de9c64a0e
Published site: https://cards.jaytreebooks.com/#collection
Operator: authorized JT-GE78 Local Control; hostname_test PASS. JT-GE75 hostname_test PASS. Read Coordination/START_HERE and latest PUBLIC v0.9.12 progress; only PUBLIC owns this source.

## Why this change
After v0.9.12, the next agreed goal was mobile usability on slower cellular networks. Existing gallery already uses loading=lazy on each photo, so duplicate lazy-loading work is not needed. Public HEAD checks of seven original published front photos: 107,256?156,992 bytes each. Default gallery renders 48 entries, but browsers lazily fetch only near-viewport images. Static catalog.json is 454,524 bytes and set-checklists.json is 255,771 bytes. We did not claim an unmeasured page-speed improvement, nor change privacy/freshness of JSON. A thumbnail pipeline would require separate approved LAN publisher integration; no changes to image assets or source contract were introduced.

## New feature
An accessible Low-data view checkbox appears with collection filters. When checked, renderCards retains every card's metadata but replaces gallery image elements with an 'Open for photo' placeholder. It never assigns img.src inside the gallery, avoiding JPEG requests while scrolling the low-data view. The existing detail dialog instantiates the full photo only when a visitor opens a card. Search, sort, sport/year/set filters, feature badges, unique set counts and valuations are unchanged. Changing mode re-renders the already-visible number of cards (48/96/etc) without resetting search or filters. The status text announces that images were skipped or restored to assistive technologies.

Auto-selection occurs ONLY for explicit browser navigator.connection.saveData===true. Browsers without this API or with saveData=false keep normal lazy photo gallery. Visitors can toggle either way. No cookies, local/session storage, telemetry, browser fingerprinting, new fetches, paid CDN, server dependency or cache policy change. Settings reset upon page reload. No card data/photo is created, modified or omitted from details.

## Scope
Public files ONLY: index.html, app.js, styles.css, Node/browser tests, README, AGENTS, START_HERE, CURRENT_STATUS, dated handoff. No changes to original public assets, catalog.json, set-checklists.json, owner-approved card names/status/value, DNS/CNAME, LAN authoritative inventory/review/exporter, Android scanner app, private originals, secrets, or multi-workstream manager aggregate. Website remains static and view-only.

## Verified local QC
- 50/50 Node source/security tests PASS (four new data-saver tests).
- Real headless Chrome localhost at 320,390,1366px: emulate navigator.connection.saveData=true before JS loads, confirm 48 placeholders, zero gallery img and zero initial /assets/*.jpg resource entries, 27 sourced lists and 1,006 published count; open detail loads original photo; manually restoring normal loads 48 lazy gallery img; after Show More, 96 cards stay visible through toggle; filters still work and no horizontal overflow. Save-Data false gives 48 normal lazy images. PASS.
- All earlier Chrome mobile navigation/card feature/global search/sourced-set/card-share/inquiry/AX regressions must rerun before publishing. No physical Android/cellular benchmark, formal network throttling, or real screen-reader session claimed without further evidence.

## GitHub/Pages and protected rollback
Save originals/candidates SHA256 at \JT-DESKTOP\JayTreeFarm\CardVault\PublicShowcase\receipts\PUBLIC_V0913_LOW_DATA_GALLERY_20261107 before release, including protected JSON/CNAME hashes. Commit code/tests/docs on isolated feature branch and independently verify remote SHA; fast-forward main only if remote unchanged. Never force push. Verify Pages SUCCESS and actual HTTPS file parity and live Chrome low-data/normal behavior; private /api/cards and /owner/private must remain HTTP 404. Commit final acceptance docs and verify latest docs-only Pages deployment and private LAN immutable PUBLIC receipt. Rollback via new ordinary Git revert after concurrent-work review; never reset or overwrite source.

## Next exact steps
1. Finish full browser regression, LAN rollback, guarded GitHub/Pages v0.9.13 release, live HTTP/browser acceptance and workstream receipts.
2. Coordinate optional smaller approved thumbnails only through LAN owner and documented future exporter contract; no private API or unapproved public assets.
3. Actual Android phone/cellular and real NVDA/TalkBack/VoiceOver testing when authorized physical device available; Chrome screen emulation is not a hardware acceptance test.
