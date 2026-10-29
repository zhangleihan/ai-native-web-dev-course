import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {once} from 'node:events';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import {createDocsServer} from './server.mjs';
const spec=JSON.parse(await readFile(new URL('../openapi.json',import.meta.url)));
const ajv=new Ajv2020({strict:true,allErrors:true});addFormats(ajv);
function rewrite(value) {
 if(Array.isArray(value))return value.map(rewrite);
 if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,k==='$ref'?v.replace('#/components/schemas/','#/$defs/'):rewrite(v)]));
 return value;
}
function validator(schema) {return ajv.compile({...rewrite(schema),$defs:rewrite(spec.components.schemas)});}
const checks=new Map();
const server=createDocsServer();server.listen(0,'127.0.0.1');await once(server,'listening');
const base=`http://127.0.0.1:${server.address().port}`;
async function call(path,method,expected,body,template=path) {
 const response=await fetch(base+path,{method,headers:{'Content-Type':'application/json'},...(body===undefined?{}:{body:JSON.stringify(body)})});
 assert.equal(response.status,expected,`${method} ${path}`);
 const contract=spec.paths[template]?.[method.toLowerCase()]?.responses[String(expected)];assert.ok(contract,'该状态未在规范中声明');
 const resolved=contract.$ref?spec.components.responses[contract.$ref.split('/').at(-1)]:contract;
 const raw=await response.text();let data;
 if(expected===204){assert.equal(raw,'');assert.ok(!resolved.content);}
 else {
  assert.match(response.headers.get('content-type'),/application\/json/);data=JSON.parse(raw);
  const key=method+template+expected;
  if(!checks.has(key))checks.set(key,validator(resolved.content['application/json'].schema));
  const valid=checks.get(key);assert.ok(valid(data),JSON.stringify(valid.errors));
 }
 return {data,response};
}
try {
 const page=await call('/api/cases','GET',200);assert.equal(page.data.total,0);console.log('1. 列表200与OpenAPI结构一致。');
 const fields={title:'链路中断',industry:'通信',difficulty:'beginner'};
 const {data:created,response}=await call('/api/cases','POST',201,fields);
 const path='/api/cases/'+created.id;assert.equal(response.headers.get('location'),path);
 const detail=await call(path,'GET',200,undefined,'/api/cases/{id}');assert.deepEqual(detail.data,created);console.log('2. 创建201、Location和详情200均符合契约。');
 const patch=await call(path,'PATCH',200,{title:'链路恢复'},'/api/cases/{id}');assert.equal(patch.data.industry,created.industry);console.log('3. PATCH部分更新保留未提交字段。');
 await call('/api/cases','POST',400,{...fields,title:''});
 assert.equal((await call('/api/cases','GET',200)).data.total,1);console.log('4. 空标题400、错误结构符合契约，未插入数据。');
 await call('/api/cases?limit=0','GET',400,undefined,'/api/cases');console.log('5. 非法分页400已声明并验证。');
 await call('/api/cases/missing','GET',404,undefined,'/api/cases/{id}');console.log('6. 未知资源404与错误结构符合契约。');
 await call(path,'DELETE',204,undefined,'/api/cases/{id}');await call(path,'GET',404,undefined,'/api/cases/{id}');console.log('7. 删除204无响应体，后续读取404。');
 const valid=validator({$ref:'#/components/schemas/Case'});assert.equal(valid({...created,unexpected:true}),false);console.log('8. 负向对照：额外响应字段会被Schema拒绝。');
 const doc=await fetch(base+'/docs');assert.equal(doc.status,200);assert.match(await doc.text(),/validatorUrl:null/);
 assert.equal((await fetch(base+'/vendor/swagger-ui-bundle.js')).status,200);
 console.log('通过：8组真实契约检查；本机文档与脚本资源可访问。仅覆盖列出的路径和边界。');
} finally {server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
