## PUBLIC v0.9.23 — 1,649 approved cards LIVE (2026-11-08)
- Read docs/HANDOFF_20261108_PUBLIC_OWNER_APPROVED_1649_RELEASE.md first. Owner approved 643 additional Needs Review front-photo derivatives. Published public main SHA 3aeddd32fd6943b32e6beabe72ef95b58a8d0bf2, GitHub Pages run #49 SUCCESS, live HTTPS verified 1,649 (621 Verified, 1,028 Needs Review), 27 sourced sets. Exact 643 new assets + 2 JSON, zero deletion; 8 public source/data and 4 new image parity checks pass; private API routes 404. Node baseline 93/94 due pre-existing static source-text assertion; public data CLI PASS. Static rollback previous public SHA b1ee80dbb1b7d316914f8806358c9e63e3c446c7. Docs branch is not a new production release.

---
## PUBLIC v0.9.22 snapshot integrity and freshness ? 2026-11-08
Read docs/HANDOFF_20261108_PUBLIC_SNAPSHOT_INTEGRITY_V0922.md and docs/PUBLIC_SNAPSHOT_PUBLISHER_ACCEPTANCE_V1.md. Published current review/status counts and UTC snapshot timestamp are dynamically computed from catalog.json, never hardcoded to private LAN counts. Independently loaded approved checklist JSON metadata is compared, with mismatch/unavailable warning, never claimed live sync. Before any public publisher promotion, run read-only node validate_public_snapshot.cjs; a passing static check is NOT approval to publish or write LAN. Preserve actual catalog, checklists, photos, CNAME, private inventory/editor/exports and Android app. Require full QC, GitHub SHA/Pages/live HTTPS, protected LAN source backup and immutable PUBLIC receipts.

## PUBLIC v0.9.21 recover missing public card photos without LAN thumbnails (2026-11-07)
Read docs/HANDOFF_20261107_PUBLIC_PHOTO_RECOVERY_V0921.md. PUBLIC HTML/CSS/JS only: install lazy photo loading/failure listener before setting img.src; show readable fallback on a failed public gallery image; card detail preserves all metadata and offers at most TWO explicit user-controlled re-requests of the same approved front JPG. No background auto-retry, no original image/path/schema/publisher/private LAN/Android change. Approved thumbnails request 20261107_1934_PUBLIC_TO_LAN_APPROVED_CARD_THUMBNAILS_V1_REQUEST.md remains PENDING/NOT APPROVED. Full QC, LAN SHA-256 preservation, GitHub remote/Pages/live and immutable public manager receipts required.

## PUBLIC v0.9.20 optional native Share of public gallery views (2026-11-07)
Read docs/HANDOFF_20261107_PUBLIC_GALLERY_NATIVE_SHARE_V0920.md. PUBLIC-only Web Share through visitor click, exact validated v0.9.19 gallery link, public result count and provisional-name warning. Show only if navigator.share exists; Copy and readonly manual fallback remain. No implicit sending or claimed delivery, private fields, source data edits, API, LAN or Android changes. Guard cancellation/error/stale asynchronous callbacks. Full QC, protected LAN SHA-256, GitHub remote, Pages/live and immutable PUBLIC coordination receipts mandatory.

## Public v0.9.19 shareable gallery browse views (2026-11-07)
Read docs/HANDOFF_20261107_PUBLIC_GALLERY_VIEW_LINKS_V0919.md. Public website owns Copy link to this view for gallery filters/sort and strict #browse= restore after catalog readiness. Validate public values: known sport/year/review/selected set, published feature options, query length and no control characters. Reject stale/tampered/oversize URLs. Never serialize private copy identifiers, inventory API data, personal identities, full images or visitor Low-data preference. Clipboard manual fallback, async copy guard, and status should survive background checklist refresh. Run complete QC, LAN SHA-256 backup, remote GitHub/Pages/live and PUBLIC manager receipts. No LAN or Android changes.

## Public v0.9.18 optional native Web Share menu (2026-11-07)
Read docs/HANDOFF_20261107_PUBLIC_NATIVE_SHARE_V0918.md. Native Share N matching cards appears ONLY on browsers exposing navigator.share, uses existing public vetted shareMessage (bounded 12-number preview, source and provisional caution), and only invokes device share chooser on an explicit visitor click. Never auto-send or claim delivery from API resolution. Copy/manual fallback always remains. Cancellation, OS error and stale asynchronous results are guarded; no LAN/Android, catalog/checklists/photos/DNS or private copy fields changed. Full regressions, LAN SHA256 and GitHub remote/Pages/live verification mandatory.

