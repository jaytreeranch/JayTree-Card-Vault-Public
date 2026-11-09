# Public v0.9.27 — Source-only duplicate review triage

2026-11-09, JT-GE78. Owner requests comprehensive duplicate review, including A.J. Brown example, not just superficial visual grouping. Branch: feature/public-duplicate-review-triage-20261109, public GitHub jaytreeranch/JayTree-Card-Vault-Public. Source parent: da05c9420bf512b551e29686025935eab0aea4f6. No card status, catalog, pricing, image, private SQLite, API, Android or live website changes made.

## Baseline

Current public catalog approved 1,649 physical cards, 621 Verified, 1,028 Needs Review, 27 sourced set checklists, 6,491 missing issued spots. Public gallery currently groups 30 strict verified identity groups/61 physical copies. Existing 182 unresolved repeated-identity groups stay separate pending approvals.

Three public A.J. Brown 2026 Topps #169 physical records: d6f1c51bd64ef5a47e0bf33d unmarked, 915944dac78b4ee4bd856566 unmarked, and a2bbbafd83a4c7b24bd93666 labeled Canvas. Second photo has strong purple cast but the owner suspects lighting/color balance; DO NOT infer purple parallel from color alone. Canvas label is unproven by the displayed front. Inspect authentic images and backs or source checklist and condition/provenance before changing private records or combining anything.

## Tools and evidence

Source scripts: tools/public_review_triage.py (read-only exact-key candidate queue, photo SHA), tools/public_review_contact_sheets.py (local-only photos), tools/public_review_similarity.py (grayscale normalized correlation used only for candidate ranking), tools/public_review_full_queue.py (all 1,028 unresolved records ranked without status edits). Tests: tests/test_public_review_triage.py (7 safety cases) and tests/test_public_review_full_queue.py (5 complete-coverage safety cases). None performs approval or database writing.

From published catalog: 182 unresolved repeated-key candidate groups; 412 physical card records in those groups; 409 still Needs Review. Priority subgroups: 49 PARALLEL_CHECK, 3 with Verified anchor, 106 otherwise unverified, 24 high-risk. There are 289 within-group photo pairs; 171 have grayscale correlation >=0.83, but this is only image resemblance, NOT duplicate or parallel proof. Some images may be the same photo used for different copies; verify distinct physical provenance and serial/special finishes.

Complete coverage of all 1,028 Needs Review records: 409 duplicated-key rows first, 352 remaining standard-looking rows, 267 other special/risk rows. All 1,028 approved public fronts are present; all published JPG digests are recorded. No private status was changed. Actual review target is 0 pending cards, but each approved copy needs evidence and no inferred serial, foil or special edition.
- \\JT-DESKTOP\JayTreeFarm\CardVault\Coordination\Requests\20261109_PUBLIC_ALL_1028_NEEDS_REVIEW_PRIORITY.csv
- \\JT-DESKTOP\JayTreeFarm\CardVault\Coordination\Requests\20261109_PUBLIC_ALL_1028_NEEDS_REVIEW_PRIORITY_SUMMARY.json
Private LAN advisory files (not uploaded to GitHub):
- \\JT-DESKTOP\JayTreeFarm\CardVault\Coordination\Requests\20261109_PUBLIC_DUPLICATE_REVIEW_TRIAGE_1649.csv
- \\JT-DESKTOP\JayTreeFarm\CardVault\Coordination\Requests\20261109_PUBLIC_DUPLICATE_REVIEW_TRIAGE_1649.md
- \\JT-DESKTOP\JayTreeFarm\CardVault\Coordination\Requests\20261109_PUBLIC_DUPLICATE_FRONT_SIMILARITY.csv
- \\JT-DESKTOP\JayTreeFarm\CardVault\Review\PublicDuplicateTriage_20261109\review_contacts_page_01.jpg through page_06.jpg
- \\JT-DESKTOP\JayTreeFarm\CardVault\Review\PublicDuplicateTriage_20261109\AJ_Brown_2026_Topps_169_three_fronts.jpg

## QC, release and rollback

Public main da05c9420bf512b551e29686025935eab0aea4f6; GitHub Pages workflow 42663148025 SUCCESS. Nine public live HTTPS assets match exact origin/main Git blob bytes. Snapshot validator PASS 1649/621/1028, 27 sourced sets, 6491 missing. Node 113/113 PASS, new Python 12/12 PASS. Git worktree Windows CRLF bytes differ but Git blobs match live assets. Owner photo evidence treated as photos of owned cards, but different capture lighting is not itself a variant. Private review, reclassification, pricing and public snapshot approval are separate workstreams.

Rollback: discard source-only branch or revert its commit. Do NOT revert production main or restore old 1,006-card data. Local source tools safely regenerate private LAN advisory files. No production release in this branch.

## Next three actions

1. LAN reviewer consumes advisory queue and original card photos, validates physical copy identity, finish/back/stamp and authentic checklist on easy duplicates first. Batch approve ONLY when evidence adequate and all record invariants hold; keep high-risk/uncertain cards unresolved. Record review outcome and backups.
2. LAN exporter publishes an explicit owner-approved one-way snapshot after safeguarded private updates; do not edit approved public catalog directly from this branch.
3. Public worker independently checks newly approved gallery duplicate grouping, quantity and each photo carousel, and confirms blue/foil/Canvas/serial parallels remain separate and unique numbered-set counts correct.
