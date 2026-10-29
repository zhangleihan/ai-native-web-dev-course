import {Router} from 'express';
import {caseBody, listQuery, fail} from './validation.mjs';
export function createCasesRouter(store) {
  const router = Router();
  router.get('/', async (req, res) => res.json(await store.list(listQuery(req.query))));
  router.get('/:id', async (req, res) => {
    const item = await store.get(req.params.id);
    if (!item) fail(404, 'NOT_FOUND', '案例不存在');
    res.json(item);
  });
  router.post('/', async (req, res) => {
    const item = await store.create(caseBody(req.body));
    res.location(`/api/cases/${item.id}`).status(201).json(item);
  });
  router.patch('/:id', async (req, res) => {
    const fields = caseBody(req.body, {partial: true});
    const item = await store.update(req.params.id, fields);
    if (!item) fail(404, 'NOT_FOUND', '案例不存在');
    res.json(item);
  });
  router.delete('/:id', async (req, res) => {
    if (!await store.remove(req.params.id)) fail(404, 'NOT_FOUND', '案例不存在');
    res.status(204).end();
  });
  return router;
}
