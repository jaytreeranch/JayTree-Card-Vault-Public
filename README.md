# JayTree Card Vault - Public Collection

Owner-authorized read-only gallery: 1006 public front-card photographs, 503 Verified entries and 503 Needs review. The latter identifications are provisional and do not display valuations or sale offers.

## GitHub Pages

GitHub Pages deploys from main / (root). The configured public domain is cards.jaytreebooks.com and its DNS CNAME points to jaytreeranch.github.io. Independently verify trusted HTTPS and certificate validity before describing the custom domain as a secure launch. Keep all editable Card Vault systems LAN-only.

## Corrections

The static gallery prepares an email to jaytreebooks@gmail.com containing the card link and correction. The visitor must send it from their email app. No public submission is treated as an automatic card approval, and no email subscription is required.

Only approved front-card photos and public fields are in this repo. Private database, card originals, editing UI and credentials remain on the owner LAN. No license is granted to redistribute the card images or reuse the scans commercially.

## Set-completion want list

27 sourced numbered checklists, 23 with complete named-player references, and 6,513 missing issued-number spots. Numbered spots (not physical copies) are counted: if you own duplicates or different parallels with the same printed number, that number is counted once toward completion. Visitors may submit a public GitHub Issue or a separate email to offer a missing card; these are unapproved inquiries only.


## Feature filters (v0.9.2)

Visitors can select more than one Parallels, Serial-numbered editions, Autographs, Patches, Memorabilia/Relics, or Rookie-tagged filter; selected features match ANY, while sport/year/set/status/search still narrow results. Unavailable options are disabled until the published catalog supports a match. Current published tags: 26 parallels, one serial-numbered edition, two memorabilia, five rookie-tagged; no confirmed autographs or patches.

An edition label like /325 does NOT establish the exact serial stamp of the owner's physical copy (such as 42/325); that belongs to the private LAN workflow. No exact stamp or price effect is inferred by this public site. See docs/START_HERE.md, docs/CURRENT_STATUS.md and the dated handoff. Run local tests with node --test tests/*.cjs.


## Stamped copy number (public projection only)
The read-only gallery may show an exact stamped copy such as 42/325 only after explicit owner verification and publication approval from the private LAN. The print-run edition /325 is not the owned numerator. Invalid or conflicting public copy stamps remain hidden for review and never alter estimated prices. See docs/PUBLIC_SERIAL_COPY_CONTRACT_20261107.md; the LAN edit requirement is tracked separately in the private repository.


## Owned / total set checklist counts (public v0.9.4)

The Collection's 'All cataloged sets' dropdown lists UNIQUE owned issued checklist numbers / sourced set total FIRST, not the number of physical copies or catalog records. For example, 2025 Panini Absolute - Base Set (Football, Panini) has 245 catalog records spanning 138 distinct numbered spots out of a sourced 200-number checklist; its public option shows 138/200 owned (69%). Selecting that set also shows 62 missing spots and a link to the matching set's missing-card list. The 1985 Topps Circle K set similarly shows 31/33, not the 32 catalog records that include a duplicate number.

A set without a sourced complete numbered checklist shows e.g. 3 unique / total unknown; no denominator, missing count or completion percentage is invented. Identifications under Needs review remain provisional. The public site remains read-only, and raw quantities/parallels never increase numbered-set completion.

