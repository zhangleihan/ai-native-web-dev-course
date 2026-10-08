# 来源与版权说明

本次修订以本仓库既有讲义为基础，参考同级 Full Stack Open 中文离线材料和旧课实验。正文按课程目标重新组织；未把外部网站全文复制进教材。官方链接供追溯与延伸阅读，公开可读不表示可任意再分发。

| 来源/机构 | 定位 | 课程用途 | 许可与说明 |
|---|---|---|---|
| [Full Stack Open](https://fullstackopen.com/) / University of Helsinki | Part 0、1–5、9、11–13；本地 `../fullstackopen-zh-offline/markdown/` | Web、React、API、测试、TS、容器和关系数据库 | 沿用原资料署名及其 CC BY-NC-SA 3.0 说明；翻译、图片和代码仍检查对应来源条款 |
| 旧课 `../native-web-app-dev/` | 本仓库 labs/js-basics、terrarium、typing-game | 变量、函数、DOM和事件选修练习 | 保留现有素材及原署名；不将其版权归给本次编写者 |
| [Web Dev for Beginners](https://github.com/microsoft/Web-Dev-For-Beginners) / Microsoft | 原生Web实验来源 | 第3讲补充 | 原仓库许可及第三方素材声明分别适用，发布前核对对应版本 |
| [MDN SSE](https://developer.mozilla.org/zh-CN/docs/Web/API/Server-sent_events/Using_server-sent_events) / MDN | 事件流协议和浏览器API | 第9讲 | 仅引用阅读链接，代码为课程简化示例 |
| [Building effective agents](https://www.anthropic.com/engineering/building-effective-agents) / Anthropic | 工作流、Agent与工具边界 | 第13–14讲的概念比较 | 官方公开文章；链接引用，不转授全文许可；不能当作固定版本SDK指南 |
| [MCP architecture](https://modelcontextprotocol.io/docs/learn/architecture) / MCP项目 | host/client/server与能力连接 | 第14讲选修 | 链接引用；实际接入核对协议版本及对应仓库许可 |
| AI-FDE课程案例 | 案例、诊断、练习工单 | 贯穿业务映射 | 平台版本可能变化；讲义映射不等于已验证当前全部源码 |

所有示例仅使用练习数据；涉及账号、密钥、课程二维码和用户资料时按教学用途处理。新增讲义没有为仓库整体重新指定统一开源许可；对外发行前应核对原课程授权与各来源条件。

## 新增实验实现参考（2026-10-08）

`labs/course-lab` 为本课程新增示例，依赖锁定于package-lock.json。实现核对了[express-session官方说明](https://expressjs.com/en/resources/middleware/session/)、[node-postgres事务说明](https://node-postgres.com/features/transactions)和[PGlite文档](https://pglite.dev/docs/)。依赖许可证分别适用；这些链接不表示外部机构为实验背书。

## 第4讲 React 基础教材补充（2026-10-08）

详细对照已有 `../fullstackopen-zh-offline/markdown/part1a.md`（组件/JSX/props）、`part1b.md`（JavaScript）、`part1c.md`（状态/事件）、`part1d.md`（复杂状态/Hook）、`part2a.md`（列表/key）、`part2b.md`（受控表单/筛选）。按 University of Helsinki / Full Stack Open 原署名及离线资料注明的 CC BY-NC-SA 3.0 使用；离线全文仍在原目录，本次未重复复制。讲义提供原章节定位、阅读目标和本机启动方法。

React 官方资料通过 [Learn React](https://react.dev/learn) 核对；本讲各概念旁给出具体页面，重点包括组件、JSX、props、事件、状态快照、更新队列、列表、不可变更新、状态共享与 Thinking in React。仅链接与概念参考，没有抓取镜像全文；官方文档及代码各自版权和许可继续适用。

`labs/react-basics` 为本课程新增案例示例，用静态卡片、搜索、筛选与收藏展示同一业务逐步演进。React/React DOM/esbuild 的依赖许可分别适用，package-lock.json 固定当前安装版本。本次不为整个课程仓库指定新许可证。
