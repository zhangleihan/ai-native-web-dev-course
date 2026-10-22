'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Avatar, Button, Card, Col, List, Progress, Row, Space, Table, Tag, Timeline, Tooltip } from 'antd';
import {
  ArrowRightOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloudServerOutlined,
  DollarOutlined,
  ExclamationCircleOutlined,
  RobotOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { Metric, PageHead, StageBar } from '@/components/ui';
import { useStore } from '@/lib/store';
import { cases, courses } from '@/mock';
import { statusColor } from '@/lib/theme';

export default function HomePage() {
  const router = useRouter();
  const { user, run, memoryCandidates, candidates, objects, project, projects, dataset, setProject } = useStore();
  const P = `/project/${project.id}`;
  const historyRuns = dataset.run.historyRuns;
  const teacherFeedback = dataset.evaluation.feedback;
  const topCandidate = candidates.find((c) => c.status === 'pending');

  const pendingOntology = candidates.filter((c) => c.status === 'pending').length;
  const pendingMemory = memoryCandidates.filter((c) => c.status === 'pending').length;

  const todos = [
    {
      title: '确认 Ontology Copilot 生成的候选对象',
      desc: `${pendingOntology} 项待确认${topCandidate ? `，其中 ${topCandidate.name} 优先级最高` : ''}`,
      route: `${P}/ontology`,
      urgent: pendingOntology > 0,
    },
    {
      title: '审核待写入的 Memory 候选',
      desc: `${pendingMemory} 条候选记忆等待人工确认后进入长期记忆`,
      route: `${P}/memory`,
      urgent: pendingMemory > 0,
    },
    {
      title: `运行 ${dataset.agents[0].name} 并完成审批闭环`,
      desc: run.status === 'COMPLETED' ? '本轮已完成，可查看 Trace 与评测' : '尚未跑通完整 Golden Path',
      route: `${P}/agents`,
      urgent: run.status !== 'COMPLETED',
    },
    {
      title: '补充部署压测数据',
      desc: 'Evaluation 中 L3 系统层缺少并发压测样本',
      route: `${P}/deploy`,
      urgent: false,
    },
  ];

  return (
    <div className="fde-page">
      <div className="fde-gradient-hero" style={{ marginBottom: 18 }}>
        <Row align="middle" gutter={24}>
          <Col flex="auto">
            <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.6)', marginBottom: 6 }}>
              {user.org} · {user.title}
            </div>
            <div style={{ fontSize: 23, fontWeight: 680, marginBottom: 10 }}>
              {user.name}，欢迎回到 AI-FDE Lab
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.72)', maxWidth: 720, lineHeight: 1.9 }}>
              你的团队正在交付「{project.name}」（{project.team}）。当前处于{' '}
              <b style={{ color: '#7cc5ff' }}>{project.currentStage}</b> 阶段，距离答辩还有 {project.daysLeft}{' '}
              天。完成 Agent 运行与审批闭环后即可进入部署与评测。
            </div>
            <Space size={10} style={{ marginTop: 18 }}>
              <Button type="primary" onClick={() => router.push(`${P}/agents`)}>
                继续项目工作 <ArrowRightOutlined />
              </Button>
              <Button ghost onClick={() => router.push('/cases')}>
                浏览案例库
              </Button>
              <Button ghost onClick={() => router.push('/proposal')}>
                项目预算
              </Button>
            </Space>
          </Col>
          <Col>
            <div style={{ textAlign: 'center' }}>
              <Progress
                type="dashboard"
                percent={project.overallScore}
                size={112}
                strokeColor={{ '0%': '#52c1ff', '100%': '#7cffc4' }}
                trailColor="rgba(255,255,255,0.15)"
                format={(p) => (
                  <span style={{ color: '#fff', fontSize: 22, fontWeight: 650 }}>
                    {p}
                    <span style={{ fontSize: 11, fontWeight: 400 }}> 分</span>
                  </span>
                )}
              />
              <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.6)', marginTop: 6 }}>FDE 综合评分（实时）</div>
            </div>
          </Col>
        </Row>
      </div>

      <Row gutter={12} style={{ marginBottom: 18 }}>
        <Col span={4}>
          <Metric label="Agent 运行次数" value={project.stats.runs} tip="含成功、失败与取消" />
        </Col>
        <Col span={4}>
          <Metric label="任务成功率" value={`${Math.round(project.stats.successRate * 100)}%`} color="#52c41a" />
        </Col>
        <Col span={4}>
          <Metric label="平均时延" value={project.stats.avgLatency} suffix="s" />
        </Col>
        <Col span={4}>
          <Metric label="累计成本" value={`$${project.stats.totalCost.toFixed(1)}`} color="#fa8c16" />
        </Col>
        <Col span={4}>
          <Metric label="Ontology 对象" value={objects.length} />
        </Col>
        <Col span={4}>
          <Metric label="待办事项" value={todos.filter((t) => t.urgent).length} color="#fa541c" />
        </Col>
      </Row>

      <Card
        size="small"
        style={{ marginBottom: 18 }}
        title="我的实训项目"
        bordered={false}
        extra={<span style={{ fontSize: 11.5, color: 'var(--fde-text-dim)' }}>点击卡片切换演示项目</span>}
      >
        <Row gutter={12}>
          {projects.map((p) => {
            const active = p.id === project.id;
            return (
              <Col span={12} key={p.id}>
                <Card
                  size="small"
                  className="fde-card-hover"
                  bordered
                  style={{ borderColor: active ? p.accent : undefined, background: active ? `${p.accent}0d` : undefined }}
                  styles={{ body: { padding: 14 } }}
                  onClick={() => {
                    setProject(p.id);
                    router.push(`/project/${p.id}`);
                  }}
                >
                  <Space align="start" size={12} style={{ width: '100%' }}>
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 9,
                        background: `${p.accent}1f`,
                        color: p.accent,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <RobotOutlined />
                    </div>
                    <div style={{ flex: 1 }}>
                      <Space size={6} style={{ marginBottom: 2 }}>
                        <span style={{ fontSize: 13.5, fontWeight: 620 }}>{p.name}</span>
                        {active && (
                          <Tag color={p.accent} style={{ margin: 0, fontSize: 10 }}>
                            当前
                          </Tag>
                        )}
                      </Space>
                      <div style={{ fontSize: 11.5, color: 'var(--fde-text-dim)', marginBottom: 8 }}>
                        {p.team} · {p.industry} · 剩 {p.daysLeft} 天
                      </div>
                      <Space size={6} wrap>
                        <Tag style={{ margin: 0, fontSize: 10 }}>阶段 {p.currentStage}</Tag>
                        <Tag style={{ margin: 0, fontSize: 10 }}>评分 {p.overallScore}</Tag>
                        <Tag style={{ margin: 0, fontSize: 10 }}>{p.stats.runs} 次运行</Tag>
                      </Space>
                    </div>
                  </Space>
                </Card>
              </Col>
            );
          })}
        </Row>
      </Card>

      <Card size="small" style={{ marginBottom: 18 }} title="FDE 8D 交付进度" bordered={false}>
        <StageBar />
      </Card>

      <Row gutter={16}>
        <Col span={15}>
          <Card
            size="small"
            title="待办与提醒"
            bordered={false}
            style={{ marginBottom: 16 }}
            extra={<Tag color="orange">{todos.filter((t) => t.urgent).length} 项需要处理</Tag>}
          >
            <List
              dataSource={todos}
              renderItem={(t) => (
                <List.Item
                  style={{ padding: '10px 0' }}
                  actions={[
                    <Button key="go" type="link" size="small" onClick={() => router.push(t.route)}>
                      去处理
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      t.urgent ? (
                        <ExclamationCircleOutlined style={{ color: '#fa8c16', fontSize: 17 }} />
                      ) : (
                        <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 17 }} />
                      )
                    }
                    title={<span style={{ fontSize: 13.5 }}>{t.title}</span>}
                    description={<span style={{ fontSize: 12 }}>{t.desc}</span>}
                  />
                </List.Item>
              )}
            />
          </Card>

          <Card size="small" title="最近 Agent 运行" bordered={false} extra={<a onClick={() => router.push(`${P}/trace`)}>查看全部 Trace</a>}>
            <Table
              size="small"
              pagination={false}
              rowKey="id"
              dataSource={historyRuns}
              columns={[
                { title: 'Run', dataIndex: 'id', width: 92, render: (v) => <span className="fde-mono">{v}</span> },
                { title: 'Agent', dataIndex: 'agentName', ellipsis: true },
                {
                  title: '状态',
                  dataIndex: 'status',
                  width: 96,
                  render: (v: string) => <Tag color={statusColor[v]}>{v}</Tag>,
                },
                {
                  title: '时长',
                  dataIndex: 'durationMs',
                  width: 74,
                  render: (v: number) => `${(v / 1000).toFixed(1)}s`,
                },
                {
                  title: '成本',
                  dataIndex: 'cost',
                  width: 68,
                  render: (v: number) => `$${v.toFixed(2)}`,
                },
                {
                  title: '评分',
                  dataIndex: 'evalScore',
                  width: 64,
                  render: (v: number) => (
                    <span style={{ color: v >= 85 ? '#52c41a' : v >= 60 ? '#fa8c16' : '#ff4d4f', fontWeight: 600 }}>
                      {v || '—'}
                    </span>
                  ),
                },
              ]}
            />
          </Card>
        </Col>

        <Col span={9}>
          <Card size="small" title="项目团队" bordered={false} style={{ marginBottom: 16 }}>
            <Space direction="vertical" size={10} style={{ width: '100%' }}>
              {project.teamMembers.map((m) => (
                <Space key={m.name} size={10} style={{ width: '100%' }}>
                  <Avatar size={30} style={{ background: m.color, fontSize: 12 }}>
                    {m.name.slice(0, 1)}
                  </Avatar>
                  <div style={{ lineHeight: 1.35 }}>
                    <div style={{ fontSize: 13, fontWeight: 550 }}>{m.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--fde-text-dim)' }}>{m.role}</div>
                  </div>
                </Space>
              ))}
              <div style={{ borderTop: '1px dashed #eef1f6', paddingTop: 10, fontSize: 12, color: 'var(--fde-text-dim)' }}>
                指导教师 {project.teacher} · 企业导师 {project.mentor}
              </div>
            </Space>
          </Card>

          <Card size="small" title="导师反馈" bordered={false} style={{ marginBottom: 16 }}>
            <Timeline
              style={{ marginTop: 4 }}
              items={teacherFeedback.slice(0, 2).map((f) => ({
                color: f.role === '教师' ? 'blue' : 'green',
                children: (
                  <div>
                    <Space size={6} style={{ marginBottom: 3 }}>
                      <b style={{ fontSize: 12.5 }}>{f.author}</b>
                      <Tag style={{ margin: 0, fontSize: 10 }}>{f.role}</Tag>
                      <span style={{ fontSize: 11, color: 'var(--fde-text-dim)' }}>{f.time.slice(5)}</span>
                    </Space>
                    <div style={{ fontSize: 12, lineHeight: 1.8, color: '#4a5b76' }}>{f.content}</div>
                  </div>
                ),
              }))}
            />
          </Card>

          <Card size="small" title="学习进度" bordered={false} extra={<a onClick={() => router.push('/learn')}>全部课程</a>}>
            {courses.slice(0, 4).map((c) => (
              <div key={c.id} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 4 }}>
                  <span>{c.title}</span>
                  <span style={{ color: 'var(--fde-text-dim)' }}>
                    {c.finished}/{c.lessons}
                  </span>
                </div>
                <Progress percent={c.progress} size="small" showInfo={false} />
              </div>
            ))}
          </Card>
        </Col>
      </Row>

      <Card size="small" title="推荐案例" bordered={false} style={{ marginTop: 16 }}>
        <Row gutter={12}>
          {[...cases]
            .sort((a, b) => Number(Boolean(b.goldenCase)) - Number(Boolean(a.goldenCase)))
            .slice(0, 4)
            .map((c) => (
            <Col span={6} key={c.id}>
              <Card
                size="small"
                className="fde-card-hover"
                bordered
                onClick={() => router.push(`/cases/${c.id}`)}
                styles={{ body: { padding: 14 } }}
              >
                <Space size={8} style={{ marginBottom: 8 }}>
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 8,
                      background: `${c.cover}18`,
                      color: c.cover,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <CloudServerOutlined />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.3 }}>{c.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--fde-text-dim)' }}>{c.industry}</div>
                  </div>
                </Space>
                <div
                  style={{
                    fontSize: 11.5,
                    color: 'var(--fde-text-dim)',
                    lineHeight: 1.7,
                    height: 40,
                    overflow: 'hidden',
                  }}
                >
                  {c.summary}
                </div>
                <Space size={6} style={{ marginTop: 8 }}>
                  <Tag style={{ margin: 0, fontSize: 10 }}>{c.difficulty}</Tag>
                  <Tooltip title="预计投入">
                    <Tag style={{ margin: 0, fontSize: 10 }} icon={<ClockCircleOutlined />}>
                      {c.duration}
                    </Tag>
                  </Tooltip>
                  {c.goldenCase && (
                    <Tag color="gold" style={{ margin: 0, fontSize: 10 }} icon={<ThunderboltOutlined />}>
                      Golden
                    </Tag>
                  )}
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      <div style={{ marginTop: 20, textAlign: 'center', fontSize: 11.5, color: '#a3aec0' }}>
        <Space size={6}>
          <RobotOutlined />
          原型演示环境 · 所有数据为 Fake Data，Agent 运行与审批为脚本化模拟
          <DollarOutlined />
          成本与 Token 数据用于演示 Harness 计量能力
        </Space>
      </div>
    </div>
  );
}
