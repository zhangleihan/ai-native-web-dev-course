# Express 案例 API 入门实验

配合第5讲“Express分步教程”和“接口设计与调试”。使用Node20.18+，从课程根目录执行：

```bash
cd labs/express-basics
npm ci
npm run dev
```

打开 http://127.0.0.1:3002/api/health 。默认仅监听本机，端口占用可执行 `PORT=3003 npm start`；PowerShell先设置 `$env:PORT=3003`。npm start不自动重启，npm run dev会在修改后重启并清空内存数据。

## 已实现接口

| 方法与路径 | 含义 | 成功状态 |
|---|---|---|
| GET /api/health | 健康检查 | 200 |
| GET /api/cases | 集合查询与分页 | 200 |
| GET /api/cases/:id | 详情 | 200 |
| POST /api/cases | 创建 | 201 + Location |
| PATCH /api/cases/:id | 修改已提交字段 | 200 |
| DELETE /api/cases/:id | 删除 | 204，无响应体 |

创建字段为title、industry、difficulty；难度枚举beginner/intermediate/advanced。拒绝未知字段，标题与行业去首尾空白后校验。PATCH允许这三个字段的非空子集，拒绝空对象和null。

列表筛选kw、industry、difficulty，支持offset默认0、limit默认10且1–50；total为筛选后分页前数量。数字查询严格校验，重复已知键被拒绝；未知查询键忽略。

## 代码地图

- server/start.mjs：启动，读取PORT。
- server/app.mjs：请求编号、日志、JSON解析、路由、错误处理。
- server/cases-router.mjs：资源接口。
- server/validation.mjs：输入规则。
- server/memory-store.mjs：数据读写与分页。
- requests.http：手动调用样例。
- tests/api.test.mjs：接口验证。

## 验证

执行 `npm test`，再使用requests.http或教材curl亲自完成创建、读取、筛选、更新、删除。请求失败先看状态码，再看error.code与X-Request-Id对应的日志。当前为单进程内存演示，刷新浏览器不清空，服务重启清空；没有数据库和认证。需登录及持久化的完整参考实现在相邻course-lab目录。

源码围绕本课案例独立编写，资料依据见相邻backend-resources/READING_GUIDE.md；不是第三方完整项目的镜像。
