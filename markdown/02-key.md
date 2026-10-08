# HTTP 契约：资源、方法与失败响应

## 学习目标与课前准备

学完本讲，应能：读懂请求和响应；为案例查询与创建选择方法和状态码；用 curl 重放请求

先修：第 1 讲的请求链。本讲 2 学时，按每学时 45 分钟安排：回顾与问题导入 10 分钟、概念和示例 30 分钟、课堂练习 40 分钟、讲评与出口检查 10 分钟。课后练习时间不计入 32 学时。


## 报文就是双方的约定

```http
GET /api/cases?industry=telecom HTTP/1.1
Host: localhost:3001
Accept: application/json
```

```http
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{"items":[{"id":"case-001","title":"链路中断","industry":"telecom","difficulty":"beginner"}],"total":1}
```

方法说明意图，路径标识资源，查询参数约束读取范围；Header 描述媒体类型、认证和缓存等元数据；Body 携带数据。URL 参数需要编码，不用字符串拼接未处理的用户输入。

## 贯穿全课的最小契约

案例字段固定为 `id`、`title`、`industry`、`difficulty`；难度仅取 `beginner`、`intermediate`、`advanced`。`id` 由服务端生成且稳定。后续身份字段由服务器确定。

| 操作 | 请求 | 成功 | 可预期失败 |
|---|---|---|---|
| 查询列表 | GET /api/cases?industry=telecom&difficulty=beginner&kw=链路 | 200，`{items,total}` | 400 非法条件 |
| 读取详情 | GET /api/cases/:id | 200，案例对象 | 404 不存在 |
| 创建案例 | POST /api/cases，JSON | 201，案例对象及 Location | 400 校验失败；登录后增加 401/403 |
| 服务探测 | GET /api/health | 200，`{status:"ok"}` | 不等于所有依赖都健康 |

列表无匹配返回 `200 {"items":[],"total":0}`，不是 404。错误统一为 `{"error":{"code":"VALIDATION_ERROR","message":"标题不能为空"}}`；内部堆栈不返回给用户。分页选做；加入分页时 `total` 表示过滤后的总数，不能只数当前页。

## 安全性、幂等性与缓存

GET 的语义是安全读取，不用于删除或创建。幂等指重复相同请求对资源的预期影响相同，并非每次状态码都相同：连续 DELETE 可先返回 204、后返回 404。POST 创建通常不幂等，需要业务幂等键防止重试重复建单。

GET 响应是否可被缓存仍取决于状态和缓存指令等条件。含个人数据的接口应明确缓存策略；`Cache-Control: no-store` 要求不存储响应，`no-cache` 允许存储但复用前需验证。不要通过添加随机参数代替理解缓存。

## 重放请求

启动第 5 讲 API 后执行；未启动时连接失败是正常的。

```bash
curl -i 'http://127.0.0.1:3001/api/cases?industry=telecom'
curl -i -X POST http://127.0.0.1:3001/api/cases \
  -H 'Content-Type: application/json' \
  -d '{"title":"链路中断","industry":"telecom","difficulty":"beginner"}'
```

`fetch` 遇到 HTTP 404/500 通常仍返回 Response；网络断开才会拒绝 Promise。调用方必须检查 `response.ok`。这一区别将在集成和测试中反复使用。


## 自检与参考答案

**问题：** 删除同一记录两次分别得到 204 和 404，是否违反幂等？

<details><summary>完成思考后查看参考答案</summary>

不违反。两次执行后的资源都不存在；幂等关心资源效果，不要求响应完全相同。

</details>

## 阅读定位

[Full Stack Open Part 3：Node.js 与 Express](https://fullstackopen.com/en/part3/node_js_and_express/)（资源、状态与接口）。

必读范围是本讲正文；参考材料用于查漏补缺，不要求通读整门外部课程。课堂练习与课后练习见本讲后续小节。
