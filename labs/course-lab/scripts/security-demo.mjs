import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {once} from 'node:events';
import {randomBytes} from 'node:crypto';
import {createInterface} from 'node:readline/promises';
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve,join,relative} from 'node:path';
import {fileURLToPath} from 'node:url';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {createApp} from '../server/app.mjs';
import {MemoryStore} from '../server/memory-store.mjs';
import {seed,ids} from '../server/fixtures.mjs';
import {createClient} from '../../security-basics/client.mjs';

const args=process.argv.slice(2),auto=args.includes('--auto'),saveReport=args.includes('--report');
const directoryFlag=args.indexOf('--report-dir');
for(let i=0;i<args.length;i++) {
  if(args[i]==='--report-dir') {i++;continue;}
  if(!['--auto','--report'].includes(args[i])) throw new Error('支持--auto、--report、--report-dir 目录');
}
if(directoryFlag>=0&&(!args[directoryFlag+1]||args[directoryFlag+1].startsWith('--'))) throw new Error('--report-dir需要目录');
if(!auto&&!process.stdin.isTTY) throw new Error('逐幕演示需要交互终端；自动执行使用npm run security:demo:auto');
const reportDir=directoryFlag>=0?resolve(args[directoryFlag+1]):fileURLToPath(new URL('../../security-basics/demo-output/',import.meta.url));
const store=new MemoryStore(),password=randomBytes(24).toString('hex');
await seed(store,password);
const server=createServer();server.listen(0,'127.0.0.1');await once(server,'listening');
const base=`http://127.0.0.1:${server.address().port}`;
server.on('request',createApp({store,publicOrigin:base}));
const alice=createClient(base),bob=createClient(base),admin=createClient(base);
const input={title:'课堂案例：链路中断',industry:'telecom',difficulty:'beginner'};
const scenes=[];let current,created,anonymousCookie,anonymousCsrf;
const terminal=auto?null:createInterface({input:process.stdin,output:process.stdout});
function request(method,path,response,expected) {
 assert.equal(response.status,expected,`${method} ${path}`);
 const row={method,path,status:response.status,expected,errorCode:response.data?.error?.code??null};
 current.requests.push(row);console.log(`  ${method} ${path} → ${response.status}${row.errorCode?' '+row.errorCode:''}`);
}
async function raw(path,cookie) {
 const response=await fetch(base+'/api'+path,{headers:{Cookie:cookie}});
 return {status:response.status,data:await response.json()};
}
async function scene(number,title,question,work) {
 console.log(`\n${number}. ${title}\n预测：${question}`);
 if(terminal) await terminal.question('按回车执行本幕；Ctrl+C结束。');
 current={number,title,question,requests:[],evidence:{},conclusion:'',passed:false};
 await work();current.passed=true;scenes.push(current);
 console.log('结论：'+current.conclusion);
}
const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
async function report() {
 const result={title:'第8讲：同一套API的身份与权限边界',generatedAt:new Date().toISOString(),
  mode:'独立内存服务；随机本机端口；每次重新准备数据',sceneCount:scenes.length,
  boundary:'真实HTTP和内存数据验证；不模拟浏览器SameSite/CORS，不代表生产HTTPS或持久化验证',scenes};
 await mkdir(reportDir,{recursive:true});
 await writeFile(join(reportDir,'report.json'),JSON.stringify(result,null,2)+'\n');
 const html=`<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(result.title)}</title>
<style>body{margin:0;background:#fff;color:#17212d;font:16px/1.8 system-ui,-apple-system,"PingFang SC",sans-serif}main{max-width:1060px;margin:auto;padding:40px 24px}h1{font-size:30px;line-height:1.4}h2{font-size:22px}header{border-bottom:1px solid #dbe2e8;padding-bottom:24px}.meta,small{color:#536375}.success{color:#187445}section{padding:24px 0;border-bottom:1px solid #e4e8ed}table{border-collapse:collapse;width:100%;font-size:14px}th,td{text-align:left;border-bottom:1px solid #e4e8ed;padding:8px}pre{white-space:pre-wrap;overflow-wrap:anywhere;background:#f5f7f9;padding:16px;border-radius:6px;font-size:14px}.table-wrap{overflow:auto}summary{cursor:pointer}a{color:#235f99}@media print{main{padding:0}section{break-inside:avoid}}</style>
<main><header><p class="meta">身份认证与Web安全 · 真实执行报告</p><h1>${esc(result.title)}</h1><p class="success">${scenes.length}幕全部符合预期。401/403表示被正确拒绝，属于演示成功。</p><p>${esc(result.mode)}</p><small>生成时间：${esc(new Date(result.generatedAt).toLocaleString('zh-CN',{timeZone:'Asia/Shanghai',hour12:false}))}（北京时间）</small></header>
${scenes.map(s=>`<section><h2>${s.number}. ${esc(s.title)}</h2><p>先预测：${esc(s.question)}</p><div class="table-wrap"><table><thead><tr><th>请求</th><th>实际状态</th><th>错误分类</th><th>预期</th></tr></thead><tbody>${s.requests.map(q=>`<tr><td>${esc(q.method+' '+q.path)}</td><td>${q.status}</td><td>${esc(q.errorCode??'成功')}</td><td>${q.expected}</td></tr>`).join('')}</tbody></table></div><p class="success">${esc(s.conclusion)}</p><details><summary>查看数据与判断证据</summary><pre>${esc(JSON.stringify(s.evidence,null,2))}</pre></details></section>`).join('')}
<p class="meta">${esc(result.boundary)}。报告不包含口令、Cookie和CSRF实际值。服务关闭后本次会话失效；再次执行会重新生成报告。</p></main></html>`;
 await writeFile(join(reportDir,'report.html'),html);
 console.log('\n报告已生成：'+relative(process.cwd(),join(reportDir,'report.html')));
}
console.log('第8讲逐幕演示：独立内存数据、随机本机端口，使用现有真实API。');
console.log('不会读取.env，不使用已有账号会话，不输出口令、Cookie或CSRF值。');
try {
 await scene(1,'有CSRF也不等于已登录','匿名请求具备有效CSRF，能创建案例吗？',async()=>{
  const session=await alice.request('/session');request('GET','/api/session',session,200);
  anonymousCookie=alice.cookie;anonymousCsrf=alice.csrf;
  const before=store.cases.length;request('POST','/api/cases',await alice.request('/cases',{method:'POST',body:input}),401);
  assert.equal(store.cases.length,before);current.evidence={user:session.data.user,csrfPrepared:true,countBefore:before,countAfter:store.cases.length};
  current.conclusion='CSRF是写请求防护，不是身份；匿名创建401且案例数量未变。';
 });
 await scene(2,'登录建立新的会话','登录前的匿名Cookie会不会一起获得登录权限？',async()=>{
  const response=await alice.request('/login',{method:'POST',body:{username:'alice',password}});request('POST','/api/login',response,200);
  const rotated=alice.cookie!==anonymousCookie,csrfRotated=alice.csrf!==anonymousCsrf;assert.ok(rotated&&csrfRotated);assert.match(response.headers.get('set-cookie'),/HttpOnly/i);assert.match(response.headers.get('set-cookie'),/SameSite=Lax/i);
  request('GET','/api/runs（旧匿名Cookie）',await raw('/runs',anonymousCookie),401);
  current.evidence={user:response.data.user,cookieRotated:rotated,csrfRotated,httpOnly:/HttpOnly/i.test(response.headers.get('set-cookie')),sameSiteLax:/SameSite=Lax/i.test(response.headers.get('set-cookie'))};
  current.conclusion='登录轮换会话与CSRF，旧匿名Cookie不能访问受保护运行。';
 });
 await scene(3,'本人可以创建与修改','如果把所有写入都拒绝，也算授权正确吗？',async()=>{
  const response=await alice.request('/cases',{method:'POST',body:input});request('POST','/api/cases',response,201);created=response.data;
  const updated=await alice.request('/cases/'+created.id,{method:'PATCH',body:{...input,title:'课堂案例：已修订'}});request('PATCH','/api/cases/本人案例',updated,200);
  assert.equal(updated.data.ownerId,ids.alice);assert.equal(updated.data.title,'课堂案例：已修订');
  current.evidence={before:created,after:updated.data};current.conclusion='正常路径可完成，后续拒绝才有比较依据。';
 });
 await scene(4,'只换编号不能修改他人案例','保留alice身份和有效CSRF，只把目标换成bob会怎样？',async()=>{
  const before=structuredClone(await store.getCase(ids.caseB));
  request('PATCH','/api/cases/bob案例',await alice.request('/cases/'+ids.caseB,{method:'PATCH',body:{...input,title:'不应写入'}}),403);
  const after=structuredClone(await store.getCase(ids.caseB));assert.deepEqual(after,before);
  current.evidence={actor:'alice',before,after,unchanged:true};current.conclusion='FORBIDDEN且原对象未变，证明对象授权而非仅隐藏按钮。';
 });
 await scene(5,'请求体不能自行赋予身份','提交role=admin和管理员ownerId，会创建管理员案例吗？',async()=>{
  const response=await alice.request('/cases',{method:'POST',body:{...input,title:'课堂案例：伪造归属验证',ownerId:ids.admin,role:'admin'}});request('POST','/api/cases（夹带归属和角色）',response,201);
  assert.equal(response.data.ownerId,ids.alice);assert.equal(response.data.role,undefined);assert.equal((await store.user(ids.alice)).role,'student');
  current.evidence={submitted:{ownerId:ids.admin,role:'admin'},saved:response.data,actualRole:'student'};
  current.conclusion='本实现忽略多余字段，案例仍归alice；201不意味着伪造字段生效。';
 });
 await scene(6,'同样是403，拒绝层并不相同','正确登录后，旧令牌、别人的令牌和错误来源分别会怎样？',async()=>{
  assert.equal((await bob.login('bob',password)).status,200);const before=store.cases.length;
  for(const [label,headers,code] of [
   ['旧CSRF',{'X-CSRF-Token':anonymousCsrf},'CSRF'],
   ['另一会话CSRF',{'X-CSRF-Token':bob.csrf},'CSRF'],
   ['错误Origin',{Origin:'https://outside.invalid'},'ORIGIN'],
  ]) {const response=await alice.request('/cases',{method:'POST',body:input,headers});request('POST','/api/cases（'+label+'）',response,403);assert.equal(response.data.error.code,code);}
  assert.equal(store.cases.length,before);current.evidence={countBefore:before,countAfter:store.cases.length,unchanged:true};
  current.conclusion='错误码区分CSRF与来源；三次失败均未新增数据，错误Origin仅发往本机API。';
 });
 await scene(7,'服务端角色确实参与授权','同一个bob案例由管理员修改，结果应与alice相同吗？',async()=>{
  const login=await admin.login('admin',password);assert.equal(login.status,200);
  const before=structuredClone(await store.getCase(ids.caseB));
  const response=await admin.request('/cases/'+ids.caseB,{method:'PATCH',body:{title:'课堂案例：管理员已更新',industry:before.industry,difficulty:before.difficulty}});request('PATCH','/api/cases/bob案例（管理员）',response,200);
  assert.equal(response.data.ownerId,ids.bob);current.evidence={actor:login.data.user,before,after:response.data};
  current.conclusion='管理员修改200且归属仍为bob；此处只修改本次独立内存样本。';
 });
 await scene(8,'API字符串与网页输出是两层','标题含HTML标记，保存成功是否表示浏览器应解释它？',async()=>{
  const title='<strong>课堂标记</strong>';
  const response=await alice.request('/cases/'+created.id,{method:'PATCH',body:{...input,title}});request('PATCH','/api/cases/本人案例（文本标题）',response,200);
  const markup=renderToStaticMarkup(React.createElement('h3',null,response.data.title));
  assert.equal(response.data.title,title);assert.match(markup,/&lt;strong&gt;/);assert.doesNotMatch(markup,/<strong>/);
  current.evidence={savedTitle:response.data.title,reactMarkup:markup};current.conclusion='数据库/API保留文本，React文本插值转义；这里验证服务器渲染，不是完整浏览器XSS检查。';
 });
 await scene(9,'退出必须让旧凭据失效','只清空界面够吗？合法退出后保存的Cookie还能使用吗？',async()=>{
  const old=alice.cookie;request('POST','/api/logout',await alice.request('/logout',{method:'POST',body:{}}),204);
  request('GET','/api/runs（退出前Cookie）',await raw('/runs',old),401);
  current.evidence={serverSessionDestroyed:true,replayedCredentialRejected:true};current.conclusion='服务端注销后，旧Cookie重放401；不是仅清空React状态。';
 });
 console.log('\n完成：9幕全部符合预期。重新运行即恢复一套独立样本。');
 if(saveReport) await report();
} finally {
 terminal?.close();server.closeAllConnections();await new Promise(resolve=>server.close(resolve));
}
