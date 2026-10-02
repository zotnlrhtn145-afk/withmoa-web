(()=>{
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const menu=document.querySelector('.menu-toggle'),nav=document.querySelector('#site-navigation');
  const closeMenu=()=>{menu?.setAttribute('aria-expanded','false');menu?.setAttribute('aria-label','메뉴 열기');nav?.classList.remove('is-open')};
  menu?.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'메뉴 닫기':'메뉴 열기');nav.classList.toggle('is-open',open)});
  nav?.addEventListener('click',event=>{if(event.target.closest('a'))closeMenu()});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&menu?.getAttribute('aria-expanded')==='true'){closeMenu();menu.focus()}});
  document.addEventListener('click',event=>{if(!nav?.contains(event.target)&&!menu?.contains(event.target))closeMenu()});
  if('IntersectionObserver' in window){
    document.documentElement.classList.add('js-enhanced');
    const observer=new IntersectionObserver(entries=>entries.forEach(({target,isIntersecting})=>{if(isIntersecting){target.classList.add('in-view');observer.unobserve(target)}}),{threshold:.12});
    document.querySelectorAll('[data-animate]').forEach(heading=>{
      let i=0;
      const wrap=node=>{for(const child of [...node.childNodes]){if(child.nodeType===Node.TEXT_NODE){const fragment=document.createDocumentFragment();for(const token of child.textContent.match(/\S+\s*|\s+/g)||[]){const span=document.createElement('span');span.className='copy-token';span.style.setProperty('--i',i++);span.textContent=token;fragment.append(span)}child.replaceWith(fragment)}else if(child.nodeType===Node.ELEMENT_NODE&&child.tagName!=='BR')wrap(child)}};
      wrap(heading);observer.observe(heading);
    });
    document.querySelectorAll('[data-reveal]').forEach(node=>observer.observe(node));
  }
  const tabs=[...document.querySelectorAll('[data-feature]')];
  function selectTab(tab){tabs.forEach(t=>{const active=t===tab;t.setAttribute('aria-selected',String(active));t.tabIndex=active?0:-1;document.getElementById(t.getAttribute('aria-controls')).hidden=!active})}
  tabs.forEach((tab,i)=>{tab.addEventListener('click',()=>selectTab(tab));tab.addEventListener('keydown',event=>{let next;if(event.key==='ArrowRight')next=(i+1)%tabs.length;if(event.key==='ArrowLeft')next=(i+tabs.length-1)%tabs.length;if(event.key==='Home')next=0;if(event.key==='End')next=tabs.length-1;if(next!==undefined){event.preventDefault();selectTab(tabs[next]);tabs[next].focus()}})});
  const translations={
    ko:['미국 국채 금리 상승과 파생상품 롱 청산으로 불확실성 지속','미국 10년물 명목 및 실질 국채 금리가 상승하며 자금 조달 비용 압박이 커지는 가운데, 파생 시장에서 롱 포지션 청산이 우위를 보이며 불확실성이 큽니다.'],
    en:['Rising Treasury yields and long liquidations keep uncertainty elevated.','Higher nominal and real US 10-year Treasury yields are adding pressure to funding costs, while long-position liquidations dominate derivatives markets.'],
    ja:['米国債利回りの上昇とロング清算で、不確実性が続く。','米10年国債の名目・実質利回りの上昇で資金調達コストへの圧力が強まる中、デリバティブ市場ではロングポジションの清算が優勢となっています。']
  };
  document.querySelectorAll('[data-language]').forEach(button=>button.addEventListener('click',()=>{const lang=button.dataset.language,paper=document.querySelector('.language-paper');document.querySelectorAll('[data-language]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));paper.lang=lang;document.getElementById('language-title').textContent=translations[lang][0];document.getElementById('language-body').textContent=translations[lang][1];if(!reduced)paper.animate([{opacity:.4,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}],{duration:480,easing:'cubic-bezier(.16,1,.3,1)'})}));
  const planner=document.getElementById('api-planner');
  planner?.addEventListener('submit',event=>{event.preventDefault();const choices=[...planner.querySelectorAll('input[name=dataset]:checked')].map(input=>input.value);const first=planner.querySelector('input');first.setCustomValidity(choices.length?'':'관심 있는 데이터를 한 가지 이상 선택해 주세요.');if(!choices.length){first.reportValidity();return}const purpose=document.getElementById('api-purpose').value,notes=document.getElementById('api-notes').value.trim();document.getElementById('planner-output').value=`위드핀덱스 API 연동 검토 메모\n\n활용 목적: ${purpose}\n관심 데이터: ${choices.join(', ')}\n추가 사항: ${notes||'추후 협의'}\n\nAPI 제공 범위와 규격은 개발 및 협의 후 확정됩니다.\n이 메모는 문의 접수 또는 API 이용 승인이 아닙니다.`;document.getElementById('planner-result').hidden=false;document.getElementById('planner-output').focus();document.getElementById('planner-status').textContent='검토 메모를 만들었습니다. 외부로 전송되지 않았습니다.'});
  planner?.querySelectorAll('input').forEach(input=>input.addEventListener('change',()=>planner.querySelector('input').setCustomValidity('')));
  document.getElementById('copy-planner')?.addEventListener('click',async()=>{const output=document.getElementById('planner-output'),status=document.getElementById('planner-status');try{await navigator.clipboard.writeText(output.value);status.textContent='메모를 복사했습니다.'}catch{output.focus();output.select();status.textContent='메모를 선택했습니다. 복사 단축키로 복사해 주세요.'}});
  let config={};
  const script=document.currentScript;
  if(script)fetch(new URL('site-config.json',script.src)).then(r=>r.ok?r.json():{}).then(data=>{config=data;for(const [platform,key] of [['ios','appStoreUrl'],['android','googlePlayUrl']]){const url=config[key];if(!url)continue;let parsed;try{parsed=new URL(url)}catch{continue}const allowed=platform==='ios'?'apps.apple.com':'play.google.com';if(parsed.protocol!=='https:'||parsed.hostname!==allowed)continue;const button=document.querySelector(`[data-release="${platform}"]`);if(button){button.textContent=platform==='ios'?'App Store에서 다운로드':'Google Play에서 다운로드';button.closest('article').querySelector('.availability').textContent='지금 다운로드할 수 있습니다.'}}}).catch(()=>{});
  const dialog=document.getElementById('release-dialog');
  document.querySelectorAll('[data-release]').forEach(button=>button.addEventListener('click',()=>{const platform=button.dataset.release,key=platform==='ios'?'appStoreUrl':'googlePlayUrl';let url;try{url=new URL(config[key])}catch{}const allowed=platform==='ios'?'apps.apple.com':'play.google.com';if(url?.protocol==='https:'&&url.hostname===allowed){location.assign(url.href);return}document.getElementById('release-title').textContent=(platform==='ios'?'iPhone':'Android')+' 출시 안내';document.getElementById('release-copy').textContent=(platform==='ios'?'App Store':'Google Play')+' 신청을 완료했으며, 공개 다운로드를 준비하고 있습니다.';dialog.showModal()}));
})();
