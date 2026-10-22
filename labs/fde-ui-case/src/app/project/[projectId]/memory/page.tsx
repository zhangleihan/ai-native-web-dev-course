'use client';

import React, { useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Empty,
  Input,
  Popconfirm,
  Progress,
  Row,
  Segmented,
  Space,
  Table,
  Tabs,
  Tag,
  Tooltip,
  message,
} from 'antd';
import {
  CheckOutlined,
  CloseOutlined,
  DatabaseOutlined,
  DeleteOutlined,
  FileSearchOutlined,
  PushpinFilled,
  PushpinOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { PageHead } from '@/components/ui';
import { useStore } from '@/lib/store';
import { memoryTypeMeta } from '@/mock';
import type { MemoryType } from '@/mock';

const typeTabs: { key: MemoryType | 'ALL'; label: string }[] = [
  { key: 'ALL', label: '全部' },
  { key: 'SESSION', label: 'Session' },
  { key: 'PROJECT', label: 'Project' },
  { key: 'SEMANTIC', label: 'Facts' },
  { key: 'EPISODIC', label: 'Episodes' },
  { key: 'DECISION', label: 'Decisions' },
];

export default function MemoryPage() {
  const { memories, memoryCandidates, decideMemoryCandidate, togglePin, forgetMemory, dataset } = useStore();
  const { contextBlocks, trimmedContent } = dataset.memory;
  const [type, setType] = useState<MemoryType | 'ALL'>('ALL');
  const [kw, setKw] = useState('');
  const [msg, ctx] = message.useMessage();

  const list = memories.filter(
    (m) => (type === 'ALL' || m.type === type) && (kw === '' || m.content.includes(kw) || m.summary.includes(kw)),
  );
  const pending = memoryCandidates.filter((c) => c.status === 'pending');
  const totalTokens = contextBlocks.reduce((s, b) => s + b.tokens, 0);
  const trimmedTokens = trimmedContent.reduce((s, b) => s + b.tokens, 0);
  const budget = 8000;

  return (
    <div className="fde-page">
      {ctx}
      <PageHead
        title="Memory Inspector"
        desc="六类记忆的统一治理台：Session 自动写入，Project 与 Decision 需人工确认，Episodic 在 Run 完成后总结"
        extra={
          <Space size={16}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: 'var(--fde-text-dim)' }}>记忆条目</div>
              <div style={{ fontSize: 18, fontWeight: 650 }}>{memories.length}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: 'var(--fde-text-dim)' }}>待确认候选</div>
              <div style={{ fontSize: 18, fontWeight: 650, color: '#fa8c16' }}>{pending.length}</div>
            </div>
          </Space>
        }
      />

      <Tabs
        defaultActiveKey="inspector"
        items={[
          {
            key: 'inspector',
            label: (
              <span>
                <DatabaseOutlined /> 记忆库
              </span>
            ),
            children: (
              <Row gutter={14}>
                <Col span={16}>
                  <Card
                    size="small"
                    bordered={false}
                    title={
                      <Segmented
                        size="small"
                        options={typeTabs.map((t) => ({
                          label: `${t.label} (${
                            t.key === 'ALL' ? memories.length : memories.filter((m) => m.type === t.key).length
                          })`,
                          value: t.key,
                        }))}
                        value={type}
                        onChange={(v) => setType(v as MemoryType | 'ALL')}
                      />
                    }
                    extra={
                      <Input
                        size="small"
                        prefix={<SearchOutlined style={{ color: '#b9c2d0' }} />}
                        placeholder="搜索记忆内容"
                        style={{ width: 190 }}
                        value={kw}
                        onChange={(e) => setKw(e.target.value)}
                        allowClear
                      />
                    }
                    styles={{ body: { padding: 12 } }}
                  >
                    {list.length === 0 && <Empty description="没有匹配的记忆" style={{ padding: '40px 0' }} />}
                    <Space direction="vertical" size={9} style={{ width: '100%' }}>
                      {list.map((m) => (
                        <div
                          key={m.id}
                          style={{
                            border: `1px solid ${m.pinned ? '#ffd591' : 'var(--fde-border)'}`,
                            background: m.pinned ? '#fffbf5' : '#fff',
                            borderRadius: 9,
                            padding: '11px 13px',
                          }}
                        >
                          <Space style={{ justifyContent: 'space-between', width: '100%', marginBottom: 6 }}>
                            <Space size={6}>
                              <Tag color={memoryTypeMeta[m.type].color} style={{ margin: 0, fontSize: 10 }}>
                                {m.type}
                              </Tag>
                              <span style={{ fontSize: 13, fontWeight: 600 }}>{m.summary}</span>
                              {m.pinned && (
                                <Tooltip title="已固定，每次 Context 构建都会注入">
                                  <PushpinFilled style={{ color: '#fa8c16', fontSize: 11 }} />
                                </Tooltip>
                              )}
                            </Space>
                            <Space size={2}>
                              <Tooltip title={m.pinned ? '取消固定' : '固定'}>
                                <Button
                                  type="text"
                                  size="small"
                                  icon={m.pinned ? <PushpinFilled /> : <PushpinOutlined />}
                                  onClick={() => togglePin(m.id)}
                                />
                              </Tooltip>
                              <Popconfirm
                                title="确认遗忘这条记忆？"
                                description="Forget 后该记忆不再参与 Context 构建"
                                onConfirm={() => {
                                  forgetMemory(m.id);
                                  msg.success('已从记忆库移除');
                                }}
                              >
                                <Button type="text" size="small" danger icon={<DeleteOutlined />} />
                              </Popconfirm>
                            </Space>
                          </Space>

                          <div style={{ fontSize: 12, lineHeight: 1.85, color: '#4a5b76' }}>{m.content}</div>

                          <Space
                            size={14}
                            style={{ marginTop: 8, fontSize: 10.5, color: 'var(--fde-text-dim)', flexWrap: 'wrap' }}
                          >
                            <span>来源：{m.source}</span>
                            <span>重要性 {(m.importance * 100).toFixed(0)}</span>
                            <span>置信度 {(m.confidence * 100).toFixed(0)}</span>
                            <span>创建 {m.createdAt}</span>
                            <span>最近使用 {m.lastUsedAt}</span>
                          </Space>
                        </div>
                      ))}
                    </Space>
                  </Card>
                </Col>

                <Col span={8}>
                  <Card
                    size="small"
                    bordered={false}
                    title={
                      <Space>
                        Memory Write Policy
                        <Badge count={pending.length} size="small" />
                      </Space>
                    }
                    style={{ marginBottom: 14 }}
                  >
                    <div
                      style={{
                        background: '#f7f9fc',
                        borderRadius: 8,
                        padding: '10px 12px',
                        fontSize: 11.5,
                        lineHeight: 1.9,
                        marginBottom: 12,
                        color: '#4a5b76',
                      }}
                    >
                      候选记忆先经过 Memory Evaluator 打分（Importance / Confidence / Reusability / Safety），
                      再由人决定 Store 或 Reject。不允许 Agent 自动写入长期记忆。
                    </div>

                    {pending.length === 0 ? (
                      <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无待确认候选" />
                    ) : (
                      <Space direction="vertical" size={10} style={{ width: '100%' }}>
                        {pending.map((c) => (
                          <div
                            key={c.id}
                            style={{ border: '1px solid #ffe7ba', background: '#fffbf5', borderRadius: 8, padding: '10px 12px' }}
                          >
                            <Tag color={memoryTypeMeta[c.type].color} style={{ margin: 0, fontSize: 10, marginBottom: 6 }}>
                              {c.type}
                            </Tag>
                            <div style={{ fontSize: 11.5, lineHeight: 1.8, color: '#4a5b76' }}>{c.content}</div>

                            <Row gutter={6} style={{ marginTop: 8 }}>
                              {[
                                { k: 'Importance', v: c.importance },
                                { k: 'Confidence', v: c.confidence },
                                { k: 'Reusability', v: c.reusability },
                                { k: 'Safety', v: c.safety },
                              ].map((s) => (
                                <Col span={12} key={s.k}>
                                  <div style={{ fontSize: 10, color: 'var(--fde-text-dim)' }}>{s.k}</div>
                                  <Progress
                                    percent={s.v * 100}
                                    size="small"
                                    showInfo={false}
                                    strokeColor={s.v >= 0.8 ? '#52c41a' : s.v >= 0.6 ? '#faad14' : '#ff7875'}
                                  />
                                </Col>
                              ))}
                            </Row>

                            <div style={{ fontSize: 10.5, color: 'var(--fde-text-dim)', marginTop: 6 }}>
                              来源：{c.source}
                            </div>

                            <Space size={6} style={{ marginTop: 8 }}>
                              <Button
                                size="small"
                                type="primary"
                                icon={<CheckOutlined />}
                                onClick={() => {
                                  decideMemoryCandidate(c.id, true);
                                  msg.success('已写入长期记忆');
                                }}
                              >
                                Store
                              </Button>
                              <Button size="small" icon={<CloseOutlined />} onClick={() => decideMemoryCandidate(c.id, false)}>
                                Reject
                              </Button>
                            </Space>
                          </div>
                        ))}
                      </Space>
                    )}
                  </Card>

                  <Card size="small" bordered={false} title="写入策略">
                    <Table
                      size="small"
                      pagination={false}
                      showHeader={false}
                      rowKey="k"
                      dataSource={Object.entries(memoryTypeMeta).map(([k, v]) => ({ k, ...v }))}
                      columns={[
                        {
                          dataIndex: 'k',
                          width: 92,
                          render: (v, r) => (
                            <Tag color={r.color} style={{ margin: 0, fontSize: 10 }}>
                              {v}
                            </Tag>
                          ),
                        },
                        { dataIndex: 'policy', render: (v) => <span style={{ fontSize: 11.5 }}>{v}</span> },
                      ]}
                    />
                  </Card>
                </Col>
              </Row>
            ),
          },
          {
            key: 'context',
            label: (
              <span>
                <FileSearchOutlined /> Context Preview
              </span>
            ),
            children: (
              <Row gutter={14}>
                <Col span={16}>
                  <Card
                    size="small"
                    bordered={false}
                    title="实际送入模型的 Context"
                    extra={
                      <Space size={12} style={{ fontSize: 12 }}>
                        <span>
                          总计 <b>{totalTokens.toLocaleString()}</b> tokens
                        </span>
                        <span style={{ color: 'var(--fde-text-dim)' }}>预算 {budget.toLocaleString()}</span>
                      </Space>
                    }
                  >
                    <Progress
                      percent={(totalTokens / budget) * 100}
                      strokeColor="#1677ff"
                      format={(p) => `${p?.toFixed(0)}% 预算占用`}
                      style={{ marginBottom: 14 }}
                    />

                    <Space direction="vertical" size={9} style={{ width: '100%' }}>
                      {contextBlocks.map((b) => (
                        <div key={b.key} style={{ border: '1px solid var(--fde-border)', borderRadius: 9, padding: '10px 13px' }}>
                          <Space style={{ justifyContent: 'space-between', width: '100%', marginBottom: 5 }}>
                            <Space size={7}>
                              <b style={{ fontSize: 12.5 }}>{b.name}</b>
                              {b.trimmed && (
                                <Tag color="orange" style={{ margin: 0, fontSize: 9 }}>
                                  已裁剪
                                </Tag>
                              )}
                            </Space>
                            <Space size={10} style={{ fontSize: 11, color: 'var(--fde-text-dim)' }}>
                              <span>{b.tokens} tokens</span>
                              <span>{((b.tokens / totalTokens) * 100).toFixed(1)}%</span>
                            </Space>
                          </Space>
                          <div
                            style={{
                              height: 4,
                              borderRadius: 2,
                              background: '#eef2f8',
                              marginBottom: 7,
                              overflow: 'hidden',
                            }}
                          >
                            <div
                              style={{
                                height: '100%',
                                width: `${(b.tokens / totalTokens) * 100}%`,
                                background: '#1677ff',
                                borderRadius: 2,
                              }}
                            />
                          </div>
                          <div style={{ fontSize: 11.5, lineHeight: 1.8, color: '#4a5b76' }}>{b.content}</div>
                          <div style={{ fontSize: 10.5, color: '#b0bacb', marginTop: 5 }}>来源：{b.source}</div>
                        </div>
                      ))}
                    </Space>
                  </Card>
                </Col>

                <Col span={8}>
                  <Card size="small" bordered={false} title="被裁剪的内容" style={{ marginBottom: 14 }}>
                    <Alert
                      type="warning"
                      showIcon
                      style={{ marginBottom: 12 }}
                      message={`本次共裁剪 ${trimmedTokens.toLocaleString()} tokens`}
                      description="裁剪原因可追溯，避免出现「模型为什么没看到这条信息」的黑盒问题。"
                    />
                    <Space direction="vertical" size={8} style={{ width: '100%' }}>
                      {trimmedContent.map((t) => (
                        <div
                          key={t.name}
                          style={{ border: '1px dashed #e6ebf3', borderRadius: 8, padding: '8px 10px', background: '#fafafa' }}
                        >
                          <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                            <span style={{ fontSize: 11.5, fontWeight: 550, textDecoration: 'line-through', color: '#8c8c8c' }}>
                              {t.name}
                            </span>
                            <span style={{ fontSize: 10.5, color: 'var(--fde-text-dim)' }}>{t.tokens} tok</span>
                          </Space>
                          <div style={{ fontSize: 10.5, color: '#fa8c16', marginTop: 3 }}>{t.reason}</div>
                        </div>
                      ))}
                    </Space>
                  </Card>

                  <Card size="small" bordered={false} title="Context Builder 组装顺序">
                    <pre className="fde-code" style={{ fontSize: 11 }}>{`System Instruction
+ Agent Role
+ Current Task
+ Project Rules        ← Memory
+ Relevant Memory      ← 相似度检索
+ Ontology
+ Retrieved Knowledge  ← RAG
+ Recent Conversation
+ Tool Schema
────────────────────
= ${totalTokens.toLocaleString()} tokens / ${budget.toLocaleString()}`}</pre>
                  </Card>
                </Col>
              </Row>
            ),
          },
        ]}
      />
    </div>
  );
}
