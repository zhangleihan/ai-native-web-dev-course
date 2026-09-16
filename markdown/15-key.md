# 路由、hooks 与可演示切片

FSO Part 7 讲 React Router、custom hooks、工程化。FDE 已是 App Router：动态段 `project/[projectId]` 要会，不必再抄一套 Router。`useStore` 应拆成 `useCasesQuery`、`useRunStream`，避免所有页订阅整个 Store。

切片 = 平台本身 + 通信网络故障处理沙箱，不是另起应用。来宾路径：登录 → `case-001` → Discover 接受洞察 → 跑 Agent → 审批 → Eval。

## 三条用户故事（Given/When/Then，指定 API）

1. 学生跑通 ALM-20260826-0731 并完成审批，刷新后 Run 仍在。
2. 教师看该生 Trace，不能顶栏「变成学生」。
3. 未经审批不得落工单；Copilot 拒代写 Canvas。

## 评估集对号 L1–L4

至少 10 条告警诊断样本：L1 schema 合法；L2 必须先 correlate 再 topology、建单必停；L3 鉴权/超时；L4 根因是否指向光路。`fdeScore` 不得再写死（至少 L1/L2 读自跑分或 API）。

隐藏约束（禁止 Agent 直接操作设备）按角色过滤字段。
