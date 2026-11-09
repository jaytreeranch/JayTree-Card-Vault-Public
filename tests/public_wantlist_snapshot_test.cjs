const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const root=path.join(__dirname,"..");
const data=JSON.parse(fs.readFileSync(path.join(root,"set-checklists.json"),"utf8"));
test("published want-list is internally complete and read-only",()=>{
 assert.equal(data.schema,"jaytree.public-wantlist.v1");
 assert.equal(data.readonly,true);
 assert.equal(data.sets.length,data.supported_set_count);
 assert.ok(data.sets.length>0 && data.sets.length<=100);
 assert.equal(data.sets.reduce((n,x)=>n+x.missing,0),data.supported_missing_spots);
 assert.equal(data.sets.filter(x=>x.reference_player_names_complete===true).length,data.named_set_count);
 assert.equal(new Set(data.sets.map(x=>JSON.stringify(x.key))).size,data.sets.length);
 for(const s of data.sets){
  assert.equal(s.total,s.owned+s.missing,s.set);
  assert.equal(s.missing_cards.length,s.missing,s.set);
  assert.equal(new Set(s.missing_cards.map(x=>x.number)).size,s.missing,s.set);
  assert.ok(/^https:\/\//.test(s.source.url),s.set);
  assert.ok(s.missing_cards.every(x=>typeof x.number==="string"&&x.number.length>0),s.set);
 }
});
test("1985 Circle K correctly excludes duplicate copy and unissued #31",()=>{
 const s=data.sets.find(x=>x.year==="1985"&&x.set.includes("Circle K"));
 assert.ok(s,"Circle K required regression example");
 assert.equal(s.total,33);assert.equal(s.owned,33);assert.equal(s.missing,0);
 assert.deepEqual(s.missing_cards.map(x=>x.number).sort(),[]);
});
