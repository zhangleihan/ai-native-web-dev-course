# 请求封装与接口契约：把失败变成可解释的信息

## 1. fetch返回的是什么

fetch返回Promise，兑现后得到Response；它包含状态码、头部和可读取的响应体。服务器返回404或503时，通常仍然得到Response，不会仅因状态为4xx/5xx自动进入catch。网络读取失败、主动中止等才可能使Promise拒绝。[MDN Fetch教程](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch)

```javascript
const response = await fetch('/api/cases');
if (!response.ok) throw new Error(`HTTP ${response.status}`);
const body = await response.json();
```

response.ok检查200–299，json()是另一个异步读取与解析步骤。HTTP200也可能返回错误页面或格式损坏的内容；不能在检查状态后就认为业务数据一定正确。

## 2. 区分五种问题

| 分类 | 例子 | 本实验处理 |
|---|---|---|
| HTTP错误 | 400校验、404缺失、503服务失败 | 保留status、code与请求编号 |
| 协议/数据错误 | 200却不是JSON，items不是数组 | protocol；不当作成功或空结果 |
| 网络读取失败 | 连接拒绝、断开，也可能是浏览器CORS限制 | network；结合Network进一步定位 |
| 超时 | 客户端等待期限届满 | timeout；不是服务端HTTP408 |
| 主动取消 | 筛选已改变或组件卸载 | AbortError；失效读取通常不弹业务错误 |

浏览器出于安全和实现原因，未必向脚本暴露跨源阻止的全部细节。不能仅凭一个TypeError就宣布一定是CORS；DNS、服务停止、代理失败等也要检查。

## 3. 请求封装承担有限职责

把地址前缀、头部、JSON序列化、状态判断、超时与统一错误放到一个请求函数；把“案例列表必须有哪些字段”放在案例服务模块。组件只接收业务对象，不在每个按钮里复制整套协议逻辑。

| 层次 | 配套文件 | 输入输出 |
|---|---|---|
| 通信 | client/api.mjs中的createClient | HTTP路径与选项→JSON或ApiError |
| 业务适配 | 同文件的createCasesAPI/readPage/readCase | 筛选/草稿→已核查形状的案例数据 |
| 查询生命周期 | client/latest.mjs | 异步任务→当前请求的loading/success/error |
| 界面 | client/main.jsx | 业务状态→列表、表单与提示 |

这不是通用请求库。复杂缓存、去重、刷新调度或框架数据加载可按需要选用成熟方案，不要求把一个课堂封装扩成完整框架。

## 4. 为JSON写请求设置正确内容类型

```javascript
const response = await fetch('/api/cases', {
  method: 'POST',
  headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
  body: JSON.stringify({
    title: '链路中断', industry: '通信', difficulty: 'beginner'
  })
});
```

Content-Type描述发出的请求体，Accept表达期望接收的格式。GET没有JSON请求体时无需习惯性添加Content-Type: application/json；多余头部在跨源时还可能引入预检。

FormData上传有自己的编码规则，不应照搬这里的JSON.stringify或手工固定multipart边界。本实验只处理JSON接口，文件上传属于后续扩展。

## 5. 一个入门请求函数

下面是可放入前端模块的入门版本，说明主干；完整配套版本另外处理调用者取消、超时与错误分类。

```javascript
export async function requestJSON(path, options = {}) {
  const headers = new Headers(options.headers);
  headers.set('Accept', 'application/json');
  const response = await fetch(`/api${path}`, {...options, headers});
  if (response.status === 204) return null;
  const text = await response.text();
  const contentType = response.headers.get('Content-Type') ?? '';
  let data;
  if (contentType.toLowerCase().includes('application/json')) {
    try { data = JSON.parse(text); } catch { /* 在后续统一判断 */ }
  }
  if (!response.ok) {
    const error = new Error(data?.error?.message ?? `HTTP ${response.status}`);
    error.status = response.status;
    error.requestId = response.headers.get('X-Request-Id');
    throw error;
  }
  if (data === undefined) throw new Error('响应不符合JSON契约');
  return data;
}
```

