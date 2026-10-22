'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Avatar, Badge, Button, Card, Col, Descriptions, Progress, Row, Space, Tag, Timeline } from 'antd';
import {
  ApartmentOutlined,
  BulbOutlined,
  CheckCircleFilled,
  CloudUploadOutlined,
  FileDoneOutlined,
  FileTextOutlined,
  LineChartOutlined,
  RobotOutlined,
  TeamOutlined,
  BranchesOutlined,
} from '@ant-design/icons';
import { Metric, PageHead, StageBar } from '@/components/ui';
import { useStore } from '@/lib/store';

export default function ProjectHome() {
  const router = useRouter();
  const { objects, relations, actions, rules, extracts, psf, run, deployStatus, memories, project, dataset } =
    useStore();
  const P = `/project/${project.id}`;

  const accepted = extracts.filter((e) => e.status === 'accepted').length;
  const readyAgents = dataset.agents.filter((a) => a.status === 'ready').length;
  const activeStage = dataset.stages.find((s) => s.status === 'active');
  const latestDeploy = dataset.deploy.history[0];
  const workflowVersion = dataset.workflow.versions.find((v) => v.current)?.version ?? '—';
  const evalScore = dataset.evaluation.fdeScore.reduce((sum, s) => sum + s.score, 0);

  const deliverables = [
    {
      key: 'canvas',
      icon: <FileTextOutlined />,
      name: 'Problem Canvas',
      desc: `${dataset.define.canvasFields.length} 个字段已填写完整`,
      status: 'done',
      meta: psf ? `PSF ${psf.score}` : `PSF ${dataset.evaluation.teamComparison.find((t) => t.current)?.psf ?? '—'}`,
      route: `${P}/define`,
      color: '#1677ff',
    },
    {
      key: 'stakeholder',
      icon: <TeamOutlined />,
      name: 'Stakeholder Map',
      desc: `${dataset.discover.stakeholders.length} 位相关者 · ${accepted} 条已确认洞察`,
      status: 'done',
      meta: `${accepted} 项`,
      route: `${P}/discover`,
      color: '#13c2c2',
    },
    {
      key: 'ontology',
      icon: <ApartmentOutlined />,
      name: 'Ontology',
      desc: `${objects.length} 对象 / ${relations.length} 关系 / ${actions.length} 动作 / ${rules.length} 规则`,
      status: 'done',
      meta: `${objects.length} 对象`,
      route: `${P}/ontology`,
      color: '#52c41a',
    },
    {
      key: 'solution',
      icon: <BulbOutlined />,
      name: 'Solution Architecture',
      desc: 'Solution Canvas 与架构图已评审通过',
      status: 'done',
      meta: '已评审',
      route: `${P}/design`,
      color: '#722ed1',
    },
    {
      key: 'agent',
      icon: <RobotOutlined />,
      name: 'Agent',
      desc: `${dataset.agents.length} 个 Agent，${readyAgents} 个已就绪 ${dataset.agents.length - readyAgents} 个草稿`,
      status: 'active',
      meta: `${readyAgents}/${dataset.agents.length} 就绪`,
      route: `${P}/agents`,
      color: '#eb2f96',
    },
    {
      key: 'workflow',
      icon: <BranchesOutlined />,
      name: 'Workflow',
      desc: `${dataset.workflow.nodes.length} 节点确定性流程，含 ${
        dataset.workflow.nodes.filter((n) => n.kind === 'Human Approval').length
      } 个人工节点`,
      status: 'done',
      meta: workflowVersion,
      route: `${P}/workflow`,
      color: '#597ef7',
    },
    {
      key: 'deploy',
      icon: <CloudUploadOutlined />,
      name: 'Deployment',
      desc: deployStatus === 'running' ? '沙箱运行中，URL 已分配' : '尚未完成本轮部署',
      status: deployStatus === 'running' ? 'done' : 'todo',
      meta: deployStatus === 'running' ? `${latestDeploy.version} 运行中` : '待部署',
      route: `${P}/deploy`,
      color: '#fa8c16',
    },
    {
      key: 'eval',
      icon: <LineChartOutlined />,
      name: 'Evaluation',
      desc: 'L1-L4 四层评测框架已配置',
      status: 'active',
      meta: `${evalScore} 分`,
      route: `${P}/eval`,
      color: '#faad14',
    },
    {
      key: 'report',
      icon: <FileDoneOutlined />,
      name: 'Final Report',
      desc: `项目复盘报告，${dataset.evaluation.portfolioSections.length} 个章节自动汇总`,
      status: 'todo',
      meta: '待生成',
      route: `${P}/eval`,
      color: '#8c8c8c',
    },
  ];

  const statusTag: Record<string, React.ReactNode> = {
    done: <Tag color="success">已完成</Tag>,
    active: <Tag color="processing">进行中</Tag>,
    todo: <Tag>待开始</Tag>,
  };

  return (
    <div className="fde-page">
      <PageHead
        title={project.name}
        desc={`${project.industry} · 案例「${project.caseName}」 · 创建于 ${project.createdAt}`}
        extra={
          <Space>
            <Button onClick={() => router.push(`${P}/eval`)}>查看评测</Button>
            <Button
              type="primary"
              onClick={() => router.push(`${P}/${activeStage?.route ?? 'agents'}`)}
            >
              继续 {activeStage?.name ?? project.currentStage} 阶段
            </Button>
          </Space>
        }
      />

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={17}>
          <Card size="small" bordered={false} title="FDE 8D 交付进度" style={{ marginBottom: 16 }}>
            <StageBar current={activeStage?.key} />
          </Card>

          <Card size="small" bordered={false} title="核心成果物">
            <Row gutter={[12, 12]}>
              {deliverables.map((d) => (
                <Col span={8} key={d.key}>
                  <Card
                    size="small"
                    bordered
                    className="fde-card-hover"
                    onClick={() => router.push(d.route)}
                    styles={{ body: { padding: 14 } }}
                  >
                    <Space style={{ justifyContent: 'space-between', width: '100%', marginBottom: 8 }}>
                      <div
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: 8,
                          background: `${d.color}15`,
                          color: d.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 15,
                        }}
                      >
                        {d.icon}
                      </div>
                      {statusTag[d.status]}
                    </Space>
                    <div style={{ fontSize: 13.5, fontWeight: 620, marginBottom: 3 }}>{d.name}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--fde-text-dim)', lineHeight: 1.7, height: 34 }}>
                      {d.desc}
                    </div>
                    <div style={{ fontSize: 11.5, color: d.color, fontWeight: 600, marginTop: 6 }}>{d.meta}</div>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>

        <Col span={7}>
          <Card size="small" bordered={false} style={{ marginBottom: 16 }}>
            <div style={{ textAlign: 'center', padding: '6px 0 14px' }}>
              <Progress
                type="dashboard"
                percent={project.overallScore}
                size={126}
                strokeColor={{ '0%': '#1677ff', '100%': '#52c41a' }}
                format={(p) => (
                  <div>
                    <div style={{ fontSize: 26, fontWeight: 680, color: '#16223a' }}>{p}</div>
                    <div style={{ fontSize: 11, color: 'var(--fde-text-dim)' }}>Overall Score</div>
                  </div>
                )}
              />
            </div>
            <Descriptions column={1} size="small" bordered labelStyle={{ width: 84 }}>
              <Descriptions.Item label="行业">{project.industry}</Descriptions.Item>
              <Descriptions.Item label="所属案例">{project.caseName}</Descriptions.Item>
              <Descriptions.Item label="Team">{project.team}</Descriptions.Item>
              <Descriptions.Item label="Teacher">{project.teacher}</Descriptions.Item>
              <Descriptions.Item label="当前 Stage">
                <Tag color="processing">{project.currentStage}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Deadline">
                <span style={{ color: '#fa541c', fontWeight: 600 }}>{project.deadline}</span>
                <span style={{ color: 'var(--fde-text-dim)', marginLeft: 6 }}>剩 {project.daysLeft} 天</span>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Card size="small" bordered={false} title="团队成员" style={{ marginBottom: 16 }}>
            <Space direction="vertical" size={10} style={{ width: '100%' }}>
              {project.teamMembers.map((m) => (
                <Space key={m.name} size={10}>
                  <Badge dot color="#52c41a" offset={[-4, 26]}>
                    <Avatar size={30} style={{ background: m.color, fontSize: 12 }}>
                      {m.name.slice(0, 1)}
                    </Avatar>
                  </Badge>
                  <div style={{ lineHeight: 1.35 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 550 }}>{m.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--fde-text-dim)' }}>{m.role}</div>
                  </div>
                </Space>
              ))}
            </Space>
          </Card>

          <Card size="small" bordered={false} title="项目动态">
            <Timeline
              style={{ marginTop: 4 }}
              items={[
                {
                  color: run.status === 'COMPLETED' ? 'green' : 'blue',
                  children: (
                    <div style={{ fontSize: 12, lineHeight: 1.75 }}>
                      <b>{project.teamMembers[2].name}</b> 运行 {dataset.agents[0].name}
                      <div style={{ color: 'var(--fde-text-dim)' }}>
                        {run.status === 'COMPLETED'
                          ? `已完成，评分 ${dataset.run.successScore}`
                          : '状态 ' + run.status}
                      </div>
                    </div>
                  ),
                },
                {
                  color: 'green',
                  children: (
                    <div style={{ fontSize: 12, lineHeight: 1.75 }}>
                      <b>{project.teamMembers[3].name}</b> 新增 Project Memory
                      <div style={{ color: 'var(--fde-text-dim)' }}>
                        当前共 {memories.length} 条记忆，{memories.filter((m) => m.pinned).length} 条已固定
                      </div>
                    </div>
                  ),
                },
                {
                  color: 'green',
                  children: (
                    <div style={{ fontSize: 12, lineHeight: 1.75 }}>
                      <b>{project.teamMembers[0].name}</b> 完成 Solution Canvas 评审
                      <div style={{ color: 'var(--fde-text-dim)' }}>08-25 16:40</div>
                    </div>
                  ),
                },
                {
                  color: 'gray',
                  children: (
                    <div style={{ fontSize: 12, lineHeight: 1.75 }}>
                      <b>{project.teacher}</b> 提交阶段反馈
                      <div style={{ color: 'var(--fde-text-dim)' }}>
                        {dataset.evaluation.feedback[0].time.slice(5)}
                      </div>
                    </div>
                  ),
                },
              ]}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={12}>
        <Col span={4}>
          <Metric label="访谈洞察" value={accepted} suffix="条已确认" />
        </Col>
        <Col span={4}>
          <Metric label="Ontology 规模" value={objects.length + relations.length + actions.length + rules.length} suffix="元素" />
        </Col>
        <Col span={4}>
          <Metric label="Project Memory" value={memories.filter((m) => m.type === 'PROJECT').length} suffix="条" />
        </Col>
        <Col span={4}>
          <Metric label="Agent Run" value={project.stats.runs} suffix="次" />
        </Col>
        <Col span={4}>
          <Metric
            label="部署状态"
            value={deployStatus === 'running' ? '运行中' : deployStatus === 'building' ? '构建中' : '未部署'}
            color={deployStatus === 'running' ? '#52c41a' : '#8c8c8c'}
          />
        </Col>
        <Col span={4}>
          <Metric label="距答辩" value={project.daysLeft} suffix="天" color="#fa541c" />
        </Col>
      </Row>

      <Card size="small" bordered={false} style={{ marginTop: 16, background: '#f7f9fc' }}>
        <Space size={10} align="start">
          <CheckCircleFilled style={{ color: '#52c41a', fontSize: 16, marginTop: 2 }} />
          <div style={{ fontSize: 12.5, lineHeight: 1.9, color: '#4a5b76' }}>
            <b>Golden Path 演示路径</b>：Discover 访谈 → Define 问题定义 → Ontology 建模 → Solution 设计 → Agent 定义 →
            运行 Agent（Harness 构建 Context、调用工具、Project Memory 提供约束）→ 高风险动作触发人工审批 → 创建工单 →
            Trace 展示全过程 → Eval 显示成功率/成本/时延 → 部署 Dashboard → 生成 FDE 项目报告。
          </div>
        </Space>
      </Card>
    </div>
  );
}
