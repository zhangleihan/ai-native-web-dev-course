import test from 'node:test';
import assert from 'node:assert/strict';
import { initialCases, filterCases, makeCase } from '../lib/cases.js';
import { GET } from '../app/api/cases/route.js';
test('组合筛选、大小写、空态与原数据不变', () => {
  const frozen = Object.freeze(initialCases.map(item => Object.freeze({ ...item })));
  assert.equal(filterCases(frozen, ' DNS ', 'telecom').length, 1);
  assert.equal(filterCases(frozen, '链路', 'retail').length, 0);
  assert.equal(filterCases(frozen, '', 'all').length, 3);
});
test('新增规范化与无效输入', () => {
  assert.deepEqual(makeCase({ title: ' 新案例 ', industry: 'retail' }, 'new-1'), { id: 'new-1', title: '新案例', industry: 'retail' });
  for (const title of ['', '   ', 'a'.repeat(41)]) assert.throws(() => makeCase({title, industry:'retail'}, 'x'));
  assert.throws(() => makeCase({ title:'标题', industry:'unknown'}, 'x'));
});
test('GET 契约、筛选与400', async () => {
  const ok = GET(new Request('http://localhost/api/cases?q=DNS&industry=telecom'));
  assert.equal(ok.status, 200);
  assert.equal((await ok.json()).total, 1);
  assert.equal(GET(new Request('http://localhost/api/cases?industry=bad')).status, 400);
});
