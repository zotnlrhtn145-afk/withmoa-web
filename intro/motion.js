/* Motion-only enhancement. Product screenshots and analysis copy are unchanged. */
(()=>{
  // Touch scrolling uses the static mobile layout, without per-word geometry work.
  if(matchMedia("(max-width: 760px), (prefers-reduced-motion: reduce)").matches)return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp=x=>Math.max(0,Math.min(1,x));
  const ease=x=>{x=clamp(x);return x*x*(3-2*x)};
  const host=document.querySelector('.story');
  const stage=host.querySelector('.story-sticky');
  const panel=host.querySelector('.extracted');
  const title=panel.querySelector('h3');
  const outline=host.querySelector('.focus-outline');
  const basePaint=window.paint;
  const sourceTitle=title.textContent;
  let translationStarted=-1000;
  const important=/금리|청산|불확실성|Treasury|yields|liquidations|uncertainty|利回り|清算|不確実性/;
  function wrapText(element,keys=false){
    let index=0;
    for(const node of [...element.childNodes]){
      if(node.nodeType===Node.TEXT_NODE){
        const fragment=document.createDocumentFragment();
        const parts=/[\u3040-\u30ff\u4e00-\u9fff]/.test(node.textContent)
          ? [...new Intl.Segmenter('ja',{granularity:'word'}).segment(node.textContent)].map(s=>s.segment)
          : node.textContent.match(/\S+\s*|\s+/g)||[];
        for(const part of parts){
          const span=document.createElement('span');
          span.className='motion-word'+(keys&&important.test(part)?' key-word':'');
          span.style.setProperty('--word-index',index++);
          span.textContent=part;
          fragment.appendChild(span);
        }
        node.replaceWith(fragment);
      }else if(node.nodeType===Node.ELEMENT_NODE && node.tagName!=='BR'){
        wrapText(node,keys);
      }
    }
  }
  wrapText(document.querySelector('.hero h1'));
  wrapText(title,true);
  const introQuote=document.querySelector('.pullquote h3');
  introQuote.innerHTML='미국 국채 <strong>금리 상승</strong>과<br>파생상품 <strong>롱 청산</strong>으로<br><strong>불확실성 지속</strong>';
  const headingObserver=new IntersectionObserver(entries=>entries.forEach(e=>{
    if(e.isIntersecting){e.target.classList.add('title-visible');headingObserver.unobserve(e.target)}
  }),{threshold:.4});
  document.querySelectorAll('.chapter-heading h2,.language-panel h2,.api h2,.footer h2').forEach(h=>{wrapText(h);h.classList.add('title-motion');headingObserver.observe(h)});
  // Editorial emphasis belongs to the page copy, outside the product imagery.
  const copyPhrases=['변화를 먼저.','이유까지.','더 가까이.'];
  document.querySelectorAll('.step h3').forEach((h,i)=>{
    const text=h.textContent;
    const phrase=copyPhrases[i];
    h.textContent='';
    const prefix=document.createElement('span');
    prefix.textContent=text.slice(0,text.indexOf(phrase));
    const key=document.createElement('span');
    key.className='copy-highlight';key.textContent=phrase;
    h.append(prefix,key);
    let order=0;
    for(const part of [prefix,key]){
      const words=part.textContent.match(/\S+\s*/g)||[];
      part.textContent='';
      words.forEach(word=>{const span=document.createElement('span');span.className='copy-word';span.textContent=word;span.style.setProperty('--copy-order',order++);part.append(span)});
    }
  });
  const copyStageObserver=new IntersectionObserver(entries=>entries.forEach(e=>{
    stage.classList.toggle('copy-ready',e.isIntersecting);
  }),{threshold:.25});
  copyStageObserver.observe(stage);
  document.querySelectorAll('.title-motion .motion-word').forEach(w=>{
    if(/해석|경제|매거진|언어|손안|서비스/.test(w.textContent))w.classList.add('copy-key');
  });
  document.querySelectorAll('#features h3').forEach(h=>{
    wrapText(h);h.classList.add('title-motion','feature-copy');
    const words=h.querySelectorAll('.motion-word');
    words[words.length-1]?.classList.add('copy-key');
    headingObserver.observe(h);
  });
  function render(){
    basePaint();
    const bounds=host.getBoundingClientRect();
    const p=clamp(-bounds.top/(host.offsetHeight-stage.offsetHeight));
    const expand=ease((p-.32)/.27);
    const focus=ease((p-.20)/.09)*(1-ease((p-.63)/.10));
    const visible=ease((p-.315)/.055);
    const content=ease((p-.33)/.18);
    const stageBounds=stage.getBoundingClientRect();
    const source=outline.getBoundingClientRect();
    const targetX=stageBounds.left+stage.clientLeft+panel.offsetLeft+panel.offsetWidth/2;
    const targetY=stageBounds.top+stage.clientTop+panel.offsetTop+panel.offsetHeight/2;
    const dx=source.left+source.width/2-targetX;
    const dy=source.top+source.height/2-targetY;
    const initialX=Math.max(.25,source.width/panel.offsetWidth);
    const initialY=Math.max(.16,source.height/panel.offsetHeight);
    stage.style.setProperty('--focus',focus);
    stage.style.setProperty('--line',ease((p-.24)/.09));
    stage.style.setProperty('--card-alpha',reduced?(p>.32?1:0):visible);
    stage.style.setProperty('--extract-x',`${dx*(1-expand)}px`);
    stage.style.setProperty('--extract-y',`${dy*(1-expand)}px`);
    stage.style.setProperty('--extract-sx',initialX+(1-initialX)*expand);
    stage.style.setProperty('--extract-sy',initialY+(1-initialY)*expand);
    stage.style.setProperty('--shine',ease((p-.40)/.26));
    stage.style.setProperty('--label-alpha',ease((p-.32)/.06));
    stage.style.setProperty('--body-alpha',ease((p-.49)/.12));
    stage.style.setProperty('--body-y',`${14*(1-ease((p-.49)/.12))}px`);
    stage.style.setProperty('--highlight',ease((p-.51)/.13));
    const words=[...title.querySelectorAll('.motion-word')];
    const languageProgress=reduced?1:clamp((performance.now()-translationStarted)/750);
    words.forEach((w,i)=>{
      const alpha=ease((content-i*.038)/.55)*ease((languageProgress-i*.025)/.7);
      w.style.setProperty('--word-alpha',alpha);
      w.style.setProperty('--word-y',`${(1-alpha)*15}px`);
    });
    // Keep the phone and explanation readable while the scroll changes emphasis.
    document.querySelector('.hero h1').style.translate=reduced?'none':`0 ${-Math.min(scrollY/30,16)}px`;
  }
  const watchTitle=new MutationObserver(()=>{
    if(title.querySelector('.motion-word'))return;
    wrapText(title,true);
    translationStarted=performance.now();
    let id;
    const animate=()=>{render();if(performance.now()-translationStarted<1200)id=requestAnimationFrame(animate)};
    cancelAnimationFrame(id);requestAnimationFrame(animate);
  });
  watchTitle.observe(title,{childList:true});
  window.paint=render;
  render();
})();
