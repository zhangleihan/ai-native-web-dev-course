import express from 'express';
import {CaseRepository} from './repository.mjs';
// 复用第5讲的纯校验函数；从课程仓库运行即可，不需要Express实验的依赖目录。
import {caseBody, listQuery} from '../../express-basics/server/validation.mjs';
export function createApp(db) {
  const app = express(), repo = new CaseRepository(db);
  app.use(express.json({limit: '32kb'}));
  app.get('/api/health', async (req, res) => {
    await db.query('SELECT 1'); res.json({status: 'ok',storage: db.mode});
  });
  app.get('/api/cases', async (req, res) => res.json(await repo.list(listQuery(req.query))));
  app.get('/api/cases/:id', async (req, res) => {
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(req.params.id)) return res.status(400).json({error:{code:'VALIDATION_ERROR',message:'编号格式不合法'}});
    const item = await repo.get(req.params.id);
    if (!item) return res.status(404).json({error:{code:'NOT_FOUND',message:'案例不存在'}});
    res.json(item);
  });
  app.post('/api/cases', async (req, res) => {
    const item = await repo.create(caseBody(req.body));
    res.location(`/api/cases/${item.id}`).status(201).json(item);
  });
  app.use((req, res) => res.status(404).json({error:{code:'NOT_FOUND',message:'接口不存在'}}));
  app.use((err, req, res, next) => {
    if (res.headersSent) return next(err);
    const dbCodes = {'23505':[409,'CONFLICT','数据发生唯一性冲突'],'23503':[409,'REFERENCE_CONFLICT','关联数据发生冲突'],
      '23514':[400,'VALIDATION_ERROR','数据不符合约束'],'23502':[400,'VALIDATION_ERROR','必填字段缺失']};
    const [status,code,message] = dbCodes[err.code] ?? (err.type==='entity.too.large' ? [413,'PAYLOAD_TOO_LARGE','请求体过大']
      : err.type==='entity.parse.failed' ? [400,'INVALID_JSON','JSON格式不合法']
      : err.status>=400 && err.status<500 ? [err.status,err.code ?? 'REQUEST_ERROR',err.message] : [500,'INTERNAL_ERROR','服务暂不可用']);
    res.status(status).json({error:{code,message}});
  });
  return app;
}
