// Node fetch不维护Cookie，教学客户端显式保存单个会话Cookie，不输出凭据。
export function createClient(base) {
  let cookie='',csrf='';
  return {
    get cookie() {return cookie;}, get csrf() {return csrf;},
    async request(path,{method='GET',body,headers={}}={}) {
      const response=await fetch(`${base}/api${path}`,{method,
        headers:{Cookie:cookie,'Content-Type':'application/json',...(!['GET','HEAD'].includes(method)?{'X-CSRF-Token':csrf}:{}),...headers},
        body:body===undefined?undefined:JSON.stringify(body)});
      const setCookie=response.headers.get('set-cookie');if(setCookie) cookie=setCookie.split(';')[0];
      const data=response.status===204?null:await response.json();if(data?.csrf) csrf=data.csrf;
      return {status:response.status,data,headers:response.headers};
    },
    async login(username,password) {await this.request('/session');return this.request('/login',{method:'POST',body:{username,password}});},
  };
}
