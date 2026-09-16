# 课堂练习

让 Agent **只出 SQL、不改前端**：从 `ontology.ts`、`types.ts`、`LiveRun` 生成 PostgreSQL DDL（业务表 + 平台表），标 FK 与 `decideApproval` 事务边界，并 seed `case-001` 与 `p-2024-07`。

能执行的组当场 `psql` 查出 Golden Case 一行。

**出口：** ER 关系能口头说清 User–Project–Run–Span。
