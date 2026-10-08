let csrf='';
export async function api(path,options={}) {
  const response=await fetch(`/api${path}`,{...options,headers:{'Content-Type':'application/json',...(options.method?{'X-CSRF-Token':csrf}:{}),...options.headers}});
  if(response.status===204) return null;
  const data=await response.json();
  if(!response.ok) throw new Error(data.error?.message??`HTTP ${response.status}`);
  if(data.csrf) csrf=data.csrf;
  return data;
}
export const post=(path,body)=>api(path,{method:'POST',body:JSON.stringify(body)});
