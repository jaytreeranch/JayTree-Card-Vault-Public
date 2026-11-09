# PUBLIC v0.9.23: approved 1,649-card gallery release
Date: 2026-11-08 America/Chicago. PUBLIC static site deployed and verified. This documentation feature branch is NOT an additional production release.

## Owner approval, privacy and inventory
Owner explicitly approved publishing the 643 new Ludex card entries with clearly labeled Needs Review status and approved front-card derivatives. Owner did NOT authorize raw/original private photos, private physical copy IDs, LAN inventory records, notes, exact stamps, credentials, new prices or sale offers.
The authoritative LAN import held 1,649 physical cards with 621 Verified and 1,028 Needs Review. The public one-way approved snapshot shows the same published card counts. Public static data is NOT an automatic live LAN mirror.

## Verified release and rollback
Public repo jaytreeranch/JayTree-Card-Vault-Public.
Previous public main source SHA b1ee80dbb1b7d316914f8806358c9e63e3c446c7.
Approved static DATA release commit 3aeddd32fd6943b32e6beabe72ef95b58a8d0bf2, local and independent origin main verified, clean.
GitHub Pages run 42560149929 for the EXACT SHA completed success. Live custom HTTPS cards.jaytreebooks.com verified after completion.
Git diff exactly 645 allowed paths: 643 NEW public-only JPEG derivatives and updates to catalog.json and set-checklists.json; no deletions, existing 1,006 published card assets and identifiers preserved, unchanged public frontend. Custom CNAME unchanged.
Published catalog count=1649, verified_count=621, needs_review_count=1028, generated_at_utc=2026-11-09T02:56:34+00:00. Set checklists same stamp, catalog_card_count=1649, 27 sourced sets with 6,491 missing issued-number spots; physical duplicate copies do NOT inflate issued-number ownership.

## QC evidence
The private owner-approved stage on JayTree LAN passed 643 new derivative SHA and EXIF-empty checks and 1,006 prior public image hashes, no newly authorized prices/sale/serials, private ID exclusions, safe allowlist and public count checks. All 1,649 public image paths are present in the Git release. Stage total 225,816,800 bytes below 250 MB publisher limit.
Publisher read-only plan passed: 1649 cards, 645 changed, 0 deleted, 1018 unchanged. Explicit authorize then publisher returned published, GitHub remote SHA above. Public consumer validate_public_snapshot.cjs candidate PASS: valid=true, errors=[], warnings=[], count=1649, statuses=621/1028, 27 sourced sets, 6491 missing.
Public Node baseline 93/94 PASS. One PRE-EXISTING brittle formatting assertion in tests/public_gallery_view_link_contract_test.cjs expects exact source text inside function filtered that is absent in the unchanged public main app.js. Does not involve new dataset; do not falsely report 94/94. Track separate test repair, not data rewrite.
Actual public HTTPS catalog.json and set-checklists.json HTTP200 and source SHA exact 3267720b7f10ce952c38e9669b466ed5117bcb44f8035d7cc233ec1a5a456dbd / cf9ff341323fb9ffe9a522479ea6c208aacc279c7a7c58ce3a7be7b50b11fed2. Eight live HTML/JS/CSS/JSON core sources match Git after Windows checkout CRLF-to-GitHub-Pages LF normalization. Four distributed new public images HTTP200 and SHA256 identical to public Git files. Private public /api/cards and /owner/private both HTTP404. Actual visual/physical Android17/assistive-tech browser not newly certified by this data-only release.

## Backup and rollback
Previous live public SHA b1ee80dbb1b7d316914f8806358c9e63e3c446c7 remains rollback source. Private staged candidate, coherent read-only owner snapshot, individual file hashes, approval manifest and producer QC are preserved on JayTree LAN. If rollback is needed, verify latest origin main and use ordinary git revert of release commit, then Pages/live acceptance. Never force push or replace private owner SQLite. No LAN API/GE75 writer/Android native or manager WORKSTREAM_STATUS.json edits in this release.

## Next
1. Validate actual mobile/desktop browser gallery with 1,649 cards and new provisional Needs Review photos, including search/filters/Low-data without overflow.
2. Fix pre-existing Node brittle source-text assertion in a separate PUBLIC workstream and rerun browser/security tests.
3. Plan the next owner-approved one-way snapshot and new-card update cadence; do not auto-publish new LAN/Android photos without review gates.