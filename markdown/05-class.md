# 课堂练习

让 Agent 在 `web/server` 或仓库 `api/` 起 Express/FastAPI，端口 3101：

- `GET /api/cases`、`GET /api/cases/:id`（数据来自 `base.ts`）
- `POST /api/projects/:id/runs` 收 `{agentId,input}`，回 `{id,status:"CREATED"}`
- CORS 允许 3100

自己跑 curl（含 `-i` 看状态码）。未知 `case-999` 必须是 404 JSON。

**出口：** 资源表没有动词路径；健康检查与案例列表可 curl。
