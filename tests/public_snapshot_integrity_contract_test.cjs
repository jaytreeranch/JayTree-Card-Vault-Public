const test=require("node:test"),assert=require("node:assert/strict"),
 fs=require("node:fs"),path=require("node:path"),os=require("node:os"),
 {spawnSync}=require("node:child_process");
const root=path.resolve(__dirname,".."),read=n=>fs.readFileSync(path.join(root,n),"utf8");
const script=path.join(root,"validate_public_snapshot.cjs");
const html=read("index.html"),js=read("app.js"),want=read("wantlist.js"),css=read("styles.css");
function audit(mutator){
 const base=JSON.parse(read("catalog.json")),sets=JSON.parse(read("set-checklists.json"));
 if(mutator)mutator(base,sets);
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),"jt-public-snapshot-"));
 try{
  const c=path.join(temp,"catalog.json"),l=path.join(temp,"sets.json");
  fs.writeFileSync(c,JSON.stringify(base));fs.writeFileSync(l,JSON.stringify(sets));
  const p=spawnSync(process.execPath,[script,"--catalog",c,"--checklists",l,"--json"],
   {encoding:"utf8",timeout:25000});
  assert.ok(p.stdout,p.stderr);
  return {exit:p.status,...JSON.parse(p.stdout)};
 }finally{fs.rmSync(temp,{force:true,recursive:true});}
}
test("Current approved static snapshot is internally consistent and produces read-only audit hashes",()=>{
 const r=audit();
 assert.equal(r.exit,0);assert.equal(r.valid,true);
 assert.equal(r.cards,1006);assert.equal(r.verified,503);assert.equal(r.needs_review,503);
 assert.equal(r.sourced_sets,27);assert.equal(r.missing_numbered_spots,6513);
 assert.match(r.catalog_sha256,/^[a-f0-9]{64}$/);
 assert.match(r.checklists_sha256,/^[a-f0-9]{64}$/);
 assert.match(r.scope,/NOT live owner LAN verification/);
});
for(const [name,mutation,expected] of [
 ["spoofed published card count",(c)=>{c.count++;},"catalog declared count"],
 ["spoofed Verified count",(c)=>{c.verified_count++;},"catalog Verified count"],
 ["stale mismatched snapshot",(_,s)=>{s.generated_at_utc="2026-11-08T18:00:00+00:00";},"timestamps refer to different"],
 ["checklist wrong catalog count",(_,s)=>{s.catalog_card_count++;},"checklist catalog_card_count"],
 ["checklist missing position totals",(_,s)=>{s.supported_missing_spots++;},"checklists declared missing printed spots"],
 ["duplicate public card id",(c)=>{c.cards[1].id=c.cards[0].id;},"catalog duplicate public card id"],
 ["forged image reference",(c)=>{c.cards[0].image="owner/private/front.jpg";},"catalog image path"],
 ["unapproved review status",(c)=>{c.cards[0].review_status="Approved for sale";},"catalog invalid review status"],
 ["duplicate printed missing slot",(_,s)=>{const a=s.sets.find(x=>x.missing_cards.length>=2);a.missing_cards[1].number=a.missing_cards[0].number;},"missing printed numbers invalid"],
 ["readonly switched off",(c)=>{c.readonly=false;},"catalog public read-only schema"]
]){
 test("Reject "+name,()=>{
  const r=audit(mutation);
  assert.equal(r.exit,1);assert.equal(r.valid,false);
  assert.ok(r.errors.some(e=>e.includes(expected)),r.errors.join("; "));
 });
}
test("Public snapshot panel uses metadata and computed public counts; no private LAN status or new HTTP calls",()=>{
 for(const id of ["snapshot-panel","snapshot-title","snapshot-time","snapshot-verified",
   "snapshot-needs-review","snapshot-integrity"])assert.ok(html.includes('id="'+id+'"'),id);
 assert.ok(html.includes('aria-live="polite"'));
 assert.ok(js.includes('function setPublishedCatalog(data)'));
 assert.ok(js.includes('data.verified_count===verified'));
 assert.ok(js.includes('data.needs_review_count===needsReview'));
 assert.ok(js.includes('data.count===data.cards.length'));
 assert.ok(js.includes('date?.getTime()'));
 assert.ok(js.includes('timeZone:"UTC"'));
 assert.ok(js.includes('Catalog and numbered checklist files agree on publication time and card count.'));
 assert.ok(js.includes('This does not confirm the current private Vault.'));
 assert.ok(js.includes('jaytree:public-snapshot-checklists'));
 assert.ok(want.includes('jaytree:public-snapshot-checklists'));
 assert.ok(css.includes(".snapshot-panel{"));
 assert.equal((js.match(/\bfetch\s*\(/g)||[]).length,1);
 assert.equal((want.match(/\bfetch\s*\(/g)||[]).length,1);
 assert.ok(!/192\.168\.|localhost:8770|\/api\/cards/.test(js));
});
