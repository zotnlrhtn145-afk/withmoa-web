const $ = id => document.getElementById(id);
// Android uses its existing release guide while public distribution is pending.
if (/Android/i.test(navigator.userAgent)) {
 const link=$('app-promo-link');
 if(link){link.href='https://withfindex.com/download/#explore';link.dataset.store='android';link.setAttribute('aria-label','어플에서 더보기 · Android 출시 안내');}
}
const clean = value => typeof value === 'string' ? value.replace(/\\n/g, '\n').replace(/\*\*/g, '').trim() : '';
// Keep the shared page consistent with the native analysis block ledger.
function displaySections(sections, initial = []) {
 const key = text => clean(text).replace(/\n한국시간 \d[\s\S]*$/, '').replace(/\s+/g, ' ');
 const seen = new Set(initial.map(key));
 return sections.filter(section => {
  const body = key(section.body);
  if (!body || clean(section.source_body||section.body).includes('발표 뒤 확보한 현황이에요.') || seen.has(body)) return false;
  seen.add(body); return true;
 });
}
const node = (tag, text, cls) => { const e=document.createElement(tag); if(text!=null)e.textContent=publicationUIText(clean(String(text))); if(cls)e.className=cls; return e; };
const safeURL = value => { try { const u=new URL(value); return u.protocol==='https:'?u.href:null; } catch { return null; } };
const stamp = value => { const d=new Date(value); return Number.isFinite(+d)?d.toLocaleString(publicationLanguage,{timeZone:'Asia/Seoul',month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'})+' KST':''; };
const amount = n => n.toLocaleString('ko-KR',{maximumFractionDigits:2});
const params=new URLSearchParams(location.search), kind=params.get('k')||'n', id=params.get('n')||'';
const canonical=new URL('https://withfindex.com/o/'); canonical.searchParams.set('k',kind); canonical.searchParams.set('n',id);
let article, selected='';
function source(parent,url,label='근거 원문 보기 ↗'){const href=safeURL(url);if(!href)return;const a=node('a',label,'source');a.href=href;a.target='_blank';a.rel='noopener noreferrer';parent.append(a);}
function card(title,cls=''){const e=node('section',null,'card '+cls);if(title)e.append(node('h2',title));return e;}
function prose(parent,text){for(const line of clean(text).split(/\n+/).filter(Boolean)){const pair=line.match(/^([^:]+):\s*([^:]+)\s*→\s*([^:]+)$/);if(pair){const a=number(pair[2]),b=number(pair[3]);if(a&&b&&a.unit===b.unit){parent.append(node('h3',pair[1]),bars([{label:'이전',value:a.value,text:pair[2]},{label:'이후',value:b.value,text:pair[3]}]));continue;}}const p=node('p');const first=line.match(/^[^\n]+?(?:[.!?](?=\s|$)|$)/)?.[0];if(!parent.querySelector('strong')&&first&&first.length>=10&&first.length<=180){p.append(node('strong',first),document.createTextNode(line.slice(first.length)));}else p.textContent=line;parent.append(p);}}
function number(raw){const t=String(raw??'').trim().replace(/−/g,'-'),m=t.match(/^(\$)?([+-]?(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?)\s*([KMB%])?$/i);if(!m||m[1]&&m[3]==='%')return null;const suffix=(m[3]||'').toUpperCase(),value=Number(m[2].replace(/,/g,''))*({K:1e3,M:1e6,B:1e9}[suffix]||1);return Number.isFinite(value)?{value,unit:suffix==='%'?'%':m[1]?'USD':'number'}:null;}
function bars(rows){const box=node('div',null,'bars'),lo=Math.min(0,...rows.map(x=>x.value)),hi=Math.max(0,...rows.map(x=>x.value)),span=hi-lo||1;rows.forEach((p,i)=>{const row=node('div',null,'bar-row'),labels=node('div',null,'bar-label');labels.append(node('span',p.label),node('strong',p.text??amount(p.value)));const track=node('div',null,'track'),bar=node('span',null,'bar'+(i===rows.length-1?' last':'')),zero=node('i');bar.style.left=((Math.min(0,p.value)-lo)/span*100)+'%';bar.style.width=(Math.abs(p.value)/span*100)+'%';zero.style.left=(-lo/span*100)+'%';track.setAttribute('aria-hidden','true');track.append(bar,zero);row.append(labels,track);box.append(row);});box.append(node('small','막대는 0 기준 · 항목 안에서 같은 눈금으로 비교해요.'));return box;}
function figure(f){const e=card(f.label),actual=number(f.actual),rows=[];for(const [label,raw] of [['이전',f.previous],['예상',f.forecast],['발표',f.actual]]){const n=number(raw);if(n&&actual&&n.unit===actual.unit)rows.push({label,value:n.value,text:String(raw)});}if(rows.length>=2)e.append(bars(rows));else for(const [label,raw] of [['발표',f.actual],['예상',f.forecast],['이전',f.previous]])e.append(node('p',label+' · '+(raw??'미제공')));if(f.comparison)e.append(node('p',f.comparison));return e;}
function plot(points,unit='',comparison=[],time=false){const all=points.filter(p=>Number.isFinite(p.value));const wrap=node('div',null,'plot');if(all.length<2){wrap.append(node('p','표시할 관측값이 부족해요.'));return wrap;}
 const other=comparison.filter(p=>Number.isFinite(p.value)),values=[...all,...other].map(p=>p.value);if(!time)values.push(0);let lo=Math.min(...values),hi=Math.max(...values),pad=Math.max((hi-lo)*.08,Math.abs(hi)*.00001,1e-6);lo-=pad;hi+=pad;
 const W=620,H=230,L=74,R=12,T=12,B=28,ns='http://www.w3.org/2000/svg';const svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox',`0 0 ${W} ${H}`);svg.setAttribute('role','img');svg.setAttribute('aria-label',`${unit} 흐름. 처음 ${amount(all[0].value)}, 마지막 ${amount(all.at(-1).value)}.`);
 const add=(tag,attrs,text)=>{const e=document.createElementNS(ns,tag);for(const [k,v] of Object.entries(attrs))e.setAttribute(k,String(v));if(text)e.textContent=text;svg.append(e);return e;};
 const xmin=time?all[0].t:0,xmax=time?all.at(-1).t:all.length-1,x=(p,i)=>L+((time?p.t:i)-xmin)/(xmax-xmin||1)*(W-L-R),y=v=>T+(hi-v)/(hi-lo)*(H-T-B);
 for(let i=0;i<4;i++){const v=lo+(hi-lo)*i/3,yy=y(v);add('line',{x1:L,x2:W-R,y1:yy,y2:yy,stroke:'#dce6df'});add('text',{x:L-8,y:yy+4,'text-anchor':'end',fill:'#68786e','font-size':11},Intl.NumberFormat('ko-KR',{notation:'compact',maximumFractionDigits:1}).format(v));}
 if(lo<0&&hi>0)add('line',{x1:L,x2:W-R,y1:y(0),y2:y(0),stroke:'#71867a','stroke-dasharray':'4 4'});
 const draw=(list,color,dashed)=>{let d='';list.forEach((p,i)=>{const gap=i>0&&p.segment!=null&&p.segment!==list[i-1].segment;d+=(i===0||gap?'M':'L')+x(p,i).toFixed(2)+' '+y(p.value).toFixed(2)+' ';});add('path',{d,fill:'none',stroke:color,'stroke-width':2.5,...(dashed?{'stroke-dasharray':'6 4'}:{})});};draw(all,'#3e7358',false);if(other.length===all.length)draw(other,'#4284be',true);
 const cursor=add('circle',{cx:x(all.at(-1),all.length-1),cy:y(all.at(-1).value),r:4,fill:'#234b37'}),readout=node('p',null,'readout');const display=i=>{const p=all[i];cursor.setAttribute('cx',x(p,i));cursor.setAttribute('cy',y(p.value));readout.textContent=(time?stamp(p.t):p.label||String(i))+' · '+amount(p.value)+' '+unit+(other[i]?' / 과거 '+amount(other[i].value)+' '+unit:'');};display(all.length-1);
 svg.addEventListener('pointermove',e=>{const r=svg.getBoundingClientRect(),pos=(e.clientX-r.left)/r.width*W;let best=0;for(let i=1;i<all.length;i++)if(Math.abs(x(all[i],i)-pos)<Math.abs(x(all[best],best)-pos))best=i;display(best);});
 const range=node('input');range.type='range';range.min='0';range.max=String(all.length-1);range.value=range.max;range.setAttribute('aria-label','관측 시점 선택');range.addEventListener('input',()=>display(+range.value));const labels=node('div',null,'axis');labels.append(node('span',time?stamp(all[0].t):all[0].label),node('span',time?stamp(all.at(-1).t):all.at(-1).label));wrap.append(readout,svg,labels,range);return wrap;
}
function visual(v){const e=card(v.title,'visual'),p=(v.points||[]).filter(p=>typeof p.value==='number'&&Number.isFinite(p.value));if(v.kind==='bars')e.append(bars(p.map(p=>({...p,text:amount(p.value)+' '+(v.unit||'')}))));else if(v.kind==='range'&&Number.isFinite(v.percentile)){const rank=Math.max(0,Math.min(100,v.percentile));e.append(node('p',`과거 관측의 ${Math.round(rank)}%보다 많은 수준`));const meter=node('meter');meter.min=0;meter.max=100;meter.value=rank;meter.setAttribute('aria-label','과거 관측 대비 위치');e.append(meter);}else if(v.kind==='line'){
  const h=v.history,valid=pts=>Array.isArray(pts)&&pts.length===p.length&&pts.length===(h?.window_hours??-2)+1&&pts.every(x=>Number.isFinite(x.value))&&pts[0]?.value===0;
  const peaks=(h?.price_peaks||[]).filter(q=>valid(q.points)&&Math.abs(q.points.at(-1).value-q.net)<.01);const choices=node('div',null,'choices'),body=node('div');
  const show=peak=>{body.replaceChildren();let compare=[];if(peak){compare=peak.points;prose(body,`현재 ${amount(h.current)} ${v.unit||''}\n${peak.year}년 가격 고점 전 ${amount(peak.net)} ${v.unit||''}`);body.append(node('small',`비교 구간 · ${stamp(peak.from)} → ${stamp(peak.to)}`));}else if(h){if(valid(h.maximum_points)&&Math.abs(h.maximum_points.at(-1).value-h.maximum)<.01)compare=h.maximum_points;prose(body,`현재 누적 ${amount(h.current)} ${v.unit||''}\n최근 1년 같은 시간 최대 ${amount(h.maximum)} ${v.unit||''}`);}
   if(compare.length)body.append(node('small','초록 실선 · 현재 / 파랑 점선 · '+(peak?`${peak.year}년 고점 전`:'과거 최대 구간')));body.append(plot(p,v.unit||'',compare));if(h)body.append(node('small',`같은 ${h.window_hours}시간 비교 · 과거 저점부터의 누적이나 상승 확률이 아니에요. 거래 규모 차이도 있어 금액만으로 고점을 판단할 수 없어요.`));};
  if(peaks.length){const options=[{label:'최근 1년 최대',value:null},...peaks.slice().reverse().map(q=>({label:q.year+' 고점',value:q}))];options.forEach(o=>{const b=node('button',o.label);b.onclick=()=>{choices.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed','false'));b.setAttribute('aria-pressed','true');show(o.value);};b.setAttribute('aria-pressed',String(o.value?.year===2025));choices.append(b);});e.append(choices);}show(peaks.find(p=>p.year===2025)||null);e.append(body);
 }prose(e,v.caption);if(v.observed_at)e.append(node('small','자료 시각 · '+stamp(v.observed_at)));source(e,v.source_url);return e;}

function releaseMovementCard(detail) {
 const reactionSections=(detail.sections||[]).filter(s=>(s.source_title||s.title)==='발표 이후 실제 움직임');
 const entries=[];
 for(const section of reactionSections) for(const line of clean(section.source_body||section.body).split('\n')) {
  const m=line.trim().match(/^([^:]+):\s*([+-]?\d+(?:\.\d+)?)\s*(%p|%)\s*(?:\(([^)]+)\))?$/);
  if(m) entries.push({key:m[1].trim(),label:m[1].trim(),unit:m[3],points:[{value:0,label:'발표 직전'},{value:+m[2],label:'확인 시점'}],period:m[4]||'',note:'시작·끝 관측값 비교 · 중간 가격 경로는 표시하지 않아요.'});
 }
 for(const price of detail.prices||[]) {
  const label=price.coin==='BTC'?'비트코인':price.coin==='ETH'?'이더리움':price.coin;
  const stages=(price.stages||[]).filter(s=>Number.isFinite(s.value)&&Number.isFinite(s.time));
  let points=stages.length>=2?stages.map(s=>({value:s.value,label:s.label,t:s.time})):[];
  if(!points.length&&Number.isFinite(price.base)&&price.base>0) {
   const last=(price.bars||[]).filter(b=>Number.isFinite(b.c)&&Number.isFinite(b.t)).at(-1);
   if(last)points=[{value:0,label:'발표 직전',t:price.release_at},{value:(last.c/price.base-1)*100,label:'확인 시점',t:last.t+60000}];
  }
  if(points.length<2)continue;
  const item={key:label,label,unit:'%',points,period:stamp(points[0].t)+' → '+stamp(points.at(-1).t),note:'주요 시점 요약 · 시간 간격 생략 · 점 사이 곡선은 설명용이에요.',source:price.source,source_url:price.source_url};
  const at=entries.findIndex(e=>e.key===label);if(at<0)entries.push(item);else entries[at]=item;
 }
 if(!entries.length)return null;
 const box=card('발표 이후 실제 움직임','release-movements'),tabs=node('div',null,'movement-tabs'),panel=node('div');
 tabs.setAttribute('role','tablist');tabs.setAttribute('aria-label','발표 이후 움직임 자산');
 const show=(entry,index)=>{
  [...tabs.children].forEach((b,i)=>{b.setAttribute('aria-selected',String(i===index));b.tabIndex=i===index?0:-1;});
  panel.replaceChildren();panel.id='release-movement-panel';panel.setAttribute('role','tabpanel');panel.setAttribute('aria-labelledby','release-movement-tab-'+index);
  const last=entry.points.at(-1);panel.append(node('strong',(last.value>0?'+':'')+last.value.toLocaleString('ko-KR',{maximumFractionDigits:entry.unit==='%p'?3:2})+entry.unit,'movement-value'),node('small',entry.label+' · 발표 직전 대비'));
  panel.append(releaseCycle(entry.points,entry.unit),node('small',entry.period),node('small',entry.note));
  if(entry.source)panel.append(node('small',entry.source));source(panel,entry.source_url);
 };
 entries.forEach((e,i)=>{const b=node('button',e.label);b.id='release-movement-tab-'+i;b.setAttribute('role','tab');b.setAttribute('aria-controls','release-movement-panel');b.onclick=()=>show(e,i);b.onkeydown=event=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(event.key)){event.preventDefault();const next=event.key==='Home'?0:event.key==='End'?entries.length-1:(i+(event.key==='ArrowRight'?1:-1)+entries.length)%entries.length;show(entries[next],next);tabs.children[next].focus();}};tabs.append(b);});
 box.append(tabs,panel);show(entries[0],0);
 // Match the app: once observations form a chart, do not append the legacy movement paragraph.
 return box;
}
function releaseCycle(points,unit) {
 const ns='http://www.w3.org/2000/svg',wrap=node('div',null,'movement-cycle'),svg=document.createElementNS(ns,'svg');
 svg.setAttribute('viewBox','0 0 342 190');svg.setAttribute('role','img');
 svg.setAttribute('aria-label',points.map(p=>p.label+' '+p.value.toLocaleString('ko-KR',{maximumFractionDigits:unit==='%p'?3:2})+unit).join(', ')+' · 주요 관측 시점 요약');
 const add=(tag,attrs,text)=>{const e=document.createElementNS(ns,tag);Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,String(v)));if(text)e.textContent=text;svg.append(e);return e;};
 const low=Math.min(0,...points.map(p=>p.value)),high=Math.max(0,...points.map(p=>p.value)),span=high-low||1;
 const x=i=>20+i/(points.length-1)*302,y=v=>35+(high-v)/span*105;
 add('line',{x1:20,x2:322,y1:y(0),y2:y(0),stroke:'#bccdc1','stroke-dasharray':'4 5'});
 let path='M'+x(0)+' '+y(points[0].value);
 for(let i=1;i<points.length;i++){const mid=(x(i-1)+x(i))/2;path+=' C'+mid+' '+y(points[i-1].value)+' '+mid+' '+y(points[i].value)+' '+x(i)+' '+y(points[i].value);}
 add('path',{d:path,fill:'none',stroke:'#3e7358','stroke-width':3,'stroke-linecap':'round',...(points.length===2?{'stroke-dasharray':'5 5'}:{})});
 points.forEach((p,i)=>{add('circle',{cx:x(i),cy:y(p.value),r:i===points.length-1?6:4,fill:'#3e7358'});add('text',{x:x(i),y:y(p.value)-12,'text-anchor':i===0?'start':i===points.length-1?'end':'middle',fill:'#274c37','font-size':12},(p.value>0?'+':'')+p.value.toLocaleString('ko-KR',{maximumFractionDigits:unit==='%p'?3:2})+unit);add('text',{x:x(i),y:174,'text-anchor':i===0?'start':i===points.length-1?'end':'middle',fill:'#64766b','font-size':11},p.label);});
 wrap.append(svg);return wrap;
}

function render(){const r=article.release||{},d=r.detail||{},story=d.story||{};const content=$('content');content.replaceChildren();$('title').textContent=clean(article.article_title||r.heading||article.title);$('time').textContent=stamp(article.at);document.title=$('title').textContent+' · WITH FINDEX';
 const intro=card('결론부터 보면','conclusion');const headline=clean(story.conclusion||d.headline||article.title),summary=clean(story.summary||d.answer||r.summary||article.summary);intro.append(node('h3',headline));if(summary&&summary!==headline)prose(intro,summary);content.append(intro);
 const charts=r.market_charts||[],assets=[...new Set([...charts.map(c=>c.symbol),...(d.visuals||[]).map(v=>v.asset),...(d.sections||[]).map(s=>s.asset)].filter(Boolean))];if(assets.length){if(!assets.includes(selected))selected=assets[0];const tabs=node('nav',null,'asset-tabs');tabs.setAttribute('aria-label','자산 선택');assets.forEach(asset=>{const b=node('button',asset==='BTCUSDT'?'비트코인':asset==='ETHUSDT'?'이더리움':asset);b.setAttribute('aria-pressed',String(asset===selected));b.onclick=()=>{selected=asset;render();};tabs.append(b);});content.append(tabs);}
 const matches=a=>!a||!selected||a===selected;
 for(const c of charts.filter(c=>matches(c.symbol))){const e=card(c.label||c.symbol);e.append(node('p',c.baseline_label),plot(c.points||[],(c.provider||'').includes('USDT')?'USDT':'',[],true),node('small',[c.recent_label,c.provider,stamp(c.observed_at)].filter(Boolean).join(' · ')));source(e,c.source_url);content.append(e);}
 for(const f of (r.figures||article.figures||[]).filter(f=>/[0-9]/.test(f.actual||'')||!String(f.label).includes('연설')))content.append(figure(f));
 const movement=releaseMovementCard(d);
 const sections=[...(story.cards||[]),...(d.sections||article.sections||[])].filter(s=>!movement||(s.source_title||s.title)!=='발표 이후 실제 움직임'),visuals=(d.visuals||[]).filter(v=>matches(v.asset)),shown=new Set();
 for(const s of displaySections(sections.filter(s=>matches(s.asset)),[headline,summary])){if(!clean(s.body))continue;const e=card((s.source_title||s.title)==='결과를 어떻게 읽나요?'?'발표된 지표를 어떻게 해석해야 하나요?':s.title);prose(e,s.body);content.append(e);for(const v of visuals.filter(v=>(s.evidenceIds||[]).includes(v.id)&&!shown.has(v.id))){content.append(visual(v));shown.add(v.id);}}
 for(const v of visuals.filter(v=>!shown.has(v.id)))content.append(visual(v));
 for(const p of (movement?[]:d.prices||[]).filter(p=>matches(p.coin==='BTC'?'BTCUSDT':p.coin==='ETH'?'ETHUSDT':p.coin))){const e=card(p.coin+' · 발표 후 가격 흐름');const stages=(p.stages||[]).filter(s=>Number.isFinite(s.value)&&Number.isFinite(s.time));if(stages.length===3){e.append(node('small','발표 직전 가격 대비 · %'),plot(stages.map(s=>({t:s.time,value:s.value,label:s.label})), '%',[],true));stages.forEach(s=>{e.append(node('h3',s.label+' · '+amount(s.value)+'%'));prose(e,s.body);});}else e.append(plot((p.bars||[]).map(b=>({t:b.t,value:b.c})), 'USDT',[],true));e.append(node('small',[p.source,p.endpoint,stamp(p.checked_at)].filter(Boolean).join(' · ')));source(e,p.source_url);content.append(e);}
 const caution=clean(story.caution||article.caution);if(caution){const e=card('함께 확인할 점');prose(e,caution);content.append(e);}if(movement)content.append(movement);const gaps=(d.gaps||[]).filter(t=>clean(t)!==caution);if(gaps.length){const e=card('아직 확인되지 않은 점');gaps.forEach(t=>prose(e,t));content.append(e);}
 const refs=[...(d.evidence||[]),...(story.references||[])],seen=new Set();const sources=card('출처와 확인 시각');for(const ref of refs){const url=safeURL(ref.url||ref.source_url);if(url&&!seen.has(url)){source(sources,url,ref.title||'원문 보기 ↗');seen.add(url);}}if(!seen.has(article.source_url))source(sources,article.source_url);if(d.checked_at)sources.append(node('small','분석 확인 · '+stamp(d.checked_at)));content.append(sources);
 $('notice').textContent=translationStatus() || (['m','s'].includes(kind)?'이 링크는 최신 분석으로 갱신됩니다. 기준 시각을 확인해 주세요.':'');
}
async function load(){$('retry').hidden=true;$('notice').textContent='';try{if(!['n','c','m','s'].includes(kind)||id.length>80||(['n','c'].includes(kind)&&!(/^[1-9]\d{0,17}$/.test(id))))throw Error('invalid');const response=await fetch(API+'/rest/v1/rpc/read_shared_content',{method:'POST',headers:{apikey:KEY,Authorization:'Bearer '+KEY,'Content-Type':'application/json'},body:JSON.stringify({p_kind:kind,p_id:id}),signal:AbortSignal.timeout(15000)});if(!response.ok)throw Error('network');article=await response.json();if(!article)throw Error('missing');article=await localizePublication(article,kind,id);render();$('kakao-share').disabled=false;if(params.get('share')==='kakao'){$('kakao-share').focus();$('notice').textContent='상단의 카카오톡 공유를 눌러 보낼 대화방을 선택해 주세요.';}}catch(e){$('content').replaceChildren();$('title').textContent=e.message==='invalid'?'올바르지 않은 공유 주소예요.':e.message==='missing'?'공개된 내용을 찾을 수 없어요.':'내용을 불러오지 못했어요.';$('retry').hidden=['invalid','missing'].includes(e.message);}}
$('retry').onclick=load;$('share').onclick=async()=>{if(!article)return;const text=shareSummary(article,canonical.href);try{if(navigator.share)await navigator.share({text});else{await navigator.clipboard.writeText(text);$('notice').textContent='요약과 링크를 복사했어요. 보낼 대화방에 붙여넣어 주세요.';}}catch(e){if(e.name!=='AbortError')window.prompt('요약과 링크를 복사해 주세요.',text);}};

function shareSummary(article,url) {
 const release=article.release||{},detail=release.detail||{},story=detail.story||{};
 const title=clean(article.article_title||release.heading||article.title);
 const blocks=['📊 '+title],seen=new Set();
 const append=(heading,body)=>{const value=clean(body||'').trim();if(value&&!seen.has(value)){seen.add(value);blocks.push(heading+'\n'+value);}};
 const figures=(release.figures||[]).filter(f=>/[0-9]/.test(f.actual||'')||!String(f.label).includes('연설')).slice(0,3);
 if(figures.length) blocks.push('📌 발표 결과\n'+figures.map(f=> '• '+clean(f.label)+': '+['발표 '+clean(f.actual),f.forecast&&'예상 '+clean(f.forecast),f.previous&&'이전 '+clean(f.previous),f.comparison&&clean(f.comparison)].filter(Boolean).join(' · ')).join('\n'));
 append('💡 핵심 해석',story.summary||detail.answer||release.summary||article.summary);
 const excerpts=story.cards||detail.sections||[];
 excerpts.filter(c=>(c.source_title||c.title)!=='발표 이후 실제 움직임').slice(0,3).forEach(c=>append('🔎 '+(c.title==='결과를 어떻게 읽나요?'?'발표된 지표를 어떻게 해석해야 하나요?':clean(c.title)),c.body));
 const next=(detail.sections||[]).find(s=>/다음|앞으로|변경 조건/.test(s.title||''));
 if(next)append('🔎 '+clean(next.title),next.body);
 append('📍 함께 확인할 점',story.caution);
 blocks.push('차트와 자세한 분석 근거는 위드핀덱스에서 확인하세요.',url);
 return blocks.join('\n\n');
}

function kakaoCard(article, url) {
 const release=article.release||{}, detail=release.detail||{}, story=detail.story||{};
 const title=clean(article.article_title||release.heading||article.title);
 const summary=clean(story.summary||detail.answer||release.summary||article.summary||story.conclusion||detail.headline);
 const shorten=(text,max)=>Array.from(text).length>max?Array.from(text).slice(0,max-1).join('')+'…':text;
 const link={webUrl:url,mobileWebUrl:url};
 return {objectType:'feed',content:{title:shorten(title,200),description:shorten(summary,200),imageUrl:'https://withfindex.com/intro/assets/withfindex-share-v2.png',imageWidth:1200,imageHeight:630,link},buttons:[{title:'위드핀덱스에서 자세히 보기',link}]};
}
$('kakao-share').onclick=()=>{
 if(!article)return;
 try {
  if(!window.Kakao)throw Error('sdk');
  if(!Kakao.isInitialized())Kakao.init('c4b2d195627183d9d59d103c0082c8a8');
  const tagged=new URL(canonical.href);tagged.searchParams.set('utm_source','kakao');Kakao.Share.sendDefault(kakaoCard(article,tagged.href));
 } catch {
  $('notice').textContent='카카오톡 공유를 열지 못했어요. 다시 시도하거나 링크 공유를 이용해 주세요.';
 }
};

initializePublicationLanguage().then(load);
