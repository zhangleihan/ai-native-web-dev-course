# 课堂练习

## 1. 观察现有登录

打开 `/login`，选教师，登录。Network 里找有没有 POST。再在顶栏把角色切回学生。口头回答：若这是生产系统，攻击者如何提权（讲防御视角即可）。

## 2. 最小 HTTP（health / echo）

在 `FDE-Workspace` 旁或 `web/server` 增加 FastAPI 或 Express（教师指定一种）：

- `GET /health` → `{"ok": true}`
- `POST /echo` JSON 原样返回

```bash
curl -i http://127.0.0.1:3101/health
curl -i -X POST http://127.0.0.1:3101/echo \
  -H 'Content-Type: application/json' \
  -d '{"from":"fde"}'
```

对照 FSO：看状态码、`Content-Type`、是否刷新了浏览器（curl 当然不会）。

## 课堂要交出口

- [ ] 能批评当前 login 无 HTTP
- [ ] curl 过 health/echo
- [ ] 菜单 → 方法+路径 至少 8 行（可当课后补完）
