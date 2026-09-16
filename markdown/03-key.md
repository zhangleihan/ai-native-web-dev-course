# 内容、外观、行为：三块原生练习

**学时 2。** React 之前必须亲手做过一遍：**内容在 HTML，外观在 CSS，规则在 JS**。本讲三块已拷进本课程仓库，左侧各是独立小节。

| 小节 | 本仓库目录 | 练什么 | 接到 FDE |
|---|---|---|---|
| JavaScript 基础 | `labs/js-basics/` | 变量、类型、函数、判断、数组循环 | 案例过滤、`CaseItem` |
| 花艺瓶 | `labs/terrarium/` | HTML 骨架、CSS、DOM 闭包拖拽 | 读懂 `/cases` 的 DOM 与样式 |
| 打字游戏 | `labs/typing-game/` | `addEventListener`、click / input | 搜索框、登录按钮、Copilot 输入 |

口令：Agent 把三者糊进一个巨大字符串时，你要拆开。

成品可直接用浏览器打开（不要用 `file://` 打开本教材首页；**小练习 HTML 可以用 Live Server 或本课的 8766 静态服务**）：

- [花艺瓶成品](labs/terrarium/solution/index.html)
- [打字游戏成品](labs/typing-game/solution/index.html)

中文讲义在各目录的 `translations/README.zh-cn.md`（花艺瓶 CSS/DOM 部分有繁体译文，课堂以本教材小节为准）。

平台案例库已经是 React + Ant Design，**不要**在 `FDE-Workspace/web/src` 里再做一遍花艺瓶。本讲要你：控制台搞懂 `filter`，Elements 里拆卡片，用事件的眼光看搜索框。`fetch` 与 `cases.json` 放在课后，为第 7 讲铺路。
