# JayTree Card Vault Public v0.9.10 ? sourced set-completion priorities
Date: 2026-11-07 America/Chicago
Repo: jaytreeranch/JayTree-Card-Vault-Public
Feature branch: feature/public-set-priorities-v0910-20261107
Parent public main: 0ae81ba5b3869a7c61c748862d47591bc6c948fe
Public URL: https://cards.jaytreebooks.com/#wantlist
Operator host: JT-GE78 authorized existing Local Control; hostname_test PASS. JT-GE75 hostname_test PASS. Private coordination and latest public workstream handoff reviewed.

## Goal and scope
Owner requested continuing PUBLIC development after v0.9.9. Next public priority is surfacing sets with only one or two cards remaining rather than requiring visitors to scan all sets.

New static, source-backed top-three "Closest to completing" dashboard appears above the existing sourced checklists: sort sourced sets by fewest missing printed slots (then largest completion percent), show each source's set name/sport/year, owned/total, remaining numbered cards, rounded public completion percentage, 0-100 accessible progressbar and View N missing cards button invoking the existing scoped dialog. For approved snapshot, 1985 Topps Circle K Base is 31/33 (2 missing, 94%), 2025 Donruss Optic Chain Reaction has 8 missing and My House! has 9. A status label shows how many sourced sets have 1?2 numbered spots left.

A new remaining-count filter on the existing wantlist toolbar selects all, 1?2, 3?10, or 11+ missing; "Highest completion first" adds percentage sorting. Existing sport/year/text filters and actual per-number inquiries, global search and card-specific links remain intact. The new filter applies ONLY to sourced checklists, never the separate 21 groups with no vetted denominator. The current published 27 sourced set snapshot divides into 1 near, 2 with 3?10 and 24 with 11+ missing. Do not invent card names, physical-copy quantities, parallel spots or a completion percent for unsourced groups; under-review identity caveats remain visible. The published static site is not a realtime LAN inventory reader.

## Code and privacy ownership
Changes to public index.html, wantlist.js and wantlist.css plus safe source regression/browser tests and docs. No change to public catalog.json, set-checklists.json, photos, estimates, serial copy fields, CNAME, DNS, private LAN API/database/review, private exporter or Android app. No new fetch, API client, service, paid CI, GitHub issues, visitor inventory writes or third-party script. The separate public-vs-private-vs-Android manager charter remains authoritative.

## QC and deployment gates
- Node source tests 38/38 PASS including 4 new source-backed count/partition/privacy tests.
- Actual local Chrome CDP 320,390,1366 PASS: exactly three priority tiles, Circle K 31 of 33, 2 missing, 94%, correct next two, accessible progressbar, modal shows two missing, count filters 1/2/24/27, high-percent sort, combined sport filter, old global search and no overflow.
- Run all prior browser suites and syntax/staged whitespace tests before release. Protect baseline and candidate source with SHA256 and rollback instructions on JayTree LAN storage first.
- Push only isolated PUBLIC branch; verify actual GitHub remote SHA; fast-forward PUBLIC main ONLY if unchanged; NEVER force push. Require GitHub Pages workflow SUCCESS, HTTPS exact live byte parity, real Chrome live 320/390/1366 dashboard and private edit-route 404 before claiming deployment complete.
- Actual physical Android/cellular and formal assistive screen-reader audit remain not performed; Chrome responsive emulation is not proof of them.
- Rollback: new ordinary Git revert after checking concurrent main, never force-push. Protect before/after source and SHA receipts in \JT-DESKTOP\JayTreeFarm\CardVault\PublicShowcase\receipts, and write new immutable Coordination/Workstreams/PUBLIC receipt after verified release.

## Exact next three
1. Full regression, protected backup, guarded public v0.9.10 release; GitHub and live acceptance, docs+manager receipts.
2. LAN approves new sourced numbered checklists through its own verified one-way exporter; public UI must continue safely if counts change and keep unsourced totals unknown.
3. Physical Android/cellular public browsing and screen-reader acceptance; address actual usability issues without editing Android scanning or LAN ownership.
