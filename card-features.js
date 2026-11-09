/* Public gallery feature labels use published facts, never player names or photo guesses.
 * Tags such as patches/autographs can be added by the private, approved publisher later.
 * Distinct feature checkboxes combine by OR; all other gallery filters combine by AND. */
(()=>{
"use strict";
const OPTIONS=Object.freeze([
 {key:"parallel",label:"Parallel"},
 {key:"serial",label:"Serial-numbered"},
 {key:"autograph",label:"Autograph"},
 {key:"patch",label:"Patch"},
 {key:"memorabilia",label:"Memorabilia"},
 {key:"rookie",label:"Rookie"}
]);
// Public serials describe the physical stamped copy, never a checklist card number.
// Owner editing, photo verification, and public-field approval happen on the private LAN.
function serialInfo(card){
 const c=card||{};
 const isInt=n=>Number.isSafeInteger(n)&&n>=1&&n<=999999;
 const parse=raw=>{
  const m=typeof raw==="string"&&raw.trim().match(/^([1-9]\d{0,5})\s*\/\s*([1-9]\d{0,5})$/);
  if(!m)return null;
  const number=Number(m[1]),out_of=Number(m[2]);
  return number<=out_of?{number,out_of}:null;
 };
 const runFromLabel=String(c.parallel||"").match(/(?:^|\s)\/([1-9]\d{0,5})(?:\b|$)/);
 // Publisher-issued serial run, corroborated against two independent
 // 2026 Topps Flagship "2025 All Topps Team" checklists (Blue /150).
 // This flags the serial-numbered EDITION only. It does NOT invent the
 // actual stamped copy number or approve an unverified owner photograph.
 const herbertBlue150=c.sport==="Football"&&
  String(c.year)==="2026"&&c.brand==="Topps"&&
  c.set==="2026 Topps - 2025 All Topps Team"&&
  c.number==="25ATT-13"&&c.player==="Justin Herbert"&&
  String(c.parallel).trim().toLowerCase()==="blue";
 const hints=[isInt(c.serial_total)?c.serial_total:null,
  runFromLabel?Number(runFromLabel[1]):null,
  herbertBlue150?150:null].filter(v=>v!==null);
 const legacy=parse(c.serial_number);
 const invalidLegacy=typeof c.serial_number==="string"&&c.serial_number.trim().length>0&&!legacy;
 if(legacy)hints.push(legacy.out_of);
 const approved=Array.isArray(c.public_serial_copies)?c.public_serial_copies:[];
 const invalidApproved=approved.some(v=>!v||!isInt(v.number)||!isInt(v.out_of)||v.number>v.out_of);
 const stamps=approved.filter(v=>v&&isInt(v.number)&&isInt(v.out_of)&&v.number<=v.out_of)
  .map(v=>({number:v.number,out_of:v.out_of}));
 if(legacy)stamps.push(legacy);
 const runs=[...hints,...stamps.map(v=>v.out_of)];
 const consistent=runs.length===0||runs.every(v=>v===runs[0]);
 const edition=consistent&&runs.length?runs[0]:null;
 const unique=new Set(stamps.map(v=>v.number+"/"+v.out_of));
 const validated=!invalidApproved&&!invalidLegacy&&consistent&&unique.size===stamps.length?stamps:[];
 return Object.freeze({
  numbered:c.serial_numbered===true||hints.length>0||approved.length>0||
   !!legacy||invalidLegacy||Array.isArray(c.public_features)&&c.public_features.includes("serial"),
  edition:edition,
  stamps:validated.map(v=>v.number+"/"+v.out_of),
  needsReview:invalidApproved||invalidLegacy||!consistent||unique.size!==stamps.length
 });
}
function classify(card){
 const c=card||{};
 const tags=new Set((Array.isArray(c.public_features)?c.public_features:[])
  .filter(v=>typeof v==="string").map(v=>v.trim().toLowerCase()));
 const label=[c.set,c.parallel].filter(v=>typeof v==="string").join(" ");
 const hasTag=k=>tags.has(k);
 const patch=c.is_patch===true||hasTag("patch")||/\bpatch(?:es)?\b/i.test(label);
 const memorabilia=c.is_memorabilia===true||hasTag("memorabilia")||patch||
  /\b(?:swatch(?:es)?|relics?|memorabilia|game.used|jerseys?|fabric|materials?)\b/i.test(label);
 return {
  parallel:!!String(c.parallel||"").trim()||hasTag("parallel"),
  // /325 identifies a numbered edition, but does not expose a private copy serial.
  serial:serialInfo(c).numbered||hasTag("serial"),
  // A printed Base Autographs checklist set name is not a signed physical card.
  autograph:c.identity_unconfirmed!==true&&
    (c.is_autograph===true||hasTag("autograph")),
  patch,
  memorabilia,
  rookie:c.rookie===true||hasTag("rookie")
 };
}
function matchesAny(c,selected){
 if(!selected||selected.length===0)return true;
 const known=classify(c);
 return selected.some(k=>Object.prototype.hasOwnProperty.call(known,k)&&known[k]);
}
window.JayTreeCardFeatures=Object.freeze({OPTIONS,classify,matchesAny,serialInfo});
})();
