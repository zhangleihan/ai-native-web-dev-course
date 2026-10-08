# 关系数据库：约束、参数化查询与事务

## 学习目标与课前准备

学完本讲，应能：设计最少必要表；使用参数化 SQL；验证重启后数据保留和事务回滚

先修：第 5 讲 API；具备本地 PostgreSQL 或教师提供的隔离练习库。本讲 2 学时，按每学时 45 分钟安排：回顾与问题导入 10 分钟、概念和示例 30 分钟、课堂练习 40 分钟、讲评与出口检查 10 分钟。课后练习时间不计入 32 学时。


## 从业务事实建模

菜单不是表。先问“什么需要长期保存、如何唯一识别、谁拥有什么”。必做只有 cases；第 8 讲增加 users 与 owner_id，第 14 讲增加 runs、approvals 和 work_orders。复杂 Ontology、访谈、评估版本表等按项目需要选做。

在测试数据库执行一次迁移，并将 SQL 作为版本文件保存。不要手工改完数据库却不记录变更。

```sql
CREATE TABLE cases (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL CHECK (length(trim(title)) BETWEEN 1 AND 100),
  industry TEXT NOT NULL CHECK (length(trim(industry)) BETWEEN 1 AND 50),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner','intermediate','advanced')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

主键标识实体，NOT NULL 和 CHECK 将规则放在数据库边界。后续外键表达归属关系，不能只把 user id 当普通文本。删除策略由业务决定，不能默认级联删除所有历史审计。

## 查询与 API 保持一致

安装 `pg`，用环境变量 DATABASE_URL 初始化连接池。以下为**路由内部片段**，`pool`、`req`、`res` 和字段校验由服务初始化及第 5 讲负责。

```javascript
const {industry = '', difficulty = '', kw = ''} = req.query;
const result = await pool.query(`
  SELECT id, title, industry, difficulty FROM cases
  WHERE ($1 = '' OR industry = $1)
    AND ($2 = '' OR difficulty = $2)
    AND ($3 = '' OR strpos(title, $3) > 0)
  ORDER BY created_at DESC, id
`, [industry, difficulty, kw]);
res.json({items: result.rows, total: result.rows.length});
```

参数与 SQL 结构分离，输入中的引号不会变成 SQL 指令。此处用 `strpos` 保持关键词的字面包含语义；改用 LIKE/ILIKE 时要决定 `%`、`_` 是通配符还是需转义的字符。参数化只能保护值，动态列名和排序字段必须使用允许列表。

## 事务是什么

“批准一次请求并创建一张练习工单”包含多个数据库写操作。若第二步失败，第一步也应回滚，避免出现已批准但无工单的错误状态。

```text
从连接池取得同一个 client
BEGIN
  验证并锁定当前待审批记录
  更新审批状态
  插入工单（请求 id 设置 UNIQUE）
COMMIT；任何异常执行 ROLLBACK；最后释放 client
```

不要用不同连接分别执行 BEGIN 和后续语句。单个数据库事务不能自动回滚外部邮件或第三方 API；那类操作需额外的幂等与补偿设计，本课只在沙箱内建单。

## 如何证明数据库起了作用

POST 创建 → GET 找到 → 重启 API → GET 仍找到；非法 difficulty 直接写 SQL 也被拒绝。索引能加速特定查询，但有写入和空间成本，先确认查询模式再选择索引。课堂小样本无需性能竞赛。


## 自检与参考答案

**问题：** 只在前端判断标题非空够不够？数据库约束又增加了什么？

<details><summary>完成思考后查看参考答案</summary>

不够。前端可绕过；API 校验提供易懂错误，数据库约束防止其他写入路径和程序缺陷破坏数据，两者互补。

</details>

## 阅读定位

[Full Stack Open Part 13：关系数据库](https://fullstackopen.com/en/part13/)（关系、迁移、事务概念；示例 ORM 不强制照搬）。

必读范围是本讲正文；参考材料用于查漏补缺，不要求通读整门外部课程。课堂练习与课后练习见本讲后续小节。
