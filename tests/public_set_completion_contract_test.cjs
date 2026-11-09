const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const root=path.join(__dirname,"..");
const cards=JSON.parse(fs.readFileSync(path.join(root,"catalog.json"),"utf8")).cards;
const want=JSON.parse(fs.readFileSync(path.join(root,"set-checklists.json"),"utf8"));
const keys=new Map();
for(const c of cards){
 const k=JSON.stringify([String(c.sport||""),String(c.year||""),String(c.brand||""),String(c.set||"")]);
 const g=keys.get(k)||{entries:0,numbers:new Set()};
 g.entries++;
 if(String(c.number||"").trim())g.numbers.add(String(c.number).trim());
 keys.set(k,g);
}
test("each sourced checklist belongs to an exact catalog set and matches unique owned slots",()=>{
 assert.equal(cards.length,1649);
 assert.equal(want.supported_set_count,27);
 assert.equal(keys.size,68);
 let matched=0;
 for(const s of want.sets){
  const g=keys.get(JSON.stringify(s.key));
  assert.ok(g,JSON.stringify(s.key));
  assert.equal(g.numbers.size,s.owned,s.set);
  assert.equal(s.total,s.owned+s.missing,s.set);
  assert.ok(g.entries>=s.owned,s.set);
  matched++;
 }
 assert.equal(matched,27);
 assert.equal(keys.size-matched,41);
});
test("2025 Panini Absolute reports 140 of 200, not 247 duplicate catalog rows",()=>{
 const k=JSON.stringify(["Football","2025","Panini","2025 Panini Absolute - Base Set"]);
 const c=keys.get(k),s=want.sets.find(s=>JSON.stringify(s.key)===k);
 assert.equal(c.entries,247);
 assert.equal(c.numbers.size,140);
 assert.equal(s.owned,140);
 assert.equal(s.total,200);
 assert.equal(s.missing,60);
});
test("matching labels never join near-miss brands",()=>{
 const panini=keys.get(JSON.stringify(["Football","2025","Panini","2025 Panini Absolute - Base Set"]));
 const donruss=keys.get(JSON.stringify(["Football","2025","Donruss","2025 Panini Absolute - Base Set"]));
 assert.equal(panini.entries,247);
 assert.equal(donruss.entries,2);
 assert.equal(donruss.numbers.size,2);
 assert.equal(want.sets.some(s=>JSON.stringify(s.key)===JSON.stringify(["Football","2025","Donruss","2025 Panini Absolute - Base Set"])),false);
});
test("1985 Circle K uses all 33 issued spots across 37 physical records; unissued #31 excluded",()=>{
 const key=JSON.stringify(["Baseball","1985","Topps","1985 Topps Circle K - Base Set"]);
 const c=keys.get(key),s=want.sets.find(s=>JSON.stringify(s.key)===key);
 assert.equal(c.entries,37);assert.equal(s.owned,33);assert.equal(s.total,33);
 assert.deepEqual(s.missing_cards.map(c=>c.number).sort(),[]);
});
test("gallery reuses loaded validated checklists and shows explicit unknowns",()=>{
 const app=fs.readFileSync(path.join(root,"app.js"),"utf8");
 const wantlist=fs.readFileSync(path.join(root,"wantlist.js"),"utf8");
 assert.ok(app.includes('document.addEventListener("jaytree:checklists-ready"'));
 assert.ok(wantlist.includes('new CustomEvent("jaytree:checklists-ready"'));
 assert.ok(app.includes('setOptionLabel(key,group)'));
 assert.ok(app.includes('unique / total unknown'));
 assert.ok(app.includes('group.numbers.size'));
 assert.ok(app.includes('JSON.stringify(checklist.key)'));
 assert.ok(app.includes('checklist.owned+" / "+checklist.total'));
 assert.ok(app.includes('checklist.missing+" missing'));
});
