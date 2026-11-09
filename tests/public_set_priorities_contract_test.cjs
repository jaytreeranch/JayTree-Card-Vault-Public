const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,"..");
const text=p=>fs.readFileSync(path.join(root,p),"utf8");
const snapshot=JSON.parse(text("set-checklists.json"));
const sorted=snapshot.sets.filter(x=>x.missing>0)
 .sort((a,b)=>a.missing-b.missing||b.progress_percent-a.progress_percent||a.set.localeCompare(b.set));
test("source-backed completion priorities are Circle K, Chain Reaction, My House",()=>{
 assert.equal(snapshot.supported_set_count,27);
 assert.equal(snapshot.supported_missing_spots,6491);
 // Circle K has now been completed (33/33), and is correctly absent
 // from the priority dashboard of incomplete sets.
 const circle=snapshot.sets.find(s=>s.set.includes("Circle K"));
 assert.equal(circle.owned,33);
 assert.equal(circle.missing,0);
 assert.equal(sorted[0].missing,8);
 assert.equal(sorted[0].set.includes("Chain Reaction"),true);
 assert.equal(sorted[1].missing,9);
 assert.ok(sorted[1].set.includes("My House"));
 assert.ok(!sorted.some(s=>s.set.includes("Circle K")));
});
test("1-2, 3-10 and 11+ sourced missing slot groups exactly partition 27 checklists",()=>{
 const groups={near:snapshot.sets.filter(s=>s.missing>=1&&s.missing<=2).length,
  next:snapshot.sets.filter(s=>s.missing>=3&&s.missing<=10).length,
  other:snapshot.sets.filter(s=>s.missing>=11).length};
 assert.deepEqual(groups,{near:0,next:2,other:24});
 assert.equal(groups.near+groups.next+groups.other,snapshot.sets.filter(s=>s.missing>0).length);
});
test("browser shows only vetted numbered counts without introducing data sources or writers",()=>{
 const html=text("index.html"),js=text("wantlist.js");
 assert.ok(html.includes('id="want-priority-grid"'));
 assert.ok(html.includes('id="wantlist-gap"'));
 assert.ok(html.includes('<option value="percent">Highest completion first</option>'));
 assert.ok(js.includes("state.sets.filter(s=>s.missing>0)"));
 assert.ok(js.includes("a.missing-b.missing"));
 assert.ok(js.includes("s.missing>=1&&s.missing<=2"));
 assert.ok(js.includes("s.owned")+"");
 assert.ok(js.includes('if(order==="percent")'));
 assert.ok(js.includes('btn.type="button";btn.addEventListener("click",()=>openSet(s))'));
 assert.equal((js.match(/\bfetch\s*\(/g)||[]).length,1);
 assert.ok(!/sqlite|\/api\/|\/owner\/|method:\s*["']POST["']/.test(js));
});
test("public backed data files stay at 1649 card entries and supported 27 sourced sets",()=>{
 const cards=JSON.parse(text("catalog.json")).cards;
 assert.equal(cards.length,1649);
 assert.equal(snapshot.sets.length,27);
 assert.equal(new Set(snapshot.sets.map(s=>JSON.stringify(s.key))).size,27);
 assert.equal(snapshot.sets.filter(s=>s.missing===0).length,1);
});
