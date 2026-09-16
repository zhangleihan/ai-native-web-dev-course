# 课后练习

练习不要提交进 `FDE-Workspace/web/src`。可在 `labs/` 旁建自己的文件夹，或复制一份 `labs/terrarium` / `labs/typing-game` 再改。

## 1. 花艺瓶做完

按 `labs/terrarium` 三节：HTML 列植物（**每张图不同的 alt**）→ CSS 层叠/选择器/左右栏定位 → `script.js` 闭包拖拽。对照 `labs/terrarium/solution/`，但要能讲解 `pos1…pos4` 和为什么松手要 `onpointermove = null`。

## 2. 打字游戏做完

自建三文件（可从 `labs/typing-game/solution/` 起步再重写）。`click` 开始、`input` 校验、高亮当前词、打错变红、完成显示秒数。句子用 `textContent`/`createElement` 更佳；若用了 `innerHTML`，NOTES 写清句子源为何安全、接接口后为何不行。

加一项：结束时移除 `input` 监听或禁用输入框；或 `localStorage` 存最短用时。

## 3. js-basics 书面题

想象购物车字段（商品 id、名、单价、数量、是否折扣）。列出 JS 类型及为什么数量用 `number`（见 `labs/js-basics/1-data-types/translations/assignment.zh-cn.md`）。再写 10 行：`map`/`filter` 如何对应案例库列表。

## 4. 案例卡片静态页（接到 FDE）

`cases.html` + `cases.json`（从 `FDE-Workspace/web/src/mock/base.ts` 抄 `cases`）。`fetch` + `res.ok`；失败可见；`textContent` 填标题摘要；过滤函数与课堂 `filterCases` 同构；至少展示 `case-001`。

## 5. 无障碍 NOTES

整卡 `onClick`、登录密码框：键盘能否到达。准备第 4 讲改成 `Button`/`Link`。