## Public v0.9.17 filtered missing-list sharing (2026-11-07)
Read docs/HANDOFF_20261107_PUBLIC_FILTERED_SHARE_V0917.md. Add public set-specific #want-filter= links restoring a validated current missing-number/player/team filter, shareable 12-spot preview message and clipboard/manual fallback. Never expose private per-copy data or invent identities; no network submission. Protect race of asynchronous clipboard result after user changes filter/modal. Full regression, exact Git remote SHA/Pages, LAN rollback and immutable PUBLIC workstream receipt mandatory. LAN/Android and approved static data remain separate.

## Public v0.9.16 print missing-number checklist (2026-11-07)
Latest handoff docs/HANDOFF_20261107_PUBLIC_MISSING_PRINT_V0916.md. Print-friendly existing sourced-set missing-card modal, ALL currently matching published numbers including beyond first 40 shown, source and provisional reference-name warning. Native browser print only on user gesture; print-only DOM removed after print/modal close. Do not mutate LAN/Android, published catalog/checklists, original images, private copy/serial data, CNAME or manager aggregate. Verify GitHub SHA, Pages, live Chrome print-media, private 404 and protected LAN rollback.

## Public v0.9.15 missing numbered-card CSV (2026-11-07)
Newest handoff docs/HANDOFF_20261107_PUBLIC_MISSING_CSV_V0915.md. Visitor-initiated source-backed CSV download in missing set dialog, ALL matching printed numbered spots even beyond 40 shown; CSV spreadsheet-formula safety, no private copies/serials/guessed names or downloads on page load. Public HTML/JS/CSS only. No LAN, Android, manager aggregate, published source JSON or image changes. GitHub Pages and LAN SHA256 continuity gates mandatory.

## Public v0.9.14 mobile browse reset ? 2026-11-07
Newest handoff docs/HANDOFF_20261107_PUBLIC_MOBILE_BROWSE_RESET_V0914.md. Public collection browse-state summary and one-touch clear: resets search, sport/year/set/review/offers/feature filters, chosen sorts and set-finder query, but preserves current Low-data image preference and all owner-approved source. Never infer missing cards or change LAN/Android. Maintain no data fetch or visitor tracking. Require full Chrome/regression, SHA-256 LAN rollback, GitHub remote main/feature and Pages/live acceptance.

## Public v0.9.13 Low-data card gallery ? 2026-11-07
Latest handoff docs/HANDOFF_20261107_PUBLIC_LOW_DATA_V0913.md. Optional Low-data view suppresses all grid JPEG src assignments while preserving player/set/review/price/search filters. Opening an individual card must still display full photo. Auto-enable ONLY when browser navigator.connection.saveData===true, never assume all phones want photos hidden. No tracking/storage or new API, private LAN database/exporter or Android native changes. Preserve all approved JSON/photos and run browser/network QC plus GitHub remote/Pages handoff.

## Public v0.9.12 accessible inquiry actions (2026-11-07)
Read docs/HANDOFF_20261107_PUBLIC_INQUIRY_ACCESSIBILITY_V0912.md. Extend existing source-backed public inquiry builder with keyboard-reachable disabled email/GitHub actions, dynamic action guidance, aria-invalid photo states and reset. Preserve all approved catalog/checklists/photos, private LAN and Android boundaries. Chrome Accessibility.getFullAXTree verifies accessible link names/descriptions; NOT a substitute for actual screen-reader or real Android acceptance. GitHub SHA+Pages/rollback required.

## Public v0.9.11 visitor missing-card inquiry builder (2026-11-07)
Newest handoff: docs/HANDOFF_20261107_PUBLIC_CARD_INQUIRY_V0911.md. Public-only read-only form for condition, variation, asking price, public HTTPS photo link and notes; prepares email or public GitHub issue, never sends automatically. GitHub requires explicit public-warning consent. No private photos, LAN/Android code, card data or owner API changes. Coverage event listener now precedes data-loader scripts, eliminating an observed race. Test and protect GitHub/LAN checkpoints.

