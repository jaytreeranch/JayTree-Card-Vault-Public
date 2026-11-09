const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.join(__dirname,"..");
const scope={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,"card-features.js"),"utf8"),scope);
const {OPTIONS,classify,matchesAny}=scope.window.JayTreeCardFeatures;
const cards=JSON.parse(fs.readFileSync(path.join(root,"catalog.json"),"utf8")).cards;
test("six explicit public feature filters are known",()=>{
 assert.equal(OPTIONS.length,6);
 assert.equal(new Set(OPTIONS.map(x=>x.key)).size,6);
});
test("parallel and serial edition are distinct",()=>{
 const blue=classify({parallel:"Blue"});
 assert.equal(blue.parallel,true);assert.equal(blue.serial,false);
 const numbered=classify({parallel:"Gold Stars /325"});
 assert.equal(numbered.parallel,true);assert.equal(numbered.serial,true);
 assert.equal(classify({serial_number:"42/325"}).serial,true);
 assert.equal(classify({number:"212"}).serial,false);
});
test("autographs are never guessed from player names",()=>{
 assert.equal(classify({player:"Autograph Smith",team:"The Patchers"}).autograph,false);
 assert.equal(classify({public_features:["autograph"]}).autograph,true);
});
test("patches imply memorabilia but generic swatches do not imply patches",()=>{
 assert.equal(classify({set:"Rookie Ticket Swatches"}).memorabilia,true);
 assert.equal(classify({set:"Rookie Ticket Swatches"}).patch,false);
 assert.equal(classify({public_features:["patch"]}).patch,true);
 assert.equal(classify({public_features:["patch"]}).memorabilia,true);
});
test("OR semantics for multi-select; no selected features means all",()=>{
 const patch={public_features:["patch"]};
 assert.equal(matchesAny(patch,["serial","patch"]),true);
 assert.equal(matchesAny(patch,["serial","autograph"]),false);
 assert.equal(matchesAny(patch,[]),true);
});
test("published classifications do not invent autographs or patches",()=>{
 assert.equal(cards.length,1649);
 const counts=Object.fromEntries(OPTIONS.map(x=>[x.key,cards.filter(c=>classify(c)[x.key]).length]));
 assert.equal(counts.parallel,323);
 assert.equal(counts.serial,2);
 assert.equal(counts.autograph,0);
 assert.equal(counts.patch,0);
 assert.equal(counts.memorabilia,4);
 assert.equal(counts.rookie,5);
});
