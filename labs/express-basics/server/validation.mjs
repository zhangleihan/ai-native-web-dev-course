const levels = new Set(['beginner', 'intermediate', 'advanced']);
export function fail(status, code, message) {
  throw Object.assign(new Error(message), {status, code});
}
function text(value, field, max) {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > max) {
    fail(400, 'VALIDATION_ERROR', `${field} 必须是1至${max}个字符的非空字符串`);
  }
  return value.trim();
}
export function caseBody(body, {partial = false} = {}) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    fail(400, 'VALIDATION_ERROR', '请求体必须是 JSON 对象');
  }
  const keys = Object.keys(body);
  if (!keys.length || keys.some(key => !['title', 'industry', 'difficulty'].includes(key))) {
    fail(400, 'VALIDATION_ERROR', '仅允许 title、industry、difficulty，且至少提供一个字段');
  }
  const result = {};
  for (const [key, max] of [['title', 100], ['industry', 50]]) {
    if (!partial || Object.hasOwn(body, key)) result[key] = text(body[key], key, max);
  }
  if (!partial || Object.hasOwn(body, 'difficulty')) {
    if (!levels.has(body.difficulty)) fail(400, 'VALIDATION_ERROR', 'difficulty 不在允许范围内');
    result.difficulty = body.difficulty;
  }
  return result;
}
export function listQuery(query) {
  const result = {};
  for (const key of ['kw', 'industry', 'difficulty']) {
    const value = query[key] ?? '';
    if (typeof value !== 'string' || value.length > 100) fail(400, 'VALIDATION_ERROR', `${key} 查询条件不合法`);
    result[key] = value.trim();
  }
  if (result.difficulty && !levels.has(result.difficulty)) fail(400, 'VALIDATION_ERROR', 'difficulty 不在允许范围内');
  for (const [key, fallback, min, max] of [['offset', 0, 0, 100000], ['limit', 10, 1, 50]]) {
    const raw = query[key] ?? String(fallback);
    if (typeof raw !== 'string' || !/^\d+$/.test(raw) || Number(raw) < min || Number(raw) > max) {
      fail(400, 'VALIDATION_ERROR', `${key} 必须是${min}至${max}之间的整数`);
    }
    result[key] = Number(raw);
  }
  return result;
}
