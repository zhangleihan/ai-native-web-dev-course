'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Card, Col, Input, Row, Space, Tag, message } from 'antd';
import {
  BulbOutlined,
  CloudServerOutlined,
  ClusterOutlined,
  DeploymentUnitOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  PlusOutlined,
  RobotOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import type { Edge, Node } from 'reactflow';
import { MarkerType } from 'reactflow';
import FlowCanvas, { type FdeNodeData } from '@/components/FlowCanvas';
import { PageHead } from '@/components/ui';
import { useStore } from '@/lib/store';
import { architectPalette, runtimeBases } from '@/mock';

const colorOf = (type: string) => architectPalette.find((p) => p.type === type)?.color ?? '#8c8c8c';

export default function DesignPage() {
  const { dataset } = useStore();
  const {
    solutionCanvas,
    architectureNodes,
    architectureEdges,
    suggestions: architectSuggestions,
  } = dataset.design;

  const [baseId, setBaseId] = useState(runtimeBases[0].id);

  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(solutionCanvas.map((f) => [f.key, f.value])),
  );
  const [editing, setEditing] = useState<string | null>(null);
  const [extraNodes, setExtraNodes] = useState<{ id: string; type: string; x: number; y: number }[]>([]);
  const [architectRunning, setArchitectRunning] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [msg, ctx] = message.useMessage();

  const nodes: Node<FdeNodeData>[] = useMemo(
    () => [
      ...architectureNodes.map((n) => ({
        id: n.id,
        type: 'fde',
        position: { x: n.x, y: n.y },
        data: { label: n.label, sub: n.sub, color: colorOf(n.type), badge: n.type },
      })),
      ...extraNodes.map((n) => ({
        id: n.id,
        type: 'fde',
        position: { x: n.x, y: n.y },
        data: { label: `新增 ${n.type}`, sub: '待配置', color: colorOf(n.type), badge: n.type },
      })),
    ],
    [architectureNodes, extraNodes],
  );

  const edges: Edge[] = useMemo(
    () =>
      architectureEdges.map((e) => ({
        ...e,
        type: 'smoothstep',
        animated: e.label === 'handoff',
        style: { stroke: e.label === '高风险' ? '#fa541c' : '#9db8dd', strokeWidth: 1.6 },
        labelStyle: { fontSize: 10, fill: '#5a6a83' },
        labelBgStyle: { fill: '#fff' },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#9db8dd' },
      })),
    [architectureEdges],
  );

  useEffect(() => {
    setValues(Object.fromEntries(solutionCanvas.map((f) => [f.key, f.value])));
    setExtraNodes([]);
  }, [solutionCanvas]);

  const addNode = (type: string) => {
    setExtraNodes((p) => [...p, { id: `extra-${Date.now()}`, type, x: 200 + p.length * 40, y: 520 }]);
    msg.success(`已添加 ${type} 组件到画布`);
  };

  const runArchitect = () => {
    setArchitectRunning(true);
    setShowSuggestions(false);
    setTimeout(() => {
      setArchitectRunning(false);
      setShowSuggestions(true);
      msg.success('AI Solution Architect 已完成方案分析');
    }, 1400);
  };

  const levelMeta: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
    must: { color: '#ff4d4f', icon: <ExclamationCircleOutlined />, label: '必须' },
    recommend: { color: '#1677ff', icon: <BulbOutlined />, label: '建议' },
    risk: { color: '#fa8c16', icon: <WarningOutlined />, label: '风险' },
  };

  return (
    <div className="fde-page">
      {ctx}
      <PageHead
        title="Design · AI Solution Designer"
        desc="把问题与业务模型转化为可落地的 AI 解决方案：先选运行底座，再用 Solution Canvas 定义边界，Architecture Builder 描述系统结构"
        extra={
          <Button type="primary" icon={<RobotOutlined />} loading={architectRunning} onClick={runArchitect}>
            运行 Solution Architect Agent
          </Button>
        }
      />

      <Card size="small" bordered={false} title="运行底座" style={{ marginBottom: 14 }} extra={<span style={{ fontSize: 11.5, color: 'var(--fde-text-dim)' }}>换底座不换教学主流程，Harness / Trace / Eval 接口保持稳定</span>}>
        <Row gutter={10}>
          {runtimeBases.map((b) => {
            const active = baseId === b.id;
            const icon =
              b.id === 'self-hosted' ? (
                <ClusterOutlined />
              ) : b.id === 'lingji' ? (
                <CloudServerOutlined />
              ) : (
                <DeploymentUnitOutlined />
              );
            return (
              <Col span={8} key={b.id}>
                <div
                  onClick={() => {
                    setBaseId(b.id);
                    msg.success(`已选择运行底座：${b.name}`);
                  }}
                  style={{
                    border: `1px solid ${active ? b.accent : 'var(--fde-border)'}`,
                    background: active ? `${b.accent}0d` : '#fff',
                    borderRadius: 8,
                    padding: '10px 12px',
                    cursor: 'pointer',
                    height: '100%',
                  }}
                >
                  <Space style={{ justifyContent: 'space-between', width: '100%', marginBottom: 6 }}>
                    <Space size={6}>
                      <span style={{ color: b.accent }}>{icon}</span>
                      <b style={{ fontSize: 13 }}>{b.name}</b>
                    </Space>
                    <Tag color={active ? b.accent : 'default'} style={{ margin: 0, fontSize: 10 }}>
                      {active ? '当前方案' : b.tag}
                    </Tag>
                  </Space>
                  <div style={{ fontSize: 11.5, lineHeight: 1.75, color: '#4a5b76' }}>{b.summary}</div>
                  <div style={{ fontSize: 11, color: 'var(--fde-text-dim)', marginTop: 6 }}>适用：{b.fit}</div>
                </div>
              </Col>
            );
          })}
        </Row>
        {baseId === 'lingji' && (
          <Alert
            type="info"
            showIcon
            style={{ marginTop: 12 }}
            message="灵畿作为底座：模型与算力走中国移动科研平台，控制面仍在本平台"
            description="账号、案例、Ontology、Harness 权限、人工审批与评测不迁出。Agent 实现可在灵畿研发环境完成，也可继续用 Cursor / VS Code，通过 Adapter 注册回 Agent.run()。"
          />
        )}
      </Card>

      <Row gutter={14}>
        <Col span={9}>
          <Card size="small" bordered={false} title="Solution Canvas" styles={{ body: { padding: 12 } }}>
            <Row gutter={[10, 10]}>
              {solutionCanvas.map((f) => (
                <Col span={12} key={f.key}>
                  <div
                    style={{
                      border: '1px solid var(--fde-border)',
                      borderRadius: 8,
                      padding: '9px 11px',
                      height: '100%',
                      background: '#fff',
                    }}
                  >
                    <Space style={{ justifyContent: 'space-between', width: '100%', marginBottom: 5 }}>
                      <div>
                        <div style={{ fontSize: 11.5, fontWeight: 640, color: '#16223a' }}>{f.label}</div>
                        <div style={{ fontSize: 10, color: 'var(--fde-text-dim)' }}>{f.cn}</div>
                      </div>
                      <EditOutlined
                        style={{ fontSize: 11, color: '#b9c2d0', cursor: 'pointer' }}
                        onClick={() => setEditing(editing === f.key ? null : f.key)}
                      />
                    </Space>
                    {editing === f.key ? (
                      <Input.TextArea
                        autoSize={{ minRows: 3, maxRows: 6 }}
                        value={values[f.key]}
                        onChange={(e) => setValues((p) => ({ ...p, [f.key]: e.target.value }))}
                        onBlur={() => setEditing(null)}
                        autoFocus
                        style={{ fontSize: 11.5 }}
                      />
                    ) : (
                      <div style={{ fontSize: 11.5, lineHeight: 1.75, color: '#4a5b76' }}>{values[f.key]}</div>
                    )}
                  </div>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>

        <Col span={15}>
          <Card
            size="small"
            bordered={false}
            title={
              <Space>
                <DeploymentUnitOutlined style={{ color: '#722ed1' }} />
                Architecture Builder
              </Space>
            }
            extra={<span style={{ fontSize: 11.5, color: 'var(--fde-text-dim)' }}>点击左侧组件添加到画布，节点可拖拽</span>}
            styles={{ body: { padding: 10 } }}
          >
            <Row gutter={10}>
              <Col span={4}>
                <div style={{ fontSize: 11, color: 'var(--fde-text-dim)', marginBottom: 6 }}>组件面板</div>
                <Space direction="vertical" size={5} style={{ width: '100%' }}>
                  {architectPalette.map((p) => (
                    <div
                      key={p.type}
                      onClick={() => addNode(p.type)}
                      style={{
                        border: `1px solid ${p.color}44`,
                        background: `${p.color}0d`,
                        borderRadius: 6,
                        padding: '5px 8px',
                        fontSize: 11,
                        cursor: 'pointer',
                        color: p.color,
                        fontWeight: 550,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      {p.type}
                      <PlusOutlined style={{ fontSize: 9 }} />
                    </div>
                  ))}
                </Space>
              </Col>
              <Col span={20}>
                <FlowCanvas nodes={nodes} edges={edges} height={520} minimap={false} />
              </Col>
            </Row>
          </Card>

          <Card
            size="small"
            bordered={false}
            title={
              <Space>
                <RobotOutlined style={{ color: '#1677ff' }} />
                AI Solution Architect 建议
              </Space>
            }
            style={{ marginTop: 14 }}
            extra={
              <span style={{ fontSize: 11.5, color: 'var(--fde-text-dim)' }}>
                输入：Problem + Ontology + Available Data + Available Tools + Constraints
              </span>
            }
          >
            {!showSuggestions ? (
              <div style={{ padding: '30px 0', textAlign: 'center', color: 'var(--fde-text-dim)' }}>
                <span className="blink">正在综合问题定义、Ontology 与工具清单生成方案建议…</span>
              </div>
            ) : (
              <Row gutter={[10, 10]}>
                {architectSuggestions.map((s) => {
                  const m = levelMeta[s.level];
                  return (
                    <Col span={12} key={s.title}>
                      <div
                        style={{
                          border: `1px solid ${m.color}33`,
                          background: `${m.color}08`,
                          borderRadius: 8,
                          padding: '10px 12px',
                          height: '100%',
                        }}
                      >
                        <Space size={6} style={{ marginBottom: 5 }}>
                          <Tag color={m.color} style={{ margin: 0, fontSize: 10 }} icon={m.icon}>
                            {m.label}
                          </Tag>
                          <b style={{ fontSize: 12.5 }}>{s.title}</b>
                        </Space>
                        <div style={{ fontSize: 11.5, lineHeight: 1.8, color: '#4a5b76' }}>{s.detail}</div>
                      </div>
                    </Col>
                  );
                })}
              </Row>
            )}

            <Alert
              type="info"
              showIcon
              style={{ marginTop: 12 }}
              message="POC 优先采用 Workflow + Agent，而不是完全自由的 Multi-Agent"
              description="运维场景对可预测性与可审计性的要求高于灵活性。确定性 Workflow 编排下挂专家 Agent，既能利用 LLM 的推理能力，又能保证每一步都可追踪、可干预、可复现。"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
