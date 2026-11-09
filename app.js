"use strict";
const PAGE_SIZE = 48;
const state = { cards: [], results: [], rendered: 0, visibleCount: PAGE_SIZE, sets: new Map(), checklists: new Map(), positionByName: new Map(), positionReady: false };
const features=window.JayTreeCardFeatures;
// Public-only snapshot fidelity: use published metadata; NEVER query private LAN state.
const publishedSnapshot={catalog:null,checklists:null};
function publishedTime(raw){
 if(typeof raw!=="string"||! /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(raw))return null;
 const date=new Date(raw);
 return Number.isFinite(date.getTime())?date:null;
}
function formatPublishedTime(date){
 return new Intl.DateTimeFormat("en-US",{
  month:"short",day:"numeric",year:"numeric",hour:"numeric",minute:"2-digit",
  timeZone:"UTC",timeZoneName:"short"
 }).format(date);
}
function renderPublishedSnapshot(){
 const cat=publishedSnapshot.catalog,list=publishedSnapshot.checklists;
 if(!cat){
  $("snapshot-integrity").textContent=list?.failed?
   "Catalog and numbered checklists are unavailable.":"Checking the published catalog and numbered checklists?";
  return;
 }
 if(cat.failed){
  $("snapshot-time").textContent="Catalog publication details unavailable";
  $("snapshot-integrity").textContent="Public catalog unavailable; no live inventory data is accessible here.";
  return;
 }
 $("snapshot-time").textContent=cat.date?
  "Published "+formatPublishedTime(cat.date):
  "Publication time unavailable in this public catalog";
 $("snapshot-verified").textContent=cat.verified.toLocaleString("en-US");
 $("snapshot-needs-review").textContent=cat.needsReview.toLocaleString("en-US");
 if(!cat.valid){
  $("snapshot-integrity").textContent=
   "Published catalog counts do not agree with the displayed cards. Treat these totals as provisional.";
 }else if(!list){
  $("snapshot-integrity").textContent="Catalog counts checked. Verifying the separately published numbered checklists?";
 }else if(list.failed){
  $("snapshot-integrity").textContent="Catalog counts checked; numbered checklist status is unavailable.";
 }else if(!cat.date||!list.date){
  $("snapshot-integrity").textContent=
   "Catalog counts checked; publication times are missing, so checklist alignment cannot be confirmed.";
 }else if(cat.timestamp!==list.timestamp||cat.count!==list.cardCount){
  $("snapshot-integrity").textContent=
   "The catalog and numbered checklists do not report the same published snapshot. Some set totals may be out of date.";
 }else{
  $("snapshot-integrity").textContent=
   "Catalog and numbered checklist files agree on publication time and card count. This does not confirm the current private Vault.";
 }
}
function setPublishedCatalog(data){
 const verified=state.cards.filter(c=>c.review_status==="Verified").length;
 const needsReview=state.cards.filter(c=>c.review_status==="Needs review").length;
 const date=publishedTime(data.generated_at_utc);
 const valid=Number.isSafeInteger(data.count)&&data.count===data.cards.length&&
  data.cards.length===state.cards.length&&
  Number.isSafeInteger(data.verified_count)&&data.verified_count===verified&&
  Number.isSafeInteger(data.needs_review_count)&&data.needs_review_count===needsReview&&
  verified+needsReview===state.cards.length;
 publishedSnapshot.catalog={count:state.cards.length,verified,needsReview,date,
  timestamp:date?.getTime(),valid};
 renderPublishedSnapshot();
}
// The existing audited checklist loader broadcasts metadata; no additional request.
document.addEventListener("jaytree:public-snapshot-checklists",event=>{
 const d=event.detail;
 if(!d||d.failed){
  publishedSnapshot.checklists={failed:true};
 }else{
  const date=publishedTime(d.generated_at_utc);
  publishedSnapshot.checklists={date,timestamp:date?.getTime(),
   cardCount:Number.isSafeInteger(d.catalog_card_count)?d.catalog_card_count:null};
 }
 renderPublishedSnapshot();
});

const selectedFeatures=()=>[...document.querySelectorAll('input[data-feature]:checked')].map(n=>n.value);
function refreshFeatureCounts(){
 for(const opt of features.OPTIONS){
  const count=state.cards.filter(c=>features.classify(c)[opt.key]).length;
  const label=document.querySelector('[data-feature-count="'+opt.key+'"]');
  const input=document.querySelector('input[data-feature][value="'+opt.key+'"]');
  if(label)label.textContent="("+count.toLocaleString("en-US")+")";
  if(input){input.disabled=count===0;if(count===0)input.checked=false;}
 }
}

