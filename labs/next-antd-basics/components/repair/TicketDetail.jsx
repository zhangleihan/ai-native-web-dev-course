"use client";
import {useState} from 'react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {Alert, Button, Popconfirm} from 'antd';
import {useTickets} from './TicketProvider.jsx';
import TicketForm from './TicketForm.jsx';
export default function TicketDetail({id}) {
  const {tickets,remove} = useTickets();
  const router = useRouter();
  const [editing,setEditing] = useState(false);
  const [notice,setNotice] = useState('');
  const ticket = tickets.find(item => item.id === id);
  if (!ticket) return <main><h1>未找到该工单</h1><p>工单可能已删除；本地新增的工单刷新后不会保留。</p><Link href="/repair/tickets">返回工单列表</Link></main>;
  return <main><Link href="/repair/tickets">← 返回工单列表</Link><h1>{ticket.title}</h1>
    {notice && <Alert title={notice} type="success"/>}
    <dl className="repair-detail">{[['id','工单编号'],['location','报修地点'],['category','问题类别'],['status','处理状态'],['createdAt','登记日期'],['description','问题描述']].map(([key,label]) => <div key={key} style={{display:'contents'}}><dt>{label}</dt><dd>{ticket[key]}</dd></div>)}</dl>
    <div className="repair-actions"><Button type="primary" onClick={() => setEditing(true)}>编辑工单</Button>
      <Popconfirm title="确认删除此工单？" description="删除仅影响当前内存数据，刷新会恢复初始工单。" okText="确认删除" cancelText="取消" onConfirm={() => {remove(id);router.push('/repair/tickets');}}><Button danger>删除工单</Button></Popconfirm>
    </div>
    {editing && <TicketForm ticket={ticket} onClose={() => setEditing(false)} onSaved={() => {setEditing(false);setNotice('工单已保存。');}}/>}
  </main>;
}
