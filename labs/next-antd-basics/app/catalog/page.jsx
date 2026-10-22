import Link from 'next/link';
import { queryCatalog } from '../../lib/catalog.js';
export default async function CatalogPage({searchParams}) {
  const values=await searchParams;
  const params=new URLSearchParams();
  for(const [key,value] of Object.entries(values)) params.set(key,Array.isArray(value)?value[0]:value);
  let result;
  try {result=queryCatalog(params);} catch(error) {return <main><h1>查询条件有误</h1><p>{error.message}</p><Link href="/catalog">重新查询</Link></main>;}
  const href=page=>{const next=new URLSearchParams(params);next.set('page',String(page));return `/catalog?${next}`;};
  return <main><h1>服务端案例目录</h1><p>筛选条件保存在网址中，可刷新、收藏和分享。每页3条。</p>
    <form action="/catalog" className="filters">
      <label>标题关键词<input name="q" defaultValue={params.get('q')??''}/></label>
      <label>行业<select name="industry" defaultValue={params.get('industry')??'all'}><option value="all">全部行业</option><option value="telecom">通信</option><option value="retail">零售</option></select></label>
      <button type="submit">查询</button><Link href="/catalog">清空条件</Link>
    </form>
    <p>共{result.total}条，第{result.page}/{result.pages}页</p>
    {result.items.length?<ul>{result.items.map(item=><li key={item.id}><Link href={`/catalog/${item.id}`}>{item.title}</Link><p>{item.summary}</p></li>)}</ul>:<p>没有匹配的案例，请调整条件。</p>}
    <nav aria-label="目录分页">{result.page>1&&<Link href={href(result.page-1)}>上一页</Link>}{result.page<result.pages&&<Link href={href(result.page+1)}>下一页</Link>}</nav>
  </main>;
}
