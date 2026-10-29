# 事务、迁移与索引：让数据变化可解释

## 1. 从两次写入发现事务需求

创建一条案例，再把它与标签关联，是两条或多条SQL。如果案例已插入，标签编号却不存在，直接逐条写入会留下没有预期关联的记录。

事务将相关操作组成一个提交单元。全部成功再提交；发生异常则回滚。本实验用“创建案例并关联标签”演示；综合项目中的“记录审批并创建工单”也有同样的一致性需求。

```text
BEGIN
  插入案例
  插入案例—标签关联
COMMIT

任一步失败 → ROLLBACK → 不保留本次案例及关联
```

数据库事务只能覆盖参与该事务的数据库写入，不能自动撤回邮件、模型调用或第三方API副作用。涉及外部系统时，需要另行设计幂等和补偿。[PostgreSQL事务教程](https://www.postgresql.org/docs/16/tutorial-transactions.html)

## 2. ACID对应哪些观察

| 属性 | 中文含义 | 本课理解 |
|---|---|---|
| Atomicity | 原子性 | 案例和标签关联一起成功或一起撤销 |
| Consistency | 一致性 | 已定义约束不能被成功提交的数据破坏 |
| Isolation | 隔离性 | 并发事务之间按隔离规则相互观察 |
| Durability | 持久性 | 已提交结果在所承诺的存储与故障模型下保留 |

一致性不能简单理解为“业务永远正确”：如果没有定义需要的规则，数据库也不能自动推断它。持久性同样受引擎配置、存储介质和故障恢复机制影响，本机重启演示只验证相应范围。

## 3. 亲自验证回滚，而不是只读BEGIN

执行 `npm run sql -- sql/transaction.sql`，脚本先把固定样本改为临时标题，读出它，再ROLLBACK，最后重新读取。预期最后仍是原来的“链路中断”。

配套测试进一步执行真实失败：创建案例后关联一个不存在的标签，触发外键错误；随后确认案例总数不变、没有留下关联。这比单纯检查返回500更能证明原子性。

```javascript
return db.transaction(async tx => {
  const item = await new CaseRepository(tx).create(fields);
  for (const tagId of tagIds) {
    await tx.query('INSERT INTO case_tags(case_id,tag_id) VALUES($1,$2)', [item.id,tagId]);
  }
  return item;
});
```

这是repository中的createWithTags片段。所有语句使用tx；如果内部create仍然走外部连接，它就可能提前提交，回滚无法覆盖。这也是数据访问层要接受事务上下文的原因。

## 4. 事务不等于没有并发问题

两人同时读取标题并各自保存，后一写入可能覆盖前一修改。原子性保证每次提交的整体性，却不会自动表达“只能修改我看到的那个版本”。

可选方案包括版本号的乐观并发控制：UPDATE时同时检查id和version，成功后version加一；影响0行时说明记录不存在或版本已变，需要按规则处理。另一方案是在事务中使用SELECT ... FOR UPDATE锁定需要修改的行。

```sql
-- 结构示意：需要先有version列，本实验未提供此列。
UPDATE cases SET title=$1,version=version+1
WHERE id=$2 AND version=$3
RETURNING id,title,version;
```

不要把这个参数SQL直接作为独立文件运行，$1等由驱动提供。锁的范围、持有时间和访问顺序会影响等待与死锁；所有更新路径都需要遵守相应规则，不能只在一个按钮后加锁就声称解决了并发。

PostgreSQL使用多版本并发控制组织读取。REPEATABLE READ使本事务读取快照稳定，但仍可能需要在冲突时重试；SERIALIZABLE也不表示程序无需处理重试。PGlite本次单连接练习没有验证这些多连接竞争行为。[PostgreSQL MVCC](https://www.postgresql.org/docs/16/mvcc-intro.html)

## 5. 重复操作与唯一约束

同一案例重复关联同一标签，应由联合主键阻止。综合项目中一个运行只能创建一张工单，可对run_id设置UNIQUE，并结合事务检查审批状态。

“先SELECT确认不存在，再INSERT”在并发下可能两个请求都看到不存在，因而不能替代数据库唯一约束。应用捕获唯一冲突后，可以按契约返回409或读取已有结果；两种行为取决于业务定义。

事务解决一组写入的整体性；唯一约束维护不重复事实；幂等设计处理同一操作的重复请求。它们有关联，却不应混用名称。

## 6. 迁移：把结构变化保存成历史

第一次部署需要建表，下一次可能新增字段、索引或约束。迁移把每次结构变化写成有序版本，并记录哪些已经执行。种子数据则是提供演示或初始化内容，二者职责不同。

本实验的migrate在事务中建立schema_migrations，检查001是否存在，首次才执行001_schema.sql并登记。以后再次运行跳过已执行版本；修改旧001文件不会自动修改已有库。需要变更时应增加新版本并扩展迁移执行器。

```text
空练习库 → 001建初始表 → 登记001
已有001  → 跳过001
后续需要描述字段 → 新增002迁移 → 执行并登记002
```

本实验只提供001的最小执行器，供理解版本机制；没有实现生产迁移工具的并行锁、完整版本发现和回退系统。不要让多个实例同时运行这个简化初始化器。

添加NOT NULL列前还需处理已有行。可分阶段增加可空列、回填历史数据、验证后增加约束；不能只考虑空数据库上CREATE TABLE能成功。

结构回退不一定能恢复业务数据。删列可能使数据丢失，备份与恢复演练有独立作用。不要把“迁移成功”当作“备份有效”。CS50 Web的模型与迁移内容有助于建立这种演进认识。[CS50 Web Lecture4](https://cs50.harvard.edu/web/notes/4/)

## 7. 索引：由查询需求决定

索引是辅助查找的数据结构，会占空间并增加写入维护成本。主键和唯一约束通常建立相应唯一索引，但外键声明不会自动为引用列建立所有需要的访问索引。

本课列表按行业过滤，再按创建时间和id排序，可观察组合索引：

```sql
CREATE INDEX cases_industry_created_idx ON cases(industry,created_at,id);
```

索引列顺序与查询方式有关，不能把三个单列索引简单等同于一个组合索引。包含式关键词查询`strpos(title,kw)>0`也不会自动受益于普通title B-tree索引；复杂文本检索需另选方案。

不要因为字段出现在JSON里就给每列加索引。先确认常见WHERE、JOIN和ORDER BY，再观察执行计划与实际负载。

## 8. 读懂EXPLAIN的最小信息

执行 `npm run sql -- sql/plan.sql`，该练习建立索引、更新统计并查看查询计划。观察使用Sequential Scan还是Index Scan、估计行数、过滤条件和排序步骤。

```sql
EXPLAIN
SELECT id,title FROM cases
WHERE industry='通信'
ORDER BY created_at,id LIMIT 10;
```

五条样本的表很小，顺序扫描完全可能比索引更划算。不要把“没有用索引”直接判为错误；也不要把EXPLAIN中的cost误读为毫秒。[PostgreSQL EXPLAIN](https://www.postgresql.org/docs/16/using-explain.html)

EXPLAIN ANALYZE会真正执行语句并记录观测时间。若用于UPDATE/DELETE，写入也会发生；本讲只对SELECT进行观察，不能随意对业务库执行分析命令。

## 9. 从验证记录判断能力范围

| 验证 | 能说明 | 仍不能说明 |
|---|---|---|
| 关闭并打开文件型数据目录 | 本实验文件持久化 | PostgreSQL服务的备份与恢复 |
| 违反CHECK被拒绝 | 该值规则生效 | 所有业务规则都正确 |
| 第二步失败总数不变 | 该操作事务回滚 | 外部邮件等副作用可回滚 |
| 相同联合主键被拒绝 | 关系不重复 | API自动具备完整幂等性 |
| 小表查看计划 | 能解释计划结构 | 大规模性能已达标 |

学习中应分别记录嵌入式SQL验证、PostgreSQL服务验证和多连接并发验证。没有执行的部分写“未验证”，不要用相似环境的结果替代。

## 自检与参考答案

<details><summary>为什么事务内的create不能使用另一个独立连接？</summary><p>事务属于连接。外部连接可能已独立提交，当前事务回滚无法撤销那次写入。</p></details>

<details><summary>迁移脚本重复运行不报错，是否说明修改旧脚本会更新已有结构？</summary><p>不代表。版本已经登记后会跳过旧版本，应增加新迁移明确描述变更。</p></details>

<details><summary>给title加普通索引就能加快任意包含查询吗？</summary><p>不能，索引的结构和查询操作要匹配。包含文本搜索通常需要额外检索策略，并通过计划和测量判断。</p></details>

## 阅读定位

★★★★★ [PostgreSQL事务](https://www.postgresql.org/docs/16/tutorial-transactions.html)与[node-postgres事务连接](https://node-postgres.com/features/transactions)：配合回滚实验。

★★★★☆ [PostgreSQL EXPLAIN](https://www.postgresql.org/docs/16/using-explain.html)：只读Basics与ANALYZE的区别；结合自己的输出，不照抄他人计划数字。
