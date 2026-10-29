# 第5讲：OpenAPI与接口自动化

以已有Express案例API为实现，增加一份OpenAPI3.1.1描述，运行规范检查、Swagger UI交互文档、TypeScript类型生成与真实响应检查。不修改Express原业务，也不连接已有3002服务；工具服务每次创建独立内存数据。

## 准备与运行

Node20.18+，从课程根目录：

```bash
cd labs/express-basics
npm ci --ignore-scripts
cd ../api-design-tools
npm ci --ignore-scripts
npm run check
npm start
```

打开 http://127.0.0.1:3020/docs ，原始规范位于 `/openapi.json`。端口冲突可用 `PORT=3021 npm start`，再访问3021。Swagger UI脚本和CSS在本机提供，远程规范校验器已关闭。点击Try it out会真正操作本次内存样本；重启恢复空集合。

## 文件与命令

| 文件/命令 | 用途 |
|---|---|
| openapi.json | 手工维护的完整接口描述；只针对express-basics |
| redocly.yaml / npm run lint | Redocly推荐规则检查；不虚构教材许可字段 |
| npm run types | 生成generated/api.d.ts，目录被Git忽略 |
| examples/types-example.ts / npm run typecheck | 使用生成类型，含错误枚举的负向编译检查 |
| scripts/check-contract.mjs / npm run contract | 随机端口真实响应与Schema验证、代表性业务断言 |
| scripts/server.mjs / npm start | 复用相邻Express应用，提供同源API及本机Swagger UI |
| npm run check | 顺序执行lint、types、typecheck、contract |

lint对不含参数且仅表示存活的健康操作提示1条“建议提供4xx”警告，本例保留该建议而不编造业务错误；其他操作已声明对应错误响应。第一次运行typecheck前先types，或直接check。generated是可重新生成的产物，业务类型应从openapi.json重新生成，不手工改输出文件。examples中的错误枚举是有意保留的预期编译错误，使用@ts-expect-error保证规则没有被意外放宽。

## 课堂操作

创建→复制id→读详情→PATCH仅改title→空标题400→查列表确认未新增→DELETE204→再读404。规范样例不是调用结果；查看Try it out之后的Server response与Network。

contract执行8组检查：列表结构；创建/Location/详情；PATCH保留字段；错误结构与失败无新增；分页错误；资源404；删除204无内容与后续404；额外响应字段被Schema拒绝。它读取规范中的响应结构，没有把真实响应替换成固定样例。另核对本机文档与JS资源可访问。

## 实现边界

OpenAPI文档不会自动改变Express校验，也没有增加认证、授权、幂等或数据库。输入标题的去空白与UTF-16长度规则由原实现执行；规范描述其限制，未用不同字符计数语义的maxLength伪装成完全等价。

响应Schema采用JSON Schema2020-12，由Ajv验证；脚本先把components下的本地Schema引用转换成验证器的$defs引用。它不是通用OpenAPI请求验证中间件，未覆盖所有响应、超大请求或全部异常。

FastAPI的openapi.json由其路由与模型导出，校验错误422、字段与接口范围也不同。不要拿它覆盖本实验文件。Prism、Spectral、OpenAPI Generator、Postman与Apifox仅作工具介绍，未安装或声称本次实测。

## 版本与来源

依赖由package-lock.json固定。Redocly CLI1.34.5用于兼容课程Node20.18；其命令参照v1文档。Swagger UI5.34.0、openapi-typescript7.6.1、TypeScript5.8.3、Ajv8.17.1与ajv-formats3.0.1是本次锁定组合，不称为所有工具的最新推荐组合。

官方来源与版权见相邻backend-resources/READING_GUIDE.md。教材新入口 `#/part/5/g`，同时补充设计先行、代码先行、模拟服务与自动化的验证范围。

## 排错

- 找不到express：先在相邻express-basics运行npm ci，工具目录只安装自己的依赖。
- 找不到generated/api.d.ts：先运行npm run types。
- lint通过但真实响应失败：查看具体方法、状态与Schema错误，对比实现及规范。
- 文档页面有示例但调用失败：检查Server response、端口、服务进程与实际接口；样例不是运行证明。
- FastAPI文档资源加载失败：它默认可能使用CDN，先取/openapi.json确认API；本节3020文档不依赖CDN。

2026-10-29验证：规范检查通过（健康接口保留1条4xx文档建议），类型生成与TypeScript编译检查通过，8组独立真实HTTP契约检查通过，本地文档与JS资源可访问。未安装或实测Prism、Spectral、OpenAPI Generator、Postman与Apifox，不把工具介绍写成运行结果。
