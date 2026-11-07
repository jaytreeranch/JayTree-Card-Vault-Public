## 2026-11-07 public serial projection follow-up (v0.9.3 candidate)
Current: docs/HANDOFF_20261107_PUBLIC_SERIAL_SCHEMA_QC_V093.md. Copy-stamp projection must be owner-approved in the private LAN; malformed or partially invalid published serials now suppress all copy stamps pending review. Physical-copy editor tracked in private repo issue #15. Public main remains read-only and LAN review stays separate.

# Public Card Vault - START HERE
Updated November 7, 2026.

Live URL: https://cards.jaytreebooks.com/
Repo: jaytreeranch/JayTree-Card-Vault-Public; production branch main.

Current feature milestone: docs/HANDOFF_20261107_PUBLIC_MULTI_FEATURE_QC_V092.md.
Development branch: feature/public-wantlist-qc-20261107.

Read AGENTS.md and docs/CURRENT_STATUS.md before edits. Static gallery uses index.html, app.js, card-features.js, wantlist.js, styles.css, wantlist.css, catalog.json and set-checklists.json. Published snapshot: 1,006 cards (503 Verified, 503 Needs review), 27 sourced numbered checklists. The private LAN vault is authoritative and is being developed in a separate chat.

Tests: node --test tests/*.cjs. Optional Chrome interaction QC: python tests/public_browser_interaction_smoke.py on GE78 with Chrome and websocket-client.
