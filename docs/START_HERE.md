## LATEST 2026-11-07 public v0.9.4 - set fractions in collection dropdown
Read docs/HANDOFF_20261107_PUBLIC_SET_FRACTIONS_V094.md first. Public set selector matches fully qualified sport/year/brand/set to the sourced numbered want-list and shows owned distinct issued spots / total as the leading label (e.g. 138/200 for Panini Absolute). Sourced completion also appears in selected-set summary, with missing-card deep link. Unsourced sets explicitly say 'total unknown.' Real Chrome tests include 27 sourced and 21 unsourced groups, failure fallback and async race. Public-only change; private LAN unchanged.

## 2026-11-07 public serial projection follow-up (v0.9.3 candidate)
Current: docs/HANDOFF_20261107_PUBLIC_SERIAL_SCHEMA_QC_V093.md. Copy-stamp projection must be owner-approved in the private LAN; malformed or partially invalid published serials now suppress all copy stamps pending review. Physical-copy editor tracked in private repo issue #15. Public main remains read-only and LAN review stays separate.

# Public Card Vault - START HERE
Updated November 7, 2026.

Live URL: https://cards.jaytreebooks.com/
Repo: jaytreeranch/JayTree-Card-Vault-Public; production branch main.

LIVE RELEASE v0.9.2 (source SHA ee66a5c86fe4f859c6b5f5523f803d289dc9e67f, GitHub Pages SUCCESS and live browser checked). Latest handoff: docs/HANDOFF_20261107_PUBLIC_MULTI_FEATURE_QC_V092.md.
Development branch: feature/public-wantlist-qc-20261107.

Read AGENTS.md and docs/CURRENT_STATUS.md before edits. Static gallery uses index.html, app.js, card-features.js, wantlist.js, styles.css, wantlist.css, catalog.json and set-checklists.json. Published snapshot: 1,006 cards (503 Verified, 503 Needs review), 27 sourced numbered checklists. The private LAN vault is authoritative and is being developed in a separate chat.

Tests: node --test tests/*.cjs. Optional Chrome interaction QC: python tests/public_browser_interaction_smoke.py on GE78 with Chrome and websocket-client.
