const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,".."),read=n=>fs.readFileSync(path.join(root,n),"utf8");
const js=read("wantlist.js"),html=read("index.html");
test("Share only appears when a browser offers the native Web Share API",()=>{
 assert.ok(html.includes('id="wantlist-native-share" type="button"'));
 assert.ok(html.includes('hidden>Share matching cards</button>'));
 assert.ok(html.includes('Nothing is sent automatically.'));
 assert.ok(js.includes('nativeShare.hidden=typeof navigator.share!=="function"'));
 assert.ok(js.includes('nativeShare.disabled=shareButton.disabled'));
 assert.ok(js.includes('addEventListener("click",nativeShareMatching)'));
 assert.ok(js.includes('addEventListener("click",copyMatchingMessage)'));
});
test("Web Share receives the same source-backed filtered public message; only direct visitor action",()=>{
 const handler=js.slice(js.indexOf("async function nativeShareMatching()"),js.indexOf("// Always quote cells"));
 assert.ok(handler.includes('if(!s||!state.sets.includes(s)||!$("wantlist-dialog").open'));
 assert.ok(handler.includes('if(q&&!safeShareQuery(q))return;'));
 assert.ok(handler.includes('const matches=matchingMissing(s);'));
 assert.ok(handler.includes('if(!matches.length)return;'));
 assert.ok(handler.includes('const message=shareMessage(s,matches,q);'));
 assert.ok(handler.includes('await navigator.share({title:"JayTree Card Vault - "+title(s),text:message})'));
 assert.equal(handler.indexOf("await navigator.share("),handler.indexOf("await "), "No await before native share user-gesture call");
 assert.ok(!handler.includes("navigator.clipboard.writeText"));
});
test("Canceled, failed and stale async native Share outcomes stay truthful",()=>{
 const handler=js.slice(js.indexOf("async function nativeShareMatching()"),js.indexOf("// Always quote cells"));
 assert.ok(handler.includes('const attempt=shareGeneration;'));
 assert.ok(handler.includes('const stillCurrent=()=>attempt===shareGeneration&&state.selected===s'));
 assert.equal((handler.match(/if\(!stillCurrent\(\)\)return;/g)||[]).length,2);
 assert.ok(handler.includes('error?.name==="AbortError"'));
 assert.ok(handler.includes('Share menu closed or canceled'));
 assert.ok(handler.includes('Use Copy message instead.'));
 assert.ok(handler.includes('Any actual sending is controlled by the app you chose.'));
 assert.ok(!handler.includes('Message sent'));
});
test("No read-only boundary regression or private data/API changes",()=>{
 const catalog=JSON.parse(read("catalog.json"));
 const lists=JSON.parse(read("set-checklists.json"));
 assert.equal(catalog.cards.length,1006);
 assert.equal(lists.supported_set_count,27);
 assert.equal(lists.supported_missing_spots,6513);
 assert.equal((js.match(/\bfetch\s*\(/g)||[]).length,1);
 assert.ok(!/localStorage|sessionStorage|sendBeacon|\/api\/cards|\/owner\//.test(js));
});
