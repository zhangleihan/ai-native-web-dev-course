import { initialCases, makeCase, filterCases } from './cases.js';
export const statusOptions = [{value:'open',label:'待处理'},{value:'done',label:'已完成'}];
export const catalog = [...initialCases,
  {id:'case-004',title:'登录超时',industry:'retail'},
  {id:'case-005',title:'接口响应缓慢',industry:'telecom'},
  {id:'case-006',title:'库存不同步',industry:'retail'}
].map((item,index)=>({...item,status:index%2?'done':'open',summary:`排查“${item.title}”的触发条件，记录复现步骤与处理结果。`}));
export function queryCatalog(params) {
  const industry=params.get('industry')??'all';
  const rawPage=params.get('page')??'1';
  if(!['all','telecom','retail'].includes(industry)) throw new Error('行业参数无效');
  if(!/^[1-9]\d*$/.test(rawPage)||!Number.isSafeInteger(Number(rawPage))) throw new Error('页码必须为正整数');
  const items=filterCases(catalog,params.get('q')??'',industry);
  const pageSize=3, pages=Math.max(1,Math.ceil(items.length/pageSize));
  const page=Math.min(Number(rawPage),pages);
  return {items:items.slice((page-1)*pageSize,page*pageSize),total:items.length,page,pageSize,pages};
}
export function saveRecord(items,values,id) {
  const item=makeCase(values,id);
  if(!statusOptions.some(option=>option.value===values.status)) throw new Error('请选择处理状态');
  const summary=typeof values.summary==='string'?values.summary.trim():'';
  if(!summary||summary.length>200) throw new Error('案例说明须为1–200个字符');
  const record={...item,status:values.status,summary};
  return items.some(item=>item.id===id)?items.map(item=>item.id===id?record:item):[record,...items];
}
