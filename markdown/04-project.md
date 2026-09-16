# 项目关联

要会解释：`cases/page.tsx` 的过滤状态图（谁持有、谁修改）。Ontology 页 Accept 候选后，工作台待办数字变化——这就是 Context 跨页，对应 FSO「状态提升」，只是提到了根。

`startRun` / `decideApproval` / `startDeploy` 都是 `setTimeout` + `patch`，不是服务端。第 9、14 讲会拆成真实事件流，但组件规则不变：UI 仍是 state 的函数。
