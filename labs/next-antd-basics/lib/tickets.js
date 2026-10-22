export const categories = ['网络', '电力', '设施'];
export const statuses = ['待处理', '处理中', '已完成'];
const examples = [
  ['宿舍网络无法连接', '学一楼302', '网络', '待处理'],
  ['走廊照明不亮', '学二楼二层', '电力', '处理中'],
  ['教室门锁损坏', '教学楼101', '设施', '已完成'],
  ['无线网络信号弱', '图书馆三层', '网络', '待处理'],
  ['插座无法供电', '实验楼205', '电力', '待处理'],
  ['水龙头漏水', '学三楼公共洗手间', '设施', '处理中'],
  ['投影网络掉线', '教学楼306', '网络', '已完成'],
  ['自习室灯光闪烁', '图书馆二层', '电力', '待处理'],
  ['窗户无法关闭', '学一楼405', '设施', '处理中'],
  ['公共座椅松动', '教学楼大厅', '设施', '已完成'],
];
export const initialTickets = examples.map(([title, location, category, status], i) => ({
  id: `BX-${String(i + 1).padStart(3, '0')}`, title, location, category, status,
  description: `请检查${location}的“${title}”问题，并记录处理结果。`,
  createdAt: '2026-10-22',
}));
export function validateTicket(values) {
  const fields = [['title', '标题', 40], ['location', '地点', 60], ['description', '问题描述', 300]];
  const record = {};
  for (const [key, label, max] of fields) {
    const value = typeof values[key] === 'string' ? values[key].trim() : '';
    if (!value || value.length > max) throw new Error(`${label}须为1–${max}个字符`);
    record[key] = value;
  }
  if (!categories.includes(values.category)) throw new Error('请选择有效类别');
  if (!statuses.includes(values.status)) throw new Error('请选择有效状态');
  return {...record, category: values.category, status: values.status};
}
export function saveTicket(items, values, id, createdAt) {
  const fields = validateTicket(values);
  const existing = items.find(item => item.id === id);
  const record = {...fields, id, createdAt: existing?.createdAt ?? createdAt};
  return existing ? items.map(item => item.id === id ? record : item) : [record, ...items];
}
export function filterTickets(items, keyword, category, status) {
  const query = keyword.trim().toLowerCase();
  return items.filter(item => item.title.toLowerCase().includes(query)
    && (category === '全部' || item.category === category)
    && (status === '全部' || item.status === status));
}
