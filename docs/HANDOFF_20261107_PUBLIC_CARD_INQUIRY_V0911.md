# JayTree Card Vault PUBLIC v0.9.11 ? visitor missing-card inquiry
Date: 2026-11-07 America/Chicago
Public repo: jaytreeranch/JayTree-Card-Vault-Public
Feature branch: feature/public-offer-inquiry-builder-v0911-20261107
Parent public main: bef6554140d1c2e5ad7929b0564c8a045299c720
Website: https://cards.jaytreebooks.com/#wantlist
Authorized machine: JT-GE78 via JayTree Local Control with hostname_test success; GE75 hostname_test also successful.

## Implementation
Existing I have this card actions in cross-set missing-card search and individual set modal now open a native accessible inquiry dialog before navigating away. The previously existing GitHub href remains as a fallback for non-JavaScript actions. Each inquiry derives from a sourced public set and exact missing printed number, with known player name only if already published. Data entry: required approximate condition, optional variant/parallel (100 characters), asking price (64), public photo URL (400) and free notes (350). The public form does not write to owner inventory, create listings or approve a card. Existing 1,006-card public catalog and 27 sourced/21 unsourced groups stay unchanged.

Create email draft opens a prefilled owner email message, with details and shareable specific missing-card URL, without actually sending. Continue on GitHub opens the public issue form template with the same card fields and new optional variation, asking-price and photo-url IDs plus offer-details. Public GitHub requires sign-in; visitor must check the public-information acknowledgement before its destination becomes active. GitHub dropdown prefill depends on GitHub behavior, so visitors are explicitly told to review all fields before submitting. Both require the visitor to take a later send/submit action in the destination. We did not send or submit an inquiry.

Optional photo must be a public HTTPS URL with no username/password, raw IP, localhost, .lan, .local or .internal hostname. Nothing automatically fetches or uploads a photo. Clients cannot certify third-party sharing settings: visitor is warned to avoid private folders and personal data. The current form is transient, resets on close, and does not persist, log or post input. Generated URLs capped to mitigate browser and GitHub query-string limits. All user data rendered via DOM textContent and URLSearchParams.

## Browser initialization bug fixed
Concurrent Chrome QC exposed an intermittent missed event in the older 21-unknown-set coverage browser: the coverage event listener script ran after two asynchronous public data loaders and could miss their one-time ready events. HTML now defers checklist-coverage.js BEFORE app.js and wantlist.js, preserving the data loaders' original order. Added a contract test that refuses to regress this ordering. Existing sourced counts and inventories are unaffected.

## Boundaries and QC
Only public index.html, wantlist.js, wantlist.css, .github/ISSUE_TEMPLATE/missing-card-offer.yml, test scripts and safe docs changed. No LAN database/API/reviewer/publisher, Android scanner, catalog.json, set-checklists.json, card images, serials, valuation, DNS/CNAME, credentials, scheduled jobs or paid service changed.

Initial Node source tests 43/43 PASS including new inquiry/privacy and event-order tests. Local real Chrome 320/390/1366 PASS the offer form, initial focus, optional fields, HTTPS rejection, consent link gate, email and GitHub prefilled fields, reset and nested dialog. Pre-release requires all older set completion, coverage, global search, card-link and responsive browser regressions, source syntax, YAML validation, protected LAN baseline, remote SHA and Pages live acceptance.

After release, require Pages SUCCESS, exact committed byte parity on live HTTPS assets, actual live Chrome inquiry checks and private edit route 404, then update verified docs and LAN PUBLIC manager receipt. Do not claim physical Android/cellular, signed-in GitHub issue submission or formal screen-reader acceptance: all remain untested.

Rollback: baseline SHA bef6554140d1c2e5ad7929b0564c8a045299c720, protected original/candidate SHA256 receipts at LAN CardVault/PublicShowcase/receipts/PUBLIC_V0911_OFFER_BUILDER_20261107. Use a new normal Git revert after verifying concurrent public main, NEVER reset/force push.

## Exact next three
1. Complete protected rollback and all regression QC; deploy isolated public branch and fast-forward main only if no concurrent update; verify Pages, live browser and docs acceptance.
2. LAN checklist approvals and private inventory remain solely with LAN workstream; test safe stale-card links if approved one-way data changes later.
3. Physical Android and cellular public site validation, formal assistive-technology audit and manual external GitHub issue/email tests when available.
