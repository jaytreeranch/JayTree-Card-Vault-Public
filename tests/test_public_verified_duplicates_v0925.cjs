"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,".."),read=n=>fs.readFileSync(path.join(root,n),"utf8");
const catalog=JSON.parse(read("catalog.json")),ctx={window:{}};
vm.runInNewContext(read("card-features.js"),ctx);
vm.runInNewContext(read("card-duplicates.js"),ctx);
const feat=ctx.window.JayTreeCardFeatures,dup=ctx.window.JayTreePublicDuplicates;
const groups=dup.build(catalog.cards,feat),app=read("app.js"),html=read("index.html");
test("source-only grouping hides only already Verified identical non-serialized cards",()=>{
 assert.equal(catalog.cards.length,1649);assert.equal(groups.groupCount,30);
 assert.equal(groups.copyCount,61);assert.equal(groups.byId.size,61);
 for(const g of groups.groups){
  assert.ok(g.length>1);
  assert.equal(new Set(g.map(x=>dup.key(x))).size,1);
  assert.equal(new Set(g.map(x=>x.id)).size,g.length);
  assert.ok(g.every(x=>x.review_status==="Verified"&&!x.identity_unconfirmed));
  assert.ok(g.every(x=>!feat.serialInfo(x).numbered));
  assert.ok(g.every(x=>!feat.classify(x).memorabilia));
 }
});
test("verified triple has separate owned physical copies",()=>{
 const g=groups.groups.find(x=>x.length===3&&x[0].player==="Kevin Seitzer");
 assert.ok(g);assert.equal(new Set(g.map(x=>x.id)).size,3);
});
test("unverified repeated numbers are NOT counted as true duplicates",()=>{
 const arr=catalog.cards.filter(c=>c.player==="Dallas Cowboys"&&c.year==="2026"&&c.number==="272");
 assert.equal(arr.length,5);
 assert.ok(arr.every(x=>!groups.byId.has(x.id)));
});
test("do not group distinct parallels, years, teams, serials or uncertain entries",()=>{
 const a={id:"a".repeat(24),sport:"Football",year:"2024",brand:"Panini",set:"Base",
   number:"123",player:"John Doe",team:"Giants",parallel:"",review_status:"Verified",identity_unconfirmed:false};
 const b={...a,id:"b".repeat(24)};
 assert.equal(dup.build([a,b],feat).groupCount,1);
 for(const delta of [{parallel:"Silver"},{number:"124"},{year:"2025"},{team:"Jets"},{identity_unconfirmed:true},{review_status:"Needs review"}]){
  assert.equal(dup.build([a,{...b,...delta}],feat).groupCount,0);
 }
 assert.equal(dup.build([{...a,parallel:"Blue /150"},{...b,parallel:"Blue /150"}],feat).groupCount,0);
});
test("public browse has combine, duplicate-only, copy count and per-copy photo controls",()=>{
 for(const id of ["combine-copies","duplicates-only","duplicate-filter-help"])
  assert.ok(html.includes('id="'+id+'"'));
 for(const str of ["state.duplicateGroups=duplicateIndex.byId",
  "(!onlyDuplicates || confirmedCopies(c)!==null)","state.resultPhysicalCount=selected.length",
  'group.length+" copies"','duplicate-photo-next','duplicate-photo-prev',
  '["Owned",String(displayCopies(c))]','if(!$("details").open)$("details").showModal()'])
   assert.ok(app.includes(str),str);
 assert.ok(!app.includes("/api/cards"));
});
test("links preserve older 11/13-item filters and modern 15-item duplicate settings",()=>{
 for(const str of ["[11,13,15].includes(v.length)",
  '$("position").value,$("combine-copies").checked,$("duplicates-only").checked',
  "p.length===15?p[13]:true","p.length===15?p[14]:false",
  'typeof v[13]!=="boolean"','typeof v[14]!=="boolean"'])
  assert.ok(app.includes(str),str);
});
test("source catalog and photo data untouched, published edition/autographs unchanged",()=>{
 assert.equal(catalog.cards.length,1649);assert.equal(catalog.verified_count,621);
 assert.equal(catalog.needs_review_count,1028);
 assert.equal(catalog.cards.filter(c=>feat.classify(c).autograph).length,0);
 assert.equal(catalog.cards.filter(c=>feat.classify(c).serial).length,2);
});