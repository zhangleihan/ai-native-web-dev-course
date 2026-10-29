# 应用接入数据库：参数、连接与数据访问层

## 1. 保持接口，替换数据入口

第五讲的请求路径与字段仍可保留：GET集合、GET详情、POST创建。发生变化的是路由后面的数据来源，从Map/数组变成SQL查询。

```text
HTTP请求 → Express路由 → API校验 → CaseRepository → SQL执行 → 数据库
响应JSON ← 字段选择与错误处理 ← 查询结果或异常
```

Repository通常译为数据访问层或仓储层。它集中处理查询与结果转换，使路由不需要知道每张表的全部细节。本课独立实现只提供列表、详情和创建，SQL课文中的更新删除不等于API也已经提供这些方法。

## 2. 运行持久化案例API

先完成SQL教程的migrate和seed，再从`labs/database-basics`执行：

```bash
npm start
```

默认 http://127.0.0.1:3003/api/health 返回storage=pglite。与第五讲3002端口不同，不要误查旧内存服务。首次安装与数据迁移见[实验README](labs/database-basics/README.md)。

另开终端创建案例：

```bash
curl -i -X POST http://127.0.0.1:3003/api/cases \
  -H 'Content-Type: application/json' \
  -d '{"title":"持久化验证","industry":"通信","difficulty":"beginner"}'
```

记录id与Location，停止服务，重新npm start，查询该Location。默认文件型数据应仍在；如果只刷新浏览器，尚未测试服务重启。如果切换LAB_DATA_DIR，得到的是另一个数据目录，也不能据此判断数据丢失。

默认嵌入式路线不要同时运行SQL脚本与API，它们是不同进程并会竞争同一数据目录。需要并发客户端访问时使用真正的PostgreSQL服务路线。

## 3. 参数化查询：值与SQL结构分开

```javascript
const result = await db.query(
  'SELECT id,title,industry,difficulty FROM cases WHERE id=$1',
  [id]
);
const item = result.rows[0];
```

