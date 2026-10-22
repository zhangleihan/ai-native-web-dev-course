'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Alert,
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  Drawer,
  Input,
  Progress,
  Row,
  Select,
  Slider,
  Space,
  Statistic,
  Steps,
  Tag,
  Tooltip,
  message,
} from 'antd';
import {
  ApiOutlined,
  CaretRightFilled,
  CheckCircleFilled,
  CloudOutlined,
  CloudServerOutlined,
  CodeOutlined,
  DatabaseOutlined,
  ExperimentOutlined,
  GithubOutlined,
  LaptopOutlined,
  RobotOutlined,
  SafetyOutlined,
  StopOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import CloudIde from '@/components/CloudIde';
import { PageHead } from '@/components/ui';
import { useStore } from '@/lib/store';
import { agentRunModes, agentWorkspaces, frameworkAdapters } from '@/mock';
import type { AgentWorkspaceKind } from '@/mock';
import { permissionColor, statusColor } from '@/lib/theme';

export default function AgentStudioPage() {
  const router = useRouter();
  const { permissions, run, startRun, resetRun, memories, dataset, project } = useStore();
  const agents = dataset.agents;
  const tools = dataset.tools.registry;
  const [selected, setSelected] = useState(agents[0].id);
  const [workspace, setWorkspace] = useState<AgentWorkspaceKind>('studio');
  const [runOpen, setRunOpen] = useState(false);
  const [input, setInput] = useState(dataset.run.input);
  const [msg, ctx] = message.useMessage();
  const P = `/project/${project.id}`;

  useEffect(() => {
    setSelected(agents[0].id);
    setInput(dataset.run.input);
  }, [agents, dataset]);

  const agent = agents.find((a) => a.id === selected) ?? agents[0];
  const perm = permissions[agent.id] ?? {};
  const ws = agentWorkspaces.find((w) => w.id === workspace) ?? agentWorkspaces[0];

  const launch = () => {
    startRun();
    setRunOpen(true);
    msg.info('Agent Run 已启动，Harness 正在构建 Context');
  };

  const projectRules = memories.filter((m) => m.type === 'PROJECT' && m.pinned);
  const ideMode = workspace === 'cloud-ide' || workspace === 'lingji';

  return (
    <div className="fde-page">
      {ctx}
      <PageHead
        title="Agent Studio"
        desc="定义 Agent 规格，并可切换到云 AI-IDE 在浏览器里实现。运行一律走 Harness"
        extra={
          <Space>
            <Button icon={<CodeOutlined />} onClick={() => router.push(`${P}/workflow`)}>
              Workflow 编排
            </Button>
            <Button type="primary" icon={<CaretRightFilled />} onClick={launch}>
              运行 Agent
            </Button>
          </Space>
        }
      />

      <Card
        size="small"
        bordered={false}
        title="Agent 实现环境"
        style={{ marginBottom: 14 }}
        extra={<span style={{ fontSize: 11.5, color: 'var(--fde-text-dim)' }}>怎么写可以开放 · 怎么跑必须受控</span>}
      >
        <Row gutter={10}>
          {agentWorkspaces.map((w) => {
            const active = workspace === w.id;
            const icon =
              w.id === 'studio' ? (
                <RobotOutlined />
              ) : w.id === 'cloud-ide' ? (
                <CloudOutlined />
              ) : w.id === 'lingji' ? (
                <CloudServerOutlined />
              ) : (
                <LaptopOutlined />
              );
            return (
              <Col span={6} key={w.id}>
                <div
                  onClick={() => {
                    setWorkspace(w.id);
                    msg.success(`实现环境已切换为 ${w.name}`);
                  }}
                  style={{
                    border: `1px solid ${active ? '#1677ff' : 'var(--fde-border)'}`,
                    background: active ? '#eaf3ff' : '#fff',
                    borderRadius: 8,
                    padding: '10px 12px',
                    cursor: 'pointer',
                    height: '100%',
                  }}
                >
                  <Space style={{ justifyContent: 'space-between', width: '100%', marginBottom: 6 }}>
                    <Space size={6}>
                      {icon}
                      <b style={{ fontSize: 13 }}>{w.name}</b>
                    </Space>
                    <Tag color={active ? 'blue' : w.openness === '开放' ? 'green' : 'default'} style={{ margin: 0, fontSize: 10 }}>
                      {active ? '当前' : w.openness}
                    </Tag>
                  </Space>
                  <div style={{ fontSize: 11, color: 'var(--fde-text-dim)', marginBottom: 4 }}>{w.vendor}</div>
                  <div style={{ fontSize: 11.5, lineHeight: 1.7, color: '#4a5b76' }}>{w.desc}</div>
                </div>
              </Col>
            );
          })}
        </Row>
      </Card>

      <Row gutter={14}>
        <Col span={5}>
          <Card size="small" bordered={false} title="Agents" styles={{ body: { padding: 10 } }}>
            <Space direction="vertical" size={7} style={{ width: '100%' }}>
              {agents.map((a) => (
                <div
                  key={a.id}
                  onClick={() => setSelected(a.id)}
                  style={{
                    padding: '10px 11px',
                    borderRadius: 8,
                    cursor: 'pointer',
                    border: `1px solid ${selected === a.id ? '#91caff' : 'transparent'}`,
                    background: selected === a.id ? '#eaf3ff' : '#fafbfd',
                  }}
                >
                  <Space style={{ justifyContent: 'space-between', width: '100%', marginBottom: 3 }}>
                    <Space size={6}>
                      <RobotOutlined style={{ color: a.status === 'ready' ? '#52c41a' : '#bfc7d4' }} />
                      <span style={{ fontSize: 12.5, fontWeight: 620 }}>{a.name}</span>
                    </Space>
                    <Tag color={a.status === 'ready' ? 'success' : 'default'} style={{ margin: 0, fontSize: 9 }}>
                      {a.status}
                    </Tag>
                  </Space>
                  <div style={{ fontSize: 10.5, color: 'var(--fde-text-dim)', marginBottom: 5 }}>{a.cn}</div>
                  <Space size={8} style={{ fontSize: 10, color: 'var(--fde-text-dim)' }}>
                    <span>{a.runs} 次运行</span>
                    <span>成功率 {(a.successRate * 100).toFixed(0)}%</span>
                  </Space>
                </div>
              ))}
            </Space>
            <Button block size="small" style={{ marginTop: 10 }} icon={<RobotOutlined />}>
              新建 Agent
            </Button>
          </Card>

          {!ideMode && (
            <>
          <Card size="small" bordered={false} title="运行模式" style={{ marginTop: 14 }}>
            <Space direction="vertical" size={8} style={{ width: '100%' }}>
              {agentRunModes.map((m) => (
                <div
                  key={m.key}
                  style={{
                    border: `1px solid ${m.used ? '#b7ebc6' : 'var(--fde-border)'}`,
                    background: m.used ? '#f6ffed' : '#fff',
                    borderRadius: 8,
                    padding: '8px 10px',
                  }}
                >
                  <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                    <b style={{ fontSize: 12 }}>{m.name}</b>
                    {m.used && (
                      <Tag color="success" style={{ margin: 0, fontSize: 9 }}>
                        采用
                      </Tag>
                    )}
                  </Space>
                  <div className="fde-mono" style={{ color: '#8c8c8c', margin: '4px 0' }}>
                    {m.diagram}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--fde-text-dim)', lineHeight: 1.65 }}>{m.desc}</div>
                </div>
              ))}
            </Space>
          </Card>

          <Card size="small" bordered={false} title="Framework Adapter" style={{ marginTop: 14 }}>
            {frameworkAdapters.map((f) => (
              <div key={f.name} style={{ marginBottom: 9 }}>
                <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                  <span style={{ fontSize: 12, fontWeight: 550 }}>{f.name}</span>
                  <Tag color={f.status === 'active' ? 'blue' : 'default'} style={{ margin: 0, fontSize: 9 }}>
                    {f.status}
                  </Tag>
                </Space>
                <div style={{ fontSize: 10.5, color: 'var(--fde-text-dim)', lineHeight: 1.6 }}>
                  v{f.version} · {f.desc}
                </div>
              </div>
            ))}
            <Alert
              type="info"
              style={{ marginTop: 6, fontSize: 11 }}
              message={
                <span style={{ fontSize: 11, lineHeight: 1.7 }}>
                  平台业务不直接绑定具体 Agent 框架，统一通过 Agent.run() / stream() / resume() / stop() 抽象层调用。
                </span>
              }
            />
          </Card>
            </>
          )}
        </Col>

        {ideMode ? (
          <Col span={19}>
            <CloudIde
              agent={agent}
              projectId={project.id}
              projectName={project.name}
              variant={workspace === 'lingji' ? 'lingji' : 'cloud'}
              onRun={launch}
            />
          </Col>
        ) : (
        <>
        <Col span={12}>
          {workspace === 'external-ide' && (
            <Card
              size="small"
              bordered={false}
              title={
                <Space>
                  <LaptopOutlined style={{ color: '#1677ff' }} />
                  {ws.name} · 实现桥接
                </Space>
              }
              extra={
                <Space>
                  <Button
                    size="small"
                    icon={<GithubOutlined />}
                    onClick={() => msg.success('已复制 git clone 命令（原型演示）')}
                  >
                    复制仓库地址
                  </Button>
                  <Button
                    size="small"
                    onClick={() => msg.info('已生成 Cursor 工作区，请在本地 IDE 中打开（原型演示）')}
                  >
                    在 Cursor 中打开
                  </Button>
                  <Button size="small" type="primary" icon={<CloudOutlined />} onClick={() => setWorkspace('cloud-ide')}>
                    打开云 AI-IDE
                  </Button>
                </Space>
              }
              style={{ marginBottom: 14 }}
            >
              <Alert
                type="warning"
                showIcon
                style={{ marginBottom: 12 }}
                message={ws.constraint}
                description="Role / Goal / Guardrail 仍由本页规格定义。IDE 只负责实现，不能直连模型或绕过审批。"
              />
              <div style={{ fontSize: 12, color: 'var(--fde-text-dim)', marginBottom: 6 }}>
                仓库 <span className="fde-mono">git.fde-lab.internal/{project.id}/agents</span>
                {' · 适配 Cursor / VS Code Copilot / Continue，也可使用平台云 AI-IDE'}
              </div>
              <Space direction="vertical" size={5} style={{ width: '100%' }}>
                {ws.files.map((f) => (
                  <div
                    key={f.path}
                    style={{
                      border: '1px solid var(--fde-border)',
                      borderRadius: 7,
                      padding: '6px 10px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 12,
                    }}
                  >
                    <span className="fde-mono" style={{ fontSize: 12 }}>
                      {f.path}
                    </span>
                    <span style={{ fontSize: 11.5, color: 'var(--fde-text-dim)' }}>{f.desc}</span>
                  </div>
                ))}
              </Space>
              <pre className="fde-code-light" style={{ marginTop: 12, maxHeight: 140 }}>
{`# ${agent.name} 由 ${ws.vendor} 实现
# 运行入口不可替换
from fde_harness import Agent, mcp

agent = Agent.load("${agent.id}")  # Role / Guardrail 来自 Studio 规格
agent.bind_tools(mcp.gateway("${project.id}"))

# ❌ 禁止：openai.chat(...) 直连
# ✅ 允许：agent.run(input) → Harness → Model Router / 灵畿网关`}
              </pre>
            </Card>
          )}
          <Card
            size="small"
            bordered={false}
            title={
              <Space>
                <RobotOutlined style={{ color: '#722ed1' }} />
                {agent.name}
                <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--fde-text-dim)' }}>{agent.cn}</span>
              </Space>
            }
            extra={
              <Space>
                <Button size="small">复制</Button>
                <Button size="small" type="primary" onClick={launch}>
                  运行此 Agent
                </Button>
              </Space>
            }
          >
            <Descriptions size="small" column={2} bordered labelStyle={{ width: 74 }} style={{ marginBottom: 14 }}>
              <Descriptions.Item label="Role" span={2}>
                {agent.role}
              </Descriptions.Item>
              <Descriptions.Item label="Goal" span={2}>
                {agent.goal}
              </Descriptions.Item>
              <Descriptions.Item label="Provider">{agent.provider}</Descriptions.Item>
              <Descriptions.Item label="Model">
                <span className="fde-mono">{agent.model}</span>
              </Descriptions.Item>
            </Descriptions>

            <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 6 }}>Instructions</div>
            <Input.TextArea
              value={agent.instructions}
              autoSize={{ minRows: 6, maxRows: 12 }}
              style={{ fontSize: 12, lineHeight: 1.85, fontFamily: 'inherit' }}
              readOnly
            />

            <Row gutter={12} style={{ marginTop: 14 }}>
              <Col span={12}>
                <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 6 }}>Output Schema</div>
                <pre className="fde-code-light" style={{ maxHeight: 190 }}>
                  {agent.outputSchema}
                </pre>
              </Col>
              <Col span={12}>
                <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 6 }}>模型参数</div>
                <div style={{ border: '1px solid var(--fde-border)', borderRadius: 8, padding: '10px 12px' }}>
                  <div style={{ fontSize: 11.5, color: 'var(--fde-text-dim)', marginBottom: 2 }}>Temperature</div>
                  <Slider min={0} max={1} step={0.1} value={agent.temperature} disabled tooltip={{ open: false }} />
                  <div style={{ fontSize: 11.5, color: 'var(--fde-text-dim)', marginBottom: 4 }}>
                    当前值 {agent.temperature} · 诊断类任务需要低随机性
                  </div>
                  <Divider style={{ margin: '8px 0' }} />
                  <div style={{ fontSize: 11.5, color: 'var(--fde-text-dim)', marginBottom: 4 }}>Fallback 模型</div>
                  <Select
                    size="small"
                    style={{ width: '100%' }}
                    defaultValue="deepseek-v3"
                    options={[
                      { value: 'deepseek-v3', label: 'deepseek-v3（私有化）' },
                      { value: 'qwen2.5-32b-instruct', label: 'qwen2.5-32b-instruct' },
                      { value: 'none', label: '不启用' },
                    ]}
                  />
                </div>
              </Col>
            </Row>

            <Divider style={{ margin: '16px 0 12px' }} />

            <Row gutter={12}>
              <Col span={8}>
                <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 7 }}>
                  <ApiOutlined /> Tools（{agent.tools.length}）
                </div>
                <Space direction="vertical" size={5} style={{ width: '100%' }}>
                  {agent.tools.map((tid) => {
                    const t = tools.find((x) => x.id === tid);
                    const p = perm[tid] ?? 'DENY';
                    return (
                      <div
                        key={tid}
                        style={{
                          border: '1px solid var(--fde-border)',
                          borderRadius: 7,
                          padding: '6px 8px',
                          fontSize: 11.5,
                        }}
                      >
                        <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                          <span className="fde-mono">{t?.name}</span>
                          <Tag color={permissionColor[p]} style={{ margin: 0, fontSize: 9 }}>
                            {p === 'APPROVAL_REQUIRED' ? 'APPROVAL' : p}
                          </Tag>
                        </Space>
                      </div>
                    );
                  })}
                </Space>
              </Col>
              <Col span={8}>
                <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 7 }}>
                  <DatabaseOutlined /> Knowledge & Memory
                </div>
                <Space direction="vertical" size={5} style={{ width: '100%' }}>
                  {agent.knowledge.map((k) => (
                    <Tag key={k} color="cyan" style={{ margin: 0, whiteSpace: 'normal', lineHeight: 1.7 }}>
                      {k}
                    </Tag>
                  ))}
                  {agent.memory.map((m) => (
                    <Tag key={m} color="purple" style={{ margin: 0 }}>
                      {m} Memory
                    </Tag>
                  ))}
                </Space>
              </Col>
              <Col span={8}>
                <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 7 }}>
                  <SafetyOutlined /> Guardrails
                </div>
                <Space direction="vertical" size={5} style={{ width: '100%' }}>
                  {agent.guardrails.map((g) => (
                    <div
                      key={g}
                      style={{
                        fontSize: 11.5,
                        color: '#4a5b76',
                        background: '#fff7e6',
                        border: '1px solid #ffe7ba',
                        borderRadius: 6,
                        padding: '5px 8px',
                        lineHeight: 1.6,
                      }}
                    >
                      {g}
                    </div>
                  ))}
                </Space>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col span={7}>
          <Card size="small" bordered={false} title="运行统计" style={{ marginBottom: 14 }}>
            <Row gutter={12}>
              <Col span={12}>
                <Statistic title="总运行次数" value={agent.runs} valueStyle={{ fontSize: 19 }} />
              </Col>
              <Col span={12}>
                <Statistic
                  title="任务成功率"
                  value={agent.successRate * 100}
                  precision={0}
                  suffix="%"
                  valueStyle={{ fontSize: 19, color: '#52c41a' }}
                />
              </Col>
              <Col span={12} style={{ marginTop: 12 }}>
                <Statistic title="平均时延" value={agent.avgLatency} precision={1} suffix="s" valueStyle={{ fontSize: 19 }} />
              </Col>
              <Col span={12} style={{ marginTop: 12 }}>
                <Statistic
                  title="平均成本"
                  value={agent.avgCost}
                  precision={2}
                  prefix="$"
                  valueStyle={{ fontSize: 19, color: '#fa8c16' }}
                />
              </Col>
            </Row>
          </Card>

          <Card
            size="small"
            bordered={false}
            title={
              <Space>
                <ThunderboltOutlined style={{ color: '#fa8c16' }} />
                Run Console
              </Space>
            }
            extra={
              run.status !== 'CREATED' && (
                <Tag color={statusColor[run.status]} style={{ margin: 0 }}>
                  {run.status}
                </Tag>
              )
            }
          >
            <div style={{ fontSize: 11.5, color: 'var(--fde-text-dim)', marginBottom: 6 }}>输入</div>
            <Input.TextArea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              autoSize={{ minRows: 4, maxRows: 7 }}
              style={{ fontSize: 12, lineHeight: 1.8, marginBottom: 10 }}
            />

            <div style={{ fontSize: 11.5, color: 'var(--fde-text-dim)', marginBottom: 6 }}>
              Harness 将注入的项目级约束（{projectRules.length} 条）
            </div>
            <Space direction="vertical" size={4} style={{ width: '100%', marginBottom: 12 }}>
              {projectRules.map((r) => (
                <div
                  key={r.id}
                  style={{
                    fontSize: 11,
                    background: '#f6ffed',
                    border: '1px solid #d9f7be',
                    borderRadius: 6,
                    padding: '5px 8px',
                    color: '#3f6212',
                    lineHeight: 1.6,
                  }}
                >
                  <CheckCircleFilled style={{ color: '#52c41a', marginRight: 5 }} />
                  {r.summary}
                </div>
              ))}
            </Space>

            <Space style={{ width: '100%' }} size={8}>
              <Button
                type="primary"
                icon={<CaretRightFilled />}
                onClick={launch}
                disabled={run.status === 'RUNNING' || run.status === 'WAITING_APPROVAL'}
                block
              >
                {run.status === 'RUNNING' ? '运行中…' : '启动 Run'}
              </Button>
              {run.status !== 'CREATED' && (
                <Tooltip title="重置本次演示运行">
                  <Button icon={<StopOutlined />} onClick={resetRun} />
                </Tooltip>
              )}
            </Space>

            {run.status !== 'CREATED' && (
              <>
                <Divider style={{ margin: '14px 0 10px' }} />
                <Steps
                  size="small"
                  direction="vertical"
                  current={run.spans.length}
                  status={run.status === 'CANCELLED' ? 'error' : 'process'}
                  items={run.spans.slice(-4).map((s) => ({
                    title: <span style={{ fontSize: 12 }}>{s.name}</span>,
                    description: (
                      <span style={{ fontSize: 11 }}>
                        {s.status === 'waiting' ? '等待人工审批' : `${s.durationMs}ms`}
                      </span>
                    ),
                  }))}
                />
                <Button block type="link" size="small" onClick={() => setRunOpen(true)}>
                  展开完整运行面板
                </Button>
              </>
            )}
          </Card>
        </Col>
        </>
        )}
      </Row>

      <Drawer
        open={runOpen}
        onClose={() => setRunOpen(false)}
        width={720}
        title={
          <Space>
            <ExperimentOutlined style={{ color: '#1677ff' }} />
            Agent Run · {run.id}
            <Tag color={statusColor[run.status]} style={{ margin: 0 }}>
              {run.status}
            </Tag>
          </Space>
        }
        extra={
          <Space>
            <Button size="small" onClick={() => router.push(`${P}/trace`)}>
              查看 Trace
            </Button>
            <Button size="small" type="primary" onClick={() => router.push(`${P}/trace`)}>
              前往审批
            </Button>
          </Space>
        }
      >
        <Row gutter={10} style={{ marginBottom: 14 }}>
          <Col span={6}>
            <Statistic title="已执行 Span" value={run.spans.length} valueStyle={{ fontSize: 18 }} />
          </Col>
          <Col span={6}>
            <Statistic title="Token" value={run.tokens} valueStyle={{ fontSize: 18 }} />
          </Col>
          <Col span={6}>
            <Statistic title="成本" value={run.cost} precision={3} prefix="$" valueStyle={{ fontSize: 18 }} />
          </Col>
          <Col span={6}>
            <Statistic
              title="耗时"
              value={(run.elapsedMs / 1000).toFixed(1)}
              suffix="s"
              valueStyle={{ fontSize: 18 }}
            />
          </Col>
        </Row>

        {run.status === 'WAITING_APPROVAL' && (
          <Alert
            type="warning"
            showIcon
            style={{ marginBottom: 14 }}
            message="执行已暂停：高风险动作需要人工审批"
            description="create_work_order 的权限为 APPROVAL_REQUIRED，请前往 Trace & Approval 页面处理审批请求。"
            action={
              <Button size="small" type="primary" onClick={() => router.push(`${P}/trace`)}>
                去审批
              </Button>
            }
          />
        )}

        {run.status === 'COMPLETED' && (
          <Alert
            type="success"
            showIcon
            style={{ marginBottom: 14 }}
            message={`Run 完成 · Eval 评分 ${run.score}`}
            description="Episodic 与 Semantic 记忆候选已生成，等待在 Memory Inspector 中确认后写入长期记忆。"
          />
        )}

        <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 8 }}>执行日志</div>
        <div className="fde-terminal" style={{ height: 260, marginBottom: 16 }}>
          {run.logs.map((l, i) => (
            <div key={i}>{l}</div>
          ))}
          {(run.status === 'RUNNING' || run.status === 'WAITING_APPROVAL') && <span className="blink">▌</span>}
        </div>

        <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 8 }}>Span 时间线</div>
        <Space direction="vertical" size={6} style={{ width: '100%' }}>
          {run.spans.map((s) => (
            <div
              key={s.id}
              style={{
                border: '1px solid var(--fde-border)',
                borderRadius: 8,
                padding: '8px 11px',
                background: s.status === 'waiting' ? '#fffbe6' : s.status === 'error' ? '#fff2f0' : '#fff',
              }}
            >
              <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                <b style={{ fontSize: 12.5 }}>{s.name}</b>
                <Space size={8} style={{ fontSize: 11, color: 'var(--fde-text-dim)' }}>
                  {s.tokens && <span>{s.tokens.input + s.tokens.output} tok</span>}
                  {s.cost ? <span>${s.cost.toFixed(3)}</span> : null}
                  <span>{s.durationMs}ms</span>
                </Space>
              </Space>
              <div style={{ fontSize: 11.5, color: '#4a5b76', marginTop: 4, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                {s.output.length > 220 ? `${s.output.slice(0, 220)}…` : s.output}
              </div>
            </div>
          ))}
        </Space>

        {run.status === 'RUNNING' && <Progress percent={Math.min(96, run.spans.length * 8)} style={{ marginTop: 12 }} />}
      </Drawer>
    </div>
  );
}
