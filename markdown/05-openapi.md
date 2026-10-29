# OpenAPI与接口自动化：让一份契约服务于多种工具

## 1. 从接口表走向机器可读的契约

前一节已经为案例库写出方法、路径、字段与状态码。如果前端类型、在线文档和后端测试分别手工维护，字段一改，就可能出现“文档叫title，代码却读name”的不一致。

OpenAPI是一种描述HTTP API的开放规范。用JSON或YAML表达服务器地址、接口、参数、请求体、响应和安全要求后，不同工具可以读取同一份描述，生成文档、模拟响应、客户端类型或测试输入。它不是后端框架，也不会仅凭描述就自动实现业务。

本节采用OpenAPI **3.1.1**，这是为实验工具兼容性选定的版本，不表示它永远是最新版本。`openapi`表示规范版本，`info.version`表示这份业务API的版本，二者含义不同。[OpenAPI 3.1.1规范](https://spec.openapis.org/oas/v3.1.1.html)

| 名称 | 属于什么 | 在学习中的作用 |
|---|---|---|
| OpenAPI Specification，OAS | HTTP API描述规范 | 提供可交换的契约格式 |
| JSON Schema | 数据结构与约束的描述方式 | 说明对象字段、类型、必填与范围 |
| Swagger | 一组相关工具的名称 | Editor编辑、UI展示与调用等 |
| Express/FastAPI | Web框架 | 接收请求，实际执行业务逻辑 |
| Postman/Apifox等 | 接口设计与协作工具 | 编辑、导入、调试及协作，具体能力依产品而异 |

OpenAPI 3.1的Schema Object以JSON Schema 2020-12为基础，但一份OpenAPI文件还含有paths、responses等接口元数据，不能把整个文件直接当作一份普通数据Schema验证。

## 2. API先行与代码先行

| 方式 | 工作顺序 | 适合的学习场景 | 要防止的问题 |
|---|---|---|---|
| 设计先行 Design-first | 先写契约→评审→模拟→实现→验证 | 前后端同时开发，需要先约定输入输出 | 手工契约与实现逐渐偏离 |
| 代码先行 Code-first | 路由与模型→导出契约→审阅和使用 | 已有FastAPI等模型驱动框架 | 自动文档没有表达完整错误和业务规则 |

本课Express用独立OpenAPI文件补充已有实现，便于练习设计先行的工具链；FastAPI则展示从路由和Pydantic模型导出描述。两者都需要审阅，不应把“自动生成”理解为“自动正确”。

## 3. 一份描述文件的骨架

| 位置 | 主要内容 | 案例库例子 |
|---|---|---|
| openapi、info | 规范与API基本信息 | 规范3.1.1，业务版本1.0.0 |
| servers | 调用的基础地址 | 本例用相对地址/，指向文档同源服务 |
| paths | 路径、方法与操作 | /api/cases下的get/post |
| parameters | 路径、查询或头部参数 | id、kw、offset、limit |
| requestBody | 请求体内容类型和结构 | 创建时的application/json对象 |
| responses | 按状态码描述输出 | 201新案例，400错误，204无内容 |
| components.schemas | 可复用的数据模型 | CaseInput、Case、CaseList、Error |
| security | 使用哪些已定义认证方案 | 本机公开实验为空，不声明虚假的登录保护 |

`operationId`为一次操作提供稳定名称，例如createCase；代码生成工具可能使用它命名函数。`$ref`表示引用已有定义，避免在多个接口重复写同一模型。路径写`{id}`，是OpenAPI的路径模板；Express实现仍使用`:id`。

下面是创建接口的YAML**摘录**，用于理解结构；完整可运行文件为[openapi.json](labs/api-design-tools/openapi.json)，不要用此摘录覆盖完整文件。

```yaml
openapi: 3.1.1
info:
  title: 案例库接口设计实验
  version: 1.0.0
paths:
  /api/cases:
    post:
      operationId: createCase
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CaseInput'
      responses:
        '201':
          description: 创建成功
components:
  schemas:
    CaseInput:
      type: object
      additionalProperties: false
      required: [title, industry, difficulty]
      properties:
        title:
          type: string
        industry:
          type: string
        difficulty:
          type: string
          enum: [beginner, intermediate, advanced]
```

`required`中的名字是必填字段，不是字段值；`additionalProperties: false`拒绝未声明字段。响应描述中的`'201'`用引号保留为状态码键。YAML和JSON是两种书写方式，不是两种API协议。

## 4. 用哪些工具完成哪些工作

| 环节 | 工具与定位 | 自动化产物 | 不能据此推出的结论 |
|---|---|---|---|
| 编辑与评审 | Swagger Editor或可视化接口编辑器 | 结构化描述与即时提示 | 路由已经实现 |
| 文档与调用 | Swagger UI；FastAPI默认/docs也使用它 | 文档页面、Try it out请求 | 接口权限和业务规则正确 |
| 静态检查 | Redocly CLI；Spectral可自定义规则 | 语法、引用及命名/完整性报告 | 运行中的服务一定符合契约 |
| 模拟服务 | Prism | 从描述与示例生成响应的服务 | 真实数据库写入和事务已完成 |
| 前端类型 | openapi-typescript | TypeScript类型声明 | JSON响应已经运行时校验 |
| 客户端/骨架 | OpenAPI Generator | 指定语言的SDK或服务端骨架 | 生成代码已具备完整业务实现 |
| 团队协作 | Postman、Apifox等导入OpenAPI | 共享文档、请求及协作资料 | 所有扩展字段都能无损互转 |

[Postman](https://learning.postman.com/docs/design-apis/specifications/import-a-specification)与[Apifox](https://docs.apifox.com/import-openapi-swagger)可导入已有OpenAPI描述；导入后仍需核对字段与扩展。

工具链应从具体问题出发：本节必做为检查、交互文档与类型生成；模拟服务、SDK生成和协作平台为拓展，不要求全部安装。[Spectral](https://github.com/stoplightio/spectral)等规则工具也需要明确规则集，不是下载后就自动知道团队的设计约定。

## 5. 运行课程配套工具链

本例复用Express入门实验的应用构造函数，但建立一份新的独立内存数据，不连接已有3002服务。先准备相邻实验依赖，再进入工具目录：

```bash
cd labs/express-basics
npm ci --ignore-scripts
cd ../api-design-tools
npm ci --ignore-scripts
npm run check
npm start
```

打开 http://127.0.0.1:3020/docs 。Swagger UI的脚本与样式从本机提供；不依赖CDN，也关闭了远程规范校验器。这里的“Try it out”会请求当前3020上的真实API，创建、修改、删除都会改变本次内存样本，重启后清空。

分别执行工具也可以：

```bash
npm run lint
npm run types
npm run typecheck
npm run contract
```

| 命令 | 读取什么 | 检查或生成什么 |
|---|---|---|
| lint | openapi.json与redocly.yaml | Redocly规范及约定检查 |
| types | openapi.json | generated/api.d.ts类型声明 |
| typecheck | 生成类型与examples/types-example.ts | 编译期正向和负向类型检查 |
| contract | 规范与独立Express实例 | 对真实响应做Schema验证和业务断言 |

工具版本已写入package.json及锁文件。为沿用本课Node20.18环境，实验固定Redocly CLI 1.34.5，并引用其v1文档；不照搬要求不同运行环境的最新版安装命令。

## 6. 用交互文档完成一轮调用

1. 展开POST /api/cases，选择Try it out，提交默认的完整对象，执行后观察201与Location。
2. 复制返回的id，调用GET /api/cases/{id}，比较标题与行业。
3. 用PATCH只修改title，确认industry与difficulty保留。
4. 提交空标题，观察400与error结构；再查列表，确认失败没有新增记录。
5. DELETE成功应为204且无响应体，再GET同一编号应为404。

文档中的Example不是服务返回记录。Schema说明允许的数据形状；example提供一个样例；Try it out后显示的Server response才来自这次实际请求。将三者分开，才能识别“看起来有数据，其实只是在看样例”。

## 7. 类型生成解决什么问题

执行types后，不再手写另一份CaseInput接口：

```typescript
import type {components} from './generated/api';
type CaseInput = components['schemas']['CaseInput'];
const body: CaseInput = {
  title: '链路中断',
  industry: '通信',
  difficulty: 'beginner'
};
```

若把difficulty写成easy，TypeScript会报告类型不匹配。配套examples/types-example.ts包含一条预期失败的编译检查；它帮助发现枚举被意外放宽。

[openapi-typescript](https://openapi-ts.dev/introduction)生成的是不含运行时代码的类型，不会代替fetch、JSON解析或服务器响应验证。类型也不会自动检查非空白、最大长度、授权与状态转换。不要用`response.json() as Case`掩盖运行时的不确定性。

## 8. 规范检查、响应检查与业务测试分别验证什么

静态lint不发请求，主要检查描述本身；本例contract则启动随机端口的真实Express实例，从规范读取响应Schema，使用JSON Schema验证器检查返回结构。它同时断言Location、PATCH保留字段、失败无新增、删除后404等具体业务行为。

负向对照会给一份正确响应添加未声明字段，确认验证器能够拒绝；不是把真实响应替换成预期样例后再宣称通过。当前脚本覆盖列出的8组用例，没有穷举所有输入、状态码或权限。

规范也有表达边界：已有Express校验按去空白后的JavaScript UTF-16长度计数；JSON Schema的maxLength不是相同计数规则。本例用描述记录这一限制，未用一个貌似相等的maxLength混淆二者；具体边界仍由实现和针对性测试验证。

修改规范而不改实现，或只改实现而不更新规范，都可能造成漂移。自动化的目的在于尽早暴露分歧，而不是同时维护两份互不检查的说明。

## 9. FastAPI的代码先行对照

已有FastAPI实验默认提供`/openapi.json`、`/docs`和`/redoc`。启动8001服务后可查看机器描述与两种文档界面；默认文档资源可能从外部CDN加载，与本节完全本地的Swagger UI服务不同。[FastAPI文档地址配置](https://fastapi.tiangolo.com/tutorial/metadata/)

从课程根目录另开终端，导出已运行FastAPI服务的描述：

```bash
cd labs/api-design-tools
mkdir -p generated
curl --fail http://127.0.0.1:8001/openapi.json \
  -o generated/fastapi-openapi.json
```

generated保存导出结果，不与手工契约混用。这个文件属于Python API，不能覆盖本节Express的openapi.json：FastAPI当前只实现列表、创建、详情，字段校验为422，错误结构也不同。

自动导出内容来自声明的路由、参数与响应模型，不一定包括全部运行时错误。例如显式HTTPException(404)并不会凭空补齐所有业务响应说明，需要在路由的responses等元数据中补充后再核查。

## 10. 模拟服务、代码生成与CI拓展

[Prism](https://github.com/stoplightio/prism)可依据OpenAPI建立模拟服务，让前端在真实业务后端完成前先联调。模拟POST返回一个对象，不代表它已经持久保存，也不能假设下一次GET自动读到同一记录。本课未把Prism加入必装依赖。

[OpenAPI Generator](https://openapi-generator.tech/docs/usage/)支持生成多种语言客户端与服务端骨架。它与本节只生成类型的工具不同；使用前应检查目标生成器、规范版本与运行环境，生成目录与手写业务目录分开维护。不要直接覆盖已有项目。

CI中可在安装锁定依赖后执行`npm run check`，使规范检查、类型生成和代表性契约验证成为提交检查的一部分。新增必填字段、删除响应字段或缩小枚举都可能影响现有消费者；版本号变化本身不能替代兼容性评审。

AI可以协助起草规范，但需要逐项核对现有路由、默认值、错误、可写字段与认证。把没有实现的接口描述得很完整，并不会让它变成可调用能力。

## 自检与练习

<details><summary>Swagger UI可以展示接口，是否代表后台已经运行？</summary><p>不是。它可只读取描述展示样例。必须查看实际请求与响应，才能证明对应服务可调用。</p></details>

<details><summary>规范中声明Bearer认证后，Express会自动验证令牌吗？</summary><p>不会。security描述调用要求，实际认证、权限和会话处理仍由后端实现。</p></details>

<details><summary>lint通过、类型检查通过，能否删掉接口测试？</summary><p>不能。它们分别检查描述与静态类型，没有证明运行中的业务、副作用和授权正确。</p></details>

练习：为期末项目的一个资源补充创建、列表与详情契约，生成文档与类型；提交一条成功和一条失败的真实调用，并解释哪些规则尚未被自动化检查。先完成这一条链路，再考虑更多工具。

## 阅读定位

★★★★★ [完整配套说明](labs/api-design-tools/README.md)、[OpenAPI规范](https://spec.openapis.org/oas/v3.1.1.html)、[Swagger UI](https://swagger.io/open-source/swagger-ui/)。

★★★★☆ [Redocly v1 lint](https://redocly.com/docs/cli/v1/commands/lint)、[openapi-typescript](https://openapi-ts.dev/introduction)、[FastAPI元数据与文档](https://fastapi.tiangolo.com/tutorial/metadata/)。其他工具与验证范围见[第5讲资料导读](labs/backend-resources/READING_GUIDE.md)。核查日期：2026-10-29。
