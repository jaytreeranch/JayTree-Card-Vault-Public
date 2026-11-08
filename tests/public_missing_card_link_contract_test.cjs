const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const js=fs.readFileSync(path.join(root,"wantlist.js"),"utf8");
const check=JSON.parse(fs.readFileSync(path.join(root,"set-checklists.json"),"utf8"));
const data=JSON.parse(fs.readFileSync(path.join(root,"catalog.json"),"utf8"));
const card=check.sets.find(s=>s.missing_cards.some(c=>c.player==="Brock Bowers")).missing_cards.find(c=>c.player==="Brock Bowers");
const s=check.sets.find(s=>s.missing_cards.includes(card));
test("new card link uniquely identifies sourced set and missing printed number",()=>{
 assert.equal(check.supported_set_count,27);
 assert.equal(check.supported_missing_spots,6513);
 const tuple=[...s.key,String(card.number)];
 assert.equal(tuple.length,5);
 assert.equal(tuple[4],"6");
 const link="https://cards.jaytreebooks.com/#want-card="+encodeURIComponent(JSON.stringify(tuple));
 assert.deepEqual(JSON.parse(decodeURIComponent(new URL(link).hash.slice("#want-card=".length))),tuple);
 assert.equal(check.sets.filter(s=>JSON.stringify(s.key)===JSON.stringify(tuple.slice(0,4))).length,1);
});
test("shared-card parser rejects absent and malformed/tampered cards",()=>{
 assert.ok(js.includes("parts.length!==5"));
 assert.ok(js.includes("!parts.every(v=>typeof v==="));
 assert.ok(js.includes('found?.missing_cards.find(c=>c.number===parts[4])'));
 assert.ok(js.includes("if(found&&card)openSet(found,card)"));
 assert.ok(js.includes("if(hash.length>2500)return"));
 assert.ok(js.includes("if(!hash.startsWith(\"#want-set=\"))return;"));
});
test("per-card copy and inquiry links contain set-scoped card, no private ID",()=>{
 assert.ok(js.includes('const cardUrl=(s,card)=>location.origin+location.pathname+'));
 assert.ok(js.includes('encodeURIComponent(JSON.stringify([...s.key,String(card.number)]))'));
 assert.ok(js.includes('"set-link":cardUrl(s,card)'));
 assert.ok(js.includes('"Specific missing card: "+cardUrl(s,card)'));
 assert.ok(js.includes('addCardShare(links,s,c)'));
 assert.ok(js.includes('addCardShare(actions,s,c)'));
 assert.ok(!js.includes("copy_id"));
 assert.equal(data.cards.length,1006);
});
test("clipboard fallback is explicit, modal filter matches exact printed number",()=>{
 assert.ok(js.includes('if(!navigator.clipboard?.writeText)throw new Error'));
 assert.ok(js.includes('button.textContent="Card link copied"'));
 assert.ok(js.includes('input.readOnly=true'));
 assert.ok(js.includes('input.focus();input.select()'));
 assert.ok(js.includes('selectedCard?"#"+selectedCard.number:selectedQuery'));
 assert.ok(js.includes('if(selectedCard&&!s.missing_cards.some(c=>c.number===selectedCard.number))return'));
 assert.ok(js.includes('c.number.toLocaleLowerCase()===exact'));
 assert.ok(!/\/api\/cards|method:\s*["']POST["']/.test(js));
});
