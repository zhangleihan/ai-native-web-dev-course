export class Problem extends Error {
  constructor(status, code, message) { super(message); Object.assign(this, {status, code}); }
}
export const fail = (status, code, message) => { throw new Problem(status, code, message); };
export const difficulties = ['beginner', 'intermediate', 'advanced'];
export function text(value, max = 100) { return typeof value === 'string' && value.trim().length > 0 && value.length <= max; }
export function validCase(body) {
  if (!body || !text(body.title) || !text(body.industry, 50) || !difficulties.includes(body.difficulty)) {
    fail(400, 'VALIDATION_ERROR', '标题、行业或难度不合法');
  }
  return {title: body.title.trim(), industry: body.industry.trim(), difficulty: body.difficulty};
}
export function filters(query) {
  const {industry = '', difficulty = '', kw = ''} = query;
  if (![industry,difficulty,kw].every(v => typeof v === 'string' && v.length <= 100)
    || (difficulty && !difficulties.includes(difficulty))) fail(400, 'VALIDATION_ERROR', '查询条件不合法');
  return {industry,difficulty,kw};
}
export function uuid(value) {
  if (typeof value !== 'string' || !/^[a-f\d]{8}(-[a-f\d]{4}){3}-[a-f\d]{12}$/i.test(value)) fail(400,'VALIDATION_ERROR','编号格式不合法');
  return value;
}
export function visibleUser(user) { return user ? {id:user.id, username:user.username, role:user.role} : null; }
export function canReadRun(user, run) {
  if (run.ownerId !== user.id && user.role !== 'admin') fail(403,'FORBIDDEN','不可访问其他用户的运行');
}
export function decisionFor(run, decision) {
  if (!['approve','reject'].includes(decision)) fail(400,'VALIDATION_ERROR','决定只能为 approve/reject');
  if ((run.status === 'COMPLETED' && decision === 'approve') || (run.status === 'CANCELLED' && decision === 'reject')) return 'replay';
  if (run.status !== 'WAITING_APPROVAL') fail(409,'INVALID_STATE','当前状态不能执行此决定');
  return 'execute';
}
export const step = (type, detail) => ({type, detail, at: new Date().toISOString()});
