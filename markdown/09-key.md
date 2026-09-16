# 轮询、SSE 与服务器推送

FSO Part 2 的心智是：请求异步，UI 在数据到达前后都要可用。Part 8 的 GraphQL **subscription** 是「服务器把变化推过来」的近亲。FDE 里 Copilot 和 Trace 看起来实时，其实是本地 `setTimeout` 动画。

## 三种通道

| 通道 | 特征 | 用在 FDE |
|---|---|---|
| 短轮询 GET | 简单、浪费 | 工作台待办（过渡） |
| SSE `text/event-stream` | HTTP 单向流 | Copilot token、Run span、Deploy 日志 |
| WebSocket | 双向 | 教师盯 Trace（可选） |

LLM 输出是单向字节流，用 SSE，不要用 WebSocket 硬扛。审批是 **一次 POST**（带意见）再继续流；不要用一条 WS 消息当唯一入口且不落库。

## 假实时代码

`startRun` → `playSteps(dataset.run.liveSteps)`，每步 `delay` 后 `patch`。`CopilotDrawer` 关键词命中后再 `setTimeout(..., 900)` 整包回复。

目标：`GET /api/runs/:id/events`、`POST /api/copilot/stream`。前端 `EventSource` 或 `fetch` + `ReadableStream`。断线后先 `GET /api/runs/:id` 拉快照再续订，避免丢中间 span。
