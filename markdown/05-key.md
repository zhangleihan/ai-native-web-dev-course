# 后端与 REST API：概念、契约与框架

## 学习目标与课前准备

本讲从案例库的“查询和新增”需求出发，建立后端开发的完整认识。完成学习后，应能画出一次请求的处理路径，设计资源接口，使用 Express 编写并验证接口，解释框架、运行时和数据库之间的关系，并能阅读 FastAPI 的对应代码。

先修内容为第2讲 HTTP、JSON 与接口契约，以及第3讲函数、数组、对象、模块和异步基础。实践需要 Node.js 20.18+；Python 对照实验使用 Python 3.12。教材命令均从课程仓库根目录起步，进入实验目录后继续执行。

本讲的两学时主线为“概念与契约 → Express 读取和创建 → 校验与失败 → 请求验证”。完整 CRUD、工程拆分与 FastAPI 提供课前预习和课后拓展，不要求在一次课内完成所有实现。

| 阅读顺序 | 内容 | 达成的结果 |
|---|---|---|
| 本节 | 后端职责、HTTP、REST 与框架 | 能解释一条请求去了哪里 |
| [Express 分步教程](#/part/5/e) | 从原生 HTTP 到模块化案例 API | 能逐步写出并运行接口 |
| [接口设计与调试](#/part/5/f) | 完整契约、分页、错误与调试 | 能判断接口行为是否正确 |
| [OpenAPI与自动化工具](#/part/5/g) | 机器可读契约、文档、类型与验证 | 能解释一份契约怎样用于多种工具 |
| [实践练习](#/part/5/b) | 从正常请求到失败边界 | 能提供可复现的验证记录 |
| [FastAPI 对照](#/part/5/d) | Python 模型、参数与自动文档 | 能迁移同一组后端概念 |

## 1. 从 React 页面走向服务器

案例列表页面中的 `useState` 保存着浏览器当前使用的数据。如果另一位用户打开页面，他会得到自己的状态；刷新、关闭页面或切换设备，也可能丢失未持久化的内容。多个用户共享案例时，需要一个共同的数据入口。

后端提供这个入口。它接收请求，检查输入与权限，执行业务规则，读写数据，再返回结果。前端根据返回结果更新页面。请求可能来自浏览器，也可能来自移动端、命令行或其他服务，因此后端必须独立判断请求是否合法。

```text
React 页面：填写案例 → fetch 发出请求
                             ↓
后端：匹配路由 → 校验输入 → 执行业务 → 访问数据 → 返回响应
                             ↓
React 页面：检查状态码 → 显示成功、空结果或错误
```

这里有两类校验：前端即时提示让使用者更容易填写；后端校验维护所有调用者都必须遵守的规则。即使页面要求标题必填，命令行仍可提交空标题，后端不能依赖页面已经检查过。

后端既可以生成 HTML，也可以返回 JSON。CS50 Web 的 Django 课程用路由和视图生成动态页面；本课把界面交给 React，后端主要返回数据。两种方式都遵循请求与响应，只是返回内容和页面生成位置不同。[CS50 Web：Web Applications 与 Routes](https://cs50.harvard.edu/web/notes/3/)

## 2. 语言、运行时、服务器与框架

| 概念 | JavaScript 路线 | Python 路线 | 回答的问题 |
|---|---|---|---|
| 编程语言 | JavaScript | Python | 用什么语法表达逻辑？ |
| 运行环境 | Node.js | Python 解释器 | 程序在哪里执行？ |
| Web 框架 | Express | FastAPI | 如何组织请求处理？ |
| HTTP 服务承载 | Node HTTP 服务器 | Uvicorn 等 ASGI 服务器 | 谁监听端口、接收网络请求？ |
| 数据访问工具 | pg 等数据库客户端 | 对应数据库驱动或 ORM | 如何与数据库通信？ |
| 持久化存储 | PostgreSQL 等 | PostgreSQL 等 | 数据在哪里长期保存？ |

Node.js 中没有浏览器 DOM，不能直接调用 `document.querySelector()`；React 的 JSX 也不是服务端路由语法。Node 的 HTTP 模块已经能创建网络服务，Express 进一步提供路由、中间件和响应等组织方式。[Express 最小应用](https://expressjs.com/en/starter/hello-world/)

FastAPI 应用通常由 Uvicorn 启动。ASGI 是服务器与 Python 应用之间的接口规范；学习入门时，先理解“Uvicorn 接收请求，FastAPI 调用处理函数”，无需立即实现底层协议。

数据库不是框架附带的数组。Express 和 FastAPI 都允许使用内存数据演示，但定义路由或数据模型不会自动完成数据库建表、备份或事务。本讲先验证 HTTP 契约，第6讲再讨论持久化。

## 3. 把一次操作还原为 HTTP

创建案例的请求可以表示为：

```http
POST /api/cases HTTP/1.1
Host: 127.0.0.1:3002
Content-Type: application/json
Accept: application/json

{"title":"链路中断","industry":"通信","difficulty":"beginner"}
```

方法说明操作语义，路径定位资源，头部说明内容及调用要求，空行后是请求体。`Content-Type` 描述发送内容；`Accept` 表达希望收到的内容。它们不能互相代替。

创建成功后，示意响应为：

```http
HTTP/1.1 201 Created
Content-Type: application/json; charset=utf-8
Location: /api/cases/新生成的编号

{"id":"新生成的编号","title":"链路中断","industry":"通信","difficulty":"beginner"}
```

示意中的编号是占位内容；运行时由服务器生成。201 告诉客户端资源已创建，Location 提供资源位置，响应体让页面直接取得新对象。只在响应体写 `"success": true` 而实际返回500，会让调用方得到矛盾信号。

浏览器地址栏适合发出 GET 读取请求。新增、修改、删除通常需要 fetch、curl、接口客户端或交互文档。看到“页面能打开”并不能证明 POST 已经正确实现。

## 4. 用资源组织接口

API 是程序之间的交互约定。REST 是一种架构风格，强调资源、统一接口等约束；很多项目称为 REST API 的接口，只采用了其中部分实践。本课先建立围绕资源设计 HTTP 接口的基础。

案例资源的表示可以包含 id、title、industry、difficulty。服务器内部还可能保存权限、审计等字段，返回给客户端的 JSON 应明确选择需要公开的内容。

| 用户意图 | 请求 | 本课契约 |
|---|---|---|
| 查询案例集合 | `GET /api/cases` | 200，列表与 total |
| 筛选集合 | `GET /api/cases?kw=链路` | 200，匹配的列表 |
| 查询单个案例 | `GET /api/cases/{id}` | 200；不存在则404 |
| 创建案例 | `POST /api/cases` | 201，Location 与对象 |
| 替换全部可写字段 | `PUT /api/cases/{id}` | 契约讨论项，入门实验未实现 |
| 修改部分字段 | `PATCH /api/cases/{id}` | 200，更新后的对象 |
| 删除案例 | `DELETE /api/cases/{id}` | 204，无响应体；缺失则404 |

`{id}` 是契约中的占位符，Express 用 `:id` 定义，FastAPI 用 `{case_id}` 定义。实际请求中写入具体编号。查询参数属于筛选，不应为每个关键词创建新路由。

GET 应保持读取语义；删除等改变业务数据的操作不能藏在 GET 中。PUT 与 DELETE 具有幂等语义：重复相同请求的预期业务效果一致，并不要求状态码相同。POST 创建通常不具备这一保证，网络失败后的重试需要另行设计。PATCH 是否幂等取决于补丁的含义。[HTTP 方法语义](https://www.rfc-editor.org/rfc/rfc9110.html#section-9.2)、[PATCH 方法](https://www.rfc-editor.org/rfc/rfc5789.html)

无状态约束要求请求携带处理所需上下文，不能让调用方依赖服务器记住隐含的上一轮操作。它不等于“服务器不能保存业务数据”。认证与会话的具体设计在第8讲展开。

## 5. 框架中的请求处理链

Express 中的主要对象是请求 `req` 和响应 `res`。路由根据 HTTP 方法与路径选择处理函数；中间件完成解析、日志等共同任务。

```text
请求进入
  → 请求编号与日志
  → 内容类型检查与 JSON 解析
  → 路由匹配
  → 参数及业务校验
  → 数据访问
  → 成功响应
失败时 → 统一错误响应
无匹配路由 → 404 响应
```

读取案例编号用 `req.params.id`，读取筛选词用 `req.query.kw`，读取提交内容用 `req.body`。这三个位置含义不同。路由不会因为请求体里有 id 就自动读取对应资源。

中间件可以结束响应，也可以调用 `next()` 继续。注册顺序会影响行为：JSON 解析必须出现在需要读取 JSON 的路由之前；未知接口兜底应放在正常路由之后。[Express 中间件](https://expressjs.com/en/guide/using-middleware/)

Express 5 会将返回的 Promise 的拒绝传入错误处理链。路由中 `await store.get(id)` 失败可以进入统一处理，但独立计时器或回调的异常需要主动交给框架。不要把所有失败都当成客户端400。[Express 错误处理](https://expressjs.com/en/guide/error-handling/)

## 6. 框架能够协助的部分与业务规则

| 问题 | 框架提供的机制 | 仍需实现的规则 |
|---|---|---|
| 把请求送到函数 | 路由 | 哪些资源和操作对外提供 |
| 读取提交内容 | JSON 解析、请求模型 | 字段是否允许、长度和枚举范围 |
| 返回数据 | JSON 序列化、响应模型 | 哪些字段可以公开 |
| 处理失败 | 错误中间件、异常处理器 | 错误分类、消息、可追踪信息 |
| 保存数据 | 连接数据层的能力 | 数据模型、约束、事务和迁移 |
| 控制访问 | 中间件、依赖等扩展点 | 身份、所有权与权限判断 |

JavaScript 的对象和 Python 的类型注解本身都不足以保证网络输入有效。FastAPI 借助 Pydantic 在请求入口执行模型校验；Express 通常采用显式校验函数或校验库。两者都需要明确业务含义。

本讲案例 API 限定客户端只能写 title、industry、difficulty；id 由服务端生成。若未来增加 owner，应来自已认证身份，而不是直接信任请求体传来的所有者。

## 7. 数据、进程与并发的基本认识

内存集合在服务进程中存在，浏览器刷新不会重启服务。停止进程、开发热重载或重新启动应用会重新创建集合；多个进程各有自己的内存，不能据此实现可靠的共享存储。

Node.js 可以在等待 I/O 时继续处理其他工作。`await` 使当前异步函数等待结果，不等于阻塞整个服务器；耗时的同步循环仍会妨碍其他请求。后端服务应区分网络和数据库等待与大量 CPU 运算。[Node.js 事件循环](https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick)

入门实验通过单进程内存数据解释请求行为，尚未处理持久化、跨进程一致性与完整访问控制。将它迁移到 PostgreSQL 时，接口外观可以保持稳定，数据访问和业务一致性则需要重新验证。

## 8. 选择一条实现路线

本课以 Express 为主线，便于复用 JavaScript；有 Python 模型或数据处理需求时，可以沿 FastAPI 路线学习。已有 Next.js 项目也可以通过 Route Handler 提供 API，选择依据是项目边界、团队语言和依赖。

“界面能运行”与“接口已接通”是两个阶段。FDE UI 副本的数据仍由前端模拟状态驱动，接入服务时，应从列表和创建动作开始，逐个替换数据入口，并提供加载、空结果和失败提示。接口契约用于约束这种替换。

## 自检与参考答案

<details><summary>为什么浏览器刷新后数据还在，仍不能证明持久化？</summary><p>刷新只重新请求数据，服务端内存仍存在。需要停止并重启服务后读取记录；本讲内存示例会恢复为空。</p></details>

<details><summary>请求体是合法 JSON，为什么仍可返回400？</summary><p>JSON 解析只证明语法正确。标题可能为空、字段可能多余、难度可能不在枚举范围；这些由后续校验判断。</p></details>

<details><summary>为什么删除第二次返回404，仍可以符合幂等语义？</summary><p>第一次操作后资源已不存在，第二次没有产生新的业务副作用，最终状态相同；响应可以表达资源已经缺失。</p></details>

<details><summary>React 表单中的 owner 隐藏字段能作为案例所有权依据吗？</summary><p>不能，客户端可修改提交内容。后端应从经过验证的身份获得所有者，并检查操作范围。</p></details>

<details><summary>为什么要先写请求与响应，再选框架？</summary><p>调用方依赖路径、字段、状态码和错误结构。先定义契约，才能判断不同框架是否实现相同行为。</p></details>

## 阅读定位

★★★★★ [Full Stack Open Part 3：Node.js and Express](https://fullstackopen.com/en/part3/node_js_and_express/)：先读简单服务、Express、资源读取、接收数据与中间件，完成后对照本课案例 API。

★★★★★ [Express 分步教程](#/part/5/e)与[接口设计与调试](#/part/5/f)：本课必读，含分步实现、响应示例及错误定位。

★★★★☆ [Full Stack Open Part 4：Structure of backend application](https://fullstackopen.com/en/part4/structure_of_backend_application_introduction_to_testing/)：只读工程结构与 Router；数据库和完整测试在后续讲次衔接。

★★★★☆ [CS50 Web Lecture 3](https://cs50.harvard.edu/web/notes/3/)：阅读 Web Applications、HTTP、Routes，比较生成 HTML 与返回 JSON 的共同机制；不要求另学 Django 全套。

完整来源、用途与版本差异见[本讲资料导读](labs/backend-resources/READING_GUIDE.md)。外部内容按其原许可使用；本课采用自己的案例重新组织讲解。核查日期：2026-10-28。
