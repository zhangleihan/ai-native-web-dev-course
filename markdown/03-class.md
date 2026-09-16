# 课堂练习

**限时课内。** 三块各碰一下，不必做完花艺瓶拖拽。材料都在 `labs/`。

## 1. Console 里的 js-basics（15 分钟）

打开 FDE `/cases` 的控制台（或任意空白页）：

1. 用 `let` / `const` 声明一个模仿 `CaseItem` 的对象（至少 `id`、`title`、`industry`、`goldenCase`）。
2. 写 `filterCases`，放入 3 个对象，筛 `industry === '通信运营'`。
3. 试 `'1' + 1` 与 `1 + 1`，以及 `===` vs `==`。

## 2. 拆案例库 DOM（15 分钟）

Elements 点 Golden Case 卡片：找出标题、摘要、标签。Computed 看 padding。切行业到「通信运营」，确认 **没有** 新的业务 XHR。对照花艺瓶：这张卡更像 `div.plant-holder` 还是 `article` / `a`？键盘能否到达。

## 3. 花艺瓶（20 分钟）

打开 http://127.0.0.1:8766/labs/terrarium/solution/index.html 试拖植物，Console 看 pointer 事件；或在 `labs/terrarium/` 旁自建 `index.html`，至少 2 张图指向 `solution/images/`。

## 4. 打字游戏（有时间）

打开 http://127.0.0.1:8766/labs/typing-game/solution/index.html ，点 Start，故意打错看 `.error`。

**出口：** 能口述 HTML/CSS/JS 三分离；能说 `getElementById` 与 `addEventListener` 各干什么；能指出案例数据此刻不在服务器。
