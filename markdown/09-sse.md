# SSE与Express：从报文到任务接口

## 1. 先运行完整实验

从课程根目录执行，使用Node20.18或更新的兼容版本：

```bash
cd labs/realtime-basics
npm ci --ignore-scripts
npm run dev
```

打开 http://127.0.0.1:3009 。页面和API由同一个Express服务提供，不需另配跨源代理；不要把实验页面当作磁盘HTML直接打开。命令先用esbuild构建React，再启动服务。Ctrl+C结束；重启后内存数据清空。

本例与course-lab独立：没有登录、数据库或真实模型，只观察传输与任务生命周期。每个正常任务6步，间隔约800毫秒，最终时序受事件循环与网络影响。最多保留20个任务，每个任务最近6条事件。

## 2. SSE是一种响应内容格式

SSE全称Server-Sent Events，中文为“服务器发送事件”。浏览器使用EventSource连接一个HTTP地址，服务器返回`text/event-stream`，随后持续写入UTF-8文本。它不是一次返回JSON数组，也不是浏览器反复发送业务请求。

下面是本实验可能发送的一帧：

```text
id: 2
event: progress
data: {"step":1,"total":6,"status":"RUNNING","mode":"mock-memory"}

```

末尾必须有空行，表示这一帧结束。这里的JSON只摘出便于理解的字段；实际还包含任务id、seq和时间。`id:`是事件编号，JSON中的`id`是任务编号，二者不要混淆。

| 字段 | 作用 | 使用要点 |
|---|---|---|
| `data:` | 事件内容 | 浏览器得到字符串，JSON需显式解析 |
| `event:` | 自定义类型 | progress由addEventListener监听，不是onmessage |
| `id:` | 最近事件位置 | 自动重连时浏览器可回传Last-Event-ID |
| `retry:` | 重连间隔提示，毫秒 | 本例给出1000；不是业务请求重试次数 |
| 以冒号开头的行 | 注释 | 可作为心跳，不产生业务消息 |

