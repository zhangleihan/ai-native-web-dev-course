"use client";
import {useState} from 'react';
import {Alert,Button,Drawer,Form,Input,Popconfirm,Select,Space,Table,Tag} from 'antd';
import {industryOptions,filterCases} from '../lib/cases.js';
import {saveRecord,statusOptions} from '../lib/catalog.js';
const blank={title:'',industry:'telecom',status:'open',summary:''};
export default function CaseEditor({initialItems}){
  const [items,setItems]=useState(initialItems),[keyword,setKeyword]=useState(''),[status,setStatus]=useState('all');
  const [page,setPage]=useState(1),[editing,setEditing]=useState(null),[notice,setNotice]=useState('');
  const [form]=Form.useForm();
  const visible=filterCases(items,keyword,'all').filter(item=>status==='all'||item.status===status);
  const current=Math.min(page,Math.max(1,Math.ceil(visible.length/3)));
  function openEditor(item){setEditing(item??{id:null});form.setFieldsValue(item??blank);}
  function save(values){
    const id=editing.id??crypto.randomUUID();
    try{const next=saveRecord(items,values,id);setItems(next);setEditing(null);setKeyword('');setStatus('all');setPage(1);setNotice('记录已更新，筛选已清空。数据只保存在本页，刷新后恢复初始记录。');}
    catch(error){setNotice(error.message);}
  }
  const columns=[
    {title:'标题',dataIndex:'title',sorter:(a,b)=>a.title.localeCompare(b.title,'zh-CN')},
    {title:'行业',dataIndex:'industry',render:value=>industryOptions.find(option=>option.value===value)?.label},
    {title:'处理状态',dataIndex:'status',render:value=><Tag color={value==='done'?'green':'blue'}>{value==='done'?'已完成':'待处理'}</Tag>},
    {title:'操作',key:'actions',render:(_,item)=><Space><Button aria-label={`编辑${item.title}`} onClick={()=>openEditor(item)}>编辑</Button><Popconfirm title={`删除“${item.title}”？`} description="仅删除本页中的记录。" okText="确认删除" cancelText="取消" onConfirm={()=>{setItems(previous=>previous.filter(row=>row.id!==item.id));setNotice('已从本页删除记录。');}}><Button danger aria-label={`删除${item.title}`}>删除</Button></Popconfirm></Space>}
  ];
  return <section><p>全部{items.length}条，待处理{items.filter(item=>item.status==='open').length}条，当前匹配{visible.length}条。</p>
    <Space wrap><label htmlFor="editor-query">标题关键词</label><Input id="editor-query" value={keyword} onChange={event=>{setKeyword(event.target.value);setPage(1);}}/><label htmlFor="editor-status">处理状态</label><Select id="editor-status" style={{width:140}} value={status} onChange={value=>{setStatus(value);setPage(1);}} options={[{value:'all',label:'全部状态'},...statusOptions]}/><Button type="primary" onClick={()=>openEditor()}>新增案例</Button></Space>
    {notice&&<Alert title={notice} type="info"/>}
    <Table rowKey="id" columns={columns} dataSource={visible} locale={{emptyText:'没有匹配的案例'}} scroll={{x:650}} pagination={{current,pageSize:3,showSizeChanger:false,onChange:setPage}}/>
    <Drawer title={editing?.id?'编辑案例':'新增案例'} open={editing!==null} onClose={()=>setEditing(null)} size="default" forceRender>
      <p>关闭面板会放弃未提交的草稿；保存后才更新列表。</p>
      <Form form={form} layout="vertical" onFinish={save} initialValues={blank}>
        <Form.Item name="title" label="案例标题" rules={[{required:true,whitespace:true,message:'请输入非空标题'},{max:40,message:'标题最多40个字符'}]}><Input maxLength={40}/></Form.Item>
        <Form.Item name="industry" label="所属行业" rules={[{required:true,message:'请选择行业'}]}><Select options={industryOptions}/></Form.Item>
        <Form.Item name="status" label="处理状态" rules={[{required:true,message:'请选择处理状态'}]}><Select options={statusOptions}/></Form.Item>
        <Form.Item name="summary" label="案例说明" rules={[{required:true,whitespace:true,message:'请填写案例说明'},{max:200,message:'说明最多200个字符'}]}><Input.TextArea rows={4} maxLength={200} showCount/></Form.Item>
        <Space><Button type="primary" htmlType="submit">保存到本页</Button><Button onClick={()=>setEditing(null)}>取消编辑</Button></Space>
      </Form>
    </Drawer>
  </section>;
}
