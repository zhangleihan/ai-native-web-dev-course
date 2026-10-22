'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Col,
  Descriptions,
  Progress,
  Row,
  Space,
  Statistic,
  Steps,
  Table,
  Tabs,
  Tag,
  Tooltip,
  message,
} from 'antd';
import {
  CloudUploadOutlined,
  CodeOutlined,
  FileOutlined,
  GlobalOutlined,
  LinkOutlined,
  PoweroffOutlined,
  ReloadOutlined,
  RocketOutlined,
} from '@ant-design/icons';
import { MiniBars, PageHead } from '@/components/ui';
import { useStore } from '@/lib/store';
import { templates } from '@/mock';

export default function DeployPage() {
  const { deployStatus, deployStep, deployLogs, startDeploy, stopDeploy, dataset } = useStore();
  const {
    templateId,
    generatedFiles,
    buildSteps,
    info: deploymentInfo,
    runtimeLogs,
    history: deployHistory,
    resourceUsage,
  } = dataset.deploy;

  const [template, setTemplate] = useState(templateId);
  const [msg, ctx] = message.useMessage();
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTemplate(templateId);
  }, [templateId]);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [deployLogs]);

  const running = deployStatus === 'running';
  const building = deployStatus === 'building';

  return (
    <div className="fde-page">
      {ctx}
      <PageHead
        title="Build & Deployment Sandbox"
        desc="模板生成代码 → 构建镜像 → 沙箱运行 → 健康检查 → 分配可访问 URL"
        extra={
          <Space>
            {running && (
              <Button icon={<PoweroffOutlined />} danger onClick={stopDeploy}>
                停止容器
              </Button>
            )}
            <Button
              type="primary"
              icon={<RocketOutlined />}
              loading={building}
              onClick={() => {
                startDeploy();
                msg.info('开始构建并部署到沙箱环境');
              }}
            >
              {running ? '重新部署' : '开始部署'}
            </Button>
          </Space>
        }
      />

      {running && (
        <Alert
          type="success"
          showIcon
          style={{ marginBottom: 16 }}
          message={
            <Space size={10}>
              部署成功，应用已在沙箱中运行
              <a href="#" onClick={(e) => e.preventDefault()} style={{ fontWeight: 600 }}>
                <LinkOutlined /> {deploymentInfo.url}
              </a>
            </Space>
          }
          description="该 URL 可直接用于答辩演示。容器资源受限于 2 core / 4GB，网络仅开放内网白名单。"
        />
      )}

      <Tabs
        defaultActiveKey="deploy"
        items={[
          {
            key: 'deploy',
            label: (
              <span>
                <CloudUploadOutlined /> 部署流水线
              </span>
            ),
            children: (
              <Row gutter={14}>
                <Col span={15}>
                  <Card size="small" bordered={false} title="构建流程" style={{ marginBottom: 14 }}>
                    <Steps
                      size="small"
                      current={deployStep}
                      status={building ? 'process' : running ? 'finish' : 'wait'}
                      items={buildSteps.map((s) => ({ title: s.name }))}
                    />
                  </Card>

                  <Card
                    size="small"
                    bordered={false}
                    title="Build Log"
                    extra={
                      <Space size={8}>
                        {building && <Tag color="processing">构建中</Tag>}
                        {running && <Tag color="success">完成</Tag>}
                        <span style={{ fontSize: 11, color: 'var(--fde-text-dim)' }}>{deployLogs.length} 行</span>
                      </Space>
                    }
                    styles={{ body: { padding: 12 } }}
                  >
                    <div ref={logRef} className="fde-terminal" style={{ height: 300 }}>
                      {deployLogs.length === 0 && (
                        <span style={{ color: '#5b6b82' }}>等待部署开始…点击右上角「开始部署」</span>
                      )}
                      {deployLogs.map((l, i) => (
                        <div key={i} style={{ color: l.startsWith('$') ? '#7cc5ff' : l.startsWith('✓') ? '#95de64' : undefined }}>
                          {l}
                        </div>
                      ))}
                      {building && <span className="blink">▌</span>}
                    </div>
                  </Card>

                  {running && (
                    <Card size="small" bordered={false} title="Runtime Log" style={{ marginTop: 14 }} styles={{ body: { padding: 12 } }}>
                      <div className="fde-terminal" style={{ height: 190, color: '#c9d6e8' }}>
                        {runtimeLogs.map((l, i) => (
                          <div
                            key={i}
                            style={{ color: l.includes('WARN') ? '#ffc069' : l.includes('Approval') ? '#95de64' : undefined }}
                          >
                            {l}
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}
                </Col>

                <Col span={9}>
                  <Card size="small" bordered={false} title="部署信息" style={{ marginBottom: 14 }}>
                    <Descriptions size="small" column={1} bordered labelStyle={{ width: 92 }}>
                      <Descriptions.Item label="状态">
                        <Tag color={running ? 'success' : building ? 'processing' : 'default'} style={{ margin: 0 }}>
                          {running ? 'Running' : building ? 'Building' : deployStatus === 'stopped' ? 'Stopped' : '未部署'}
                        </Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="URL">
                        {running ? (
                          <a href="#" onClick={(e) => e.preventDefault()}>
                            <GlobalOutlined /> {deploymentInfo.url}
                          </a>
                        ) : (
                          '—'
                        )}
                      </Descriptions.Item>
                      <Descriptions.Item label="镜像">
                        <span className="fde-mono">{deploymentInfo.image}</span>
                      </Descriptions.Item>
                      <Descriptions.Item label="容器 ID">
                        <span className="fde-mono">{running ? deploymentInfo.container : '—'}</span>
                      </Descriptions.Item>
                      <Descriptions.Item label="CPU">{deploymentInfo.cpu}</Descriptions.Item>
                      <Descriptions.Item label="内存">{deploymentInfo.memory}</Descriptions.Item>
                      <Descriptions.Item label="磁盘">{deploymentInfo.disk}</Descriptions.Item>
                      <Descriptions.Item label="网络">
                        <Tag color="orange" style={{ margin: 0 }}>
                          {deploymentInfo.network}
                        </Tag>
                      </Descriptions.Item>
                    </Descriptions>

                    <Space style={{ marginTop: 12, width: '100%' }} size={8}>
                      <Button size="small" icon={<ReloadOutlined />} disabled={!running} onClick={() => msg.info('容器重启中…')}>
                        Restart
                      </Button>
                      <Button size="small" icon={<PoweroffOutlined />} danger disabled={!running} onClick={stopDeploy}>
                        Stop
                      </Button>
                      <Button size="small" icon={<LinkOutlined />} disabled={!running}>
                        打开应用
                      </Button>
                    </Space>
                  </Card>

                  <Card size="small" bordered={false} title="资源使用" style={{ marginBottom: 14 }}>
                    <Row gutter={12} style={{ marginBottom: 12 }}>
                      <Col span={12}>
                        <Statistic
                          title="CPU"
                          value={running ? 26 : 0}
                          suffix="%"
                          valueStyle={{ fontSize: 18, color: '#1677ff' }}
                        />
                        <Progress percent={running ? 26 : 0} size="small" showInfo={false} />
                      </Col>
                      <Col span={12}>
                        <Statistic
                          title="内存"
                          value={running ? 57 : 0}
                          suffix="%"
                          valueStyle={{ fontSize: 18, color: '#52c41a' }}
                        />
                        <Progress percent={running ? 57 : 0} size="small" showInfo={false} strokeColor="#52c41a" />
                      </Col>
                    </Row>
                    <MiniBars data={running ? resourceUsage : resourceUsage.map((r) => ({ ...r, cpu: 0, memory: 0 }))} />
                    <Space size={14} style={{ marginTop: 8 }}>
                      <Space size={4}>
                        <span className="fde-dot" style={{ background: '#1677ff' }} />
                        <span style={{ fontSize: 11, color: 'var(--fde-text-dim)' }}>CPU</span>
                      </Space>
                      <Space size={4}>
                        <span className="fde-dot" style={{ background: '#52c41a' }} />
                        <span style={{ fontSize: 11, color: 'var(--fde-text-dim)' }}>Memory</span>
                      </Space>
                    </Space>
                  </Card>

                  <Card size="small" bordered={false} title="部署历史">
                    <Table
                      size="small"
                      pagination={false}
                      rowKey="version"
                      dataSource={deployHistory}
                      columns={[
                        { title: '版本', dataIndex: 'version', width: 56 },
                        { title: '时间', dataIndex: 'time', width: 108, render: (v) => v.slice(5) },
                        {
                          title: '状态',
                          dataIndex: 'status',
                          width: 78,
                          render: (v) => (
                            <Tag
                              color={v === 'running' ? 'success' : v === 'failed' ? 'error' : 'default'}
                              style={{ margin: 0, fontSize: 10 }}
                            >
                              {v}
                            </Tag>
                          ),
                        },
                        { title: '说明', dataIndex: 'note', ellipsis: true },
                      ]}
                    />
                  </Card>
                </Col>
              </Row>
            ),
          },
          {
            key: 'build',
            label: (
              <span>
                <CodeOutlined /> Build Center
              </span>
            ),
            children: (
              <Row gutter={14}>
                <Col span={14}>
                  <Card size="small" bordered={false} title="项目模板" style={{ marginBottom: 14 }}>
                    <Row gutter={[12, 12]}>
                      {templates.map((t) => (
                        <Col span={8} key={t.id}>
                          <div
                            onClick={() => setTemplate(t.id)}
                            style={{
                              border: `1px solid ${template === t.id ? t.color : 'var(--fde-border)'}`,
                              background: template === t.id ? `${t.color}0d` : '#fff',
                              borderRadius: 9,
                              padding: '12px 14px',
                              cursor: 'pointer',
                              height: '100%',
                            }}
                          >
                            <div
                              style={{
                                width: 28,
                                height: 28,
                                borderRadius: 7,
                                background: `${t.color}1a`,
                                color: t.color,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: 8,
                              }}
                            >
                              <CodeOutlined />
                            </div>
                            <div style={{ fontSize: 13, fontWeight: 620, marginBottom: 4 }}>{t.name}</div>
                            <div style={{ fontSize: 11, color: 'var(--fde-text-dim)', lineHeight: 1.7, height: 37 }}>
                              {t.desc}
                            </div>
                            <div style={{ fontSize: 10.5, color: t.color, marginTop: 6 }}>
                              {t.stack} · {t.files} 个文件
                            </div>
                          </div>
                        </Col>
                      ))}
                    </Row>
                    <Button
                      type="primary"
                      style={{ marginTop: 14 }}
                      onClick={() => msg.success('已从模板生成项目骨架，代码已推送至项目 Git 仓库')}
                    >
                      Create from Template
                    </Button>
                  </Card>

                  <Card size="small" bordered={false} title="生成的项目结构">
                    <Table
                      size="small"
                      pagination={false}
                      rowKey="path"
                      dataSource={generatedFiles}
                      columns={[
                        {
                          title: '文件',
                          dataIndex: 'path',
                          render: (v) => (
                            <Space size={6}>
                              <FileOutlined style={{ color: '#b9c2d0' }} />
                              <span className="fde-mono">{v}</span>
                            </Space>
                          ),
                        },
                        { title: '说明', dataIndex: 'desc', width: 200 },
                        { title: '行数', dataIndex: 'lines', width: 70 },
                      ]}
                    />
                  </Card>
                </Col>

                <Col span={10}>
                  <Card size="small" bordered={false} title="Dockerfile" style={{ marginBottom: 14 }}>
                    <pre className="fde-code" style={{ maxHeight: 300 }}>{`FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ ./backend/
COPY frontend/.next ./frontend/.next
COPY ontology/ ./ontology/

ENV PYTHONUNBUFFERED=1
ENV FDE_SANDBOX_MODE=1
ENV FDE_ALLOW_NETWORK=internal-only

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s \\
  CMD curl -f http://localhost:8000/health || exit 1

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]`}</pre>
                  </Card>

                  <Card size="small" bordered={false} title="AI Coding 辅助">
                    <Space direction="vertical" size={9} style={{ width: '100%' }}>
                      {[
                        { t: '根据 Ontology 生成 SQLAlchemy 模型', d: '7 个对象 → 7 张表 + 6 组外键关系' },
                        { t: '根据 Agent 定义生成执行代码', d: '含工具注册、Guardrail 校验与结构化输出解析' },
                        { t: '根据 Workflow 生成流程编排', d: '12 个节点 → 状态机代码骨架' },
                        { t: '生成 README 与部署文档', d: '含环境变量说明与本地启动步骤' },
                      ].map((i) => (
                        <div
                          key={i.t}
                          style={{ border: '1px solid var(--fde-border)', borderRadius: 8, padding: '9px 11px' }}
                        >
                          <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                            <b style={{ fontSize: 12 }}>{i.t}</b>
                            <Tooltip title="原型演示">
                              <Button size="small" type="link" style={{ padding: 0 }}>
                                生成
                              </Button>
                            </Tooltip>
                          </Space>
                          <div style={{ fontSize: 11, color: 'var(--fde-text-dim)', lineHeight: 1.6 }}>{i.d}</div>
                        </div>
                      ))}
                    </Space>
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
