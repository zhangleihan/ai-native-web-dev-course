export class ApiError extends Error {
  constructor(message,{kind='http',status=0,code='',requestId=''}={}) {
    super(message);this.name='ApiError';Object.assign(this,{kind,status,code,requestId});
  }
}
export function createClient(base='/api',{fetchImpl=fetch,timeoutMs=5000}={}) {
  return async function request(path,{method='GET',body,signal,scenario='normal',timeout=timeoutMs}={}) {
    const controller=new AbortController();let expired=false;
    const abort=()=>controller.abort();
    if(signal?.aborted)abort();else signal?.addEventListener('abort',abort,{once:true});
    const timer=setTimeout(()=>{expired=true;controller.abort();},timeout);
    try {
      const headers={Accept:'application/json'};
      if(body!==undefined)headers['Content-Type']='application/json';
      if(scenario!=='normal')headers['X-Lab-Scenario']=scenario;
      const response=await fetchImpl(base+path,{method,headers,signal:controller.signal,...(body===undefined?{}:{body:JSON.stringify(body)})});
      const requestId=response.headers.get('x-request-id')??'';
      if(response.status===204)return null;
      const raw=await response.text();let data;
      const isJSON=/^application\/(?:[\w.-]+\+)?json(?:\s*;|$)/i.test(response.headers.get('content-type')??'');
      if(isJSON) {try {data=JSON.parse(raw);}catch { /* 成功JSON错误单独分类；HTTP失败仍保留HTTP状态。 */ }}
      if(!response.ok)throw new ApiError(typeof data?.error?.message==='string'?data.error.message:`HTTP ${response.status}`,{
        kind:'http',status:response.status,code:data?.error?.code??'',requestId:data?.error?.requestId??requestId});
      if(!isJSON||data===undefined)throw new ApiError('响应不是约定的JSON，请核对API地址与服务端输出',{kind:'protocol',status:response.status,requestId});
      return data;
    } catch(error) {
      if(error instanceof ApiError)throw error;
      if(signal?.aborted)throw new DOMException('当前请求已取消','AbortError');
      if(expired)throw new ApiError('等待响应超时；读取可重试，写入需先确认是否已保存',{kind:'timeout'});
      throw new ApiError('未能读取响应，请检查网络、服务、代理或CORS',{kind:'network'});
    } finally {clearTimeout(timer);signal?.removeEventListener('abort',abort);}
  };
}
const levels=['beginner','intermediate','advanced'];
export function readCase(value) {
  if(!value||typeof value.id!=='string'||!value.id||typeof value.title!=='string'||!value.title.trim()||
     typeof value.industry!=='string'||!value.industry.trim()||!levels.includes(value.difficulty))
    throw new ApiError('案例字段不符合约定',{kind:'protocol'});
  return value;
}
export function readPage(value) {
  if(!value||!Array.isArray(value.items)||!Number.isSafeInteger(value.total)||value.total<0||
     !Number.isSafeInteger(value.offset)||value.offset<0||!Number.isInteger(value.limit)||value.limit<1||value.limit>50)
    throw new ApiError('列表结构不符合约定',{kind:'protocol'});
  value.items.forEach(readCase);return value;
}
export function createCasesAPI(request) {
  return {
    async list(filters,options) {
      const query=new URLSearchParams();
      for(const [key,value] of Object.entries(filters))if(value!==undefined&&value!=='')query.set(key,String(value));
      return readPage(await request('/cases?'+query,options));
    },
    async create(fields,options) {return readCase(await request('/cases',{...options,method:'POST',body:fields}));}
  };
}
