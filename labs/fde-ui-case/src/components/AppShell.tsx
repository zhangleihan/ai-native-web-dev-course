'use client';

import React, { useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Avatar, Badge, Button, Dropdown, Layout, Menu, Space, Tag, Tooltip } from 'antd';
import {
  ApartmentOutlined,
  AppstoreOutlined,
  AuditOutlined,
  BellOutlined,
  BookOutlined,
  BranchesOutlined,
  BulbOutlined,
  CloudUploadOutlined,
  DashboardOutlined,
  DatabaseOutlined,
  ExperimentOutlined,
  FileTextOutlined,
  FundProjectionScreenOutlined,
  LineChartOutlined,
  LogoutOutlined,
  NodeIndexOutlined,
  RobotOutlined,
  SafetyCertificateOutlined,
  SettingOutlined,
  SwapOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { users } from '@/mock';
import { useStore } from '@/lib/store';
import CopilotDrawer from './CopilotDrawer';
import type { RoleKey } from '@/mock';

const { Header, Sider, Content } = Layout;

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, setRole, run, setCopilotOpen, project, projects, projectId, setProject } = useStore();

  const P = `/project/${projectId}`;
  const isLogin = pathname === '/login';

  const items = useMemo(
    () => [
      { key: '/', icon: <DashboardOutlined />, label: '工作台 Home' },
      { key: '/proposal', icon: <AuditOutlined />, label: '项目预算 Budget' },
      { key: '/learn', icon: <BookOutlined />, label: '课程 Learn' },
      { key: '/cases', icon: <AppstoreOutlined />, label: '案例 Case Lab' },
      {
        key: 'grp-project',
        label: 'PROJECT WORKSPACE',
        type: 'group' as const,
        children: [
          { key: P, icon: <FundProjectionScreenOutlined />, label: '项目总览' },
          { key: `${P}/discover`, icon: <TeamOutlined />, label: 'Discover 业务发现' },
          { key: `${P}/define`, icon: <FileTextOutlined />, label: 'Define 问题定义' },
          { key: `${P}/ontology`, icon: <ApartmentOutlined />, label: 'Model 本体建模' },
          { key: `${P}/design`, icon: <BulbOutlined />, label: 'Design 方案设计' },
        ],
      },
      {
        key: 'grp-agent',
        label: 'AGENT STUDIO',
        type: 'group' as const,
        children: [
          { key: `${P}/agents`, icon: <RobotOutlined />, label: 'Agent 定义与运行' },
          { key: `${P}/workflow`, icon: <BranchesOutlined />, label: 'Workflow 编排' },
          { key: `${P}/memory`, icon: <DatabaseOutlined />, label: 'Memory Inspector' },
          { key: `${P}/tools`, icon: <SafetyCertificateOutlined />, label: 'Tool & Permission' },
          { key: `${P}/trace`, icon: <NodeIndexOutlined />, label: 'Trace & Approval' },
        ],
      },
      {
        key: 'grp-deliver',
        label: 'DELIVER',
        type: 'group' as const,
        children: [
          { key: `${P}/deploy`, icon: <CloudUploadOutlined />, label: 'Deploy 沙箱部署' },
          { key: `${P}/eval`, icon: <LineChartOutlined />, label: 'Eval & Portfolio' },
        ],
      },
      {
        key: 'grp-admin',
        label: 'ADMIN CONSOLE',
        type: 'group' as const,
        children: [
          { key: '/admin/cases', icon: <ExperimentOutlined />, label: '案例设计器' },
          { key: '/admin/resources', icon: <SettingOutlined />, label: '模型与资源管理' },
        ],
      },
    ],
    [P],
  );

  const selected = useMemo(() => {
    const all: string[] = [];
    items.forEach((i) => {
      if ('children' in i && i.children) i.children.forEach((c) => all.push(c.key));
      else all.push(i.key as string);
    });
    const match = all.filter((k) => pathname === k).sort((a, b) => b.length - a.length);
    if (match.length) return match;
    const prefix = all.filter((k) => k !== '/' && pathname.startsWith(k)).sort((a, b) => b.length - a.length);
    return prefix.slice(0, 1);
  }, [items, pathname]);

  if (isLogin) return <>{children}</>;

  const pendingApprovalCount = run.status === 'WAITING_APPROVAL' ? 1 : 0;

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={228} className="fde-sider fde-print-hide" theme="dark" style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'auto' }}>
        <div className="fde-logo" onClick={() => router.push('/')} style={{ cursor: 'pointer' }}>
          <div className="fde-logo-mark">FDE</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 650, lineHeight: 1.2 }}>AI-FDE Lab</div>
            <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.45)' }}>工程管理实训平台 POC</div>
          </div>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={selected}
          items={items}
          style={{ borderInlineEnd: 'none', paddingBottom: 24, background: 'transparent' }}
          onClick={({ key }) => router.push(key)}
        />
      </Sider>

      <Layout>
        <Header
          className="fde-print-hide"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--fde-border)',
            position: 'sticky',
            top: 0,
            zIndex: 20,
          }}
        >
          <Space size={10}>
            <Dropdown
              menu={{
                items: [
                  { key: 'hd', label: '切换演示项目', disabled: true },
                  ...projects.map((p) => ({
                    key: p.id,
                    icon: <SwapOutlined />,
                    label: `${p.name} · ${p.team}`,
                  })),
                ],
                selectedKeys: [projectId],
                onClick: ({ key }) => {
                  if (key === 'hd') return;
                  setProject(key);
                  router.push(`/project/${key}`);
                },
              }}
            >
              <Tag
                color={project.accent}
                style={{ margin: 0, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                {project.name}
                <SwapOutlined style={{ fontSize: 10 }} />
              </Tag>
            </Dropdown>
            <span style={{ fontSize: 12, color: 'var(--fde-text-dim)' }}>
              案例 {project.caseName} · 当前阶段{' '}
              <b style={{ color: project.accent }}>{project.currentStage}</b> · 截止 {project.deadline}
            </span>
          </Space>

          <Space size={14}>
            <Button
              type="primary"
              ghost
              size="small"
              icon={<BulbOutlined />}
              onClick={() => setCopilotOpen(true)}
            >
              FDE Copilot
            </Button>
            <Tooltip title={pendingApprovalCount ? '有待审批的高风险动作' : '暂无新通知'}>
              <Badge count={pendingApprovalCount} size="small">
                <BellOutlined
                  style={{ fontSize: 16, color: '#5a6a83', cursor: 'pointer' }}
                  onClick={() => router.push(`${P}/trace`)}
                />
              </Badge>
            </Tooltip>
            <Dropdown
              menu={{
                items: [
                  { key: 'role', label: '切换演示角色', disabled: true },
                  ...(Object.keys(users) as RoleKey[]).map((r) => ({
                    key: r,
                    icon: <SwapOutlined />,
                    label: `${users[r].roleName} · ${users[r].name}`,
                  })),
                  { type: 'divider' as const },
                  { key: 'logout', icon: <LogoutOutlined />, label: '退出登录' },
                ],
                onClick: ({ key }) => {
                  if (key === 'logout') router.push('/login');
                  else if (key !== 'role') setRole(key as RoleKey);
                },
              }}
            >
              <Space style={{ cursor: 'pointer' }} size={8}>
                <Avatar size={28} style={{ background: user.avatarColor, fontSize: 12 }}>
                  {user.name.slice(0, 1)}
                </Avatar>
                <div style={{ lineHeight: 1.25 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600 }}>{user.name}</div>
                  <div style={{ fontSize: 10.5, color: 'var(--fde-text-dim)' }}>{user.roleName}</div>
                </div>
              </Space>
            </Dropdown>
          </Space>
        </Header>

        <Content>{children}</Content>
      </Layout>

      <CopilotDrawer />
    </Layout>
  );
}
