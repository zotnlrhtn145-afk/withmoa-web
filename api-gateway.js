// Installed before application modules. The server enforces the same boundary.
(() => {
 const origin='https://nqdeyeonxabotddzibmx.supabase.co';
 const original=globalThis.fetch.bind(globalThis);
 globalThis.fetch=async(input,init)=>{
  const source=input instanceof Request?input.url:String(input);
  let url;try{url=new URL(source,globalThis.location?.href);}catch{return original(input,init);}
  if(url.origin!==origin||!url.pathname.startsWith('/rest/v1/'))return original(input,init);
  url.pathname='/functions/v1/read-gateway'+url.pathname;
  const request=new Request(input,init);
  const headers=new Headers(request.headers);
  if(!headers.has('authorization')&&headers.get('apikey')?.startsWith('eyJ'))headers.set('authorization','Bearer '+headers.get('apikey'));
  const body=request.body?await request.arrayBuffer():undefined;
  return original(new Request(url,{method:request.method,headers,body,
   mode:request.mode,credentials:request.credentials,cache:request.cache,redirect:request.redirect,
   referrer:request.referrer,referrerPolicy:request.referrerPolicy,integrity:request.integrity,
   keepalive:request.keepalive,signal:request.signal}));
 };
})();