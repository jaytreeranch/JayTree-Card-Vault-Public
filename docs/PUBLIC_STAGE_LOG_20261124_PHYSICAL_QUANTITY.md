# Public stage log — 2026-11-24

- Audited live snapshot and identified physical quantity versus record count mismatch.
- Implemented conservative quantity-aware display, duplicate grouping and detail counts.
- Preserved public catalog and all data/assets.
- Targeted tests 5/5; actual desktop and mobile-sized Chrome checks passed.
- Full suite 91/118 pass, identical 27 failures to unchanged base (86/113).
- Candidate is isolated; production remains on audited base. Await inherited-suite reconciliation and release authorization.
- See HANDOFF_20261124_PUBLIC_PHYSICAL_QUANTITY.md for rollback and next steps.