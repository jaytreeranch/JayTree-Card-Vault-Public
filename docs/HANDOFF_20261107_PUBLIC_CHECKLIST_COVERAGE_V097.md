# JayTree Card Vault Public v0.9.7 ? checklist coverage and visitor source proposals
Date: November 7, 2026 America/Chicago.
Repo: jaytreeranch/JayTree-Card-Vault-Public.
Isolated branch: feature/public-unsourced-checklist-coverage-20261107.
Baseline production public main: 4c931e656bbb1b39b1ba4865b6ec9418a40e7a53.
Website: https://cards.jaytreebooks.com/#wantlist.

## Behavior and boundary
Sourced numbered want-list already represents 27 independently checked sets and 6,513 missing numbered spots. The approved 1,006-card catalog contains 48 exact sport/year/brand/set groups, so 21 groups have no published complete checklist. Previous public page omitted those groups from the want-list entirely. This public-only release provides a collapsed, searchable "Sets awaiting verified checklists" browser beneath the sourced want lists. It shows the number of distinct recorded printed numbers, inventory entry count and tentative-review count, with "total unknown" explicitly and NO computed missing numbers or percentage. No source/quantity/parallel identity is invented.

Public feedback: user can open a prefilled email draft or a GitHub issue template with a published checklist URL, set name, number-range and possible variation/size issues. GitHub issues and usernames are PUBLIC; only owner LAN can approve data. No auto-approval, cards for sale, buyer transactions, or inventory writer. The new checklist-coverage.js reuses the existing public catalog group event and the vetted checklist ready event, without any new data fetch or API; equality is exact four-part set key. All user text is rendered with textContent. A separate mailto link is created without server requests.

Changes: app.js public-only event emission, index.html coverage section and script, checklist-coverage.js new static widget, wantlist.css styles, new checklist-source.yml issue template, four Node tests, Chrome CDP test and safe documentation. Published catalog.json, set-checklists.json, all photos, CNAME, official public estimates, Android APKs, private API, LAN database, serial editor and owner approval completely unchanged.

## Cross-project research handoff
Private LAN Coordination/Requests/20261107_PUBLIC_to_LAN_checklist_sources_batch1.md is a new immutable research suggestion containing seven candidate source leads. Three 2024 Panini Contenders inserts show 25 issued numbers in TCDB and third-party lists, but all related published cards are Needs Review. 2025 Topps Chrome Update requires special handling for known misnumbered USC cards. 1988 Super Diamond Kings might be 5x7 and must not be conflated with standard Diamond Kings. 1990 Donruss Bonus MVP source totals differ depending on checklist-card scope. Only LAN may validate originals/reference, update authoritative checklist data and approve a public refresh; this public workstream does not import or publish unverified totals.

## QC and deployment gates
- Initial 26/26 Node static/contract tests PASS; browser local preview widths 320/390/1366 passed 21 unknown, 27 sourced, 49 set option count, search filtering, email and issue links, viewport/no overflow.
- Re-run 26 Node, previous Chrome filter/set/serial/responsive suites, JS syntax and git staged whitespace before commit.
- Preserve previous public source/approved data hashes and protected rollback on LAN. Push only isolated public code/tests/docs to feature branch; check exact remote SHA, fast-forward public main only if unchanged. GitHub Pages success, live HTTPS byte parity, real browser interactions, private-route HTTP 404 before claiming production acceptance.
- Actual Android 17 phone, cellular and formal screen reader audit remain unperformed. Do not claim those pass.
- Rollback: use new ordinary Git revert commit after verifying concurrent public state; NEVER reset or force-push.

## Next three actions
1. Finish full test suite, safe LAN backup, remote SHA and public live acceptance; update receipt.
2. LAN checks independent sources, set-size/number anomalies, card backs and original photos before future approved static checklist export. Public should not edit their work.
3. Physical Android/cellular public website usability and keyboard/screen-reader review; preserve known/unknown distinction.
