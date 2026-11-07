"use strict";
const PAGE_SIZE = 48;
const state = { cards: [], results: [], rendered: 0, visibleCount: PAGE_SIZE, sets: new Map(), checklists: new Map() };
const features=window.JayTreeCardFeatures;
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
}

const $ = (id) => document.getElementById(id);
const fmtUSD = (v) => typeof v === "number" && Number.isFinite(v) ? new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(v) : "Not valued";
const safeImage = (path) => typeof path === "string" && /^assets\/[a-f0-9]{24}\.jpg$/.test(path) ? path : "";
const value = (c) => typeof c.estimate_usd === "number" ? c.estimate_usd : -1;
const text = (parent, name, content, className) => {const n=document.createElement(name);n.textContent=content || "";if(className)n.className=className;parent.appendChild(n);return n;};
const cleanDate = (s) => /^\d{4}-\d{2}-\d{2}/.test(s||"") ? s.slice(0,10) : "—";
function filtered() {
 const q = $("search").value.trim().toLocaleLowerCase(),
       sport=$("sport").value, review=$("review").value, year=$("year").value,
       ownedSet=$("set").value, offers=$("offers").checked;
 const anyFeatures=selectedFeatures();
 const selected=state.cards.filter(c =>
   (!sport || c.sport===sport) && (!review || c.review_status===review) &&
   (!year || String(c.year||"")===year) && (!ownedSet || setKey(c)===ownedSet) &&
   (!offers || c.for_sale) &&
   features.matchesAny(c,anyFeatures) &&
   [c.player,c.team,c.brand,c.set,c.year,c.number,c.parallel].join(" ").toLowerCase().includes(q));
 switch($("sort").value){
  case "value-high":selected.sort((a,b)=>value(b)-value(a));break;
  case "value-low":selected.sort((a,b)=>(value(a)<0?Infinity:value(a))-(value(b)<0?Infinity:value(b)));break;
  case "new":selected.sort((a,b)=>parseInt(b.year||"0",10)-parseInt(a.year||"0",10));break;
  case "old":selected.sort((a,b)=>parseInt(a.year||"0",10)-parseInt(b.year||"0",10));break;
  default:selected.sort((a,b)=>(a.player||"").localeCompare(b.player||""));
 }
 state.results=selected;
 state.rendered=0;
 state.visibleCount=PAGE_SIZE;
 renderCards();
 renderSetSummary();
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
  const btn=document.createElement("button");btn.type="button";btn.setAttribute("aria-label","View "+c.player+" card details");
  const pic=text(btn,"div","","card-pic");
  if(safeImage(c.image)){const img=document.createElement("img");img.src=c.image;img.alt=c.player+" trading card front";img.loading="lazy";img.decoding="async";pic.appendChild(img);}
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
function details(c){
 history.replaceState(null,"","#card="+c.id);
 const body=$("detail-content");body.replaceChildren();
 const wrap=text(body,"div","","detail-grid");
 const picture=document.createElement("div");wrap.appendChild(picture);
 if(safeImage(c.image)){const img=document.createElement("img");img.className="detail-photo";img.src=c.image;img.alt=c.player+" trading card";picture.appendChild(img);}
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
 text(report,"p","Suggest a correction or say this card looks correct. This prepares an email draft; you must SEND that email yourself. Only the owner can approve, reject or edit a card.","detail-copy");
 const form=document.createElement("form");form.className="feedback-form";report.appendChild(form);
 const question=document.createElement("label");
 text(question,"span","Your assessment");
 const assessment=document.createElement("select");assessment.required=true;
 for(const [v,t] of [["correct","Looks correct"],["incorrect","Needs correction"]]){
   const opt=document.createElement("option");opt.value=v;opt.textContent=t;assessment.appendChild(opt);
 }
 question.appendChild(assessment);form.appendChild(question);
 const fieldlabel=document.createElement("label");text(fieldlabel,"span","What needs checking?");
 const category=document.createElement("select");
 for(const [v,t] of [["other","Other / general"],["player","Player"],["team","Team"],["year","Year"],["set","Brand or set"],["parallel","Parallel"],["number","Card number"],["serial","Stamped serial number"],["photo","Photo"]]){
   const opt=document.createElement("option");opt.value=v;opt.textContent=t;category.appendChild(opt);
 }
 fieldlabel.appendChild(category);form.appendChild(fieldlabel);
 const detailLabel=document.createElement("label");text(detailLabel,"span","Suggested correction or explanation");
 const textarea=document.createElement("textarea");textarea.maxLength=450;textarea.rows=3;textarea.placeholder="Example: This looks like the silver parallel, not gold.";detailLabel.appendChild(textarea);form.appendChild(detailLabel);
 const honeypot=document.createElement("input");honeypot.name="website";honeypot.tabIndex=-1;honeypot.autocomplete="off";honeypot.setAttribute("aria-hidden","true");honeypot.className="honey";form.appendChild(honeypot);
 const send=text(form,"button","Prepare correction email","feedback-submit");send.type="submit";
 const response=text(form,"p","","feedback-message");response.setAttribute("role","status");
 assessment.addEventListener("change",()=>{category.disabled=assessment.value==="correct";});
 category.disabled=true;
 form.addEventListener("submit",(ev)=>{
  ev.preventDefault();
  if(honeypot.value)return;
  if(assessment.value==="incorrect"&&textarea.value.trim().length<8){
   response.textContent="Please describe what is wrong (at least eight characters).";return;
  }
  const subject="JayTree Card Vault identification suggestion: "+c.id;
  const message=[
   "Card: "+(c.player||"Unknown")+" ("+c.id+")",
   "Gallery: "+location.origin+location.pathname+"#card="+c.id,
   "Current status: "+(c.review_status||"Needs review"),
   "Assessment: "+(assessment.value==="correct"?"Looks correct":"Needs correction"),
   "Field: "+(assessment.value==="correct"?"other":category.value),
   "Details: "+textarea.value.trim(),
   "",
   "Visitor suggestion only; not an automatic card verification."
  ].join("\n");
  const email="mailto:jaytreebooks@gmail.com?subject="+encodeURIComponent(subject)
   +"&body="+encodeURIComponent(message);
  response.textContent="An email draft should open. Please press Send in your email app; this website has not submitted anything automatically.";
  window.location.href=email;
 });
 const reportIssue=text(report,"a","Submit a GitHub card report (account required)","github-report");
 reportIssue.target="_blank";reportIssue.rel="noopener noreferrer";
 const reportLink=()=> {
  const subject="[Card suggestion] "+c.id;
  const cardUrl=location.origin+location.pathname+"#card="+c.id;
  const reportCategory=assessment.value==="correct"?"Other / general":category.value;
  const description=textarea.value.trim()||(assessment.value==="correct"?"Looks correct to me.":"");
  return "https://github.com/jaytreeranch/JayTree-Card-Vault-Public/issues/new"
   +"?template=card-correction.yml"
   +"&title="+encodeURIComponent(subject)
   +"&card-link="+encodeURIComponent(cardUrl)
   +"&assessment="+encodeURIComponent(assessment.value==="correct"?"Looks correct":"Needs correction")
   +"&field="+encodeURIComponent(reportCategory)
   +"&correction-details="+encodeURIComponent(description);
 };
 reportIssue.href=reportLink();
 reportIssue.addEventListener("click",(ev)=>{
  if(assessment.value==="incorrect"&&textarea.value.trim().length<8){
   ev.preventDefault();
   response.textContent="Please describe the suspected error before opening GitHub.";
   return;
  }
  reportIssue.href=reportLink();
 });
 text(report,"p","GitHub requires signing in. Submitted reports and usernames are public. Do not include personal details; reports are only suggestions and cannot change the private collection.","feedback-message");
 $("details").showModal();
}
async function load(){
 try{
  const res=await fetch("catalog.json",{cache:"no-store"});
  if(!res.ok)throw new Error("Catalog unavailable");
  const data=await res.json();
  if(data.schema!=="jaytree.public-showcase.v1"||data.readonly!==true||!Array.isArray(data.cards))throw new Error("Unexpected catalog format");
  state.cards=data.cards.filter(c=>c && safeImage(c.image));
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
  refreshFeatureCounts();
  filtered();
  const deepLink=location.hash.match(/^#card=([a-f0-9]{24})$/);
  if(deepLink){const selected=state.cards.find(c=>c.id===deepLink[1]);if(selected)details(selected);}
 }catch(err){
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
$("set-finder").addEventListener("input",refreshSetOptionLabels);
$("set-sort").addEventListener("change",refreshSetOptionLabels);
["search","sport","review","year","set","sort","offers"].forEach(id=>$(id).addEventListener(id==="search"?"input":"change",filtered));
$("load-more").addEventListener("click",()=>{state.visibleCount+=PAGE_SIZE;renderCards();});
$("close").addEventListener("click",()=>$("details").close());
$("details").addEventListener("close",()=>{if(location.hash.startsWith("#card="))history.replaceState(null,"",location.pathname+location.search+"#collection");});
$("details").addEventListener("click",(ev)=>{if(ev.target===$("details"))$("details").close();});
load();