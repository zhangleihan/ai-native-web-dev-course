# 第六讲：外部资料与阅读路径

核查日期：2026-10-28。围绕本课案例独立编写正文与实验，参考外部课程的概念顺序和官方文档的机制说明。未整段复制课程讲义、幻灯片或第三方完整项目。

## 核心资料

| 优先级 | 来源与机构 | 指定范围 | 对应本课 |
|---|---|---|---|
| ★★★★★ | [PostgreSQL16 Tutorial](https://www.postgresql.org/docs/16/tutorial.html)，PostgreSQL Global Development Group | Tables、Queries、Joins、Aggregate、Foreign Keys、Transactions | 6主节与6/d；掌握关系与SQL |
| ★★★★★ | [CS50 Web Lecture4 Notes](https://cs50.harvard.edu/web/notes/4/)，Harvard | SQL、Tables、Relationships、Models、Migrations | 建模、关联与结构演进；Django语法不是本课必做 |
| ★★★★☆ | [Full Stack Open关系数据库课程新入口](https://courses.mooc.fi/org/uh-cs/courses/full-stack-open-relational-databases)，University of Helsinki | 模型、关系、迁移；以实际公开页面可访问内容为准 | 对照Node应用的数据层组织 |
| ★★★★☆ | 本机FSO离线markdown/part13a.md、part13b.md、part13c.md | Application database、Model、Connection between tables、Migrations、Many-to-many relationships | 已阅读的旧版课程内容；不用其过时云部署命令 |

原官网Part13分节已变化，旧分节URL本次返回404。官方仓库source分支的part13a.md明确说明已迁移到上述mooc.fi入口，见[迁移说明](https://github.com/fullstack-hy2020/fullstack-hy2020.github.io/blob/source/src/content/13/en/part13a.md)。本课以已下载离线正文交叉参考，不把旧链接伪称为当前完整教程。新入口可能需要额外客户端加载或账号，不绕过登录或访问限制。

## 官方机制参考

| 链接 | 用途 | 阅读后应能验证 |
|---|---|---|
| [PostgreSQL Constraints](https://www.postgresql.org/docs/16/ddl-constraints.html) | 主键、外键、非空、唯一、CHECK | 非法值与无效引用无法入库 |
| [PostgreSQL Joins](https://www.postgresql.org/docs/16/tutorial-join.html) | 内连接与左连接 | 为什么5条案例只匹配3条作者 |
| [PostgreSQL Aggregate](https://www.postgresql.org/docs/16/tutorial-agg.html) | 分组统计 | COUNT(*)与COUNT(column)的不同 |
| [PostgreSQL Transactions](https://www.postgresql.org/docs/16/tutorial-transactions.html) | 原子提交与回滚 | 第二次写入失败不留半成品 |
| [PostgreSQL Isolation](https://www.postgresql.org/docs/16/transaction-iso.html) | READ COMMITTED、REPEATABLE READ | 两条读取是否共享同一快照 |
| [PostgreSQL EXPLAIN](https://www.postgresql.org/docs/16/using-explain.html) | 计划、cost与实际执行 | 不把cost当毫秒，不保证小表走索引 |
| [PostgreSQL Error Codes](https://www.postgresql.org/docs/16/errcodes-appendix.html) | SQLSTATE | 按错误类别而非中文文本判断 |
| [PostgreSQL Date/Time](https://www.postgresql.org/docs/16/datatype-datetime.html) | 时间点与时区显示 | TIMESTAMPTZ不保存原时区名称 |
| [node-postgres Queries](https://node-postgres.com/features/queries) | 值参数 | 引号始终作为数据 |
| [node-postgres Pooling](https://node-postgres.com/features/pooling) | 连接生命周期 | 连接借出后归还 |
| [node-postgres Transactions](https://node-postgres.com/features/transactions) | 同一client事务 | 不混用独立连接写入 |
| [FastAPI SQL Databases](https://fastapi.tiangolo.com/tutorial/sql-databases/) | SQLModel、会话与请求依赖 | ORM不是数据库也不是迁移工具 |
| [psycopg参数](https://www.psycopg.org/psycopg3/docs/basic/params.html) | Python驱动参数语法 | 不把%s写成Python字符串插值 |
| [PGlite入门](https://pglite.dev/docs/) | 嵌入式引擎与文件目录 | 区分本机SQL与服务并发验证 |

## 本课的实现与外部材料差异

核心SQL选用PostgreSQL16文档中的稳定语法；PGlite具体引擎与包版本以实验锁文件为准，不声称与PostgreSQL16服务完全同版。Node使用pg直接SQL，Python只提供对照片段与官方阅读；FastAPI官方SQLModel、FSO的Sequelize不作为本课统一必选依赖。

实验authors是作者资料，不是综合项目users认证模型。API仅提供案例列表、详情、创建；标签与事务通过SQL和数据访问测试学习。复杂本体、运行审计、账号权限与生产备份不在本讲最小实验范围。

## 已验证与待验证

- 已验证：7项本地引擎/HTTP测试，覆盖重复初始化、约束、JOIN/NULL/聚合、参数与分页、失败回滚、文件关闭重开、创建及详情接口。
- 已验证：queries.sql、transaction.sql、plan.sql均实际执行，预期行数与正文对应。
- 未验证：真实PostgreSQL TCP、连接池竞争、多连接锁与隔离、Python数据库连接、备份恢复及公网部署。

外部资料保留各自版权、署名和许可；公开访问不等于无条件再分发。本目录只附阅读链接和本课独立实现，不改变原课或框架许可。
