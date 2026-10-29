# SQL分步教程：建表、查询、连接与统计

## 1. 启动可以观察结果的练习环境

从课程仓库根目录执行，使用Node20.18+：

```bash
cd labs/database-basics
npm ci
npm run migrate
npm run seed
npm run sql -- sql/queries.sql
```

默认使用实验目录下.data中的文件型PGlite，首次安装需要网络。migrate执行表结构迁移，seed插入固定样本，sql执行指定SQL文件。执行时应先停止正在使用同一.data目录的API服务；该嵌入式练习不支持两个独立进程同时打开同一目录。

迁移与种子可重复运行：已执行的迁移被跳过，固定编号样本不重复插入。seed不会恢复你改过的样本字段，也不会清除新记录；因此下面的预期结果以初始样本为准。

| 初始样本 | 数量与特点 |
|---|---|
| authors | 3名作者，陈同学没有案例 |
| cases | 5条案例，通信3、电力1、零售1 |
| tags | 网络、排障、业务 |
| case_tags | 4条关联，链路中断有2个标签 |
| author_id为空 | 订单延迟、备用链路未切换 |

需要尝试写入时，将自己的语句保存为SQL文件，再用同一命令执行。只在本课程独立练习库中操作。

## 2. 建表：把规则写在数据入口

`sql/001_schema.sql`中的核心表如下：

```sql
CREATE TABLE cases (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL CHECK (length(trim(title)) BETWEEN 1 AND 100),
  industry TEXT NOT NULL CHECK (length(trim(industry)) BETWEEN 1 AND 50),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner','intermediate','advanced')),
  author_id UUID REFERENCES authors(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

这是迁移文件中的一部分，authors必须先建立，完整迁移也会创建标签与关联表。不要在已迁移的库中再次单独执行同名CREATE TABLE；重复运行应通过迁移脚本完成。

CREATE TABLE定义结构，不会产生案例记录。DEFAULT在插入时没有提供相应值的情况下生效；它不会强制覆盖客户端显式传入的值。应用仍要明确哪些字段允许写入。

## 3. INSERT：增加一条明确的记录

把下面内容保存为`sql/my-insert.sql`后运行：

```sql
INSERT INTO cases(id,title,industry,difficulty)
VALUES ('90000000-0000-0000-0000-000000000001','课堂新案例','通信','beginner')
RETURNING id,title,created_at;
```

列名与VALUES按位置对应；省略author_id得到NULL，省略created_at使用默认值。RETURNING让调用方直接取得写入结果，避免再猜测编号或另查“最新一条”。

重复运行相同id会因主键冲突失败，这是有意的约束验证。不要用“每次先删全部数据”来绕过冲突；可换一个新的练习编号，或理解ON CONFLICT的具体语义。

## 4. SELECT、WHERE与ORDER BY

```sql
SELECT title,industry,difficulty
FROM cases
WHERE industry='通信' AND difficulty='intermediate'
ORDER BY created_at,id;
```

SELECT选择需要的列，FROM选择数据来源，WHERE过滤行，ORDER BY给出顺序。初始样本返回“吞吐下降”和“备用链路未切换”。输出列的顺序由SELECT决定，不影响底层存储的身份。

字符串字面值使用单引号；双引号用于标识符。未加引号的PostgreSQL标识符通常折叠为小写，入门阶段用小写snake_case命名可以减少额外引用。

```sql
SELECT title FROM cases WHERE strpos(title,'链路')>0 ORDER BY id;
```

本例把关键词按字面包含匹配。LIKE/ILIKE中 `%` 和 `_` 有通配符意义，选择它们时要先确定产品需要通配搜索还是字面搜索。参数化保护SQL结构，但不会自动取消通配语义。

## 5. LIMIT与OFFSET：列表总数不是本页长度

```sql
SELECT id,title FROM cases WHERE industry='通信'
ORDER BY created_at,id LIMIT 1 OFFSET 1;

SELECT COUNT(*)::int AS total FROM cases WHERE industry='通信';
```

初始第一条查询返回通信集合的第二条“吞吐下降”，第二条查询得到3。OFFSET表示跳过多少条，LIMIT表示最多取多少条。API应把total和items分别返回，不用当前页长度冒充匹配总数。

created_at可能相同，再按唯一id排序可获得确定次序。确定排序不等于分页期间数据不会变化；频繁写入时还需讨论快照或游标分页。

## 6. UPDATE与DELETE：先确认目标

先SELECT相同WHERE范围，再执行写入。下面只针对自己新增的固定测试id：

```sql
UPDATE cases SET title='课堂案例修订'
WHERE id='90000000-0000-0000-0000-000000000001'
RETURNING id,title;

