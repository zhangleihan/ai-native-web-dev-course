# TypeScript 护栏与可验证规格

FSO Part 9 在已有 TS 代码库里加功能：类型、linter、不要 `any`。Vibe Coding 不是 FSO 原文；本课原则是：**规格可验证、小步、diff 受控**。类型就是让 Agent 少胡写的护栏。

## 坏规格 vs 好规格

坏：「优化案例库。」

好：

```text
cases/page.tsx 筛选同步到 ?industry=&difficulty=&q=
刷新后筛选仍在。用 useSearchParams。
不要改 mock，不要改其他页布局。
验收：/cases?industry=通信运营 只显示该类。
跑 npm run typecheck。
```

FSO 练习也是可验证的（页面出现某元素、API 返回某 JSON）。把这种口吻写进 Agent 提示。

## 禁止

不要剧透 Golden Case 隐藏信息；不要删 Store 却不接 API；不要客户端密钥；不要 `dangerouslySetInnerHTML`。一次一个意图，越权重构 `AppShell` 必须回绝。
