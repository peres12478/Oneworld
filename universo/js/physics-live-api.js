/* Integracion real con Wikimedia: Wikipedia aporta paginas de referencia y
   Wikidata aporta expresiones matematicas P2534 donde hay registros.
   Los 43 ejemplos escolares siguen siendo contenido editorial local. */
const API_WIKIPEDIA='https://es.wikipedia.org/w/api.php';
const API_WIKIDATA='https://www.wikidata.org/w/api.php';
const chunks=(list,size)=>Array.from({length:Math.ceil(list.length/size)},(_,i)=>list.slice(i*size,(i+1)*size));
const norm=(s)=>String(s||'').replace(/_/g,' ').trim().toLocaleLowerCase('es');

async function getJSON(url){
 const controller=new AbortController();
 const timeout=setTimeout(()=>controller.abort(),11000);
 try {
  const response=await fetch(url,{signal:controller.signal,credentials:'omit'});
  if(!response.ok)throw new Error(`HTTP ${response.status}`);
  const json=await response.json();
  if(json.error)throw new Error(json.error.info||json.error.code||'Error de API');
  return json;
 } finally {clearTimeout(timeout);}
}

function wikiUrl(params){
 const url=new URL(API_WIKIPEDIA);
 Object.entries({format:'json',origin:'*',...params}).forEach(([key,value])=>url.searchParams.set(key,String(value)));
 return url;
}
function dataUrl(params){
 const url=new URL(API_WIKIDATA);
 Object.entries({format:'json',origin:'*',...params}).forEach(([key,value])=>url.searchParams.set(key,String(value)));
 return url;
}

/** Devuelve registros verificables, nunca fórmulas ni resúmenes inventados. */
export async function consultPhysicsAPIs(formulas){
 const titles=[...new Set(formulas.map(f=>f.wiki).filter(Boolean))];
 const foundPages=new Map();
 const wikiCalls=chunks(titles,18).map(async group=>{
  const result=await getJSON(wikiUrl({action:'query',prop:'pageprops',ppprop:'wikibase_item',redirects:'1',titles:group.join('|')}));
  const redirects=new Map((result.query?.redirects||[]).map(v=>[norm(v.from),norm(v.to)]));
  const normalized=new Map((result.query?.normalized||[]).map(v=>[norm(v.from),norm(v.to)]));
  const pages=Object.values(result.query?.pages||{});
  for(const sourceTitle of group){
   let key=norm(sourceTitle);key=normalized.get(key)||key;key=redirects.get(key)||key;
   const page=pages.find(p=>norm(p.title)===key);
   if(page&&page.pageid>0)foundPages.set(norm(sourceTitle),{title:page.title,qid:page.pageprops?.wikibase_item||'',pageid:page.pageid});
  }
  return pages.filter(p=>p.pageid>0).length;
 });
 const settled=await Promise.allSettled(wikiCalls);
 const successful=settled.filter(r=>r.status==='fulfilled');
 if(!successful.length)throw new Error('No se pudo consultar la API de Wikipedia. Comprueba Internet y CORS en Live Server.');
 const titleIds=[...new Set([...foundPages.values()].map(p=>p.qid).filter(v=>/^Q\d+$/.test(v)))];
 const wikidataMap=new Map();let wikidataFailure=false;
 if(titleIds.length){
  const results=await Promise.allSettled(chunks(titleIds,35).map(ids=>getJSON(dataUrl({action:'wbgetentities',ids:ids.join('|'),props:'claims'}))));
  wikidataFailure=results.some(x=>x.status==='rejected');
  for(const outcome of results){
   if(outcome.status!=='fulfilled')continue;
   for(const [qid,entry] of Object.entries(outcome.value.entities||{})){
    const claim=(entry.claims?.P2534||[]).find(c=>c.rank!=='deprecated'&&c.mainsnak?.snaktype==='value'&&c.mainsnak?.datavalue?.value);
    const val=claim?.mainsnak.datavalue.value;
    const latex=typeof val==='string'?val:(val?.tex||'');
    if(latex&&latex.length<1800)wikidataMap.set(qid,{tex:latex,url:`https://www.wikidata.org/wiki/${qid}`});
   }
  }
 }
 const linked=new Map();let records=0;
 for(const f of formulas){
  const page=foundPages.get(norm(f.wiki));
  if(!page)continue;
  records++;
  linked.set(f.id,{wikipedia:`https://es.wikipedia.org/wiki/${encodeURIComponent(page.title.replace(/ /g,'_'))}`,wikidata:page.qid&&wikidataMap.get(page.qid)||null});
 }
 return {wikiConnected:true,wikiPages:records,wikiTotal:formulas.length,wikidataFormulas:[...linked.values()].filter(x=>x.wikidata).length,wikidataChecked:!!titleIds.length,wikidataFailure,linked};
}
