'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, Checkbox, Divider, Input, Segmented, Space, Tag, Typography } from 'antd';
import { LockOutlined, SafetyCertificateOutlined, UserOutlined } from '@ant-design/icons';
import { useStore } from '@/lib/store';
import { users } from '@/mock';
import type { RoleKey } from '@/mock';

const roleOptions: { label: string; value: RoleKey }[] = [
  { label: '学生', value: 'student' },
  { label: '教师', value: 'teacher' },
  { label: '企业导师', value: 'mentor' },
  { label: '管理员', value: 'admin' },
];

export default function LoginPage() {
  const router = useRouter();
  const { setRole } = useStore();
  const [role, setLocalRole] = useState<RoleKey>('student');
  const [loading, setLoading] = useState(false);

  const login = () => {
    setLoading(true);
    setRole(role);
    setTimeout(() => router.push('/'), 500);
  };

  const u = users[role];

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: '1.15fr 1fr',
        background: '#f4f6fb',
      }}
    >
      <div
        style={{
          background: 'linear-gradient(135deg, #0d1526 0%, #16294d 45%, #1252a8 100%)',
          padding: '64px 72px',
          color: '#fff',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            position: 'absolute',
            right: -140,
            top: -120,
            width: 460,
            height: 460,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: -100,
            bottom: -140,
            width: 380,
            height: 380,
            borderRadius: '50%',
            background: 'rgba(22,119,255,0.18)',
          }}
        />
        <Space size={12} style={{ marginBottom: 28 }}>
          <div className="fde-logo-mark" style={{ width: 40, height: 40, fontSize: 15 }}>
            FDE
          </div>
          <div>
            <div style={{ fontSize: 19, fontWeight: 680 }}>AI-FDE 工程管理实训平台</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
              Forward Deployed Engineering Lab · POC
            </div>
          </div>
        </Space>

        <Typography.Title level={2} style={{ color: '#fff', marginTop: 0, marginBottom: 14, fontWeight: 650 }}>
          把业务问题，一路做成
          <br />
          可运行、可审计、可评测的 AI 系统
        </Typography.Title>
        <div style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.68)', lineHeight: 2, maxWidth: 520 }}>
          这不是传统 LMS，也不是单纯的 Agent 开发平台。一个 4~6 人的 MEM 团队在这里领取真实行业案例，
          在 2~8 小时内走完需求分析、Ontology 建模、Agent 方案、可运行原型、受控执行与效果评测，
          最终交付一个可演示的部署 URL。
        </div>

        <div style={{ marginTop: 34, display: 'flex', gap: 8, flexWrap: 'wrap', maxWidth: 560 }}>
          {['Discover', 'Define', 'Model', 'Design', 'Build', 'Deploy', 'Evaluate', 'Evolve'].map((s, i) => (
            <Tag
              key={s}
              style={{
                margin: 0,
                background: 'rgba(255,255,255,0.09)',
                border: '1px solid rgba(255,255,255,0.16)',
                color: 'rgba(255,255,255,0.86)',
                padding: '3px 10px',
                borderRadius: 20,
              }}
            >
              {`${i + 1}. ${s}`}
            </Tag>
          ))}
        </div>

        <Divider style={{ borderColor: 'rgba(255,255,255,0.12)', margin: '32px 0 20px' }} />
        <Space size={30} style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>
          <span>
            <b style={{ color: '#fff', fontSize: 17 }}>186</b> 名学员
          </span>
          <span>
            <b style={{ color: '#fff', fontSize: 17 }}>6</b> 个行业案例
          </span>
          <span>
            <b style={{ color: '#fff', fontSize: 17 }}>34</b> 个在建项目
          </span>
          <span>
            <b style={{ color: '#fff', fontSize: 17 }}>1,284</b> 次 Agent 运行
          </span>
        </Space>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <Card style={{ width: 380, boxShadow: '0 12px 40px rgba(22,34,58,0.08)' }} bordered={false}>
          <div style={{ marginBottom: 22 }}>
            <div style={{ fontSize: 18, fontWeight: 650, color: '#16223a' }}>登录</div>
            <div style={{ fontSize: 12, color: 'var(--fde-text-dim)', marginTop: 4 }}>
              选择演示角色即可进入，原型环境无需真实密码
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, color: 'var(--fde-text-dim)', marginBottom: 6 }}>演示角色</div>
            <Segmented
              block
              options={roleOptions}
              value={role}
              onChange={(v) => setLocalRole(v as RoleKey)}
            />
          </div>

          <Space direction="vertical" size={12} style={{ width: '100%' }}>
            <Input size="large" prefix={<UserOutlined style={{ color: '#b9c2d0' }} />} value={u.name} readOnly />
            <Input.Password
              size="large"
              prefix={<LockOutlined style={{ color: '#b9c2d0' }} />}
              defaultValue="demo-password"
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Checkbox defaultChecked style={{ fontSize: 12 }}>
                记住登录状态
              </Checkbox>
              <a style={{ fontSize: 12 }}>忘记密码</a>
            </div>
            <Button type="primary" size="large" block loading={loading} onClick={login}>
              进入平台
            </Button>
          </Space>

          <div
            style={{
              marginTop: 18,
              padding: '10px 12px',
              background: '#f6f9ff',
              borderRadius: 8,
              border: '1px solid #e3edff',
              fontSize: 11.5,
              color: '#4a5b76',
              lineHeight: 1.7,
            }}
          >
            <Space size={6}>
              <SafetyCertificateOutlined style={{ color: '#1677ff' }} />
              <b>{u.roleName}</b>
            </Space>
            <div>
              {u.org} · {u.title}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
