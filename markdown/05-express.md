# Express 分步教程：从第一个请求到案例 API

## 1. 准备一个独立后端项目

本教程将案例资源逐步实现为接口，最终代码位于 [Express 入门实验](labs/express-basics/README.md)。先运行参考实现，再按下面的顺序在自己的练习目录复现。每一步只增加一类能力，保留能够验证的请求。

从课程根目录运行参考实现：

```bash
cd labs/express-basics
npm ci
npm run dev
```

默认地址为 http://127.0.0.1:3002 。本实验不依赖 React、数据库或模型账号。初始案例列表为空；创建后再查询。开发脚本使用 Node 的 watch 模式，修改服务端文件会重启进程，内存数据也会清空。

从空目录复现时，另建 `labs/my-case-api`，执行：

```bash
mkdir -p labs/my-case-api
cd labs/my-case-api
npm init -y
npm install express@5
```

下面第2至第5步均以这个练习目录为工作目录。不要把片段追加到完整参考工程，否则可能重复注册路由或监听端口。`package.json` 由 npm 初始化；`server.mjs` 等源码文件由自己创建。`.mjs` 明确表示 JavaScript ES 模块，可以使用 import/export；`.cjs` 表示 CommonJS，使用 require/module.exports。先选定一种模块写法。

锁文件 `package-lock.json` 记录安装解析结果；新环境用 `npm ci` 按锁文件安装。只复制源码和配置，依赖目录由安装命令生成。

## 2. 先用原生 HTTP 理解框架解决的问题

将下面代码保存为 `raw-server.mjs`，用 `node raw-server.mjs` 运行：

```javascript
import {createServer} from 'node:http';

createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/api/health') {
    res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
    return res.end(JSON.stringify({status: 'ok'}));
  }
  res.writeHead(404, {'Content-Type': 'application/json; charset=utf-8'});
  res.end(JSON.stringify({error: '接口不存在'}));
}).listen(3002, '127.0.0.1');
```

另开终端执行 `curl -i http://127.0.0.1:3002/api/health`。程序已能识别一个路径并返回 JSON，但每增加一条接口，就需要处理方法判断、路径解析、响应头和序列化。请求体还以流的形式到达，读取和限制大小也要额外编写。

先按 Ctrl+C 停止原生服务。新建 `server.mjs`，改用 Express：

```javascript
import express from 'express';
const app = express();
app.get('/api/health', (req, res) => res.json({status: 'ok'}));
app.listen(3002, '127.0.0.1');
```

