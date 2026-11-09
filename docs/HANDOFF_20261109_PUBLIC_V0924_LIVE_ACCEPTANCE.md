# PUBLIC Card Vault v0.9.24 LIVE Release Acceptance
Date: 2026-11-09 America/Chicago. Repo: jaytreeranch/JayTree-Card-Vault-Public.

## Actual production
- GitHub PR #4 https://github.com/jaytreeranch/JayTree-Card-Vault-Public/pull/4 MERGED into public main commit 7ea199fd53bc2103dde8e0b27b27e3ed9cfce7e4. Previous production main 3aeddd32fd6943b32e6beabe72ef95b58a8d0bf2.
- Native GitHub Pages deployment run 42645169994 for exact SHA SUCCESS; HTTPS enforced, custom domain cards.jaytreebooks.com, main root source.
- Actual public HTTPS bytes matched Git source blobs for all nine reviewed static files: index.html, app.js, card-features.js, styles.css, player-positions.json, catalog.json, set-checklists.json, wantlist.js, CNAME. The public photo linked from card issue #3 returned 200, though no physical stamped copy is authenticated by that photo.
- Neither /api/cards nor /owner/private is exposed by public hosting; both returned 404.

## Functional acceptance
- Live Chrome 390px mobile and 1366px desktop PASS: 1,649 public card records load, Team and football Position filtering work together, 1,032 of 1,159 football card entries have independently sourced position labels, old 11-field and new 13-field shareable browse links work.
- In-page correction form success/failure handling passed real Chrome mocked-response tests at both sizes; visitors do not need their email client, GitHub login, or Kit newsletter subscription.
- End-to-end HTTPS/browser/email: one clearly marked QA correction was submitted through the ACTUAL live card-detail FormSubmit AJAX form and provider returned success; a matching FormSubmit message appeared in owner JayTreeBooks Gmail. This QA message requested NO card changes. This verifies delivery once, not a perpetual service uptime guarantee.
- Node public source tests 101/101 PASS; public static catalog validator PASS: 1,649 cards, 621 Verified, 1,028 Needs Review, 27 sourced issued-number sets, 6,491 missing numbered spots.
- Autographs show zero confirmed physical owner signatures; imported Base Autographs checklist titles alone are not proof. Serial-numbered EDlTIONS show two published variants: Tory Horton Gold Stars /325 and Justin Herbert Blue /150 (2026 Topps 2025 All Topps Team #25ATT-13). Justin's exact physical stamped number remains unknown and Needs Review, public issue #3 https://github.com/jaytreeranch/JayTree-Card-Vault-Public/issues/3 remains open for physical evidence.

## Security, rollback and next steps
- UI/source-only deployment. No private LAN card/serial/valuation edits, Android changes, public-to-LAN API exposure, new photos, authorizations or automatic review approval. Public JSON data and JPEGs unchanged. The current production 1,649-card parent main source has a SHA-protected backup on private JayTree LAN; exact path and manifest remain PRIVATE and are not included in the public repo.
- To roll back these UI/source changes, make an ordinary Git revert of the merge commit 7ea199fd53bc2103dde8e0b27b27e3ed9cfce7e4 with mainline parent 1, never force push or restore older 1,006-card data. Re-check Pages, static file parity, public-private boundary, and browser UX.
- Development workstream owner-directed scope was for these requested public UI changes; manager aggregate register and private worker decisions were not modified by this release.
- NEXT: (1) private LAN reviewer examine owner-original physical front/back to confirm Justin's stamp and review two unsigned Prizm checklist categories, (2) continue evidence-led 1,028 Needs Review tasks, (3) coordinate Android 17 real-device scanning and future explicitly approved one-way static snapshot exports without public writers.
