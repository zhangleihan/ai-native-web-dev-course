'use client';

import React, { useState } from 'react';
import { Alert, Button, Card, Col, Input, Progress, Row, Space, Tag, Tooltip, message } from 'antd';
import {
  BulbOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
  InfoCircleOutlined,
  SaveOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { PageHead } from '@/components/ui';
import { useStore } from '@/lib/store';
import { criticChecks, extractTypeMeta } from '@/mock';

export default function DefinePage() {
  const { canvas, setCanvasField, psf, runCritic, extracts, setCopilotOpen, dataset } = useStore();
  const problemCanvasFields = dataset.define.canvasFields;
  const criticSuggestions = dataset.define.criticSuggestions;
  const [running, setRunning] = useState(false);
  const [msg, ctx] = message.useMessage();

  const doCritic = () => {
    setRunning(true);
    setTimeout(() => {
      runCritic();
      setRunning(false);
      msg.success('AI Problem Critic 分析完成');
    }, 1100);
  };

  const filled = problemCanvasFields.filter((f) => (canvas[f.key] ?? '').trim().length >= f.minLength).length;
  const accepted = extracts.filter((e) => e.status === 'accepted');

  const scoreColor = (s: number) => (s >= 80 ? '#52c41a' : s >= 60 ? '#fa8c16' : '#ff4d4f');

  return (
    <div className="fde-page">
      {ctx}
      <PageHead
        title="Define · 问题定义中心"
        desc="把模糊需求收敛为具体、可衡量、可执行、可评估的 AI 问题陈述"
        extra={
          <Space>
            <Button icon={<SaveOutlined />}>保存草稿</Button>
            <Button type="primary" icon={<ThunderboltOutlined />} loading={running} onClick={doCritic}>
              运行 AI Problem Critic
            </Button>
          </Space>
        }
      />

      <Row gutter={16}>
        <Col span={16}>
          <Card
            size="small"
            bordered={false}
            title="Problem Canvas"
            extra={
              <span style={{ fontSize: 12, color: 'var(--fde-text-dim)' }}>
                完整度 {filled}/{problemCanvasFields.length}
              </span>
            }
          >
            <Row gutter={[12, 12]}>
              {problemCanvasFields.map((f) => {
                const val = canvas[f.key] ?? '';
                const ok = val.trim().length >= f.minLength;
                return (
                  <Col span={f.key === 'problem_statement' ? 24 : 12} key={f.key}>
                    <div
                      style={{
                        border: `1px solid ${ok ? '#e6ebf3' : '#ffd591'}`,
                        borderRadius: 9,
                        padding: '10px 12px',
                        background: ok ? '#fff' : '#fffbf5',
                        height: '100%',
                      }}
                    >
                      <Space style={{ justifyContent: 'space-between', width: '100%', marginBottom: 6 }}>
                        <Space size={6}>
                          <span style={{ fontSize: 12.5, fontWeight: 620, color: '#16223a' }}>{f.label}</span>
                          <span style={{ fontSize: 11, color: 'var(--fde-text-dim)' }}>{f.cn}</span>
                          <Tooltip title={f.hint}>
                            <InfoCircleOutlined style={{ fontSize: 11, color: '#b9c2d0' }} />
                          </Tooltip>
                        </Space>
                        {ok ? (
                          <CheckCircleFilled style={{ color: '#52c41a', fontSize: 12 }} />
                        ) : (
                          <Tag color="warning" style={{ margin: 0, fontSize: 10 }}>
                            待完善
                          </Tag>
                        )}
                      </Space>
                      <Input.TextArea
                        value={val}
                        autoSize={{ minRows: f.key === 'problem_statement' ? 2 : 3, maxRows: 6 }}
                        placeholder={f.placeholder}
                        onChange={(e) => setCanvasField(f.key, e.target.value)}
                        style={{ fontSize: 12.5, lineHeight: 1.8 }}
                      />
                    </div>
                  </Col>
                );
              })}
            </Row>
          </Card>
        </Col>

        <Col span={8}>
          <Card
            size="small"
            bordered={false}
            title={
              <Space>
                <ThunderboltOutlined style={{ color: '#722ed1' }} />
                AI Problem Critic
              </Space>
            }
            style={{ marginBottom: 14 }}
          >
            {!psf ? (
              <div style={{ textAlign: 'center', padding: '24px 12px' }}>
                <div style={{ fontSize: 12.5, color: 'var(--fde-text-dim)', lineHeight: 1.9, marginBottom: 14 }}>
                  Critic 会从八个维度检查你的问题定义，
                  <br />
                  输出 PSF（Problem-Solution Fit）评分与改进建议。
                </div>
                <Button type="primary" loading={running} onClick={doCritic}>
                  开始分析
                </Button>
              </div>
            ) : (
              <>
                <div style={{ textAlign: 'center', marginBottom: 14 }}>
                  <Progress
                    type="dashboard"
                    percent={psf.score}
                    size={128}
                    strokeColor={scoreColor(psf.score)}
                    format={(p) => (
                      <div>
                        <div style={{ fontSize: 27, fontWeight: 680, color: scoreColor(psf.score) }}>{p}</div>
                        <div style={{ fontSize: 11, color: 'var(--fde-text-dim)' }}>PSF Score / 100</div>
                      </div>
                    )}
                  />
                  <div style={{ fontSize: 12, color: 'var(--fde-text-dim)', marginTop: 6 }}>
                    {psf.score >= 80
                      ? '问题定义质量良好，可以进入建模阶段'
                      : psf.score >= 60
                        ? '基本可用，但仍有关键项需要补强'
                        : '定义过于宽泛，建议重新收敛问题边界'}
                  </div>
                </div>

                <Space direction="vertical" size={8} style={{ width: '100%' }}>
                  {criticChecks.map((c) => {
                    const r = psf.checks.find((x) => x.key === c.key)!;
                    return (
                      <div
                        key={c.key}
                        style={{
                          border: '1px solid var(--fde-border)',
                          borderRadius: 8,
                          padding: '8px 10px',
                          background: r.pass ? '#f6ffed' : '#fffbf5',
                        }}
                      >
                        <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                          <Space size={6}>
                            {r.pass ? (
                              <CheckCircleFilled style={{ color: '#52c41a', fontSize: 12 }} />
                            ) : (
                              <CloseCircleFilled style={{ color: '#fa8c16', fontSize: 12 }} />
                            )}
                            <span style={{ fontSize: 12.5, fontWeight: 550 }}>{c.name}</span>
                          </Space>
                          <span style={{ fontSize: 12, color: 'var(--fde-text-dim)' }}>{r.score}/12.5</span>
                        </Space>
                        <div style={{ fontSize: 11, color: 'var(--fde-text-dim)', marginTop: 3, lineHeight: 1.7 }}>
                          {c.desc}
                        </div>
                        {!r.pass && (
                          <div
                            style={{
                              fontSize: 11.5,
                              color: '#ad6800',
                              marginTop: 6,
                              paddingTop: 6,
                              borderTop: '1px dashed #ffe7ba',
                              lineHeight: 1.75,
                            }}
                          >
                            <BulbOutlined /> {criticSuggestions[c.key]}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </Space>

                <Button block style={{ marginTop: 12 }} onClick={() => setCopilotOpen(true)}>
                  向 FDE Copilot 追问改进方向
                </Button>
              </>
            )}
          </Card>

          <Card size="small" bordered={false} title="来自 Discover 的已确认洞察">
            {accepted.length === 0 ? (
              <Alert type="warning" showIcon message="尚未采纳任何访谈洞察，问题定义缺少证据支撑" />
            ) : (
              <Space direction="vertical" size={7} style={{ width: '100%', maxHeight: 300, overflow: 'auto' }}>
                {accepted.map((e) => (
                  <div
                    key={e.id}
                    style={{ border: '1px solid var(--fde-border)', borderRadius: 7, padding: '7px 9px' }}
                  >
                    <Tag color={extractTypeMeta[e.type].color} style={{ margin: 0, fontSize: 10, marginBottom: 4 }}>
                      {extractTypeMeta[e.type].label}
                    </Tag>
                    <div style={{ fontSize: 11.5, lineHeight: 1.7, color: '#4a5b76' }}>{e.content}</div>
                  </div>
                ))}
              </Space>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
