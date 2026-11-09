#!/usr/bin/env python3
"""Read-only public snapshot duplicate review triage. Never approves or merges cards."""
import argparse
import csv
import hashlib
import json
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path

FIELDS = ("sport", "year", "brand", "set", "number", "player", "team", "parallel")
REQUIRED = FIELDS[:-1]

def normalized(card, fields=FIELDS):
    vals = tuple(str(card.get(f) or "").strip().casefold() for f in fields)
    return vals if all(vals[:len(REQUIRED)]) else ()

def triage(cards):
    """Return repeat-identity candidates, not authoritative duplicate approvals."""
    exact, base = defaultdict(list), defaultdict(list)
    for card in cards:
        key = normalized(card)
        if not key:
            continue
        exact[key].append(card)
        base[key[:-1]].append(card)
    candidates = []
    for key, copies in exact.items():
        if len(copies) < 2 or not any(c.get("review_status") != "Verified" or
                                       c.get("identity_unconfirmed") is True for c in copies):
            continue
        sibling_variants = sorted({str(c.get("parallel") or "").strip() or "(unmarked)"
                                   for c in base[key[:-1]]})
        anchor = sum(c.get("review_status") == "Verified" and
                     c.get("identity_unconfirmed") is not True for c in copies)
        risky = any(any(flag in (str(c.get("set") or "") + " " +
                                  str(c.get("parallel") or "")).lower()
                        for flag in ("auto", "relic", "patch", "memorabilia",
                                     "serial", "canvas", "foilfractor", "1/1", "/50"))
                    for c in copies)
        # Mixed-variant metadata needs proof, even when a matching base identity exists.
        priority = ("P0_PARALLEL_CHECK" if len(sibling_variants) > 1 else
                    "P1_VERIFIED_ANCHOR" if anchor else
                    "P3_HIGH_RISK" if risky else "P2_UNVERIFIED_COPIES")
        candidates.append({
            "priority": priority, "key": key, "copies": copies,
            "verified_anchor": anchor, "variants_at_same_number": sibling_variants,
            "needs_review": len(copies)-anchor,
            "group_id": hashlib.sha256(json.dumps(key).encode("utf-8")).hexdigest()[:16],
        })
    order={"P0_PARALLEL_CHECK":0,"P1_VERIFIED_ANCHOR":1,
           "P2_UNVERIFIED_COPIES":2,"P3_HIGH_RISK":3}
    candidates.sort(key=lambda g:(order[g["priority"]],-g["needs_review"],
                                   g["key"][0],g["key"][1],g["key"][5],g["group_id"]))
    return candidates

def rows(groups, images_root):
    result=[]
    for rank,group in enumerate(groups,1):
        for card in group["copies"]:
            image_rel = str(card.get("image") or "")
            path = images_root / image_rel
            valid = path.is_file() and path.resolve().is_relative_to(images_root.resolve())
            sha = hashlib.sha256(path.read_bytes()).hexdigest() if valid else ""
            result.append({
                "rank":rank,"priority":group["priority"],"group_id":group["group_id"],
                "group_copies":len(group["copies"]),
                "needs_review":group["needs_review"],
                "verified_anchor":group["verified_anchor"],
                "same_number_variants":" | ".join(group["variants_at_same_number"]),
                "sport":card.get("sport",""),"year":card.get("year",""),
                "brand":card.get("brand",""),"set":card.get("set",""),
                "number":card.get("number",""),"player":card.get("player",""),
                "team":card.get("team",""),"parallel":card.get("parallel",""),
                "public_id":card.get("id",""),"review_status":card.get("review_status",""),
                "identity_unconfirmed":card.get("identity_unconfirmed",False),
                "approved_front_path":image_rel,"approved_front_sha256":sha,
                "front_present":valid,"action":"Manual photo, parallel, back/serial review; no automatic merge"
            })
    return result

