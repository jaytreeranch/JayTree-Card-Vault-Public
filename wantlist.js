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
const state={sets:[],selected:null,visible:PAGE,search:"",globalVisible:PAGE,globalMatches:[]};
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
 const named=$("wantlist-named").value;
 const order=$("wantlist-sort").value;
 let matches=state.sets.filter(s=>(!sport||s.sport===sport)&&
  (!named||s.reference_player_names_complete===true)&&
  (!search||title(s).toLowerCase().includes(search)||s.sport.toLowerCase().includes(search)));
 const byTitle=(a,b)=>title(a).localeCompare(title(b));
 matches.sort((a,b)=>{
  if(order==="most")return b.missing-a.missing||byTitle(a,b);
  if(order==="year")return Number(b.year)-Number(a.year)||byTitle(a,b);
  if(order==="az")return byTitle(a,b);
  return a.missing-b.missing||b.progress_percent-a.progress_percent||byTitle(a,b);
 });
 const remaining=matches.reduce((n,s)=>n+s.missing,0);
 $("wantlist-count").textContent=fmt(matches.length)+" sourced numbered sets • "+fmt(remaining)+" missing numbered spots";
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
 const exact=q.startsWith("#")?q.slice(1):null;
 const items=s.missing_cards.filter(c=>exact!==null?
  c.number.toLocaleLowerCase()===exact:
  !q||c.number.toLocaleLowerCase().includes(q)||(c.player||"").toLocaleLowerCase().includes(q)||
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
// Search is client-side over the already vetted 6,513 missing numbered spots.
// Only render one page at a time: a broad year/set query must not flood the DOM.
function searchAllMissing(){
 const query=$("want-global-search").value.trim().toLocaleLowerCase();
 const panel=$("want-global-results");
 const enough=query.length>=2&&query!=="#";
 if(!enough||!state.sets.length){
  panel.hidden=true;
  state.globalMatches=[];
  return;
 }
 const words=query.split(/\s+/).filter(Boolean);
 const sports=$("wantlist-sport").value;
 const named=$("wantlist-named").value;
 const matches=[];
 for(const s of state.sets){
  if(sports&&s.sport!==sports)continue;
  if(named&&s.reference_player_names_complete!==true)continue;
  for(const c of s.missing_cards){
   const number=String(c.number).toLocaleLowerCase();
   const content=[c.player||"",c.team||"",number,s.sport,s.year,s.brand,s.set]
    .join(" ").toLocaleLowerCase();
   const isMatch=words.every(w=>w.startsWith("#")?number===w.slice(1):content.includes(w));
   if(isMatch)matches.push({set:s,card:c});
  }
 }
 state.globalMatches=matches;
 state.globalVisible=PAGE;
 renderGlobalMissing();
}
function renderGlobalMissing(){
 const matches=state.globalMatches;
 const panel=$("want-global-results");
 panel.hidden=false;
 const list=$("want-global-list");
 list.replaceChildren();
 const visible=Math.min(matches.length,state.globalVisible);
 for(const {set:s,card:c} of matches.slice(0,visible)){
  const row=text(list,"li","","want-global-row");
  const desc=text(row,"div","","want-global-card");
  text(desc,"strong","#"+c.number+(c.player?" - "+c.player:""));
  text(desc,"small",s.year+" / "+s.brand+" / "+s.set);
  if(c.team)text(desc,"small",c.team);
  else if(!c.player)text(desc,"small","Player not independently named; confirm printed number and set");
  const actions=text(row,"div","","want-global-actions");
  const open=text(actions,"button","View in set","want-global-open");
  open.type="button";
  open.addEventListener("click",()=>{
   openSet(s);
   $("wantlist-missing-search").value="#"+c.number;
   state.visible=PAGE;
   $("wantlist-missing-list").replaceChildren();
   renderMissing();
  });
  const email=text(actions,"a","Email owner","want-email-link");email.href=emailLink(s,c);
  const issue=text(actions,"a","I have this card","want-offer-link");
  issue.href=issueLink(s,c);issue.target="_blank";issue.rel="noopener noreferrer";
 }
 $("want-global-count").textContent=fmt(visible)+" of "+fmt(matches.length)+
  " matching missing numbered cards shown. Identifications may be provisional.";
 $("want-global-more").hidden=visible>=matches.length;
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
 const share=text(panel,"button","Copy a link to this set","want-share-link");
 share.type="button";
 share.addEventListener("click",async()=>{
  const url=setUrl(s);
  try{
   if(!navigator.clipboard?.writeText)throw new Error("Clipboard unavailable");
   await navigator.clipboard.writeText(url);
   share.textContent="Set link copied";
  }catch{
   // Allow manual copying if browser clipboard permission is unavailable.
   const manual=document.createElement("input");
   manual.type="text";manual.readOnly=true;manual.value=url;
   manual.className="want-share-fallback";
   manual.setAttribute("aria-label","Select and copy this set link");
   share.replaceWith(manual);manual.focus();manual.select();
  }
 });
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
  const count=n=>Number.isSafeInteger(n)&&n>=0;
  const keys=new Set();
  let missingTotal=0,namedTotal=0;
  for(const set of data.sets){
   if(!Array.isArray(set.key)||set.key.length!==4||!Array.isArray(set.missing_cards)||
      !count(set.total)||!count(set.owned)||!count(set.missing)||
      set.total!==set.owned+set.missing||set.missing_cards.length!==set.missing||
      typeof set.sport!=="string"||typeof set.set!=="string")
     throw new Error("Corrupted set count");
   const setKey=key(set);
   if(keys.has(setKey))throw new Error("Duplicate checklist");
   keys.add(setKey);
   const numbers=set.missing_cards.map(c=>c.number);
   if(numbers.some(n=>typeof n!=="string"||!n.trim())||
      new Set(numbers).size!==numbers.length)
     throw new Error("Duplicate or invalid missing card number");
   if(set.reference_player_names_complete===true)namedTotal++;
   missingTotal+=set.missing;
  }
  if(!count(data.supported_missing_spots)||data.supported_missing_spots!==missingTotal||
     !count(data.named_set_count)||data.named_set_count!==namedTotal)
   throw new Error("Checklist summary does not match details");
  state.sets=data.sets;
  // Share this vetted public numbered-checklist snapshot with the collection dropdown.
  document.dispatchEvent(new CustomEvent("jaytree:checklists-ready",{detail:state.sets}));
  $("wantlist-intro").textContent="Browse "+fmt(data.supported_set_count)+" independently sourced numbered checklists, including "+fmt(data.named_set_count)+" with verified player names. Missing cards are numbered spots not currently recorded in the public collection. Catalog snapshot: "+String(data.generated_at_utc||"date unavailable").slice(0,10)+".";
  const sports=[...new Set(state.sets.map(s=>s.sport))].sort();
  for(const sport of sports){const opt=document.createElement("option");opt.value=sport;opt.textContent=sport;$("wantlist-sport").appendChild(opt);}
  renderTiles();
  searchAllMissing();
  parseHash();
 }catch{
  $("wantlist-intro").textContent="Verified set checklists are temporarily unavailable. You can still browse every publicly listed card in the collection.";
  $("wantlist-count").textContent="Checklists unavailable";
  $("want-global-help").textContent="Missing-card search is unavailable while the sourced checklist snapshot cannot be verified.";
  $("want-global-search").disabled=true;
 }
}
$("wantlist-search").addEventListener("input",renderTiles);
$("wantlist-sport").addEventListener("change",()=>{renderTiles();searchAllMissing();});
$("wantlist-sort").addEventListener("change",renderTiles);
$("wantlist-named").addEventListener("change",()=>{renderTiles();searchAllMissing();});
$("want-global-search").addEventListener("input",searchAllMissing);
$("want-global-more").addEventListener("click",()=>{
 state.globalVisible+=PAGE;
 renderGlobalMissing();
});
$("wantlist-missing-search").addEventListener("input",()=>{state.visible=PAGE;$("wantlist-missing-list").replaceChildren();renderMissing();});
$("wantlist-more").addEventListener("click",()=>{state.visible+=PAGE;renderMissing();});
$("wantlist-close").addEventListener("click",()=>$("wantlist-dialog").close());
$("wantlist-dialog").addEventListener("click",e=>{if(e.target===$("wantlist-dialog"))$("wantlist-dialog").close();});
window.addEventListener("hashchange",()=>{if(state.sets.length)parseHash();});
loadWantList();
})();
