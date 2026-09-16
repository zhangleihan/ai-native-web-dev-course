# 项目关联

入口：`agents/page.tsx` 的 `launch()`。工具定义在 `mock/tools.ts`（`correlate_alarms`、`query_topology`、`create_work_order`）。Workflow 页应用来 **解释** Trace 顺序，不要黑盒。刷新后 Run 必须还在（已接 DB）。
