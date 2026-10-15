import { filterCases, initialCases } from '../../../lib/cases.js';
export function GET(request) {
  const { searchParams } = new URL(request.url);
  const keyword = searchParams.get('q') ?? '';
  const industry = searchParams.get('industry') ?? 'all';
  if (!['all', 'telecom', 'retail'].includes(industry)) {
    return Response.json({ error: '无效的 industry' }, { status: 400 });
  }
  const items = filterCases(initialCases, keyword, industry);
  return Response.json({ items, total: items.length }, { headers: { 'Cache-Control': 'no-store' } });
}
