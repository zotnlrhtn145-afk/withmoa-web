// Cached publication translations; the server accepts public content IDs only.
const publicationFields = new Set('article_title name koreanName description supplyNote recovery_evidence fedwatch_report title title_ko content content_ko body answer heading component_heading headline summary analysis reaction comparison crypto stocks text note reading explanation explainer context condition invalidation outlook next counterpoint conclusion meaning policy economy difference scope feeNote why what label caption sourceLabel observation interpretation takeaway mechanism supportive opposing change_condition next short medium long highlights next_watch uncertainty gaps caveats strengths risks evidence_note caution missing overlay future futureReason items basisLabel cycleLabel movementLabel previousConclusion recent_label baseline_label'.split(' '));
let savedLanguage = ''; try { savedLanguage = localStorage.getItem('withfindex-language') || ''; } catch {}
const selectedLanguage = new URLSearchParams(location.search).get('lang') || savedLanguage || 'auto';
const detectedLanguage = (selectedLanguage === 'auto' ? navigator.language : selectedLanguage).toLowerCase().split(/[-_]/)[0];
const publicationLanguage = ['ko','en','ja','zh'].includes(detectedLanguage) ? detectedLanguage : 'en';
let publicationTranslationPending = false;
function replacePublicationText(value, translations, key = '') {
 if(typeof value === 'string')return publicationFields.has(key) ? (translations[value] || value) : value;
 if(Array.isArray(value))return value.map(v=>replacePublicationText(v,translations,key));
 if(value && typeof value === 'object')return Object.fromEntries([...Object.entries(value).map(([k,v])=>[k,replacePublicationText(v,translations,k)]),...Object.entries(value).filter(([k])=>["title","body","heading"].includes(k)).map(([k,v])=>["source_"+k,value["source_"+k]||v])]);
 return value;
}
async function localizePublication(value,kind,id) {
 if(publicationLanguage === 'ko')return value;
 const sourceKind={n:'news',c:'calendar',m:'cycle',s:'snapshot'}[kind];
 if(!sourceKind)return value;
 publicationTranslationPending=true;
 try {
  const response=await fetch(API+'/functions/v1/publication-localization',{method:'POST',headers:{apikey:KEY,Authorization:'Bearer '+KEY,'Content-Type':'application/json'},body:JSON.stringify({kind:sourceKind,ids:[kind==='s'?'latest':String(id)],language:publicationLanguage}),signal:AbortSignal.timeout(8000)});
  if(!response.ok)return value;
  const result=await response.json();
  if(result.language!==publicationLanguage)return value;
  publicationTranslationPending=result.pending>0;
  return replacePublicationText(value,result.translations||{});
 }catch{return value;}
}
function translationStatus() {
 if(publicationLanguage==='ko')return '';
 return publicationTranslationPending
  ? {en:'Translation is being prepared. Untranslated passages show the Korean original.',ja:'翻訳を準備しています。未翻訳の箇所は韓国語の原文を表示します。',zh:'正在准备翻译。尚未翻译的部分显示韩语原文。'}[publicationLanguage]
  : {en:'Translated from the published Korean analysis.',ja:'公開された韓国語の分析から翻訳しています。',zh:'译自已发布的韩语分析。'}[publicationLanguage];
}
let publicationUI = {};
const publicationUIText = text => publicationUI[text] || text;
async function initializePublicationLanguage() {
 document.documentElement.lang=publicationLanguage;
 if(publicationLanguage==='ko')return;
 try { const response=await fetch('/o/i18n/'+publicationLanguage+'.json');if(response.ok)publicationUI=await response.json(); } catch {}
 const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
 let current;while(current=walker.nextNode()){const text=current.textContent.trim();if(publicationUI[text])current.textContent=current.textContent.replace(text,publicationUI[text]);}
}
