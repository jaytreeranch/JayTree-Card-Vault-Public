#!/usr/bin/env node
"use strict";
/* Read-only Gate A validation for the NEXT approved PUBLIC static export.
 * No private LAN APIs, edits, writes, browser requests or guessed card names.
 */
const fs=require("node:fs"),path=require("node:path"),crypto=require("node:crypto");
const root=__dirname;
const args=process.argv.slice(2);
function flag(name,fallback){
 const at=args.indexOf(name);return at>=0?args[at+1]:fallback;
}
const catalogFile=flag("--catalog",path.join(root,"catalog.json"));
const checklistFile=flag("--checklists",path.join(root,"set-checklists.json"));
const errors=[],warnings=[];
const fail=(s)=>errors.push(s),warn=s=>warnings.push(s);
const sha256=b=>crypto.createHash("sha256").update(b).digest("hex");
let catalog=null,checklists=null,catBytes=null,listBytes=null;
for(const [label,file] of [["catalog",catalogFile],["checklists",checklistFile]]){
 try{
  const raw=fs.readFileSync(file);
  const obj=JSON.parse(raw.toString("utf8"));
  if(label==="catalog"){catalog=obj;catBytes=raw;}
  else{checklists=obj;listBytes=raw;}
 }catch(e){fail(label+" cannot be read and parsed: "+e.message);}
}
const validTime=s=>typeof s==="string"&&
 /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(s)&&
 Number.isFinite(Date.parse(s));
const isCount=n=>Number.isSafeInteger(n)&&n>=0;
let actualVerified=0,actualReview=0,missingSum=0;
if(catalog){
 if(catalog.schema!=="jaytree.public-showcase.v1"||catalog.readonly!==true)fail("catalog public read-only schema invalid");
 if(!Array.isArray(catalog.cards))fail("catalog cards missing");
 else {
  const seen=new Set();
  for(const [i,c] of catalog.cards.entries()){
   if(!c||typeof c!=="object"){fail("catalog invalid card at "+i);continue;}
   if(!/^[a-f0-9]{24}$/.test(c.id||""))fail("catalog invalid published card id at "+i);
   if(seen.has(c.id))fail("catalog duplicate public card id at "+i);
   seen.add(c.id);
   if(c.image!=="assets/"+c.id+".jpg")fail("catalog image path does not match approved public id at "+i);
   if(c.review_status==="Verified")actualVerified++;
   else if(c.review_status==="Needs review")actualReview++;
   else fail("catalog invalid review status at "+i);
  }
  if(catalog.count!==catalog.cards.length)fail("catalog declared count differs from actual array");
  if(catalog.verified_count!==actualVerified)fail("catalog Verified count differs from actual entries");
  if(catalog.needs_review_count!==actualReview)fail("catalog Needs review count differs from actual entries");
  if(actualVerified+actualReview!==catalog.cards.length)fail("catalog review statuses do not cover all entries");
 }
 if(!validTime(catalog.generated_at_utc))fail("catalog generated_at_utc invalid");
}
if(checklists){
 if(checklists.schema!=="jaytree.public-wantlist.v1"||checklists.readonly!==true)fail("checklists public read-only schema invalid");
 if(!validTime(checklists.generated_at_utc))fail("checklists generated_at_utc invalid");
 if(!Array.isArray(checklists.sets))fail("checklists sets missing");
 else{
  const seen=new Set();
  for(const [i,set] of checklists.sets.entries()){
   if(!set||!Array.isArray(set.key)||set.key.length!==4||!set.key.every(x=>typeof x==="string")){
    fail("checklist invalid four-component key at "+i);continue;
   }
   const key=JSON.stringify(set.key);
   if(seen.has(key))fail("checklist duplicate set identity at "+i);
   seen.add(key);
   if(!isCount(set.total)||set.total===0||!isCount(set.owned)||!isCount(set.missing)||
     set.owned+set.missing!==set.total)fail("checklist owned + missing != issued total at "+i);
   if(!Array.isArray(set.missing_cards)||set.missing_cards.length!==set.missing){
    fail("checklist missing_card array count mismatch at "+i);
   }else{
    const nums=set.missing_cards.map(c=>c?.number);
    if(nums.some(x=>typeof x!=="string"||!x.trim())||new Set(nums).size!==nums.length)
     fail("checklist missing printed numbers invalid or duplicated at "+i);
   }
   if(isCount(set.missing))missingSum+=set.missing;
  }
  if(checklists.supported_set_count!==checklists.sets.length)
   fail("checklists declared supported set count mismatches array");
  if(checklists.supported_missing_spots!==missingSum)
   fail("checklists declared missing printed spots mismatches sum");
 }
 if(catalog&&checklists.catalog_card_count!==catalog.cards?.length)
  fail("checklist catalog_card_count differs from published catalog");
}
if(catalog&&checklists&&validTime(catalog.generated_at_utc)&&validTime(checklists.generated_at_utc)&&
 Date.parse(catalog.generated_at_utc)!==Date.parse(checklists.generated_at_utc))
 fail("catalog and checklist timestamps refer to different published snapshots");
const report={
 valid:errors.length===0,errors,warnings,
 snapshot_utc:catalog?.generated_at_utc||null,
 cards:catalog?.cards?.length??null,verified:actualVerified,needs_review:actualReview,
 sourced_sets:checklists?.sets?.length??null,missing_numbered_spots:missingSum,
 catalog_sha256:catBytes?sha256(catBytes):null,
 checklists_sha256:listBytes?sha256(listBytes):null,
 scope:"Public static approved files only; NOT live owner LAN verification"
};
if(args.includes("--json"))process.stdout.write(JSON.stringify(report,null,2)+"\n");
else {
 process.stdout.write((report.valid?"PASS":"FAIL")+" public snapshot integrity: "+
  report.cards+" cards, "+report.verified+" Verified, "+report.needs_review+
  " Needs review; "+report.sourced_sets+" sourced sets; "+
  report.missing_numbered_spots+" missing issued slots\n");
 for(const e of errors)process.stderr.write("ERROR: "+e+"\n");
 for(const w of warnings)process.stdout.write("WARN: "+w+"\n");
}
if(errors.length)process.exitCode=1;
