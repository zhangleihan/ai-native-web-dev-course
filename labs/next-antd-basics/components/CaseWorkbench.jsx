"use client";
import { useState } from 'react';
import { Alert, Button, Form, Input, Select, Space, Table } from 'antd';
import { filterCases, industryOptions, makeCase } from '../lib/cases.js';

export default function CaseWorkbench({ initialItems }) {
  const [items, setItems] = useState(initialItems);
  const [keyword, setKeyword] = useState('');
  const [industry, setIndustry] = useState('all');
  const [notice, setNotice] = useState('');
  const [form] = Form.useForm();
  const visible = filterCases(items, keyword, industry);
  const columns = [
    { title: '标题', dataIndex: 'title', key: 'title' },
    { title: '行业', dataIndex: 'industry', key: 'industry',
      render: value => industryOptions.find(option => option.value === value)?.label ?? value },
  ];
  function handleAdd(values) {
    const item = makeCase(values, crypto.randomUUID());
    setItems(previous => [...previous, item]);
    setKeyword('');
    setIndustry('all');
    setNotice(`已在本页添加“${item.title}”；刷新后不保留。筛选已清空。`);
    form.resetFields();
  }
  return <>
    <Alert title="练习数据只在本页内存中；刷新会重置，未写入数据库。" type="info" showIcon />
    <section aria-labelledby="filter-heading">
      <h2 id="filter-heading">筛选案例</h2>
      <div className="filters">
        <label htmlFor="case-query">标题关键词</label>
        <Input id="case-query" value={keyword} allowClear onChange={event => setKeyword(event.target.value)} />
        <label htmlFor="case-industry">行业</label>
        <Select id="case-industry" value={industry} onChange={setIndustry}
          options={[{ value: 'all', label: '全部行业' }, ...industryOptions]} />
        <Button onClick={() => { setKeyword(''); setIndustry('all'); }}>清空筛选</Button>
      </div>
      <p role="status">显示 {visible.length} / {items.length} 条</p>
      <Table rowKey="id" columns={columns} dataSource={visible} pagination={false}
        locale={{ emptyText: '没有匹配的案例，请调整条件。' }} scroll={{ x: 480 }} />
    </section>
    <section aria-labelledby="add-heading">
      <h2 id="add-heading">新增案例</h2>
      <Form form={form} name="case-create" layout="vertical" initialValues={{ title: '', industry: 'telecom' }} onFinish={handleAdd}>
        <Form.Item name="title" label="案例标题" rules={[
          { required: true, whitespace: true, message: '请输入非空标题' },
          { max: 40, message: '标题最多40个字符' },
        ]}><Input maxLength={40} /></Form.Item>
        <Form.Item name="industry" label="所属行业" rules={[{ required: true, message: '请选择行业' }]}>
          <Select options={industryOptions} />
        </Form.Item>
        <Space wrap><Button type="primary" htmlType="submit">添加到本页</Button>
          <Button htmlType="button" onClick={() => form.resetFields()}>重置草稿</Button></Space>
      </Form>
      <p role="status">{notice}</p>
    </section>
  </>;
}
