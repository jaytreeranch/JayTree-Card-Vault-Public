# JayTree Card Vault Public v0.9.5 ? Search and sort collection set choices
Date: November 7, 2026, America/Chicago.
Repository: jaytreeranch/JayTree-Card-Vault-Public.
Isolated branch: feature/public-set-picker-search-sort-20261107.
Baseline main SHA: 5efc70bb49c9e5e5d57989ecde8038c44f9dfc42.
Target URL: https://cards.jaytreebooks.com/#collection.

## Request / implementation
Owner asked if further public-site improvements were needed after completing set fractions. The existing missing-card want list already provides search/sort, but the collection's native select has 48 long set titles and is difficult to scan.
- Keep native keyboard-accessible select and the 138/200-style unique issued numbered checklist fractions; add separate set name search (sport/year/brand/title) and sort by newest, fewest missing, completion %, or A-Z.
- Searching/sorting narrows dropdown choices only; it MUST NOT silently reset current selected set or change the card filter. An already selected set is retained when query changes. A status line reports number of matching set names.
- Unknown-total sets remain explicit and follow sourced sets for missing/completion rankings. One link opens the pre-existing missing-card want-list.
- All 48 cataloged groups, 27 sourced and 21 unknown sets remain represented with a blank search. Existing six public feature filters, value history, review caveats, privacy boundaries, and public number fractions are unchanged.
- No private LAN app edit, private publisher, catalog.json, set-checklists.json, photo, DNS, Cloudflare, GitHub Actions workflow, or external dependency change.

## QC gates
- Existing 22 Node tests pass.
- Previous real Chrome set-completion smoke normal / missing-checklist / slow-catalog race all pass.
- New real Chrome interactions pass: search 'Circle K' -> 1 matching source, select -> 31/33 and 32 card entries; re-query retains selection; sort by fewest missing and highest completion; alphabetical; link and feature controls unaffected.
- JS syntax, Git diff whitespace and final production HTTPS bytes must all pass before declaring deployment complete.
- Physical Android/mobile cellular acceptance is NOT performed and must not be marked passed.

## Continuity/rollback
Start public main SHA is 5efc70bb49c9e5e5d57989ecde8038c44f9dfc42. Before any publication, save protected source and SHA-256 catalog/CNAME to JayTree LAN. Commit/push safe code/tests/docs, verify remote full SHAs, use a normal fast-forward only if main unchanged. Roll back with a NEW Git revert commit after reconciling concurrent changes, never reset or force-push.

## Next three actions
1. Finish QC, backup/source manifest and remote verified feature commit.
2. Conditionally publish to main, verify Pages success, live HTML/JS/CSS exact Git blob byte parity and real Chrome interaction; record verification receipt.
3. Coordinate private publisher template retention with the separate LAN chat. Do not interfere with card reviews or scanner development.
