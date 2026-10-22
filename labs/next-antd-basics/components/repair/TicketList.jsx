"use client";
import {useEffect, useState} from 'react';
import Link from 'next/link';
import {Alert, Button, Checkbox, Input, Select, Space, Table, Tag} from 'antd';
import {categories, statuses, filterTickets} from '../../lib/tickets.js';
import {useTickets} from './TicketProvider.jsx';
import TicketForm from './TicketForm.jsx';
export default function TicketList() {
  const {tickets} = useTickets();
  const [keyword,setKeyword] = useState('');
  const [category,setCategory] = useState('全部');
  const [status,setStatus] = useState('全部');
  const [page,setPage] = useState(1);
  const [editing,setEditing] = useState(null);
  const [notice,setNotice] = useState('');
  const [simulateError,setSimulateError] = useState(false);
  const [phase,setPhase] = useState('ready');
  const [attempt,setAttempt] = useState(0);
  // 仅演示加载与失败反馈，不向服务器发送请求。
  useEffect(() => {
    if (!attempt) return;
    setPhase('loading');
    const timer = setTimeout(() => setPhase(simulateError ? 'error' : 'ready'), 600);
    return () => clearTimeout(timer);
  }, [attempt, simulateError]);
  const visible = filterTickets(tickets,keyword,category,status);
  const current = Math.min(page,Math.max(1,Math.ceil(visible.length/5)));
  const options = values => ['全部',...values].map(value => ({value,label:value}));
  const columns = [
    {title:'工单标题',dataIndex:'title',render:(title,item) => <Link href={`/repair/tickets/${item.id}`}>{title}</Link>},
    {title:'地点',dataIndex:'location'}, {title:'类别',dataIndex:'category'},
    {title:'状态',dataIndex:'status',render:value => <Tag color={value === '已完成' ? 'green' : 'blue'}>{value}</Tag>},
    {title:'操作',key:'actions',render:(_,item) => <Button onClick={() => setEditing(item)}>编辑</Button>},
  ];
  return <main><h1>工单列表</h1><p>按标题、类别和状态查找报修记录。</p>
    <div className="repair-actions"><Button type="primary" onClick={() => setEditing({})}>新建工单</Button></div>
    <div className="repair-filters">
      <label>标题关键词<Input value={keyword} allowClear onChange={e => {setKeyword(e.target.value);setPage(1);}}/></label>
      <label htmlFor="repair-category">问题类别<Select id="repair-category" style={{minWidth:140}} value={category} options={options(categories)} onChange={value => {setCategory(value);setPage(1);}}/></label>
      <label htmlFor="repair-status">处理状态<Select id="repair-status" style={{minWidth:140}} value={status} options={options(statuses)} onChange={value => {setStatus(value);setPage(1);}}/></label>
      <Button onClick={() => {setKeyword('');setCategory('全部');setStatus('全部');setPage(1);}}>清空筛选</Button>
    </div>
    {notice && <Alert title={notice} type="success"/>}
    <details><summary>原型演示：加载与失败</summary><p>此处使用本地计时器模拟反馈，不会发出网络请求。</p><Space wrap>
      <Checkbox checked={simulateError} onChange={e => setSimulateError(e.target.checked)}>模拟失败</Checkbox>
      <Button disabled={phase === 'loading'} onClick={() => setAttempt(n => n+1)}>模拟重新加载</Button>
    </Space></details>
    {phase === 'error' ? <Alert type="error" title="模拟加载失败，请关闭模拟失败后重试。" action={<Button onClick={() => setAttempt(n => n+1)}>重试</Button>}/> :
      <><p role="status">{phase === 'loading' ? '正在模拟加载……' : `共${tickets.length}条，当前匹配${visible.length}条`}</p>
      <Table rowKey="id" loading={phase === 'loading'} columns={columns} dataSource={visible} scroll={{x:720}} locale={{emptyText:'暂无符合条件的工单，请调整筛选条件'}} pagination={{current,pageSize:5,showSizeChanger:false,onChange:setPage}}/></>}
    {editing && <TicketForm ticket={editing.id ? editing : null} onClose={() => setEditing(null)} onSaved={() => {setEditing(null);setNotice('工单已保存，详情和概览已同步更新。');}}/>}
  </main>;
}
