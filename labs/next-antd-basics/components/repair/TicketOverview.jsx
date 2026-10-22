"use client";
import Link from 'next/link';
import {useTickets} from './TicketProvider.jsx';
import {statuses} from '../../lib/tickets.js';
export default function TicketOverview() {
  const {tickets} = useTickets();
  return <main><h1>工作概览</h1><p>查看当前报修情况，进入工单列表处理具体问题。</p>
    <div className="repair-stats">{['全部工单', ...statuses].map(status =>
      <div className="repair-stat" key={status}>{status}<strong>{status === '全部工单' ? tickets.length : tickets.filter(item => item.status === status).length}</strong></div>)}
    </div><Link href="/repair/tickets">进入工单列表 →</Link>
    <h2>最近登记</h2><ul>{tickets.slice(0,3).map(item => <li key={item.id}><Link href={`/repair/tickets/${item.id}`}>{item.title}</Link> · {item.location}</li>)}</ul>
  </main>;
}
