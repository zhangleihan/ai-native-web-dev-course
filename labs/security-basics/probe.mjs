import assert from 'node:assert/strict';
import {createClient} from './client.mjs';
const base=process.env.PUBLIC_ORIGIN??'http://127.0.0.1:3001',url=new URL(base);
if(!['127.0.0.1','localhost','[::1]'].includes(url.hostname)||url.origin!==base||url.protocol!=='http:') throw new Error('本练习仅连接本机HTTP案例实验');
const password=process.env.LAB_PASSWORD;if(!password) throw new Error('请从course-lab的.env加载练习口令');
const user=createClient(base),payload={title:'第8讲权限验证记录',industry:'telecom',difficulty:'beginner'};
let loggedIn=false;
try {
 await user.request('/session');
 assert.equal((await user.request('/cases',{method:'POST',body:payload})).status,401);console.log('PASS 未登录但CSRF有效：401');
 const beforeCookie=user.cookie,oldCsrf=user.csrf;
 const login=await user.request('/login',{method:'POST',body:{username:'alice',password}});assert.equal(login.status,200);loggedIn=true;
 assert.notEqual(user.cookie,beforeCookie);assert.notEqual(user.csrf,oldCsrf);console.log('PASS 登录轮换会话与CSRF令牌');
 assert.equal((await user.request('/cases',{method:'POST',body:payload,headers:{'X-CSRF-Token':oldCsrf}})).status,403);
 assert.equal((await user.request('/cases',{method:'POST',body:payload,headers:{Origin:'https://outside.invalid'}})).status,403);console.log('PASS 旧令牌与错误来源：403');
 const created=await user.request('/cases',{method:'POST',body:{...payload,role:'admin',ownerId:'10000000-0000-4000-8000-000000000003'}});
 assert.equal(created.status,201);assert.equal(created.data.ownerId,login.data.user.id);assert.equal(created.data.role,undefined);console.log('PASS 创建只采用服务端身份；新增1条练习记录');
 const target='20000000-0000-4000-8000-000000000002',old=(await user.request('/cases/'+target)).data;
 assert.equal((await user.request('/cases/'+target,{method:'PATCH',body:payload})).status,403);assert.equal((await user.request('/cases/'+target)).data.title,old.title);console.log('PASS 越权403且原记录未变');
 const cookie=user.cookie;assert.equal((await user.request('/logout',{method:'POST',body:{}})).status,204);loggedIn=false;
 assert.equal((await fetch(base+'/api/runs',{headers:{Cookie:cookie}})).status,401);console.log('PASS 退出后旧Cookie：401');
} finally {if(loggedIn) await user.request('/logout',{method:'POST',body:{}}).catch(()=>{});}