## Public v0.9.10 source-backed set completion priorities (2026-11-07)
Newest handoff: docs/HANDOFF_20261107_PUBLIC_SET_PRIORITIES_V0910.md. Sourced, issued-numbered sets only: show the three fewest remaining sets and existing 27 sets filterable by 1-2, 3-10 and 11+ remaining; highest completion sorting. Never invent remaining counts for the 21 unsourced catalog groups, count duplicates or parallel variants as new numbered spots. Private LAN, Android and publisher unaffected. Run QC, verify remote SHA/Pages, preserve protected LAN receipt.

## Public v0.9.9 individual missing-card links ? 2026-11-07
Newest handoff: docs/HANDOFF_20261107_PUBLIC_MISSING_CARD_LINKS_V099.md. Public site only: immutable 5-string URL fragment (exact 4-part sourced set key + printed checklist number), copy link from global search and set modal, preserve existing #want-set links, fail closed for stale/malformed cards. No private copy_id/serial stamp, new checklist source, LAN or Android modifications. Run source+Chrome/Pages QC and leave protected LAN/Git rollback.

## LATEST PUBLIC v0.9.8 ? cross-set missing-card search (2026-11-07)
Read docs/HANDOFF_20261107_PUBLIC_GLOBAL_MISSING_SEARCH_V098.md. Public want list searches vetted missing numbered cards across sourced sets, 40 at a time with exact #number, existing offers and modal. No new published cards/checklists, private owner writes, API, Android native code or private exporter. Verify remote main and release handoff.

## LATEST public v0.9.7 ? checklist coverage 2026-11-07
Read docs/HANDOFF_20261107_PUBLIC_CHECKLIST_COVERAGE_V097.md. The public want list has a separate read-only source-needed area (21 unsourced groups); approved sourced totals remain unchanged (27). Reuse already loaded catalog/checklist events, never infer a denominator or modify LAN. Visitor issue/email suggestions are owner-reviewed; see LAN coordination Requests for research handoff. No new agent or private data writing.

## Public v0.9.6 responsive header / accessibility (2026-11-07)
See docs/HANDOFF_20261107_PUBLIC_MOBILE_NAV_V096.md. Preserve 320px mobile layout without horizontal scroll, keyboard-focus access and 34px missing-card offer links. Public-only CSS and browser tests; LAN inventory, private exporter, photos, catalog and checklist data are untouched. Keep all safe work and rollback/handoff checkpoints in GitHub and protected LAN receipts.

## Public v0.9.5 ? native set finder (2026-11-07)
Latest handoff: docs/HANDOFF_20261107_PUBLIC_SET_FINDER_V095.md.
When changing the public set dropdown preserve exact sourced checklist/unique-count semantics. Keep native select keyboard accessible, maintain selection while search narrows options, and retain an unknown-total fallback. Public static source only; never edit LAN inventory, images or private publisher in this repo. Follow the standing GitHub and handoff continuity policy.

## LATEST public dropdown fractions v0.9.4 - 2026-11-07
Read docs/HANDOFF_20261107_PUBLIC_SET_FRACTIONS_V094.md before editing. Sourced numbered checklists show UNIQUE OWNED issued-number spots out of checklist total in the public set dropdown; unknown totals are explicitly unknown. Do not count duplicate card rows or parallels as additional set completion. The public site remains read-only; private LAN inventory/review/publisher are managed in separate work. Keep safe source/tests/docs on remote-verified GitHub and private release/rollback receipts on JayTree LAN.

# Public Card Vault working rules
The PUBLIC static gallery in this repo is read-only. The private JayTree Card Vault and its approved one-way exporter are the sole authority for card identity, inventory, original scans, valuations, and per-copy serial numbers. Never copy private SQLite, original photos, secrets or owner notes into this public repo.
Before edits read README.md, docs/START_HERE.md, docs/CURRENT_STATUS.md and the latest dated handoff. Use an isolated feature branch, verify remote HEAD and working tree, test, commit and push safe changes, verify SHA and preserve rollback. Never force-push or change DNS or hosting without owner authorization. Public feature classifications must use evidenced, approved facts; public visitor feedback can never write to private inventory. Do not use paid CI or introduce unneeded dependencies.

Newest handoff: docs/HANDOFF_20261107_PUBLIC_SERIAL_SCHEMA_QC_V093.md; public per-copy serial projection must be explicitly owner approved and must not expose private copy IDs.
