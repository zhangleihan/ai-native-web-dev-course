import express from 'express';
import {randomUUID} from 'node:crypto';
import {createCasesRouter} from './cases-router.mjs';
import {createMemoryStore} from './memory-store.mjs';
export function createApp({store = createMemoryStore(), logger = console.log} = {}) {
  const app = express();
  app.disable('x-powered-by');
  app.use((req, res, next) => {
    req.requestId = randomUUID();
    res.set('X-Request-Id', req.requestId);
    const started = Date.now();
    res.once('finish', () => logger({requestId: req.requestId, method: req.method,
      path: req.path, status: res.statusCode, elapsedMs: Date.now() - started}));
    next();
  });
  app.use('/api/cases', (req, res, next) => {
    if (['POST', 'PATCH'].includes(req.method) && !req.is('application/json')) {
      return res.status(415).json({error: {code: 'UNSUPPORTED_MEDIA_TYPE', message: '请使用 application/json', requestId: req.requestId}});
    }
    next();
  });
  app.use(express.json({limit: '32kb'}));
  app.get('/api/health', (req, res) => res.json({status: 'ok', storage: 'memory'}));
  app.use('/api/cases', createCasesRouter(store));
  app.use((req, res) => res.status(404).json({error: {code: 'NOT_FOUND', message: '接口不存在', requestId: req.requestId}}));
  app.use((err, req, res, next) => {
    if (res.headersSent) return next(err);
    const status = err.type === 'entity.too.large' ? 413 : err.status >= 400 && err.status < 500 ? err.status : 500;
    const code = err.type === 'entity.parse.failed' ? 'INVALID_JSON' : err.type === 'entity.too.large' ? 'PAYLOAD_TOO_LARGE'
      : status === 500 ? 'INTERNAL_ERROR' : err.code ?? 'REQUEST_ERROR';
    const message = status === 500 ? '服务暂不可用' : err.type === 'entity.parse.failed' ? 'JSON 格式不合法'
      : status === 413 ? '请求体超过32KB' : err.message;
    res.status(status).json({error: {code, message, requestId: req.requestId}});
  });
  return app;
}
