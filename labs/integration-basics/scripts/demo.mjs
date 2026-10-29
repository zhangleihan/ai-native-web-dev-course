import assert from 'node:assert/strict';
import {startLab} from '../server/lab.mjs';
import {createClient,createCasesAPI} from '../client/api.mjs';
import {LatestRequest} from '../client/latest.mjs';
const lab=await startLab();const request=createClient(lab.webOrigin+'/api'),api=createCasesAPI(request);
const filters={kw:'',industry:'',difficulty:'',offset:0,limit:2};
try {
 console.log('第7讲联调演示：独立API与代理，真实HTTP和固定故障注入。');
 assert.equal((await api.list(filters)).total,3);console.log('1. 通过同源代理读取固定3条样本；本页按limit=2分页。');
 assert.equal((await api.list({...filters,kw:'不存在'})).total,0);console.log('2. 空筛选为成功空结果，不是网络错误。');
 for(const scenario of ['http-error','bad-json','bad-shape']){
   await assert.rejects(api.list(filters,{scenario}),e=>scenario==='http-error'?e.status===503:e.kind==='protocol');
 }
 console.log('3. 503、坏JSON、错误结构均被识别，没有变成空列表。');
 const published=[],latest=new LatestRequest(s=>published.push(s));
 const a=latest.run(signal=>api.list({...filters,kw:'链路'},{signal,scenario:'delay'}));
 const b=latest.run(signal=>api.list({...filters,kw:'订单'},{signal,scenario:'delay'}));
 await Promise.all([a,b]);assert.equal(published.filter(s=>s.status==='success').length,1);
 assert.equal(published.at(-1).data.items[0].title,'订单延迟');console.log('4. 慢链路查询被后发订单查询取代；只发布当前结果。');
 const saved=await api.create({title:'  规范化案例  ',industry:'通信',difficulty:'beginner'});assert.equal(saved.title,'规范化案例');console.log('5. 创建201采用服务器返回的编号与去空白结果。');
 await assert.rejects(api.create({title:'响应丢失样本',industry:'通信',difficulty:'beginner'},{scenario:'response-lost'}),e=>e.status===502);
 assert.equal((await api.list({...filters,kw:'响应丢失样本'})).total,1);console.log('6. 代理502但案例已保存：查询确认，不自动重试写入。');
 console.log('通过：6组对照符合预期。CORS浏览器强制行为需在页面单独观察。');
} finally {await lab.close();}
