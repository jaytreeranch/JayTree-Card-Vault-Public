# Public Card Vault v0.9.24 stage log — 2026-11-09

Stage SOURCE scope: only public HTML/CSS/JS, offline public position metadata and regression tests; no private SQL, serialized stamp, Android, eBay, catalog or image mutations. Origin main 3aeddd32fd6943b32e6beabe72ef95b58a8d0bf2.

Actions: identified old mailto correction action; activated FormSubmit domain and verified owner Gmail delivery with independent test; replaced with safe in-page AJAX correction; implemented team and source-only position filter and sort; corrected provisional autographs to zero; corroborated GitHub public issue #3 Justin Herbert Blue 25ATT-13 issuer /150 from two external published checklists without stamping owner record; updated 1649 approved-state old fixtures, source names matched 1032/1159 football cards.

QC: 101/101 Node source tests, public snapshot validator PASS (1649/621/1028/27/6491), JS/Python syntax, headless Chrome 390 and 1366 new features PASS. Original 1006-only old Chrome suite not fully rerun. No production release yet. Private baseline manifest SHA FA215E77FF75DA1DEFFA32A31E80886E849460CC5BBE5CD7C5FD98D7402B5285.

Blockers: manager Gate PROD signoff; Pages and actual live HTTPS validation after approved merge. FormSubmit may apply anti-spam rate limits; ownership physical serial stamp of Justin Herbert has no original photo on record.

Rollback: revert only source-only public UI feature commit; preserve approved 1649 catalog, set-checklists, photos and CNAME and never restore older 1006 baseline. Next: commit/push & remote SHA receipt; obtain manager Gate PROD and deploy with end-to-end live QA; hand off issue #3 original physical serial verification to LAN worker.

## Production verification, 2026-11-09
Owner-requested public UI PR #4 merged to main SHA 7ea199fd53bc2103dde8e0b27b27e3ed9cfce7e4. Pages run 42645169994 SUCCESS; exact nine static Git-vs-HTTPS byte digests match; live Chrome 390px and 1366px PASS; real marked QA correction form email appeared in JayTreeBooks inbox; private API endpoints /api/cards and /owner/private return 404. Source 1,649/621/1,028, 27 source-backed sets, 6,491 missing issued spots; catalog, checklist, JPG, CNAME unchanged. Protected current production baseline is stored on JayTree LAN, with exact rollback evidence in the private worker receipt. Rollback ordinary revert -m 1 of merge SHA, NEVER restore old 1,006-card catalog. Public issue #3 stays open for true stamped serial evidence.
