import {test} from 'node:test';
import assert from 'node:assert/strict';
import {fixture,collect,waitFor} from '../scripts/http-client.mjs';
async function lab(t,options) {const f=await fixture(options);t.after(()=>f.close());return f;}
test('创建契约、同源写入和样本上限',async t=>{
  const f=await lab(t,{maxTasks:1});
  assert.equal((await f.json('/tasks',{method:'POST',body:'{"scenario":"unknown"}'})).status,400);
  assert.equal((await f.json('/tasks',{method:'POST',body:'{}',headers:{Origin:'https://outside.invalid'}})).status,403);
  await f.create();assert.equal((await f.json('/tasks',{method:'POST',body:'{}'})).status,429);
});
test('真实SSE连续进度、完整编号、终态与订阅释放',async t=>{
  const f=await lab(t),task=await f.create();
  const response=await fetch(`${f.base}/api/tasks/${task.id}/events`);
  assert.match(response.headers.get('content-type'),/text\/event-stream/);
  const events=await collect(response);
  const ids=events.filter(e=>e.id).map(e=>Number(e.id));assert.deepEqual(ids,[1,2,3,4,5,6,7,8]);
  assert.equal(events.filter(e=>e.type==='progress').length,6);
  assert.equal(events.at(-1).type,'done');assert.equal(events.at(-1).data.status,'COMPLETED');
  const health=await f.json('/health');assert.equal(health.data.subscribers,0);assert.equal(health.data.running,0);assert.equal(health.data.tasks,1);
});
test('断开订阅不取消任务，重连只补发游标之后的事件',async t=>{
  const f=await lab(t,{intervalMs:60}),task=await f.create();
  const first=await collect(await fetch(`${f.base}/api/tasks/${task.id}/events`),{until:e=>e.id==='2'});
  assert.equal(first.at(-1).id,'2');
  await waitFor(()=>f.json('/health'),r=>r.data.subscribers===0);
  assert.equal((await f.json(`/tasks/${task.id}`)).data.status,'RUNNING');
  const rest=await collect(await fetch(`${f.base}/api/tasks/${task.id}/events?after=0`,{headers:{'Last-Event-ID':'2'}}));
  assert.deepEqual(rest.filter(e=>e.id).map(e=>Number(e.id)),[3,4,5,6,7,8]);
  assert.equal(rest.at(-1).data.status,'COMPLETED');
});
test('显式取消幂等，取消后不再产生任务进度',async t=>{
  const f=await lab(t),task=await f.create();
  const a=await f.json(`/tasks/${task.id}/cancel`,{method:'POST',body:'{}'});
  const b=await f.json(`/tasks/${task.id}/cancel`,{method:'POST',body:'{}'});
  assert.equal(a.data.status,'CANCELLED');assert.deepEqual(a.data,b.data);
  const events=await collect(await fetch(`${f.base}/api/tasks/${task.id}/events`));
  assert.equal(events.at(-1).data.status,'CANCELLED');assert.equal(f.tasks.items.get(task.id).timer,null);
});
test('业务失败仍以合法done结束，连接成功不代表执行成功',async t=>{
  const f=await lab(t),task=await f.create('fail');
  const events=await collect(await fetch(`${f.base}/api/tasks/${task.id}/events`));
  assert.equal(events.at(-1).type,'done');assert.equal(events.at(-1).data.status,'FAILED');
  assert.equal(events.filter(e=>e.type==='progress').length,2);
});
test('历史淘汰返回reset快照，不能伪装成完整日志续传',async t=>{
  const f=await lab(t,{historyLimit:2}),task=await f.create();
  await waitFor(()=>f.json(`/tasks/${task.id}`),r=>r.data.status==='COMPLETED');
  const events=await collect(await fetch(`${f.base}/api/tasks/${task.id}/events?after=0`));
  assert.deepEqual(events.map(e=>e.type),['reset','done']);assert.equal(events[0].id,'8');
  assert.equal(events[0].data.step,6);assert.equal(f.tasks.items.get(task.id).events.length,2);
});
test('无效、超前和重复游标在发送SSE头前被拒绝',async t=>{
  const f=await lab(t),task=await f.create();
  for(const after of ['-1','abc','999999','1.5','0&after=1']) {
    const response=await fetch(`${f.base}/api/tasks/${task.id}/events?after=${after}`);
    assert.equal(response.status,400);assert.equal((await response.json()).error.code,'CURSOR');
  }
  assert.equal((await f.json('/tasks/missing')).status,404);
});
test('解码不依赖网络分块，跨字节中文和多帧均能读取',async()=>{
  const bytes=new TextEncoder().encode('id: 1\nevent: progress\ndata: {"message":"中文"}\n\nevent: done\ndata: {}\n\n');let i=0;
  const response=new Response(new ReadableStream({pull(controller){if(i===bytes.length)controller.close();else {controller.enqueue(bytes.slice(i,i+1));i++;}}}));
  const rows=await collect(response);assert.equal(rows[0].data.message,'中文');assert.equal(rows[1].type,'done');
});
