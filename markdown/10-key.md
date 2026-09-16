# API 测试、组件测试与评测分层

FSO Part 4 测 Express；Part 5c 用 Testing Library 测 React；Part 5d 讲 Playwright。`/eval` 上的 L1–L4 是 **产品评测**（模型/Agent/系统/业务），不能代替 `npm test`。

## 测什么

| 层 | FSO notes | FDE |
|---|---|---|
| 纯函数 | 笔记过滤 | `filterCases` |
| API | supertest `/api/notes` | cases、runs、approval、401/403 |
| 组件 | NoteForm | 案例库筛选、登录、审批框 |
| 状态机 | — | `CREATED→…→COMPLETED` |

把 `decideApproval` 从 `setTimeout` 拆成纯函数 `reduceRun(state, event)` 才好测。测试打独立库，不要打开发端口 3101。

前端：mock `fetch`，点「通信运营」，制造类案例不在文档。不要测 Ant Design 内部 class。仓库已有 `npm run typecheck`——类型检查也是测试。
