# 项目关联

登录页是本讲的「反面教材 + 改造起点」。`users` 写在 `mock/base.ts`，四种 `RoleKey`：student / teacher / mentor / admin。教师切换角色能看隐藏事实，只是因为前端 `user.role === 'teacher'`。

案例库筛选（行业、难度、关键词）现在全是前端 `useState` + `cases.filter`。FSO 会说：若筛选要可分享、可收藏，应变成 `GET /api/cases?industry=通信运营`。URL 既是人读的路由，也是机器读的资源查询串。

Cookie / Token 本讲只建立概念：会话要 `HttpOnly; Secure; SameSite`，或 JWT 放内存。不要学 POC 把角色存在 React Context 里当安全机制。第 8 讲落地。
