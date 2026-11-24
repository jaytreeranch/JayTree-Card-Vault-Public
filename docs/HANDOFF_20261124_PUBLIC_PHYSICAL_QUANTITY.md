# Public physical quantity correction — 2026-11-24

Branch: feature/public-physical-quantity-20261124
Base / currently audited live main: c828194f7cb0c003cdd73e7b28f7790eab255bce

The deployed catalog contains 1,649 published records, 1,650 physical cards, 1,396 Verified records, and 253 Needs Review records. One record has quantity two. The deployed gallery used record count as physical count.

## Changes
- app.js and card-duplicates.js use safe positive integer quantity and sum physical quantities. Listings, records, and physical counts are distinct. Existing verified duplicate eligibility restrictions remain in place.
- Duplicate details count physical copies across records, with photo controls based on separately published records; no new photographs or physical copies are invented.
- index.html clarifies physical and record labels.
- Existing duplicate presentation source assertions updated; five new targeted contract tests added.
- Catalog, checklists, player positions, CNAME and image assets are unchanged.

## Quality checks
- Baseline: 86 of 113 tests pass, 27 fail.
- Candidate: 91 of 118 tests pass, the same 27 fail by test name. No new failures. This is not an all-green suite.
- New quantity contract tests: 5/5 pass; JavaScript syntax and diff checks pass.
- Actual Chrome candidate via local HTTP, 390x844 and 1366x900: both passed. Header 1,650, 48 of 1,364 listings, 1,650 matching physical copies, 1,649 records. Duplicate-only filter 509 physical copies; multi-quantity example shows 3 owned across 2 records and record-based photo controls. Initial browser observation during loading corrected by waiting for render completion.
- Audited deployed public assets: 11/11 exact Git blob matches to base. Candidate not deployed. No form submissions or analytics-delivery certification.

## Release status
Source candidate only. No production mutation. Reconcile inherited test failures and obtain the required release review before merging or deploying. Verify actual GitHub Pages deployment and repeat browser smoke against the live domain. Rollback candidate to base c828194f7cb0c003cdd73e7b28f7790eab255bce; no live rollback currently required.