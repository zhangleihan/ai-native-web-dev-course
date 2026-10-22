'use client';

import React from 'react';
import {
  Alert,
  Button,
  Card,
  Col,
  Divider,
  Progress,
  Row,
  Space,
  Statistic,
  Table,
  Tabs,
  Tag,
  Timeline,
  message,
} from 'antd';
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  DownloadOutlined,
  FileDoneOutlined,
  LineChartOutlined,
  TeamOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import { PageHead, Radar } from '@/components/ui';
import { useStore } from '@/lib/store';
export default function EvalPage() {
  const { user, run, dataset, project } = useStore();
  const {
    l1: evalL1,
    l2: evalL2,
    l3: evalL3,
    l4: evalL4,
    fdeScore,
    teamComparison,
    feedback: teacherFeedback,
    portfolioSections,
  } = dataset.evaluation;
  const [msg, ctx] = message.useMessage();

  const total = fdeScore.reduce((s, i) => s + i.score, 0);
  const radarData = fdeScore.map((f) => ({ label: f.cn, value: f.score / f.weight }));

  const metricRow = (
    name: string,
    cn: string,
    value: number,
    target: number,
    unit: string,
    lower?: boolean,
  ) => {
    const pass = lower ? value <= target : value >= target;
    return (
      <div style={{ border: '1px solid var(--fde-border)', borderRadius: 9, padding: '11px 13px' }} key={name}>
        <Space style={{ justifyContent: 'space-between', width: '100%', marginBottom: 4 }}>
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 600 }}>{name}</div>
            <div style={{ fontSize: 10.5, color: 'var(--fde-text-dim)' }}>{cn}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 19, fontWeight: 650, color: pass ? '#52c41a' : '#fa8c16' }}>
              {value}
              <span style={{ fontSize: 11, fontWeight: 400 }}>{unit}</span>
            </div>
            <div style={{ fontSize: 10, color: 'var(--fde-text-dim)' }}>
              目标 {lower ? '≤' : '≥'} {target}
              {unit}
            </div>
          </div>
        </Space>
        <Progress
          percent={lower ? Math.min(100, (target / Math.max(value, 0.001)) * 100) : Math.min(100, (value / target) * 100)}
          size="small"
          showInfo={false}
          strokeColor={pass ? '#52c41a' : '#faad14'}
        />
      </div>
    );
  };

  return (
    <div className="fde-page">
      {ctx}
      <PageHead
        title="Evaluation & Portfolio"
        desc="L1 模型 / L2 Agent / L3 系统 / L4 业务四层评测，加上 FDE 工程管理综合评分与项目成果沉淀"
        extra={
          <Space>
            <Button icon={<DownloadOutlined />} onClick={() => msg.success('报告已导出（原型演示）')}>
              导出 PDF 报告
            </Button>
            <Button type="primary" icon={<FileDoneOutlined />} onClick={() => msg.success('已生成 FDE 项目报告')}>
              生成项目报告
            </Button>
          </Space>
        }
      />

      <Tabs
        defaultActiveKey="eval"
        items={[
          {
            key: 'eval',
            label: (
              <span>
                <LineChartOutlined /> 四层评测
              </span>
            ),
            children: (
              <>
                <Row gutter={14} style={{ marginBottom: 14 }}>
                  <Col span={6}>
                    <Card size="small" bordered={false} title="L1 · Model 模型层" styles={{ body: { padding: 12 } }}>
                      <Space direction="vertical" size={9} style={{ width: '100%' }}>
                        {evalL1.map((m) =>
                          metricRow(m.name, m.cn, m.value, m.target, '', (m as { lower?: boolean }).lower),
                        )}
                      </Space>
                      <div style={{ fontSize: 11, color: 'var(--fde-text-dim)', marginTop: 10, lineHeight: 1.7 }}>
                        基于 50 条历史故障回归集，与两名资深工程师的标注结果对比。
                      </div>
                    </Card>
                  </Col>

                  <Col span={6}>
                    <Card size="small" bordered={false} title="L2 · Agent 智能体层" styles={{ body: { padding: 12 } }}>
                      <Space direction="vertical" size={9} style={{ width: '100%' }}>
                        {evalL2.map((m) => metricRow(m.name, m.cn, m.value, m.target, '', m.lower))}
                      </Space>
                    </Card>
                  </Col>

                  <Col span={6}>
                    <Card size="small" bordered={false} title="L3 · System 系统层" styles={{ body: { padding: 12 } }}>
                      <Space direction="vertical" size={9} style={{ width: '100%' }}>
                        {evalL3.map((m) => metricRow(m.name, m.cn, m.value, m.target, m.unit, m.lower))}
                      </Space>
                    </Card>
                  </Col>

                  <Col span={6}>
                    <Card size="small" bordered={false} title="L4 · Business 业务层" styles={{ body: { padding: 12 } }}>
                      <Space direction="vertical" size={9} style={{ width: '100%' }}>
                        {evalL4.map((m) => (
                          <div
                            key={m.name}
                            style={{ border: '1px solid var(--fde-border)', borderRadius: 9, padding: '10px 12px' }}
                          >
                            <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                              <div>
                                <div style={{ fontSize: 12.5, fontWeight: 600 }}>{m.cn}</div>
                                <div style={{ fontSize: 10.5, color: 'var(--fde-text-dim)' }}>{m.name}</div>
                              </div>
                              <Tag color="green" style={{ margin: 0 }}>
                                {m.delta}
                              </Tag>
                            </Space>
                            <div style={{ fontSize: 12, marginTop: 6 }}>
                              <span style={{ color: 'var(--fde-text-dim)' }}>{m.before}</span>
                              {m.before !== '—' && <ArrowDownOutlined style={{ margin: '0 6px', color: '#52c41a' }} />}
                              <b style={{ color: '#16223a' }}>{m.after}</b>
                            </div>
                            <div style={{ fontSize: 10.5, color: 'var(--fde-text-dim)', marginTop: 4, lineHeight: 1.6 }}>
                              {m.note}
                            </div>
                          </div>
                        ))}
                      </Space>
                    </Card>
                  </Col>
                </Row>

                <Alert
                  type="warning"
                  showIcon
                  message="评测方法提示"
                  description="L4 的人力成本节约采用「工时 × 单价」口径。运维为三班倒排班制，节省的定位时间未必直接转化为人力削减，建议在答辩中主动说明口径与假设边界，并补充 SLA 违约赔付减少这一更硬的收益项。"
                />

                {run.status === 'COMPLETED' && (
                  <Card size="small" bordered={false} style={{ marginTop: 14 }} title="本次 Run 的 Eval Hook 结果">
                    <Row gutter={12}>
                      {[
                        { k: 'Task Success', v: '✓ 成功' },
                        { k: 'Output Quality', v: '0.91' },
                        { k: 'Tool Correctness', v: '1.00' },
                        { k: 'Evidence Grounding', v: '1.00' },
                        { k: 'Cost', v: `$${run.cost.toFixed(3)}` },
                        { k: 'Latency', v: `${(run.elapsedMs / 1000).toFixed(1)}s` },
                        { k: 'Safety', v: '✓ 通过' },
                        { k: '综合', v: `${run.score} 分` },
                      ].map((i) => (
                        <Col span={3} key={i.k}>
                          <Statistic
                            title={<span style={{ fontSize: 11 }}>{i.k}</span>}
                            value={i.v}
                            valueStyle={{ fontSize: 16, color: '#1677ff' }}
                          />
                        </Col>
                      ))}
                    </Row>
                  </Card>
                )}
              </>
            ),
          },
          {
            key: 'score',
            label: (
              <span>
                <TrophyOutlined /> FDE 综合评分
              </span>
            ),
            children: (
              <Row gutter={14}>
                <Col span={14}>
                  <Card size="small" bordered={false} title="评分明细">
                    <Table
                      size="small"
                      pagination={false}
                      rowKey="name"
                      dataSource={fdeScore}
                      columns={[
                        {
                          title: '评分项',
                          dataIndex: 'cn',
                          render: (v, r) => (
                            <div>
                              <b style={{ fontSize: 12.5 }}>{v}</b>
                              <div style={{ fontSize: 10.5, color: 'var(--fde-text-dim)' }}>{r.name}</div>
                            </div>
                          ),
                        },
                        { title: '权重', dataIndex: 'weight', width: 62, render: (v) => `${v} 分` },
                        {
                          title: '得分',
                          dataIndex: 'score',
                          width: 150,
                          render: (v, r) => (
                            <Space size={8}>
                              <b style={{ fontSize: 14, color: v / r.weight >= 0.85 ? '#52c41a' : '#fa8c16' }}>{v}</b>
                              <Progress
                                percent={(v / r.weight) * 100}
                                size="small"
                                showInfo={false}
                                style={{ width: 76 }}
                                strokeColor={v / r.weight >= 0.85 ? '#52c41a' : '#faad14'}
                              />
                            </Space>
                          ),
                        },
                        { title: '评语', dataIndex: 'comment', ellipsis: true },
                      ]}
                      summary={() => (
                        <Table.Summary.Row style={{ background: '#f7f9fc' }}>
                          <Table.Summary.Cell index={0}>
                            <b>合计</b>
                          </Table.Summary.Cell>
                          <Table.Summary.Cell index={1}>
                            <b>100 分</b>
                          </Table.Summary.Cell>
                          <Table.Summary.Cell index={2}>
                            <b style={{ fontSize: 16, color: '#1677ff' }}>{total} 分</b>
                          </Table.Summary.Cell>
                          <Table.Summary.Cell index={3}>
                            <Tag color="blue" style={{ margin: 0 }}>
                              评分状态：教师待确认
                            </Tag>
                          </Table.Summary.Cell>
                        </Table.Summary.Row>
                      )}
                    />
                  </Card>

                  <Card size="small" bordered={false} title="团队横向对比" style={{ marginTop: 14 }}>
                    <Table
                      size="small"
                      pagination={false}
                      rowKey="team"
                      dataSource={teamComparison}
                      rowClassName={(r) => (r.current ? 'ant-table-row-selected' : '')}
                      columns={[
                        {
                          title: '团队',
                          dataIndex: 'team',
                          render: (v, r) => (
                            <Space size={6}>
                              <TeamOutlined style={{ color: r.current ? '#1677ff' : '#b9c2d0' }} />
                              <b style={{ fontSize: 12.5, color: r.current ? '#1677ff' : undefined }}>{v}</b>
                              {r.current && (
                                <Tag color="blue" style={{ margin: 0, fontSize: 9 }}>
                                  本组
                                </Tag>
                              )}
                            </Space>
                          ),
                        },
                        {
                          title: '综合评分',
                          dataIndex: 'score',
                          width: 140,
                          render: (v) => (
                            <Space size={8}>
                              <b>{v}</b>
                              <Progress percent={v} size="small" showInfo={false} style={{ width: 72 }} />
                            </Space>
                          ),
                        },
                        { title: 'PSF', dataIndex: 'psf', width: 62 },
                        { title: 'Ontology', dataIndex: 'ontology', width: 82 },
                        { title: 'Run 次数', dataIndex: 'runs', width: 84 },
                        {
                          title: '已部署',
                          dataIndex: 'deploy',
                          width: 74,
                          render: (v) => (
                            <Tag color={v ? 'success' : 'default'} style={{ margin: 0, fontSize: 10 }}>
                              {v ? '是' : '否'}
                            </Tag>
                          ),
                        },
                      ]}
                    />
                  </Card>
                </Col>

                <Col span={10}>
                  <Card size="small" bordered={false} title="能力雷达" style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0' }}>
                      <Radar data={radarData} size={290} />
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <Statistic
                        title="FDE 综合评分"
                        value={total}
                        suffix="/ 100"
                        valueStyle={{ fontSize: 28, color: '#1677ff', fontWeight: 680 }}
                      />
                    </div>
                  </Card>

                  <Card size="small" bordered={false} title="教师与导师反馈">
                    <Timeline
                      style={{ marginTop: 6 }}
                      items={teacherFeedback.map((f) => ({
                        color: f.role === '教师' ? 'blue' : 'green',
                        children: (
                          <div>
                            <Space size={6} style={{ marginBottom: 4 }}>
                              <b style={{ fontSize: 12.5 }}>{f.author}</b>
                              <Tag style={{ margin: 0, fontSize: 9 }}>{f.role}</Tag>
                              <span style={{ fontSize: 10.5, color: 'var(--fde-text-dim)' }}>{f.time}</span>
                            </Space>
                            <div style={{ fontSize: 12, lineHeight: 1.85, color: '#4a5b76' }}>{f.content}</div>
                            <Space size={5} style={{ marginTop: 5 }}>
                              {f.tags.map((t) => (
                                <Tag key={t} style={{ margin: 0, fontSize: 9 }} color={t === '优点' ? 'green' : 'orange'}>
                                  {t}
                                </Tag>
                              ))}
                            </Space>
                          </div>
                        ),
                      }))}
                    />
                    {(user.role === 'teacher' || user.role === 'mentor') && (
                      <>
                        <Divider style={{ margin: '10px 0' }} />
                        <Space direction="vertical" size={7} style={{ width: '100%' }}>
                          <div style={{ fontSize: 12, fontWeight: 600 }}>Teacher Copilot</div>
                          {[
                            'Review Project · 生成项目整体评审意见',
                            'Detect Missing Steps · 检测缺失的交付环节',
                            'Compare Teams · 与其他团队横向对比',
                            'Summarize Trace · 汇总 Agent 运行表现',
                          ].map((a) => (
                            <Button key={a} block size="small" onClick={() => msg.info('原型演示：Teacher Copilot 正在分析')}>
                              {a}
                            </Button>
                          ))}
                          <Alert
                            type="info"
                            style={{ fontSize: 11 }}
                            message={<span style={{ fontSize: 11 }}>Copilot 只提供辅助意见，最终评分仍由教师确认。</span>}
                          />
                        </Space>
                      </>
                    )}
                  </Card>
                </Col>
              </Row>
            ),
          },
          {
            key: 'portfolio',
            label: (
              <span>
                <FileDoneOutlined /> 项目成果 Portfolio
              </span>
            ),
            children: (
              <Row gutter={14}>
                <Col span={17}>
                  <Card size="small" bordered={false} styles={{ body: { padding: '24px 30px' } }}>
                    <div style={{ textAlign: 'center', marginBottom: 22 }}>
                      <div style={{ fontSize: 22, fontWeight: 680, color: '#16223a' }}>FDE 项目交付报告</div>
                      <div style={{ fontSize: 13, color: 'var(--fde-text-dim)', marginTop: 5 }}>
                        {project.name} · {project.team} · {project.teacher} 指导
                      </div>
                      <Space size={8} style={{ marginTop: 10 }}>
                        <Tag color="blue">{project.industry}</Tag>
                        <Tag color="green">综合评分 {total}</Tag>
                        <Tag color="orange">生成于 2026-08-26</Tag>
                      </Space>
                    </div>

                    {portfolioSections.map((s, i) => (
                      <div key={s.key} style={{ marginBottom: 20 }}>
                        <div style={{ fontSize: 15, fontWeight: 650, color: '#16223a', marginBottom: 8 }}>
                          <span style={{ color: '#1677ff', marginRight: 8 }}>{String(i + 1).padStart(2, '0')}</span>
                          {s.title}
                        </div>
                        <div style={{ fontSize: 13, lineHeight: 2, color: '#4a5b76', textAlign: 'justify' }}>
                          {s.content}
                        </div>
                      </div>
                    ))}

                    <Divider />
                    <div style={{ fontSize: 11.5, color: 'var(--fde-text-dim)', textAlign: 'center', lineHeight: 1.8 }}>
                      本报告由平台根据项目 Trace、Ontology、Memory 与评测数据自动汇总生成，
                      <br />
                      团队可在此基础上编辑后作为答辩材料提交。
                    </div>
                  </Card>
                </Col>

                <Col span={7}>
                  <Card size="small" bordered={false} title="交付物清单" style={{ marginBottom: 14 }}>
                    <Space direction="vertical" size={8} style={{ width: '100%' }}>
                      {[
                        { n: 'Problem Canvas', s: '已完成', ok: true },
                        { n: 'Stakeholder Map', s: '6 位相关者', ok: true },
                        { n: 'Ontology Schema', s: '7 对象 / 6 关系', ok: true },
                        { n: 'Solution Architecture', s: '已评审', ok: true },
                        { n: 'Agent 定义', s: '4 个 Agent', ok: true },
                        { n: 'Workflow', s: 'v1.3 / 12 节点', ok: true },
                        { n: 'Trace 记录', s: '38 次 Run', ok: true },
                        { n: '部署 URL', s: '沙箱运行中', ok: true },
                        { n: '评测报告', s: 'L1-L4 齐备', ok: true },
                        { n: '压测数据', s: '缺失', ok: false },
                      ].map((d) => (
                        <div
                          key={d.n}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontSize: 12,
                            padding: '5px 0',
                            borderBottom: '1px dashed #eef1f6',
                          }}
                        >
                          <span>{d.n}</span>
                          <Tag color={d.ok ? 'success' : 'warning'} style={{ margin: 0, fontSize: 10 }}>
                            {d.s}
                          </Tag>
                        </div>
                      ))}
                    </Space>
                  </Card>

                  <Card size="small" bordered={false} title="Evolve · 复盘沉淀">
                    <div style={{ fontSize: 12, lineHeight: 1.9, color: '#4a5b76' }}>
                      <b>Episodic 教训 3 条</b>
                      <div style={{ paddingLeft: 10, marginTop: 3 }}>
                        · 拓扑查询应前置于知识检索
                        <br />· 批量写操作需串行化并退避
                        <br />· 必须启用文档时效过滤
                      </div>
                      <Divider style={{ margin: '10px 0' }} />
                      <b>Decision 决策 3 条</b>
                      <div style={{ paddingLeft: 10, marginTop: 3 }}>
                        · 采用 Workflow + Agent 编排
                        <br />· 置信度阈值定为 0.8
                        <br />· 客户通知功能移入二期
                      </div>
                    </div>
                    <Alert
                      type="success"
                      showIcon
                      style={{ marginTop: 12, fontSize: 11 }}
                      message={
                        <span style={{ fontSize: 11, lineHeight: 1.7 }}>
                          这些沉淀会跟随 Project Memory 进入下一轮迭代，也是教学复盘的一手材料。
                        </span>
                      }
                    />
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
