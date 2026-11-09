const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,".."),read=n=>fs.readFileSync(path.join(root,n),"utf8");
const js=read("app.js"),html=read("index.html"),css=read("styles.css");
const handler=js.slice(js.indexOf("async function nativeShareBrowseView()"),js.indexOf("async function copyBrowseViewLink()"));
test("Native collection Share progressive on supported browsers; Copy link remains universal",()=>{
 assert.ok(html.includes('id="collection-native-share" type="button"'));
 assert.ok(html.includes('hidden>Share this view</button>'));
 assert.ok(html.includes('id="collection-view-link" type="button"'));
 assert.ok(html.includes("No message is sent automatically."));
 assert.ok(js.includes('native.hidden=typeof navigator.share!=="function"'));
 assert.ok(js.includes('native.disabled=!publicBrowseUrl();'));
 assert.ok(js.includes('addEventListener("click",nativeShareBrowseView)'));
 assert.ok(js.includes('addEventListener("click",copyBrowseViewLink)'));
 assert.ok(css.includes('#collection-native-share[hidden]{display:none!important;}'));
 assert.ok(css.includes('#collection-native-share:not([hidden]){width:100%;}'));
});
test("Share invoked synchronously on visitor click using same published collection view link and count",()=>{
 assert.ok(handler.includes('typeof navigator.share!=="function"||!state.cards.length'));
 assert.ok(handler.includes('const url=publicBrowseUrl()'));
 assert.ok(handler.includes('const count=state.results.length'));
 assert.ok(handler.includes('const total=state.cards.length'));
 assert.ok(handler.includes('Needs review identifications are provisional'));
 assert.ok(handler.includes('read-only collection snapshot'));
 assert.ok(handler.includes('await navigator.share({title:"JayTree Card Vault - collection view",text:message,url})'));
 assert.equal(handler.indexOf('await '),handler.indexOf('await navigator.share('),"No await before native share gesture");
 assert.ok(!handler.includes('navigator.clipboard.writeText'));
 assert.ok(!handler.includes('/api/cards'));
});
test("Cancel, failure, successful OS handoff, stale completion are truthful; never claim delivery",()=>{
 assert.ok(handler.includes('const attempt=browseShareEpoch;'));
 assert.equal((handler.match(/if\(attempt!==browseShareEpoch\)return;/g)||[]).length,2);
 assert.ok(handler.includes('error?.name==="AbortError"'));
 assert.ok(handler.includes('Share menu closed or canceled'));
 assert.ok(handler.includes('Device sharing was unavailable'));
 assert.ok(handler.includes('Your chosen app controls whether anything was sent.'));
 assert.ok(!handler.includes('Message sent'));
 assert.ok(!handler.includes('localStorage'));
});
test("Read-only public gallery snapshot and approved source unchanged",()=>{
 const c=JSON.parse(read("catalog.json")),sets=JSON.parse(read("set-checklists.json"));
 assert.equal(c.cards.length,1649);
 assert.equal(sets.supported_set_count,27);
 assert.equal(sets.supported_missing_spots,6491);
 assert.equal((js.match(/\bfetch\s*\(/g)||[]).length,3);
 assert.ok(!/sendBeacon|localStorage|sessionStorage|\/api\/cards|\/owner\//.test(handler));
});
