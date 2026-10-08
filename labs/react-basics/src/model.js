export const initialCases = [
  { id: 'case-001', title: '链路中断', industry: 'telecom', difficulty: 'beginner' },
  { id: 'case-002', title: '订单延迟', industry: 'retail', difficulty: 'intermediate' },
  { id: 'case-003', title: 'DNS 解析失败', industry: 'telecom', difficulty: 'intermediate' },
];
export const industryNames = { telecom: '通信', retail: '零售' };
export function filterCases(items, keyword, industry, onlyFavorites, favoriteIds) {
  const query = keyword.trim().toLowerCase();
  return items.filter(item =>
    item.title.toLowerCase().includes(query) &&
    (industry === 'all' || item.industry === industry) &&
    (!onlyFavorites || favoriteIds.includes(item.id))
  );
}
export function toggleFavorite(ids, id) {
  return ids.includes(id) ? ids.filter(value => value !== id) : [...ids, id];
}
