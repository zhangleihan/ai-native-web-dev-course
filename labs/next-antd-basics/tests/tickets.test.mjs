import test from 'node:test';
import assert from 'node:assert/strict';
import {initialTickets, filterTickets, saveTicket} from '../lib/tickets.js';
test('10条数据身份唯一，状态分布为4/3/3，组合筛选与空结果正确', () => {
  assert.equal(new Set(initialTickets.map(item => item.id)).size,10);
  assert.deepEqual(['待处理','处理中','已完成'].map(status => filterTickets(initialTickets,'','全部',status).length),[4,3,3]);
  assert.equal(filterTickets(initialTickets,' 网络 ','网络','待处理').length,2);
  assert.equal(filterTickets(initialTickets,'不存在','全部','全部').length,0);
});
test('编辑保留身份与日期，新增增加记录，原数组不变', () => {
  const original=JSON.stringify(initialTickets), item=initialTickets[0];
  const edited=saveTicket(initialTickets,{...item,status:'已完成'},item.id,'2099-01-01');
  assert.equal(edited.length,10);assert.equal(edited.find(row=>row.id===item.id).status,'已完成');
  assert.equal(edited[0].createdAt,item.createdAt);assert.equal(JSON.stringify(initialTickets),original);
  assert.equal(saveTicket(initialTickets,item,'new','2026-10-22').length,11);
});
test('拒绝空白字段、过长文本和非法业务值', () => {
  for(const values of [{title:' '},{location:''},{description:'x'.repeat(301)},{category:'未知'},{status:'未知'}])
    assert.throws(()=>saveTicket(initialTickets,{...initialTickets[0],...values},'new','2026-10-22'));
});
