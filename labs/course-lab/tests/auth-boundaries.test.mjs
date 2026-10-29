import {test} from 'node:test';
import assert from 'node:assert/strict';
import {once} from 'node:events';
import session from 'express-session';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {createApp} from '../server/app.mjs';
import {MemoryStore} from '../server/memory-store.mjs';
import {seed,ids} from '../server/fixtures.mjs';
import {createClient} from '../../security-basics/client.mjs';
const password='isolated-boundary-password',payload={title:'权限边界练习',industry:'telecom',difficulty:'beginner'};
async function setup(t) {
 const store=new MemoryStore(),sessionStore=new session.MemoryStore();await seed(store,password);
 const server=createApp({store,sessionStore}).listen(0,'127.0.0.1');await once(server,'listening');
 t.after(async()=>{server.closeAllConnections();await new Promise(resolve=>server.close(resolve));});
 const base=`http://127.0.0.1:${server.address().port}`;
 return {store,sessionStore,base,client:()=>createClient(base)};
}
test('认证失败统一状态与正文，匿名身份不泄露散列',async t=>{
 const {client}=await setup(t),a=client(),b=client();
 const wrong=await a.login('alice','wrong-password'),missing=await b.login('unknown-user',password);
 assert.equal(wrong.status,401);assert.deepEqual(wrong.data,missing.data);
 const info=await a.request('/session');assert.equal(info.data.user,null);assert.equal(info.data.passwordHash,undefined);
});
test('登录轮换使旧会话和旧CSRF不能升级或复用',async t=>{
 const {client,base}=await setup(t),a=client();await a.request('/session');
 const cookie=a.cookie,csrf=a.csrf;assert.equal((await a.login('alice',password)).status,200);
 assert.notEqual(a.cookie,cookie);assert.notEqual(a.csrf,csrf);
 assert.equal((await fetch(base+'/api/runs',{headers:{Cookie:cookie}})).status,401);
 assert.equal((await a.request('/cases',{method:'POST',body:payload,headers:{'X-CSRF-Token':csrf}})).status,403);
 assert.equal((await a.request('/cases',{method:'POST',body:payload})).status,201);
});
test('CSRF绑定会话，错误来源即使有有效令牌也失败',async t=>{
 const {client,store}=await setup(t),a=client(),b=client();await a.login('alice',password);await b.login('bob',password);
 const before=store.cases.length;
 assert.equal((await a.request('/cases',{method:'POST',body:payload,headers:{'X-CSRF-Token':b.csrf}})).status,403);
 assert.equal((await a.request('/cases',{method:'POST',body:payload,headers:{Origin:'https://outside.invalid'}})).status,403);assert.equal(store.cases.length,before);
 assert.equal((await a.request('/cases',{method:'POST',body:payload,headers:{Origin:'http://127.0.0.1:3001'}})).status,201);
});
test('授权每次读取服务端角色，管理员降权后失去跨用户修改能力',async t=>{
 const {client,store}=await setup(t),admin=client();await admin.login('admin',password);
 assert.equal((await admin.request('/cases/'+ids.caseB,{method:'PATCH',body:payload})).status,200);
 store.users.find(u=>u.id===ids.admin).role='student';const old=structuredClone(await store.getCase(ids.caseB));
 assert.equal((await admin.request('/cases/'+ids.caseB,{method:'PATCH',body:{...payload,title:'不应生效'}})).status,403);
 assert.deepEqual(await store.getCase(ids.caseB),old);
});
test('伪造归属不能提权，越权写入失败不改变原记录',async t=>{
 const {client,store}=await setup(t),a=client();await a.login('alice',password);
 const created=await a.request('/cases',{method:'POST',body:{...payload,ownerId:ids.bob,role:'admin'}});
 assert.equal(created.status,201);assert.equal(created.data.ownerId,ids.alice);assert.equal(created.data.role,undefined);
 const old=structuredClone(await store.getCase(ids.caseB));assert.equal((await a.request('/cases/'+ids.caseB,{method:'PATCH',body:payload})).status,403);assert.deepEqual(await store.getCase(ids.caseB),old);
 assert.equal((await a.request('/cases/99999999-0000-4000-8000-000000000000',{method:'PATCH',body:payload})).status,404);
});
test('Cookie签名被篡改后不能代表原登录身份',async t=>{
 const {client,base}=await setup(t),a=client();await a.login('alice',password);
 const cookie=a.cookie,changed=cookie.slice(0,-1)+(cookie.endsWith('A')?'B':'A');
 assert.equal((await fetch(base+'/api/runs',{headers:{Cookie:changed}})).status,401);
});
test('注销需要CSRF，成功后旧Cookie不能重放',async t=>{
 const {client,base}=await setup(t),a=client();await a.login('alice',password);
 assert.equal((await a.request('/logout',{method:'POST',body:{},headers:{'X-CSRF-Token':''}})).status,403);assert.equal((await a.request('/runs')).status,200);
 const cookie=a.cookie;assert.equal((await a.request('/logout',{method:'POST',body:{}})).status,204);
 assert.equal((await fetch(base+'/api/runs',{headers:{Cookie:cookie}})).status,401);
});
test('服务端过期会话被拒绝，不依赖浏览器删除Cookie',async t=>{
 const {client,sessionStore,base}=await setup(t),a=client();await a.login('alice',password);
 const all=await new Promise((resolve,reject)=>sessionStore.all((e,v)=>e?reject(e):resolve(v)));
 const [sid,data]=Object.entries(all)[0];data.cookie.expires=new Date(Date.now()-1000).toISOString();
 await new Promise((resolve,reject)=>sessionStore.set(sid,data,e=>e?reject(e):resolve()));
 assert.equal((await fetch(base+'/api/runs',{headers:{Cookie:a.cookie}})).status,401);
});
test('React文本插值转义标签，API保存文本不等于清洗HTML',async t=>{
 const {client}=await setup(t),a=client();await a.login('alice',password);
 const title='<img src=x onerror="console.log(1)">';
 const created=await a.request('/cases',{method:'POST',body:{...payload,title}});assert.equal(created.data.title,title);
 const markup=renderToStaticMarkup(React.createElement('h3',null,title));assert.match(markup,/&lt;img/);assert.doesNotMatch(markup,/<img\b/);
});
