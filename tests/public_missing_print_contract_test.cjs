const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,".."),read=x=>fs.readFileSync(path.join(root,x),"utf8");
const html=read("index.html"),js=read("wantlist.js"),css=read("wantlist.css");
test("Native print is an explicit, accessible action alongside sourced CSV download",()=>{
 assert.ok(html.includes('id="wantlist-print" aria-describedby="wantlist-export-help"'));
 assert.ok(html.includes('id="want-print-content" aria-label="Printable public missing-card checklist" hidden'));
 assert.ok(js.includes('$("wantlist-print").addEventListener("click",printMissing)'));
 assert.ok(js.includes('if(!s||!state.sets.includes(s)||!$("wantlist-dialog").open)return'));
 assert.ok(js.includes('if(!matches.length)return'));
 assert.ok(js.includes('try{window.print();}catch{clearPrintSheet();}'));
 assert.ok(js.includes('window.addEventListener("afterprint",clearPrintSheet)'));
 assert.ok(js.includes('$("wantlist-dialog").addEventListener("close",()=>{'));
 assert.ok(js.includes('if(!$("wantlist-dialog").open)clearPrintSheet()'));
});
test("Complete matching set, including beyond first page, and public provenance only",()=>{
 assert.ok(js.includes('const matches=matchingMissing(s)'));
 assert.ok(js.includes('for(const card of matches)'));
 assert.ok(js.includes('const printButton=$("wantlist-print")'));
 assert.ok(js.includes('printButton.disabled=items.length===0'));
 assert.ok(js.includes('sourceValid(s.source.url)'));
 assert.ok(js.includes('Set link: "+setUrl(s)'));
 assert.ok(js.includes('card.player||"Not independently named"'));
 assert.ok(js.includes('Identity caution: player/team names may be provisional'));
 assert.ok(js.includes('Duplicate')===false||js.includes('duplicate'));
 assert.ok(js.includes('text(tr,"td","#"+card.number)'));
});
test("Print-only white page hides external UI and repeats table header across pages",()=>{
 assert.ok(css.includes('@media print'));
 assert.ok(css.includes('body.print-wantlist > *:not(#wantlist-dialog){display:none!important}'));
 assert.ok(css.includes('#wantlist-dialog .want-dialog > :not(#want-print-content){display:none!important}'));
 assert.ok(css.includes('#want-print-content thead{display:table-header-group}'));
 assert.ok(css.includes('break-inside:avoid'));
 assert.ok(css.includes('body.print-wantlist #want-print-content{display:block!important'));
});
test("Still 1,649 approved published cards, 27 sourced sets, no private writers",()=>{
 const cat=JSON.parse(read("catalog.json")),sets=JSON.parse(read("set-checklists.json"));
 assert.equal(cat.cards.length,1649);
 assert.equal(sets.supported_set_count,27);
 assert.equal(sets.supported_missing_spots,6491);
 assert.equal((js.match(/\bfetch\s*\(/g)||[]).length,1);
 assert.ok(!/\/api\/cards|\/owner\/|localStorage|sessionStorage|sendBeacon/.test(js));
});
