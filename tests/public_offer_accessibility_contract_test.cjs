const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,".."),read=n=>fs.readFileSync(path.join(root,n),"utf8");
const html=read("index.html"),js=read("wantlist.js"),css=read("wantlist.css");
test("unavailable outgoing offer actions are keyboard-reachable and describe why",()=>{
 assert.ok(html.includes('id="offer-email-out" href="#" class="offer-email-out" tabindex="0"'));
 assert.ok(html.includes('id="offer-github-out" class="offer-github-out" role="link" tabindex="0"'));
 assert.ok(html.includes('aria-describedby="offer-github-help"'));
 assert.ok(html.includes('aria-describedby="offer-email-help"'));
 assert.ok(html.includes('id="offer-github-help"'));
 assert.ok(html.includes('id="offer-email-help"'));
 assert.ok(js.includes('github.setAttribute("aria-disabled","true")'));
 assert.ok(js.includes('email.setAttribute("aria-disabled","true")'));
 assert.ok(js.includes('github.setAttribute("aria-disabled","false")'));
 assert.ok(js.includes('email.setAttribute("aria-disabled","false")'));
});
test("bad photo URL is announced as invalid with existing error status, then clears",()=>{
 assert.ok(html.includes('id="offer-photo-url" type="url"'));
 assert.ok(html.includes('aria-invalid="false" aria-describedby="offer-photo-help offer-error"'));
 assert.ok(html.includes('id="offer-error" class="offer-error" aria-live="polite"'));
 assert.ok(js.includes('photoInput.setAttribute("aria-invalid",String(!photoOK))'));
 assert.ok(js.includes('"offer-photo-url").setCustomValidity("")'));
 assert.ok(js.includes('"offer-photo-url").setAttribute("aria-invalid","false")'));
});
test("no third-party script, new fetch, autosubmit, copy identifiers or LAN private endpoints",()=>{
 assert.equal((js.match(/\bfetch\s*\(/g)||[]).length,1);
 assert.ok(!/\/api\/|\/owner\/|sqlite|copy_id|method:\s*["']POST["']/.test(js));
 assert.ok(!html.includes('axe.min.js'));
 assert.ok(css.includes('.offer-action-item'));
 const cards=JSON.parse(read("catalog.json"));
 const sets=JSON.parse(read("set-checklists.json"));
 assert.equal(cards.cards.length,1649);
 assert.equal(sets.supported_set_count,27);
});
