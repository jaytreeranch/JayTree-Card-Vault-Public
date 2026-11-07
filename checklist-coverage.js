/* Read-only coverage for catalog groups with no independently approved checklist.
 * Uses preloaded events: no extra data requests or private APIs. */
(()=>{
"use strict";
const $=id=>document.getElementById(id);
const state={groups:null,checklists:null};
const key=k=>JSON.stringify(k);
const title=g=>[g.year,g.brand,g.set].filter(Boolean).join(" - ");
function t(parent,tag,value,className){
 const node=document.createElement(tag);
 node.textContent=String(value??"");
 if(className)node.className=className;
 parent.appendChild(node);
 return node;
}
function emailLink(g){
 const params=[
  "Hello JayTree,",
  "I found a possible source for a missing set checklist:",
  "Set: "+[g.sport,g.year,g.brand,g.set].filter(Boolean).join(" / "),
  "Collection: https://cards.jaytreebooks.com/#wantlist",
  "",
  "Published checklist URL and publisher:",
  "",
  "Issued number range, exclusions, parallels/variations and other notes:",
  "",
  "This is a suggestion for owner review, not an inventory update."
 ].join("\n");
 return "mailto:jaytreebooks@gmail.com?subject="+encodeURIComponent("Card Vault checklist source suggestion")+
  "&body="+encodeURIComponent(params);
}
function issueLink(g){
 const params=new URLSearchParams({
  template:"checklist-source.yml",
  title:"[Checklist source] "+g.year+" "+g.set,
  "set-name":[g.sport,g.year,g.brand,g.set].filter(Boolean).join(" / ")
 });
 return "https://github.com/jaytreeranch/JayTree-Card-Vault-Public/issues/new?"+params.toString();
}
function render(){
 if(!state.groups||!state.checklists)return;
 const sourced=new Set(state.checklists.map(g=>key(g.key)));
 const gaps=state.groups.filter(g=>!sourced.has(key(g.key)));
 gaps.sort((a,b)=>b.entries-a.entries||Number(b.year)-Number(a.year)||
  title(a).localeCompare(title(b)));
 $("coverage-summary-count").textContent=gaps.length+" awaiting sources";
 const q=$("coverage-search").value.trim().toLocaleLowerCase();
 const matches=gaps.filter(g=>!q||[g.sport,g.year,g.brand,g.set].join(" ").toLocaleLowerCase().includes(q));
 $("coverage-status").textContent=matches.length+" of "+gaps.length+" sets shown. Missing numbers remain unknown until checklist approval.";
 const grid=$("coverage-grid");
 grid.replaceChildren();
 for(const g of matches){
  const item=t(grid,"article","","coverage-card");
  t(item,"p",g.sport+" / "+g.year,"want-set-meta");
  t(item,"h3",g.set);
  t(item,"p",g.distinct+" unique printed numbers recorded / total unknown","coverage-total-unknown");
  t(item,"p",g.entries+" published catalog entries; "+g.needsReview+
   " identification(s) still need review. Duplicate copies do not add spots.");
  const actions=t(item,"div","","coverage-actions");
  const email=t(actions,"a","Suggest source by email");email.href=emailLink(g);
  const issue=t(actions,"a","Suggest on GitHub");
  issue.href=issueLink(g);issue.target="_blank";issue.rel="noopener noreferrer";
 }
 $("coverage-search").disabled=false;
}
document.addEventListener("jaytree:public-set-groups-ready",ev=>{
 if(!Array.isArray(ev.detail))return;
 const ids=new Set(),groups=[];
 for(const g of ev.detail){
  if(!g||!Array.isArray(g.key)||g.key.length!==4||!g.key.every(x=>typeof x==="string")||
     !Number.isSafeInteger(g.distinct)||g.distinct<0||
     !Number.isSafeInteger(g.entries)||g.entries<1||
     !Number.isSafeInteger(g.needsReview)||g.needsReview<0||g.needsReview>g.entries)continue;
  const k=key(g.key);if(ids.has(k))continue;ids.add(k);groups.push(g);
 }
 state.groups=groups;render();
});
document.addEventListener("jaytree:checklists-ready",ev=>{
 if(!Array.isArray(ev.detail))return;
 state.checklists=ev.detail.filter(g=>Array.isArray(g.key)&&g.key.length===4);
 render();
});
$("coverage-search").disabled=true;
$("coverage-search").addEventListener("input",render);
})();
