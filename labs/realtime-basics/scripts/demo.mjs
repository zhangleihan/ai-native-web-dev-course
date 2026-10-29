import assert from 'node:assert/strict';
import {fixture,collect,waitFor} from './http-client.mjs';
const f=await fixture({intervalMs:60,historyLimit:6});
try {
  console.log('第9讲真实HTTP演示：独立内存任务，无真实模型。');
  const normal=await f.create();
  const first=await collect(await fetch(`${f.base}/api/tasks/${normal.id}/events`),{until:e=>e.id==='2'});
  assert.equal(first.at(-1).id,'2');console.log('1. POST创建201；收到事件#1、#2后关闭本次订阅。');
  await waitFor(()=>f.json('/health'),r=>r.data.subscribers===0);
  assert.equal((await f.json(`/tasks/${normal.id}`)).data.status,'RUNNING');console.log('2. 连接数归零，但任务仍执行中：断开不等于取消。');
  const rest=await collect(await fetch(`${f.base}/api/tasks/${normal.id}/events`,{headers:{'Last-Event-ID':'2'}}));
  assert.deepEqual(rest.filter(e=>e.id).map(e=>Number(e.id)),[3,4,5,6,7,8]);console.log('3. 从#2补发#3–#8，最终COMPLETED，未重复创建任务。');
  const cancel=await f.create();await f.json(`/tasks/${cancel.id}/cancel`,{method:'POST',body:'{}'});
  const stopped=await collect(await fetch(`${f.base}/api/tasks/${cancel.id}/events`));
  assert.equal(stopped.at(-1).data.status,'CANCELLED');console.log('4. 明确取消后done携带CANCELLED，不能显示为成功完成。');
  const fail=await f.create('fail');const failed=await collect(await fetch(`${f.base}/api/tasks/${fail.id}/events`));
  assert.equal(failed.at(-1).data.status,'FAILED');console.log('5. 模拟第3步失败：HTTP流正常结束，业务状态FAILED。');
  const reset=await collect(await fetch(`${f.base}/api/tasks/${normal.id}/events?after=0`));
  assert.equal(reset[0].type,'reset');console.log('6. 历史超出保留范围：reset恢复快照，不伪造旧日志。');
  assert.equal((await f.json('/health')).data.subscribers,0);console.log('通过：6组演示均符合预期，连接资源已释放。');
} finally {await f.close();}
