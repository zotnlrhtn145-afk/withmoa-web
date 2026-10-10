/* First-party aggregate traffic. No account, full URL, IP or advertising ID is sent. */
(function(){
 const source=(href,referrer,ua)=>{
  let u;try{u=new URL(href)}catch{return 'direct'}
  const tag=(u.searchParams.get('utm_source')||'').toLowerCase();
  const allowed=['kakao','telegram','google','naver','daum','bing','youtube','push'];
  if(allowed.includes(tag))return tag;
  if(/kakaotalk/i.test(ua))return 'kakao';
  let h='';try{h=new URL(referrer).hostname.toLowerCase()}catch{}
  const match=d=>h===d||h.endsWith('.'+d);
  if(match('t.me')||match('telegram.org'))return 'telegram';
  if(match('kakao.com'))return 'kakao';
  if(match('naver.com'))return 'naver';
  if(match('daum.net'))return 'daum';
  if(match('google.com')||/^(www\.)?google\.(?:[a-z]{2}|co\.[a-z]{2}|com\.[a-z]{2})$/.test(h))return 'google';
  if(match('bing.com'))return 'bing';
  if(match('youtube.com')||match('youtu.be'))return 'youtube';
  if(match('duckduckgo.com')||match('yahoo.com')||match('baidu.com'))return 'other_search';
  if(tag==='shared_link')return 'shared_link';
  if(h&&h!==u.hostname&&!match('withfindex.com')&&!match('withfindex.co.kr')&&h!=='zotnlrhtn145-afk.github.io')return 'other_referral';
  return 'direct';
 };
 if(typeof module!=='undefined')module.exports={source};
 if(typeof window==='undefined'||window.__findexTrafficStarted)return;
 window.__findexTrafficStarted=true;
 const loc=window.location,params=new URLSearchParams(loc.search);
 if(!['withfindex.com','www.withfindex.com','withfindex.co.kr','www.withfindex.co.kr','zotnlrhtn145-afk.github.io'].includes(loc.hostname)||params.has('admin')||params.has('video_stats')||navigator.doNotTrack==='1'||navigator.globalPrivacyControl||/bot|crawler|spider|headless|preview/i.test(navigator.userAgent))return;
 const key='withfindex-traffic-device-v1';let visitor;
 try{visitor=localStorage.getItem(key);if(!/^[0-9a-f-]{36}$/i.test(visitor||'')){visitor=crypto.randomUUID();localStorage.setItem(key,visitor);}}catch{return}
 const surface=document.currentScript?.dataset.surface||'webapp';
 let sentAt=0;
 const send=()=>{if(document.visibilityState!=='visible'||Date.now()-sentAt<1500)return;sentAt=Date.now();
 const body={p_visitor:visitor,p_event:crypto.randomUUID(),p_platform:'web',p_source:source(loc.href,document.referrer,navigator.userAgent),p_surface:surface};
 fetch('https://nqdeyeonxabotddzibmx.supabase.co/rest/v1/rpc/record_traffic_open',{method:'POST',headers:{apikey:'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xZGV5ZW9ueGFib3RkZHppYm14Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcyMjkxNTIsImV4cCI6MjEwMjgwNTE1Mn0.60xlEXLypRK5MVGo2t-vzPSmvb9I12j887wgW2iIUTQ','Content-Type':'application/json'},body:JSON.stringify(body),keepalive:true}).catch(()=>{});
 };
 send();document.addEventListener('visibilitychange',send);window.addEventListener('pageshow',e=>{if(e.persisted)send()});
})();
