const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,".."),read=n=>fs.readFileSync(path.join(root,n),"utf8");
const js=read("app.js"),css=read("styles.css");
const detail=js.slice(js.indexOf("function renderDetailPhoto(picture,c){"),js.indexOf("function details(c){"));
test("public gallery image loading hints and network error handler install before src",()=>{
 const start=js.indexOf('if(!$("gallery-low-data-toggle").checked)');
 const end=js.indexOf('}else{',start);
 const gallery=js.slice(start,end);
 for(const snippet of ['img.loading="lazy";img.decoding="async";img.fetchPriority="low"',
 'img.addEventListener("error"','img.remove();','Photo temporarily unavailable. Open card for retry.',
 'card-photo-unavailable','img.src=c.image'])assert.ok(gallery.includes(snippet),snippet);
 assert.ok(gallery.indexOf('img.addEventListener("error"')<gallery.indexOf('img.src=c.image'));
 assert.ok(gallery.indexOf('img.loading="lazy"')<gallery.indexOf('img.src=c.image'));
 assert.ok(gallery.includes('fallback.setAttribute("aria-hidden","true")'));
 assert.ok(gallery.includes('btn.setAttribute("aria-label","View "+cardName+" card details; photo temporarily unavailable")'));
});
test("detail image retains card content, user retry only and safe approved front path",()=>{
 assert.ok(detail.includes('const approved=safeImage(c.image)'));
 assert.ok(detail.includes('Card photo unavailable; card details are still available.'));
 assert.ok(detail.includes('role","status'));
 assert.ok(detail.includes('img.loading="eager";img.decoding="async";img.fetchPriority="high"'));
 assert.ok(detail.includes('retry.addEventListener("click"'));
 assert.ok(detail.includes('img.src=approved+(retryRequest?"?retry="+Date.now()+"-"+attempts:"")'));
 assert.ok(detail.includes('if(attempts>=2)return'));
 assert.ok(detail.includes('retry.hidden=attempts>=2'));
 assert.ok(js.includes('renderDetailPhoto(picture,c);'));
 assert.ok(!detail.includes('fetch('));
});
test("broken-photo placeholders and retry are keyboard reachable, bounded and readable",()=>{
 assert.ok(css.includes('.card-photo-unavailable{'));
 assert.ok(css.includes('.detail-photo-status:not([hidden])'));
 assert.ok(css.includes('.detail-photo-retry:not([hidden])'));
 assert.ok(css.includes('min-height:44px'));
 assert.ok(css.includes('.detail-photo-retry:focus-visible'));
 assert.ok(js.includes('status.textContent=attempts>=2?'));
 assert.ok(js.includes('Please try again later'));
 assert.ok(js.includes('retry.type="button";retry.hidden=true;'));
});
test("no new API, extra background reload, approved static data remains immutable",()=>{
 assert.equal((js.match(/\bfetch\s*\(/g)||[]).length,1);
 assert.ok(!js.includes('setInterval('));
 assert.ok(!/sendBeacon|\/api\/cards|\/owner\//.test(detail));
 assert.ok(js.includes('/^assets\\/[a-f0-9]{24}\\.jpg$/.test(path)'));
 const cat=JSON.parse(read("catalog.json"));
 const sets=JSON.parse(read("set-checklists.json"));
 assert.equal(cat.cards.length,1006);
 assert.equal(sets.supported_set_count,27);
 assert.equal(sets.supported_missing_spots,6513);
});