执行 `node server.mjs`，同一条 curl 应仍返回200与 JSON。框架把重复的 HTTP 操作收拢到 API 中；应用仍需决定接口路径和业务行为。这种先运行小服务、再逐步扩展的学习顺序可与 [Full Stack Open Part 3](https://fullstackopen.com/en/part3/node_js_and_express/)对照阅读。

## 3. 添加集合读取和详情读取

将下面内容放在 `listen` 之前：

```javascript
const cases = [
  {id: 'demo-1', title: '链路中断', industry: '通信', difficulty: 'beginner'},
  {id: 'demo-2', title: '巡检记录缺失', industry: '电力', difficulty: 'intermediate'},
];

app.get('/api/cases', (req, res) => {
  res.json({items: cases, total: cases.length});
});

app.get('/api/cases/:id', (req, res) => {
  const item = cases.find(item => item.id === req.params.id);
  if (!item) return res.status(404).json({error: {code: 'NOT_FOUND', message: '案例不存在'}});
  res.json(item);
});
```

先查询 `/api/cases`，再查询 `/api/cases/demo-1` 和 `/api/cases/missing`。集合路径返回包装对象；详情路径返回一个对象；匹配不到编号时返回404。`find` 可能得到 undefined，需要在返回前处理缺失情况。

路径参数是字符串。若数据里的 id 是数字、参数却没有转换，严格相等比较会失败。本教程统一使用字符串编号，避免隐式转换带来的不确定行为。

`app.get('/api/cases/:id', handler)` 注册的是匹配规则，不会立即执行 handler。每次匹配请求到来时，Express 才传入对应的 req 和 res。[Express 路由](https://expressjs.com/en/guide/routing/)

## 4. 接收创建请求：先解析，再校验

为读取 JSON，在所有业务路由之前加入：

```javascript
app.use(express.json({limit: '32kb'}));
```

`express.json(...)` 返回中间件，`app.use(...)` 将它加入请求链。limit 限制解析请求体的大小；它不是标题长度限制，标题还需要独立校验。

在文件顶部加入 `import {randomUUID} from 'node:crypto';`，再注册创建路由：

```javascript
app.post('/api/cases', (req, res) => {
  const body = req.body;
  const allowed = ['title', 'industry', 'difficulty'];
  const valid = body && typeof body === 'object' && !Array.isArray(body)
    && Object.keys(body).every(key => allowed.includes(key))
    && typeof body.title === 'string' && body.title.trim().length > 0 && body.title.trim().length <= 100
    && typeof body.industry === 'string' && body.industry.trim().length > 0 && body.industry.trim().length <= 50
    && ['beginner', 'intermediate', 'advanced'].includes(body.difficulty);
  if (!valid) return res.status(400).json({error: {code: 'VALIDATION_ERROR', message: '案例字段不合法'}});
  const item = {id: randomUUID(), title: body.title.trim(),
    industry: body.industry.trim(), difficulty: body.difficulty};
  cases.push(item);
  res.location(`/api/cases/${item.id}`).status(201).json(item);
});
```

这里依次检查对象形状、允许字段、类型、规范化后的长度和枚举。先判断类型，再调用 trim，避免把“用户输入错误”变成“服务端调用不存在的方法”。所有校验成功之后才修改集合，失败请求不会留下半条记录。

服务器自己构造 item，客户端无法指定 id。未知字段被拒绝，能够尽早发现前后端命名不一致；如果选择忽略额外字段，也需要明确写入契约，保持一致。

```bash
curl -i -X POST http://127.0.0.1:3002/api/cases \
  -H 'Content-Type: application/json' \
  -d '{"title":"新的链路故障","industry":"通信","difficulty":"beginner"}'
```

预期为201，响应头包含 Location。复制该路径再次 GET，应得到刚创建的对象。把标题改为全空格或增加 owner 字段，再观察400和列表数量是否保持不变。

## 5. 观察中间件顺序与失败流向

为观察成功响应，在路由前加入：

```javascript
app.use((req, res, next) => {
  const started = Date.now();
  res.once('finish', () => console.log(req.method, req.path, res.statusCode, Date.now() - started));
  next();
});
```

响应完成后输出方法、路径、状态码和耗时。注册 finish 回调不会立即响应，请求仍由 next 交给后续步骤。日志放在解析之前还能记录坏 JSON 的失败；完整参考实现就是这个顺序。不记录请求体，避免把业务内容或凭据写入日志。

把以下两类处理放在正常路由后面：

```javascript
app.use((req, res) => res.status(404).json({error: {code: 'NOT_FOUND', message: '接口不存在'}}));

app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  const status = err.type === 'entity.too.large' ? 413
    : err.type === 'entity.parse.failed' ? 400 : 500;
  res.status(status).json({error: {code: 'REQUEST_ERROR', message: status === 500 ? '服务暂不可用' : '请求体不合法或过大'}});
});
```

上面是用于本阶段的简化错误分类。完整实验还区分业务校验、内容类型和请求编号。四参数形式让 Express 识别错误处理中间件；已经发送响应头后交回框架继续处理，避免再写第二份响应。

依次请求不存在的路径、发送坏 JSON、超过32KB的 JSON，分别观察404、400、413。未知路径属于未匹配流程，坏 JSON 属于解析错误；它们虽然都可以返回 JSON，却走不同的请求链。[中间件顺序](https://expressjs.com/en/guide/using-middleware/)、[错误传播](https://expressjs.com/en/guide/error-handling/)

## 6. 增加筛选与分页

完成前三类接口后，再阅读完整实验中的 `listQuery` 与 `createMemoryStore().list`。处理顺序是：校验查询参数 → 组合筛选 → 计算 total → 截取当前页。

```javascript
const found = allItems.filter(item => item.title.includes(kw)
  && (!industry || item.industry === industry)
  && (!difficulty || item.difficulty === difficulty));
const result = {items: found.slice(offset, offset + limit), total: found.length, offset, limit};
```

本片段只说明算法，变量由外围函数提供。offset 表示跳过多少条，limit 表示本页最多返回多少条。若两条记录匹配、每页一条，当前页 items.length 是1，total 仍为2。

URL 参数通常是字符串，也可能因重复或结构化写法形成其他值。完整实验要求 offset、limit 是限定范围的十进制整数文本，拒绝 `limit=1x`，而不是用 parseInt 把它悄悄解释为1。limit 最大50，避免一次读取无限量数据。

```bash
curl -i 'http://127.0.0.1:3002/api/cases?kw=链路&offset=0&limit=1'
curl -i 'http://127.0.0.1:3002/api/cases?limit=1x'
```

本实验按创建插入顺序分页。若频繁增删数据，偏移分页可能出现重复或遗漏；数据库稳定排序、游标分页放在扩展阅读，不将本例描述为完整大规模检索方案。

## 7. 局部更新与删除

完整实验支持 PATCH，只接收允许更新的字段，未提交字段保持原值：

```javascript
router.patch('/:id', async (req, res) => {
  const fields = caseBody(req.body, {partial: true});
  const item = await store.update(req.params.id, fields);
  if (!item) fail(404, 'NOT_FOUND', '案例不存在');
  res.json(item);
});
```

这是 `server/cases-router.mjs` 中的片段，caseBody、store、fail 来自该模块的依赖。提交 `{"title":"链路恢复"}` 只改变标题，行业与难度保留。本契约拒绝空对象与 null 标题。PATCH 的 JSON 格式是本实验定义的字段合并格式，不声称实现 JSON Patch 标准。

删除成功用 `res.status(204).end()`，204 无响应体，客户端不应继续调用 response.json。再次读取或删除同一编号返回404。数据库场景还需讨论外键、关联资源和软删除，本实验只删除内存记录。

## 8. 从单文件拆分到可测试工程

参考目录如下：

```text
server/
  start.mjs          读取端口、监听本机地址
  app.mjs            构造应用、安排中间件顺序
  cases-router.mjs   挂载案例资源处理函数
  validation.mjs     输入校验与可预期错误
  memory-store.mjs   内存读写与分页
```

`app.use('/api/cases', createCasesRouter(store))` 挂载资源路由，Router 内的 `/` 对应集合，`/:id` 对应详情。应用与监听分离后，测试可调用 createApp 创建实例，并使用随机空闲端口；导入 app 模块不会立即占用3002。

数据访问对象通过参数传入，称为依赖注入。路由只调用 list/get/create/update/remove，内存实现同步返回值也可被 await；后续替换为异步数据库时，调用边界不必改变，但事务与一致性仍需重新设计。这个拆分练习参考 [Full Stack Open Part 4 的工程结构](https://fullstackopen.com/en/part4/structure_of_backend_application_introduction_to_testing/)，本课不用它的 MongoDB 示例。

## 9. 用一个请求编号串起调试证据

完整实验给每次请求生成 requestId，通过 X-Request-Id 响应头返回，并写入日志和错误对象。客户端报告“创建失败”时，可以把该编号与服务日志对应起来。编号用于追踪一次请求，不是用户身份或访问凭证。

测试时把 store.list 临时替换为抛出错误的实现，可以检查500是否进入统一处理，以及响应是否泄露内部信息。配套测试已经覆盖这一分支。真实环境仍需将完整内部错误记录到合适的服务端日志系统，本实验没有实现日志存储平台。

## 10. 完成后的验证清单

在 `labs/express-basics` 执行 `npm test`，再亲自完成创建、查询、筛选、修改、删除。测试通过只说明列出的契约在当前实验内得到验证，不涵盖数据库、登录或公网部署。

| 验证 | 结果依据 |
|---|---|
| 创建并读取 Location | 新对象与返回编号一致 |
| 空白标题、未知字段 | 400且集合没有新增 |
| 筛选再分页 | items 与 total 的含义正确 |
| PATCH 一个字段 | 其他字段保持不变 |
| 删除后再次读取 | 204后为404 |
| 坏 JSON、错误内容类型 | 400与415能够区分 |
| 重启服务 | 内存集合恢复为空 |

完成后阅读[接口设计与调试](#/part/5/f)，整理自己的接口契约和排错记录，再进入第6讲持久化。
