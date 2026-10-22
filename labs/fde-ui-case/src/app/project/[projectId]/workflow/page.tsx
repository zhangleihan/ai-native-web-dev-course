'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Button, Card, Col, Descriptions, Row, Space, Table, Tag, Timeline, message } from 'antd';
import { BranchesOutlined, HistoryOutlined, PlusOutlined, SaveOutlined } from '@ant-design/icons';
import type { Edge, Node } from 'reactflow';
import { MarkerType } from 'reactflow';
import FlowCanvas, { type FdeNodeData } from '@/components/FlowCanvas';
import { PageHead } from '@/components/ui';
import { useStore } from '@/lib/store';
import { nodePalette } from '@/mock';

const colorOf = (kind: string) => nodePalette.find((p) => p.kind === kind)?.color ?? '#8c8c8c';

export default function WorkflowPage() {
  const { dataset } = useStore();
  const {
    nodes: workflowNodes,
    edges: workflowEdges,
    versions: workflowVersions,
    title,
    currentVersion,
    checks,
    warning,
  } = dataset.workflow;

  const [extra, setExtra] = useState<{ id: string; kind: string; x: number; y: number }[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [msg, ctx] = message.useMessage();

  useEffect(() => {
    setSelected(null);
    setExtra([]);
  }, [workflowNodes]);

  const nodes: Node<FdeNodeData>[] = useMemo(
    () => [
      ...workflowNodes.map((n) => ({
        id: n.id,
        type: 'fde',
        position: { x: n.x, y: n.y },
        data: { label: n.label, sub: n.sub, color: colorOf(n.kind), badge: n.kind },
      })),
      ...extra.map((n) => ({
        id: n.id,
        type: 'fde',
        position: { x: n.x, y: n.y },
        data: { label: `新增 ${n.kind}`, sub: '待配置', color: colorOf(n.kind), badge: n.kind },
      })),
    ],
    [extra, workflowNodes],
  );

  const edges: Edge[] = useMemo(
    () =>
      workflowEdges.map((e) => ({
        ...e,
        type: 'smoothstep',
        animated: !e.label,
        style: {
          stroke:
            e.label === 'No' || e.label === 'High' || e.label === '不合格'
              ? '#fa8c16'
              : e.label === 'Approved'
                ? '#52c41a'
                : '#9db8dd',
          strokeWidth: 1.6,
        },
        labelStyle: { fontSize: 10.5, fill: '#5a6a83', fontWeight: 600 },
        labelBgStyle: { fill: '#fff' },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#9db8dd' },
      })),
    [workflowEdges],
  );

  const node = workflowNodes.find((n) => n.id === selected);

  const addNode = (kind: string) => {
    setExtra((p) => [...p, { id: `wfx-${Date.now()}`, kind, x: 850, y: 100 + p.length * 90 }]);
    msg.success(`已添加 ${kind} 节点`);
  };

  return (
    <div className="fde-page">
      {ctx}
      <PageHead
        title="Workflow Designer"
        desc="确定性流程编排：节点可以是 Agent、工具、条件分支或人工审批，保证每一步都可预测、可追踪"
        extra={
          <Space>
            <Tag color="blue" style={{ margin: 0 }}>
              当前版本 {currentVersion}
            </Tag>
            <Button icon={<SaveOutlined />}>保存为新版本</Button>
            <Button type="primary" icon={<BranchesOutlined />}>
              发布流程
            </Button>
          </Space>
        }
      />

      <Row gutter={14}>
        <Col span={4}>
          <Card size="small" bordered={false} title="节点面板" styles={{ body: { padding: 10 } }}>
            <Space direction="vertical" size={5} style={{ width: '100%' }}>
              {nodePalette.map((p) => (
                <div
                  key={p.kind}
                  onClick={() => addNode(p.kind)}
                  style={{
                    border: `1px solid ${p.color}44`,
                    background: `${p.color}0d`,
                    borderRadius: 6,
                    padding: '6px 9px',
                    cursor: 'pointer',
                  }}
                >
                  <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                    <span style={{ fontSize: 11.5, fontWeight: 600, color: p.color }}>{p.kind}</span>
                    <PlusOutlined style={{ fontSize: 9, color: p.color }} />
                  </Space>
                  <div style={{ fontSize: 10, color: 'var(--fde-text-dim)' }}>{p.desc}</div>
                </div>
              ))}
            </Space>
          </Card>

          <Card
            size="small"
            bordered={false}
            title={
              <Space>
                <HistoryOutlined />
                版本历史
              </Space>
            }
            style={{ marginTop: 14 }}
          >
            <Timeline
              style={{ marginTop: 4 }}
              items={workflowVersions.map((v) => ({
                color: v.current ? 'blue' : 'gray',
                children: (
                  <div style={{ fontSize: 11.5, lineHeight: 1.7 }}>
                    <Space size={5}>
                      <b>{v.version}</b>
                      {v.current && (
                        <Tag color="blue" style={{ margin: 0, fontSize: 9 }}>
                          当前
                        </Tag>
                      )}
                    </Space>
                    <div style={{ color: 'var(--fde-text-dim)' }}>{v.note}</div>
                    <div style={{ color: '#b0bacb', fontSize: 10.5 }}>
                      {v.author} · {v.time.slice(5)}
                    </div>
                  </div>
                ),
              }))}
            />
          </Card>
        </Col>

        <Col span={14}>
          <Card size="small" bordered={false} title={title} styles={{ body: { padding: 10 } }}>
            <FlowCanvas nodes={nodes} edges={edges} height={720} onNodeClick={setSelected} />
          </Card>
        </Col>

        <Col span={6}>
          <Card size="small" bordered={false} title="节点配置" style={{ marginBottom: 14 }}>
            {node ? (
              <>
                <Space style={{ justifyContent: 'space-between', width: '100%', marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 14.5, fontWeight: 650 }}>{node.label}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--fde-text-dim)' }}>{node.sub}</div>
                  </div>
                  <Tag color={colorOf(node.kind)} style={{ margin: 0 }}>
                    {node.kind}
                  </Tag>
                </Space>
                <Descriptions size="small" column={1} bordered labelStyle={{ width: 84 }}>
                  {(node.config ?? [{ label: '说明', value: '该节点使用默认配置' }]).map((c) => (
                    <Descriptions.Item key={c.label} label={c.label}>
                      <span style={{ fontSize: 11.5 }}>{c.value}</span>
                    </Descriptions.Item>
                  ))}
                </Descriptions>
              </>
            ) : (
              <div style={{ color: 'var(--fde-text-dim)', fontSize: 12, padding: '20px 0', textAlign: 'center' }}>
                点击画布节点查看配置
              </div>
            )}
          </Card>

          <Card size="small" bordered={false} title="流程校验">
            <Table
              size="small"
              pagination={false}
              showHeader={false}
              rowKey="item"
              dataSource={checks}
              columns={[
                { dataIndex: 'item', render: (v) => <span style={{ fontSize: 11.5 }}>{v}</span> },
                {
                  dataIndex: 'ok',
                  width: 52,
                  render: (v) =>
                    v ? (
                      <Tag color="success" style={{ margin: 0, fontSize: 10 }}>
                        通过
                      </Tag>
                    ) : (
                      <Tag color="warning" style={{ margin: 0, fontSize: 10 }}>
                        待补
                      </Tag>
                    ),
                },
              ]}
            />
            <div
              style={{
                marginTop: 10,
                fontSize: 11.5,
                color: '#ad6800',
                background: '#fffbe6',
                border: '1px solid #ffe58f',
                borderRadius: 7,
                padding: '8px 10px',
                lineHeight: 1.75,
              }}
            >
              {warning}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
