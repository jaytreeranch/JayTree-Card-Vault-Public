# JayTree Card Vault public serial schema QC follow-up v0.9.3
Date: 2026-11-07 America/Chicago
Public repo: jaytreeranch/JayTree-Card-Vault-Public.
Working branch: feature/public-serial-schema-qc-20261107.
Worktree: D:\Projects\JayTreeCardVaultPublic_SerialSchema_20261107.
Baseline public main: ee66a5c86fe4f859c6b5f5523f803d289dc9e67f.

## Live state independently checked
GE78 and GE75 authorized Local Control hostname_test PASS. Desktop MCP session returned HTTP 429; not evidence of offline PC. Public HTTPS homepage, card-features.js, catalog.json and set-checklists.json each HTTP 200 on November 7. Public gallery continues to show 1,006 cards (503 verified/503 provisional) and 27 sourced numbered checklists; private LAN remains source of truth. Parallel public-site session delivered the multi-feature, serial display and wantlist enhancements to main ee66a5c before this isolated follow-up was authored.

## Work in this isolated continuation
- Retains public read-only display and feature checkbox behavior from the already-live release.
- Tightens published copy-stamp validation: if any optional public stamp is invalid or a legacy stamp string is malformed, hide ALL copy stamps for that card and mark serial as needing verification. No partial untrusted value reaches the public card tile.
- Includes a real Chrome interaction test for /325 vs 'Owned stamped copy: Not published', and a synthetic multiple-copy, malformed/duplicate and privacy-focused regression suite.
- Sanitizes synthetic fixtures to avoid committing observed physical serials or private record IDs to the public repository.
- Adds owner-only LAN editor and approved one-way public projection schema contract. LAN feature tracked in private GitHub issue #15 and NOT implemented/deployed by this worktree.
- No catalog data, private photos, SQLite, CNAME, domain, secrets, pricing or LAN runtime changed. No paid GitHub CI.

## Verification and limitations
Run Node tests, JS syntax, real Chrome, privacy scan, Git status, and branch remote SHA verification before claiming delivery. Physical Android 17 public/cellular acceptance and explicit old Cloudflare retirement remain unverified. Publisher source templates in PRIVATE repo still need separate alignment to preserve the new optional approved projection on future static refreshes.

## Rollback and next actions
Rollback to prior main ee66a5c through a new revert commit, never force push. Next: (1) finish QC; (2) push isolated branch with verified remote SHA, merge into public main only after checking concurrency and release safety; (3) coordinate private LAN per-copy editor and one-way publisher, then value-source and Android acceptance.

## Completed local QC and concurrent-session reconciliation
- 17/17 Node native tests PASS, three JavaScript syntax checks PASS, git diff whitespace check PASS.
- Real Chrome CDP interaction PASS: collection, filters, disabled zero-count categories, set dialog, serial edition /325 and unapproved stamped copy Not published.
- Public privacy fixture scan PASS: no actual observed stamped number or private copy record IDs in public source/docs. Published data untouched at 1,006 (503 Verified/503 Needs review).
- Public HTTPS homepage, feature script, catalog and set-checklists HTTP 200. Physical Android cellular not tested.
- After this branch was pushed, public main advanced with a docs-only acceptance commit 5b1fb81f899a65c10c20e030152ca8d39ddebe62. Merged main without conflicts to preserve that live receipt; no prior production files overwritten.
