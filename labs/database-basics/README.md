# 第六讲：关系数据库与持久化API实验

使用Node20.18+，从课程根目录执行：

```bash
cd labs/database-basics
npm ci
npm run migrate
npm run seed
npm run sql -- sql/queries.sql
npm start
```

默认在.data保存PGlite文件数据；API只监听本机3003。GET http://127.0.0.1:3003/api/health 可确认storage=pglite。PGlite是PostgreSQL的WASM嵌入式实现，适合SQL与文件持久化练习，不能代替PostgreSQL网络连接、多连接并发或生产恢复验证。

修改PORT可选择空闲端口。不要在API运行时用另一个进程操作同一.data；先停止服务，再执行迁移、种子和SQL脚本。换LAB_DATA_DIR得到另一份数据，停止或重启服务本身不会清空原数据。

## 已提供内容

| 文件 | 用途 |
|---|---|
| sql/001_schema.sql | 作者、案例、标签、关联表及约束 |
| sql/seed.sql | 5案例、3作者、3标签、4关联 |
| sql/queries.sql | 筛选、连接、计数与NULL |
| sql/transaction.sql | 修改并回滚，恢复原标题 |
| sql/plan.sql | 组合索引与EXPLAIN |
| server/repository.mjs | 参数化查询与事务 |
| server/database.mjs | 文件型PGlite/pg连接适配器 |
| server/schema.mjs | 最小版本迁移与种子执行 |
| server/app.mjs | 列表、详情、创建API |
| tests/database.test.mjs | SQL、持久化与接口验证 |

API校验复用相邻express-basics/server/validation.mjs，因此从完整课程仓库运行；不需要安装相邻实验的依赖。数据库表与综合course-lab模型不同，不混用SQL文件或已有数据库。

## 接口与验证

- GET /api/cases：kw、industry、difficulty、offset、limit；返回items/total/offset/limit。
- GET /api/cases/:id：详情；非UUID为400，合法但缺失编号为404。
- POST /api/cases：title、industry、difficulty；201和Location。
- 更新、删除只在SQL练习中提供示例，HTTP尚未实现PATCH/DELETE。

执行npm test。手工创建记录并保存Location，停止后重新npm start，读取该Location。先停止API，再运行 `npm run sql -- sql/transaction.sql` 和 `npm run sql -- sql/plan.sql`。

迁移只有001的最小版本执行器，重复运行跳过；seed按固定id避免重复，不覆盖已有记录。修改已执行的001不会升级旧库。没有提供一键删库或重置；练习时可通过LAB_DATA_DIR选择新的独立目录。

## PostgreSQL服务路线

使用已有独立空练习库，同时设置LAB_STORAGE=postgres和DATABASE_URL后执行同样的migrate、seed、start命令。健康检查应为storage=postgres；连接池与事务代码位于database.mjs。连接配置仅保存在服务端环境，不提交凭据。没有自动安装Docker或启动系统服务。

## 验证范围

2026-10-28，Node20.18环境验证7项测试及查询、回滚、计划脚本。文件型引擎关闭再打开后记录仍可读取。PostgreSQL TCP、真实连接池和多连接并发未在本次环境执行；Python数据库连接仅提供官方阅读与代码片段。

官方资料与阅读顺序见READING_GUIDE.md。
