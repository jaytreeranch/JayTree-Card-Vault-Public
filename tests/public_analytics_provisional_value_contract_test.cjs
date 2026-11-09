"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,"..");
const h=fs.readFileSync(path.join(root,"index.html"),"utf8");
const js=fs.readFileSync(path.join(root,"app.js"),"utf8");
const cat=JSON.parse(fs.readFileSync(path.join(root,"catalog.json"),"utf8"));
test("Cloudflare Web Analytics configured for exact Card Vault host with published manual snippet",()=>{
 assert.match(h,/https:\/\/static\.cloudflareinsights\.com\/beacon\.min\.js/);
 assert.match(h,/data-cf-beacon='\{"token":"146b2c8ccd9c441283dc231ed4d139bb","spa":false\}'/);
 assert.equal((h.match(/data-cf-beacon=/g)||[]).length,1);
 assert.equal((h.match(/cloudflareinsights\.com\/beacon\.min\.js/g)||[]).length,1);
});
test("Content Security Policy permits only RUM script and send endpoint, preserving original asset and form restrictions",()=>{
 const csp=h.match(/<meta http-equiv="Content-Security-Policy" content="([^"]+)"/)?.[1]||"";
 assert.match(csp,/default-src 'self'/);
 assert.match(csp,/script-src 'self' https:\/\/static\.cloudflareinsights\.com;/);
 assert.match(csp,/connect-src 'self' https:\/\/formsubmit\.co https:\/\/cloudflareinsights\.com;/);
 assert.match(csp,/object-src 'none'/);
 assert.match(csp,/base-uri 'none'/);
 assert.match(csp,/form-action 'none'/);
 assert.doesNotMatch(csp,/'unsafe-inline'|'unsafe-eval'|\*/);
});
test("Analytics is anonymous aggregate service, not public personal visitor log",()=>{
 assert.equal((h.match(/data-cf-beacon/g)||[]).length,1);
 assert.ok(!js.includes("navigator.geolocation"));
 assert.ok(!js.includes("document.cookie"));
 assert.ok(!js.includes("visitorEmail"));
 assert.ok(!js.includes("localStorage.setItem('visitor"));
});
test("Needs Review cards may display existing provisional prices; no invented prices or approval",()=>{
 assert.ok(js.includes('const provisional=c.review_status!=="Verified"'));
 assert.ok(js.includes('if(provisional&&Number.isFinite(c.estimate_usd))'));
 assert.ok(js.includes("Provisional owner estimate"));
 assert.ok(js.includes("No provisional value published for this card yet"));
 assert.ok(js.includes('fmtUSD(c.estimate_usd)'));
 assert.ok(!js.includes("c.estimate_usd=0"));
 assert.equal(cat.cards.length,1649);
 assert.equal(cat.needs_review_count,1028);
 assert.equal(cat.cards.filter(c=>c.review_status==="Needs review"&&Number.isFinite(c.estimate_usd)).length,0);
});
test("Approved public dataset, screenshot images and card IDs remain unmodified",()=>{
 assert.equal(cat.verified_count,621);
 assert.equal(cat.needs_review_count,1028);
 assert.ok(cat.cards.every(c=>/^[a-f0-9]{24}$/.test(c.id)));
});