本函数接收已经序列化的body；创建调用要同时传入JSON内容类型与JSON.stringify结果。完整createClient则接收对象并自行序列化，两个接口不要混用，否则可能把JSON字符串再次编码。

204没有响应体，不应无条件response.json()。响应体通常只能按流消费一次；若先text()，就解析这个text，不再重复读取json()。

## 6. 路径与查询参数分开构造

```javascript
const query = new URLSearchParams({
  kw: '链路', industry: '通信', difficulty: 'beginner',
  offset: '0', limit: '2'
});
const page = await requestJSON(`/cases?${query}`);
```

URLSearchParams负责编码中文、空格和保留字符。不要把用户输入直接拼成`?kw=${input}&industry=...`，否则输入里的&可能改变查询结构。

路径中的单个资源编号可通过encodeURIComponent编码；这不能替代服务端校验或授权。请求参数只表达意图，不能作为可信身份。

本实验createCasesAPI会省略空字符串筛选，并保留offset=0等有效值。不要用“值为假就删除”的判断，把合法的0一起丢掉。

## 7. 对成功JSON做必要的形状检查

```javascript
function readPage(value) {
  if (!value || !Array.isArray(value.items) ||
      !Number.isSafeInteger(value.total) || value.total < 0) {
    throw new Error('列表结构不符合约定');
  }
  return value;
}
```

这是简化检查；实际实验还检查offset、limit及每个条目的id、title、industry和difficulty。JSON.parse成功只证明语法可解析，不证明items一定可map。

第五讲[OpenAPI](#/part/5/g)的生成类型帮助静态开发，JSON Schema验证器可用于更完整的运行时验证。本讲手写少量检查以看清边界，不声称验证了全部业务约束。

## 8. 同时支持超时和上游取消

完整createClient为每个请求创建AbortController，将调用者signal的取消传入，并设置有限等待定时器。在finally里清理计时器与监听器，防止已经完成的请求遗留资源。

```javascript
const controller = new AbortController();
const timer = setTimeout(() => controller.abort(), 5000);
try {
  await fetch('/api/cases', {signal: controller.signal});
} finally {
  clearTimeout(timer);
}
```

这段只展示超时机制，未区分主动取消与等待超时。完整版本另外记录原因，避免把用户快速切换筛选解释成“网络坏了”。[AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)可以中止fetch及相关读取，但不能让服务端已经发生的写入自动撤销。

读取超时可以提供人工重试；写入超时则需先核对结果。本实验没有为POST增加自动重试。

## 9. 错误信息要能跨层追踪

```text
kind: http
status: 400
code: VALIDATION_ERROR
requestId: 服务端生成的请求编号
message: 帮助使用者理解的说明
```

kind是客户端分类，code是服务端稳定错误分类，requestId用于对应日志。不要用完整中文消息作为程序分支条件，也不要把HTML错误页面直接当作业务错误正文插入界面。

跨源时，脚本读取非默认公开的响应头还可能需要Access-Control-Expose-Headers。实验在允许的CORS接口上公开X-Request-Id，便于把页面与API日志对应。[跨源联调教程](#/part/7/f)

## 10. 契约适配不应偷偷统一所有后端

本例读取Express的error对象。FastAPI默认校验错误可能是detail数组，需要单独适配；course-lab还需要会话与CSRF。不要把本讲无账号请求函数直接替换综合实验的安全请求代码。

API地址可以配置，但模型密钥、数据库口令和服务端会话秘密不能放在前端配置中。能打包进浏览器的内容，就不能依赖它保密。

## 检查点

<details><summary>503会自动进入fetch的catch吗？</summary><p>通常不会。fetch会给出Response，应检查response.ok，再按HTTP错误处理。</p></details>

<details><summary>DELETE返回204，为什么调用json()会报错？</summary><p>204没有JSON响应体。请求封装应先处理无内容状态。</p></details>

<details><summary>前端TypeScript类型正确，为什么还要检查items？</summary><p>网络返回的数据不因类型声明自动获得运行时保证。服务端、代理或版本可能与预期不同。</p></details>
