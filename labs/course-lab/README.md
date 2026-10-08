# 案例库：全栈与受控 AI 教学实验

这是配合第4–15讲的**参考实现与实验起点**。React → 同源 Express API → 数据存储 → 会话/授权 → 模拟诊断 → 单Agent工具提案 → 管理员审批 → 练习工单。它补齐课堂骨架，不是生产平台，也没有调用真实大模型。

## 10分钟内启动（无需 Docker / 数据库 / 模型账号）

需要 Node.js 20.18+（推荐22）与 npm。首次安装需要网络；依赖在 package-lock.json 锁定。

```bash
# 从 ai-native-web-dev-course 仓库根目录执行
cd labs/course-lab
npm ci --ignore-scripts
node scripts/init-env.mjs
npm run dev
```

打开 http://127.0.0.1:3001 。`.env` 中 `LAB_PASSWORD` 是 alice、bob、admin 三个练习账号的口令；初始化脚本生成随机值且不覆盖已有文件。只用练习身份，不上传真实业务材料。

- 默认 **memory**：不持久化，重启会重新准备两条固定案例和三个用户；界面明确提示。
- `npm run build` 构建 React；`npm start` 同时提供页面和 `/api`，无需跨源代理。修改前端后重新 build 并刷新。
- 教材静态站点仍在8766，实验站点在3001；不要向教材静态服务器发 `/api`。
- 端口冲突时同时修改 `.env` 的 PORT 与 PUBLIC_ORIGIN。浏览器始终使用配置的源，例如127.0.0.1，不混用localhost。

## 一条完整演示路径

1. 以 alice 登录，筛选并选中“链路中断”，观察 GET /api/cases。
2. 创建自己的案例，刷新重查；内存模式的重启丢失是预期现象。
3. 选择“正常证据”生成模拟建议，再选择“伪造证据”观察502被界面展示。
4. 点击“申请练习工单”，状态停在 WAITING_APPROVAL，工单尚未创建。
5. 退出后以 admin 登录，批准或拒绝提案。批准后只有一张工单；拒绝不建单。
6. 展开运行轨迹，观察SSE。它推送已保存事件与状态，不是模型token流。
7. `npm test` 验证越权、重复批准和失败边界；不只看按钮或截图。

## PostgreSQL 持久化路线

**路线A：有 Docker Compose。** 在当前实验目录完成 `.env` 初始化后：

```bash
docker compose up --build
# 另一个终端停止/恢复；数据库卷保留
docker compose stop
docker compose start
```

数据库不发布宿主机端口，Web只发布到127.0.0.1。首次启动自动执行幂等迁移和seed；已有同名账号的密码不被seed覆盖。修改LAB_PASSWORD不会自动重置数据库中已有密码。

创建一条案例后执行 `docker compose up --build --force-recreate web`，再登录确认记录保留。`docker compose down` 保留卷；不要把删除卷当作重启。当前交付环境未安装Docker，此路线需在授课机执行本段验收。

**路线B：已有隔离 PostgreSQL。** 创建全新的练习库，设置 `.env`：`LAB_STORAGE=postgres` 与 `DATABASE_URL`。执行：

```bash
npm run migrate
npm run seed
npm run build
npm start
```

数据库中保存案例、用户、会话、运行、审批与工单。schema在 `sql/001_initial.sql`；数据库URL及SESSION_SECRET只在服务端。

## 代码地图

| 文件 | 解释的问题 |
|---|---|
| client/main.jsx、api.js | React状态、筛选、错误反馈、会话与SSE |
| server/app.mjs | REST契约、CSRF、认证、授权、事件流 |
| server/domain.mjs | 运行时输入校验、权限与状态规则 |
| server/memory-store.mjs | 单进程内存适配器；重启丢失 |
| server/pg-store.mjs、sql/ | 参数化SQL、外键、事务、FOR UPDATE与唯一约束 |
| server/ai.mjs | 固定mock适配器、输出验证、工具允许列表和步数限制 |
| tests/api.test.mjs | HTTP负向场景、会话失效、内存并发重复批准 |
| tests/storage.test.mjs | PGlite中的SQL约束、事务回滚与工具失败 |
| ci/course-lab.yml | 可复制启用的CI模板，尚未在GitHub运行 |

## 实现边界

- 所有案例是公开教学样本；更新须本人或管理员，run/工单仅本人或管理员可读。真实私有案例需在查询和检索层增加访问策略。
- 采用express-session与bcryptjs。登录轮换会话，写请求校验会话CSRF token及浏览器Origin。Cookie在本机HTTP使用HttpOnly/SameSite=Lax；不是HTTPS上线配置。
- 未登录请求若先失败于CSRF会返回403；已有有效CSRF但未登录则写接口返回401。401与403是不同检查层的结果。
- 工具参数从已保存提案读取，审批不能提交替换参数。SQL模式在同一事务内锁run、写审批和沙箱工单。建单失败回滚，run保持待审批便于重试，不能假报成功。
- mockPlanner固定选择工具，证明harness边界，不证明真实模型自主规划。实际LLM适配器、调用预算、登录限速、密码重置、生产观测和多租户隔离不在此参考实现中。
- 客户端或订阅断开不取消run；本实现没有取消接口。拒绝待审批提案是显式业务操作。
- SSE按trace id去重/续传，单次最多30秒；结束后点“刷新运行列表”重新订阅。部署代理仍需另行验证。

## 验证命令与范围

```bash
npm test
npm run build
# 合并执行
npm run check
```

API测试使用临时本机端口与隔离内存数据；SQL测试使用PGlite（PostgreSQL的WASM实现），执行真实SQL语法和事务，但**不等于已测试外部PostgreSQL连接池、跨连接竞争或Docker网络**。这些项目按 `WORKSHEETS.md` 的部署检查补验。

学生任务与分层验收见 [WORKSHEETS.md](WORKSHEETS.md)，填写 [EVALUATION_TEMPLATE.md](EVALUATION_TEMPLATE.md) 记录证据。本目录代码为本课程新增示例，依赖许可证见各包；没有复制官方教程全文。
