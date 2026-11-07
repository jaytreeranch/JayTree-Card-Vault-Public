"use strict";
const state = { cards: [], results: [] };
const $ = (id) => document.getElementById(id);
const fmtUSD = (v) => typeof v === "number" && Number.isFinite(v) ? new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(v) : "Not valued";
const safeImage = (path) => typeof path === "string" && /^assets\/[a-f0-9]{24}\.jpg$/.test(path) ? path : "";
const value = (c) => typeof c.estimate_usd === "number" ? c.estimate_usd : -1;
const text = (parent, name, content, className) => {const n=document.createElement(name);n.textContent=content || "";if(className)n.className=className;parent.appendChild(n);return n;};
const cleanDate = (s) => /^\d{4}-\d{2}-\d{2}/.test(s||"") ? s.slice(0,10) : "—";
function filtered() {
 const q = $("search").value.trim().toLocaleLowerCase(), sport=$("sport").value, review=$("review").value, offers=$("offers").checked;
 const selected=state.cards.filter(c =>
   (!sport || c.sport===sport) && (!review || c.review_status===review) && (!offers || c.for_sale) &&
   [c.player,c.team,c.brand,c.set,c.year,c.number,c.parallel].join(" ").toLowerCase().includes(q));
 switch($("sort").value){
  case "value-high":selected.sort((a,b)=>value(b)-value(a));break;
  case "value-low":selected.sort((a,b)=>(value(a)<0?Infinity:value(a))-(value(b)<0?Infinity:value(b)));break;
  case "new":selected.sort((a,b)=>parseInt(b.year||"0",10)-parseInt(a.year||"0",10));break;
  case "old":selected.sort((a,b)=>parseInt(a.year||"0",10)-parseInt(b.year||"0",10));break;
  default:selected.sort((a,b)=>(a.player||"").localeCompare(b.player||""));
 }
 state.results=selected;
 renderCards();
}
function renderCards(){
 const grid=$("grid");grid.replaceChildren();
 const cards=state.results;
 $("result-count").textContent=cards.length+" of "+state.cards.length+" displayed";
 $("empty").hidden=cards.length>0;
 for(const c of cards){
  const article=document.createElement("article");article.className="card";
  const btn=document.createElement("button");btn.type="button";btn.setAttribute("aria-label","View "+c.player+" card details");
  const pic=text(btn,"div","","card-pic");
  if(safeImage(c.image)){const img=document.createElement("img");img.src=c.image;img.alt=c.player+" trading card front";img.loading="lazy";pic.appendChild(img);}
  if(c.identity_unconfirmed)text(pic,"span","NEEDS REVIEW","card-tag review-tag");
  else if(c.for_sale)text(pic,"span","OPEN TO OFFERS","card-tag");
  const meta=text(btn,"div","","card-meta");
  text(meta,"span",String(c.sport||"").toUpperCase(),"kicker");
  text(meta,"h3",c.player||"Unnamed card");
  if(c.identity_unconfirmed)text(meta,"p","Tentative identification · please verify","review-warning");
  text(meta,"p",[c.year,c.brand,c.set].filter(Boolean).join(" · "),"card-info");
  const foot=text(meta,"div","","card-foot"), price=text(foot,"span",fmtUSD(c.estimate_usd),"card-value");
  price.setAttribute("aria-label","Owner estimated card value "+price.textContent);
  const hist=Array.isArray(c.history)?c.history: [];
  text(foot,"small",hist.length>1?"↗ Price history":"Owner estimate",hist.length>1?"has-history":"");
  btn.addEventListener("click",()=>details(c));article.appendChild(btn);grid.appendChild(article);
 }
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
 const pairs=[["Year",c.year],["Team",c.team],["Set",[c.brand,c.set].filter(Boolean).join(" / ")],["Card #",c.number],["Parallel",c.parallel],["Owned",String(c.quantity)],["Available",c.for_sale?"Open to offers":"Not listed"]];
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
 for(const [v,t] of [["other","Other / general"],["player","Player"],["team","Team"],["year","Year"],["set","Brand or set"],["parallel","Parallel"],["number","Card number"],["photo","Photo"]]){
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
  filtered();
  const deepLink=location.hash.match(/^#card=([a-f0-9]{24})$/);
  if(deepLink){const selected=state.cards.find(c=>c.id===deepLink[1]);if(selected)details(selected);}
 }catch(err){
  $("result-count").textContent="Catalog temporarily unavailable";
  $("empty").hidden=false;
  $("empty").querySelector("p").textContent="Please check back soon.";
 }
}
["search","sport","review","sort","offers"].forEach(id=>$(id).addEventListener(id==="search"?"input":"change",filtered));
$("close").addEventListener("click",()=>$("details").close());
$("details").addEventListener("close",()=>{if(location.hash.startsWith("#card="))history.replaceState(null,"",location.pathname+location.search+"#collection");});
$("details").addEventListener("click",(ev)=>{if(ev.target===$("details"))$("details").close();});
load();