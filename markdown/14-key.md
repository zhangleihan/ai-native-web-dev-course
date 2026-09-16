# 单向数据流、工具循环与审批状态机

FSO Part 6：UI → action → reducer → 新 state → UI。FDE 的 Run 是同一形状，不必先上 Redux。POC 用 `liveRunSteps` 写死 ALM-20260826-0731；本讲要 **真的调工具**（沙箱 DB 即可）。

## 状态机

`POST /runs` → RUNNING；tool span 追加；需审批 → `WAITING_APPROVAL`；POST yes/no → COMPLETED / CANCELLED。`Permission` 在服务器读库执行，忽略客户端「我已批准」。

双 Agent：`DiagnosisAgent` 无建单权；`OperationsAgent` 的 `create_work_order` 为 `APPROVAL_REQUIRED`。诊断 Agent 即使在 instructions 里想建单，服务器也拒绝。

## Harness 时序

Context Build（pinned 四条项目规则）→ 模型 tool_call → 服务器执行并写 span → … → 建单停审批 → 通过才 insert WorkOrder。`DENY` 的工具 span 为 error。Run 结束抽出的 Memory 须人工确认（`decideMemoryCandidate`）。
