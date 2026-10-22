import Link from 'next/link';
import { notFound } from 'next/navigation';
import { catalog, statusOptions } from '../../../lib/catalog.js';
export default async function DetailPage({params}) {
  const {id}=await params;
  const item=catalog.find(item=>item.id===id);
  if(!item) notFound();
  return <main><h1>{item.title}</h1><dl><dt>案例编号</dt><dd>{item.id}</dd><dt>处理状态</dt><dd>{statusOptions.find(option=>option.value===item.status).label}</dd></dl><p>{item.summary}</p><Link href="/catalog">返回目录</Link></main>;
}
