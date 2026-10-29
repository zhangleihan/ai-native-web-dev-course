import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {once} from 'node:events';
import {openDatabase} from '../server/database.mjs';
import {migrate,seed} from '../server/schema.mjs';
import {CaseRepository} from '../server/repository.mjs';
import {createApp} from '../server/app.mjs';
const base={title:'链路演练',industry:'通信',difficulty:'beginner'};
async function fixture(t) {
  const db=await openDatabase({url:'',dataDir:'memory://'});
  t.after(()=>db.close());await migrate(db);await seed(db);return db;
}
test('迁移与种子重复执行不重复建表或覆盖已有数据',async t=>{
 const db=await fixture(t);await migrate(db);await seed(db);
 assert.equal((await db.query('SELECT COUNT(*)::int AS n FROM cases')).rows[0].n,5);
 assert.equal((await db.query('SELECT COUNT(*)::int AS n FROM schema_migrations')).rows[0].n,1);
});
test('约束：NOT NULL、CHECK、UNIQUE和外键拒绝不合法写入',async t=>{
 const db=await fixture(t);
 await assert.rejects(()=>db.query("INSERT INTO cases(id,title,industry,difficulty) VALUES('90000000-0000-0000-0000-000000000001',NULL,'通信','beginner')"),{code:'23502'});
 await assert.rejects(()=>new CaseRepository(db).create({...base,difficulty:'easy'}),{code:'23514'});
 await assert.rejects(()=>db.query("INSERT INTO authors(id,username) VALUES('90000000-0000-0000-0000-000000000002','林同学')"),{code:'23505'});
 await assert.rejects(()=>db.query("UPDATE cases SET author_id='90000000-0000-0000-0000-000000000003' WHERE id='10000000-0000-0000-0000-000000000001'"),{code:'23503'});
});
test('JOIN、NULL与聚合的结果可预测',async t=>{
 const db=await fixture(t);
 assert.equal((await db.query('SELECT c.id FROM cases c JOIN authors a ON a.id=c.author_id')).rows.length,3);
 assert.equal((await db.query('SELECT c.id FROM cases c LEFT JOIN authors a ON a.id=c.author_id')).rows.length,5);
 assert.equal((await db.query('SELECT id FROM cases WHERE author_id IS NULL')).rows.length,2);
 const counts=(await db.query('SELECT a.username,COUNT(c.id)::int AS n FROM authors a LEFT JOIN cases c ON c.author_id=a.id GROUP BY a.id,a.username ORDER BY a.id')).rows;
 assert.deepEqual(counts.map(r=>r.n),[2,1,0]);
});
test('参数化查询将引号当数据；total在筛选后分页前计算',async t=>{
 const repo=new CaseRepository(await fixture(t));
 const page=await repo.list({industry:'通信',limit:1,offset:0});assert.equal(page.total,3);assert.equal(page.items.length,1);
 const item=await repo.create({...base,title:"O'Reilly案例"});assert.equal((await repo.get(item.id)).title,"O'Reilly案例");
 assert.equal((await repo.list({kw:"' OR 1=1 --"})).total,0);
 const empty=await repo.list({industry:'通信',offset:100,limit:1});assert.equal(empty.total,4);assert.equal(empty.items.length,0);
});
test('一条事务内创建案例与标签；第二步失败回滚整条案例',async t=>{
 const db=await fixture(t),repo=new CaseRepository(db);
 const before=(await repo.list()).total;
 await assert.rejects(()=>repo.createWithTags(base,['90000000-0000-0000-0000-000000000004']),{code:'23503'});
 assert.equal((await repo.list()).total,before);
 const item=await repo.createWithTags(base,['20000000-0000-0000-0000-000000000001']);
 assert.equal((await db.query('SELECT * FROM case_tags WHERE case_id=$1',[item.id])).rows.length,1);
});
test('关闭并重新打开文件型数据库，记录仍在',async()=>{
 const directory=await mkdtemp(join(tmpdir(),'course-ch06-'));
 let db;
 try {
  db=await openDatabase({url:'',dataDir:directory});await migrate(db);
  const item=await new CaseRepository(db).create(base);await db.close();db=null;
  db=await openDatabase({url:'',dataDir:directory});assert.equal((await new CaseRepository(db).get(item.id)).title,base.title);
 } finally {if(db) await db.close();await rm(directory,{recursive:true,force:true});}
});
test('HTTP到SQL：创建、分页、非法输入和缺失详情',async t=>{
 const db=await fixture(t);const server=createApp(db).listen(0,'127.0.0.1');await once(server,'listening');
 t.after(()=>{server.closeAllConnections();server.close();});
 const url=`http://127.0.0.1:${server.address().port}`;
 const response=await fetch(url+'/api/cases',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(base)});
 assert.equal(response.status,201);assert.equal((await fetch(url+response.headers.get('location'))).status,200);
 const page=await (await fetch(url+'/api/cases?industry='+encodeURIComponent('通信')+'&limit=1')).json();assert.equal(page.total,4);assert.equal(page.items.length,1);
 assert.equal((await fetch(url+'/api/cases/malformed')).status,400);
 assert.equal((await fetch(url+'/api/cases/90000000-0000-0000-0000-000000000005')).status,404);
});