DELETE FROM cases
WHERE id='90000000-0000-0000-0000-000000000001'
RETURNING id;
```

没有WHERE的UPDATE或DELETE会作用于全部行。SQL执行成功但返回0行，表示没有匹配记录，API应根据契约决定404等结果，而不是总返回“保存成功”。本实验的HTTP接口尚未提供PATCH/DELETE，这里的更新删除通过SQL学习。

## 7. NULL的判断与展示

```sql
SELECT title FROM cases WHERE author_id IS NULL ORDER BY id;
```

初始返回2条。比较表达式涉及NULL时，常得到未知而非true，因此使用IS NULL/IS NOT NULL。`COALESCE(a.username,'未指定')`可用于展示缺省文字，但不要把这个展示文字再写回外键列。

COUNT(*)统计行，COUNT(column)跳过该列为NULL的行。它们在LEFT JOIN中会出现关键区别。

## 8. JOIN：重组分表后的信息

```sql
SELECT c.title,a.username
FROM cases AS c
JOIN authors AS a ON a.id=c.author_id
ORDER BY c.id;
```

INNER JOIN只保留匹配行，初始得到3条有作者的案例。`c`、`a`是别名，用于说明列来自哪一张表，避免同名id混淆。

将JOIN改为LEFT JOIN，左侧5条案例都保留；未指定作者的username为NULL。选择连接方式，应先问业务是否需要保留无关联记录，而不是习惯性使用JOIN。[PostgreSQL连接教程](https://www.postgresql.org/docs/16/tutorial-join.html)

注意下面两个条件位置的差异：

```sql
-- 保留所有案例，只匹配姓名为林同学的作者，其他作者列为NULL。
SELECT c.title,a.username FROM cases c
LEFT JOIN authors a ON a.id=c.author_id AND a.username='林同学';

-- 再过滤连接结果，只剩林同学的案例。
SELECT c.title,a.username FROM cases c
LEFT JOIN authors a ON a.id=c.author_id WHERE a.username='林同学';
```

不要把WHERE中的右表过滤误认为仍会保留所有左表记录。配套练习可分别数行数，解释未指定作者的案例去了哪里。

## 9. GROUP BY与HAVING：从记录得到统计

```sql
SELECT industry,COUNT(*)::int AS total
FROM cases GROUP BY industry
HAVING COUNT(*)>=2
ORDER BY total DESC,industry;
```

GROUP BY按行业形成分组，COUNT计算组内行数，HAVING在分组后筛选。初始只保留通信3条。WHERE过滤分组前的行，HAVING过滤聚合后的组。[PostgreSQL聚合教程](https://www.postgresql.org/docs/16/tutorial-agg.html)

从业务结果推理时，可按“FROM/JOIN形成来源 → WHERE过滤 → GROUP BY聚合 → HAVING过滤组 → SELECT形成输出 → ORDER BY/LIMIT”理解；这是概念上的处理顺序，不是数据库物理执行计划。

```sql
SELECT a.username,COUNT(c.id)::int AS total
FROM authors a LEFT JOIN cases c ON c.author_id=a.id
GROUP BY a.id,a.username ORDER BY a.id;
```

初始输出林同学2、梅同学1、陈同学0。若改用COUNT(*)，陈同学保留的连接占位行也会被计数，从而错误得到1。

## 10. 多对多关系与重复计数

```sql
SELECT c.title,t.name AS tag
FROM cases c
JOIN case_tags ct ON ct.case_id=c.id
JOIN tags t ON t.id=ct.tag_id
ORDER BY c.id,t.name;
```

初始返回4条关联，其中链路中断出现两次。它不是重复案例，而是同一案例对应两个标签。COUNT(*)此时数的是关联行，若要案例数量，需根据查询目的采用COUNT(DISTINCT c.id)或先聚合。

case_tags的联合主键使同一case_id与tag_id组合不能重复，但两个不同标签可以分别关联同一案例。关系建模决定约束，查询决定结果的行含义。

## 11. 约束失败也要亲自观察

用新测试id尝试写入全空格标题、非法difficulty、未知author_id以及重复username。分别对应CHECK、外键或唯一约束失败。再查询集合，确认错误没有插入半条记录。

PostgreSQL错误通常附带SQLSTATE。23502表示NOT NULL，23503表示外键，23505表示唯一约束，23514表示CHECK；应用可按类别映射可读错误，但不要把原始数据库连接信息与完整堆栈返回前端。

单条SQL通常在一个事务上下文中执行。显式BEGIN后某条语句失败，事务会进入错误状态，需ROLLBACK或适当保存点恢复；不能盲目继续发送COMMIT来声称全部成功。

## 自检与参考答案

<details><summary>为什么LEFT JOIN后再WHERE右表姓名，会丢失未指定作者的案例？</summary><p>这些行右表字段是NULL，不满足姓名等于某值的条件，因此被后续WHERE过滤。</p></details>

<details><summary>COUNT(*)与COUNT(c.id)什么时候不同？</summary><p>LEFT JOIN为没有匹配案例的作者保留一行，COUNT(*)会计数，COUNT(c.id)不会统计NULL，因此后者能得到零。</p></details>

<details><summary>关联标签后案例出现两次，要马上用DISTINCT去掉吗？</summary><p>先明确结果每行表达什么。若每行是一条案例标签关系，两行是正确的；只有需要唯一案例集合时才按该目标去重。</p></details>

## 阅读定位

★★★★★ [PostgreSQL SQL教程](https://www.postgresql.org/docs/16/tutorial-sql.html)：建表、插入、查询、连接、聚合、更新和删除。

★★★★☆ [CS50 Web SQL讲义](https://cs50.harvard.edu/web/notes/4/)：对照关系表、查询与模型，观察同一概念在其他框架中的表达。
