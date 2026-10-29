# 第9讲：实时任务与SSE实验

React与Express的独立教学案例，展示任务进度、断开订阅、编号续传、明确取消、模拟失败与历史缺口。所有数据为本进程内存，模拟步骤不调用模型或外部服务；重启丢失，不是生产作业队列。

## 运行

从课程根目录执行，使用Node20.18+：

```bash
cd labs/realtime-basics
npm ci --ignore-scripts
npm run dev
```

打开 http://127.0.0.1:3009 ，Ctrl+C关闭。页面和API同源。端口占用时在本实验目录执行 `PORT=3019 npm run dev`，访问3019；不要停止不属于本实验的服务。修改React后重新运行build或dev，本例未配置热更新。

每个正常任务6步、默认每步800毫秒；失败场景在第3步结束。最多20个任务，每个保留最近6条事件；达到上限请重启实验。创建新任务仅切换当前观察对象，旧任务继续运行。

## 六组对照

| 操作 | 预期 |
|---|---|
| 创建正常任务，持续订阅 | 201创建；#1开始、6次progress、#8完成，done后关闭 |
| 执行中停止订阅，再查询快照 | 连接停止，任务继续，编号相同 |
| 按原位置重新订阅 | 不重新创建；补发缺失历史或reset恢复当前快照 |
| 执行中取消，重复取消 | CANCELLED后不再推进；已终态则保留终态，不增加事件 |
| 创建第3步失败场景 | 2次progress后FAILED，再done；不能显示成功完成 |
| 任务完成后“从头订阅” | 位置0过旧，reset+done；较早日志不可回放 |

SSE连接状态与业务状态独立。五个按钮中，只有“取消任务”改变业务；“从头订阅”只清空本页面消费位置和日志，用同一任务观察历史恢复。

## 自动演示与检查

```bash
npm run demo
npm run check
```

demo使用随机本机端口、独立内存服务，不修改已经运行的3009服务。自动验证6组对照并在最后清理服务。check运行8项测试，再用esbuild构建React；测试包括SSE编号、终态、断开资源释放、Last-Event-ID优先、取消幂等、历史reset、非法位置与跨字节中文解码。

## 接口与源码

| 路径 | 说明 |
|---|---|
| POST /api/tasks | JSON scenario为normal或fail；201返回快照 |
| GET /api/tasks/:id | 200当前快照；未知任务404 |
| GET /api/tasks/:id/events | SSE，Last-Event-ID优先，否则after，缺省0 |
| POST /api/tasks/:id/cancel | 返回当前快照，重复调用不改变终态 |
| GET /api/health | tasks/running/subscribers等诊断，不是生产监控 |

server/tasks.mjs管理任务定时器、状态与历史；server/app.mjs管理HTTP订阅、心跳、位置与发送清理；client/stream.js管理React订阅；client/main.jsx为操作页面。snapshot包含id、status、step、total、seq、updatedAt与mode。

scripts/http-client.mjs只解析本服务器产生的LF/JSON帧，用于Node测试和演示，不是通用SSE库，不执行浏览器的Cookie/CORS策略。

## 排错

| 现象 | 检查与处理 |
|---|---|
| ERR_MODULE_NOT_FOUND | 确认已进入本实验目录并运行npm ci |
| 端口占用 | 用PORT指定其他本机端口，不终止未知服务 |
| 页面没有新修改 | 重新build并刷新；本例没有开发热更新 |
| curl只收到reset和done | 任务已经结束且早期历史过期；创建新任务或运行demo |
| 停止订阅后任务仍完成 | 预期行为；停止观察不取消业务 |
| done后是FAILED | 预期失败场景；done不是“业务成功” |
| 服务重启后任务404 | 内存模式丢失；创建新样本，不把重连当作创建 |
| health连接数未归零 | 检查其他标签或控制台是否仍开着EventSource |
| 经代理一次显示全部输出 | 分别核对直连与代理的缓冲、超时和压缩 |

## 范围与课程入口

本机传输实验没有用户认证或持久化，Origin检查不能替代完整CSRF和授权。迁入综合项目时沿用第8讲的安全边界。当前course-lab的审批trace、done期限和取消语义与本例不同，不能机械互换。

教材入口：第9讲主节及9/d、9/e、9/f。指定官方阅读、版权与验证边界见[READING_GUIDE.md](READING_GUIDE.md)，实验记录见[WORKSHEET.md](WORKSHEET.md)。
