const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const root=path.join(__dirname,"..");
const html=fs.readFileSync(path.join(root,"index.html"),"utf8");
const app=fs.readFileSync(path.join(root,"app.js"),"utf8");
const want=fs.readFileSync(path.join(root,"wantlist.js"),"utf8");
test("feature detector loads before gallery app, with strict self-only CSP",()=>{
 assert.ok(html.indexOf('src="card-features.js"')<html.indexOf('src="app.js"'));
 assert.ok(html.includes("script-src 'self'"));
 assert.ok(!html.includes("unsafe-inline"));
});
test("all six checkboxes are wired to gallery results",()=>{
 for(const k of ["parallel","serial","autograph","patch","memorabilia","rookie"]){
  assert.ok(html.includes('value="'+k+'" data-feature'),k);
 }
 assert.ok(app.includes("features.matchesAny(c,anyFeatures)"));
 assert.ok(app.includes('document.querySelectorAll(\'input[data-feature]\')'));
 assert.ok(app.includes('refreshFeatureCounts();'));
 assert.ok(html.includes('id="feature-clear"'));
});
test("set sharing copies a stable URL without changing the modal hash",()=>{
 assert.ok(want.includes('navigator.clipboard.writeText(url)'));
 assert.ok(want.includes('manual.select();'));
 assert.ok(!want.includes('"Share this missing-card list"'));
});
test("public page has no private edit or direct database endpoint",()=>{
 assert.ok(!html.includes("/api/cards/"));
 assert.ok(!html.includes("sqlite"));
 assert.ok(!app.includes("fetch('/api/"));
});
