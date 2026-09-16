# 认证、授权、Token 与不能信任的前端

FSO Part 4c/4d 做用户管理与 token；Part 5a 把登录接到前端。核心句：**浏览器里的一切都可被改掉。** FDE 的 `setRole` 是这句话的活标本。

## 认证 vs 授权

- 认证：你是林知远还是陈老师（`POST /api/auth/login` 校验密码哈希）
- 授权：学生不能进案例设计器；`create_work_order` 对 OperationsAgent 是 `APPROVAL_REQUIRED`（**工具权限**，另一张表）

POC 两件事都在前端。登录应变成用户名/密码受控表单，去掉用 Segmented 当认证。`GET /api/me` 后按角色不渲染 Admin 菜单，**路由 API 也要 403**。

## Token 流程（FSO 映射）

notes：登录 → 服务器发 token → 后续 `Authorization: Bearer`。FDE 推荐 Cookie：`HttpOnly; Secure; SameSite=Lax`。localStorage 里的 JWT 可被 XSS 偷走。

## 四角色

student 只能碰自己的项目；teacher 评分与看 Trace；mentor 反馈；admin 模型与资源。顶栏「切换角色」必须消失。

## XSS / CSRF / 注入

React 默认转义。危险：Copilot Markdown HTML、`dangerouslySetInnerHTML`、访谈原文进提示词。Cookie 会话要 SameSite 或 CSRF 头。SQL 必须参数化。模型密钥只放服务器，禁止 `NEXT_PUBLIC_` 前缀。
