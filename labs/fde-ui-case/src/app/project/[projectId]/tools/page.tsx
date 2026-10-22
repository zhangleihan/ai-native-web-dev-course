'use client';

import React, { useEffect, useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Descriptions,
  Drawer,
  Row,
  Segmented,
  Space,
  Switch,
  Table,
  Tabs,
  Tag,
  Tooltip,
  message,
} from 'antd';
import {
  ApiOutlined,
  CloudServerOutlined,
  CodeOutlined,
  DatabaseOutlined,
  LockOutlined,
  SafetyCertificateOutlined,
  ToolOutlined,
} from '@ant-design/icons';
import { PageHead } from '@/components/ui';
import { useStore } from '@/lib/store';
import { sandboxConfig, securityBoundary } from '@/mock';
import { permissionColor, riskColor } from '@/lib/theme';
import type { Permission, ToolDef } from '@/mock';

const permOptions: Permission[] = ['ALLOW', 'APPROVAL_REQUIRED', 'DENY'];

export default function ToolsPage() {
  const { permissions, setPermission, dataset } = useStore();
  const agents = dataset.agents;
  const { registry: tools, mcpServers, mcpDiscoveredTools, callLogs: toolCallLogs } = dataset.tools;
  const [detail, setDetail] = useState<ToolDef | null>(null);
  const [mcpSelected, setMcpSelected] = useState(mcpServers[0]?.id ?? '');
  const [msg, ctx] = message.useMessage();

  useEffect(() => {
    setMcpSelected(mcpServers[0]?.id ?? '');
    setDetail(null);
  }, [mcpServers]);

  const highRiskAllowed = agents.some((a) =>
    tools.some((t) => t.risk === 'high' && permissions[a.id]?.[t.id] === 'ALLOW'),
  );

  return (
    <div className="fde-page">
      {ctx}
      <PageHead
        title="Tool Registry & Permission"
        desc="所有工具统一注册与授权。每个 Agent 拥有独立的工具权限，高风险动作强制人工审批"
        extra={
          <Space>
            <Tag color="green" style={{ margin: 0 }}>
              {tools.length} 个工具
            </Tag>
            <Tag color="blue" style={{ margin: 0 }}>
              {mcpServers.filter((s) => s.status === 'connected').length} 个 MCP Server 在线
            </Tag>
          </Space>
        }
      />

      {highRiskAllowed && (
        <Alert
          type="error"
          showIcon
          style={{ marginBottom: 14 }}
          message="检测到高风险工具被配置为 ALLOW"
          description="项目决策要求所有业务写操作必须经过人工审批。请将高风险工具改回 APPROVAL_REQUIRED 或 DENY。"
        />
      )}

      <Tabs
        defaultActiveKey="registry"
        items={[
          {
            key: 'registry',
            label: (
              <span>
                <ToolOutlined /> Tool Registry
              </span>
            ),
            children: (
              <Card size="small" bordered={false}>
                <Table
                  size="small"
                  pagination={false}
                  rowKey="id"
                  dataSource={tools}
                  onRow={(r) => ({ onClick: () => setDetail(r), style: { cursor: 'pointer' } })}
                  columns={[
                    {
                      title: '工具',
                      dataIndex: 'name',
                      render: (v, r) => (
                        <div>
                          <span className="fde-mono" style={{ fontWeight: 600, color: '#16223a' }}>
                            {v}
                          </span>
                          <div style={{ fontSize: 11, color: 'var(--fde-text-dim)' }}>{r.cn}</div>
                        </div>
                      ),
                    },
                    {
                      title: '类型',
                      dataIndex: 'type',
                      width: 118,
                      render: (v) => (
                        <Tag style={{ margin: 0 }} icon={v === 'MCP' ? <CloudServerOutlined /> : undefined}>
                          {v}
                        </Tag>
                      ),
                    },
                    { title: '说明', dataIndex: 'description', ellipsis: true },
                    {
                      title: '风险',
                      dataIndex: 'risk',
                      width: 76,
                      render: (v) => (
                        <Tag color={riskColor[v]} style={{ margin: 0 }}>
                          {v}
                        </Tag>
                      ),
                    },
                    { title: '超时', dataIndex: 'timeout', width: 62, render: (v) => `${v}s` },
                    { title: '调用次数', dataIndex: 'calls', width: 82 },
                  ]}
                />
              </Card>
            ),
          },
          {
            key: 'permission',
            label: (
              <span>
                <LockOutlined /> 权限矩阵
              </span>
            ),
            children: (
              <Card size="small" bordered={false}>
                <Alert
                  type="info"
                  showIcon
                  style={{ marginBottom: 14 }}
                  message="每个 Agent 独立授权 · ALLOW 直接执行，APPROVAL_REQUIRED 暂停等待人工确认，DENY 直接拒绝并记入 Trace"
                />
                <Table
                  size="small"
                  pagination={false}
                  rowKey="id"
                  scroll={{ x: 900 }}
                  dataSource={tools}
                  columns={[
                    {
                      title: '工具',
                      dataIndex: 'name',
                      fixed: 'left',
                      width: 210,
                      render: (v, r) => (
                        <Space size={6}>
                          <span className="fde-mono">{v}</span>
                          <Tag color={riskColor[r.risk]} style={{ margin: 0, fontSize: 9 }}>
                            {r.risk}
                          </Tag>
                        </Space>
                      ),
                    },
                    ...agents.map((a) => ({
                      title: (
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: 11.5 }}>{a.name}</div>
                          <div style={{ fontSize: 10, color: 'var(--fde-text-dim)', fontWeight: 400 }}>{a.cn}</div>
                        </div>
                      ),
                      key: a.id,
                      width: 170,
                      align: 'center' as const,
                      render: (_: unknown, t: ToolDef) => {
                        const p = permissions[a.id]?.[t.id] ?? 'DENY';
                        return (
                          <Segmented
                            size="small"
                            value={p}
                            options={permOptions.map((o) => ({
                              label: (
                                <Tooltip title={o}>
                                  <span
                                    style={{
                                      fontSize: 10,
                                      color: p === o ? undefined : '#b0bacb',
                                      fontWeight: p === o ? 600 : 400,
                                    }}
                                  >
                                    {o === 'ALLOW' ? '允许' : o === 'DENY' ? '拒绝' : '审批'}
                                  </span>
                                </Tooltip>
                              ),
                              value: o,
                            }))}
                            onChange={(v) => {
                              setPermission(a.id, t.id, v as Permission);
                              if (t.risk === 'high' && v === 'ALLOW') {
                                msg.warning(`${t.name} 属于高风险工具，设为 ALLOW 违反项目决策约束`);
                              }
                            }}
                          />
                        );
                      },
                    })),
                  ]}
                />

                <Row gutter={14} style={{ marginTop: 16 }}>
                  <Col span={12}>
                    <Card size="small" title="POC 安全边界" bordered>
                      <Table
                        size="small"
                        pagination={false}
                        showHeader={false}
                        rowKey="action"
                        dataSource={securityBoundary}
                        columns={[
                          { dataIndex: 'action', width: 120, render: (v) => <b style={{ fontSize: 12 }}>{v}</b> },
                          {
                            dataIndex: 'policy',
                            width: 140,
                            render: (v) => (
                              <Tag
                                color={
                                  v === 'Allowed'
                                    ? 'green'
                                    : v === 'Denied'
                                      ? 'red'
                                      : v === 'Approval Required'
                                        ? 'orange'
                                        : 'blue'
                                }
                                style={{ margin: 0, fontSize: 10 }}
                              >
                                {v}
                              </Tag>
                            ),
                          },
                          { dataIndex: 'desc', render: (v) => <span style={{ fontSize: 11.5 }}>{v}</span> },
                        ]}
                      />
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card size="small" title="Sandbox 资源限制" bordered>
                      <Table
                        size="small"
                        pagination={false}
                        rowKey="name"
                        dataSource={[
                          { name: 'Python Sandbox', ...sandboxConfig.python },
                          { name: 'File Workspace', ...sandboxConfig.fileWorkspace },
                          { name: 'Docker Sandbox', ...sandboxConfig.docker },
                        ]}
                        columns={[
                          { title: '环境', dataIndex: 'name', render: (v) => <b style={{ fontSize: 11.5 }}>{v}</b> },
                          { title: 'CPU', dataIndex: 'cpu' },
                          { title: '内存', dataIndex: 'memory' },
                          { title: '磁盘', dataIndex: 'disk' },
                          { title: '超时', dataIndex: 'timeout' },
                          {
                            title: '网络',
                            dataIndex: 'network',
                            render: (v) => (
                              <Tag color={v === '禁用' ? 'red' : 'orange'} style={{ margin: 0, fontSize: 10 }}>
                                {v}
                              </Tag>
                            ),
                          },
                        ]}
                      />
                    </Card>
                  </Col>
                </Row>
              </Card>
            ),
          },
          {
            key: 'mcp',
            label: (
              <span>
                <CloudServerOutlined /> MCP Gateway
              </span>
            ),
            children: (
              <Row gutter={14}>
                <Col span={9}>
                  <Card size="small" bordered={false} title="MCP Servers" extra={<Button size="small">注册 Server</Button>}>
                    <Space direction="vertical" size={9} style={{ width: '100%' }}>
                      {mcpServers.length === 0 && (
                        <div style={{ fontSize: 12, color: 'var(--fde-text-dim)', lineHeight: 1.7 }}>
                          本案例不注册 MCP。检索和子图扩展走 Tool Registry。
                        </div>
                      )}
                      {mcpServers.map((s) => (
                        <div
                          key={s.id}
                          onClick={() => setMcpSelected(s.id)}
                          style={{
                            border: `1px solid ${mcpSelected === s.id ? '#91caff' : 'var(--fde-border)'}`,
                            background: mcpSelected === s.id ? '#eaf3ff' : '#fff',
                            borderRadius: 9,
                            padding: '10px 12px',
                            cursor: 'pointer',
                          }}
                        >
                          <Space style={{ justifyContent: 'space-between', width: '100%', marginBottom: 4 }}>
                            <Space size={7}>
                              <Badge
                                status={
                                  s.status === 'connected' ? 'success' : s.status === 'error' ? 'error' : 'default'
                                }
                              />
                              <b style={{ fontSize: 12.5 }}>{s.name}</b>
                            </Space>
                            <Tag
                              color={s.status === 'connected' ? 'success' : s.status === 'error' ? 'error' : 'default'}
                              style={{ margin: 0, fontSize: 10 }}
                            >
                              {s.status}
                            </Tag>
                          </Space>
                          <div className="fde-mono" style={{ color: '#8c8c8c', marginBottom: 4 }}>
                            {s.endpoint}
                          </div>
                          <div style={{ fontSize: 11.5, color: 'var(--fde-text-dim)', lineHeight: 1.65 }}>{s.desc}</div>
                          <Space size={12} style={{ marginTop: 6, fontSize: 10.5, color: 'var(--fde-text-dim)' }}>
                            <span>{s.tools} 个工具</span>
                            {s.latency > 0 && <span>时延 {s.latency}ms</span>}
                          </Space>
                        </div>
                      ))}
                    </Space>
                  </Card>
                </Col>

                <Col span={15}>
                  <Card
                    size="small"
                    bordered={false}
                    title={`Tool Discovery · ${mcpServers.find((s) => s.id === mcpSelected)?.name ?? '未接入'}`}
                    style={{ marginBottom: 14 }}
                  >
                    <Table
                      size="small"
                      pagination={false}
                      rowKey="name"
                      dataSource={mcpDiscoveredTools[mcpSelected] ?? []}
                      columns={[
                        { title: 'Tool', dataIndex: 'name', render: (v) => <span className="fde-mono">{v}</span> },
                        { title: '说明', dataIndex: 'desc' },
                        {
                          title: '状态',
                          dataIndex: 'enabled',
                          width: 96,
                          render: (v, r) => (
                            <Space size={6}>
                              <Switch
                                size="small"
                                defaultChecked={v}
                                onChange={(c) =>
                                  msg.info(`${r.name} 已${c ? '启用' : '禁用'}（原型演示，不影响后台）`)
                                }
                              />
                              {!v && (
                                <Tooltip title="该工具涉及设备变更，按项目决策禁用">
                                  <LockOutlined style={{ color: '#ff4d4f', fontSize: 11 }} />
                                </Tooltip>
                              )}
                            </Space>
                          ),
                        },
                      ]}
                    />
                  </Card>

                  <Card size="small" bordered={false} title="工具调用日志">
                    <Table
                      size="small"
                      pagination={false}
                      rowKey={(r) => `${r.time}-${r.tool}`}
                      dataSource={toolCallLogs}
                      columns={[
                        { title: '时间', dataIndex: 'time', width: 78, render: (v) => <span className="fde-mono">{v}</span> },
                        { title: '工具', dataIndex: 'tool', render: (v) => <span className="fde-mono">{v}</span> },
                        { title: 'Agent', dataIndex: 'agent', width: 140 },
                        {
                          title: '权限',
                          dataIndex: 'permission',
                          width: 130,
                          render: (v) => (
                            <Tag color={permissionColor[v]} style={{ margin: 0, fontSize: 10 }}>
                              {v}
                            </Tag>
                          ),
                        },
                        {
                          title: '结果',
                          dataIndex: 'status',
                          width: 90,
                          render: (v) => (
                            <Tag
                              color={
                                v === 'success' ? 'success' : v === 'blocked' ? 'error' : v === 'waiting' ? 'warning' : 'default'
                              }
                              style={{ margin: 0, fontSize: 10 }}
                            >
                              {v}
                            </Tag>
                          ),
                        },
                        {
                          title: '时延',
                          dataIndex: 'latency',
                          width: 74,
                          render: (v: number) => (v ? `${v}ms` : '—'),
                        },
                      ]}
                    />
                  </Card>
                </Col>
              </Row>
            ),
          },
        ]}
      />

      <Drawer
        open={!!detail}
        onClose={() => setDetail(null)}
        width={560}
        title={
          <Space>
            <SafetyCertificateOutlined style={{ color: '#1677ff' }} />
            {detail?.name}
          </Space>
        }
      >
        {detail && (
          <>
            <Descriptions size="small" column={2} bordered labelStyle={{ width: 76 }}>
              <Descriptions.Item label="ID" span={2}>
                <span className="fde-mono">{detail.id}</span>
              </Descriptions.Item>
              <Descriptions.Item label="名称">{detail.cn}</Descriptions.Item>
              <Descriptions.Item label="类型">
                <Tag style={{ margin: 0 }}>{detail.type}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="风险等级">
                <Tag color={riskColor[detail.risk]} style={{ margin: 0 }}>
                  {detail.risk}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="超时">{detail.timeout}s</Descriptions.Item>
              <Descriptions.Item label="说明" span={2}>
                {detail.description}
              </Descriptions.Item>
              {detail.server && (
                <Descriptions.Item label="MCP Server" span={2}>
                  {detail.server}
                </Descriptions.Item>
              )}
            </Descriptions>

            <div style={{ fontSize: 12.5, fontWeight: 600, margin: '16px 0 7px' }}>
              <CodeOutlined /> Input Schema
            </div>
            <pre className="fde-code-light">{detail.inputSchema}</pre>

            <div style={{ fontSize: 12.5, fontWeight: 600, margin: '14px 0 7px' }}>
              <DatabaseOutlined /> Output Schema
            </div>
            <pre className="fde-code-light">{detail.outputSchema}</pre>

            <div style={{ fontSize: 12.5, fontWeight: 600, margin: '16px 0 7px' }}>
              <ApiOutlined /> 各 Agent 权限
            </div>
            <Space direction="vertical" size={6} style={{ width: '100%' }}>
              {agents.map((a) => {
                const p = permissions[a.id]?.[detail.id] ?? 'DENY';
                return (
                  <div
                    key={a.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      border: '1px solid var(--fde-border)',
                      borderRadius: 7,
                      padding: '7px 10px',
                    }}
                  >
                    <span style={{ fontSize: 12 }}>{a.name}</span>
                    <Tag color={permissionColor[p]} style={{ margin: 0, fontSize: 10 }}>
                      {p}
                    </Tag>
                  </div>
                );
              })}
            </Space>
          </>
        )}
      </Drawer>
    </div>
  );
}
