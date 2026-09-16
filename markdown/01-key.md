# 浏览器、服务器与 SPA

**学时 2。** Full Stack Open Part 0 的核心不是「会不会写代码」，而是先建立一张 **请求链**：浏览器要什么、服务器回什么、页面怎么变成可交互的程序。本讲把这条链画在 FDE 平台上。

## Web 开发第一原则

始终打开开发者工具。macOS 用 `⌥⌘I` 或 F12，打开 **Network**，勾选 **Disable cache**。FSO 用 notes 示例应用演示这一点；我们用 `http://127.0.0.1:3100` 做同样的事。

![开发者工具 Network 面板](fso-images/content/0/1e.png)

*图：Full Stack Open Part 0b，CC BY-NC-SA 3.0。课堂请对着 FDE 平台复现：Disable cache、看文档与静态资源请求。*

## 一次打开页面，实际发生了什么

传统站点（FSO 的 exampleapp）打开首页时，大致是：

1. 浏览器 **HTTP GET** 文档，服务器返回 **HTML**（`Content-Type: text/html`）
2. HTML 里的 `<img>`、`<script>`、`<link>` 再触发后续 GET
3. 浏览器把 HTML + 图 + CSS 画到屏幕上

![打开页面的时序：先 HTML 再图片](fso-images/content/0/7e.png)

*图：FSO Part 0b 时序图。FDE 打开 `/` 时，第一步同样是向 Next 开发服务器 GET 文档；后续主要是 JS chunk 和 CSS，而不是业务 JSON。*

FSO 把这种「每次导航服务器再吐一整页 HTML」称为传统 Web / **MPA**。后来出现 **SPA**：服务器主要给「壳」和 JavaScript，之后由浏览器里的程序改 DOM、改视图。

## 三种形态

| 形态 | 导航时发生什么 | 数据权威在哪 |
|---|---|---|
| MPA | 整页 HTML 再下载 | 服务器 |
| SPA | 壳不变，客户端改视图 | **应该**在服务器的 API；POC 却在内存 |
| AI 原生 | 模型、工具、审批是产品功能 | 密钥与副作用必须在服务器 |

FDE 已经是 SPA：`AppShell` 左侧菜单 `useRouter().push`，点 Discover 不会整页刷新成另一份服务端 HTML。`'use client'` 写在工作台、案例库、Agent Studio 上，意思是 **React 在浏览器跑**。

FSO 后续章节用独立后端存 notes。FDE POC **假装**有后端：`src/mock/*.ts` 打进 JS 包，`useStore()` 读内存。刷新则 `seedState`。本课 32 学时就是把虚线补成实线。

## 打开工作台经过哪里

1. 浏览器向 Next（`:3100`）要文档
2. `layout.tsx` 套上 Ant Design、`StoreProvider`、`AppShell`
3. `page.tsx` 用 `useStore()` 拼待办（`candidates` / `run` / `memoryCandidates`）
4. Network 的 Fetch/XHR 里 **几乎没有** `GET /api/cases`

所以：你看见的「省级核心网告警、待办、Agent 成功率」不是查库结果，是打包进来的演示对象。

## 职责边界（FSO 反复强调的 Client/Server）

浏览器可以画界面、暂存输入；**不能**当身份、权限、工单账本、模型密钥的权威。POC 顶栏 `setRole`、Copilot 关键词表、`startRun` 的 `setTimeout`，都是演示。课堂口令：**演示可以假，边界必须讲真。**
