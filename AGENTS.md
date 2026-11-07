## Public v0.9.5 ? native set finder (2026-11-07)
Latest handoff: docs/HANDOFF_20261107_PUBLIC_SET_FINDER_V095.md.
When changing the public set dropdown preserve exact sourced checklist/unique-count semantics. Keep native select keyboard accessible, maintain selection while search narrows options, and retain an unknown-total fallback. Public static source only; never edit LAN inventory, images or private publisher in this repo. Follow the standing GitHub and handoff continuity policy.

## LATEST public dropdown fractions v0.9.4 - 2026-11-07
Read docs/HANDOFF_20261107_PUBLIC_SET_FRACTIONS_V094.md before editing. Sourced numbered checklists show UNIQUE OWNED issued-number spots out of checklist total in the public set dropdown; unknown totals are explicitly unknown. Do not count duplicate card rows or parallels as additional set completion. The public site remains read-only; private LAN inventory/review/publisher are managed in separate work. Keep safe source/tests/docs on remote-verified GitHub and private release/rollback receipts on JayTree LAN.

# Public Card Vault working rules
The PUBLIC static gallery in this repo is read-only. The private JayTree Card Vault and its approved one-way exporter are the sole authority for card identity, inventory, original scans, valuations, and per-copy serial numbers. Never copy private SQLite, original photos, secrets or owner notes into this public repo.
Before edits read README.md, docs/START_HERE.md, docs/CURRENT_STATUS.md and the latest dated handoff. Use an isolated feature branch, verify remote HEAD and working tree, test, commit and push safe changes, verify SHA and preserve rollback. Never force-push or change DNS or hosting without owner authorization. Public feature classifications must use evidenced, approved facts; public visitor feedback can never write to private inventory. Do not use paid CI or introduce unneeded dependencies.

Newest handoff: docs/HANDOFF_20261107_PUBLIC_SERIAL_SCHEMA_QC_V093.md; public per-copy serial projection must be explicitly owner approved and must not expose private copy IDs.
