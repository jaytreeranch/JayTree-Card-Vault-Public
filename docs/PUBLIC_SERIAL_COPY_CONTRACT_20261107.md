# Public serial-numbered card contract ? November 7, 2026

## Edit authority and physical-copy fields
The public gallery is read-only. Enter/edit the exact stamped serial in the GE78 LAN Vault's physical-copy details, never GitHub Pages. Each physical copy must retain its distinct private copy ID. A printed checklist number (e.g. an illustrative card #185) is NOT a serial stamp (e.g. 42/325).

Required LAN editing capability (owned by the separate private-LAN development chat):
- Serial-numbered: yes/no/unknown, owned stamped number, print-run total, optional transcription of the visible printed text, and photo-evidence reference.
- Support manual 42/325 entry and two separated integer fields; optionally prefill the total from a VERIFIED edition /325 while never pre-filling the owned numerator.
- Validate integers 1 through 999999 and owned <= print run. Accept 1/1; reject 0/325, 326/325, invalid separators and nonnumeric input.
- Mark confirmed vs Needs Review separately. Different physical copies of the same checklist number may have different stamps. Duplicate identical serials must be quarantined for photo/record reconciliation, never silently merged or treated as two unique originals.
- Link per-copy condition, grading, location and owner estimate; preserve market-comparable provenance. First/last-of-run and matching jersey numbers can influence price, but there is NO automatic monetary premium without independent sold comparisons. Sold/eBay reconciliation must decrement the correct copy.

## Approved public projection
Only after LAN verification AND owner publication approval, the one-way publisher may explicitly emit the public-only fields:

    "number": "123",
    "parallel": "Example Parallel /325",
    "serial_numbered": true,
    "serial_total": 325,
    "public_serial_copies": [{"number": 42, "out_of": 325}]

A pre-approved legacy public display string serial_number such as 42/325 is also readable. Do not export source private copy IDs, original photos, user notes, raw database records, filenames, credentials, or condition details. An output field existing in the static public snapshot is NOT permission to expose the underlying private source. Update the private publisher's allowlist and tests separately before it emits the field.

For a /325 edition with NO approved public stamp, public details show Serial edition /325 and Owned stamped copy: Not published. The filter still finds the edition without inventing 325/325. Value and sort are unaffected by stamp.

## Known collision to resolve privately
The private LAN has an unresolved case involving two records with the same stamped number. The separate LAN reviewer must reconcile source photos and copy identity before any public copy-specific serial is projected. No private record IDs or unapproved observed stamp values belong in this public repository.

## Quality and publication gates
Public code verifies positive integer ranges, consistent edition size and nonduplicate published stamps; conflicts suppress the stamp. New optional fields must not change the count of physical cards, set checklist ownership, valuation or already-public photos. Regression suite: native Node, real Chrome feature and serial details, image and catalog count, no edit/private endpoint, and origin main lease checks. Publishing private data remains forbidden.
