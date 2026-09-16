# 项目关联

贯穿仓库：`FDE-Workspace/web`。产品不是另起一个 notes 应用，而是把 **AI-FDE 工程管理实训平台** 从 POC 做成可交付系统。

## 现在 vs 课程结束

| 现在（POC） | 课程结束时应有 |
|---|---|
| `src/mock/*.ts` 写死案例与脚本 | `GET/POST /api/...` + PostgreSQL |
| `login` 只 `setRole` | 真认证 + 授权 |
| Copilot 关键词 + `setTimeout` | 服务端 LLM，SSE |
| `startRun()` 定时器演 Trace | 真 tool loop + 审批落库 |
| Deploy 页动画 | Docker Compose / CI |

## 必须能指到的文件

```
web/src
├── app/                 路由即页面
├── components/AppShell.tsx    侧栏 + 角色 + Copilot
├── components/CopilotDrawer.tsx
├── lib/store.tsx        刷新即丢的演示状态
└── mock/                Fake 数据；Golden Case 在 datasets/telecom.ts
```

`layout.tsx` 把所有页包进同一个 Store：Discover 里 Accept 的洞察，工作台待办也能读到——这是 SPA 状态提升，还不是服务器权威数据。

`AppShell` 四组菜单（工作台/案例、PROJECT WORKSPACE、AGENT STUDIO、DELIVER）就是领域模型。后面的表名应沿这张菜单长。

## 和 FSO notes 的映射（后面各讲一直用）

| FSO notes | FDE 平台 |
|---|---|
| 笔记列表 | `/cases`、Extract 列表 |
| 一条笔记 | Case / Extract / Memory |
| 创建笔记 | 领取案例、`POST .../runs` |
| 用户登录 | 四种角色，现为 `setRole` |
