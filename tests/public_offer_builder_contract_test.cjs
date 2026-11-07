const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,".."),read=f=>fs.readFileSync(path.join(root,f),"utf8");
const html=read("index.html"),js=read("wantlist.js"),yaml=read(".github/ISSUE_TEMPLATE/missing-card-offer.yml");
test("inquiry composer offers condition, variation, price, HTTPS photo, notes without new endpoint",()=>{
 for(const id of ["offer-dialog","offer-form","offer-condition","offer-variation","offer-asking-price",
  "offer-photo-url","offer-note","offer-public-ok","offer-email-out","offer-github-out","offer-error"])
  assert.ok(html.includes('id="'+id+'"'),id);
 assert.ok(html.includes('id="offer-photo-url" type="url"'));
 assert.ok(html.includes('id="offer-public-ok" type="checkbox"'));
 assert.equal((js.match(/\bfetch\s*\(/g)||[]).length,1);
 assert.ok(!/\/api\/|sqlite|\/owner\//.test(js));
});
test("GitHub issue template supports matching prefilled text IDs and public notice",()=>{
 for(const id of ["set-name","card-number","card-name","set-link","condition",
    "variation","asking-price","photo-url","offer-details","privacy-confirmation"])
  assert.ok(yaml.includes("id: "+id),id);
 assert.ok(yaml.includes("This is a public GitHub issue"));
 assert.ok(yaml.includes("No purchase")||yaml.includes("no purchase"));
 assert.ok(js.includes('params.searchParams.set("variation",v.variation)'));
 assert.ok(js.includes('params.searchParams.set("photo-url",v.photo)'));
 assert.ok(js.includes('params.searchParams.set("offer-details",v.details)'));
});
test("form consent and photo validation never create false send or allow executable URLs",()=>{
 assert.ok(js.includes('parsed.protocol==="https:"'));
 assert.ok(js.includes('!parsed.username&&!parsed.password'));
 assert.ok(js.includes('host==="localhost"'));
 assert.ok(js.includes('host.endsWith(".local")'));
 assert.ok(js.includes('host.includes(":")'));
 assert.ok(js.includes('$("offer-public-ok").checked&&issueUrl.length<=3500'));
 assert.ok(js.includes('github.setAttribute("aria-disabled","true")'));
 assert.ok(js.includes('email.removeAttribute("href")'));
 assert.ok(js.includes('github.removeAttribute("href")'));
 assert.ok(js.includes('issue.target="_blank";issue.rel="noopener noreferrer"'));
 assert.ok(js.includes('currentOffer=null'));
});
test("coverage subscribes to data events before both async loaders",()=>{
 assert.ok(html.indexOf('src="checklist-coverage.js" defer')<html.indexOf('src="app.js" defer'));
 assert.ok(html.indexOf('src="checklist-coverage.js" defer')<html.indexOf('src="wantlist.js" defer'));
});
test("preexisting 27 sourced checklists and 1006 public cards unchanged",()=>{
 const sets=JSON.parse(read("set-checklists.json"));
 const cards=JSON.parse(read("catalog.json"));
 assert.equal(sets.supported_set_count,27);
 assert.equal(cards.cards.length,1006);
 assert.equal(sets.supported_missing_spots,6513);
});
