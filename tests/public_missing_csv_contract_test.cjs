const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,".."),read=n=>fs.readFileSync(path.join(root,n),"utf8");
const html=read("index.html"),js=read("wantlist.js");
const checklists=JSON.parse(read("set-checklists.json"));
test("CSV downloaded by explicit button from sourced dialog",()=>{
 for(const id of ["wantlist-export-csv","wantlist-export-help","wantlist-export-status"])assert.ok(html.includes('id="'+id+'"'));
 assert.ok(js.includes('addEventListener("click",exportMissingCsv)'));
 assert.ok(js.includes('if(!s||!state.sets.includes(s))return'));
 assert.ok(js.includes('new Blob([csv],{type:"text/csv;charset=utf-8"})'));
 assert.ok(js.includes('anchor.download="JayTree_Missing_"'));
 assert.ok(js.includes('URL.revokeObjectURL(url)'));
});
test("Exports all matching issued spots, including beyond the first 40",()=>{
 assert.ok(js.includes('const items=matchingMissing(s)'));
 assert.ok(js.includes('const matches=matchingMissing(s)'));
 assert.ok(js.includes('const names=["Sport","Year","Brand","Set","Printed number"'));
 assert.ok(js.includes('sourceValid(s.source.url)?s.source.url:""'));
 assert.ok(js.includes('cardUrl(s,c)'));
 assert.ok(js.includes('Player not independently named; confirm printed number and variation'));
 assert.equal(checklists.supported_set_count,27);
 assert.equal(checklists.supported_missing_spots,6491);
});
test("CSV escapes spreadsheet formula injection and quotes",()=>{
 const m=js.match(/function csvCell\(value\)\{[\s\S]*?\n\}/);
 assert.ok(m);
 const fn=vm.runInNewContext("("+m[0]+")");
 for(const value of ["=1+1","+SUM(1,2)","-5","@SUM(1,2)","  =HYPERLINK(x)","\t=WEBSERVICE(x)"]){
  const output=fn(value);assert.ok(output.startsWith('"'+String.fromCharCode(39)),[value,output]);
  assert.ok(output.endsWith('"'));
 }
 assert.equal(fn('He said "hey"'),'"He said ""hey"""');
 assert.equal(fn("hello\nworld"),'"hello world"');
 assert.equal(fn(null),'""');
});
test("No new public writers or private copy-level fields",()=>{
 const cards=JSON.parse(read("catalog.json"));
 assert.equal(cards.cards.length,1649);
 assert.equal((js.match(/\bfetch\s*\(/g)||[]).length,1);
 assert.ok(!/localStorage|sessionStorage|sendBeacon|copy_id|\/api\/cards|\/owner\//.test(js));
});
