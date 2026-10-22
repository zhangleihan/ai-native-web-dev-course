'use client';

import React from 'react';
import { Alert, Badge, Button, Card, Col, Progress, Row, Space, Statistic, Table, Tabs, Tag, message } from 'antd';
import {
  AuditOutlined,
  CloudServerOutlined,
  ClusterOutlined,
  DatabaseOutlined,
  DeploymentUnitOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { PageHead } from '@/components/ui';
import { auditLogs, modelProviders, platformStats, resourceQuotas, routingStrategies, runtimeBases } from '@/mock';

export default function AdminResourcesPage() {
  const [msg, ctx] = message.useMessage();

  return (
    <div className="fde-page">
      {ctx}
      <PageHead
        title="Admin · 模型与资源管理"
        desc="运行底座（自建 / 公有云 / 灵畿）、Model Router、资源配额与全平台审计。行业案例默认数据不出域"
      />

      <Row gutter={12} style={{ marginBottom: 16 }}>
        {[
          { label: '注册用户', value: platformStats.users },
          { label: '教师', value: platformStats.teachers },
          { label: '行业案例', value: platformStats.cases },
          { label: '在建项目', value: platformStats.projects },
          { label: 'Agent 运行', value: platformStats.runs },
          { label: '沙箱部署', value: platformStats.deployments },
          { label: '今日 Token', value: `${(platformStats.tokensToday / 10000).toFixed(0)} 万` },
          { label: '今日成本', value: '¥0（内网）' },
        ].map((s) => (
          <Col span={3} key={s.label}>
            <Card size="small" bordered={false}>
              <Statistic title={s.label} value={s.value} valueStyle={{ fontSize: 18 }} />
            </Card>
          </Col>
        ))}
      </Row>

      <Tabs
        defaultActiveKey="base"
        items={[
          {
            key: 'base',
            label: (
              <span>
                <CloudServerOutlined /> 运行底座
              </span>
            ),
            children: (
              <Row gutter={14}>
                <Col span={16}>
                  <Card size="small" bordered={false} title="可选底座" extra={<Button size="small">接入新底座</Button>}>
                    <Table
                      size="small"
                      pagination={false}
                      rowKey="id"
                      dataSource={runtimeBases}
                      columns={[
                        {
                          title: '底座',
                          dataIndex: 'name',
                          width: 200,
                          render: (v, r) => (
                            <Space size={6}>
                              <b style={{ fontSize: 12.5 }}>{v}</b>
                              <Tag style={{ margin: 0, fontSize: 10 }} color={r.accent}>
                                {r.tag}
                              </Tag>
                            </Space>
                          ),
                        },
                        { title: '适用场景', dataIndex: 'fit' },
                        { title: '模型供给', dataIndex: 'models', width: 200 },
                        { title: '网络', dataIndex: 'network', width: 140 },
                        {
                          title: '状态',
                          dataIndex: 'status',
                          width: 100,
                          render: (v) => (
                            <Tag color={v === 'active' ? 'success' : v === 'available' ? 'blue' : 'default'} style={{ margin: 0 }}>
                              {v === 'active' ? '当前' : v === 'available' ? '可选' : '备用'}
                            </Tag>
                          ),
                        },
                        {
                          title: '操作',
                          width: 88,
                          render: (_, r) => (
                            <Button
                              type="link"
                              size="small"
                              disabled={r.status === 'active'}
                              onClick={() => msg.success(`已将默认底座切换为 ${r.name}（原型演示）`)}
                            >
                              设为默认
                            </Button>
                          ),
                        },
                      ]}
                      expandable={{
                        expandedRowRender: (r) => (
                          <div style={{ fontSize: 12, color: 'var(--fde-text-dim)', lineHeight: 1.8, paddingLeft: 8 }}>
                            {r.summary}
                            <br />
                            Agent 实现环境：{r.ide}
                          </div>
                        ),
                      }}
                    />
                  </Card>
                  <Alert
                    type="info"
                    showIcon
                    style={{ marginTop: 14 }}
                    message="中国移动灵畿科研平台：换底座，不换教学主流程"
                    description="接入后 Model Router 增加九天及汇聚模型网关，Git 与项目空间可同步到灵畿。账号、案例库、Harness 权限、审批与评测仍由本平台管理，避免把实训过程锁进单一厂商控制台。"
                  />
                </Col>
                <Col span={8}>
                  <Card size="small" bordered={false} title="接入原则">
                    <Space direction="vertical" size={10} style={{ width: '100%' }}>
                      {[
                        { t: '控制面自管', d: '用户、课程、案例、评分、审计留在 AI-FDE Lab' },
                        { t: '数据面可选', d: '推理与模型可走自建 GPU、公有云或灵畿专线' },
                        { t: 'Agent 实现开放', d: 'Studio / Cursor / VS Code / 灵畿研发环境并行' },
                        { t: '运行治理封闭', d: 'Agent.run 必须经 Harness，IDE 不得直连模型绕过审批' },
                      ].map((i) => (
                        <div key={i.t} style={{ border: '1px solid var(--fde-border)', borderRadius: 8, padding: '9px 11px' }}>
                          <b style={{ fontSize: 12.5 }}>{i.t}</b>
                          <div style={{ fontSize: 11.5, color: 'var(--fde-text-dim)', lineHeight: 1.7, marginTop: 2 }}>{i.d}</div>
                        </div>
                      ))}
                    </Space>
                  </Card>
                </Col>
              </Row>
            ),
          },
          {
            key: 'model',
            label: (
              <span>
                <DeploymentUnitOutlined /> Model Router
              </span>
            ),
            children: (
              <Row gutter={14}>
                <Col span={17}>
                  <Card size="small" bordered={false} title="Model Gateway" extra={<Button size="small">接入新模型</Button>}>
                    <Table
                      size="small"
                      pagination={false}
                      rowKey="id"
                      dataSource={modelProviders}
                      columns={[
                        {
                          title: 'Provider',
                          dataIndex: 'provider',
                          width: 168,
                          render: (v, r) => (
                            <Space size={6}>
                              <Badge status={r.status === 'healthy' ? 'success' : 'default'} />
                              <b style={{ fontSize: 12.5 }}>{v}</b>
                            </Space>
                          ),
                        },
                        {
                          title: 'Models',
                          dataIndex: 'models',
                          render: (v: string[]) => (
                            <Space size={[4, 4]} wrap>
                              {v.map((m) => (
                                <Tag key={m} style={{ margin: 0, fontSize: 10 }} className="fde-mono">
                                  {m}
                                </Tag>
                              ))}
                            </Space>
                          ),
                        },
                        {
                          title: 'Endpoint',
                          dataIndex: 'endpoint',
                          width: 210,
                          render: (v) => <span className="fde-mono">{v}</span>,
                        },
                        {
                          title: '状态',
                          dataIndex: 'status',
                          width: 88,
                          render: (v) => (
                            <Tag color={v === 'healthy' ? 'success' : 'default'} style={{ margin: 0 }}>
                              {v}
                            </Tag>
                          ),
                        },
                        {
                          title: '时延',
                          dataIndex: 'latency',
                          width: 78,
                          render: (v: number) => (v ? `${v}ms` : '—'),
                        },
                        {
                          title: '用量占比',
                          dataIndex: 'usage',
                          width: 118,
                          render: (v: number) => (
                            <Space size={6}>
                              <Progress percent={v} size="small" showInfo={false} style={{ width: 58 }} />
                              <span style={{ fontSize: 11 }}>{v}%</span>
                            </Space>
                          ),
                        },
                      ]}
                      expandable={{
                        expandedRowRender: (r) => (
                          <div style={{ fontSize: 11.5, color: 'var(--fde-text-dim)', paddingLeft: 8 }}>{r.note}</div>
                        ),
                      }}
                    />
                  </Card>

                  <Card size="small" bordered={false} title="模型配置模板" style={{ marginTop: 14 }}>
                    <pre className="fde-code">{`model:
  provider: qwen-private
  model_name: qwen2.5-72b-instruct
  temperature: 0.2
  max_tokens: 4096
  timeout: 60
  fallback:
    - provider: deepseek-private
      model_name: deepseek-v3
    - provider: qwen-private
      model_name: qwen2.5-32b-instruct

policy:
  data_residency: internal-network-only
  public_api: denied`}</pre>
                  </Card>
                </Col>

                <Col span={7}>
                  <Card size="small" bordered={false} title="路由策略" style={{ marginBottom: 14 }}>
                    <Space direction="vertical" size={9} style={{ width: '100%' }}>
                      {routingStrategies.map((s) => (
                        <div
                          key={s.key}
                          style={{
                            border: `1px solid ${s.active ? '#b7ebc6' : 'var(--fde-border)'}`,
                            background: s.active ? '#f6ffed' : '#fff',
                            borderRadius: 8,
                            padding: '9px 11px',
                          }}
                        >
                          <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                            <b style={{ fontSize: 12.5 }}>{s.name}</b>
                            {s.active && (
                              <Tag color="success" style={{ margin: 0, fontSize: 9 }}>
                                启用
                              </Tag>
                            )}
                          </Space>
                          <div style={{ fontSize: 11, color: 'var(--fde-text-dim)', lineHeight: 1.65, marginTop: 2 }}>
                            {s.desc}
                          </div>
                        </div>
                      ))}
                    </Space>
                  </Card>

                  <Card size="small" bordered={false} title="合规策略">
                    <Space direction="vertical" size={8} style={{ width: '100%' }}>
                      {[
                        { k: '数据出境', v: '禁止', c: 'red' },
                        { k: '公有云 API', v: '通信案例禁用', c: 'red' },
                        { k: '模型部署', v: '内网私有化', c: 'green' },
                        { k: '日志留存', v: '180 天', c: 'blue' },
                        { k: 'Prompt 审计', v: '全量记录', c: 'blue' },
                      ].map((i) => (
                        <div key={i.k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                          <span style={{ color: 'var(--fde-text-dim)' }}>{i.k}</span>
                          <Tag color={i.c} style={{ margin: 0, fontSize: 10 }}>
                            {i.v}
                          </Tag>
                        </div>
                      ))}
                    </Space>
                  </Card>
                </Col>
              </Row>
            ),
          },
          {
            key: 'quota',
            label: (
              <span>
                <ClusterOutlined /> 资源配额
              </span>
            ),
            children: (
              <Row gutter={14}>
                <Col span={16}>
                  <Card size="small" bordered={false} title="团队资源使用">
                    <Table
                      size="small"
                      pagination={false}
                      rowKey="team"
                      dataSource={resourceQuotas}
                      columns={[
                        { title: '团队', dataIndex: 'team', width: 130 },
                        { title: 'CPU', dataIndex: 'cpu' },
                        { title: '内存', dataIndex: 'memory' },
                        { title: 'Agent Run', dataIndex: 'runs' },
                        { title: '存储', dataIndex: 'storage' },
                        {
                          title: '操作',
                          width: 130,
                          render: () => (
                            <Space size={4}>
                              <Button type="link" size="small" onClick={() => msg.info('原型演示：调整配额')}>
                                调整
                              </Button>
                              <Button type="link" size="small" danger>
                                回收
                              </Button>
                            </Space>
                          ),
                        },
                      ]}
                    />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card size="small" bordered={false} title="基础设施状态">
                    <Space direction="vertical" size={12} style={{ width: '100%' }}>
                      {[
                        { n: 'PostgreSQL + pgvector', s: 'healthy', d: '连接 34/100 · 存储 12.4 GB' },
                        { n: 'Redis', s: 'healthy', d: '内存 480 MB · QPS 1.2k' },
                        { n: 'MinIO', s: 'healthy', d: '对象 18.6 万 · 容量 214 GB' },
                        { n: 'Docker Sandbox Host', s: 'healthy', d: '容器 27 个 · CPU 42%' },
                        { n: 'Celery Worker', s: 'warning', d: '队列积压 18 个任务' },
                      ].map((i) => (
                        <div key={i.n}>
                          <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                            <Space size={6}>
                              <DatabaseOutlined style={{ color: i.s === 'healthy' ? '#52c41a' : '#faad14' }} />
                              <b style={{ fontSize: 12.5 }}>{i.n}</b>
                            </Space>
                            <Tag color={i.s === 'healthy' ? 'success' : 'warning'} style={{ margin: 0, fontSize: 10 }}>
                              {i.s}
                            </Tag>
                          </Space>
                          <div style={{ fontSize: 11, color: 'var(--fde-text-dim)', marginLeft: 20 }}>{i.d}</div>
                        </div>
                      ))}
                    </Space>
                  </Card>
                </Col>
              </Row>
            ),
          },
          {
            key: 'audit',
            label: (
              <span>
                <AuditOutlined /> 审计日志
              </span>
            ),
            children: (
              <Card size="small" bordered={false}>
                <Table
                  size="small"
                  pagination={{ pageSize: 10 }}
                  rowKey={(r) => r.time + r.action}
                  dataSource={auditLogs}
                  columns={[
                    { title: 'When', dataIndex: 'time', width: 156, render: (v) => <span className="fde-mono">{v}</span> },
                    { title: 'Who', dataIndex: 'who', width: 140 },
                    {
                      title: 'Action',
                      dataIndex: 'action',
                      width: 130,
                      render: (v) => (
                        <Tag
                          color={
                            v === 'APPROVE' ? 'green' : v === 'TOOL_BLOCKED' ? 'red' : v === 'DEPLOY' ? 'blue' : 'default'
                          }
                          style={{ margin: 0, fontSize: 10 }}
                        >
                          {v}
                        </Tag>
                      ),
                    },
                    { title: 'Target', dataIndex: 'target', width: 190, render: (v) => <span className="fde-mono">{v}</span> },
                    { title: 'Model', dataIndex: 'model', width: 116 },
                    { title: 'Result', dataIndex: 'result' },
                    { title: 'Token', dataIndex: 'tokens', width: 74 },
                    { title: 'Cost', dataIndex: 'cost', width: 66, render: (v: number) => (v ? `$${v}` : '—') },
                    { title: 'Latency', dataIndex: 'latency', width: 82 },
                  ]}
                />
                <div style={{ marginTop: 12, fontSize: 11.5, color: 'var(--fde-text-dim)', lineHeight: 1.8 }}>
                  <SettingOutlined /> 审计记录覆盖 Who / When / Agent / Model / Prompt Version / Context / Memory / Tool /
                  Action / Approval / Result / Token / Cost / Latency，既服务工程运维，也直接作为教学复盘材料。
                </div>
              </Card>
            ),
          },
        ]}
      />
    </div>
  );
}
