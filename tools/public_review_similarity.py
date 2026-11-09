#!/usr/bin/env python3
"""Advisory front-photo resemblance for public review triage; NEVER changes card status."""
import argparse,csv,json
from itertools import combinations
from pathlib import Path
import cv2
import numpy as np
import sys
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from tools.public_review_triage import triage

def prepare(path):
    image=cv2.imread(str(path),cv2.IMREAD_COLOR)
    if image is None:
        return None
    gray=cv2.cvtColor(image,cv2.COLOR_BGR2GRAY)
    gray=cv2.resize(gray,(160,208),interpolation=cv2.INTER_AREA)
    gray=cv2.equalizeHist(gray)
    # Ignore narrow outside margins; prints share nearly identical visual layout.
    a=gray[12:-12,9:-9]
    edges=cv2.Canny(gray,60,150)[12:-12,9:-9]
    return a,edges

def resemble(a,b):
    if a is None or b is None:
        return None
    x=a[0].astype(np.float64).ravel()
    y=b[0].astype(np.float64).ravel()
    corr=float(np.corrcoef(x,y)[0,1])
    edge=float((a[1]==b[1]).mean())
    if not np.isfinite(corr):
        return None
    return max(-1.,min(1.,corr)),edge

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--catalog',type=Path,required=True)
    parser.add_argument('--output',type=Path,required=True)
    args=parser.parse_args()
    base=args.catalog.parent
    catalog=json.loads(args.catalog.read_text(encoding='utf-8-sig'))
    groups=triage(catalog['cards'])
    cached={}
    report=[]
    for rank,g in enumerate(groups,1):
        for a,b in combinations(g['copies'],2):
            ra=str(a.get('image') or '')
            rb=str(b.get('image') or '')
            def from_pub(rel):
                if rel not in cached:
                    path=(base/rel)
                    cached[rel]=prepare(path) if (path.is_file() and path.resolve().is_relative_to(base.resolve())) else None
                return cached[rel]
            m=resemble(from_pub(ra),from_pub(rb))
            same_meta=all(a.get(f)==b.get(f) for f in
                ('sport','year','brand','set','number','player','team','parallel'))
            report.append({
                'rank':rank, 'group_id':g['group_id'],'priority':g['priority'],
                'player':a.get('player'), 'year':a.get('year'),
                'set':a.get('set'), 'number':a.get('number'),
                'record_A':a.get('id'), 'record_B':b.get('id'),
                'parallel_A':a.get('parallel') or '(unmarked)',
                'parallel_B':b.get('parallel') or '(unmarked)',
                'same_listed_metadata':same_meta,
                'grayscale_similarity':round(m[0],4) if m else '',
                'edge_agreement':round(m[1],4) if m else '',
                'front_similarity_note':('LOOKS_ALIKE__REVIEW_NOT_VERIFIED' if m and m[0]>=.83
                    else 'PHOTO_DIFFERENCE__REVIEW' if m else 'PHOTO_UNAVAILABLE'),
                'review_action':'Check real fronts/backs and variant; do not auto-verify or merge'
            })
    report.sort(key=lambda v:(
        0 if v['front_similarity_note'].startswith('LOOKS_ALIKE') else 1,
        -float(v['grayscale_similarity'] or -1),
        v['rank']))
    args.output.parent.mkdir(parents=True,exist_ok=True)
    with args.output.open('w',newline='',encoding='utf-8') as handle:
        writer=csv.DictWriter(handle,fieldnames=list(report[0]))
        writer.writeheader();writer.writerows(report)
    print('pairs',len(report),'photo-like',sum(v['front_similarity_note'].startswith('LOOKS_ALIKE') for v in report))
    for x in report[:15]:
        print(f"{x['player']} #{x['number']} {x['record_A'][:8]} {x['record_B'][:8]} "
              f"corr={x['grayscale_similarity']} ({x['priority']})")
if __name__=='__main__':
    main()
