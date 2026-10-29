import {test} from 'node:test';
import assert from 'node:assert/strict';
import {startLab} from '../server/lab.mjs';
import {createClient,createCasesAPI} from '../client/api.mjs';
import {LatestRequest} from '../client/latest.mjs';
async function fixture(t,options={}) {const lab=await startLab(options);t.after(()=>lab.close());return lab;}
const filters={kw:'',industry:'',difficulty:'',offset:0,limit:2};
test('代理GET转发中文筛选与分页，保持实际契约',async t=>{
 const lab=await fixture(t);const api=createCasesAPI(createClient(lab.webOrigin+'/api'));
 const page=await api.list({...filters,kw:'链路',industry:'通信',limit:1});
 assert.equal(page.total,2);assert.equal(page.items.length,1);assert.equal(page.limit,1);
 const empty=await api.list({...filters,kw:'不存在'});assert.equal(empty.total,0);assert.deepEqual(empty.items,[]);
});
test('创建采用服务器编号和规范化结果，失败不插入，204不解析JSON',async t=>{
 const lab=await fixture(t),request=createClient(lab.webOrigin+'/api'),api=createCasesAPI(request);
 const saved=await api.create({title:'  新案例  ',industry:'通信',difficulty:'beginner'});
 assert.equal(saved.title,'新案例');assert.match(saved.id,/^[a-f0-9-]{36}$/);
 const before=(await api.list(filters)).total;
 await assert.rejects(api.create({title:'',industry:'通信',difficulty:'beginner'}),e=>e.kind==='http'&&e.status===400&&!!e.requestId);
 assert.equal((await api.list(filters)).total,before);
 assert.equal(await request('/cases/'+saved.id,{method:'DELETE'}),null);
});
test('503、损坏JSON和数据结构不符分别可见',async t=>{
 const logs=[],lab=await fixture(t,{logger:row=>logs.push(row)}),api=createCasesAPI(createClient(lab.webOrigin+'/api'));
 await assert.rejects(api.list(filters,{scenario:'http-error'}),e=>e.status===503&&e.kind==='http'&&logs.some(row=>row.requestId===e.requestId));
 for(const scenario of ['bad-json','bad-shape'])await assert.rejects(api.list(filters,{scenario}),e=>e.kind==='protocol');
});
test('主动取消与等待超时分类不同，GET不默认发送JSON内容类型',async t=>{
 const lab=await fixture(t),request=createClient(lab.webOrigin+'/api',{timeoutMs:30});
 await assert.rejects(request('/cases?kw=链路',{scenario:'delay'}),e=>e.kind==='timeout');
 const controller=new AbortController();controller.abort();
 await assert.rejects(request('/cases',{signal:controller.signal}),e=>e.name==='AbortError');
 let sent;
 const fake=createClient('/api',{fetchImpl:async(url,options)=>{sent=options;return new Response('{}',{headers:{'Content-Type':'application/json'}});}});
 await fake('/health');assert.equal(sent.headers['Content-Type'],undefined);assert.equal(sent.headers.Accept,'application/json');
});
test('真实慢查询不会覆盖后发快查询',async t=>{
 const lab=await fixture(t),api=createCasesAPI(createClient(lab.webOrigin+'/api')),states=[];
 const latest=new LatestRequest(value=>states.push(value));
 const a=latest.run(signal=>api.list({...filters,kw:'链路'},{signal,scenario:'delay'}));
 const b=latest.run(signal=>api.list({...filters,kw:'订单'},{signal,scenario:'delay'}));
 await Promise.all([a,b]);const success=states.filter(s=>s.status==='success');
 assert.equal(success.length,1);assert.equal(success[0].data.items[0].title,'订单延迟');latest.cancel();
});
test('即使旧操作不响应abort，代次检查仍拒绝旧结果和旧错误',async()=>{
 const states=[];const latest=new LatestRequest(s=>states.push(s));let resolveOld,rejectOld;
 const a=latest.run(()=>new Promise(resolve=>{resolveOld=resolve;}));
 await latest.run(async()=> 'new');resolveOld('old');await a;
 const b=latest.run(()=>new Promise((resolve,reject)=>{rejectOld=reject;}));
 await latest.run(async()=> 'newer');rejectOld(new Error('过时失败'));await b;
 assert.deepEqual(states.filter(s=>s.status==='success').map(s=>s.data),['new','newer']);assert.ok(!states.some(s=>s.status==='error'));
});
test('响应丢失后实际已写入，客户端不会自动重发POST',async t=>{
 const lab=await fixture(t);let writes=0;
 const request=createClient(lab.webOrigin+'/api',{fetchImpl:(url,options)=>{if(options.method==='POST')writes++;return fetch(url,options);}});
 const api=createCasesAPI(request);
 const before=(await api.list(filters)).total;
 await assert.rejects(api.create({title:'响应未确认记录',industry:'通信',difficulty:'beginner'},{scenario:'response-lost'}),e=>e.kind==='http'&&e.status===502);
 assert.equal(writes,1);const after=await api.list({...filters,kw:'响应未确认记录'});
 assert.equal(after.total,1);assert.equal((await api.list(filters)).total,before+1);
});
test('受限CORS预检与可读请求编号，未开放入口不附读取许可',async t=>{
 const lab=await fixture(t);
 const preflight=await fetch(lab.apiOrigin+'/api/cases',{method:'OPTIONS',headers:{Origin:lab.webOrigin,'Access-Control-Request-Method':'POST','Access-Control-Request-Headers':'content-type,x-lab-scenario'}});
 assert.equal(preflight.status,204);assert.equal(preflight.headers.get('access-control-allow-origin'),lab.webOrigin);
 const get=await fetch(lab.apiOrigin+'/api/cases',{headers:{Origin:lab.webOrigin}});
 assert.equal(get.headers.get('access-control-expose-headers'),'X-Request-Id');
 const denied=await fetch(lab.apiOrigin+'/api/cases',{method:'OPTIONS',headers:{Origin:'https://outside.invalid','Access-Control-Request-Method':'POST'}});assert.equal(denied.status,403);
 const noCors=await fetch(lab.apiOrigin+'/no-cors/api/cases',{headers:{Origin:lab.webOrigin}});
 assert.equal(noCors.status,200);assert.equal(noCors.headers.get('access-control-allow-origin'),null);
 // Node仍能读到公开响应；此处只验证响应头，浏览器强制行为需另测。
 assert.equal((await noCors.json()).total,3);
});