这些字段遵循[WHATWG SSE规范](https://html.spec.whatwg.org/multipage/server-sent-events.html)。本实验约定编号为正整数，但协议本身允许满足规范约束的字符串编号。多个data行会按规则合并；不要自行假定每条消息只有一行。

## 3. 网络分块不是事件边界

一次`res.write()`不保证对应浏览器的一次网络读取。某次读取可能只有半个汉字的字节，也可能包含多条事件。原生EventSource会处理SSE解析；如果改用fetch读取流，需要增量UTF-8解码、缓冲未完成内容，再按完整帧解析。

不能在每次`reader.read()`后直接`JSON.parse(decoder.decode(value))`。传输层给的是字节块，SSE帧里的data才是本例约定的JSON。

## 4. 四个接口各做一件事

| 方法与路径 | 输入 | 成功结果 | 业务作用 |
|---|---|---|---|
| POST /api/tasks | `{"scenario":"normal"}`或fail | 201，完整初始快照 | 创建一次模拟任务 |
| GET /api/tasks/:id | 路径编号 | 200，当前快照 | 查询，不推进或重启任务 |
| GET /api/tasks/:id/events | 位置after或Last-Event-ID | 200，持续事件 | 订阅已有任务 |
| POST /api/tasks/:id/cancel | 空JSON对象 | 200，当前快照 | 显式取消；终态保持不变 |

未知任务404，非法位置400，达到20个任务后创建返回429。位置检查在SSE响应头发送前完成；已开始的响应不能再改成另一份JSON错误响应。

创建示例，在另一个终端执行：

```bash
curl -i -X POST http://127.0.0.1:3009/api/tasks \
  -H 'Content-Type: application/json' \
  -d '{"scenario":"normal"}'
```

从响应复制实际任务id。以下命令由你填入该值，不要保留占位文字：

```bash
task_id='替换为刚返回的任务id'
curl -N "http://127.0.0.1:3009/api/tasks/$task_id/events"
```

`curl -N`关闭curl自己的输出缓冲；它不能关闭代理层缓冲。若复制编号花费较长，任务可能已经结束，较早事件也可能被淘汰，看到reset属于本例预期。需要稳定看到完整过程时，使用网页或`npm run demo`。

## 5. 任务执行与订阅的代码分工

| 文件，相对于本实验 | 职责 |
|---|---|
| server/tasks.mjs | 创建任务、步骤推进、终态和有界事件历史 |
| server/app.mjs | HTTP契约、位置检查、事件发送与连接清理 |
| server/start.mjs | 绑定本机地址及进程退出清理 |
| client/stream.js | React订阅、恢复位置与失败提示 |
| scripts/http-client.mjs | Node验证客户端，仅解析本实验LF/JSON格式 |

创建任务时设立任务定时器；关闭某个SSE响应时只清理该订阅的发送定时器。`Tasks.finish`才负责结束业务定时器。这种分工使“停止观察”不会意外成为“停止执行”。

## 6. 先理解发送路径，再看恢复逻辑

以下摘录说明响应头与帧格式，完整连接管理见server/app.mjs。不要把摘录当作可单独运行的完整路由。

```javascript
res.set({
  'Content-Type': 'text/event-stream; charset=utf-8',
  'Cache-Control': 'no-cache, no-transform',
  'X-Accel-Buffering': 'no'
});
res.flushHeaders();
res.write('retry: 1000\n\n');
res.write(`id: ${event.id}\nevent: ${event.type}\ndata: ${JSON.stringify(event.data)}\n\n`);
```

`flushHeaders()`先发送响应头，便于尽早建立订阅。`JSON.stringify`将消息中的换行转为JSON字符串转义，不直接把任意输入拼成SSE字段。`X-Accel-Buffering`是给相关代理的提示，是否生效仍要看实际配置。

本例每个订阅按短周期检查新事件，有新数据才发送，空闲时发送注释心跳。它属于服务器在内存里检查任务，不是浏览器轮询API。生产系统可由事件通知机制唤醒订阅者，不必复制这个实现方式。

## 7. 本实验的事件契约

| 类型 | 是否编号 | 内容与客户端行为 |
|---|---|---|
| state | 是 | RUNNING开始或终态变化；更新任务并记录日志 |
| progress | 是 | 步骤完成；更新进度、去重追加日志 |
| snapshot | 否 | 首次同步当前状态；不是新的历史业务事件 |
| reset | 是，设为当前seq | 历史已不可完整回放；用快照建立新基线 |
| done | 否 | 任务已处于终态；检查status后关闭EventSource |

正常路径编号为#1的开始状态、#2–#7的6次步骤、#8的完成状态。若一直订阅，可收到完整序列。第3步失败时只有前两条progress，失败状态中的step=3表示执行到第3步时失败，并非第3步成功。

`done`、`snapshot`和`reset`都是本课程定义的应用事件，不是浏览器预置的任务协议。浏览器不会因为类型叫done就自动停止重连，必须由页面调用close。

## 8. 不要把传输实验当作完整安全服务

默认只监听127.0.0.1，写请求会检查存在的Origin，但没有账号、资源归属或完整CSRF机制。它用于受控本机样本，不能替代第八讲的认证授权实现。接入course-lab时，应保留其登录、CSRF和归属检查，而不是直接用本例替换安全中间件。

## 检查点

<details><summary>刷新页面后应该自动POST再创建一条任务吗？</summary><p>本例不会。创建由明确按钮触发；GET快照与订阅都不创建任务。跨刷新恢复任务编号可作为后续扩展。</p></details>

<details><summary>连续看到多个data字段，但onmessage没有输出，可能是什么原因？</summary><p>先检查是否缺少帧末空行，再看是否发送了自定义event类型。progress应使用addEventListener监听。</p></details>

继续阅读[React订阅教程](#/part/9/e)，或先执行[六组对照演示](#/part/9/b)。
