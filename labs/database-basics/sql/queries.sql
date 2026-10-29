-- 1. 投影、筛选、稳定排序与分页；初始返回“链路中断”“吞吐下降”。
SELECT id,title,industry,difficulty FROM cases
WHERE industry='通信' ORDER BY created_at,id LIMIT 2 OFFSET 0;
-- 2. 左连接保留未指定作者的案例；初始5行。
SELECT c.title,a.username FROM cases c LEFT JOIN authors a ON a.id=c.author_id ORDER BY c.id;
-- 3. 分组统计；初始通信3，电力1，零售1。
SELECT industry,COUNT(*)::int AS total FROM cases GROUP BY industry ORDER BY total DESC,industry;
-- 4. 包括没有案例的作者；COUNT(c.id)而不是COUNT(*)。
SELECT a.username,COUNT(c.id)::int AS total FROM authors a LEFT JOIN cases c ON c.author_id=a.id
GROUP BY a.id,a.username ORDER BY a.id;
-- 5. 多对多连接；链路中断出现2次，因为有2个标签。
SELECT c.title,t.name AS tag FROM cases c JOIN case_tags ct ON ct.case_id=c.id
JOIN tags t ON t.id=ct.tag_id ORDER BY c.id,t.name;
-- 6. NULL使用IS NULL；初始2条。
SELECT title FROM cases WHERE author_id IS NULL ORDER BY id;
