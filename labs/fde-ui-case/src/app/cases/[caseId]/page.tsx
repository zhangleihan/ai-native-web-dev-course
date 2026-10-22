'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Alert,
  Avatar,
  Button,
  Card,
  Col,
  Descriptions,
  List,
  Rate,
  Row,
  Space,
  Table,
  Tabs,
  Tag,
  Timeline,
  message,
} from 'antd';
import {
  ApiOutlined,
  ArrowLeftOutlined,
  DatabaseOutlined,
  EyeInvisibleOutlined,
  FileTextOutlined,
  RocketOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { PageHead } from '@/components/ui';
import { cases, getDataset, projectIdFromCase } from '@/mock';
import { useStore } from '@/lib/store';

export default function CaseDetailPage() {
  const { caseId } = useParams<{ caseId: string }>();
  const router = useRouter();
  const { user, setProject } = useStore();
  const [msg, ctx] = message.useMessage();
  const c = cases.find((x) => x.id === caseId) ?? cases[0];

  const linkedProjectId = projectIdFromCase(c.id);
  const hasDataset = Boolean(linkedProjectId);
  const ds = getDataset(linkedProjectId);
  const caseDetail = ds.caseDetail;
  const stakeholders = ds.discover.stakeholders;

  const claim = () => {
    if (linkedProjectId) {
      msg.info('你的团队已领取该案例，正在进入项目工作区');
      setProject(linkedProjectId);
      setTimeout(() => router.push(`/project/${linkedProjectId}`), 700);
    } else {
      msg.success('已提交领取申请，等待教师分配（原型演示）');
    }
  };

  return (
    <div className="fde-page">
      {ctx}
      <Button type="link" size="small" style={{ paddingLeft: 0, marginBottom: 6 }} onClick={() => router.push('/cases')}>
        <ArrowLeftOutlined /> 返回案例库
      </Button>

      <div
        className="fde-gradient-hero"
        style={{ background: `linear-gradient(120deg, #16223a 0%, ${c.cover}cc 100%)`, marginBottom: 18 }}
      >
        <Row align="middle" gutter={24}>
          <Col flex="auto">
            <Space size={8} style={{ marginBottom: 8 }}>
              <Tag style={{ margin: 0, background: 'rgba(255,255,255,0.16)', border: 'none', color: '#fff' }}>
                {c.industry}
              </Tag>
              <Tag style={{ margin: 0, background: 'rgba(255,255,255,0.16)', border: 'none', color: '#fff' }}>
                {c.difficulty}
              </Tag>
              {c.goldenCase && (
                <Tag color="gold" style={{ margin: 0 }}>
                  Golden Case
                </Tag>
              )}
            </Space>
            <div style={{ fontSize: 25, fontWeight: 680, marginBottom: 8 }}>{c.title}</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', maxWidth: 780, lineHeight: 1.9 }}>
              {c.summary}
            </div>
            <Space size={22} style={{ marginTop: 16, fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>
              <span>企业 {c.company}</span>
              <span>预计投入 {c.duration}</span>
              <span>{c.teams} 个团队做过</span>
              <Rate disabled defaultValue={c.rating} allowHalf style={{ fontSize: 12 }} />
            </Space>
          </Col>
          <Col>
            <Button type="primary" size="large" icon={<RocketOutlined />} onClick={claim}>
              {hasDataset ? '进入项目工作区' : '领取案例'}
            </Button>
          </Col>
        </Row>
      </div>

      {!hasDataset && (
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
          message="该案例的详细资料仍在完善中"
          description="原型演示中，完整的业务背景、隐藏事实与数据沙盒以「通信网络智能运维」与「电网设备巡检报告自动化」两个在建案例为准，此处展示的是通信案例的示例资料。"
        />
      )}

      <Tabs
        defaultActiveKey="bg"
        items={[
          {
            key: 'bg',
            label: '业务背景',
            children: (
              <Row gutter={16}>
                <Col span={15}>
                  <Card size="small" title="Business Context" bordered={false} style={{ marginBottom: 16 }}>
                    <Descriptions column={1} size="small" bordered labelStyle={{ width: 128 }}>
                      <Descriptions.Item label="Company">{caseDetail.background.company}</Descriptions.Item>
                      <Descriptions.Item label="Industry">{caseDetail.background.industry}</Descriptions.Item>
                      <Descriptions.Item label="Organization">{caseDetail.background.organization}</Descriptions.Item>
                      <Descriptions.Item label="Business Model">{caseDetail.background.businessModel}</Descriptions.Item>
                      <Descriptions.Item label="Current System">{caseDetail.background.currentSystem}</Descriptions.Item>
                      <Descriptions.Item label="Business Process">
                        {caseDetail.background.businessProcess}
                      </Descriptions.Item>
                    </Descriptions>
                  </Card>

                  <Card size="small" title="Known Problems" bordered={false}>
                    <List
                      size="small"
                      dataSource={caseDetail.background.knownProblems}
                      renderItem={(p, i) => (
                        <List.Item>
                          <Space align="start">
                            <Tag color="red" style={{ margin: 0 }}>
                              P{i + 1}
                            </Tag>
                            <span style={{ fontSize: 13, lineHeight: 1.8 }}>{p}</span>
                          </Space>
                        </List.Item>
                      )}
                    />
                  </Card>
                </Col>

                <Col span={9}>
                  <Card
                    size="small"
                    title={
                      <Space>
                        <EyeInvisibleOutlined style={{ color: '#fa8c16' }} />
                        隐藏事实（仅教师可见）
                      </Space>
                    }
                    bordered={false}
                    style={{ marginBottom: 16 }}
                  >
                    {user.role === 'teacher' || user.role === 'admin' ? (
                      <Timeline
                        items={caseDetail.hiddenFacts.map((f) => ({
                          color: 'orange',
                          children: <span style={{ fontSize: 12.5, lineHeight: 1.8 }}>{f}</span>,
                        }))}
                      />
                    ) : (
                      <div
                        style={{
                          padding: '24px 16px',
                          textAlign: 'center',
                          color: 'var(--fde-text-dim)',
                          fontSize: 12.5,
                          lineHeight: 1.9,
                        }}
                      >
                        <EyeInvisibleOutlined style={{ fontSize: 22, marginBottom: 8, display: 'block' }} />
                        隐藏事实需要通过 AI 访谈逐步挖掘。
                        <br />
                        切换为「教师」角色可查看完整设定。
                      </div>
                    )}
                  </Card>

                  <Card size="small" title="预期交付物" bordered={false}>
                    <List
                      size="small"
                      dataSource={caseDetail.deliverables}
                      renderItem={(d) => (
                        <List.Item style={{ fontSize: 12.5 }}>
                          <Space align="start">
                            <span style={{ color: '#52c41a' }}>✓</span>
                            {d}
                          </Space>
                        </List.Item>
                      )}
                    />
                  </Card>
                </Col>
              </Row>
            ),
          },
          {
            key: 'sh',
            label: (
              <span>
                <TeamOutlined /> 利益相关者
              </span>
            ),
            children: (
              <Row gutter={[14, 14]}>
                {stakeholders.map((s) => (
                  <Col span={8} key={s.id}>
                    <Card size="small" bordered={false}>
                      <Space size={10} style={{ marginBottom: 10 }}>
                        <Avatar size={38} style={{ background: s.avatarColor }}>
                          {s.name.slice(0, 1)}
                        </Avatar>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 620 }}>{s.name}</div>
                          <div style={{ fontSize: 11.5, color: 'var(--fde-text-dim)' }}>
                            {s.role} · {s.department}
                          </div>
                        </div>
                      </Space>
                      <div style={{ fontSize: 12, lineHeight: 1.9 }}>
                        <div>
                          <b style={{ color: '#52c41a' }}>目标</b>：{s.goal}
                        </div>
                        <div>
                          <b style={{ color: '#ff4d4f' }}>痛点</b>：{s.painPoint}
                        </div>
                        <div style={{ color: 'var(--fde-text-dim)', marginTop: 4 }}>态度：{s.attitude}</div>
                      </div>
                      <Space size={8} style={{ marginTop: 10 }}>
                        <Tag style={{ margin: 0, fontSize: 10 }}>影响力 {s.influence}</Tag>
                        <Tag style={{ margin: 0, fontSize: 10 }}>关注度 {s.interest}</Tag>
                      </Space>
                    </Card>
                  </Col>
                ))}
              </Row>
            ),
          },
          {
            key: 'data',
            label: (
              <span>
                <DatabaseOutlined /> 数据沙盒
              </span>
            ),
            children: (
              <Card size="small" bordered={false}>
                <Alert
                  type="info"
                  showIcon
                  style={{ marginBottom: 14 }}
                  message="数据访问按 Project 隔离，团队仅能访问本项目挂载的数据副本"
                />
                <Table
                  size="small"
                  pagination={false}
                  rowKey="name"
                  dataSource={caseDetail.resources}
                  columns={[
                    {
                      title: '资源',
                      dataIndex: 'name',
                      render: (v, r) => (
                        <Space>
                          {r.type === 'API' || r.type === 'Mock Service' ? <ApiOutlined /> : <FileTextOutlined />}
                          <b>{v}</b>
                        </Space>
                      ),
                    },
                    { title: '类型', dataIndex: 'type', width: 130, render: (v) => <Tag>{v}</Tag> },
                    { title: '规模', dataIndex: 'size', width: 100 },
                    { title: '说明', dataIndex: 'desc' },
                    {
                      title: '操作',
                      width: 120,
                      render: () => (
                        <Space size={4}>
                          <Button type="link" size="small">
                            预览
                          </Button>
                          <Button type="link" size="small">
                            挂载
                          </Button>
                        </Space>
                      ),
                    },
                  ]}
                />
              </Card>
            ),
          },
          {
            key: 'eval',
            label: '评分标准',
            children: (
              <Card size="small" bordered={false}>
                <Table
                  size="small"
                  pagination={false}
                  rowKey="name"
                  dataSource={caseDetail.evaluation}
                  columns={[
                    { title: '评分项', dataIndex: 'name' },
                    { title: '权重', dataIndex: 'weight', width: 100, render: (v) => `${v} 分` },
                    {
                      title: '说明',
                      render: (_, r) =>
                        ({
                          问题理解: '访谈深度、痛点识别准确性、Problem Canvas 完整度与 PSF 得分',
                          '业务/Ontology建模': '对象/关系/动作/规则的完整性与业务贴合度',
                          方案设计: '架构合理性、技术选型论证、风险识别与缓解',
                          原型实现: '主流程可运行性、代码质量、工程规范',
                          'Agent/Harness 质量': '权限、审批、Guardrail、Trace 的落地程度',
                          部署: '容器化、健康检查、可访问 URL、资源约束',
                          评测: 'L1-L4 四层评测的完整性与方法严谨性',
                          业务价值: 'ROI 测算口径合理性与业务方认可度',
                        })[r.name] ?? '',
                    },
                  ]}
                  summary={() => (
                    <Table.Summary.Row style={{ background: '#f7f9fc', fontWeight: 600 }}>
                      <Table.Summary.Cell index={0}>合计</Table.Summary.Cell>
                      <Table.Summary.Cell index={1}>100 分</Table.Summary.Cell>
                      <Table.Summary.Cell index={2}>最终评分由教师确认</Table.Summary.Cell>
                    </Table.Summary.Row>
                  )}
                />
              </Card>
            ),
          },
        ]}
      />
    </div>
  );
}
