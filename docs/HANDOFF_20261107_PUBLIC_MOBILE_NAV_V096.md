# JayTree Card Vault Public v0.9.6 ? Narrow-screen navigation and touch QC
Date: November 7, 2026 (America/Chicago).
Repository: jaytreeranch/JayTree-Card-Vault-Public.
Branch: feature/public-mobile-nav-qc-20261107.
Baseline public main: 752af9d1a7aa72dcfc2bbc71678afa7e9526cbdd.
Public site: https://cards.jaytreebooks.com/

## Reason and scope
After v0.9.5 searchable public sets, run responsive/accessibility checks without interfering with concurrent private LAN development. Live Chromium mobile emulation found on a 320px phone the NAV extending to x=337, forcing CSS layout width/scroll width 337 despite a 320px visible viewport. This can hide About and cause awkward side-scrolling. No such overflow was found at 360/390/768/1366px.

## Fix
Add public CSS-only narrow-viewport (<=350px) two-row center-aligned brand and header nav, preserving all three links without clipping. At <=490px increase nav link vertical hit area to >=32px and missing-card offer/email links to >=34px; allow offer actions to wrap. No visual colors, fonts, card identity, data, value estimates, search indexing or publication authorization modified.

## QC and security
- Local Chrome preview emulation: 320, 360, 390, 768 and 1366px CSS viewport/scroll width equal device width (no horizontal expansion), nav links inside viewport, native set chooser still has 48 groups (49 options), 27 missing-card sourced set tiles.
- 320px missing-card modal fits, Close receives focus, offer/email link hit areas >=34px. All PASSED.
- Run legacy 22 Node tests, public set-finder and set-completion Chrome scenarios, git syntax and whitespace QC before commit.
- Published JSON catalog, checklist source, card photos, CNAME, DNS, Cloudflare and private LAN unchanged. Public site remains read-only.
- Real Android 17 phone on cellular, screen-reader audits and formal WCAG full conformance testing NOT performed; do not claim those passed.

## Rollback and next actions
Preserve prior public main 752af9d1a7aa72dcfc2bbc71678afa7e9526cbdd in protected LAN receipt baseline_source with SHA-256 checksums. Commit and push only safe source/tests/docs, verify remote SHA. Conditional non-force fast-forward to main only if unchanged. Verify Pages success plus custom HTTPS asset byte parity and live Chrome 320/390 UI acceptance. A rollback uses a NEW regular Git revert commit after concurrent-work review, never force-push.
Next priorities after release: real Android/cellular review; checklist coverage expansion only with independently sourced manufacturer numbers; evaluate accessibility with screen-reader/keyboard. Keep noindex/nofollow policy unchanged absent owner decision.
