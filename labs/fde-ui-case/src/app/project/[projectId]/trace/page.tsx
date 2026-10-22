'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Alert,
  Button,
  Card,
  Col,
  Descriptions,
  Empty,
  Input,
  Modal,
  Row,
  Segmented,
  Space,
  Statistic,
  Table,
  Tabs,
  Tag,
  Timeline,
  Tooltip,
  message,
} from 'antd';
import {
  ApiOutlined,
  AuditOutlined,
  CaretRightFilled,
  CheckOutlined,
  CloseOutlined,
  EditOutlined,
  NodeIndexOutlined,
  SafetyCertificateOutlined,
  WarningFilled,
} from '@ant-design/icons';
import { PageHead } from '@/components/ui';
import { useStore } from '@/lib/store';
import { spanTypeColor, statusColor } from '@/lib/theme';
import type { TraceSpan } from '@/mock';

const spanTypeLabel: Record<string, string> = {
  context: 'Context Build',
  model: 'Model Call',
  retrieval: 'Retrieval',
  tool: 'Tool Call',
  handoff: 'Agent Handoff',
  memory_read: 'Memory Read',
  memory_write: 'Memory Write',
  approval: 'Approval',
  output: 'Output',
};

export default function TracePage() {
  const router = useRouter();
  const { run, startRun, decideApproval, dataset, project } = useStore();
  const { approvalHistory, historyRuns } = dataset.run;
  const [selectedSpan, setSelectedSpan] = useState<string | null>(null);
  const [view, setView] = useState('Timeline');
  const [approvalModal, setApprovalModal] = useState<'approve' | 'reject' | null>(null);
  const [comment, setComment] = useState('');
  const [msg, ctx] = message.useMessage();
  const P = `/project/${project.id}`;

  const spans = run.spans;
  const total = Math.max(1, spans.reduce((m, s) => Math.max(m, s.startMs + s.durationMs), 0));
  const span = spans.find((s) => s.id === selectedSpan) ?? spans[spans.length - 1];

  const approval = run.approval;
  const waiting = run.status === 'WAITING_APPROVAL' && approval?.status === 'pending';

  const decide = (approved: boolean) => {
    decideApproval(approved, comment || (approved ? '判断依据充分，同意派单' : '不符合派单条件'));
    setApprovalModal(null);
    setComment('');
    msg[approved ? 'success' : 'warning'](approved ? '已批准，Agent 继续执行' : '已拒绝，Run 将终止');
  };

  const grouped = useMemo(() => {
    const byType: Record<string, number> = {};
    spans.forEach((s) => {
      byType[s.type] = (byType[s.type] ?? 0) + s.durationMs;
    });
    return byType;
  }, [spans]);

  return (
    <div className="fde-page">
      {ctx}
      <PageHead
        title="Agent Trace & Human Approval"
        desc="每次 Run 生成完整 Trace，记录上下文构建、模型调用、检索、工具执行、审批与记忆读写的全过程"
        extra={
          <Space>
            <Button onClick={() => router.push(`${P}/agents`)}>返回 Agent Studio</Button>
            <Button
              type="primary"
              icon={<CaretRightFilled />}
              onClick={() => {
                startRun();
                msg.info('已启动新的 Agent Run');
              }}
              disabled={run.status === 'RUNNING' || run.status === 'WAITING_APPROVAL'}
            >
              运行 Agent
            </Button>
          </Space>
        }
      />

      {waiting && (
        <Card
          size="small"
          bordered={false}
          style={{ marginBottom: 16, border: '1px solid #ffbb96', background: '#fff7e6' }}
        >
          <Row gutter={20} align="middle">
            <Col flex="auto">
              <Space size={8} style={{ marginBottom: 8 }}>
                <WarningFilled style={{ color: '#fa541c', fontSize: 17 }} />
                <b style={{ fontSize: 15 }}>Action Approval · 高风险动作等待人工审批</b>
                <Tag color="red" style={{ margin: 0 }}>
                  HIGH RISK
                </Tag>
              </Space>
              <Descriptions size="small" column={2} bordered labelStyle={{ width: 84, background: '#fffbf5' }}>
                <Descriptions.Item label="Agent">{approval!.agent}</Descriptions.Item>
                <Descriptions.Item label="Tool">
                  <span className="fde-mono">{approval!.tool}</span>
                </Descriptions.Item>
                <Descriptions.Item label="Reason" span={2}>
                  {approval!.reason}
                </Descriptions.Item>
                {Object.entries(approval!.parameters).map(([k, v]) => (
                  <Descriptions.Item key={k} label={k}>
                    {v}
                  </Descriptions.Item>
                ))}
              </Descriptions>
              <div style={{ fontSize: 11.5, color: '#ad6800', marginTop: 8 }}>
                依据 Project Memory：「create_work_order 强制人工审批」「不允许 Agent 直接变更网络设备」
              </div>
            </Col>
            <Col>
              <Space direction="vertical" size={8} style={{ width: 132 }}>
                <Button
                  type="primary"
                  block
                  icon={<CheckOutlined />}
                  onClick={() => setApprovalModal('approve')}
                >
                  Approve
                </Button>
                <Button block danger icon={<CloseOutlined />} onClick={() => setApprovalModal('reject')}>
                  Reject
                </Button>
                <Button block icon={<EditOutlined />} onClick={() => setApprovalModal('approve')}>
                  Edit
                </Button>
              </Space>
            </Col>
          </Row>
        </Card>
      )}

      {run.status === 'CREATED' && (
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
          message="当前没有正在运行的 Run"
          description="点击右上角「运行 Agent」启动一次完整的 Golden Path 演示：Context 构建 → 工具调用 → 人工审批 → 创建工单 → 记忆沉淀 → 自动评测。"
          action={
            <Button size="small" type="primary" onClick={startRun}>
              立即运行
            </Button>
          }
        />
      )}

      <Row gutter={12} style={{ marginBottom: 16 }}>
        <Col span={4}>
          <Card size="small" bordered={false}>
            <Statistic
              title="Run 状态"
              value={run.status}
              valueStyle={{ fontSize: 16, color: run.status === 'COMPLETED' ? '#52c41a' : run.status === 'CANCELLED' ? '#8c8c8c' : '#1677ff' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small" bordered={false}>
            <Statistic title="Span 数" value={spans.length} valueStyle={{ fontSize: 19 }} />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small" bordered={false}>
            <Statistic title="总耗时" value={(total / 1000).toFixed(1)} suffix="s" valueStyle={{ fontSize: 19 }} />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small" bordered={false}>
            <Statistic title="Token" value={run.tokens} valueStyle={{ fontSize: 19 }} />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small" bordered={false}>
            <Statistic title="成本" value={run.cost} precision={3} prefix="$" valueStyle={{ fontSize: 19, color: '#fa8c16' }} />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small" bordered={false}>
            <Statistic
              title="Eval 评分"
              value={run.score ?? '—'}
              valueStyle={{ fontSize: 19, color: run.score && run.score >= 85 ? '#52c41a' : '#8c8c8c' }}
            />
          </Card>
        </Col>
      </Row>

      <Tabs
        defaultActiveKey="trace"
        items={[
          {
            key: 'trace',
            label: (
              <span>
                <NodeIndexOutlined /> Trace Viewer
              </span>
            ),
            children: (
              <Row gutter={14}>
                <Col span={13}>
                  <Card
                    size="small"
                    bordered={false}
                    title={`Trace · tr-20260826-0731`}
                    extra={
                      <Segmented
                        size="small"
                        options={['Timeline', 'Tree']}
                        value={view}
                        onChange={(v) => setView(v as string)}
                      />
                    }
                    styles={{ body: { padding: 12, minHeight: 460 } }}
                  >
                    {spans.length === 0 ? (
                      <Empty description="尚无 Span，先启动一次 Run" style={{ padding: '80px 0' }} />
                    ) : view === 'Timeline' ? (
                      <Space direction="vertical" size={3} style={{ width: '100%' }}>
                        {spans.map((s) => (
                          <div
                            key={s.id}
                            className={`fde-span-row ${span?.id === s.id ? 'sel' : ''}`}
                            onClick={() => setSelectedSpan(s.id)}
                          >
                            <span
                              className="fde-mono"
                              style={{ width: 52, color: 'var(--fde-text-dim)', flexShrink: 0 }}
                            >
                              {(s.startMs / 1000).toFixed(2)}s
                            </span>
                            <span
                              className="fde-dot"
                              style={{ background: spanTypeColor[s.type], flexShrink: 0 }}
                            />
                            <span style={{ width: 176, fontSize: 12, flexShrink: 0 }}>{s.name}</span>
                            <div className="fde-timeline-track">
                              <div
                                className="fde-timeline-fill"
                                style={{
                                  left: `${(s.startMs / total) * 100}%`,
                                  width: `${Math.max(1.5, (s.durationMs / total) * 100)}%`,
                                  background:
                                    s.status === 'error'
                                      ? '#ff4d4f'
                                      : s.status === 'waiting'
                                        ? '#faad14'
                                        : spanTypeColor[s.type],
                                }}
                              />
                            </div>
                            <span
                              style={{ width: 58, textAlign: 'right', fontSize: 11, color: 'var(--fde-text-dim)', flexShrink: 0 }}
                            >
                              {s.status === 'waiting' ? '等待中' : `${s.durationMs}ms`}
                            </span>
                          </div>
                        ))}
                      </Space>
                    ) : (
                      <Timeline
                        style={{ marginTop: 8 }}
                        items={spans.map((s) => ({
                          color:
                            s.status === 'error' ? 'red' : s.status === 'waiting' ? 'orange' : 'blue',
                          children: (
                            <div
                              style={{ cursor: 'pointer' }}
                              onClick={() => setSelectedSpan(s.id)}
                            >
                              <Space size={6}>
                                <b style={{ fontSize: 12.5 }}>{s.name}</b>
                                <Tag style={{ margin: 0, fontSize: 9 }} color={spanTypeColor[s.type]}>
                                  {spanTypeLabel[s.type]}
                                </Tag>
                              </Space>
                              <div style={{ fontSize: 11, color: 'var(--fde-text-dim)' }}>
                                {(s.startMs / 1000).toFixed(2)}s · {s.durationMs}ms
                                {s.tokens ? ` · ${s.tokens.input + s.tokens.output} tokens` : ''}
                                {s.cost ? ` · $${s.cost.toFixed(3)}` : ''}
                              </div>
                            </div>
                          ),
                        }))}
                      />
                    )}

                    {spans.length > 0 && (
                      <div style={{ borderTop: '1px dashed #eef1f6', marginTop: 12, paddingTop: 10 }}>
                        <div style={{ fontSize: 11.5, color: 'var(--fde-text-dim)', marginBottom: 6 }}>
                          耗时构成
                        </div>
                        <div style={{ display: 'flex', height: 10, borderRadius: 5, overflow: 'hidden' }}>
                          {Object.entries(grouped).map(([t, d]) => (
                            <Tooltip key={t} title={`${spanTypeLabel[t]}: ${d}ms`}>
                              <div style={{ width: `${(d / total) * 100}%`, background: spanTypeColor[t] }} />
                            </Tooltip>
                          ))}
                        </div>
                        <Space size={[10, 4]} wrap style={{ marginTop: 8 }}>
                          {Object.entries(grouped).map(([t, d]) => (
                            <Space key={t} size={4}>
                              <span className="fde-dot" style={{ background: spanTypeColor[t] }} />
                              <span style={{ fontSize: 10.5, color: 'var(--fde-text-dim)' }}>
                                {spanTypeLabel[t]} {((d / total) * 100).toFixed(0)}%
                              </span>
                            </Space>
                          ))}
                        </Space>
                      </div>
                    )}
                  </Card>
                </Col>

                <Col span={11}>
                  <Card size="small" bordered={false} title="Span Detail" styles={{ body: { minHeight: 460 } }}>
                    {!span ? (
                      <Empty description="选择左侧 Span 查看详情" style={{ padding: '80px 0' }} />
                    ) : (
                      <>
                        <Space style={{ justifyContent: 'space-between', width: '100%', marginBottom: 10 }}>
                          <Space size={7}>
                            <span className="fde-dot" style={{ background: spanTypeColor[span.type] }} />
                            <b style={{ fontSize: 14 }}>{span.name}</b>
                          </Space>
                          <Tag
                            color={span.status === 'error' ? 'error' : span.status === 'waiting' ? 'warning' : 'success'}
                            style={{ margin: 0 }}
                          >
                            {span.status}
                          </Tag>
                        </Space>

                        <Descriptions size="small" column={2} bordered labelStyle={{ width: 66 }}>
                          <Descriptions.Item label="Span ID" span={2}>
                            <span className="fde-mono">{span.id}</span>
                          </Descriptions.Item>
                          <Descriptions.Item label="Start">{(span.startMs / 1000).toFixed(2)}s</Descriptions.Item>
                          <Descriptions.Item label="Latency">{span.durationMs}ms</Descriptions.Item>
                          {span.tokens && (
                            <>
                              <Descriptions.Item label="Input">{span.tokens.input} tok</Descriptions.Item>
                              <Descriptions.Item label="Output">{span.tokens.output} tok</Descriptions.Item>
                            </>
                          )}
                          {span.cost ? (
                            <Descriptions.Item label="Cost" span={2}>
                              ${span.cost.toFixed(4)}
                            </Descriptions.Item>
                          ) : null}
                          {span.meta &&
                            Object.entries(span.meta).map(([k, v]) => (
                              <Descriptions.Item key={k} label={k} span={2}>
                                {String(v)}
                              </Descriptions.Item>
                            ))}
                        </Descriptions>

                        <div style={{ fontSize: 12.5, fontWeight: 600, margin: '14px 0 6px' }}>Input</div>
                        <pre className="fde-code-light" style={{ maxHeight: 160 }}>
                          {span.input}
                        </pre>

                        <div style={{ fontSize: 12.5, fontWeight: 600, margin: '12px 0 6px' }}>Output</div>
                        <pre className="fde-code" style={{ maxHeight: 260 }}>
                          {span.output}
                        </pre>

                        {span.error && (
                          <Alert type="error" showIcon style={{ marginTop: 10 }} message={`Error: ${span.error}`} />
                        )}
                      </>
                    )}
                  </Card>
                </Col>
              </Row>
            ),
          },
          {
            key: 'approval',
            label: (
              <span>
                <AuditOutlined /> 审批记录
              </span>
            ),
            children: (
              <Card size="small" bordered={false}>
                <Alert
                  type="info"
                  showIcon
                  style={{ marginBottom: 14 }}
                  message="所有审批结果都会写入 Trace 与审计日志，作为工程运维凭证与教学复盘材料"
                />
                <Table
                  size="small"
                  pagination={false}
                  rowKey="id"
                  dataSource={[
                    ...(approval && approval.status !== 'pending'
                      ? [
                          {
                            ...approval,
                            parameters: approval.parameters,
                          },
                        ]
                      : []),
                    ...approvalHistory,
                  ]}
                  columns={[
                    { title: '审批 ID', dataIndex: 'id', width: 96, render: (v) => <span className="fde-mono">{v}</span> },
                    { title: 'Run', dataIndex: 'runId', width: 92, render: (v) => <span className="fde-mono">{v}</span> },
                    { title: 'Agent', dataIndex: 'agent', width: 140 },
                    {
                      title: 'Tool',
                      dataIndex: 'tool',
                      width: 160,
                      render: (v) => (
                        <Space size={5}>
                          <ApiOutlined style={{ color: '#fa541c' }} />
                          <span className="fde-mono">{v}</span>
                        </Space>
                      ),
                    },
                    { title: '原因', dataIndex: 'reason', ellipsis: true },
                    {
                      title: '结果',
                      dataIndex: 'status',
                      width: 88,
                      render: (v) => (
                        <Tag color={v === 'approved' ? 'success' : v === 'rejected' ? 'error' : 'warning'} style={{ margin: 0 }}>
                          {v}
                        </Tag>
                      ),
                    },
                    { title: '审批人', dataIndex: 'decidedBy', width: 138 },
                    { title: '备注', dataIndex: 'comment', ellipsis: true },
                  ]}
                />
              </Card>
            ),
          },
          {
            key: 'runs',
            label: '历史 Run 与对比',
            children: (
              <Card size="small" bordered={false}>
                <Table
                  size="small"
                  pagination={false}
                  rowKey="id"
                  rowSelection={{ type: 'checkbox' }}
                  dataSource={historyRuns}
                  columns={[
                    { title: 'Run ID', dataIndex: 'id', width: 100, render: (v) => <span className="fde-mono">{v}</span> },
                    { title: 'Agent', dataIndex: 'agentName', width: 220 },
                    { title: '输入', dataIndex: 'input', ellipsis: true },
                    {
                      title: '状态',
                      dataIndex: 'status',
                      width: 108,
                      render: (v) => (
                        <Tag color={statusColor[v]} style={{ margin: 0 }}>
                          {v}
                        </Tag>
                      ),
                    },
                    { title: '耗时', dataIndex: 'durationMs', width: 78, render: (v: number) => `${(v / 1000).toFixed(1)}s` },
                    { title: 'Token', dataIndex: 'tokens', width: 80 },
                    { title: '成本', dataIndex: 'cost', width: 74, render: (v: number) => `$${v.toFixed(2)}` },
                    {
                      title: '评分',
                      dataIndex: 'evalScore',
                      width: 68,
                      render: (v: number) => (
                        <span style={{ color: v >= 85 ? '#52c41a' : v >= 60 ? '#fa8c16' : '#ff4d4f', fontWeight: 600 }}>
                          {v || '—'}
                        </span>
                      ),
                    },
                  ]}
                  expandable={{
                    expandedRowRender: (r) => (
                      <div style={{ fontSize: 12, color: '#4a5b76', lineHeight: 1.8, paddingLeft: 8 }}>
                        <b>输出</b>：{r.output}
                        <div style={{ color: 'var(--fde-text-dim)', marginTop: 4 }}>开始时间 {r.startedAt}</div>
                      </div>
                    ),
                  }}
                />
                <div style={{ marginTop: 12, textAlign: 'right' }}>
                  <Button size="small" onClick={() => msg.info('原型演示：Run 对比视图将展示两次运行的 Span 差异')}>
                    对比选中的 Run
                  </Button>
                </div>
              </Card>
            ),
          },
        ]}
      />

      <Modal
        open={!!approvalModal}
        title={
          <Space>
            <SafetyCertificateOutlined style={{ color: approvalModal === 'approve' ? '#52c41a' : '#ff4d4f' }} />
            {approvalModal === 'approve' ? '批准高风险动作' : '拒绝高风险动作'}
          </Space>
        }
        onCancel={() => setApprovalModal(null)}
        onOk={() => decide(approvalModal === 'approve')}
        okText={approvalModal === 'approve' ? '确认批准' : '确认拒绝'}
        okButtonProps={{ danger: approvalModal === 'reject' }}
        cancelText="取消"
      >
        {approval && (
          <Space direction="vertical" size={12} style={{ width: '100%' }}>
            <Descriptions size="small" column={1} bordered labelStyle={{ width: 88 }}>
              <Descriptions.Item label="Agent">{approval.agent}</Descriptions.Item>
              <Descriptions.Item label="Tool">
                <span className="fde-mono">{approval.tool}</span>
              </Descriptions.Item>
              <Descriptions.Item label="参数">
                <pre className="fde-code-light" style={{ fontSize: 11 }}>
                  {JSON.stringify(approval.parameters, null, 2)}
                </pre>
              </Descriptions.Item>
            </Descriptions>
            <div>
              <div style={{ fontSize: 12, color: 'var(--fde-text-dim)', marginBottom: 5 }}>审批意见（写入 Trace）</div>
              <Input.TextArea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={
                  approvalModal === 'approve' ? '例如：判断依据充分，同意派单' : '例如：该网元今晚有计划检修，属预期告警'
                }
              />
            </div>
          </Space>
        )}
      </Modal>
    </div>
  );
}