db是数据访问适配器，id已经通过API格式检查。$1是第一个值参数的占位符，不能写成带引号的字符串 `'$1'`。查询文本保持不变，用户值单独交给驱动。[node-postgres参数查询](https://node-postgres.com/features/queries)

关键词含引号并不是错误。比如O'Reilly应作为普通标题保存；试图提交 `' OR 1=1 --` 也只应被当作关键词，而不能改变WHERE条件。不要用模板字符串把网络输入拼入SQL。

参数用于值，不用于表名、列名或ASC/DESC等结构。动态排序可通过固定映射选择SQL片段，例如只允许created/title两个排序键；未列出的值直接拒绝。避免把“用了$1”误认为整个动态查询都已安全。

## 4. 创建后直接返回写入表示

```javascript
const result = await db.query(`
  INSERT INTO cases(id,title,industry,difficulty)
  VALUES($1,$2,$3,$4)
  RETURNING id,title,industry,difficulty
`, [randomUUID(),fields.title,fields.industry,fields.difficulty]);
return result.rows[0];
```

这是repository中的核心片段，randomUUID已导入，fields来自API校验。服务端生成编号，数据库维护约束和创建时间，RETURNING取得本次写入对象。

只选择接口允许返回的字段，避免使用SELECT *后原样发送。数据库内部新增列时，接口未必应自动新增字段。数据库错误也应经过应用映射后再返回。

## 5. 筛选、分页与同一快照

配套实现先计算筛选后的COUNT，再执行带LIMIT/OFFSET的查询。WHERE条件必须一致；否则total与items可能来自不同筛选范围。

```sql
WHERE ($1='' OR strpos(title,$1)>0)
  AND ($2='' OR industry=$2)
  AND ($3='' OR difficulty=$3)
ORDER BY created_at,id
LIMIT $4 OFFSET $5
```

此处三个值依次为kw、industry、difficulty；LIMIT与OFFSET也经过范围校验。COUNT结果在驱动中可能采用字符串等表示，本实验以 `COUNT(*)::int` 明确转换为适合小型教学数据的整数，不能直接推广到超大数量统计。

两条SELECT即使在同一个默认READ COMMITTED事务中，也可能分别观察到不同的已提交数据。配套list在只读REPEATABLE READ事务内读取COUNT与页面，使二者使用同一快照。这是帮助说明一致性的选择；真实系统也可以采用单条查询或其他分页契约，应结合负载分析。

## 6. 连接池与事务连接

PostgreSQL服务路线通过pg.Pool复用连接，而不是每个请求都创建新连接。普通单条查询可使用pool.query；事务需要取得一个client，在同一client上执行所有语句，最后归还。[连接池](https://node-postgres.com/features/pooling)、[事务连接](https://node-postgres.com/features/transactions)

```javascript
const client = await pool.connect();
try {
  await client.query('BEGIN');
  const result = await work(client);
  await client.query('COMMIT');
  return result;
} catch (error) {
  await client.query('ROLLBACK');
  throw error;
} finally {
  client.release();
}
```

这是事务包装函数内部的模式，pool和work由外围提供。忘记release会耗尽池；用不同pool.query执行BEGIN与后续写入，可能落在不同连接上，无法构成一条事务。

本实验的database.mjs把两种路线包装成query、exec、transaction、close。PGlite使用自身事务API，PostgreSQL使用同一连接的BEGIN/COMMIT/ROLLBACK，方便比较共同抽象与不同承载方式。

## 7. 切换到PostgreSQL服务

已有隔离练习数据库时，用真实配置设置DATABASE_URL。连接字符串含凭据，不放入课件源码、浏览器或Git仓库。

从实验目录执行：

```bash
# 按自己独立练习库的配置设置，不要照抄占位内容连接真实业务库
export LAB_STORAGE=postgres
export DATABASE_URL='postgresql://练习用户:练习口令@127.0.0.1:5432/独立练习库'
npm run migrate
npm run seed
npm start
```

Windows设置环境变量的语法不同，可按终端使用 `$env:DATABASE_URL='实际练习连接串'`。只给该实验使用空的练习库，因为迁移会创建authors/cases/tags/case_tags等表；不要与综合course-lab共用已有表。

健康检查应显示storage=postgres，并实际执行SELECT 1。迁移、创建和重启后读取都要在此模式单独验证；嵌入式测试通过不能替代TCP连接或连接池验证。本次环境未安装PostgreSQL服务或Docker，因此服务路线保留为待执行项。

## 8. FastAPI如何使用数据库驱动

Python同样需要数据访问层。psycopg3的值占位符通常为%s，不是pg的$1；参数单独传入序列。下面是数据库访问片段，conn是已建立的连接：

```python
with conn.cursor() as cur:
    cur.execute(
        "SELECT id,title,industry,difficulty FROM cases WHERE id=%s",
        (case_id,),
    )
    row = cur.fetchone()
```

单元素元组需要逗号；不能改成Python f-string或字符串格式化。参数占位符的写法由驱动决定，不是所有数据库程序都使用同一种语法。[psycopg参数说明](https://www.psycopg.org/psycopg3/docs/basic/params.html)

FastAPI可用带yield的依赖管理一次请求所用连接或会话，在结束时释放；写入应在明确事务边界提交后再返回成功。这里没有额外提供和验证Python PostgreSQL服务，先掌握连接生命周期与错误传播，再按官方教程完成Python接入。

## 9. ORM、驱动与迁移的关系

| 层次 | 直接SQL路线 | ORM路线 | 应理解的边界 |
|---|---|---|---|
| 连接与协议 | pg、psycopg | ORM底层仍使用驱动 | 不等于数据库服务 |
| 查询表达 | SQL字符串加参数 | 模型、查询构造器等 | 都需要理解生成的SQL |
| 数据表示 | 行对象、字典 | 模型对象 | 不能自动判断哪些字段可公开 |
| 结构演进 | 版本SQL文件 | 迁移工具 | 模型变化不等于已升级已有库 |
| 事务 | 显式边界 | Session/事务上下文 | 仍需定义原子业务操作 |

FastAPI官方数据库教程使用SQLModel组织模型与会话，Helsinki Part13使用Sequelize。可以选一种与项目相符的方案，不必在同一讲学习所有ORM。[FastAPI关系数据库教程](https://fastapi.tiangolo.com/tutorial/sql-databases/)

ORM能够减少重复映射，但不会免除外键、事务、索引和查询计划。自动create_all等建表操作也不能替代生产结构迁移；返回对象时还应使用明确的响应模型。

## 10. 故障定位与验证

| 现象 | 首先检查 | 不能据此断定 |
|---|---|---|
| 数据重启后消失 | storage模式与数据目录 | 所有数据库都不持久化 |
| 连不上服务 | 地址、端口、账号、库名、服务状态 | SQL语法错误 |
| 表不存在 | 是否在正确库执行迁移 | 框架一定没安装好 |
| 23514 | CHECK规则与提交字段 | 数据库服务不可用 |
| 请求一直等待 | 是否归还连接、是否持有锁 | 前端必须加长超时 |
| total与页面不一致 | 筛选、分页及查询快照 | 一定是React state问题 |

运行npm test验证本地SQL与API行为；再手工创建并重启。数据库连接故障应转成可解释的服务失败，同时保留足够服务端诊断信息，不把内部连接字符串发送给客户端。

## 自检与参考答案

<details><summary>为什么参数化查询中的表名不能直接作为$1传入？</summary><p>值参数用于数据值，不是SQL语法中的标识符。动态表名、排序等应采用允许列表或驱动支持的标识符处理方式。</p></details>

<details><summary>两条SELECT放在一个事务里就必定看到完全相同快照吗？</summary><p>取决于隔离级别。PostgreSQL默认READ COMMITTED可在每条命令获取新快照，本实验使用只读REPEATABLE READ进行一致的列表统计。</p></details>

## 阅读定位

★★★★★ [node-postgres Queries](https://node-postgres.com/features/queries)、[Pooling](https://node-postgres.com/features/pooling)、[Transactions](https://node-postgres.com/features/transactions)：直接对应实验代码。

★★★★☆ [FastAPI SQL Databases](https://fastapi.tiangolo.com/tutorial/sql-databases/)：理解请求依赖、会话与模型，不将其SQLite演示的所有配置直接套到PostgreSQL。
