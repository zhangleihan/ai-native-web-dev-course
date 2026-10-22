"use client";
import {useState} from 'react';
import {Alert, Button, Drawer, Form, Input, Select, Space} from 'antd';
import {categories, statuses} from '../../lib/tickets.js';
import {useTickets} from './TicketProvider.jsx';
const options = values => values.map(value => ({value, label:value}));
export default function TicketForm({ticket, onClose, onSaved}) {
  const {save} = useTickets();
  const [error, setError] = useState('');
  const initial = ticket ?? {title:'', location:'', description:'', category:'网络', status:'待处理'};
  function submit(values) {
    try { const id = save(values, ticket?.id); onSaved(id); }
    catch (error) { setError(error.message); }
  }
  return <Drawer open title={ticket ? '编辑工单' : '新建工单'} onClose={onClose}>
    <p>保存后更新工单；取消或关闭面板会放弃本次修改。</p>
    {error && <Alert type="error" title={error}/>}
    <Form layout="vertical" initialValues={initial} onFinish={submit}>
      {[['title','工单标题',40], ['location','报修地点',60]].map(([name,label,max]) =>
        <Form.Item key={name} name={name} label={label} rules={[{required:true,whitespace:true,message:`请填写${label}`},{max,message:`最多${max}个字符`}]}>
          <Input maxLength={max}/>
        </Form.Item>)}
      <Form.Item name="category" label="问题类别" rules={[{required:true}]}><Select options={options(categories)}/></Form.Item>
      <Form.Item name="status" label="处理状态" rules={[{required:true}]}><Select options={options(statuses)}/></Form.Item>
      <Form.Item name="description" label="问题描述" rules={[{required:true,whitespace:true,message:'请填写问题描述'},{max:300,message:'最多300个字符'}]}>
        <Input.TextArea rows={5} maxLength={300} showCount/>
      </Form.Item>
      <Space><Button type="primary" htmlType="submit">保存工单</Button><Button onClick={onClose}>取消编辑</Button></Space>
    </Form>
  </Drawer>;
}
