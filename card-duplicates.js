"use strict";
// PUBLIC presentation only: never merge records or approve physical copies.
(function(){
 const fields=["sport","year","brand","set","number","player","team","parallel"];
 function key(card){
  if(!card||typeof card!=="object")return "";
  const v=fields.map(f=>String(card[f]??"").normalize("NFKC").trim().toLocaleLowerCase("en-US"));
  if(v.slice(0,-1).some(s=>!s))return "";
  return JSON.stringify(v);
 }
 function eligible(card,features){
  if(!card||card.review_status!=="Verified"||card.identity_unconfirmed===true||
      !/^[a-f0-9]{24}$/.test(String(card.id||"")))return false;
  const meta=features?.classify?.(card)||{},serial=features?.serialInfo?.(card)||{};
  // Unverified identity, stamps, signatures and unique relic swatches stay separate.
  return !(serial.numbered||meta.serial||meta.autograph||meta.patch||meta.memorabilia);
 }
 function build(cards,features){
  const map=new Map(),byId=new Map(),seen=new Set();
  for(const c of Array.isArray(cards)?cards:[]){
   const k=key(c);
   if(!k||!eligible(c,features)||seen.has(c.id))continue;
   seen.add(c.id);if(!map.has(k))map.set(k,[]);
   map.get(k).push(c);
  }
  const groups=[];
  for(const arr of map.values()){
   if(arr.length<2)continue;
   const group=Object.freeze(arr.slice());
   groups.push(group);for(const c of group)byId.set(c.id,group);
  }
  return Object.freeze({groups,byId,groupCount:groups.length,
   copyCount:groups.reduce((n,g)=>n+g.length,0)});
 }
 window.JayTreePublicDuplicates=Object.freeze({build,key,eligible});
})();