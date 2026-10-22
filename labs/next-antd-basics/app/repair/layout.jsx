import Link from 'next/link';
import {TicketProvider} from '../../components/repair/TicketProvider.jsx';
import './repair.css';
export const metadata = {title: '校园报修 · UI 原型'};
export default function Layout({children}) {
  return <TicketProvider><div className="repair-shell">
    <div className="repair-heading"><strong>校园报修</strong><span>值班工作台</span></div>
    <nav aria-label="报修导航"><Link href="/repair">工作概览</Link><Link href="/repair/tickets">工单列表</Link></nav>
    <p className="repair-note">交互原型 · 数据仅保存在当前浏览器页面内存中，刷新恢复10条初始工单。</p>
    {children}
  </div></TicketProvider>;
}
