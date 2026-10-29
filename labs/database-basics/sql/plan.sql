-- 这是观察查询计划的练习，不承诺小表一定使用索引。
CREATE INDEX IF NOT EXISTS cases_industry_created_idx ON cases(industry,created_at,id);
ANALYZE cases;
EXPLAIN SELECT id,title FROM cases WHERE industry='通信' ORDER BY created_at,id LIMIT 10;
