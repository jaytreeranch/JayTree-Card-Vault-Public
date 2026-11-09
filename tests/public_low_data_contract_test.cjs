const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=n=>fs.readFileSync(path.join(root,n),"utf8");
const js=read("app.js"),html=read("index.html"),style=read("styles.css");
test("low-data view explicit, keyboard-operable and clearly described",()=>{
 assert.ok(html.includes('id="gallery-low-data-toggle"'));
 assert.ok(html.includes('id="gallery-low-data-help"'));
 assert.ok(html.includes('aria-describedby="gallery-low-data-help"'));
 assert.ok(html.includes('id="gallery-low-data-status"'));
 assert.ok(html.includes('aria-live="polite"'));
 assert.ok(style.includes(".card-photo-deferred"));
 assert.ok(style.includes(".gallery-low-data input:focus-visible"));
});
test("only explicit browser Save-Data preference opts in automatically, no tracking",()=>{
 assert.ok(js.includes('navigator.connection?.saveData===true'));
 assert.ok(js.includes('$("gallery-low-data-toggle").checked='));
 assert.ok(js.includes('addEventListener("change",()=>updateLowDataView(true))'));
 assert.ok(!/localStorage|sessionStorage|sendBeacon|navigator\.serviceWorker/.test(js));
});
test("skip gallery image network sources yet always retain full photo on demand",()=>{
 assert.ok(js.includes('if(!$("gallery-low-data-toggle").checked)'));
 assert.ok(js.includes('img.loading="lazy"'));
 assert.ok(js.includes('text(pic,"span","Open for photo","card-photo-deferred")'));
 assert.ok(js.includes('function updateLowDataView(announce=false)'));
 assert.ok(js.includes('state.rendered=0;'));
 assert.ok(js.includes('renderCards();'));
 assert.ok(js.includes("renderDetailPhoto(picture,c);"));
 assert.ok(js.includes('img.className="detail-photo";'));
 assert.ok(js.includes('img.loading="eager";img.decoding="async";img.fetchPriority="high";'));
 assert.ok(!js.includes('img.src=null'));
});
test("unchanged approved 1,649-card snapshot and set denominators; no new fetch or owner API",()=>{
 const c=JSON.parse(read("catalog.json")),s=JSON.parse(read("set-checklists.json"));
 assert.equal(c.cards.length,1649);
 assert.equal(s.supported_set_count,27);
 assert.equal(s.supported_missing_spots,6491);
 assert.equal((js.match(/\bfetch\s*\(/g)||[]).length,3);
 assert.ok(!/\/api\/|\/owner\//.test(js)&&js.includes("https://formsubmit.co/ajax/jaytreebooks@gmail.com"));
});
