## 2026-11-07 public serial projection follow-up (v0.9.3 candidate)
Current: docs/HANDOFF_20261107_PUBLIC_SERIAL_SCHEMA_QC_V093.md. Copy-stamp projection must be owner-approved in the private LAN; malformed or partially invalid published serials now suppress all copy stamps pending review. Physical-copy editor tracked in private repo issue #15. Public main remains read-only and LAN review stays separate.

# Public Card Vault - current status
Updated: November 7, 2026.

Prior production baseline: https://cards.jaytreebooks.com/ trusted HTTPS 200 and public main SHA 63e7d1cd52e841d8083ea1e8e1eeb96ab131aeeb.
Snapshot: 1,006 cards; 503 Verified, 503 Needs review; 27 sourced numbered sets, 23 fully named lists and 6,513 missing spots. Public may lag private LAN reviews.

Candidate v0.9.2 on feature/public-wantlist-qc-20261107:
- Six combinable feature checkboxes: parallels, serial-numbered edition, autograph, patch, memorabilia, rookie; OR among selected features, AND with other gallery filters.
- Feature counts, disabled unavailable categories, clear button, and published feature chips on cards.
- Missing-set deep-link copy with fallback; checklist count/number validation; displayed snapshot date.
- Tests: 17 Node PASS, 7 headless Chrome DOM PASS, Chrome CDP interaction PASS.
- No private LAN, database, catalog/photo snapshot, DNS or host edits.

Check newest LAN receipt and remote main HEAD to determine whether this candidate has been deployed; original production SHA above is the rollback parent.

Next:
1. Push and remote-verify safe public code/tests/docs.
2. Publish only if origin/main unchanged; trusted HTTPS/site smoke and rollback.
3. Integrate only owner-approved feature metadata from the private publisher later. A printed edition /325 is not the exact per-copy serial stamp.

- Future approved per-copy serial stamps can display in card details; absent or invalid stamp data is not guessed, and the public gallery has no serial editor.