def create_report(catalog, groups, entries):
    total=len(catalog["cards"])
    verified=sum(c.get("review_status")=="Verified" for c in catalog["cards"])
    focus=[g for g in groups if g["key"][5]=="a.j. brown" and
           g["key"][1]=="2026" and g["key"][4]=="169"]
    by_priority={p:sum(g["priority"]==p for g in groups)
                 for p in ("P0_PARALLEL_CHECK","P1_VERIFIED_ANCHOR",
                           "P2_UNVERIFIED_COPIES","P3_HIGH_RISK")}
    result=[
        "# Public duplicate review triage (advisory only)",
        "",
        "Generated (UTC): "+datetime.now(timezone.utc).isoformat(),
        "Source approved public snapshot: "+str(catalog.get("generated_at_utc","unknown")),
        f"Published physical rows: {total}; Verified: {verified}; "
        f"Needs Review: {total-verified}.",
        f"Unresolved exact-key repeat groups: {len(groups)}; "
        f"physical copies in them: {sum(len(g['copies']) for g in groups)}; "
        f"under-review rows in them: {sum(g['needs_review'] for g in groups)}.",
        "Priorities: "+", ".join(f"{k}: {v}" for k,v in by_priority.items()),
        "",
        "**No cards were Verified, regrouped or changed by this report.** "
        "Public grouping continues to require verified identity and excludes "
        "stamps, autographs and memorabilia. Source catalog values are provisional.",
        "",
        "## A.J. Brown 2026 Topps #169 — image/variant exception",
        "",
        "Public source has two unmarked-parallel records and one labeled Canvas. "
        "The second published JPG visibly has a purple border; this may be an "
        "unrecorded distinct parallel. The Canvas designation of the silver-looking "
        "third front is not proven by the published face. Inspect the original "
        "physical fronts AND backs and update private variant metadata only "
        "after evidence. Do NOT combine these three based on player/number.",
        "",
    ]
    for g in focus:
        result.append(f"- Group {g['group_id']}: {g['priority']}; "
                      f"{len(g['copies'])} copies; sibling variant labels "
                      f"{g['variants_at_same_number']}.")
        for c in g["copies"]:
            result.append(f"  - {c.get('id')} — {c.get('image')} — "
                          f"parallel '{c.get('parallel') or '(unmarked)'}'; "
                          f"{c.get('review_status')}.")
    result+=["", "## Highest-priority 40 candidate groups",
              "", "| Rank | Priority | Identity | Copies | Verified anchor | Variants at number |",
              "|---:|---|---|---:|---:|---|"]
    for rank,g in enumerate(groups[:40],1):
        k=g["key"]
        identity=f"{k[1]} {k[2]} {k[5]} #{k[4]} ({k[3]})"
        identity=identity.replace("|","/")
        result.append(f"| {rank} | {g['priority']} | {identity} | "
                      f"{len(g['copies'])} | {g['verified_anchor']} | "
                      f"{', '.join(g['variants_at_same_number']).replace('|','/')} |")
    result+=["","## Acceptance / next steps",
             "",
             "1. LAN reviewer confirms image-to-player, printed number, brand, year, "
             "team and actual parallel for the highest-priority groups.",
             "2. For ambiguous/foil/Canvas/serial/relic cases, inspect actual owner "
             "original and reverse/stamp before deciding; keep Needs Review otherwise.",
             "3. Authenticated private review changes require transaction backups, "
             "per-copy provenance and tests, then separately approved one-way "
             "public export and verified deployed duplicate grouping.",
             "",
             "CSV contains every unresolved candidate physical row and approved "
             "front-image SHA-256; it is a review queue, not an approval batch.",
             ""]
    return "\n".join(result)

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--catalog",type=Path,required=True)
    parser.add_argument("--csv",type=Path,required=True)
    parser.add_argument("--report",type=Path,required=True)
    args=parser.parse_args()
    catalog=json.loads(args.catalog.read_text(encoding="utf-8-sig"))
    cards=catalog["cards"]
    assert len(cards)==catalog["count"],"public card count mismatch"
    assert len({str(c.get("id")) for c in cards})==len(cards),"duplicate public ID"
    groups=triage(cards)
    entry=rows(groups,args.catalog.parent)
    for output in (args.csv,args.report):
        output.parent.mkdir(parents=True,exist_ok=True)
    with args.csv.open("w",encoding="utf-8",newline="") as f:
        writer=csv.DictWriter(f,fieldnames=list(entry[0]) if entry else
            ["rank","priority","group_id"])
        writer.writeheader()
        writer.writerows(entry)
    args.report.write_text(create_report(catalog,groups,entry),encoding="utf-8")
    print(f"TRIAGE groups={len(groups)} rows={len(entry)} "
          f"under_review={sum(g['needs_review'] for g in groups)} "
          f"csv={args.csv} report={args.report}")

if __name__=="__main__":
    main()
