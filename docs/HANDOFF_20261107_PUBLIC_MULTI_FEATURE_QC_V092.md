# Public Card Vault v0.9.2 - feature filters and set want-list QC
Date: November 7, 2026. Public repo: jaytreeranch/JayTree-Card-Vault-Public.
Isolated source branch: feature/public-wantlist-qc-20261107; based on main 63e7d1cd52e841d8083ea1e8e1eeb96ab131aeeb.

Owner direction: this chat handles ONLY public site, NOT private LAN app or exact per-copy serial entry (another chat is responsible). No private data was modified.

Implementation: six multi-select card features (parallel, serial-numbered edition, autographs, patches, memorabilia/relics, rookie-tagged), logical OR within features AND with current gallery filters, counts, disabled unavailable categories, clear control, accessible fieldset, card feature labels and responsive styling. Classifiers use only published values and explicit future approved tags; no guessed autographs/patches. Edition /325 is NOT the owner's individual stamped serial number. Want-list sharing copies a direct set URL or provides selectable fallback; extra checklist count, unique missing number and metadata validation, and snapshot date are included.

Actual public catalog QC: 1,006 cards, 26 labeled parallels, one serial edition, zero autographs, zero patches, two memorabilia, five rookie-tagged. Public set-checklists: 27, 23 fully named, 6,513 missing; 1985 Circle K 31 of 33 spots, missing #2/#6, duplicates and unissued #31 correctly excluded.

QC: Node native tests 17/17 PASS; Chrome headless 7/7 DOM PASS; Chrome CDP actual interaction PASS (checkbox selection, OR, clear, year intersection, disabled options, missing-set modal); three JS syntax checks PASS. No GitHub Actions minutes used.

No modifications to private GE78 Vault, databases, originals, approved values, images, public catalog or checklist JSON, CNAME, issue forms, DNS or Cloudflare. Rollback parent SHA 63e7d1cd52e841d8083ea1e8e1eeb96ab131aeeb. Revert release via new commit, not force-push. Original assets remain in GitHub unchanged. Public site deployment must be verified separately. Physical Android/cellular acceptance and old Cloudflare service retirement remain unverified.

Next exact actions: (1) safe commit/push/remote SHA verification, (2) conditional main fast-forward if remote unchanged and live HTTP/TLS smoke, (3) future approved publisher schema integration with private LAN chat. Post-push remote SHA and rollback proof belong to the private LAN release receipt.

An additional public-only serial display contract was audited and retained: optional approved stamps, edition denominator, quarantine of inconsistent/invalid copy data, and a serial-correction feedback category. Current catalog contains ZERO publicly stamped physical copies; private owner serial entry remains out of scope.

## Verified production release after QC
- Feature source commit: ee66a5c86fe4f859c6b5f5523f803d289dc9e67f; pushed to both feature branch and public main, both remote HEADs verified.
- GitHub Pages Actions public deployment for that commit: completed SUCCESS (November 7, 2026 UTC 20:33:39 creation).
- Live HTTPS custom domain bytes matched 8/8 tracked Git blobs: index.html, app.js, card-features.js, wantlist.js, both CSS files, catalog.json and set-checklists.json (the Windows worktree's CRLF-only local difference in checklist JSON is not a source-data change).
- Live Chrome DOM: eight checks PASS (1,006 cards, parallel/serial/memorabilia counts, disabled empty autographs, 27 checklist tiles, lazy initial 48, date). Approved sample photo 200, private API paths 404.
- Per-copy serial editing on the private LAN is not handled here. Current public catalog still has no individually stamped-copy data.
- After this acceptance entry, any docs-only SHA revision must be published normally and verified as a fast-forward. Rollback of public behavior: revert the feature source commit with a NEW commit; never force-push.
