#!/usr/bin/env python3
"""Optional local-only review contact sheets; never changes public photos or card statuses."""
import argparse
import json
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import sys
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from tools.public_review_triage import triage

def draw_page(groups, root, output, page_num, per_page):
    width, tile_w, tile_h, row_h = 1080, 234, 250, 330
    height = 55 + row_h * len(groups)
    canvas = Image.new("RGB", (width,height),(245,247,250))
    draw = ImageDraw.Draw(canvas)
    draw.text((18,18),f"ADVISORY REVIEW CONTACT SHEET {page_num}: not verified; not merge approval",fill=(30,35,40))
    for idx,g in enumerate(groups):
        y=55+row_h*idx
        k=g["key"]
        title=f"{g['priority']} | {k[1]} {k[5]} #{k[4]} | {k[2]} | {k[3]}"
        draw.rectangle((8,y,1072,y+row_h-6),outline=(185,193,202),width=1)
        draw.text((18,y+8),title[:155],fill=(30,35,40))
        draw.text((18,y+26),"Variant labels at this number: "+", ".join(g["variants_at_same_number"]),fill=(70,75,85))
        for j,c in enumerate(g["copies"][:4]):
            x=18+260*j
            img_rel=str(c.get("image") or "")
            path=root/img_rel
            if path.is_file() and path.resolve().is_relative_to(root.resolve()):
                try:
                    with Image.open(path) as im:
                        im=im.convert("RGB")
                        im.thumbnail((tile_w,tile_h))
                        canvas.paste(im,(x+(tile_w-im.width)//2,y+48))
                except (OSError,ValueError): pass
            name=(c.get("parallel") or "(unmarked)")+" / "+c.get("review_status","?")+" / "+str(c.get("id",""))[:8]
            draw.text((x,y+302),name[:38],fill=(45,50,58))
    output.parent.mkdir(parents=True,exist_ok=True)
    canvas.save(output,quality=81,optimize=True)

def main():
    p=argparse.ArgumentParser()
    p.add_argument("--catalog",required=True,type=Path)
    p.add_argument("--output-dir",required=True,type=Path)
    p.add_argument("--max-groups",type=int,default=60)
    p.add_argument("--per-page",type=int,default=10)
    args=p.parse_args()
    if args.max_groups<1 or not 1<=args.per_page<=20:
        p.error("invalid group/page bounds")
    catalog=json.loads(args.catalog.read_text(encoding="utf-8-sig"))
    groups=triage(catalog["cards"])[:args.max_groups]
    for i in range(0,len(groups),args.per_page):
        page=i//args.per_page+1
        path=args.output_dir/f"review_contacts_page_{page:02}.jpg"
        draw_page(groups[i:i+args.per_page],args.catalog.parent,path,page,args.per_page)
        print(path)
    aj=[c for c in catalog["cards"] if
        str(c.get("player","")).casefold()=="a.j. brown" and
        str(c.get("year"))=="2026" and str(c.get("number"))=="169" and
        str(c.get("brand","")).casefold()=="topps"]
    if aj:
        k=("football","2026","topps",str(aj[0]["set"]).casefold(),"169","a.j. brown",str(aj[0]["team"]).casefold(),"")
        focus={"key":k,"priority":"P0_VARIANT_CONFLICT","copies":aj,
               "variants_at_same_number":sorted({c.get("parallel") or "(unmarked)" for c in aj})}
        path=args.output_dir/"AJ_Brown_2026_Topps_169_three_fronts.jpg"
        draw_page([focus],args.catalog.parent,path,"FOCUS",1)
        print(path)

if __name__=="__main__":
    main()
