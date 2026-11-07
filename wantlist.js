/* JayTree public, read-only numbered-set wish list.
 * Source: vetted private-LAN checklist ranges projected into static JSON.
 * No visitor submission or inventory mutation runs in this script. */
(()=>{
"use strict";
const $=id=>document.getElementById(id);
const text=(parent,tag,value,className)=>{
 const el=document.createElement(tag);
 if(className)el.className=className;
 el.textContent=String(value??"");
 parent.appendChild(el);return el;
};
const PAGE=40;
const state={sets:[],selected:null,visible:PAGE,search:""};
const key=s=>JSON.stringify(s.key);
const title=s=>[s.year,s.brand,s.set].filter(Boolean).join(" · ");
const fmt=n=>Number(n||0).toLocaleString("en-US");
const sourceValid=u=>{
 try{const parsed=new URL(u);return parsed.protocol==="https:";}catch{return false;}
};
const setUrl=s=>location.origin+location.pathname+"#want-set="+encodeURIComponent(key(s));
const issueRoot="https://github.com/jaytreeranch/JayTree-Card-Vault-Public/issues/new";
function issueLink(s,card){
 const params=new URLSearchParams({
  template:"missing-card-offer.yml",
  title:"[Missing card offer] "+s.year+" "+s.set+" #"+card.number,
  "set-name":title(s),
  "card-number":card.number,
  "card-name":card.player||"Numbered card #"+card.number,
  "set-link":setUrl(s)
 });
 return issueRoot+"?"+params.toString();
}
function emailLink(s,card){
 const subject="JayTree Card Vault: I have missing "+s.set+" #"+card.number;
 const body=[
  "Hello JayTree,",
  "I may have a card from your public want list:",
  "Set: "+title(s),
  "Card: #"+card.number+(card.player?" — "+card.player:""),
  "Your want list: "+setUrl(s),
  "",
  "Condition, variation/parallel, asking price and other details:",
  "",
  "This is an inquiry only, not an accepted transaction."
 ].join("\n");
 return "mailto:jaytreebooks@gmail.com?subject="+encodeURIComponent(subject)+"&body="+encodeURIComponent(body);
}
function renderTiles(){
 const list=$("wantlist-sets");list.replaceChildren();
 const search=$("wantlist-search").value.trim().toLowerCase();
 const sport=$("wantlist-sport").value;
 let matches=state.sets.filter(s=>(!sport||s.sport===sport)&&
  (!search||title(s).toLowerCase().includes(search)||s.sport.toLowerCase().includes(search)));
 $("wantlist-count").textContent=fmt(matches.length)+" numbered sets with sourced checklists";
 $("wantlist-empty").hidden=matches.length>0;
 for(const s of matches){
  const card=document.createElement("article");card.className="want-set-card";
  text(card,"p",s.sport.toUpperCase()+" · "+s.year,"want-set-meta");
  text(card,"h3",s.set,"want-set-title");
  const stats=text(card,"div","","want-set-stats");
  text(stats,"span",fmt(s.owned)+" / "+fmt(s.total)+" numbered spots owned");
  text(stats,"strong",fmt(s.missing)+" missing");
  const track=text(card,"div","","want-track");
  const bar=text(track,"div","","want-track-fill");
  bar.style.width=Math.max(0,Math.min(100,s.progress_percent))+"%";
  text(card,"p",s.progress_percent+"% of issued numbered spots · "+s.review_needed_records+" catalog entries need review","want-set-small");
  const button=text(card,"button","See "+fmt(s.missing)+" missing cards","want-set-open");
  button.type="button";button.addEventListener("click",()=>openSet(s));
  list.appendChild(card);
 }
}
function renderMissing(){
 const s=state.selected;if(!s)return;
 const list=$("wantlist-missing-list");
 const q=$("wantlist-missing-search").value.trim().toLocaleLowerCase();
 const items=s.missing_cards.filter(c=>
  !q||c.number.includes(q)||(c.player||"").toLocaleLowerCase().includes(q)||
  (c.team||"").toLocaleLowerCase().includes(q));
 if(state.visible===PAGE)list.replaceChildren();
 const begin=list.children.length;
 const end=Math.min(items.length,state.visible);
 // Filtering always clears the list (visible=PAGE); Show more appends.
 for(const c of items.slice(begin,end)){
  const row=document.createElement("li");row.className="want-missing-row";
  const details=text(row,"div","","want-missing-name");
  text(details,"strong","#"+c.number+(c.player?" — "+c.player:""));
  if(c.team)text(details,"small",c.team);
  else if(!c.player)text(details,"small","Player name not yet independently verified for this checklist");
  const links=text(row,"div","","want-missing-actions");
  const issue=text(links,"a","I have this card","want-offer-link");
  issue.href=issueLink(s,c);issue.target="_blank";issue.rel="noopener noreferrer";
  const email=text(links,"a","Email owner","want-email-link");
  email.href=emailLink(s,c);
  list.appendChild(row);
 }
 $("wantlist-missing-status").textContent=fmt(end)+" of "+fmt(items.length)+" matching missing cards shown";
 $("wantlist-more").hidden=end>=items.length;
}
function openSet(s){
 state.selected=s;state.visible=PAGE;
 $("wantlist-dialog-content").replaceChildren();
 const panel=$("wantlist-dialog-content");
 text(panel,"p",s.sport+" · "+s.year,"want-set-meta");
 text(panel,"h2",title(s),"want-dialog-title");
 text(panel,"p",fmt(s.owned)+" of "+fmt(s.total)+" numbered spots owned · "+fmt(s.missing)+" missing · "+s.progress_percent+"% complete","want-dialog-totals");
 text(panel,"p",s.review_needed_records+" catalog entries still need review; owned numbered spots may include parallels or tentative identifications. Verify the exact card, condition, year and variation before offering.","want-dialog-note");
 text(panel,"p","Checklist: "+(s.source.description||"Published numbered reference"),"want-source-note");
 if(sourceValid(s.source.url)){
  const a=text(panel,"a","View checklist source","want-source-link");
  a.href=s.source.url;a.target="_blank";a.rel="noopener noreferrer";
 }
 text(panel,"p",s.source.scope||"Only the supported numbered subset is tracked.","want-source-note");
 const share=text(panel,"a","Share this missing-card list","want-share-link");
 share.href="#want-set="+encodeURIComponent(key(s));
 share.addEventListener("click",()=>{$("wantlist-dialog").close();});
 $("wantlist-missing-search").value="";
 $("wantlist-missing-list").replaceChildren();
 $("wantlist-dialog").showModal();
 renderMissing();
}
function parseHash(){
 if(!location.hash.startsWith("#want-set="))return;
 try{
  const desired=JSON.stringify(JSON.parse(decodeURIComponent(location.hash.slice("#want-set=".length))));
  const found=state.sets.find(s=>key(s)===desired);
  if(found)openSet(found);
 }catch{/* malformed share link: leave gallery usable */}
}
async function loadWantList(){
 try{
  const result=await fetch("set-checklists.json",{cache:"no-store"});
  if(!result.ok)throw new Error("Checklist unavailable");
  const data=await result.json();
  if(data.schema!=="jaytree.public-wantlist.v1"||data.readonly!==true||
    !Array.isArray(data.sets)||data.sets.length!==data.supported_set_count||
    data.sets.length<1||data.sets.length>100)throw new Error("Unsupported published checklist");
  for(const set of data.sets){
   if(!Array.isArray(set.key)||set.key.length!==4||!Array.isArray(set.missing_cards)||
      set.total!==set.owned+set.missing||set.missing_cards.length!==set.missing)
     throw new Error("Corrupted set count");
  }
  state.sets=data.sets;
  $("wantlist-intro").textContent="Browse "+fmt(data.supported_set_count)+" independently sourced numbered checklists, including "+fmt(data.named_set_count)+" with verified player names. Missing cards are numbered spots not currently recorded in the public collection.";
  const sports=[...new Set(state.sets.map(s=>s.sport))].sort();
  for(const sport of sports){const opt=document.createElement("option");opt.value=sport;opt.textContent=sport;$("wantlist-sport").appendChild(opt);}
  renderTiles();
  parseHash();
 }catch{
  $("wantlist-intro").textContent="Verified set checklists are temporarily unavailable. You can still browse every publicly listed card in the collection.";
  $("wantlist-count").textContent="Checklists unavailable";
 }
}
$("wantlist-search").addEventListener("input",renderTiles);
$("wantlist-sport").addEventListener("change",renderTiles);
$("wantlist-missing-search").addEventListener("input",()=>{state.visible=PAGE;$("wantlist-missing-list").replaceChildren();renderMissing();});
$("wantlist-more").addEventListener("click",()=>{state.visible+=PAGE;renderMissing();});
$("wantlist-close").addEventListener("click",()=>$("wantlist-dialog").close());
$("wantlist-dialog").addEventListener("click",e=>{if(e.target===$("wantlist-dialog"))$("wantlist-dialog").close();});
window.addEventListener("hashchange",()=>{if(state.sets.length)parseHash();});
loadWantList();
})();
