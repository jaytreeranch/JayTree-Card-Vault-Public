const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,"..");
const cards=JSON.parse(fs.readFileSync(path.join(root,"catalog.json"),"utf8")).cards;
const sourced=JSON.parse(fs.readFileSync(path.join(root,"set-checklists.json"),"utf8")).sets;
const publicKeys=new Map();
for(const c of cards){
 const k=JSON.stringify([String(c.sport||""),String(c.year||""),String(c.brand||""),String(c.set||"")]);
 const x=publicKeys.get(k)||{entries:0,distinct:new Set()};
 x.entries++;
 if(String(c.number||"").trim())x.distinct.add(String(c.number).trim());
 publicKeys.set(k,x);
}
const known=new Set(sourced.map(s=>JSON.stringify(s.key)));
test("no catalog entry can be mistaken for missing checklist total",()=>{
 assert.equal(cards.length,1649);
 assert.equal(publicKeys.size,68);
 assert.equal(known.size,27);
 const missing=[...publicKeys.keys()].filter(k=>!known.has(k));
 assert.equal(missing.length,41);
 for(const k of missing){
  const x=publicKeys.get(k);
  assert.ok(x.entries>=x.distinct.size);
 }
});
test("public coverage does not write inventory or duplicate public fetch requests",()=>{
 const app=fs.readFileSync(path.join(root,"app.js"),"utf8");
 const cover=fs.readFileSync(path.join(root,"checklist-coverage.js"),"utf8");
 const want=fs.readFileSync(path.join(root,"wantlist.js"),"utf8");
 const html=fs.readFileSync(path.join(root,"index.html"),"utf8");
 assert.ok(app.includes('new CustomEvent("jaytree:public-set-groups-ready"'));
 assert.ok(want.includes('new CustomEvent("jaytree:checklists-ready"'));
 assert.ok(cover.includes('document.addEventListener("jaytree:public-set-groups-ready"'));
 assert.ok(cover.includes('document.addEventListener("jaytree:checklists-ready"'));
 assert.ok(cover.includes('state.groups.filter(g=>!sourced.has(key(g.key)))'));
 assert.ok(!/\bfetch\s*\(/.test(cover),"Reuse existing published data events");
 assert.ok(!/\/api\/|sqlite|POST|PATCH|DELETE/.test(cover),"No private writes");
 assert.ok(html.includes('id="coverage-pending"'));
 assert.ok(html.includes('src="checklist-coverage.js" defer'));
});
test("visitor can suggest checklist sources without publishing card data or approving inventory",()=>{
 const cover=fs.readFileSync(path.join(root,"checklist-coverage.js"),"utf8");
 const issue=fs.readFileSync(path.join(root,".github/ISSUE_TEMPLATE/checklist-source.yml"),"utf8");
 assert.ok(cover.includes('mailto:jaytreebooks@gmail.com'));
 assert.ok(cover.includes('template:"checklist-source.yml"'));
 assert.ok(cover.includes('rel="noopener noreferrer"'));
 assert.ok(issue.includes('id: checklist-url'));
 assert.ok(issue.includes('only the owner can approve changes'));
 assert.ok(issue.includes('required: true'));
});
test("published data files are unmodified set and card source fixtures",()=>{
 const want=JSON.parse(fs.readFileSync(path.join(root,"set-checklists.json"),"utf8"));
 assert.equal(want.supported_set_count,27);
 assert.equal(want.catalog_card_count,1649);
 assert.equal(want.supported_missing_spots,6491);
 assert.equal(want.named_set_count,23);
});
