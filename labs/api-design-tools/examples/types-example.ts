import type {components, paths} from '../generated/api';

type CaseInput = components['schemas']['CaseInput'];
type CaseList = paths['/api/cases']['get']['responses'][200]['content']['application/json'];
export const draft: CaseInput = {title: '链路中断', industry: '通信', difficulty: 'beginner'};
// 负向编译检查：如果契约意外放宽枚举，@ts-expect-error将报告“不再有预期错误”。
// @ts-expect-error difficulty必须来自规范中的枚举。
export const wrong: CaseInput = {...draft, difficulty: 'easy'};
export function summary(page: CaseList): string {
  return `共${page.total}条，本页${page.items.length}条`;
}
// 这些是编译期类型，不会验证服务器返回的JSON；不要用as代替运行时校验。
