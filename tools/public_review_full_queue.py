#!/usr/bin/env python3
"""Prioritize EVERY public Needs Review copy; read-only; no auto-verification."""
import argparse,csv,json,hashlib
from pathlib import Path
import sys
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from tools.public_review_triage import triage

RISK_WORDS=('canvas','foil','prizm','chrome','refractor','gold','blue','red','green',
            'purple','silver','black','serial','1/1','/50','/99','/150','/325',
            'patch','memorabilia','relic','autograph','auto','variation','holo',
            'laser','lazer','superfractor','sandglitter','parallel')
def flags(card, number_variants):
    words=(str(card.get("set") or "")+" "+
           str(card.get("parallel") or "")).casefold()
    risks=[]
    if str(card.get("parallel") or "").strip(): risks.append("RECORDED_PARALLEL")
    if any(w in words for w in RISK_WORDS): risks.append("SPECIAL_FINISH_OR_INSERT")
    if len(number_variants)>1: risks.append("MULTIPLE_PARALLELS_SAME_NUMBER")
    if not str(card.get("image") or "").startswith("assets/"): risks.append("NO_APPROVED_FRONT")
    return risks

def queue(cards):
    pending=[x for x in cards if x.get("review_status")!="Verified" or
             x.get("identity_unconfirmed") is True]
    repeated=triage(cards)
    group_by_id={}
    variants_by_num={}
    from collections import defaultdict
    by_num=defaultdict(set)
    for c in cards:
        k=tuple(str(c.get(f) or "").strip().casefold() for f in
                ("sport","year","brand","set","number","player","team"))
        if all(k):
            by_num[k].add(str(c.get("parallel") or "").strip() or "(unmarked)")
    for g in repeated:
        for c in g["copies"]:
            group_by_id[c["id"]]=g
    result=[]
    for c in pending:
        key=tuple(str(c.get(f) or "").strip().casefold() for f in
                  ("sport","year","brand","set","number","player","team"))
        variants=by_num.get(key,set())
        risk=flags(c,variants)
        g=group_by_id.get(c["id"])
        if g is not None: tier="DUPLICATE_FIRST"
        elif risk: tier="SINGLE_SPECIAL_REVIEW"
        else: tier="SINGLE_STANDARD_REVIEW"
        result.append({
            "public_id":c.get("id",""),
            "tier":tier,"duplicate_group_id":g["group_id"] if g else "",
            "duplicates_group_physical_copies":len(g["copies"]) if g else 1,
            "same_number_variant_count":len(variants),
            "risk_flags":"|".join(risk),
            "sport":c.get("sport",""),"year":c.get("year",""),
            "brand":c.get("brand",""),"set":c.get("set",""),
            "player":c.get("player",""),"number":c.get("number",""),
            "parallel":c.get("parallel",""),
            "image":c.get("image",""),
            "review_status":c.get("review_status",""),
            "approved_public_front_sha256": "", # SHA populated from approved published JPG below
            "approval_status":"NOT_APPROVED__AUTHORITATIVE_LAN_REVIEW_ONLY",
            "recommended_next":"Compare original owner front/back + checklist and finish",
        })
    order={"DUPLICATE_FIRST":0,"SINGLE_STANDARD_REVIEW":1,"SINGLE_SPECIAL_REVIEW":2}
    result.sort(key=lambda r:(order[r["tier"]],len(r["risk_flags"].split("|")) if r["risk_flags"] else 0,
                              r["set"],r["player"],r["number"],r["public_id"]))
    return result

def main():
    p=argparse.ArgumentParser()
    p.add_argument("--catalog",type=Path,required=True)
    p.add_argument("--csv",type=Path,required=True)
    p.add_argument("--summary",type=Path,required=True)
    args=p.parse_args()
    catalog=json.loads(args.catalog.read_text(encoding="utf-8-sig"))
    items=queue(catalog["cards"])
    assert len(items)==catalog["needs_review_count"],"Review count inconsistent"
    assert len({r["public_id"] for r in items})==len(items),"Duplicate ID in review queue"
    missing=0
    for row in items:
        path=args.catalog.parent / row["image"]
        if path.is_file() and path.resolve().is_relative_to(args.catalog.parent.resolve()):
            row["approved_public_front_sha256"]=hashlib.sha256(path.read_bytes()).hexdigest()
        else:
            missing+=1
            row["risk_flags"]+="|MISSING_FRONT"
    args.csv.parent.mkdir(parents=True,exist_ok=True)
    with args.csv.open("w",newline="",encoding="utf-8") as stream:
        writer=csv.DictWriter(stream,fieldnames=list(items[0]))
        writer.writeheader()
        writer.writerows(items)
    from collections import Counter
    counts=Counter(r["tier"] for r in items)
    summary={
      "source":"approved static public catalog only — not authoritative LAN updates",
      "catalog_generated_at":catalog.get("generated_at_utc"),
      "total_public_needs_review":len(items),
      "dupe_first_pending":counts["DUPLICATE_FIRST"],
      "standard_other_pending":counts["SINGLE_STANDARD_REVIEW"],
      "special_other_pending":counts["SINGLE_SPECIAL_REVIEW"],
      "missing_approved_front":missing,
      "files_are_advisory":True,
      "cards_verified_by_this_tool":0,
      "cards_mutated_by_this_tool":0,
      "next":"LAN reviewer may approve each card only after original image/checklist/variant/physical copy evidence with signed transactions"
    }
    args.summary.write_text(json.dumps(summary,indent=2)+"\n",encoding="utf-8")
    print(json.dumps(summary,indent=2))
if __name__=="__main__":main()
