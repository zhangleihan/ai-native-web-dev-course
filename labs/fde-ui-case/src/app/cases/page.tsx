'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, Col, Input, Rate, Row, Segmented, Space, Tag } from 'antd';
import {
  ClockCircleOutlined,
  DatabaseOutlined,
  SearchOutlined,
  TeamOutlined,
  ThunderboltFilled,
} from '@ant-design/icons';
import { PageHead } from '@/components/ui';
import { cases } from '@/mock';

const industries = ['全部', '通信运营', '智能制造', '物流供应链', '金融', '医疗健康', '能源电力', '数字服务'];
const difficulties = ['全部', '入门', '进阶', '挑战'];

export default function CaseLibraryPage() {
  const router = useRouter();
  const [industry, setIndustry] = useState('全部');
  const [difficulty, setDifficulty] = useState('全部');
  const [kw, setKw] = useState('');

  const list = cases.filter(
    (c) =>
      (industry === '全部' || c.industry === industry) &&
      (difficulty === '全部' || c.difficulty === difficulty) &&
      (kw === '' || c.title.includes(kw) || c.summary.includes(kw) || c.tags.some((t) => t.includes(kw))),
  );

  const statusColor: Record<string, string> = { 可领取: 'blue', 进行中: 'orange', 已完成: 'green' };

  return (
    <div className="fde-page">
      <PageHead
        title="行业案例库 Case Lab"
        desc="每个案例都是一个带隐藏信息、真实约束与数据沙盒的业务现场，团队在此领取任务并启动 FDE 项目"
        extra={
          <Input
            prefix={<SearchOutlined style={{ color: '#b9c2d0' }} />}
            placeholder="搜索案例名称、标签"
            style={{ width: 240 }}
            value={kw}
            onChange={(e) => setKw(e.target.value)}
            allowClear
          />
        }
      />

      <Space size={20} style={{ marginBottom: 18 }} wrap>
        <Space size={8}>
          <span style={{ fontSize: 12, color: 'var(--fde-text-dim)' }}>行业</span>
          <Segmented size="small" options={industries} value={industry} onChange={(v) => setIndustry(v as string)} />
        </Space>
        <Space size={8}>
          <span style={{ fontSize: 12, color: 'var(--fde-text-dim)' }}>难度</span>
          <Segmented
            size="small"
            options={difficulties}
            value={difficulty}
            onChange={(v) => setDifficulty(v as string)}
          />
        </Space>
      </Space>

      <Row gutter={[14, 14]}>
        {list.map((c) => (
          <Col span={8} key={c.id}>
            <Card
              size="small"
              bordered={false}
              className="fde-card-hover"
              onClick={() => router.push(`/cases/${c.id}`)}
              styles={{ body: { padding: 0 } }}
            >
              <div
                style={{
                  height: 78,
                  background: `linear-gradient(120deg, ${c.cover} 0%, ${c.cover}b0 100%)`,
                  borderRadius: '8px 8px 0 0',
                  padding: '14px 18px',
                  color: '#fff',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    right: -30,
                    top: -40,
                    width: 140,
                    height: 140,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.12)',
                  }}
                />
                <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                  <span style={{ fontSize: 11, opacity: 0.85 }}>{c.industry}</span>
                  {c.goldenCase && (
                    <Tag color="gold" style={{ margin: 0, fontSize: 10 }} icon={<ThunderboltFilled />}>
                      Golden Case
                    </Tag>
                  )}
                </Space>
                <div style={{ fontSize: 17, fontWeight: 660, marginTop: 6 }}>{c.title}</div>
              </div>

              <div style={{ padding: 16 }}>
                <Space style={{ justifyContent: 'space-between', width: '100%', marginBottom: 8 }}>
                  <span style={{ fontSize: 12, color: 'var(--fde-text-dim)' }}>{c.company}</span>
                  <Tag color={statusColor[c.status]} style={{ margin: 0 }}>
                    {c.status}
                  </Tag>
                </Space>

                <div
                  style={{
                    fontSize: 12,
                    color: 'var(--fde-text-dim)',
                    lineHeight: 1.85,
                    height: 66,
                    overflow: 'hidden',
                    marginBottom: 10,
                  }}
                >
                  {c.summary}
                </div>

                <Space size={[6, 6]} wrap style={{ marginBottom: 12 }}>
                  {c.tags.map((t) => (
                    <Tag key={t} style={{ margin: 0, fontSize: 10 }}>
                      {t}
                    </Tag>
                  ))}
                </Space>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderTop: '1px dashed #eef1f6',
                    paddingTop: 10,
                  }}
                >
                  <Space size={12} style={{ fontSize: 11.5, color: 'var(--fde-text-dim)' }}>
                    <span>
                      <ClockCircleOutlined /> {c.duration}
                    </span>
                    <span>
                      <TeamOutlined /> {c.teams} 组
                    </span>
                    <span>
                      <DatabaseOutlined /> {c.difficulty}
                    </span>
                  </Space>
                  <Rate disabled defaultValue={c.rating} allowHalf style={{ fontSize: 10 }} />
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {list.length === 0 && (
        <Card bordered={false} style={{ textAlign: 'center', padding: 40, color: 'var(--fde-text-dim)' }}>
          没有匹配的案例，试试调整筛选条件
          <div style={{ marginTop: 12 }}>
            <Button
              onClick={() => {
                setIndustry('全部');
                setDifficulty('全部');
                setKw('');
              }}
            >
              重置筛选
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
