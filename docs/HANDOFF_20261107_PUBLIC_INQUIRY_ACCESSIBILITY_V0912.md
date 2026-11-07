# JayTree Card Vault Public v0.9.12 ? inquiry accessibility and keyboard controls
Date: 2026-11-07 America/Chicago
Host: authorized JT-GE78 JayTree Local Control, hostname_test PASS. JT-GE75 hostname_test also PASS.
Repo: jaytreeranch/JayTree-Card-Vault-Public
Branch: feature/public-offer-accessibility-v0912-20261107
Baseline public main SHA: 67f94557a4f4c4e3aa07af184ca40c2739190686
Public URL: https://cards.jaytreebooks.com/#wantlist
Ownership: PUBLIC website only. Read Coordination/START_HERE; no private LAN exporter, inventory, reviewer, Android scanner, or shared manager JSON writes.

## Verified starting state
v0.9.11 GitHub Pages source and docs deployments completed SUCCESS, live docs/CURRENT_STATUS.md exact Git bytes confirmed on GE78 before development. Public gallery has 1,006 approved snapshot card entries, 27 sourced numbered-set want lists and 21 unsourced unknown denominators. Actual signed-in GitHub issue submission, phone hardware and formal screen reader remain untested.

## User-facing changes
Confirmed an accessibility gap: on the v0.9.11 offer modal, an anchor with no href when disabled disappeared from sequential keyboard navigation even though it had aria-disabled=true. The GitHub action is intentionally unavailable until visitors acknowledge public issue exposure; Email can be unavailable with unsafe photo URL or excessive details. Both outgoing actions now retain tabindex=0, aria-disabled semantics and adjacent aria-describedby status text explaining whether the action is available and what a new tab/email draft will do. Valid GitHub action remains a normal anchor into a prefilled public issue form and never submits without further visitor action; Email remains a mailto draft, not a send. The CSS displays guidance beneath both and preserves focus-visible rings on mobile.

The optional public HTTPS photo URL now maintains aria-invalid=true on invalid input, linked to an existing aria-live polite error region. Validation rejects private/LAN/localhost/IP literal and unsafe schemes (already v0.9.11); v0.9.12 makes errors visible to assistive technology and clears those states on close, so a future new offer does not inherit a stale warning. Disabled action help distinguishes invalid input, missing consent, oversized GitHub link and oversize email link. Native dialog focus management remains; underlying set dialog is preserved.

## Scope and limitations
Public index.html, wantlist.js, wantlist.css, tests and safe docs only. No added paid services, third-party scripts, API fetches or storage. No public catalog.json, set-checklists.json, photos, CNAME, valuations, prices, IDs or DNS changes; no private LAN or Android workstream changes. No visitor inquiry sent, no issue created or payment accepted.

## QC gates
- Node 46/46 source/security regression tests PASS, including three new accessibility contracts and updated older equivalent consent invariant.
- Chrome actual keyboard Tab navigation from modal, native focus, Accessibility.getFullAXTree accessible named/description actions, validation aria-invalid, no stale state, existing email/GitHub prefill and modal at 320/390/1366 local PASS. Programmatic AX tree is NOT a real VoiceOver/NVDA/TalkBack screen-reader test and responsive emulation is NOT a physical Android device test.
- Before publication rerun all older Chrome regression suites, source syntax, YAML, staged whitespace checks and protected LAN SHA-256 rollback snapshot.
- Commit, push, verify source exact remote feature SHA; fast-forward public main only if remote unchanged; never force-push. Confirm GitHub Pages SUCCESS and custom HTTPS source bytes and real live Chrome; ensure private edit URLs still 404. After source acceptance, update docs and public workstream receipt on LAN and verify final docs-only Pages deployment separately.
- Rollback to baseline with new normal Git revert after checking concurrent main state, NEVER reset/force-push; protected original/candidate source and SHA256 in CardVault/PublicShowcase/receipts/PUBLIC_V0912_INQUIRY_ACCESSIBILITY_20261107.

## Exact next steps
1. Perform full QC, protected LAN source backup, guarded GitHub/Pages release and live browser privacy/accessibility checks; commit updated docs and verify final remote SHA.
2. Coordinate approved new numbered checklist static exports solely with LAN owner; public code preserves unique printed-number and needs-review caveats.
3. Obtain a physical Android browser/cellular and real screen-reader evaluation before claiming full assistive technology/real-device acceptance. No automated public offer submission without user intent.
