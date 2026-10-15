export const initialCases = [
  { id: 'case-001', title: '链路中断', industry: 'telecom' },
  { id: 'case-002', title: '订单延迟', industry: 'retail' },
  { id: 'case-003', title: 'DNS 解析失败', industry: 'telecom' },
];
export const industryOptions = [
  { value: 'telecom', label: '通信' }, { value: 'retail', label: '零售' },
];
export function filterCases(items, keyword, industry) {
  const query = keyword.trim().toLowerCase();
  return items.filter(item => item.title.toLowerCase().includes(query) &&
    (industry === 'all' || item.industry === industry));
}
export function makeCase(values, id) {
  const title = typeof values.title === 'string' ? values.title.trim() : '';
  if (!title || title.length > 40) throw new Error('标题须为1–40个字符');
  if (!industryOptions.some(option => option.value === values.industry)) throw new Error('请选择有效行业');
  return { id, title, industry: values.industry };
}
