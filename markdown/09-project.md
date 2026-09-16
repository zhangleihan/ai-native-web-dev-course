# 项目关联

改 `CopilotDrawer.send`、`store.playSteps`、Trace 页。部署日志同样从 `startDeploy` 定时器改为 SSE。审批 UI 仍走 `POST /api/runs/:id/approval`，与第 6 讲事务衔接。
