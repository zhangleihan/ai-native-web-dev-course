# 关系表、外键、事务：从 Ontology 到 SQL

FSO Part 3c 用 Mongo 存 notes（文档几乎无关联）。Part 13 改讲关系库：表、JOIN、迁移。FDE 的 Alarm 挂网元、WorkOrder 挂 Run，**关联就是产品**，默认 PostgreSQL。向量库只做检索索引，不是账本。

## 两套数据不要混

| 层 | 例子 | 存哪 |
|---|---|---|
| 平台账本 | 用户、领取、项目、Run、审批 | PostgreSQL |
| 案例本体 | 网元、告警、工单、客户 | 另一 schema 或表前缀 |
| 检索 | 知识库 268 篇、工单向量 | 向量 **附加** |
| POC | `src/mock` | 降级为 seed |

## 从 `ontology.ts` 到列

`NetworkElement` 的 properties 几乎是列：`ne_id PK`、`type`、`status`、`location_id`。`Alarm.ne_id` 必须是 FK。`OntologyRule` 先存文本，运行时读入 Context，不要一上来做库内规则引擎。

平台表最小集：`users`、`cases`、`projects`、`extracts`、`runs`、`spans`、`approvals`、`memories`、`permissions(agent_id,tool_id,value)`。`LiveRun.status` 用 CHECK/enum，与前端字符串一致。

## 事务（Part 13 会强调一致性）

POC 里 `decideApproval(true)` 同时改 run、log、span、history、memoryCandidates。落库后必须 **一个事务**。审批过了却没工单，或有工单 Run 仍是 `WAITING_APPROVAL`，都是事故。

## N+1

`GET /api/cases` 不要循环查每个 `teams` 计数。工作台 todos 将来是聚合查询，不要把整个 `telecom.ts` 一次塞给浏览器。
