# Express API：校验、资源与错误边界

## 学习目标与课前准备

学完本讲，应能：实现列表和创建接口；校验运行时输入；说明内存数据的生命周期

先修：第 2 讲契约；能用 npm 安装项目依赖。本讲 2 学时，按每学时 45 分钟安排：回顾与问题导入 10 分钟、概念和示例 30 分钟、课堂练习 40 分钟、讲评与出口检查 10 分钟。课后练习时间不计入 32 学时。


## 最小可运行服务

在新的练习目录运行 `npm init -y`、`npm install express`，保存下列代码为 `server.cjs`，用 `node server.cjs` 启动。提交 package-lock.json 记录依赖；只在本机练习，不把尚未加认证的服务暴露到公网。

```javascript
const express = require('express');
const { randomUUID } = require('node:crypto');
const app = express();
app.use(express.json({limit: '32kb'}));
const difficulties = new Set(['beginner', 'intermediate', 'advanced']);
const items = [];
function invalid(res, message) {
  return res.status(400).json({error: {code: 'VALIDATION_ERROR', message}});
}
app.get('/api/health', (req, res) => res.json({status: 'ok'}));
app.get('/api/cases', (req, res) => {
  const {industry = '', difficulty = '', kw = ''} = req.query;
  if (![industry, difficulty, kw].every(v => typeof v === 'string' && v.length <= 100)
      || (difficulty && !difficulties.has(difficulty))) {
    return invalid(res, '查询条件不合法');
  }
  const found = items.filter(c => (!industry || c.industry === industry)
    && (!difficulty || c.difficulty === difficulty) && c.title.includes(kw));
  res.json({items: found, total: found.length});
});
app.post('/api/cases', (req, res) => {
  const {title, industry, difficulty} = req.body ?? {};
  if (typeof title !== 'string' || !title.trim() || title.length > 100
      || typeof industry !== 'string' || !industry.trim() || industry.length > 50
      || !difficulties.has(difficulty)) return invalid(res, '案例字段不合法');
  const created = {id: randomUUID(), title: title.trim(), industry: industry.trim(), difficulty};
  items.push(created);
  res.location(`/api/cases/${created.id}`).status(201).json(created);
});
app.get('/api/cases/:id', (req, res) => {
  const item = items.find(c => c.id === req.params.id);
  if (!item) return res.status(404).json({error: {code: 'NOT_FOUND', message: '案例不存在'}});
  res.json(item);
});
app.use((err, req, res, next) => {
  const status = err.type === 'entity.too.large' ? 413 : err.status === 400 ? 400 : 500;
  res.status(status).json({error: {code: 'REQUEST_ERROR', message: status === 500 ? '服务暂不可用' : '请求体不合法或过大'}});
});
app.listen(3001, '127.0.0.1', () => console.log('API: http://127.0.0.1:3001'));
```

## 为什么服务器必须再次校验

浏览器可以被跳过。curl 能直接发送缺字段、超长字符串或错误类型，前端表单限制不是安全边界。只接收允许的字段，不把整个 body 展开进数据库，避免客户端偷偷指定 owner 或 role。

按顺序追踪：JSON 解析中间件 → 路由匹配 → 校验 → 数据操作 → 响应。错误处理中间件有四个参数；不要在返回响应后继续发送第二次响应。

## 先验证契约，再增加持久化

创建后 GET 可以读到记录，浏览器刷新仍在；**Node 进程重启会丢失数组**。这正是第 6 讲引入数据库的理由。本例用于解释请求处理，不是生产模板。重构时将 app 构造与 listen 分开，让测试使用随机端口而不占用固定端口。

异步数据库失败应进入统一错误处理，不能只在 Console 输出后让请求永远等待。具体异步传播机制与 Express 主版本有关，使用项目锁定版本的文档，不混用旧教程中的假设。


## 自检与参考答案

**问题：** 为什么创建成功后刷新页面还在，仍不能声称已持久化？

<details><summary>完成思考后查看参考答案</summary>

数据可能只在 Node 数组中。浏览器刷新不会重启服务器；停止 Node 后重启再查询，才能区分内存与持久化。

</details>

## 阅读定位

[Full Stack Open Part 3](https://fullstackopen.com/en/part3/node_js_and_express/)；MongoDB 相关段落不作为本课必读，本课采用关系数据库。

必读范围是本讲正文；参考材料用于查漏补缺，不要求通读整门外部课程。课堂练习与课后练习见本讲后续小节。
