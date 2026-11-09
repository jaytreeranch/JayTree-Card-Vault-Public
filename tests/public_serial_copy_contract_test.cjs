const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.join(__dirname,"..");
const scope={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,"card-features.js"),"utf8"),scope);
const {serialInfo,classify}=scope.window.JayTreeCardFeatures;
const catalog=JSON.parse(fs.readFileSync(path.join(root,"catalog.json"),"utf8"));
test("checklist number is never an owned serial",()=>{
 const card={number:"185",parallel:"Example Parallel /325"};
 const info=serialInfo(card);
 assert.equal(info.numbered,true);assert.equal(info.edition,325);
 assert.equal(info.stamps.length,0);assert.equal(info.needsReview,false);
 assert.equal(classify(card).serial,true);
 assert.equal(serialInfo({number:"42"}).numbered,false);
});
test("approved copy stamp is rendered only when valid and consistent",()=>{
 const info=serialInfo({parallel:"Example Parallel /325",public_serial_copies:[{number:42,out_of:325}]});
 assert.deepEqual(Array.from(info.stamps),["42/325"]);
 assert.equal(info.edition,325);
 assert.equal(serialInfo({serial_number:"42/325"}).stamps[0],"42/325");
 assert.equal(serialInfo({serial_number:"326/325"}).stamps.length,0);
 assert.equal(serialInfo({parallel:"/325",public_serial_copies:[{number:42,out_of:250}]}).needsReview,true);
 const invalid=serialInfo({parallel:"/325",public_serial_copies:[{number:42,out_of:325},{number:0,out_of:325}]});
 assert.equal(invalid.needsReview,true);assert.equal(invalid.stamps.length,0);
 const malformed=serialInfo({parallel:"/325",serial_number:"326/325"});
 assert.equal(malformed.needsReview,true);assert.equal(malformed.stamps.length,0);
});
test("distinct physical stamped copies display separately, duplicates quarantined",()=>{
 const info=serialInfo({parallel:"/325",quantity:2,public_serial_copies:[{number:7,out_of:325},{number:42,out_of:325}]});
 assert.deepEqual(Array.from(info.stamps),["7/325","42/325"]);
 const dup=serialInfo({public_serial_copies:[{number:42,out_of:325},{number:42,out_of:325}]});
 assert.equal(dup.needsReview,true);assert.equal(dup.stamps.length,0);
});
test("unapproved owner data and catalog-only edition never reveal private copy fields",()=>{
 const c={number:"185",parallel:"Example Parallel /325",private_serial:"42/325",copy_id:"PRIVATE_TEST_ONLY",serial_owned:42};
 assert.equal(serialInfo(c).stamps.length,0);
 assert.equal(serialInfo(c).edition,325);
 assert.equal(catalog.cards.length,1649);
 assert.equal(catalog.cards.filter(x=>serialInfo(x).stamps.length).length,0);
});
test("display layer includes serial copy field without making public editable",()=>{
 const app=fs.readFileSync(path.join(root,"app.js"),"utf8");
 assert.ok(app.includes('"Owned stamped copy"'));
 assert.ok(app.includes('"Stamped "+stamped.join(", ")'));
 assert.ok(app.includes('"Stamped serial number"'));
 assert.ok(!app.includes('fetch("/api/cards/'));
});