// Sport is part of checklist identity; never match by a similar set title alone.
const setKey = (c) => JSON.stringify([String(c.sport||""),String(c.year||""),String(c.brand||""),String(c.set||"")]);
const setTitle = (group) => [group.year,group.brand,group.set].filter(Boolean).join(" \u00b7 ");
function setOptionLabel(key,group){
 const list=state.checklists.get(key);
 // Numerator is unique issued checklist spots, never card quantities or parallel copies.
 if(list)return list.owned+"/"+list.total+" owned ("+Math.round(100*list.owned/list.total)+ "%) \u00b7 "+setTitle(group);
 return group.numbers.size+" unique / total unknown \u00b7 "+setTitle(group);
}
// Narrow choices without changing the currently selected card filter.
function refreshSetOptionLabels(){
 const select=$("set"),selected=select.value;
 const search=$("set-finder").value.trim().toLocaleLowerCase();
 const order=$("set-sort").value;
 const all=[...state.sets.entries()];
 const searchText=g=>[g.sport,g.year,g.brand,g.set].filter(Boolean).join(" ").toLocaleLowerCase();
 const matched=all.filter(([,g])=>!search||searchText(g).includes(search));
 const shown=matched.filter(([key])=>key!==selected);
 if(selected&&state.sets.has(selected))shown.push([selected,state.sets.get(selected)]);
 const byTitle=(a,b)=>setTitle(a[1]).localeCompare(setTitle(b[1]));
 const yearSort=(a,b)=>String(b[1].year||"").localeCompare(String(a[1].year||""))||
   String(a[1].brand||"").localeCompare(String(b[1].brand||""))||byTitle(a,b);
 shown.sort((a,b)=>{
  if(order==="az")return byTitle(a,b);
  const x=state.checklists.get(a[0]),y=state.checklists.get(b[0]);
  if(order==="closest")return (x?.missing??Infinity)-(y?.missing??Infinity)||yearSort(a,b);
  if(order==="percent")return (y?y.owned/y.total:-1)-(x?x.owned/x.total:-1)||yearSort(a,b);
  return yearSort(a,b);
 });
 const frag=document.createDocumentFragment();
 const allOption=document.createElement("option");
 allOption.value="";allOption.textContent="All cataloged sets";frag.appendChild(allOption);
 for(const [key,group] of shown){
  const opt=document.createElement("option");opt.value=key;
  opt.textContent=setOptionLabel(key,group);frag.appendChild(opt);
 }
 select.replaceChildren(frag);
 select.value=selected&&state.sets.has(selected)?selected:"";
 const retained=selected&&!matched.some(([key])=>key===selected);
 const status=$("set-finder-status");
 status.textContent=search?matched.length+" of "+state.sets.size+" set names match your search"+
  (retained?"; current selected set retained.":"."):
  state.sets.size+" cataloged sets. Sort by missing cards or completion; unknown totals appear last.";
 status.appendChild(document.createTextNode(" "));
 const link=document.createElement("a");link.href="#wantlist";link.textContent="Browse missing-card lists";
 status.appendChild(link);
 updateBrowseSummary();
}

