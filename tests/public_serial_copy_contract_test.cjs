const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.join(__dirname,"..");
const scope={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,"card-features.js"),"utf8"),scope);
const {serialInfo,classify}=scope.window.JayTreeCardFeatures;
const catalog=JSON.parse(fs.readFileSync(path.join(root,"catalog.json"),"utf8"));
test("checklist number is never an owned serial",()=>{
 const card={number:"185",parallel:"Gold Stars /325"};
 const info=serialInfo(card);
 assert.equal(info.numbered,true);assert.equal(info.edition,325);
 assert.equal(info.stamps.length,0);assert.equal(info.needsReview,false);
 assert.equal(classify(card).serial,true);
 assert.equal(serialInfo({number:"212"}).numbered,false);
});
test("approved copy stamp is rendered only when valid and consistent",()=>{
 const info=serialInfo({parallel:"Gold Stars /325",public_serial_copies:[{number:212,out_of:325}]});
 assert.deepEqual(Array.from(info.stamps),["212/325"]);
 assert.equal(info.edition,325);
 assert.equal(serialInfo({serial_number:"212/325"}).stamps[0],"212/325");
 assert.equal(serialInfo({serial_number:"326/325"}).stamps.length,0);
 assert.equal(serialInfo({public_serial_copies:[{number:400,out_of:325}]}).needsReview,true);
 assert.equal(serialInfo({parallel:"/325",public_serial_copies:[{number:212,out_of:250}]}).needsReview,true);
});
test("distinct physical stamped copies display separately, duplicates quarantined",()=>{
 const info=serialInfo({parallel:"/325",quantity:2,public_serial_copies:[{number:7,out_of:325},{number:212,out_of:325}]});
 assert.deepEqual(Array.from(info.stamps),["7/325","212/325"]);
 const dup=serialInfo({public_serial_copies:[{number:212,out_of:325},{number:212,out_of:325}]});
 assert.equal(dup.needsReview,true);assert.equal(dup.stamps.length,0);
});
test("unapproved owner data and catalog-only edition never reveal private copy fields",()=>{
 const c={number:"185",parallel:"Gold Stars /325",private_serial:"212/325",copy_id:"SECRET",serial_owned:212};
 assert.equal(serialInfo(c).stamps.length,0);
 assert.equal(serialInfo(c).edition,325);
 assert.equal(catalog.cards.length,1006);
 assert.equal(catalog.cards.filter(x=>serialInfo(x).stamps.length).length,0);
});
test("display layer includes serial copy field without making public editable",()=>{
 const app=fs.readFileSync(path.join(root,"app.js"),"utf8");
 assert.ok(app.includes('"Owned stamped copy"'));
 assert.ok(app.includes('"Stamped "+stamped.join(", ")'));
 assert.ok(app.includes('"Stamped serial number"'));
 assert.ok(!app.includes('fetch("/api/cards/'));
});
