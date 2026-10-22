'use client';

import React, { useMemo, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  Col,
  Descriptions,
  Empty,
  Row,
  Segmented,
  Space,
  Switch,
  Table,
  Tabs,
  Tag,
  Tooltip,
  message,
} from 'antd';
import {
  ApartmentOutlined,
  CheckOutlined,
  CloseOutlined,
  DatabaseOutlined,
  NodeIndexOutlined,
  RobotOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import type { Edge, Node } from 'reactflow';
import { MarkerType } from 'reactflow';
import FlowCanvas, { type FdeNodeData } from '@/components/FlowCanvas';
import { ConfidenceTag, Legend, PageHead } from '@/components/ui';
import { useStore } from '@/lib/store';
import { riskColor } from '@/lib/theme';

const kindColor: Record<string, string> = {
  Object: '#1677ff',
  Relation: '#13c2c2',
  Action: '#722ed1',
  Rule: '#fa8c16',
};

export default function OntologyPage() {
  const { objects, relations, actions, rules, candidates, decideCandidate, toggleRule } = useStore();
  const [tab, setTab] = useState('Objects');
  const [selected, setSelected] = useState<string | null>(null);
  const [copilotRunning, setCopilotRunning] = useState(false);
  const [copilotDone, setCopilotDone] = useState(false);
  const [msg, ctx] = message.useMessage();

  const nodes: Node<FdeNodeData>[] = useMemo(
    () =>
      objects.map((o) => ({
        id: o.id,
        type: 'fde',
        position: { x: o.x, y: o.y },
        data: {
          label: o.name,
          sub: `${o.cn} · ${o.properties.length} 属性`,
          color: '#1677ff',
          badge: 'Object',
        },
      })),
    [objects],
  );

  const edges: Edge[] = useMemo(
    () =>
      relations.map((r) => ({
        id: r.id,
        source: r.from,
        target: r.to,
        label: `${r.type} (${r.cardinality})`,
        type: 'smoothstep',
        animated: r.type === 'generates' || r.type === 'triggers',
        style: { stroke: '#7aa7e0', strokeWidth: 1.6 },
        labelStyle: { fontSize: 10.5, fill: '#5a6a83' },
        labelBgStyle: { fill: '#fff' },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#7aa7e0' },
      })),
    [relations],
  );

  const selectedObj = objects.find((o) => o.id === selected) ?? objects[0];
  const pending = candidates.filter((c) => c.status === 'pending');

  const runCopilot = () => {
    setCopilotRunning(true);
    setTimeout(() => {
      setCopilotRunning(false);
      setCopilotDone(true);
      msg.success(`Ontology Copilot 生成 ${pending.length} 个候选，请逐一确认后进入正式模型`);
    }, 1500);
  };

  return (
    <div className="fde-page">
      {ctx}
      <PageHead
        title="Model · Ontology Studio"
        desc="Object / Relation / Action / Rule 四要素建模，构建业务数字骨架。AI 生成的候选必须由学生确认后才进入正式 Ontology"
        extra={
          <Space>
            <Badge count={pending.length} size="small">
              <Button icon={<RobotOutlined />} loading={copilotRunning} onClick={runCopilot}>
                运行 Ontology Copilot
              </Button>
            </Badge>
            <Button type="primary" icon={<DatabaseOutlined />}>
              导出 Schema
            </Button>
          </Space>
        }
      />

      <Row gutter={14}>
        <Col span={5}>
          <Card size="small" bordered={false} styles={{ body: { padding: 10 } }}>
            <Segmented
              block
              size="small"
              options={['Objects', 'Relations', 'Actions', 'Rules']}
              value={tab}
              onChange={(v) => setTab(v as string)}
              style={{ marginBottom: 10 }}
            />
            <div style={{ maxHeight: 520, overflow: 'auto' }}>
              {tab === 'Objects' &&
                objects.map((o) => (
                  <div
                    key={o.id}
                    onClick={() => setSelected(o.id)}
                    style={{
                      padding: '8px 10px',
                      borderRadius: 7,
                      cursor: 'pointer',
                      marginBottom: 5,
                      border: `1px solid ${selected === o.id ? '#91caff' : 'transparent'}`,
                      background: selected === o.id ? '#eaf3ff' : '#fafbfd',
                    }}
                  >
                    <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                      <span style={{ fontSize: 12.5, fontWeight: 600 }}>{o.name}</span>
                      <Tag style={{ margin: 0, fontSize: 10 }}>{o.properties.length}</Tag>
                    </Space>
                    <div style={{ fontSize: 10.5, color: 'var(--fde-text-dim)' }}>{o.cn}</div>
                  </div>
                ))}

              {tab === 'Relations' &&
                relations.map((r) => {
                  const from = objects.find((o) => o.id === r.from)?.name ?? r.from;
                  const to = objects.find((o) => o.id === r.to)?.name ?? r.to;
                  return (
                    <div
                      key={r.id}
                      style={{ padding: '8px 10px', borderRadius: 7, marginBottom: 5, background: '#fafbfd' }}
                    >
                      <div style={{ fontSize: 11.5, fontWeight: 550 }}>
                        {from} <span style={{ color: '#13c2c2' }}>{r.type}</span> {to}
                      </div>
                      <div style={{ fontSize: 10.5, color: 'var(--fde-text-dim)' }}>{r.cardinality}</div>
                    </div>
                  );
                })}

              {tab === 'Actions' &&
                actions.map((a) => (
                  <div key={a.id} style={{ padding: '8px 10px', borderRadius: 7, marginBottom: 5, background: '#fafbfd' }}>
                    <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                      <span style={{ fontSize: 12, fontWeight: 600 }}>{a.name}</span>
                      <Tag color={riskColor[a.risk]} style={{ margin: 0, fontSize: 9 }}>
                        {a.risk}
                      </Tag>
                    </Space>
                    <div style={{ fontSize: 10.5, color: 'var(--fde-text-dim)' }}>{a.executorType}</div>
                  </div>
                ))}

              {tab === 'Rules' &&
                rules.map((r) => (
                  <div key={r.id} style={{ padding: '8px 10px', borderRadius: 7, marginBottom: 5, background: '#fafbfd' }}>
                    <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                      <span style={{ fontSize: 12, fontWeight: 600 }}>{r.name}</span>
                      <Switch size="small" checked={r.enabled} onChange={() => toggleRule(r.id)} />
                    </Space>
                  </div>
                ))}
            </div>

            <div style={{ borderTop: '1px dashed #eef1f6', marginTop: 8, paddingTop: 8 }}>
              <Space size={[6, 6]} wrap style={{ fontSize: 11 }}>
                <Tag style={{ margin: 0 }}>对象 {objects.length}</Tag>
                <Tag style={{ margin: 0 }}>关系 {relations.length}</Tag>
                <Tag style={{ margin: 0 }}>动作 {actions.length}</Tag>
                <Tag style={{ margin: 0 }}>规则 {rules.length}</Tag>
              </Space>
            </div>
          </Card>

          <Card size="small" bordered={false} title="Data Sources" style={{ marginTop: 14 }}>
            {Array.from(new Set(objects.map((o) => o.source))).map((s) => (
              <div key={s} style={{ fontSize: 11.5, color: '#4a5b76', padding: '4px 0' }}>
                <DatabaseOutlined style={{ color: '#13c2c2', marginRight: 6 }} />
                {s}
              </div>
            ))}
          </Card>
        </Col>

        <Col span={12}>
          <Card
            size="small"
            bordered={false}
            title={
              <Space>
                <ApartmentOutlined style={{ color: '#1677ff' }} />
                Ontology Canvas
              </Space>
            }
            extra={<Legend items={[{ color: '#1677ff', label: 'Object' }, { color: '#7aa7e0', label: 'Relation' }]} />}
            styles={{ body: { padding: 10 } }}
          >
            <FlowCanvas nodes={nodes} edges={edges} height={600} onNodeClick={setSelected} />
          </Card>
        </Col>

        <Col span={7}>
          <Tabs
            size="small"
            items={[
              {
                key: 'prop',
                label: '属性面板',
                children: selectedObj ? (
                  <Card size="small" bordered={false} styles={{ body: { padding: 14 } }}>
                    <Space style={{ justifyContent: 'space-between', width: '100%', marginBottom: 10 }}>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 650 }}>{selectedObj.name}</div>
                        <div style={{ fontSize: 11.5, color: 'var(--fde-text-dim)' }}>{selectedObj.cn}</div>
                      </div>
                      <Tag color="blue" style={{ margin: 0 }}>
                        Object
                      </Tag>
                    </Space>

                    <Descriptions size="small" column={1} bordered labelStyle={{ width: 76 }} style={{ marginBottom: 12 }}>
                      <Descriptions.Item label="描述">{selectedObj.description}</Descriptions.Item>
                      <Descriptions.Item label="数据来源">{selectedObj.source}</Descriptions.Item>
                      <Descriptions.Item label="关系数">
                        {relations.filter((r) => r.from === selectedObj.id || r.to === selectedObj.id).length}
                      </Descriptions.Item>
                    </Descriptions>

                    <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 8 }}>属性定义</div>
                    <Table
                      size="small"
                      pagination={false}
                      rowKey="name"
                      dataSource={selectedObj.properties}
                      columns={[
                        {
                          title: '字段',
                          dataIndex: 'name',
                          render: (v, r) => (
                            <Space size={4}>
                              <span className="fde-mono">{v}</span>
                              {r.pk && (
                                <Tag color="gold" style={{ margin: 0, fontSize: 9, padding: '0 3px' }}>
                                  PK
                                </Tag>
                              )}
                            </Space>
                          ),
                        },
                        { title: '类型', dataIndex: 'type', width: 66, render: (v) => <Tag style={{ margin: 0, fontSize: 10 }}>{v}</Tag> },
                        {
                          title: '必填',
                          dataIndex: 'required',
                          width: 48,
                          render: (v) => (v ? <CheckOutlined style={{ color: '#52c41a' }} /> : '—'),
                        },
                      ]}
                      expandable={{
                        expandedRowRender: (r) => (
                          <span style={{ fontSize: 11.5, color: 'var(--fde-text-dim)' }}>{r.desc}</span>
                        ),
                      }}
                    />

                    <div style={{ fontSize: 12.5, fontWeight: 600, margin: '14px 0 8px' }}>YAML 定义</div>
                    <pre className="fde-code-light">{`Object:
  name: ${selectedObj.name}
  cn: ${selectedObj.cn}
  source: ${selectedObj.source}
  properties:
${selectedObj.properties.map((p) => `    - ${p.name}: ${p.type}${p.pk ? ' (PK)' : ''}${p.required ? ' *' : ''}`).join('\n')}`}</pre>
                  </Card>
                ) : (
                  <Empty description="点击画布中的节点查看属性" />
                ),
              },
              {
                key: 'copilot',
                label: (
                  <Badge count={pending.length} size="small" offset={[8, -2]}>
                    <span>AI Copilot</span>
                  </Badge>
                ),
                children: (
                  <Card size="small" bordered={false} styles={{ body: { padding: 14 } }}>
                    <div
                      style={{
                        background: '#f7f9fc',
                        borderRadius: 8,
                        padding: '10px 12px',
                        fontSize: 11.5,
                        lineHeight: 1.85,
                        color: '#4a5b76',
                        marginBottom: 12,
                      }}
                    >
                      <b>输入</b>：Business Context + 访谈记录（{'已确认洞察'}）+ Problem Canvas + 数据集 Schema + API 文档
                      <br />
                      <b>输出</b>：Objects / Relations / Actions / Rules 候选，每项必须带 Reason、Evidence、Confidence
                    </div>

                    {!copilotDone && pending.length === candidates.length && (
                      <div style={{ textAlign: 'center', padding: '20px 0' }}>
                        <Button type="primary" icon={<ThunderboltOutlined />} loading={copilotRunning} onClick={runCopilot}>
                          生成候选
                        </Button>
                      </div>
                    )}

                    <Space direction="vertical" size={10} style={{ width: '100%', maxHeight: 520, overflow: 'auto' }}>
                      {candidates.map((c) => (
                        <div
                          key={c.id}
                          style={{
                            border: '1px solid var(--fde-border)',
                            borderRadius: 8,
                            padding: '10px 12px',
                            background: c.status === 'pending' ? '#fff' : '#fafafa',
                            opacity: c.status === 'rejected' ? 0.55 : 1,
                          }}
                        >
                          <Space style={{ justifyContent: 'space-between', width: '100%', marginBottom: 6 }}>
                            <Space size={6}>
                              <Tag color={kindColor[c.kind]} style={{ margin: 0, fontSize: 10 }}>
                                {c.kind}
                              </Tag>
                              <ConfidenceTag value={c.confidence} />
                            </Space>
                            {c.status === 'accepted' && (
                              <Tag color="success" style={{ margin: 0, fontSize: 10 }}>
                                已加入
                              </Tag>
                            )}
                            {c.status === 'rejected' && <Tag style={{ margin: 0, fontSize: 10 }}>已否决</Tag>}
                          </Space>

                          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>{c.name}</div>
                          <div style={{ fontSize: 11.5, lineHeight: 1.8, color: '#4a5b76' }}>
                            <div>
                              <b style={{ color: '#1677ff' }}>Reason</b>：{c.reason}
                            </div>
                            <div style={{ marginTop: 3 }}>
                              <b style={{ color: '#52c41a' }}>Evidence</b>：{c.evidence}
                            </div>
                          </div>

                          {c.status === 'pending' && (
                            <Space size={6} style={{ marginTop: 9 }}>
                              <Button
                                size="small"
                                type="primary"
                                icon={<CheckOutlined />}
                                onClick={() => {
                                  decideCandidate(c.id, true);
                                  msg.success(`${c.name} 已加入正式 Ontology`);
                                }}
                              >
                                确认加入
                              </Button>
                              <Button size="small" icon={<CloseOutlined />} onClick={() => decideCandidate(c.id, false)}>
                                否决
                              </Button>
                            </Space>
                          )}
                        </div>
                      ))}
                    </Space>
                  </Card>
                ),
              },
              {
                key: 'rules',
                label: '规则与动作',
                children: (
                  <Card size="small" bordered={false} styles={{ body: { padding: 14 } }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 8 }}>
                      <NodeIndexOutlined /> Actions
                    </div>
                    <Space direction="vertical" size={8} style={{ width: '100%', marginBottom: 16 }}>
                      {actions.map((a) => (
                        <div key={a.id} style={{ border: '1px solid var(--fde-border)', borderRadius: 8, padding: '9px 11px' }}>
                          <Space style={{ justifyContent: 'space-between', width: '100%', marginBottom: 4 }}>
                            <b style={{ fontSize: 12.5 }}>{a.name}</b>
                            <Space size={4}>
                              <Tag style={{ margin: 0, fontSize: 10 }}>{a.executorType}</Tag>
                              <Tooltip title={`风险等级 ${a.risk}`}>
                                <Tag color={riskColor[a.risk]} style={{ margin: 0, fontSize: 10 }}>
                                  {a.risk}
                                </Tag>
                              </Tooltip>
                            </Space>
                          </Space>
                          <div className="fde-mono" style={{ color: '#8c8c8c', marginBottom: 3 }}>
                            {a.endpoint}
                          </div>
                          <div style={{ fontSize: 11.5, color: 'var(--fde-text-dim)', lineHeight: 1.7 }}>{a.desc}</div>
                        </div>
                      ))}
                    </Space>

                    <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 8 }}>Rules</div>
                    <Space direction="vertical" size={8} style={{ width: '100%' }}>
                      {rules.map((r) => (
                        <div
                          key={r.id}
                          style={{
                            border: '1px solid var(--fde-border)',
                            borderRadius: 8,
                            padding: '9px 11px',
                            opacity: r.enabled ? 1 : 0.5,
                          }}
                        >
                          <Space style={{ justifyContent: 'space-between', width: '100%', marginBottom: 6 }}>
                            <b style={{ fontSize: 12.5 }}>{r.name}</b>
                            <Switch size="small" checked={r.enabled} onChange={() => toggleRule(r.id)} />
                          </Space>
                          <pre className="fde-code-light" style={{ fontSize: 11 }}>{`IF:
${r.ifExpr.map((e) => `  ${e}`).join('\n')}
THEN:
  ${r.thenExpr}`}</pre>
                        </div>
                      ))}
                    </Space>
                  </Card>
                ),
              },
            ]}
          />
        </Col>
      </Row>
    </div>
  );
}
