# 项目关联

改动面：`login/page.tsx`、`AppShell` 角色下拉、`/admin/cases`、`GET /api/me`。工具矩阵在 `/project/:id/tools`，与用户角色同时存在：admin 登录也不能让 Agent 绕过 `APPROVAL_REQUIRED`。
