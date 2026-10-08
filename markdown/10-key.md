# 测试：从需求到可重复的失败证据

## 学习目标与课前准备

学完本讲，应能：为核心需求选择测试层级；写出成功与失败断言；区分软件测试和模型评估

先修：第 5–8 讲的 API、数据库和权限。本讲 2 学时，按每学时 45 分钟安排：回顾与问题导入 10 分钟、概念和示例 30 分钟、课堂练习 40 分钟、讲评与出口检查 10 分钟。课后练习时间不计入 32 学时。


## 测的是承诺，不是实现步骤

“查询不存在的行业返回空结果”“普通用户不能修改他人案例”“重试同一批准不会重复建单”是可测试承诺。测试只断言函数被调用过，却不验证用户得到什么结果，通常无法证明这些承诺。

| 层级 | 本课样例 | 主要价值 |
|---|---|---|
| 单元 | 过滤函数、状态迁移 | 快速覆盖边界 |
| API 集成 | HTTP 状态、JSON、数据库写入 | 验证契约与持久化 |
| 组件 | 加载、空结果、错误提示 | 验证交互反馈 |
| 少量端到端 | 登录→创建→刷新查询 | 验证关键链路 |

类型检查发现一类静态错误，不能代替运行时测试；测试覆盖率高也不保证需求正确。

## 一个可执行的 API 冒烟检查

在运行中的**隔离练习服务**上执行，保存为 `smoke.cjs` 后运行 `node smoke.cjs`。需要支持全局 fetch 的 Node。它验证契约，不代替完整自动化测试套件。

```javascript
const assert = require('node:assert/strict');
(async () => {
  const base = 'http://127.0.0.1:3001';
  const empty = await fetch(`${base}/api/cases?industry=__missing__`);
  assert.equal(empty.status, 200);
  assert.deepEqual(await empty.json(), {items: [], total: 0});
  const invalid = await fetch(`${base}/api/cases`, {
    method: 'POST', headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({title: '', industry: 'telecom', difficulty: 'beginner'})
  });
  assert.equal(invalid.status, 400); // 加认证后，先登录并携带会话再测试字段校验。
  console.log('两项契约检查通过');
})().catch(error => { console.error(error); process.exitCode = 1; });
```

正式测试每次准备确定的 fixture，使用测试数据库或事务隔离，结束清理自己创建的记录。不要清空开发库，更不要让测试连接生产库。异步操作必须 await，避免“断言还没执行，测试已经通过”。

## 先让测试失败一次

故意让无匹配查询返回 404，确认上面的断言失败，再恢复200。这个过程说明测试真的检查了契约。修 bug 时先复现，再修复并保留回归用例，而非为每行实现补一行同义测试。

第 13–15 讲的模型可能用不同措辞表达相同结论，因此不应完全匹配整段回答。那时要检查结构、证据、任务结果、越权率、成本和延迟，并记录模型与提示版本。


## 自检与参考答案

**问题：** 测试把 API 响应整个替换成自己期望的数据后通过，证明了什么？

<details><summary>完成思考后查看参考答案</summary>

可能只证明前端对该模拟数据能渲染，没有证明真实 API、数据库或认证正确。应清楚标注 mock 边界，并保留必要集成测试。

</details>

## 阅读定位

[Full Stack Open Part 4：后端测试](https://fullstackopen.com/en/part4/)；[Part 5：React 应用测试](https://fullstackopen.com/en/part5/)。

必读范围是本讲正文；参考材料用于查漏补缺，不要求通读整门外部课程。课堂练习与课后练习见本讲后续小节。