const $ = (id) => document.getElementById(id);
const fmtUSD = (v) => typeof v === "number" && Number.isFinite(v) ? new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(v) : "Not valued";
const safeImage = (path) => typeof path === "string" && /^assets\/[a-f0-9]{24}\.jpg$/.test(path) ? path : "";
const value = (c) => typeof c.estimate_usd === "number" ? c.estimate_usd : -1;
const text = (parent, name, content, className) => {const n=document.createElement(name);n.textContent=content || "";if(className)n.className=className;parent.appendChild(n);return n;};
const cleanDate = (s) => /^\d{4}-\d{2}-\d{2}/.test(s||"") ? s.slice(0,10) : "—";
// Share public collection filters, never a private inventory/copy link.
const BROWSE_SCHEMA="jt.public.browse.v1";
let browseShareEpoch=0;
function clearBrowseLinkFeedback(){
 browseShareEpoch++;
 const field=$("collection-view-link-fallback");
 field.hidden=true;field.value="";
 $("collection-view-link-status").textContent="";
}
function safeBrowseText(v){
 return typeof v==="string"&&v.length<=100&&!/[\x00-\x1f\x7f]/.test(v);
}
// Position names come from a separate, source-linked PUBLIC metadata snapshot.
// Never guess a player's position from their card photo, name or team.
const POSITION_NAMES=Object.freeze({
 QB:"Quarterback",WR:"Wide receiver",RB:"Running back",TE:"Tight end",
 FB:"Fullback",CB:"Cornerback",DB:"Defensive back",S:"Safety",
 SAF:"Safety",FS:"Free safety",SS:"Strong safety",
 DE:"Defensive end",DT:"Defensive tackle",DL:"Defensive line",
 NT:"Nose tackle",LB:"Linebacker",MLB:"Middle linebacker",
 ILB:"Inside linebacker",OLB:"Outside linebacker",
 OT:"Offensive tackle",OL:"Offensive line",G:"Guard",C:"Center",
 K:"Kicker",P:"Punter",LS:"Long snapper"
});
function publicPosition(card){
 return card?.sport==="Football"?state.positionByName.get(String(card.player||""))||"":"";
}
function refreshTeamAndPositionOptions(){
 const sport=$("sport").value;
 const teamSelect=$("team"),wantedTeam=teamSelect.value;
 const eligible=state.cards.filter(c=>!sport||c.sport===sport);
 const names=[...new Set(eligible.map(c=>String(c.team||"").trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b));
 const teams=document.createDocumentFragment();
 const anyTeam=document.createElement("option");anyTeam.value="";anyTeam.textContent="All teams";teams.appendChild(anyTeam);
 for(const team of names){const option=document.createElement("option");option.value=team;option.textContent=team;teams.appendChild(option);}
 teamSelect.replaceChildren(teams);
 teamSelect.value=names.includes(wantedTeam)?wantedTeam:"";
 const select=$("position"),wanted=select.value;
 const values=[...new Set(eligible.map(publicPosition).filter(Boolean))].sort((a,b)=>a.localeCompare(b));
 const positions=document.createDocumentFragment();
 const any=document.createElement("option");any.value="";any.textContent="All positions";positions.appendChild(any);
 for(const value of values){const option=document.createElement("option");option.value=value;
  option.textContent=value+(POSITION_NAMES[value]?" · "+POSITION_NAMES[value]:"");
  positions.appendChild(option);}
 select.replaceChildren(positions);
 select.disabled=values.length===0;
 select.value=values.includes(wanted)?wanted:"";
 const covered=eligible.filter(c=>!!publicPosition(c)).length;
 $("position-filter-help").textContent=values.length?
  "Position sourced for "+covered.toLocaleString("en-US")+" of "+eligible.length.toLocaleString("en-US")+
   " currently selected published cards. Missing or ambiguous positions stay under All positions; team and position can be combined.":
  (sport==="Baseball"?"Baseball positions are not yet sourced; filter by team or use the player search.":
   "Position reference unavailable for this selection. Team filtering remains available.");
}
async function loadPublicPositions(catalog){
 state.positionByName=new Map();state.positionReady=false;
 try{
  const res=await fetch("player-positions.json",{cache:"no-store"});
  if(!res.ok)throw new Error("Source unavailable");
  const data=await res.json();
  if(data?.schema!=="jaytree.public-positions.v1"||
     data.catalog_generated_at_utc!==catalog.generated_at_utc||
     !data.positions_by_name||Array.isArray(data.positions_by_name)||
     typeof data.positions_by_name!=="object")throw new Error("Stale or malformed position snapshot");
  const published=new Set(state.cards.filter(c=>c.sport==="Football").map(c=>c.player));
  const map=new Map();
  for(const [name,position] of Object.entries(data.positions_by_name)){
   if(!published.has(name)||!/^[A-Z]{1,3}$/.test(position)||
      !Object.prototype.hasOwnProperty.call(POSITION_NAMES,position))throw new Error("Unsupported position row");
   map.set(name,position);
  }
  const computed=state.cards.filter(c=>c.sport==="Football"&&map.has(c.player)).length;
  if(computed!==data.cards_with_position||computed<1)throw new Error("Incomplete position source");
  state.positionByName=map;state.positionReady=true;
 }catch(_){
  // The static catalog remains usable if this independent reference is absent,
  // stale, blocked by the browser, or fails integrity checks.
  state.positionByName=new Map();state.positionReady=false;
 }
}
function currentBrowsePayload(){
 return [BROWSE_SCHEMA,$("search").value.trim(),$("sport").value,$("review").value,
  $("year").value,$("set").value,$("set-finder").value.trim(),$("set-sort").value,
  $("sort").value,$("offers").checked,selectedFeatures().slice().sort(),$("team").value,$("position").value];
}
function validBrowsePayload(v){
 if(!Array.isArray(v)||(v.length!==11&&v.length!==13)||v[0]!==BROWSE_SCHEMA||
    typeof v[9]!=="boolean"||!Array.isArray(v[10])||
    v[10].length>features.OPTIONS.length||
    ![0,1,2,3,4,6,7,8].every(i=>safeBrowseText(v[i]))||
    typeof v[5]!=="string"||v[5].length>800)return false;
 for(const [id,val] of [["sport",v[2]],["review",v[3]],["year",v[4]],
   ["set-sort",v[7]],["sort",v[8]]]){
  if(![...$(id).options].some(o=>o.value===val))return false;
 }
 if(v[5]&&!state.sets.has(v[5]))return false;
 if(v.length===13){
  if(!safeBrowseText(v[11])||!safeBrowseText(v[12]))return false;
  if(v[11]&&!state.cards.some(c=>(!v[2]||c.sport===v[2])&&c.team===v[11]))return false;
  if(v[12]&&!state.cards.some(c=>(!v[2]||c.sport===v[2])&&publicPosition(c)===v[12]))return false;
 }
 const allowed=new Set(features.OPTIONS.map(f=>f.key));
 return v[10].every(f=>allowed.has(f)&&
  !document.querySelector('input[data-feature][value="'+f+'"]')?.disabled)&&
  new Set(v[10]).size===v[10].length;
}
function publicBrowseUrl(){
 const params=currentBrowsePayload();
 if(!validBrowsePayload(params))return null;
 const url=location.origin+location.pathname+
  (customizedBrowseCount()?"#browse="+encodeURIComponent(JSON.stringify(params)):"#collection");
 return url.split("#")[1].length>2400?null:url;
}
// Device-native gallery sharing is optional. A resolved browser handoff is not delivery.
async function nativeShareBrowseView(){
 if(typeof navigator.share!=="function"||!state.cards.length)return;
 const url=publicBrowseUrl();
 if(!url){
  $("collection-view-link-status").textContent=
   "One or more collection filters cannot be shared. Use a supported public filter.";
  return;
 }
 const count=state.results.length;
 const total=state.cards.length;
 const message=count.toLocaleString("en-US")+" matching published card"+
  (count===1?"":"s")+" out of "+total.toLocaleString("en-US")+
  ". Public, read-only collection snapshot; Needs review identifications are provisional. "+
  "This view may change when new owner-approved cards are published.";
 clearBrowseLinkFeedback();
 const attempt=browseShareEpoch;
 // Must enter the browser's native Share API inside this user click, before any await.
 try{
  await navigator.share({title:"JayTree Card Vault - collection view",text:message,url});
  if(attempt!==browseShareEpoch)return;
  $("collection-view-link-status").textContent=
   "Share menu handoff completed. Your chosen app controls whether anything was sent.";
 }catch(error){
  if(attempt!==browseShareEpoch)return;
  $("collection-view-link-status").textContent=error?.name==="AbortError"?
   "Share menu closed or canceled. You can still copy the view link.":
   "Device sharing was unavailable. Use Copy link to this view instead.";
 }
}
async function copyBrowseViewLink(){
 const url=publicBrowseUrl();
 if(!url){
  $("collection-view-link-status").textContent="One or more collection filters cannot be shared.";
  return;
 }
 clearBrowseLinkFeedback();
 const attempt=browseShareEpoch;
 try{
  if(!navigator.clipboard?.writeText)throw new Error("Clipboard unavailable");
  await navigator.clipboard.writeText(url);
  if(attempt!==browseShareEpoch)return;
  $("collection-view-link-status").textContent=
   "Copied link to this published collection view. No message was sent.";
 }catch{
  if(attempt!==browseShareEpoch)return;
  const field=$("collection-view-link-fallback");
  field.hidden=false;field.value=url;field.focus();field.select();
  $("collection-view-link-status").textContent=
   "Clipboard blocked. The public collection link is selected for manual copying.";
 }
}
// No server-side lookups. Invalid or stale links leave existing controls unchanged.
function restoreBrowseFromHash(){
 if(!location.hash.startsWith("#browse=")||location.hash.length>2400)return false;
 let p;
 try{p=JSON.parse(decodeURIComponent(location.hash.slice("#browse=".length)));}
 catch{return false;}
 if(!validBrowsePayload(p))return false;
 for(const [id,value] of [["search",p[1]],["sport",p[2]],["review",p[3]],
    ["year",p[4]],["set",p[5]],["set-finder",p[6]],["set-sort",p[7]],["sort",p[8]]]){
  $(id).value=value;
 }
 // Old 11-item shared links remain valid, with both new facets reset.
 refreshTeamAndPositionOptions();
 $("team").value=p.length===13?p[11]:"";
 $("position").value=p.length===13?p[12]:"";
 $("offers").checked=p[9];
 document.querySelectorAll("input[data-feature]").forEach(el=>{
  el.checked=p[10].includes(el.value)&&!el.disabled;
 });
 refreshSetOptionLabels();
 filtered();
 $("collection-view-link-status").textContent=
  "Opened shared published collection view: "+state.results.length.toLocaleString("en-US")+" matching cards.";
 return true;
}
// Mobile visitor clarity: account for ALL browse controls, while respecting Low-data view.
function customizedBrowseCount(){
 const ids=["search","sport","review","year","set","set-finder","team","position"];
 let count=ids.filter(id=>String($(id).value).trim()!=="").length;
 count+=selectedFeatures().length;
 if($("offers").checked)count++;
 if($("sort").value!=="name")count++;
 if($("set-sort").value!=="year")count++;
 return count;
}
function updateBrowseSummary(){
 const count=customizedBrowseCount();
 const cards=state.results.length.toLocaleString("en-US");
 $("collection-browse-status").textContent=count?
  count+" customized browse "+(count===1?"control":"controls")+" ? "+cards+" matching cards":
  "All browse filters clear ? "+cards+" published cards";
 // aria-disabled instead of disabled: remain keyboard focusable when clearing.
 $("collection-browse-reset").setAttribute("aria-disabled",String(count===0));
 const native=$("collection-native-share");
 native.hidden=typeof navigator.share!=="function";
 native.disabled=!publicBrowseUrl();
 native.textContent="Share "+cards+" matching "+(state.results.length===1?"card":"cards");
}
function clearBrowseControls(){
 if(customizedBrowseCount()===0)return;
 for(const id of ["search","sport","review","year","set","set-finder","team","position"])$(id).value="";
 $("sort").value="name";
 $("set-sort").value="year";
 $("offers").checked=false;
 document.querySelectorAll("input[data-feature]").forEach(cb=>cb.checked=false);
 refreshSetOptionLabels();
 filtered();
}
function filtered() {
 clearBrowseLinkFeedback();
 refreshTeamAndPositionOptions();
 const q = $("search").value.trim().toLocaleLowerCase(),
       sport=$("sport").value, review=$("review").value, year=$("year").value,
       ownedSet=$("set").value, offers=$("offers").checked,
       team=$("team").value,position=$("position").value;
 const anyFeatures=selectedFeatures();
 const selected=state.cards.filter(c =>
   (!sport || c.sport===sport) && (!review || c.review_status===review) &&
   (!year || String(c.year||"")===year) && (!ownedSet || setKey(c)===ownedSet) &&
   (!team || c.team===team) && (!position || publicPosition(c)===position) &&
   (!offers || c.for_sale) &&
   features.matchesAny(c,anyFeatures) &&
   [c.player,c.team,c.brand,c.set,c.year,c.number,c.parallel,publicPosition(c)].join(" ").toLowerCase().includes(q));
 switch($("sort").value){
  case "value-high":selected.sort((a,b)=>value(b)-value(a));break;
  case "value-low":selected.sort((a,b)=>(value(a)<0?Infinity:value(a))-(value(b)<0?Infinity:value(b)));break;
  case "new":selected.sort((a,b)=>parseInt(b.year||"0",10)-parseInt(a.year||"0",10));break;
  case "old":selected.sort((a,b)=>parseInt(a.year||"0",10)-parseInt(b.year||"0",10));break;
  case "team":selected.sort((a,b)=>String(a.team||"").localeCompare(String(b.team||""))||
    String(a.player||"").localeCompare(String(b.player||"")));break;
  case "position":selected.sort((a,b)=>(publicPosition(a)||"ZZZ").localeCompare(publicPosition(b)||"ZZZ")||
    String(a.team||"").localeCompare(String(b.team||""))||
    String(a.player||"").localeCompare(String(b.player||"")));break;
  default:selected.sort((a,b)=>(a.player||"").localeCompare(b.player||""));
 }
 state.results=selected;
 state.rendered=0;
 state.visibleCount=PAGE_SIZE;
 renderCards();
 renderSetSummary();
 updateBrowseSummary();
}
function renderCards(){
 const grid=$("grid");
 const cards=state.results;
 if(state.rendered===0)grid.replaceChildren();
 const showCount=Math.min(cards.length,state.visibleCount);
 $("result-count").textContent=showCount+" of "+cards.length+" matching cards shown · "+state.cards.length+" in collection";
 $("empty").hidden=cards.length>0;
 $("load-more").hidden=showCount>=cards.length;
 for(const c of cards.slice(state.rendered,showCount)){
  const article=document.createElement("article");article.className="card";
  const btn=document.createElement("button");btn.type="button";
  const cardName=c.player||"Unnamed";
  btn.setAttribute("aria-label","View "+cardName+" card details");
  const pic=text(btn,"div","","card-pic");
  if(safeImage(c.image)){
   if(!$("gallery-low-data-toggle").checked){
    const img=document.createElement("img");
    img.alt=(c.player||"Unnamed card")+" trading card front";
    // Apply loading hints and failure handling BEFORE src triggers a request.
    img.loading="lazy";img.decoding="async";img.fetchPriority="low";
    img.addEventListener("error",()=>{
     if(!img.isConnected)return;
     img.remove();
     const fallback=text(pic,"span","Photo temporarily unavailable. Open card for retry.","card-photo-unavailable");
     fallback.setAttribute("aria-hidden","true");
     btn.setAttribute("aria-label","View "+cardName+" card details; photo temporarily unavailable");
    },{once:true});
    pic.appendChild(img);
    img.src=c.image;
   }else{
    const skipped=text(pic,"span","Open for photo","card-photo-deferred");
    skipped.setAttribute("aria-hidden","true");
   }
  }
  if(c.identity_unconfirmed)text(pic,"span","NEEDS REVIEW","card-tag review-tag");
  else if(c.for_sale)text(pic,"span","OPEN TO OFFERS","card-tag");
  const meta=text(btn,"div","","card-meta");
  text(meta,"span",String(c.sport||"").toUpperCase(),"kicker");
  text(meta,"h3",c.player||"Unnamed card");
  if(c.identity_unconfirmed)text(meta,"p","Tentative identification · please verify","review-warning");
  const tags=features.OPTIONS.filter(f=>features.classify(c)[f.key]).map(f=>f.label);
  if(tags.length)text(meta,"p",tags.join(" / "),"card-feature-tags");
  const stamped=features.serialInfo(c).stamps;
  if(stamped.length)text(meta,"p","Stamped "+stamped.join(", "),"card-serial");
  text(meta,"p",[c.year,c.brand,c.set].filter(Boolean).join(" · "),"card-info");
  const foot=text(meta,"div","","card-foot"), price=text(foot,"span",fmtUSD(c.estimate_usd),"card-value");
  price.setAttribute("aria-label","Owner estimated card value "+price.textContent);
  const hist=Array.isArray(c.history)?c.history: [];
  text(foot,"small",hist.length>1?"↗ Price history":"Owner estimate",hist.length>1?"has-history":"");
  btn.addEventListener("click",()=>details(c));article.appendChild(btn);grid.appendChild(article);
 }
 state.rendered=showCount;
}
function makeHistory(container, values){
 if(values.length<2){text(container,"p",values.length===1?"One recorded weekly owner estimate; history builds over time.":"No weekly history recorded yet.","chart-note");return;}
 const series=values.filter(v=>Number.isFinite(v.value)), low=Math.min(...series.map(v=>v.value)),high=Math.max(...series.map(v=>v.value));
 const width=300,height=90,pad=10,spread=high-low || 1;
 const pts=series.map((v,i)=>[pad+i*(width-2*pad)/Math.max(1,series.length-1),height-pad-(v.value-low)/spread*(height-2*pad)]);
 const svg=document.createElementNS("http://www.w3.org/2000/svg","svg");svg.setAttribute("viewBox","0 0 300 90");svg.setAttribute("class","chart");svg.setAttribute("aria-label","Weekly estimate trend");svg.setAttribute("role","img");
 const line=document.createElementNS("http://www.w3.org/2000/svg","polyline");line.setAttribute("points",pts.map(p=>p.join(",")).join(" "));line.setAttribute("fill","none");line.setAttribute("stroke","#e9bb71");line.setAttribute("stroke-width","2.5");line.setAttribute("stroke-linejoin","round");svg.appendChild(line);container.appendChild(svg);
 text(container,"p",cleanDate(series[0].week)+" → "+cleanDate(series[series.length-1].week)+" · "+fmtUSD(series[0].value)+" → "+fmtUSD(series[series.length-1].value),"chart-note");
}
// Card details always remain readable if an approved public front image is missing.
function renderDetailPhoto(picture,c){
 const approved=safeImage(c.image);
 if(!approved){
  text(picture,"p","Card photo unavailable; card details are still available.","detail-photo-status");
  return;
 }
 const status=text(picture,"p","","detail-photo-status");
 status.setAttribute("role","status");status.hidden=true;
 const retry=text(picture,"button","Retry card photo","detail-photo-retry");
 retry.type="button";retry.hidden=true;
 let attempts=0,current=null;
 function request(retryRequest=false){
  if(current)current.remove();
  status.hidden=true;retry.hidden=true;
  const img=document.createElement("img");
  img.className="detail-photo";
  img.alt=(c.player||"Unnamed card")+" trading card front";
  img.loading="eager";img.decoding="async";img.fetchPriority="high";
  img.addEventListener("error",()=>{
   if(current!==img||!img.isConnected)return;
   img.remove();
   status.textContent=attempts>=2?
    "Photo still unavailable. Please try again later; card details remain accessible.":
    "Photo temporarily unavailable. Card details remain accessible.";
   status.hidden=false;
   retry.hidden=attempts>=2;
  },{once:true});
  current=img;
  picture.prepend(img);
  // Only user-triggered retry bypasses a possibly cached failed response.
  img.src=approved+(retryRequest?"?retry="+Date.now()+"-"+attempts:"");
 }
 retry.addEventListener("click",()=>{
  if(attempts>=2)return;
  attempts++;
  request(true);
 });
 request();
}
function details(c){
 history.replaceState(null,"","#card="+c.id);
 const body=$("detail-content");body.replaceChildren();
 const wrap=text(body,"div","","detail-grid");
 const picture=document.createElement("div");picture.className="detail-photo-wrap";wrap.appendChild(picture);
 renderDetailPhoto(picture,c);
 const info=text(wrap,"div","");
 text(info,"p",String(c.sport||"").toUpperCase(),"kicker");
 text(info,"h2",c.player||"Unnamed card","detail-title");
  text(info,"p",c.identity_unconfirmed?"NEEDS REVIEW · Identity, year, parallel and set are provisional.":"Verified in the private collection",c.identity_unconfirmed?"review-warning":"chart-note");
 text(info,"p",fmtUSD(c.estimate_usd),"detail-price");
 text(info,"p",c.identity_unconfirmed?"No value shown until this card is verified.":"Owner estimate per card — not a verified sale or price guarantee.","detail-copy");
 const properties=text(info,"div","","details-grid");
 const featureNames=features.OPTIONS.filter(f=>features.classify(c)[f.key]).map(f=>f.label);
 const serial=features.serialInfo(c);
 const pairs=[["Features",featureNames.join(", ")||"Not tagged"],["Year",c.year],["Team",c.team],["Set",[c.brand,c.set].filter(Boolean).join(" / ")],["Card #",c.number],["Parallel",c.parallel],["Owned",String(c.quantity)],["Available",c.for_sale?"Open to offers":"Not listed"]];
 if(publicPosition(c))pairs.splice(3,0,["Position",publicPosition(c)+" · "+(POSITION_NAMES[publicPosition(c)]||publicPosition(c))]);
 if(serial.numbered){
  pairs.splice(6,0,["Serial edition",serial.edition?"/"+serial.edition:"Numbered; run not confirmed"],
   ["Owned stamped copy",serial.needsReview?"Needs owner verification":serial.stamps.length?serial.stamps.join(", "):"Not published"]);
 }
 pairs.forEach(([name,v])=>{const block=text(properties,"div","");text(block,"b",name);text(block,"span",v||"—");});
 text(info,"h3","Estimated value history","chart-heading");
 makeHistory(info,Array.isArray(c.history)?c.history:[]);
 text(info,"p","Weekly snapshots show recorded owner estimates, not independently verified sold-comparable pricing.","chart-note");
 const share=text(info,"button","Copy a link to this card","sharelink");
 share.type="button";
 share.addEventListener("click",async()=>{
   const link=location.origin+location.pathname+location.search+"#card="+c.id;
   try {await navigator.clipboard.writeText(link);share.textContent="Card link copied"; }
   catch {share.textContent="Copy the URL from your address bar"; }
 }); if(c.for_sale && typeof c.ebay_url==="string" && /^https:\/\/www\.ebay\.com\/itm\//.test(c.ebay_url)){
   const link=text(info,"a","View eBay listing ↗","listing");link.href=c.ebay_url;link.target="_blank";link.rel="noopener noreferrer";
 }
 const report=text(info,"div","","feedback-panel");
 text(report,"h3","Help verify this card","chart-heading");
 text(report,"p","Found a wrong player, set, parallel, or card number? Send a suggestion directly from this page. No email app or account is needed. Only the owner can approve card changes.","detail-copy");
 const form=document.createElement("form");form.className="feedback-form";report.appendChild(form);
 const question=document.createElement("label");
 text(question,"span","Your assessment");
 const assessment=document.createElement("select");assessment.required=true;assessment.name="assessment";
 for(const [v,t] of [["correct","Looks correct"],["incorrect","Needs correction"]]){
   const opt=document.createElement("option");opt.value=v;opt.textContent=t;assessment.appendChild(opt);
 }
 question.appendChild(assessment);form.appendChild(question);
 const fieldlabel=document.createElement("label");text(fieldlabel,"span","What needs checking?");
 const category=document.createElement("select");category.name="field";
 for(const [v,t] of [["other","Other / general"],["player","Player"],["team","Team"],["year","Year"],["set","Brand or set"],["parallel","Parallel"],["number","Card number"],["serial","Stamped serial number"],["photo","Photo"]]){
   const opt=document.createElement("option");opt.value=v;opt.textContent=t;category.appendChild(opt);
 }
 fieldlabel.appendChild(category);form.appendChild(fieldlabel);
 const detailLabel=document.createElement("label");text(detailLabel,"span","Suggested correction or explanation");
 const textarea=document.createElement("textarea");textarea.maxLength=450;textarea.rows=3;textarea.name="suggestion";
 textarea.placeholder="Example: This is the silver parallel, not gold.";detailLabel.appendChild(textarea);form.appendChild(detailLabel);
 const honeypot=document.createElement("input");honeypot.name="_honey";honeypot.type="text";honeypot.tabIndex=-1;
 honeypot.autocomplete="off";honeypot.setAttribute("aria-hidden","true");honeypot.className="honey";form.appendChild(honeypot);
 const send=text(form,"button","Submit suggestion","feedback-submit");send.type="submit";
 const response=text(form,"p","","feedback-message");response.setAttribute("role","status");
 response.setAttribute("aria-live","polite");
 text(report,"p","Your suggestion is sent through FormSubmit to the collection owner for private review; it is not a newsletter signup or an automatic card edit. Please don't include personal information.","feedback-message");
 assessment.addEventListener("change",()=>{category.disabled=assessment.value==="correct";});
 category.disabled=true;
 let submitting=false;
 form.addEventListener("submit",async(ev)=>{
   ev.preventDefault();
   if(submitting||honeypot.value)return;
   const details=textarea.value.trim();
   if(assessment.value==="incorrect"&&details.length<8){
     response.textContent="Please describe what is wrong (at least eight characters).";return;
   }
   if(details.length>450){response.textContent="Please shorten your suggestion.";return;}
   submitting=true;send.disabled=true;send.textContent="Submitting...";
   response.textContent="Sending your suggestion...";
   const cardUrl=location.origin+location.pathname+"#card="+c.id;
   const payload={
     name:"JayTree Card Vault visitor",
     _subject:"Card Vault correction — "+String(c.number||"card"),
     _captcha:"true",_honey:"",
     "Card link":cardUrl,
     "Published player":String(c.player||"Unknown").slice(0,120),
     "Published set":[c.brand,c.set].filter(Boolean).join(" / ").slice(0,160),
     "Printed card number":String(c.number||"").slice(0,35),
     "Current review status":String(c.review_status||"Needs review").slice(0,35),
     Assessment:assessment.value==="correct"?"Looks correct":"Needs correction",
     "Field to check":assessment.value==="correct"?"Other / general":category.selectedOptions[0].textContent,
     "Suggested correction":details||(assessment.value==="correct"?"Looks correct to me.":""),
     "Owner review only":"This submission does not modify the collection."
   };
   try{
     const result=await fetch("https://formsubmit.co/ajax/jaytreebooks@gmail.com",{
       method:"POST",
       headers:{"Content-Type":"application/json","Accept":"application/json"},
       body:JSON.stringify(payload),cache:"no-store"
     });
     const data=await result.json();
     if(!result.ok||!(data&&String(data.success).toLowerCase()==="true")){
       throw new Error("Form provider did not accept submission");
     }
     response.textContent="Suggestion submitted. Thank you! The owner will review it before any change is made.";
     form.reset();category.disabled=true;
   }catch(_error){
     response.textContent="We couldn't submit the suggestion. Your text is still here; please try again later.";
   }finally{
     submitting=false;send.disabled=false;send.textContent="Submit suggestion";
   }
 });
 $("details").showModal();
}
async function load(){
 try{
  const res=await fetch("catalog.json",{cache:"no-store"});
  if(!res.ok)throw new Error("Catalog unavailable");
  const data=await res.json();
  if(data.schema!=="jaytree.public-showcase.v1"||data.readonly!==true||!Array.isArray(data.cards))throw new Error("Unexpected catalog format");
  state.cards=data.cards.filter(c=>c && safeImage(c.image));
  setPublishedCatalog(data);
  $("stat-count").textContent=state.cards.length.toLocaleString("en-US");
  const sum=state.cards.reduce((acc,c)=>acc+(Number.isFinite(c.estimate_usd)?c.estimate_usd*Math.max(1,c.quantity||1):0),0);
  $("stat-estimate").textContent=fmtUSD(sum);
  $("stat-sale").textContent=state.cards.filter(c=>c.for_sale).length.toLocaleString("en-US");
  $("stat-update").textContent=cleanDate(data.generated_at_utc);
  const sports=[...new Set(state.cards.map(c=>c.sport).filter(Boolean))].sort();
  for(const sport of sports){const option=document.createElement("option");option.value=sport;option.textContent=sport;$("sport").appendChild(option);}
  const years=[...new Set(state.cards.map(c=>String(c.year||"")).filter(v=>/^\d{4}$/.test(v)))].sort().reverse();
  for(const year of years){const opt=document.createElement("option");opt.value=year;opt.textContent=year;$("year").appendChild(opt);}
  for(const card of state.cards){
   if(!card.year&&!card.brand&&!card.set)continue;
   const key=setKey(card), group=state.sets.get(key)||{sport:card.sport,year:card.year,brand:card.brand,set:card.set,total:0,verified:0,numbers:new Set()};
   group.total++;
   if(card.review_status==="Verified")group.verified++;
   if(String(card.number||"").trim())group.numbers.add(String(card.number).trim());
   state.sets.set(key,group);
  }
  // Share published, read-only set group summaries with the public coverage widget.
  document.dispatchEvent(new CustomEvent("jaytree:public-set-groups-ready",{
   detail:[...state.sets.entries()].map(([id,g])=>({
    key:JSON.parse(id),sport:String(g.sport||""),year:String(g.year||""),
    brand:String(g.brand||""),set:String(g.set||""),
    distinct:g.numbers.size,entries:g.total,needsReview:g.total-g.verified
   }))
  }));
  refreshSetOptionLabels();
  await loadPublicPositions(data);
  refreshTeamAndPositionOptions();
  refreshFeatureCounts();
  if(!restoreBrowseFromHash())filtered();
  const deepLink=location.hash.match(/^#card=([a-f0-9]{24})$/);
  if(deepLink){const selected=state.cards.find(c=>c.id===deepLink[1]);if(selected)details(selected);}
 }catch(err){
  publishedSnapshot.catalog={failed:true};
  renderPublishedSnapshot();
  $("result-count").textContent="Catalog temporarily unavailable";
  $("empty").hidden=false;
  $("empty").querySelector("p").textContent="Please check back soon.";
 }
}
function renderSetSummary(){
 const box=$("set-summary");
 const value=$("set").value;
 if(!value){
  box.textContent="Browse "+state.sets.size+" cataloged set groups \u00b7 "+state.checklists.size+
   " with sourced numbered checklists. Counts show unique printed numbers, not duplicate physical copies.";
  return;
 }
 const group=state.sets.get(value);
 if(!group){box.textContent="Set not found in the published collection.";return;}
 const checklist=state.checklists.get(value);
 if(!checklist){
  box.textContent="No sourced total checklist yet \u00b7 "+group.numbers.size+
   " distinct numbered entries across "+group.total+" catalog entries ("+group.verified+" Verified, "+
   (group.total-group.verified)+" Needs review). Set total, missing count and completion percentage are unknown.";
  return;
 }
 const pct=Math.round(100*checklist.owned/checklist.total);
 const lead=document.createElement("strong");
 lead.textContent=checklist.owned+" / "+checklist.total+" owned ("+pct+"% complete)";
 box.replaceChildren(lead);
 box.appendChild(document.createTextNode(" \u00b7 "+checklist.missing+" missing \u00b7 "+group.total+
  " catalog entries representing "+checklist.owned+" distinct issued numbers. Repeated numbers and parallels count once."));
 if(group.total>group.verified)box.appendChild(document.createTextNode(
  " "+(group.total-group.verified)+" entries still need review, so identification is provisional."));
 if(checklist.missing){
  const link=document.createElement("a");
  link.href="#want-set="+encodeURIComponent(JSON.stringify(checklist.key));
  link.textContent="See "+checklist.missing+" missing numbered cards";
  box.appendChild(document.createTextNode(" \u00b7 "));
  box.appendChild(link);
 }
}
// Use the same checked public want-list snapshot, without an extra data request.
document.addEventListener("jaytree:checklists-ready",event=>{
 const sets=event.detail;
 if(!Array.isArray(sets))return;
 const next=new Map();
 for(const s of sets){
  if(!s||!Array.isArray(s.key)||s.key.length!==4||
     !s.key.every(v=>typeof v==="string")||
     !Number.isSafeInteger(s.total)||s.total<1||
     !Number.isSafeInteger(s.owned)||s.owned<0||s.owned>s.total||
     !Number.isSafeInteger(s.missing)||s.missing!==s.total-s.owned)continue;
  next.set(JSON.stringify(s.key),s);
 }
 state.checklists=next;
 if(state.sets.size){
  refreshSetOptionLabels();
  renderSetSummary();
 }
});
document.querySelectorAll('input[data-feature]').forEach(cb=>cb.addEventListener("change",filtered));
$("feature-clear").addEventListener("click",()=>{
 document.querySelectorAll('input[data-feature]').forEach(cb=>cb.checked=false);
 filtered();
});
$("set-finder").addEventListener("input",()=>{
 clearBrowseLinkFeedback();refreshSetOptionLabels();
});
$("set-sort").addEventListener("change",()=>{
 clearBrowseLinkFeedback();refreshSetOptionLabels();
});
$("collection-browse-reset").addEventListener("click",clearBrowseControls);
$("collection-native-share").addEventListener("click",nativeShareBrowseView);
$("collection-view-link").addEventListener("click",copyBrowseViewLink);
window.addEventListener("hashchange",()=>{
 if(state.cards.length&&location.hash.startsWith("#browse="))restoreBrowseFromHash();
});
["search","sport","team","position","review","year","set","sort","offers"].forEach(id=>$(id).addEventListener(id==="search"?"input":"change",filtered));
$("load-more").addEventListener("click",()=>{state.visibleCount+=PAGE_SIZE;renderCards();});
function updateLowDataView(announce=false){
 // Re-render only existing visible results; retain search/filter and Show More state.
 state.rendered=0;
 renderCards();
 if(announce)$("gallery-low-data-status").textContent=$("gallery-low-data-toggle").checked?
  "Low-data view enabled. Gallery photos are skipped; open any card to load its photo.":
  "Photo gallery restored. Photos load lazily as you browse.";
}
$("gallery-low-data-toggle").addEventListener("change",()=>updateLowDataView(true));
// Only auto-select for a browser reporting an explicit user Save-Data preference.
// Do not infer mobile users want photos hidden. No persistent visitor tracking.
$("gallery-low-data-toggle").checked=navigator.connection?.saveData===true;
$("gallery-low-data-status").textContent=$("gallery-low-data-toggle").checked?
 "Your browser requested data saving. Open any card to load its photo.":"";
$("close").addEventListener("click",()=>$("details").close());
$("details").addEventListener("close",()=>{if(location.hash.startsWith("#card="))history.replaceState(null,"",location.pathname+location.search+"#collection");});
$("details").addEventListener("click",(ev)=>{if(ev.target===$("details"))$("details").close();});
load();