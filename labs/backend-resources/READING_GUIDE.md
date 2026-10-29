# 第5讲资料导读：后端、REST API 与框架

核查日期：2026-10-28。正文为围绕案例库重新编写的教材，未整段转载外部讲义或复制第三方项目。官方课程与标准用来核查概念、组织学习路径；配套实现与验证结果以本仓库为准。

## 核心课程资料

| 优先级 | 来源与机构 | 指定阅读范围 | 对应教材与学习任务 |
|---|---|---|---|
| ★★★★★ | [Full Stack Open Part 3a](https://fullstackopen.com/en/part3/node_js_and_express/)，University of Helsinki | Simple web server、Express、REST、Fetching a single resource、Receiving data、Middleware | 05-key与05-express；从一个请求开始，每增加操作就实际调用 |
| ★★★★★ | [Full Stack Open Part 4a](https://fullstackopen.com/en/part4/structure_of_backend_application_introduction_to_testing/)，University of Helsinki | Project structure、Router、应用与启动分离 | 05-express第8节；说明模块拆分怎样服务测试与存储替换 |
| ★★★★☆ | [CS50 Web Lecture 3 Notes](https://cs50.harvard.edu/web/notes/3/)，Harvard | Web Applications、HTTP、Routes | 05-key第1–3节；比较服务器生成HTML和返回JSON |
| ★★★★☆ | [CS50 Web Lecture 3 Slides PDF](https://cdn.cs50.net/web/2020/spring/lectures/3/lecture3.pdf)，Harvard | 17页讲义中的Web应用、HTTP报文与状态码部分 | 配合Notes观察协议层次；Django命令不是本课的Express命令 |

Full Stack Open 本机离线目录的 markdown/part3a.md 与 markdown/part4a.md 已用于核查。part3a 含中文与英文注释，part4a 存在中英混排；以当前官方页面与框架版本校验细节。源码模块语法、Node版本、数据存储方案可能与本课不同，不直接拼接不同教程的代码。

CS50 Web 是公开课程的历史年度资料，使用 Django；本讲借鉴其请求、路由与动态应用的概念组织，不将其视为 FastAPI 教程，也不要求同时学习第三套框架。

## 框架官方资料

| 来源 | 建议阅读点 | 本课中的实际使用 |
|---|---|---|
| [Express Hello World](https://expressjs.com/en/starter/hello-world/) | app对象、响应与监听 | 最小应用及原生HTTP比较 |
| [Express Routing](https://expressjs.com/en/guide/routing/) | 方法、路径参数、Router | 案例集合与详情、资源路由挂载 |
| [Express Middleware](https://expressjs.com/en/guide/using-middleware/) | next、注册顺序、错误中间件 | JSON解析、请求编号、未知路径 |
| [Express Error Handling](https://expressjs.com/en/guide/error-handling/) | Express5 Promise传播、headersSent | async数据访问失败与500响应 |
| [FastAPI First Steps](https://fastapi.tiangolo.com/tutorial/first-steps/) | 装饰器、应用与文档入口 | 启动与/docs调用 |
| [FastAPI Request Body](https://fastapi.tiangolo.com/tutorial/body/) | Pydantic模型与参数来源 | CaseInput及路径/查询/请求体区分 |
| [FastAPI Response Model](https://fastapi.tiangolo.com/tutorial/response-model/) | 输出校验与字段过滤 | CaseOut与CaseList |
| [FastAPI Handling Errors](https://fastapi.tiangolo.com/tutorial/handling-errors/) | HTTPException与验证异常 | 404/422和detail结构 |
| [FastAPI Dependencies](https://fastapi.tiangolo.com/tutorial/dependencies/) | Depends、Annotated、请求时解析 | 可独立运行的分页依赖示例 |
| [FastAPI Bigger Applications](https://fastapi.tiangolo.com/tutorial/bigger-applications/) | APIRouter与include_router | 多模块组织示意 |
| [FastAPI Body Updates](https://fastapi.tiangolo.com/tutorial/body-updates/) | exclude_unset与部分更新 | 拓展练习；基础实验尚未实现PATCH |
| [FastAPI Testing](https://fastapi.tiangolo.com/tutorial/testing/) | TestClient | 基础接口的自动验证 |
| [FastAPI Async](https://fastapi.tiangolo.com/async/) | def、async def与等待 | 区分阻塞操作与异步I/O |

## 协议与运行时参考

- [RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html)：方法语义、安全与幂等、201/204/4xx/5xx。只在有具体问题时查阅对应段落。
- [RFC 5789](https://www.rfc-editor.org/rfc/rfc5789.html)：PATCH与完整替换的区别；本例字段合并格式是应用约定。
- [Node.js Event Loop](https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick)：I/O等待与同步计算，勿将await理解为自动并行。

## 阅读后的证据任务

1. 画出创建案例从请求到响应的路径，标出解析、校验、写入和失败位置。
2. 提交一条成功请求与一条失败请求，解释状态码与数据副作用。
3. 在源码定位应用构造、路由和存储边界，说明替换数据库会涉及哪些部分。
4. 选择Python路线时，对照输出字段和校验错误，说明能否直接替换当前前端调用。

## 版本、版权与验证边界

Express参考实验锁定5.3.0，验证运行时为Node20.18.0；FastAPI基础实验的具体版本由requirements-lock.txt记录，采用Pydantic2的model_dump/config写法。资料页面描述当前版本，不保证所有历史代码都兼容。精确复现使用锁文件，升级后重新验证。

外部讲义、课程代码、商标与图片各自保留原版权和许可，公开访问不等于无条件再分发。这里只提供官方链接、阅读定位与本课改编说明，未复制CS50整套幻灯片、视频或FSO整门课程到本实验。源项目的许可不能自动覆盖本课重新编写的内容，反之亦然。

## OpenAPI与API自动化补充（2026-10-29）

| 来源 | 指定用途 | 范围 |
|---|---|---|
| [OpenAPI3.1.1](https://spec.openapis.org/oas/v3.1.1.html) | paths、requestBody、responses、components、Schema Object | 本课选择版本，不称为最新规范 |
| [Swagger UI](https://swagger.io/open-source/swagger-ui/)、[配置](https://github.com/swagger-api/swagger-ui/blob/main/docs/usage/configuration.md) | 描述生成交互文档，本地资源与validatorUrl配置 | 本机3020服务实际使用 |
| [Swagger Editor](https://swagger.io/open-source/swagger-editor/) | 描述编辑与提示 | 介绍，未安装 |
| [Redocly CLI v1 lint](https://redocly.com/docs/cli/v1/commands/lint) | 静态结构及规则检查 | 为Node20.18固定CLI1.34.5；不引用v2运行要求作为本版本要求 |
| [openapi-typescript](https://openapi-ts.dev/introduction) | 生成不含运行时代码的类型 | 不代表响应运行时校验或完整SDK |
| [FastAPI元数据与文档](https://fastapi.tiangolo.com/tutorial/metadata/) | 描述及/docs、/redoc入口 | Python已有模型驱动路线，错误格式与Express不同 |
| [Prism](https://github.com/stoplightio/prism)、[Spectral](https://github.com/stoplightio/spectral) | 模拟服务与可定制规则 | 拓展介绍，未安装或实测 |
| [OpenAPI Generator](https://openapi-generator.tech/docs/usage/) | 客户端和服务器骨架生成 | 拓展介绍，未运行生成器 |
| [Postman导入](https://learning.postman.com/docs/design-apis/specifications/import-a-specification)、[Apifox导入](https://docs.apifox.com/import-openapi-swagger) | 导入已有描述、协作与调试 | 介绍，不声称扩展字段均能无损互转 |

实验规范针对express-basics的实际路由、400/error、分页与PATCH契约；不是course-lab或FastAPI的通用替代。JSON Schema2020-12响应验证使用Ajv；规范未假装其maxLength与现有JavaScript UTF-16长度规则完全等价。具体业务规则继续由实现和针对性测试维护。

新增规范与脚本为本课独立编写，依赖由锁文件固定并保留原许可。公开文档仅作链接与概念核查，没有复制整套课程、安装Java生成环境或把示例API上传协作平台。

2026-10-29验证：规范检查通过（健康接口保留1条4xx文档建议），类型生成与TypeScript编译检查通过，8组独立真实HTTP契约检查通过，本地文档与JS资源可访问。未安装或实测Prism、Spectral、OpenAPI Generator、Postman与Apifox，不把工具介绍写成运行结果。
