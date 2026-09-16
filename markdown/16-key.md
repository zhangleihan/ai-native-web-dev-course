# 把请求链讲圆：哪些线已经变实

FSO 从 Part 0 的 HTML GET，到 Part 3 的 REST、Part 4 的测试、Part 11–12 的 CI/容器，是同一条链越来越完整。Demo 要对照 **第 1 讲那张虚线图**：今天哪些变实了，就是成绩。

来宾应看到实线：UI（:3100）→ API（REST/SSE）→ PostgreSQL →（可选）LLM / MCP 沙箱。诚实标出仍假的模块（真网管、公网 Deploy、写死的某一层分数）。

## 口播提纲

AppShell 信息架构 → Case/Project/Run 与网元告警工单表 → 认证与工具矩阵 → 双 Agent 与审批 → Copilot 为何在服务器 → 测试与 compose。

## 常见翻车

Network 无 API；现场 `setRole` 提权；Trace 等间隔动画且刷新即丢；密钥或完整 `ProjectDataset` 出现在客户端 bundle。

原理正确 > 现场稳定 > UI 抛光。解释不了「数据在哪」，分数上不去。
