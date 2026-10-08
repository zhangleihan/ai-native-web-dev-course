# 实时反馈：轮询、SSE 与连接生命周期

## 学习目标与课前准备

学完本讲，应能：比较三种实时通信方式；观察事件流；处理断开、结束和取消

先修：第 7 讲异步请求；本讲先使用模拟事件，不需要模型账号。本讲 2 学时，按每学时 45 分钟安排：回顾与问题导入 10 分钟、概念和示例 30 分钟、课堂练习 40 分钟、讲评与出口检查 10 分钟。课后练习时间不计入 32 学时。


## 先选通信需求，再选协议

短任务可以等待一次 HTTP 响应；长任务需要进度反馈。轮询实现简单但有额外请求，SSE 适合服务器向浏览器持续推送文本事件，WebSocket 适合需要双向低延迟通信的场景。它们没有一条适合所有应用的优劣排名。

原生 EventSource 使用 GET，不能像 fetch 一样设置任意请求头或发送 POST body。可先 POST 创建 run，再用 EventSource GET 订阅；需要 POST 流时可使用 fetch 读取响应流，但必须自己正确处理分块、解码与 SSE 帧边界。

## 可运行的模拟 SSE 路由

把以下路由放在第 5 讲 `app.listen` 之前。数据是模拟进度，界面须注明；已有登录系统时，在此路由前增加身份及 run 归属检查。

```javascript
app.get('/api/demo-events', (req, res) => {
  res.set({'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache'});
  res.flushHeaders();
  let seq = 0;
  const timer = setInterval(() => {
    seq += 1;
    res.write(`id: ${seq}\nevent: progress\ndata: ${JSON.stringify({step: seq, mode: 'mock'})}\n\n`);
    if (seq === 3) {
      clearInterval(timer);
      res.write('event: done\ndata: {"status":"completed"}\n\n');
      res.end();
    }
  }, 500);
  res.on('close', () => clearInterval(timer));
});
```

同源页面中观察：

```javascript
const source = new EventSource('/api/demo-events');
source.addEventListener('progress', event => console.log(JSON.parse(event.data)));
source.addEventListener('done', () => source.close());
source.onerror = () => { console.log('连接中断，请重试'); source.close(); };
```

事件以空行分隔；一次 TCP/HTTP 读取不保证恰好包含一个事件。`done` 是应用自定义事件，收到后主动关闭，避免自动重连又开始一次演示。

## 连接状态不等于任务状态

浏览器断开不必然代表后台任务取消。真实 run 应有服务器持久化状态和独立取消接口；重新连接后先读当前快照，再消费后续事件。可用递增事件 id 去重和续传，但服务器必须实际保存、处理相应历史，只有写 `id:` 并不能自动恢复业务。

代理可能缓冲流，部署后需验证到达时间；长时间无消息可用注释心跳维持连接。输出 Markdown 或 HTML 时仍须防止不可信内容执行，不能因为是模型输出就信任。


## 自检与参考答案

**问题：** 用户关掉标签页后，能否直接把 run 标成 COMPLETED？

<details><summary>完成思考后查看参考答案</summary>

不能。连接关闭仅表示订阅结束；任务成功、取消或失败由服务器执行结果决定。需要明确的取消语义和状态查询。

</details>

## 阅读定位

[MDN：使用服务器发送事件](https://developer.mozilla.org/zh-CN/docs/Web/API/Server-sent_events/Using_server-sent_events)。

必读范围是本讲正文；参考材料用于查漏补缺，不要求通读整门外部课程。课堂练习与课后练习见本讲后续小节。
