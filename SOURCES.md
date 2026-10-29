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

## React / Next.js / Ant Design 补充（2026-10-14）

| 官方来源 | 引入位置与用途 | 使用方式 |
|---|---|---|
| [React Learn](https://react.dev/learn)、[状态结构](https://react.dev/learn/choosing-the-state-structure)、[状态保留与重置](https://react.dev/learn/preserving-and-resetting-state) | 第4讲 d：组件基础阅读路线、选择记录与编辑草稿 | 链接、阅读任务与课程原创案例，不镜像全文 |
| [Next.js React Foundations](https://nextjs.org/learn/react-foundations)、[App Router 文档](https://nextjs.org/docs/app) | 第4讲 e：页面、布局、服务端/客户端边界、Route Handler；衔接第7讲 | 官方公开教程定向引用，例子围绕本课程案例库编写 |
| [Ant Design React](https://ant.design/docs/react/introduce-cn)、[Form](https://ant.design/components/form-cn)、[Table](https://ant.design/components/table-cn)、[Next.js 集成](https://ant.design/docs/react/use-with-next-cn) | 第4讲 f：受控筛选、表格、表单、首屏样式 | 引用 API 与集成方法，不复制完整文档或图片 |

原文版权及各项目许可独立适用，公开访问不意味着整套教程可任意再分发。配套实验依赖版本与锁文件见 labs/next-antd-basics，未将这些机构标注为本课程作者或背书方。FSO 离线原文继续复用原目录，没有重复下载。


## React、Next.js 与 Ant Design 进阶补充（2026-10-21）

课程新增原创案例目录、接口请求与本地编辑工作台。参考 React 官方中文文档的状态结构与 Effect、Next.js 官方 App Router 的 page/dynamic-routes/loading/notFound、Ant Design 官方中文 Form/Table/Drawer/Popconfirm/ConfigProvider 文档。具体官方链接列于各节末尾；不转载官方全文，商标与原文版权归各自权利人。本次保留实验已有依赖锁文件，未随在线文档更新依赖版本。

## AI 氛围编程与 UI 原型（2026-10-21）

新增原创教程 markdown/04-ai-ui.md，参考 Stanford CS146S 官方课程介绍（https://themodernsoftware.dev/）、DeepLearning.AI 的 Build Apps with Windsurf’s AI Coding Agents 公开课程介绍（https://www.deeplearning.ai/courses/build-apps-with-windsurfs-ai-coding-agents）、OpenAI 前端实践（https://developers.openai.com/cookbook/examples/gpt-5/gpt-5_frontend）及 React 官方中文 Context 教程。课程内列出阅读任务与链接。DeepLearning.AI 正文访问返回403，只引用公开介绍，不声称已读完整课程；未转载受限内容。情境包、提示词、案例流程与作业题为本课程原创，各来源版权归原机构。

## FDE 工作台整体 UI 案例（2026-10-22）

案例源为用户指定的 FDE-Workspace：POC详细系统功能设计、web/README.md、web/package.json、web/src 下的 AppShell、ui、FlowCanvas、store、theme 和业务页面。图片从该项目“白老师/立项申请/screenshots”选取4张既有截图，复制至 assets/fde-ui，并保留原文件名。图片是源项目既有展示材料，不是本次运行证明。

教学轮次和提示词根据现有成果重新编写，未发现完整原始生成对话，源目录无可用 Git 历史。源码证据索引见 labs/fde-ui-case/SOURCE_MAP.md。未复制项目全文、后台数据或无关资料；不推定用户项目及截图具有开源再分发许可。

FDE 案例现包含原 web 前端源码与模拟数据的独立副本，位于 labs/fde-ui-case；保留依赖版本与锁文件，未复制原项目其他业务资料、依赖目录或构建缓存。

## 2026-10-28：后端框架基础

第五讲扩充 Express 5 路由、中间件、错误处理与工程组织，补充 FastAPI/Pydantic 请求模型及 Uvicorn 运行方式。依据 Express 与 FastAPI 官方文档重新编写，链接列于各节正文；新建 labs/fastapi-basics 对照实验。

## 2026-10-28：第五讲教材化扩充

依据Helsinki Full Stack Open Part3a/4a的渐进实验与工程结构、Harvard CS50 Web Lecture3 Notes/Slides的HTTP和路由概念、Express5/FastAPI/Pydantic2官方教程及RFC9110/5789，重新编写核心概念、Express分步教程、接口设计调试及FastAPI对照。具体URL、阅读范围、核查日期和使用边界记录在 [资料导读](labs/backend-resources/READING_GUIDE.md)。使用本机FSO离线正文交叉阅读，不修改参考目录。新增Express实验为本课独立实现，未复制第三方完整工程或整套幻灯片。

## 2026-10-28：第六讲数据库扩充

参考PostgreSQL16官方Tutorial、Constraints、Transactions、Isolation与EXPLAIN，Harvard CS50 Web Lecture4 Notes，以及本机Helsinki Full Stack Open Part13a/b/c；应用层依据node-postgres、psycopg与FastAPI官方说明。FSO官方源码已注明关系数据库内容迁移到mooc.fi新入口，旧分节404与新页面正文不可直接抓取情况已记录。具体阅读范围和版权边界见 [数据库资料导读](labs/database-basics/READING_GUIDE.md)。实验以本课案例独立实现，不复制第三方完整工程。

## 2026-10-28：第八讲认证与安全升级

参考Helsinki Full Stack Open Part4c/d、Harvard CS50 Web Lecture8、OWASP认证/授权/会话/密码/CSRF/XSS指南、express-session、MDN浏览器机制及JWT/OAuth/OIDC规范，按本课实际源码重写。来源用途、版本及验证边界见 [安全资料导读](labs/security-basics/READING_GUIDE.md)。新增测试与本机探测脚本独立编写，未转载完整第三方课程或认证项目。

## 2026-10-28：第八讲课堂九幕演示

新增独立编写的演示脚本与教程，复用本课程course-lab和security-basics客户端，不增加第三方课程副本或依赖。概念来源沿用第8讲安全资料导读。demo-example为隔离练习数据的真实执行报告，不包含口令或完整会话凭据；浏览器策略与生产环境验证不在该报告范围内。

## 2026-10-28：第九讲实时Web升级

参考WHATWG SSE规范、MDN SSE/Streams/WebSocket、React useEffect、Node20 HTTP及Nginx官方代理文档，重写概念、接口与生命周期教程。具体阅读范围、事实依据和版权说明见[实时资料导读](labs/realtime-basics/READING_GUIDE.md)。新增React/Express实验、验证代码与课堂任务独立编写，不复制第三方完整工程；没有重复下载Full Stack Open资料。

## 2026-10-29：第5讲OpenAPI与自动化工具

参考OpenAPI3.1.1规范、Swagger UI/Editor、Redocly CLI v1、openapi-typescript、FastAPI元数据、Prism/Spectral官方仓库、OpenAPI Generator和Postman/Apifox官方导入文档。独立编写规范、工具服务与契约检查，复用本课Express案例，不复制第三方完整工程。用途与验证范围见[后端资料导读](labs/backend-resources/READING_GUIDE.md)；依赖保留各自许可，不虚构整套教材的开放许可。

## 2026-10-29：第7讲前后端集成升级

参考Helsinki Full Stack Open Part2c/d、React Effect及事件处理教程、MDN Fetch/AbortController/CORS、Vite官方代理与环境变量说明，重新组织查询、提交与联调教材。来源用途与范围见[资料导读](labs/integration-basics/READING_GUIDE.md)。新增客户端、代理与故障注入独立编写，复用本课Express应用与存储，不复制第三方完整项目，不重复下载FSO资料。
