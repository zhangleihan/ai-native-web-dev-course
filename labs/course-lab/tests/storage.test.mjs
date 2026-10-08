import {before,after,test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
import {PgStore} from '../server/pg-store.mjs';
import {seed,ids} from '../server/fixtures.mjs';
import {prepareRun} from '../server/ai.mjs';
let db,store,alice,admin;
before(async()=>{
 db=new PGlite();await db.exec(await readFile(new URL('../sql/001_initial.sql',import.meta.url),'utf8'));
 // Single-connection SQL compatibility harness; not a test of PostgreSQL TCP/pool concurrency.
 const pool={query:(...args)=>db.query(...args),connect:async()=>({query:(...args)=>db.query(...args),release(){}}),end:()=>db.close()};
 store=new PgStore(pool);await seed(store,'sql-test-password');alice=await store.user(ids.alice);admin=await store.user(ids.admin);
});
after(async()=>store.close());
test('SQL schema与迁移可重复执行',async()=>{await db.exec(await readFile(new URL('../sql/001_initial.sql',import.meta.url),'utf8'));assert.equal((await store.listCases()).length,2);});
test('参数化查询与约束：引号是数据、非法难度不能入库',async()=>{
 assert.equal((await store.listCases({kw:"' OR 1=1 --"})).length,0);
 await assert.rejects(()=>store.createCase({title:'x',industry:'telecom',difficulty:'invalid',ownerId:ids.alice}));
 const c=await store.createCase({title:"O'Reilly样本",industry:'telecom',difficulty:'beginner',ownerId:ids.alice});assert.equal((await store.getCase(c.id)).title,"O'Reilly样本");
});
test('SQL更新检查归属',async()=>{await assert.rejects(()=>store.updateCase(ids.caseB,{title:'不应修改',industry:'retail',difficulty:'beginner'},alice),{code:'FORBIDDEN'});assert.equal((await store.getCase(ids.caseB)).title,'订单延迟');});
test('SQL审批事务与顺序重复批准只创建一次',async()=>{
 const run=await prepareRun({store,user:alice,item:await store.getCase(ids.caseA)});
 assert.equal((await store.decide(run.id,'approve',admin)).status,'COMPLETED');
 assert.equal((await store.decide(run.id,'approve',admin)).status,'COMPLETED');
 assert.equal((await store.listOrders(alice)).filter(o=>o.runId===run.id).length,1);
});
test('建单失败回滚审批与状态，不留下半成品',async()=>{
 const run=await prepareRun({store,user:alice,item:await store.getCase(ids.caseA)});
 await db.query('UPDATE runs SET proposal=$1 WHERE id=$2',[JSON.stringify({...run.proposal,title:null}),run.id]);
 await assert.rejects(()=>store.decide(run.id,'approve',admin));
 assert.equal((await store.getRun(run.id)).status,'WAITING_APPROVAL');
 assert.equal((await db.query('SELECT * FROM approvals WHERE run_id=$1',[run.id])).rows.length,0);
 assert.equal((await store.listOrders(alice)).filter(o=>o.runId===run.id).length,0);
});
test('Harness未知工具与超步数均FAILED且不写工单',async()=>{
 const item=await store.getCase(ids.caseA);
 const denied=await prepareRun({store,user:alice,item,planner:()=>({tool:'shell',args:{}})});assert.equal(denied.error,'TOOL_DENIED');
 const exhausted=await prepareRun({store,user:alice,item,maxSteps:2,planner:()=>({tool:'search_cases',args:{caseId:item.id}})});assert.equal(exhausted.status,'FAILED');assert.equal(exhausted.error,'STEP_LIMIT');
 const wrong=await prepareRun({store,user:alice,item,planner:()=>({tool:'search_cases',args:{caseId:ids.caseB}})});assert.equal(wrong.error,'TOOL_SCOPE');
});
