'use client';

import React, { useState } from 'react';
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Steps,
  Switch,
  Table,
  Tag,
  Upload,
  message,
} from 'antd';
import { InboxOutlined, PlusOutlined, SaveOutlined } from '@ant-design/icons';
import { PageHead } from '@/components/ui';
import { caseBuilderSteps, caseDetail, cases, stakeholders } from '@/mock';

export default function CaseBuilderPage() {
  const [step, setStep] = useState(0);
  const [msg, ctx] = message.useMessage();

  const content = () => {
    switch (caseBuilderSteps[step].key) {
      case 'basic':
        return (
          <Form layout="vertical" size="small">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="案例名称" required>
                  <Input defaultValue="通信网络故障处理" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="企业名称" required>
                  <Input defaultValue="中通信网络科技" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="所属行业" required>
                  <Select
                    defaultValue="通信运营"
                    options={['通信运营', '智能制造', '物流供应链', '金融', '医疗健康', '能源电力'].map((v) => ({
                      value: v,
                      label: v,
                    }))}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="难度">
                  <Select defaultValue="进阶" options={[{ value: '入门' }, { value: '进阶' }, { value: '挑战' }]} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="预计投入（小时）">
                  <InputNumber defaultValue={8} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item label="案例摘要">
                  <Input.TextArea rows={3} defaultValue={cases[0].summary} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="设为 Golden Case">
                  <Switch defaultChecked />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        );

      case 'background':
        return (
          <Form layout="vertical" size="small">
            {Object.entries({
              Company: caseDetail.background.company,
              Organization: caseDetail.background.organization,
              'Business Model': caseDetail.background.businessModel,
              'Current System': caseDetail.background.currentSystem,
              'Business Process': caseDetail.background.businessProcess,
            }).map(([k, v]) => (
              <Form.Item key={k} label={k}>
                <Input.TextArea rows={2} defaultValue={v} />
              </Form.Item>
            ))}
            <Form.Item label="Known Problems（每行一条）">
              <Input.TextArea rows={4} defaultValue={caseDetail.background.knownProblems.join('\n')} />
            </Form.Item>
          </Form>
        );

      case 'stakeholders':
        return (
          <>
            <Table
              size="small"
              pagination={false}
              rowKey="id"
              dataSource={stakeholders}
              columns={[
                { title: '姓名', dataIndex: 'name', width: 120 },
                { title: '角色', dataIndex: 'role', width: 150 },
                { title: '部门', dataIndex: 'department', width: 130 },
                { title: '目标', dataIndex: 'goal', ellipsis: true },
                { title: '痛点', dataIndex: 'painPoint', ellipsis: true },
                { title: '影响力', dataIndex: 'influence', width: 72 },
                { title: '关注度', dataIndex: 'interest', width: 72 },
              ]}
            />
            <div style={{ marginTop: 12, fontSize: 12, fontWeight: 600 }}>Persona 配置（Stakeholder Simulator）</div>
            <pre className="fde-code-light" style={{ marginTop: 8 }}>{`role: Operations Manager

goal:
  reduce downtime

known_information:
  - 日均告警 8000+ 条，有效率不足 6%
  - 故障定位平均 47 分钟
  - 工单派发依赖个人经验

hidden_information:
  - 去年脚本误操作导致核心路由器重启，事后规定双人确认
  - 知识库 60% 文档超过两年未更新
  - 担心自动化削弱一线控制权与话语权

attitude:
  conservative

conflicts:
  - CIO wants automation
  - Operations fears loss of control`}</pre>
          </>
        );

      case 'hidden':
        return (
          <Form layout="vertical" size="small">
            <Form.Item
              label="Hidden Facts（学生需通过访谈挖掘，每行一条）"
              extra="隐藏事实是案例设计的关键，它决定了学生能否发现真实约束"
            >
              <Input.TextArea rows={8} defaultValue={caseDetail.hiddenFacts.join('\n')} />
            </Form.Item>
            <Form.Item label="触发条件">
              <Select
                mode="multiple"
                defaultValue={['追问风险与顾虑', '追问数据质量', '追问历史事故']}
                options={[
                  { value: '追问风险与顾虑' },
                  { value: '追问数据质量' },
                  { value: '追问历史事故' },
                  { value: '追问组织分歧' },
                  { value: '追问预算约束' },
                ]}
              />
            </Form.Item>
          </Form>
        );

      case 'documents':
      case 'dataset':
        return (
          <>
            <Upload.Dragger multiple style={{ marginBottom: 16 }}>
              <p className="ant-upload-drag-icon">
                <InboxOutlined style={{ color: '#1677ff' }} />
              </p>
              <p style={{ fontSize: 13 }}>点击或拖拽文件到此区域上传</p>
              <p style={{ fontSize: 11.5, color: 'var(--fde-text-dim)' }}>
                支持 CSV、JSON、PDF、图片、日志等，上传后按 Project 隔离挂载
              </p>
            </Upload.Dragger>
            <Table
              size="small"
              pagination={false}
              rowKey="name"
              dataSource={caseDetail.resources.filter((r) =>
                caseBuilderSteps[step].key === 'documents'
                  ? ['Documents', 'CSV', 'JSON'].includes(r.type)
                  : ['CSV', 'JSON'].includes(r.type),
              )}
              columns={[
                { title: '文件', dataIndex: 'name' },
                { title: '类型', dataIndex: 'type', width: 110, render: (v) => <Tag>{v}</Tag> },
                { title: '规模', dataIndex: 'size', width: 100 },
                { title: '说明', dataIndex: 'desc' },
              ]}
            />
          </>
        );

      case 'api':
        return (
          <Form layout="vertical" size="small">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="接口名称">
                  <Input defaultValue="FaultCenter 告警查询" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Base URL">
                  <Input defaultValue="http://mock.fde-lab.internal/faultcenter" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="限流">
                  <Input defaultValue="20 次 / 分钟" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="认证方式">
                  <Select defaultValue="API Key" options={[{ value: 'API Key' }, { value: 'OAuth2' }, { value: '无' }]} />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item label="OpenAPI Schema">
                  <Input.TextArea
                    rows={7}
                    defaultValue={`paths:
  /alarms:
    get:
      summary: 查询告警列表
      parameters: [ne_id, level, start_time, end_time]
  /alarms/{id}/ack:
    post:
      summary: 确认告警
  /workorder/create:
    post:
      summary: 创建工单（高风险，需审批）`}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        );

      case 'tools':
        return (
          <Table
            size="small"
            pagination={false}
            rowKey="name"
            dataSource={[
              { name: 'correlate_alarms', type: 'Function', risk: 'low', enabled: true },
              { name: 'query_topology', type: 'MCP', risk: 'low', enabled: true },
              { name: 'search_knowledge', type: 'RAG', risk: 'low', enabled: true },
              { name: 'query_alarm_history', type: 'Database', risk: 'low', enabled: true },
              { name: 'recommend_engineer', type: 'Ontology Action', risk: 'medium', enabled: true },
              { name: 'create_work_order', type: 'API', risk: 'high', enabled: true },
              { name: 'execute_device_command', type: 'MCP', risk: 'high', enabled: false },
            ]}
            columns={[
              { title: '工具', dataIndex: 'name', render: (v) => <span className="fde-mono">{v}</span> },
              { title: '类型', dataIndex: 'type', width: 140, render: (v) => <Tag>{v}</Tag> },
              {
                title: '风险',
                dataIndex: 'risk',
                width: 80,
                render: (v) => (
                  <Tag color={v === 'high' ? 'red' : v === 'medium' ? 'orange' : 'green'} style={{ margin: 0 }}>
                    {v}
                  </Tag>
                ),
              },
              {
                title: '案例中可用',
                dataIndex: 'enabled',
                width: 110,
                render: (v) => <Switch size="small" defaultChecked={v} />,
              },
            ]}
          />
        );

      case 'deliverables':
        return (
          <Form layout="vertical" size="small">
            <Form.Item label="预期交付物（每行一条）">
              <Input.TextArea rows={8} defaultValue={caseDetail.deliverables.join('\n')} />
            </Form.Item>
          </Form>
        );

      case 'evaluation':
        return (
          <>
            <Table
              size="small"
              pagination={false}
              rowKey="name"
              dataSource={caseDetail.evaluation}
              columns={[
                { title: '评分项', dataIndex: 'name' },
                {
                  title: '权重',
                  dataIndex: 'weight',
                  width: 160,
                  render: (v) => <InputNumber size="small" defaultValue={v} min={0} max={100} suffix="分" />,
                },
              ]}
              summary={() => (
                <Table.Summary.Row style={{ background: '#f7f9fc' }}>
                  <Table.Summary.Cell index={0}>
                    <b>合计</b>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1}>
                    <b>100 分</b>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              )}
            />
            <Button type="dashed" icon={<PlusOutlined />} style={{ marginTop: 12 }} block>
              添加自定义评分项
            </Button>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fde-page">
      {ctx}
      <PageHead
        title="Admin · 行业案例设计器"
        desc="教师在此创建行业案例：业务背景、利益相关者 Persona、隐藏事实、数据沙盒、工具与评分标准"
        extra={
          <Space>
            <Button icon={<SaveOutlined />} onClick={() => msg.success('草稿已保存')}>
              保存草稿
            </Button>
            <Button type="primary" onClick={() => msg.success('案例已发布到案例库')}>
              发布案例
            </Button>
          </Space>
        }
      />

      <Row gutter={14}>
        <Col span={5}>
          <Card size="small" bordered={false}>
            <Steps
              size="small"
              direction="vertical"
              current={step}
              onChange={setStep}
              items={caseBuilderSteps.map((s, i) => ({
                title: <span style={{ fontSize: 12.5 }}>{`${i + 1} ${s.title}`}</span>,
                description: <span style={{ fontSize: 11 }}>{s.cn}</span>,
              }))}
            />
          </Card>
        </Col>

        <Col span={19}>
          <Card
            size="small"
            bordered={false}
            title={`${step + 1}. ${caseBuilderSteps[step].title} · ${caseBuilderSteps[step].cn}`}
            extra={
              <Space>
                <Button size="small" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
                  上一步
                </Button>
                <Button
                  size="small"
                  type="primary"
                  disabled={step === caseBuilderSteps.length - 1}
                  onClick={() => setStep((s) => s + 1)}
                >
                  下一步
                </Button>
              </Space>
            }
            styles={{ body: { minHeight: 520 } }}
          >
            {content()}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
