const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,"..");
const read=name=>fs.readFileSync(path.join(root,name),"utf8");
const cards=JSON.parse(read("catalog.json"));
const pos=JSON.parse(read("player-positions.json"));
const html=read("index.html"),app=read("app.js"),styles=read("styles.css");
const context={window:{}};
vm.runInNewContext(read("card-features.js"),context);
const feat=context.window.JayTreeCardFeatures;

test("Position source joins exactly current owner-approved PUBLIC catalog without replacing card records",()=>{
 assert.equal(cards.cards.length,1649);
 assert.equal(pos.schema,"jaytree.public-positions.v1");
 assert.equal(pos.catalog_generated_at_utc,cards.generated_at_utc);
 assert.match(pos.source_url,/^https:\/\/github.com\/nflverse\//);
 assert.match(pos.source_sha256,/^[a-f0-9]{64}$/);
 assert.equal(pos.published_football_cards,1159);
 assert.equal(pos.cards_with_position,1032);
 assert.equal(pos.players_with_position,416);
 const uniq=new Set(cards.cards.filter(x=>x.sport==="Football").map(x=>x.player));
 assert.ok(Object.keys(pos.positions_by_name).every(n=>uniq.has(n)));
 assert.equal(cards.cards.filter(x=>x.sport==="Football"&&
   Object.prototype.hasOwnProperty.call(pos.positions_by_name,x.player)).length,1032);
 assert.equal(pos.positions_by_name["Aaron Rodgers"],"QB");
 assert.equal(pos.positions_by_name["Amon-Ra St. Brown"],"WR");
 assert.equal(pos.positions_by_name["Ashton Jeanty"],"RB");
 assert.ok(!("Chad Johnson" in pos.positions_by_name),"Source ambiguous: skip, never guess");
 assert.ok(!("Atlanta Falcons" in pos.positions_by_name),"Team card not a player position");
});

test("Public controls expose independently sourced Team/Position filter and two sort choices",()=>{
 for(const id of ["team","position","position-filter-help"])
   assert.match(html,new RegExp('id="'+id+'"'));
 assert.ok(html.includes('value="team">Team A-Z</option>'));
 assert.ok(html.includes('value="position">Position A-Z</option>'));
 assert.ok(app.includes('function refreshTeamAndPositionOptions()'));
 assert.ok(app.includes('function publicPosition(card)'));
 assert.ok(app.includes('case "team"'));
 assert.ok(app.includes('case "position"'));
 assert.ok(app.includes('(!team || c.team===team) && (!position || publicPosition(c)===position)'));
 assert.ok(app.includes('data.catalog_generated_at_utc!==catalog.generated_at_utc'));
 assert.ok(app.includes('new Map();state.positionReady=false'));
 assert.ok(app.includes('if(computed!==data.cards_with_position||computed<1)'));
 assert.ok(styles.includes('.position-filter-help'));
});

test("Legacy 11-field shared gallery links still restore without deleting modern 13-field options",()=>{
 assert.ok(app.includes('const BROWSE_SCHEMA="jt.public.browse.v1"'));
 assert.ok(app.includes('[11,13,15].includes(v.length)'));
 assert.ok(app.includes('p.length>=13?p[11]:""'));
 assert.ok(app.includes('p.length>=13?p[12]:""'));
 assert.ok(app.includes('$("team").value,$("position").value'));
 assert.ok(app.includes('["team","position"]')||app.includes('"team","position"'));
 assert.ok(app.includes('v[11]&&!state.cards.some'));
 assert.ok(app.includes('v[12]&&!state.cards.some'));
 assert.ok(app.includes('publicPosition(c)===v[12]'));
 assert.ok(!app.includes("sendBeacon"));
});

test("Direct correction uses free HTTPS FormSubmit AJAX, not email app, newsletter or private API",()=>{
 assert.ok(app.includes('"https://formsubmit.co/ajax/jaytreebooks@gmail.com"'));
 assert.ok(app.includes('method:"POST"'));
 assert.ok(app.includes('headers:{"Content-Type":"application/json","Accept":"application/json"}'));
 assert.ok(app.includes('send.textContent="Submit suggestion"'));
 assert.ok(app.includes('response.setAttribute("aria-live","polite")'));
 assert.ok(app.includes('if(submitting||honeypot.value)return;'));
 assert.ok(app.includes('if(assessment.value==="incorrect"&&details.length<8)'));
 assert.ok(app.includes("submit the suggestion. Your text is still here"));
 assert.ok(!app.includes('window.location.href=email'));
 assert.ok(!app.includes('mailto:jaytreebooks@gmail.com'));
 assert.ok(!app.includes('subscriber'));
 assert.ok(!app.includes('api/cards'));
 assert.ok(html.includes("connect-src 'self' https://formsubmit.co;"));
 assert.ok(html.includes("form-action https://formsubmit.co"));
});

test("Published checklist Auto subset does not mean the owned copy is signed",()=>{
 const autolist=cards.cards.filter(x=>/base autographs/i.test(x.set));
 assert.equal(autolist.length,2);
 assert.deepEqual(autolist.map(x=>x.player).sort(),["Craig Morton","James Lofton"]);
 assert.ok(autolist.every(x=>x.review_status==="Needs review"&&x.identity_unconfirmed));
 assert.ok(autolist.every(x=>feat.classify(x).autograph===false));
 assert.equal(cards.cards.filter(x=>feat.classify(x).autograph).length,0);
 assert.ok(feat.classify({sport:"Football",is_autograph:true,identity_unconfirmed:false}).autograph);
 assert.ok(!feat.classify({set:"Base Autographs",identity_unconfirmed:false}).autograph);
});

test("Two published serial-numbered editions including GitHub ticket #3 Justin Herbert Blue /150; no stamped numbers invented",()=>{
 const serial=cards.cards.filter(x=>feat.classify(x).serial);
 assert.equal(serial.length,2);
 assert.deepEqual(serial.map(x=>x.player).sort(),["Justin Herbert","Tory Horton"]);
 const herbert=serial.find(x=>x.player==="Justin Herbert");
 assert.equal(herbert.number,"25ATT-13");
 assert.equal(herbert.parallel,"Blue");
 assert.equal(herbert.review_status,"Needs review");
 assert.equal(feat.serialInfo(herbert).edition,150);
 assert.equal(feat.serialInfo(herbert).stamps.length,0);
 assert.equal(feat.serialInfo(herbert).numbered,true);
 const tory=serial.find(x=>x.player==="Tory Horton");
 assert.equal(feat.serialInfo(tory).edition,325);
 assert.equal(feat.serialInfo(tory).stamps.length,0);
 assert.equal(feat.serialInfo(tory).numbered,true);
 assert.equal(feat.serialInfo({...herbert,parallel:"Pink"}).numbered,false);
 assert.equal(feat.serialInfo({...herbert,number:"25ATT-14"}).numbered,false);
});

test("Published private boundaries and card source integrity unaffected",()=>{
 assert.equal(cards.readonly,true);
 assert.equal(cards.verified_count,621);
 assert.equal(cards.needs_review_count,1028);
 assert.ok(cards.cards.every(x=>x.id&&!Object.hasOwn(x,"storage")));
 assert.ok(!app.includes("192.168."));
 assert.ok(!app.includes("8770"));
 assert.ok(!app.includes("sqlite3"));
 assert.ok(!html.includes("www.kit.com"));
});
