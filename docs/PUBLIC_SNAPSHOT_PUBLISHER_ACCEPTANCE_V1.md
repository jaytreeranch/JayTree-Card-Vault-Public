# PUBLIC static snapshot candidate gate v1 (read-only)
Date 2026-11-08 America/Chicago
Owner: PUBLIC front-end consumer; LAN controls private inventory and its approved one-way publisher.
Baseline published: catalog.json and set-checklists.json generated 2026-11-07T17:30:02+00:00, 1,006 cards, 503 Verified, 503 Needs review, 27 source-backed numbered sets, 6,513 issued-numbered missing slots.

## Read-only candidate check
From the public source repo:
node validate_public_snapshot.cjs
or, for a LAN-owner **already approved** temporary PUBLIC candidate (do not point it at private owner SQL/records):
node validate_public_snapshot.cjs --catalog <candidate-public-catalog.json> --checklists <candidate-public-checklists.json> --json

This CLI reads two explicit public JSON files and returns status code 0 only on internal consistency. It checks schema=the existing public read-only contract, RFC3339 publication dates representing same timestamp, exact actual-vs-declared card count, exact actual-vs-declared Verified and Needs review counts, unique lower-hex 24-char public IDs, approved front image path matching each id, supported sourced-set count and unique keys, owned+missing=total for each sourced numbered set, every missing-card numbered spot string unique within its exact set, and sum of missing spots. It compares checklist catalog_card_count to exact public catalog size. It returns SHA-256 hashes for reproducibility. It never contacts the LAN, writes data or uploads anything; it is NOT evidence of full photo HTTP availability or verified physical parallels/serials.

## Publisher and manager acceptance gates
1. LAN owner must prepare coherent source revision with approved audit/identification receipts. Do not bulk-verify physically uncertain cards from reference name/number, and never alter the owner sqlite based on static public file discrepancies.
2. LAN one-way exporter owner checks that PUBLIC-safe fields and approved front photos are the *only* fields included and private per-copy IDs/locations/originals/passwords/review evidence are excluded. Check 1,006 or new exact independently counted physical/source rows, SHA-256 manifest and owner-review revisions.
3. Candidate catalog and checklist generation timestamps and catalog_card_count must match, review status distribution must be recomputed from published entries. A future catalog is allowed to have a different total and different review counts when the authorized LAN owner approves it; do NOT hardcode 503/503 or 528/478.
4. The validator above must PASS, and the FRONT images (path, count, approval provenance, content) separately pass LAN/photo publisher QC. It verifies *references*, not HTTP accessibility or image content.
5. PUBLIC consumer Gate B: gallery/Low-data, issued unique-number set completion (duplicates do not inflate owned count), missing-card links, CSV/print, serial and prospective valuation disclaimers, responsive accessibility and private HTTP 404 regression. No changes to Android native application.
6. Protected LAN baseline/candidate and SHA-256 backup; approved exporter release batch with exact rollback, no simultaneous unapproved writer; PUBLIC repo GitHub source and Pages acceptance, live 10/10 source/data byte parity, image availability sample, real browser tests and independent docs acceptance.
7. Manager records explicit signoff/rollout status. A read-only Gate A tool or request does not constitute approval, push, deployment or an automatic cross-chat notification.

## Current independent evidence and blocker
PUBLIC catalog's own metadata reports 503 Verified / 503 Needs review. A later private LAN owner workstream receipt reports changed review totals, but that work was not a public publisher production release. Exact unpublished owner totals remain in private Coordination/Requests; any difference does not authorize changing the published JSON, and the owner may have intervening revisions. New public snapshots should be generated from a fresh coherent authorized owner read with revision safeguards, then reviewed/published by the LAN owner. Public UI must never display private Stage13 counts as if approved/public.

## Failure / rollback
If any contract, approval or browser QC fails, retain the last published static JSON and images. Do not force-push or reset public main; revert via new normal git commit after checking remote concurrency. Never use a previous private SQLite snapshot to overwrite the current authoritative owner database. Keep approved/backed-up LAN storage and cross-workstream receipts.
