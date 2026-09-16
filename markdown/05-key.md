# REST 资源、Express 与 JSON 契约

FSO Part 3 把功能转到服务器：Node + Express 实现 notes 的 REST，先内存数组，再 Mongo（Mongo 细节留到与 Part 13 对照）。FDE 对应物不是笔记，而是 Case、Extract、Run。

## 为什么必须有后端

POC 把权威放在 `src/mock/`：教师改案例要改 TS 再打包；Accept 洞察刷新即丢；Copilot 是关键词表；角色无审计。FSO 第一句话：功能转到服务器。

## 资源设计

路径是资源，方法是动作。`POST /api/doStartRun` 是反模式。

```
GET    /api/health
GET    /api/cases
GET    /api/cases/:id
POST   /api/cases/:id/claim
GET    /api/projects/:id/extracts
PATCH  /api/extracts/:id
POST   /api/projects/:id/runs
GET    /api/runs/:id
POST   /api/runs/:id/approval
```

`CaseItem`、`ExtractItem`、`LiveRun` 已是契约。创建 Run 应对齐 `mock/trace.ts` 的 `runInput`；`status` 枚举与 `store.tsx` 一致：`CREATED|RUNNING|WAITING_APPROVAL|COMPLETED|CANCELLED|FAILED`。

## Express 最小形态（Part 3a）

先把 `cases` 抄成 JSON，内存返回。未知 id → `404 {"error":"Case not found"}`。`express.json()` 失败 → 400。未捕获 → error middleware → 500 且不把 stack 给浏览器。

课堂指定 **独立 api 进程**（如 `:3101`），前端 `NEXT_PUBLIC_API_URL`，更接近 FSO 的前后端分离，边界比 Next Route Handler 更清楚。CORS 允许 `http://127.0.0.1:3100`。

## 幂等

`POST /api/cases/:id/claim`：同一学生重复领取 → `409` 或返回已有 `projectId`。mock 里 `case-001` 的 `status: '进行中'` 应是 **该用户的项目状态**，不是全局写死。
