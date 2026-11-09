const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,".."),read=n=>fs.readFileSync(path.join(root,n),"utf8");
const js=read("app.js"),html=read("index.html"),css=read("styles.css");
test("collection browse controls have accessible summary, one-click reset and mobile touch target",()=>{
 assert.ok(html.includes('id="collection-browse-status" role="status" aria-live="polite"'));
 assert.ok(html.includes('id="collection-browse-reset" type="button" aria-disabled="true"'));
 assert.ok(html.includes('aria-describedby="collection-browse-status"'));
 assert.ok(css.includes(".collection-browse-tools button{min-height:42px"));
 assert.ok(css.includes(".collection-browse-tools button:focus-visible"));
});
test("clear resets search, gallery dropdowns, feature flags, offers and set finder without changing low-data",()=>{
 assert.ok(js.includes('function clearBrowseControls(){'));
 for(const id of ["search","sport","review","year","set","set-finder"])assert.ok(js.includes('"'+id+'"'));
 assert.ok(js.includes('$("sort").value="name"'));
 assert.ok(js.includes('$("set-sort").value="year"'));
 assert.ok(js.includes('$("offers").checked=false'));
 assert.ok(js.includes('document.querySelectorAll("input[data-feature]").forEach(cb=>cb.checked=false)'));
 assert.ok(js.includes("refreshSetOptionLabels();"));
 assert.ok(js.includes("filtered();"));
 const fn=js.slice(js.indexOf("function clearBrowseControls()"),js.indexOf("function filtered()"));
 assert.ok(!fn.includes('gallery-low-data-toggle'));
});
test("existing filter events and source-backed set choices remain intact",()=>{
 assert.ok(js.includes('function customizedBrowseCount()'));
 assert.ok(js.includes('updateBrowseSummary();'));
 assert.ok(js.includes('addEventListener("click",clearBrowseControls)'));
 assert.ok(js.includes('$("collection-browse-reset").setAttribute("aria-disabled",String(count===0))'));
 assert.ok(js.includes('const selected=state.cards.filter(c =>'));
 const catalog=JSON.parse(read("catalog.json"));
 const lists=JSON.parse(read("set-checklists.json"));
 assert.equal(catalog.cards.length,1649);
 assert.equal(lists.supported_set_count,27);
});
test("no new public write endpoints, tracking, background service or private IDs",()=>{
 assert.equal((js.match(/\bfetch\s*\(/g)||[]).length,3);
 assert.ok(!js.includes("localStorage")&&!js.includes("sessionStorage"));
 assert.ok(js.includes('method:"POST"')&&js.includes('https://formsubmit.co/ajax/jaytreebooks@gmail.com')&&!js.includes("/api/cards"));
 assert.ok(html.includes('id="gallery-low-data-toggle"'));
});
