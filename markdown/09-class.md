# 课堂练习

API 实现 `GET /api/runs/:id/events`（可先按 `liveSteps` 的 delay 在 **服务器** 推 `span`/`log`）。前端 Trace 或 Agent Studio 用 EventSource 追加，去掉 `playSteps`。审批处暂停。

**出口：** Network 出现 `text/event-stream`；审批仍是 POST。
