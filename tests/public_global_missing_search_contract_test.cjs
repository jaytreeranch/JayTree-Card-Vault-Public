const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=(f)=>fs.readFileSync(path.join(root,f),"utf8");
const data=JSON.parse(read("set-checklists.json"));
const all=data.sets.flatMap(s=>s.missing_cards.map(card=>({s,card})));
const matches=q=>{
 const words=q.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
 return all.filter(({s,card:c})=>{
  const num=String(c.number).toLocaleLowerCase();
  const content=[c.player||"",c.team||"",num,s.sport,s.year,s.brand,s.set].join(" ").toLocaleLowerCase();
  return words.every(w=>w.startsWith("#")?num===w.slice(1):content.includes(w));
 });
};
test("approved public missing spots include named and unnamed; never invent missing names",()=>{
 assert.equal(data.supported_set_count,27);
 assert.equal(all.length,6491);
 assert.equal(all.filter(({card})=>!card.player).length,2166);
});
test("search supports player, team, and exact printed number without guessing variants",()=>{
 const brock=matches("Brock Bowers");
 assert.equal(brock.length,2);
 assert.deepEqual(new Set(brock.map(({card})=>card.number)),new Set(["6","11"]));
 assert.equal(matches("#6").length,19);
 assert.ok(matches("#6").every(({card})=>card.number==="6"));
 assert.equal(matches("Williams").length,60);
 assert.equal(matches("Mahomes").length,6);
});
test("global search is read-only, capped per render, and avoids additional HTTP requests",()=>{
 const js=read("wantlist.js");
 const html=read("index.html");
 assert.ok(js.includes("function searchAllMissing()"));
 assert.ok(js.includes("function renderGlobalMissing()"));
 assert.ok(js.includes("Math.min(matches.length,state.globalVisible)"));
 assert.ok(js.includes("state.globalVisible=PAGE"));
 assert.ok(js.includes("state.globalVisible+=PAGE"));
 assert.ok(js.includes("openSet(s)"));
 assert.ok(js.includes('c.number.toLocaleLowerCase()===exact'));
 assert.ok(html.includes('id="want-global-search"'));
 assert.ok(html.includes('id="want-global-more"'));
 assert.equal((js.match(/fetch\s*\(/g)||[]).length,1);
 assert.ok(!/\/api\/|\/owner\/|sqlite|method:\s*["']POST["']/.test(js));
});
test("existing public email/github per-missing-card offer remains suggest-only",()=>{
 const js=read("wantlist.js");
 assert.ok(js.includes('mailto:jaytreebooks@gmail.com'));
 assert.ok(js.includes('template:"missing-card-offer.yml"'));
 assert.ok(js.includes('issue.target="_blank";issue.rel="noopener noreferrer"'));
 assert.ok(js.includes("This is an inquiry only, not an accepted transaction."));
});
