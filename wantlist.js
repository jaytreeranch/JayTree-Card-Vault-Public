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
// Printed checklist number is a set-scoped identifier, never a per-copy serial stamp.
const cardUrl=(s,card)=>location.origin+location.pathname+
 "#want-card="+encodeURIComponent(JSON.stringify([...s.key,String(card.number)]));
function addCardShare(parent,s,card){
 const button=text(parent,"button","Copy card link","want-card-share");
 button.type="button";
 button.setAttribute("aria-label","Copy shareable link to "+s.set+" card #"+card.number);
 button.addEventListener("click",async()=>{
  const url=cardUrl(s,card);
  try{
   if(!navigator.clipboard?.writeText)throw new Error("Clipboard not available");
   await navigator.clipboard.writeText(url);
   button.textContent="Card link copied";
  }catch{
   // Safe, visible manual alternative for blocked clipboard contexts.
   const input=document.createElement("input");
   input.type="text";input.readOnly=true;input.value=url;
   input.className="want-share-fallback want-card-share-fallback";
   input.setAttribute("aria-label","Select and copy this missing-card link");
   button.replaceWith(input);
   input.focus();input.select();
  }
 });
}
const issueRoot="https://github.com/jaytreeranch/JayTree-Card-Vault-Public/issues/new";
function issueLink(s,card){
 const params=new URLSearchParams({
  template:"missing-card-offer.yml",
  title:"[Missing card offer] "+s.year+" "+s.set+" #"+card.number,
  "set-name":title(s),
  "card-number":card.number,
  "card-name":card.player||"Numbered card #"+card.number,
  "set-link":cardUrl(s,card)
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
  "Specific missing card: "+cardUrl(s,card),
  "",
  "Condition, variation/parallel, asking price and other details:",
  "",
  "This is an inquiry only, not an accepted transaction."
 ].join("\n");
 return "mailto:jaytreebooks@gmail.com?subject="+encodeURIComponent(subject)+"&body="+encodeURIComponent(body);
}
// Client-only inquiry builder. Fields are transient and never posted to the Vault.
let currentOffer=null;
function offerValues(){
 const condition=$("offer-condition").value;
 const variation=$("offer-variation").value.trim();
 const price=$("offer-asking-price").value.trim();
 const photo=$("offer-photo-url").value.trim();
 const note=$("offer-note").value.trim();
 const lines=[
  "Condition: "+condition,
  "Variant / parallel: "+(variation||"Not specified"),
  "Asking price: "+(price||"Not specified"),
  "Public photo: "+(photo||"Not provided"),
  "Notes: "+(note||"None")
 ];
 return {condition,variation,price,photo,note,details:lines.join("\n")};
}
function validateOfferPhoto(url){
 if(!url)return true;
 try{
  const parsed=new URL(url);
  const host=parsed.hostname.toLowerCase();
  // Avoid accidentally publishing a private LAN photo-service address.
  const privateHost=host==="localhost"||host.endsWith(".localhost")||
   host.endsWith(".local")||host.endsWith(".lan")||
   host.endsWith(".internal")||host.includes(":")||
   /^\d+(?:\.\d+){3}$/.test(host);
  return parsed.protocol==="https:"&&!!host&&!privateHost&&
   !parsed.username&&!parsed.password;
 }catch{return false;}
}
function refreshOfferLinks(){
 if(!currentOffer)return;
 const {set:s,card:c}=currentOffer,v=offerValues();
 const photoInput=$("offer-photo-url");
 const photoOK=validateOfferPhoto(v.photo);
 photoInput.setCustomValidity(photoOK?"":"Enter a public HTTPS photo link, without a username or password.");
 photoInput.setAttribute("aria-invalid",String(!photoOK));
 const valid=photoOK&&$("offer-form").checkValidity();
 const email=$("offer-email-out"),github=$("offer-github-out");
 email.removeAttribute("href");
 email.setAttribute("aria-disabled","true");
 github.removeAttribute("href");
 github.setAttribute("aria-disabled","true");
 $("offer-email-help").textContent="Opens your email app for review; does not send.";
 $("offer-github-help").textContent="Check the public-issue notice above to enable GitHub.";
 if(!valid){
  $("offer-error").textContent="Enter a public HTTPS photo URL without private network addresses, or leave it empty.";
  $("offer-email-help").textContent="Unavailable while the photo link is invalid.";
  $("offer-github-help").textContent="Unavailable while the photo link is invalid.";
  return;
 }
 const emailBody=[
  "Hello JayTree,",
  "I may have a card from your public want list.",
  "Set: "+title(s),
  "Printed number: #"+c.number,
  "Name: "+(c.player||"Not independently verified"),
  "Public missing card: "+cardUrl(s,c),
  "",
  v.details,
  "",
  "This is a nonbinding inquiry only. Please confirm card identity and variation."
 ].join("\n");
 const emailUrl="mailto:jaytreebooks@gmail.com?subject="+encodeURIComponent(
  "Card Vault missing #"+c.number+" - "+s.set)+
  "&body="+encodeURIComponent(emailBody);
 const params=new URL(issueLink(s,c));
 params.searchParams.set("condition",v.condition);
 params.searchParams.set("variation",v.variation);
 params.searchParams.set("asking-price",v.price);
 params.searchParams.set("photo-url",v.photo);
 params.searchParams.set("offer-details",v.details);
 const issueUrl=params.toString();
 if(emailUrl.length<=4000){
  email.href=emailUrl;
  email.setAttribute("aria-disabled","false");
 }else{
  $("offer-email-help").textContent="Shorten the details to create an email draft.";
 }
 const consent=$("offer-public-ok").checked;
 if(consent&&issueUrl.length<=3500){
  github.href=issueUrl;
  github.setAttribute("aria-disabled","false");
  $("offer-github-help").textContent="Opens a public issue draft; review it before submitting.";
 }else if(issueUrl.length>3500){
  $("offer-github-help").textContent="Shorten the details to enable the GitHub issue.";
 }
 $("offer-error").textContent=issueUrl.length>3500?
  "The GitHub link is too long. Shorten the details, or use email.":
  emailUrl.length>4000?"The email draft is too long. Shorten the details.":"";
}
function openOffer(s,card){
 if(!s||!card||!s.missing_cards.some(c=>c.number===card.number))return;
 currentOffer={set:s,card};
 $("offer-form").reset();
 $("offer-photo-url").setCustomValidity("");
 $("offer-card-heading").textContent=title(s)+" ? #"+card.number+
  (card.player?" ? "+card.player:" ? Player name not independently verified");
 refreshOfferLinks();
 $("offer-dialog").showModal();
 $("offer-condition").focus();
}
function bindOfferLink(link,s,card){
 // Keep original GitHub href as a fallback if JavaScript interaction fails.
 link.setAttribute("aria-haspopup","dialog");
 link.addEventListener("click",event=>{
  if(event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
  event.preventDefault();
  openOffer(s,card);
 });
}
// The top three opportunities are based ONLY on vetted, issued-numbered totals.
function renderPriorities(){
 const panel=$("want-priority"),grid=$("want-priority-grid");
 const ranked=state.sets.filter(s=>s.missing>0).sort((a,b)=>
  a.missing-b.missing||b.progress_percent-a.progress_percent||
  title(a).localeCompare(title(b))).slice(0,3);
 grid.replaceChildren();
 panel.hidden=ranked.length===0;
 if(!ranked.length)return;
 const near=state.sets.filter(s=>s.missing>=1&&s.missing<=2).length;
 $("want-priority-summary").textContent=fmt(near)+" sourced "+(near===1?"set":"sets")+" with 1?2 cards left";
 for(const [i,s] of ranked.entries()){
  const card=text(grid,"article","","want-priority-card");
  text(card,"p","PRIORITY "+(i+1)+" ? "+s.sport+" ? "+s.year,"want-set-meta");
  text(card,"h4",s.set,"want-priority-title");
  const row=text(card,"div","","want-priority-stats");
  text(row,"strong",fmt(s.missing)+" "+(s.missing===1?"card":"cards")+" missing");
  text(row,"span",fmt(s.owned)+" of "+fmt(s.total)+" ? "+s.progress_percent+"% complete");
  const track=text(card,"div","","want-track");
  track.setAttribute("role","progressbar");
  track.setAttribute("aria-label",s.set+" set completion");
  track.setAttribute("aria-valuemin","0");
  track.setAttribute("aria-valuemax","100");
  track.setAttribute("aria-valuenow",String(s.progress_percent));
  text(track,"div","","want-track-fill").style.width=Math.min(100,Math.max(0,s.progress_percent))+"%";
  const btn=text(card,"button","View "+fmt(s.missing)+" missing "+(s.missing===1?"card":"cards"),"want-priority-open");
  btn.type="button";btn.addEventListener("click",()=>openSet(s));
 }
}
function renderTiles(){
 const list=$("wantlist-sets");list.replaceChildren();
 const search=$("wantlist-search").value.trim().toLowerCase();
 const sport=$("wantlist-sport").value;
 const named=$("wantlist-named").value;
 const order=$("wantlist-sort").value;
 const gap=$("wantlist-gap").value;
 const inGap=m=>!gap||
  (gap==="1-2"&&m>=1&&m<=2)||
  (gap==="3-10"&&m>=3&&m<=10)||
  (gap==="11+"&&m>=11);
 let matches=state.sets.filter(s=>(!sport||s.sport===sport)&&
  (!named||s.reference_player_names_complete===true)&&
  inGap(s.missing)&&
  (!search||title(s).toLowerCase().includes(search)||s.sport.toLowerCase().includes(search)));
 const byTitle=(a,b)=>title(a).localeCompare(title(b));
 matches.sort((a,b)=>{
  if(order==="percent")return b.progress_percent-a.progress_percent||a.missing-b.missing||byTitle(a,b);
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
function matchingMissing(s){
 const q=$("wantlist-missing-search").value.trim().toLocaleLowerCase();
 const exact=q.startsWith("#")?q.slice(1):null;
 return s.missing_cards.filter(c=>exact!==null?
  c.number.toLocaleLowerCase()===exact:
  !q||c.number.toLocaleLowerCase().includes(q)||(c.player||"").toLocaleLowerCase().includes(q)||
  (c.team||"").toLocaleLowerCase().includes(q));
}
// Always quote cells and escape spreadsheet formula prefixes, even in imported reference text.
// CSV is a user-selected download: never upload, post or expose private per-copy card data.
function csvCell(value){
 const cleaned=String(value??"").replace(/[\x00-\x1f\x7f]/g," ").trim();
 const safe=/^[=+\-@]/.test(cleaned)?"'"+cleaned:cleaned;
 return '"'+safe.replace(/"/g,'""')+'"';
}
function exportMissingCsv(){
 const s=state.selected;if(!s||!state.sets.includes(s))return;
 const matches=matchingMissing(s);
 if(!matches.length)return;
 const names=["Sport","Year","Brand","Set","Printed number","Published player reference",
  "Published team reference","Public checklist source","Public missing card link","Identity caution"];
 const entries=matches.map(c=>[
  s.sport,s.year,s.brand,s.set,String(c.number),c.player||"",c.team||"",
  sourceValid(s.source.url)?s.source.url:"",cardUrl(s,c),
  c.player?"Reference may be provisional; confirm printed number and variation":
   "Player not independently named; confirm printed number and variation"
 ]);
 const csv="\uFEFF"+[names,...entries].map(columns=>columns.map(csvCell).join(",")).join("\r\n")+"\r\n";
 const blob=new Blob([csv],{type:"text/csv;charset=utf-8"});
 const url=URL.createObjectURL(blob);
 const anchor=document.createElement("a");
 const basename=[s.year,s.brand,s.set].filter(Boolean).join("_")
  .replace(/[^A-Za-z0-9]+/g,"_").replace(/^_+|_+$/g,"").slice(0,80)||"sourced_set";
 anchor.download="JayTree_Missing_"+basename+".csv";
 anchor.href=url;anchor.hidden=true;
 document.body.appendChild(anchor);
 anchor.click();anchor.remove();
 setTimeout(()=>URL.revokeObjectURL(url),1000);
 $("wantlist-export-status").textContent="Prepared "+fmt(matches.length)+
  " missing numbered "+(matches.length===1?"card":"cards")+" for CSV download.";
}
function clearPrintSheet(){
 document.body.classList.remove("print-wantlist");
 $("want-print-content").replaceChildren();
 $("want-print-content").hidden=true;
}
function printMissing(){
 const s=state.selected;
 if(!s||!state.sets.includes(s)||!$("wantlist-dialog").open)return;
 const matches=matchingMissing(s);
 if(!matches.length)return;
 const sheet=$("want-print-content");
 sheet.replaceChildren();sheet.hidden=false;
 text(sheet,"h1","JayTree Card Vault - Missing Card Checklist");
 text(sheet,"h2",title(s));
 text(sheet,"p",s.sport+" | "+fmt(s.owned)+" / "+fmt(s.total)+
  " distinct issued numbered spots owned | "+fmt(s.missing)+" missing in sourced set","want-print-meta");
 text(sheet,"p","Public snapshot: "+fmt(matches.length)+" matching missing numbered spots. Not a live inventory.","want-print-meta");
 text(sheet,"p","Published checklist: "+(s.source.description||"Sourced numbered reference"),"want-print-meta");
 if(sourceValid(s.source.url)){
  const source=text(sheet,"p","","want-print-source");
  const link=text(source,"a",s.source.url);
  link.href=s.source.url;link.rel="noopener noreferrer";
 }
 text(sheet,"p","Set link: "+setUrl(s),"want-print-url");
 text(sheet,"p","Identity caution: player/team names may be provisional. Unnamed cards are not "+
  "independently identified. Confirm printed number, exact set, variation and condition "+
  "before offering.","want-print-warning");
 const table=text(sheet,"table","","want-print-table");
 const thead=text(table,"thead");
 const head=text(thead,"tr");
 for(const label of ["Have?","Printed #","Published player reference","Published team reference"]){
  text(head,"th",label).scope="col";
 }
 const body=text(table,"tbody");
 for(const card of matches){
  const tr=text(body,"tr");
  text(tr,"td","[  ]");
  text(tr,"td","#"+card.number);
  text(tr,"td",card.player||"Not independently named");
  text(tr,"td",card.team||"?");
 }
 text(sheet,"p","Distinct issued printed numbers only; duplicates and same-number parallels "+
  "do not count as more set spots. Source and identities may need confirmation.","want-print-footer");
 document.body.classList.add("print-wantlist");
 $("wantlist-export-status").textContent="Print view prepared for "+fmt(matches.length)+
  " missing numbered cards. Choose Print or Save as PDF in your browser.";
 try{window.print();}catch{clearPrintSheet();}
}
function renderMissing(){
 const s=state.selected;if(!s)return;
 const list=$("wantlist-missing-list");
 const items=matchingMissing(s);
 const exportButton=$("wantlist-export-csv");
 exportButton.disabled=items.length===0;
 exportButton.textContent="Download "+fmt(items.length)+" matching missing "+(items.length===1?"card":"cards")+" (CSV)";
 const printButton=$("wantlist-print");
 printButton.disabled=items.length===0;
 printButton.textContent="Print "+fmt(items.length)+" matching missing "+(items.length===1?"card":"cards");
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
  bindOfferLink(issue,s,c);
  const email=text(links,"a","Email owner","want-email-link");
  email.href=emailLink(s,c);
  addCardShare(links,s,c);
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
  open.addEventListener("click",()=>openSet(s,c));
  addCardShare(actions,s,c);
  const email=text(actions,"a","Email owner","want-email-link");email.href=emailLink(s,c);
  const issue=text(actions,"a","I have this card","want-offer-link");
  issue.href=issueLink(s,c);issue.target="_blank";issue.rel="noopener noreferrer";
  bindOfferLink(issue,s,c);
 }
 $("want-global-count").textContent=fmt(visible)+" of "+fmt(matches.length)+
  " matching missing numbered cards shown. Identifications may be provisional.";
 $("want-global-more").hidden=visible>=matches.length;
}
function openSet(s,selectedCard=null){
 // Only a vetted missing number from this exact sourced set can be deep-linked.
 if(selectedCard&&!s.missing_cards.some(c=>c.number===selectedCard.number))return;
 state.selected=s;state.visible=PAGE;
 $("wantlist-dialog-content").replaceChildren();
 const panel=$("wantlist-dialog-content");
 text(panel,"p",s.sport+" · "+s.year,"want-set-meta");
 text(panel,"h2",title(s),"want-dialog-title");
 if(selectedCard){
  const selected=text(panel,"p","Shared missing card: #"+selectedCard.number+
   (selectedCard.player?" - "+selectedCard.player:" (name not yet verified)"),"want-shared-card");
  selected.setAttribute("role","status");
 }
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
 $("wantlist-missing-search").value=selectedCard?"#"+selectedCard.number:"";
 $("wantlist-export-status").textContent="";
 clearPrintSheet();
 $("wantlist-missing-list").replaceChildren();
 if(!$("wantlist-dialog").open)$("wantlist-dialog").showModal();
 renderMissing();
}
function parseHash(){
 const hash=location.hash;
 if(hash.startsWith("#want-card=")){
  // Fail closed for malformed, stale or tampered links; never invent a missing card.
  try{
   if(hash.length>2500)return;
   const parts=JSON.parse(decodeURIComponent(hash.slice("#want-card=".length)));
   if(!Array.isArray(parts)||parts.length!==5||!parts.every(v=>typeof v==="string"))return;
   const found=state.sets.find(s=>key(s)===JSON.stringify(parts.slice(0,4)));
   const card=found?.missing_cards.find(c=>c.number===parts[4]);
   if(found&&card)openSet(found,card);
  }catch{/* Invalid or outdated card link: keep the gallery usable. */}
  return;
 }
 if(!hash.startsWith("#want-set="))return;
 try{
  const desired=JSON.stringify(JSON.parse(decodeURIComponent(hash.slice("#want-set=".length))));
  const found=state.sets.find(s=>key(s)===desired);
  if(found)openSet(found);
 }catch{/* malformed legacy set link: keep gallery usable */}
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
  renderPriorities();
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
$("wantlist-gap").addEventListener("change",renderTiles);
$("wantlist-named").addEventListener("change",()=>{renderTiles();searchAllMissing();});
$("want-global-search").addEventListener("input",searchAllMissing);
$("want-global-more").addEventListener("click",()=>{
 state.globalVisible+=PAGE;
 renderGlobalMissing();
});
$("wantlist-missing-search").addEventListener("input",()=>{state.visible=PAGE;$("wantlist-missing-list").replaceChildren();renderMissing();});
$("wantlist-more").addEventListener("click",()=>{state.visible+=PAGE;renderMissing();});
$("wantlist-export-csv").addEventListener("click",exportMissingCsv);
$("wantlist-print").addEventListener("click",printMissing);
window.addEventListener("afterprint",clearPrintSheet);
$("wantlist-dialog").addEventListener("close",()=>{
 // A delayed close event from a previously closed modal must not wipe a newly
 // opened set's print preparation. Real close still clears all print-only DOM.
 if(!$("wantlist-dialog").open)clearPrintSheet();
});
$("wantlist-close").addEventListener("click",()=>$("wantlist-dialog").close());
$("wantlist-dialog").addEventListener("click",e=>{if(e.target===$("wantlist-dialog"))$("wantlist-dialog").close();});
for(const name of ["offer-condition","offer-variation","offer-asking-price","offer-photo-url","offer-note","offer-public-ok"]){
 $(name).addEventListener("input",refreshOfferLinks);
 $(name).addEventListener("change",refreshOfferLinks);
}
$("offer-email-out").addEventListener("click",e=>{
 if(!$("offer-email-out").hasAttribute("href"))e.preventDefault();
});
$("offer-github-out").addEventListener("click",e=>{
 if(!$("offer-github-out").hasAttribute("href"))e.preventDefault();
});
$("offer-close").addEventListener("click",()=>$("offer-dialog").close());
$("offer-dialog").addEventListener("click",e=>{
 if(e.target===$("offer-dialog"))$("offer-dialog").close();
});
$("offer-dialog").addEventListener("close",()=>{
 currentOffer=null;
 $("offer-form").reset();
 $("offer-error").textContent="";
 $("offer-photo-url").setCustomValidity("");
 $("offer-photo-url").setAttribute("aria-invalid","false");
 $("offer-email-out").removeAttribute("href");
 $("offer-email-out").setAttribute("aria-disabled","true");
 $("offer-github-out").removeAttribute("href");
 $("offer-github-out").setAttribute("aria-disabled","true");
 $("offer-email-help").textContent="Opens your email app for review; does not send.";
 $("offer-github-help").textContent="Check the public-issue notice above to enable GitHub.";
});
window.addEventListener("hashchange",()=>{if(state.sets.length)parseHash();});
loadWantList();
})();
