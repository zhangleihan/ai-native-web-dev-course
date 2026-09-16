# 项目关联

FSO notes：`GET/POST /api/notes`、`GET /api/notes/:id`。映射：

| notes | FDE |
|---|---|
| 列表页 | `/cases`、Discover 洞察 |
| 创建 | 领取案例、创建 Run、Accept 洞察 |
| 单条 | `/cases/case-001`、`/api/runs/:id` |

Golden Case 输入示例（将来 POST body）：

```json
{
  "agentId": "agt-diag",
  "input": "告警 ALM-20260826-0731：网元 NE-CORE-0872 …"
}
```

本讲 **先不要** 接数据库。FSO 也是先数组后 Mongo。
