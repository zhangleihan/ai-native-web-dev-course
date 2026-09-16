# 课堂练习

`POST /api/projects/p-2024-07/runs`：诊断 Agent 至少真调用 correlate 与 topology（seed 对齐 `NE-CORE-0872` / `ALM-20260826-0731`）；运维 Agent 请求建单后进入审批；批准后 WorkOrder 多一行，拒绝则不多。

**出口：** 审批前库中无新工单；span 的 input/output 与真工具一致。