Quality gates: node --test tests/*.cjs; python tests/public_browser_interaction_smoke.py; python tests/public_set_completion_browser_smoke.py. Read docs/START_HERE.md and docs/HANDOFF_20261107_PUBLIC_SET_FRACTIONS_V094.md.


## Find and sort sets in the public collection (v0.9.5)

The Collection native set selector remains keyboard accessible and displays owned unique checklist spots / sourced set total (or unknown where unsourced). A separate set-name search narrows its choices by sport, year, brand or title without replacing the selected card filter. Sort choices by newest, fewest missing, highest completion percent, or name A-Z. Sets without a sourced total follow known sets in missing/completion sorts. The link below the filters opens the existing missing-card want-list. No changes to private inventory or public snapshots.


## Responsive mobile header and missing-card offers (v0.9.6)

On narrow phones (320px), the site header navigation now uses two rows to prevent horizontal viewport expansion and invisible navigation links. Other phone/tablet/desktop layouts remain usable. Navigation links have larger hit areas on phones; missing-card offer/email links have at least 34px vertical hit areas. No private LAN or public catalog data changes. Local Chrome browser QC: python tests/public_mobile_narrow_browser_smoke.py.


## Checklist source coverage for all cataloged sets (v0.9.7)

The missing-card explorer separates 27 approved numbered checklists from 21 published set groups without a complete sourced denominator. A collapsed "Sets awaiting verified checklists" section displays only the number of distinct numbered spots recorded, how many catalog entries exist and review caveats; the total is explicitly UNKNOWN. It never invents missing-card numbers, an inaccurate percentage or extra spots from duplicate copies.

Visitors may suggest independently published checklist URLs by sending an email draft or by opening a public GitHub issue form; no proposal changes the authoritative private LAN inventory. The public display reuses the current published catalog and vetted checklist events without additional HTTP requests. For continuity see docs/HANDOFF_20261107_PUBLIC_CHECKLIST_COVERAGE_V097.md.


## Search missing cards across sourced sets (v0.9.8)

The public want-list section now searches all 27 vetted numbered-set lists by player, team, printed card number or set title. Prefix a printed number with # to match that exact number rather than substring matches. Only 40 matches render initially and visitors can load more. Each result can open its set's numbered-card dialog or open an existing owner-directed email/GitHub inquiry. It cannot change card inventory, approves no identities, and does not load extra public data.


## Share an individual missing card (public v0.9.9)

Visitors can select **Copy card link** beside any missing numbered card in either the cross-set search or a sourced set's numbered want list. Links use only the published sport/year/brand/set plus the printed checklist number, never a physical-copy ID or serialized stamp. Opening a link in a fresh browser automatically opens the correct sourced set filtered to that one numbered spot. Older set-sharing links keep working, and the offer email/GitHub issue includes the same card-specific link. Invalid links do not create records or claim a card is missing. If browser clipboard access is blocked, a read-only input lets visitors manually select/copy the link. This is static client-side functionality, not an inventory editing or visitor submission API.


## Closest-to-complete sourced numbered sets (public v0.9.10)

A compact priority dashboard on the public wantlist shows the three approved numbered sets with the fewest missing cards and links directly into the existing missing-number dialog. A new remaining-count control filters sourced checklists by 1?2, 3?10 or 11+ missing; "Highest completion first" adds a percentage sort. Current published snapshot: 1985 Topps Circle K 31/33, only two numbered cards missing; 2025 Donruss Optic Chain Reaction eight missing and My House! nine missing. Only sourced issued-numbered checklist slots count; parallel versions, duplicates and unsourced sets never inflate denominators. All data is the original public static snapshot, with no private API or backend changes.

## Missing-card inquiry builder (public v0.9.11)

The public I have this card action opens a temporary on-site inquiry composer with condition, optional variant/parallel, price, public HTTPS photo reference and notes. Visitors then choose Create email draft or Continue on GitHub; the latter requires explicit public-issue acknowledgement and sign-in. Neither option sends, submits, sells, reserves or updates inventory automatically. URLs for pictures must be publicly shareable HTTPS addresses, not local/LAN or IP addresses. The form resets on close and does not store the offer. In the public missing-card page, the checklist coverage script now listens for data before the catalogue and sourced checklist scripts can dispatch their load-ready events, repairing an intermittent coverage blank.

## Inquiry accessibility improvements ? v0.9.12

The email and GitHub offer actions remain keyboard-focusable when unavailable, so keyboard and assistive-technology users can discover the link and learn why it is disabled. Each action has explanatory help that changes as consent and photo-link validity change. Unsafe photo references use an explicitly announced invalid state and the already accessible live error message; closing the inquiry clears it. No automatic inquiry sends, GitHub issue submissions, local storage or new data fetches are added. Browser tests include Chrome accessibility-tree names/descriptions, keyboard Tab navigation at phone and desktop sizes, consent, validation and dialog reset. A live screen reader and actual physical phone/cellular checks remain distinct outstanding acceptance items.

## Low-data gallery (public v0.9.13)

The public collection includes an optional Low-data view checkbox. When enabled, the page keeps every card's title, set, status, filters and collection counts but does not create gallery photo image requests; opening a specific card loads that one full original front photo. Visitors can turn regular photos back on without losing their current results or expanded number of cards. A browser that explicitly advertises navigator.connection.saveData === true gets low-data mode initially, but all other browsers preserve the normal lazy-loaded photo gallery by default. The setting is in-memory only for the current page: no cookies, visitor tracking or local storage. This helps visitors browsing collections with constrained data, not a guarantee of a particular network speed; the fixed catalog/checklist JSON still downloads as before. See docs/HANDOFF_20261107_PUBLIC_LOW_DATA_V0913.md.


## Collection one-touch browsing reset (public v0.9.14)

The public collection now shows how many browsing controls have been customized and provides a keyboard-accessible, mobile-friendly Clear all filters button. It clears card search, sport/year/review/set selectors, open-to-offers, selected card features, set-finder search, and custom sort settings in one action while preserving the visitor's Low-data preference. There is no new query service or visitor storage, and the card catalog/checklist data are unchanged. The button remains focusable with an explanatory state even when no filters are active.

## Download missing numbered card lists (public v0.9.15)

Open a sourced set from the public want list and choose Download matching missing cards (CSV). The spreadsheet includes all matching printed numbers for that set, even if only 40 are initially shown; the current number/player/team filter also applies. It includes published player/team references where available, the public checklist source, direct missing-card links, and provisional identity warnings. It contains no private owner copy identifiers, serial stamps, personal information, or guessed player names. CSV fields are quoted and formula characters escaped. Downloads occur only on a visitor click and make no inventory edits.

## Print missing-card checklists (public v0.9.16)

From any sourced set's missing-card list, choose **Print matching missing cards**. The browser's normal print dialog prepares a paper-friendly checklist of **all** current search matches, even those beyond the first 40 shown on screen. It includes the printed card number, published player/team references or an explicit unnamed note, a blank marking column, public source URL and provisional-identity warning. It does not include private inventory or originals. The visitor can print on paper or use the browser's Save as PDF option; nothing prints or downloads automatically. Printing is separate from the existing CSV and inquiry actions.

## Share a filtered missing-card list (public v0.9.17)

Within a sourced set's missing-number dialog, enter a printed number, player, or team and choose **Copy message for N matching missing cards**. The copied text contains a public link that restores exactly that current filter, a preview of up to 12 printed numbered spots (with the remaining count), the approved checklist source and a warning that published player references/variations may be provisional. Large lists remain available in full on the website, in CSV and via the print option. If the clipboard is blocked, a read-only, selected text field permits manual copying. The feature never emails/posts a message or alters inventory; unrecognized or outdated filtered links are ignored safely.


## Device-native sharing of missing-card lists (public v0.9.18)

On phones and other browsers that support the Web Share API, opening an approved set's missing-card list also offers **Share N matching missing cards** next to **Copy message**. Tapping it opens the native Share menu with the exact same source-backed, filtered missing-number message and public link. The website never chooses a recipient or posts itself. Closing the menu or an unavailable device Share feature keeps Copy and its manual fallback available. A resolved Share API request means the browser accepted the handoff, **not** that a message was delivered. The approved catalog and private LAN inventory remain separate.
