# HTTP GET/POST、状态码与报文头

FSO Part 0b 用 notes 示例把 HTTP 拆开：方法、路径、状态码、Header、表单 POST 与 SPA 的 JSON POST。本讲对着 FDE 的登录页和案例库讲同样的事——并指出平台 **连 JSON POST 都还没有**。

## HTTP GET：要资源，不要副作用

浏览器地址栏、刷新、`<img src>` 都是 GET。FSO 强调：GET 应可重复、可缓存，不要用 GET 创建工单。

打开 `http://127.0.0.1:3100/cases`，文档请求是 GET。点进 `case-001` 也是 GET 另一条路由。**将来**读案例应是 `GET /api/cases`、`GET /api/cases/case-001`。

![单次 GET 的 General：方法、URL、状态码](fso-images/content/0/3e.png)

*图：FSO Part 0b。对照 FDE：点开文档请求，看 `:3100/` 的 method、status、`Content-Type`。*

`Content-Type` 决定浏览器怎么解释响应：`text/html` 当页面，`application/json` 当数据，`image/png` 当图。API 必须明确返回 JSON，不要把 404 HTML 错误页当业务响应。

## 传统表单 POST vs SPA JSON vs 当前 POC

FSO 的关键实验：HTML `<form method="POST">` 会发 `application/x-www-form-urlencoded`，浏览器跟着跳转或刷新；SPA 用 `fetch` + `application/json`，页面不整页刷新。

FDE `login/page.tsx` 是第三种：

```tsx
const login = () => {
  setLoading(true);
  setRole(role);
  setTimeout(() => router.push('/'), 500);
};
```

密码框 `defaultValue="demo-password"` **从未被读取**。没有 `POST /api/auth/login`，没有 `Set-Cookie`，没有 401。顶栏还能再 `setRole`——这正是 FSO 后来说的：**不能信任客户端。**

## 方法与幂等

| 方法 | 含义 | FDE 上的用法 |
|---|---|---|
| GET | 读 | 案例、项目、Trace |
| POST | 创建 | Run、访谈回合、部署 |
| PATCH | 部分更新 | Extract 状态、权限矩阵一格 |
| DELETE | 删除 | Forget Memory |

路径表示 **资源**，方法表示 **动作**。不要设计 `/getCases`、`/doLogin`。创建 Run 用 POST：点两次的语义必须在 API 里定义，不能只靠按钮 disable。

## 状态码（课堂必记）

`200/201` 成功；`400/422` 校验失败；`401` 未登录；`403` 学生打了 `/admin/cases`；`404` 没有的 `caseId`；`409` 重复领取；`429` 模型限流；`500` 未处理异常。POC 里这些码都不存在，因为没有 HTTP 业务层。

## URL 就是未来的 API

| 浏览器路径 | 文件 | 未来 REST |
|---|---|---|
| `/login` | `app/login/page.tsx` | `POST /api/auth/login` |
| `/cases` | `app/cases/page.tsx` | `GET /api/cases?industry=` |
| `/cases/case-001` | `app/cases/[caseId]/page.tsx` | `GET /api/cases/:id` |
| `/project/:id/agents` | `.../agents/page.tsx` | `POST /api/projects/:id/runs` |
| `/project/:id/trace` | `.../trace/page.tsx` | `GET /api/runs/:id/spans` |
