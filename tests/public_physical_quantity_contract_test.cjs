"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,".."),read=n=>fs.readFileSync(path.join(root,n),"utf8");
const ctx={window:{}};vm.runInNewContext(read("card-features.js"),ctx);vm.runInNewContext(read("card-duplicates.js"),ctx);
const feat=ctx.window.JayTreeCardFeatures,dup=ctx.window.JayTreePublicDuplicates;
const catalog=JSON.parse(read("catalog.json")),app=read("app.js"),html=read("index.html");
const sample={id:"a".repeat(24),sport:"Football",year:"2024",brand:"Panini",set:"Base",number:"12",player:"Example",team:"Giants",parallel:"",review_status:"Verified",identity_unconfirmed:false,quantity:2};
test("published physical count preserves all 1,649 records and 1,650 quantities",()=>{
 assert.equal(catalog.cards.length,1649);assert.equal(dup.countPhysical(catalog.cards),1650);
 assert.equal(dup.countPhysical(catalog.cards.filter(c=>c.review_status==="Verified")),1397);
 assert.equal(dup.countPhysical(catalog.cards.filter(c=>c.review_status==="Needs review")),253);
 assert.equal(dup.countPhysical([{quantity:2},{quantity:3},{quantity:1}]),6);
});
test("verified quantity two is a duplicate group without inventing a second photo",()=>{
 const idx=dup.build([sample],feat);assert.equal(idx.groupCount,1);assert.equal(idx.copyCount,2);
 assert.equal(idx.byId.get(sample.id).length,1);
 assert.ok(app.includes("if(group&&group.length>1)"));
 assert.ok(app.includes("Photos represent records, not necessarily separate photos of every copy."));
});
test("verified group sums quantity and never collapses uncertain/serialized rows",()=>{
 const b={...sample,id:"b".repeat(24),quantity:3};
 const idx=dup.build([sample,b],feat);assert.equal(idx.copyCount,5);assert.equal(idx.byId.get(sample.id).length,2);
 for(const delta of [{review_status:"Needs review"},{identity_unconfirmed:true},{parallel:"Blue /150"}]){
  assert.equal(dup.build([{...sample,...delta}],feat).groupCount,0);
 }
});
test("invalid quantity is defensive one, never zero, NaN, fractional or string",()=>{
 for(const q of [undefined,null,0,-1,1.5,"2",NaN,Infinity])assert.equal(dup.quantity({quantity:q}),1);
 assert.equal(dup.quantity({quantity:2}),2);
});
test("gallery, total, detail, and share use physical quantities; record integrity separate",()=>{
 for(const x of ["state.resultPhysicalCount=countPhysical(selected);","countPhysical(state.cards)+\" total physical cards (\"","displayCopies(c)+\" copies\"","return countPhysical(group||[card])","countPhysical(state.cards).toLocaleString","state.resultPhysicalCount.toLocaleString","data.cards.length===state.cards.length"])assert.ok(app.includes(x),x);
 assert.ok(html.includes("Physical cards on display"));assert.ok(html.includes("Verified records in this snapshot"));
 assert.ok(!app.includes("/api/cards"));
});
