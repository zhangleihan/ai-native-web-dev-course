import {test} from 'node:test';
import assert from 'node:assert/strict';
import {once} from 'node:events';
import {createApp} from '../server/app.mjs';
const sample = {title: ' 链路中断 ', industry: '通信', difficulty: 'beginner'};
async function setup(t, options = {}) {
  const server = createApp({logger: () => {}, ...options}).listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => {server.closeAllConnections(); server.close();});
  const base = `http://127.0.0.1:${server.address().port}`;
  return (path, {body, ...options} = {}) => fetch(base + path, body === undefined || options.headers ? {...options, body}
    : {...options, headers: {'Content-Type': 'application/json'}, body: JSON.stringify(body)});
}
test('创建和详情遵守201、Location及服务端编号契约', async t => {
  const api = await setup(t);
  const response = await api('/api/cases', {method: 'POST', body: sample});
  assert.equal(response.status, 201);
  const item = await response.json();
  assert.equal(item.title, '链路中断');
  assert.ok(item.id);
  assert.deepEqual(await (await api(response.headers.get('location'))).json(), item);
});
test('筛选和分页：total在切片前计算', async t => {
  const api = await setup(t);
  for (const title of ['链路一', '链路二', '其他']) await api('/api/cases', {method: 'POST', body: {...sample, title}});
  const page = await (await api('/api/cases?kw=链路&industry=通信&difficulty=beginner&offset=1&limit=1')).json();
  assert.equal(page.total, 2); assert.equal(page.items.length, 1); assert.equal(page.items[0].title, '链路二');
  assert.equal((await api('/api/cases?limit=1x')).status, 400);
  assert.equal((await api('/api/cases?limit=51')).status, 400);
  assert.equal((await api('/api/cases?kw=a&kw=b')).status, 400);
});
test('校验失败不会产生记录或改写受保护字段', async t => {
  const api = await setup(t);
  for (const body of [{...sample, title: ' '}, {...sample, difficulty: 'easy'}, {...sample, owner: 'admin'}, []]) {
    assert.equal((await api('/api/cases', {method: 'POST', body})).status, 400);
  }
  assert.equal((await (await api('/api/cases')).json()).total, 0);
});
test('PATCH只改变已提交字段；空更新和null均失败', async t => {
  const api = await setup(t);
  const item = await (await api('/api/cases', {method: 'POST', body: sample})).json();
  const path = `/api/cases/${item.id}`;
  const changed = await (await api(path, {method: 'PATCH', body: {title: '链路恢复'}})).json();
  assert.equal(changed.industry, item.industry); assert.equal(changed.title, '链路恢复');
  assert.equal((await api(path, {method: 'PATCH', body: {}})).status, 400);
  assert.equal((await api(path, {method: 'PATCH', body: {title: null}})).status, 400);
});
test('删除后为404；204没有响应体', async t => {
  const api = await setup(t);
  const item = await (await api('/api/cases', {method: 'POST', body: sample})).json();
  const path = `/api/cases/${item.id}`;
  const deleted = await api(path, {method: 'DELETE'});
  assert.equal(deleted.status, 204); assert.equal(await deleted.text(), '');
  assert.equal((await api(path)).status, 404); assert.equal((await api(path, {method: 'DELETE'})).status, 404);
});
test('媒体类型、坏JSON、过大请求及未知路径均返回结构化错误', async t => {
  const api = await setup(t);
  assert.equal((await api('/api/cases', {method: 'POST', headers: {'Content-Type': 'text/plain'}, body: 'x'})).status, 415);
  const bad = await api('/api/cases', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: '{'});
  assert.equal(bad.status, 400); assert.equal((await bad.json()).error.code, 'INVALID_JSON');
  assert.equal((await api('/api/cases', {method: 'POST', body: {...sample, title: 'a'.repeat(40000)}})).status, 413);
  const missing = await api('/api/unknown'); assert.equal(missing.status, 404);
  assert.equal((await missing.json()).error.requestId, missing.headers.get('x-request-id'));
});
test('异步存储失败进入500；新应用不共享旧数组', async t => {
  const broken = await setup(t, {store: {async list() {throw new Error('private database detail');}}});
  const response = await broken('/api/cases'); assert.equal(response.status, 500);
  assert.equal((await response.json()).error.message, '服务暂不可用');
  const first = await setup(t); await first('/api/cases', {method: 'POST', body: sample});
  const fresh = await setup(t); assert.equal((await (await fresh('/api/cases')).json()).total, 0);
});
