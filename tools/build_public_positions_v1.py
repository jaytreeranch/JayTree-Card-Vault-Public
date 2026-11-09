"""Build PUBLIC factual football position lookup from nflverse names, fail closed.

No private LAN card data leaves LAN. Offline join uses only already-published
catalog player names. Missing/multi-position player names are not guessed.
Do not commit public NFLverse source CSV; archive it privately on LAN instead.
"""
from __future__ import annotations
import argparse,csv,hashlib,json,re,unicodedata
from collections import Counter
from datetime import datetime,timezone
from pathlib import Path

PUB_SOURCE_URL="https://github.com/nflverse/nflverse-data/releases/download/players/players.csv"
PUB_SOURCE_SHA="ef34907e6df321ab1de0acbe8228de0663edc376af3bc7286b88b54540260a9f"
ALLOWED={"QB","WR","RB","TE","FB","DE","DT","NT","DL","LB","ILB","OLB","MLB","CB","DB","S","SAF","FS","SS","OT","G","C","OL","K","P","LS"}

def norm(s):
    s=unicodedata.normalize("NFKD",str(s or "")).casefold()
    s="".join(c for c in s if unicodedata.category(c)!="Mn")
    return " ".join(re.sub(r"[^a-z0-9]"," ",s).split())

def generate(catalog,raw):
    if catalog.get("schema")!="jaytree.public-showcase.v1" or catalog.get("readonly") is not True:
        raise ValueError("Unsupported owner-approved public catalog")
    cards=catalog.get("cards")
    if not isinstance(cards,list) or len(cards)!=1649:
        raise ValueError("Public dataset changed; re-audit first")
    timestamp=catalog.get("generated_at_utc")
    if not isinstance(timestamp,str) or not timestamp.endswith("+00:00") and not timestamp.endswith("Z"):
        raise ValueError("Unclear public snapshot timestamp")
    by_name={}
    for item in raw:
        name=norm(item.get("display_name",""))
        position=str(item.get("position") or "").strip().upper()
        if name and position:
            by_name.setdefault(name,set()).add(position)
    people={str(c.get("player","")).strip() for c in cards if c.get("sport")=="Football"}
    people.discard("")
    matched={}
    skipped={}
    for name in sorted(people):
        values=by_name.get(norm(name),set())
        if len(values)==1 and next(iter(values)) in ALLOWED:
            matched[name]=next(iter(values))
        else:
            skipped[name]="missing" if not values else "ambiguous"
    num=sum(x.get("sport")=="Football" and x.get("player") in matched for x in cards)
    if not 900<=num<=1159:
        raise ValueError("Public position source matched implausible number of cards")
    return {
       "schema":"jaytree.public-positions.v1",
       "catalog_generated_at_utc":timestamp,
       "source":"nflverse Players CSV (public player identity and position reference)",
       "source_url":PUB_SOURCE_URL,
       "source_sha256":PUB_SOURCE_SHA,
       "policy":"Exact normalized name, unique trusted position only; unknown/ambiguous names excluded. Historical positions are not card authentications.",
       "published_football_cards":sum(c.get("sport")=="Football" for c in cards),
       "cards_with_position":num,
       "players_with_position":len(matched),
       "players_without_unambiguous_position":len(skipped),
       "positions_by_name":matched,
    }

def main():
    p=argparse.ArgumentParser()
    p.add_argument("--public-catalog",type=Path,required=True)
    p.add_argument("--source-csv",type=Path,required=True)
    p.add_argument("--output",type=Path,required=True)
    a=p.parse_args()
    if a.output.exists():raise ValueError("Refuse to overwrite existing position mapping")
    if hashlib.sha256(a.source_csv.read_bytes()).hexdigest()!=PUB_SOURCE_SHA:
        raise ValueError("Public source CSV SHA-256 changed")
    with a.source_csv.open(encoding="utf-8-sig",newline="") as f:source=list(csv.DictReader(f))
    data=generate(json.loads(a.public_catalog.read_text("utf-8")),source)
    a.output.write_text(json.dumps(data,sort_keys=True,indent=2,ensure_ascii=False)+"\n","utf-8")
    print(json.dumps({key:data[key] for key in ("published_football_cards","cards_with_position",
         "players_with_position","players_without_unambiguous_position")},sort_keys=True))

if __name__=="__main__":main()
